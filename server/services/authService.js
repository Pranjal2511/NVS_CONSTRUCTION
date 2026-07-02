import crypto from 'crypto';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenPayload,
} from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { isEmailTransportConfigured, sendLoginOtpEmail, sendPasswordResetEmail } from './emailService.js';
import logger from '../utils/logger.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  sameSite: env.IS_PRODUCTION ? 'strict' : 'lax',
  path: '/',
};

// Warn on startup if cookie security flags are reduced
if (!env.IS_PRODUCTION) {
  logger.warn(
    'Auth cookies are set with secure=false and sameSite=lax (IS_PRODUCTION=false). ' +
      'Enable IS_PRODUCTION=true for any publicly accessible deployment.',
    { cookieSecure: false }
  );
}

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
};

const handleFailedLogin = async (user) => {
  user.loginAttempts = (user.loginAttempts || 0) + 1;

  if (user.loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
    user.lockUntil = new Date(Date.now() + env.LOCKOUT_DURATION_MS);
    logger.warn('Account locked due to failed login attempts', { email: user.email });
  }

  await user.save();
};

const resetLoginAttempts = async (user) => {
  if (user.loginAttempts || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }
};

const issueTokens = async (user) => {
  const payload = getTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  user.isVerified = true;
  await user.save();

  return { accessToken, refreshToken, user };
};

const normalizeIdentifier = (identifier = '') => identifier.trim().toLowerCase();
const getOtpChannel = (identifier) => (identifier.includes('@') ? 'email' : 'phone');
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');
const createOtp = () => String(crypto.randomInt(100000, 1000000));

const findUserByIdentifier = (identifier) => {
  const normalized = normalizeIdentifier(identifier);
  return User.findOne({
    $or: [{ email: normalized }, { phone: normalized }],
  }).select('+loginAttempts +lockUntil');
};

export const registerUser = async ({ name, firstName, lastName, email, phone, password, profileImage }) => {
  const normalizedEmail = normalizeIdentifier(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(400, 'User with this email already exists');

  const resolvedName = name || `${firstName || ''} ${lastName || ''}`.trim();
  const hashed = password ? await hashPassword(password) : undefined;
  const user = await User.create({
    name: resolvedName,
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    password: hashed,
    profileImage,
    role: 'user',
  });
  await sendLoginOtp(normalizedEmail, 'user');

  logger.info('User registered', { email: user.email });
  return {
    user,
    otpRequired: true,
    identifier: user.email,
    channel: 'email',
  };
};

export const loginUser = async () => {
  throw new ApiError(410, 'Password login has been disabled. Please use OTP login.');
};

export const sendLoginOtp = async (identifier, expectedRole = 'user') => {
  const normalized = normalizeIdentifier(identifier);
  const channel = getOtpChannel(normalized);
  const user = await findUserByIdentifier(normalized);

  if (channel === 'phone' && env.IS_PRODUCTION) {
    throw new ApiError(400, 'Phone OTP delivery is not configured. Please use your email address.');
  }

  if (!user || user.role !== expectedRole) {
    logger.warn('OTP requested for invalid account', { identifier: normalized, role: expectedRole });
    throw new ApiError(401, 'No matching account found for this login type');
  }

  if (user.blocked) throw new ApiError(403, 'Your account has been blocked');
  if (user.isActive === false) throw new ApiError(403, 'Your account is inactive');
  if (user.isLocked()) throw new ApiError(423, 'Account temporarily locked. Try again later.');

  const existingOtp = await Otp.findOne({ identifier: normalized, role: expectedRole }).select('+otpHash');
  if (existingOtp) {
    const secondsSinceLastSend = (Date.now() - existingOtp.lastSentAt.getTime()) / 1000;
    if (secondsSinceLastSend < 30) {
      throw new ApiError(429, `Please wait ${Math.ceil(30 - secondsSinceLastSend)} seconds before requesting another OTP`);
    }
    if (existingOtp.resendCount >= 3) {
      throw new ApiError(429, 'Maximum OTP resend limit reached. Try again after a few minutes.');
    }
  }

  const otp = createOtp();
  await Otp.findOneAndUpdate(
    { identifier: normalized, role: expectedRole },
    {
      identifier: normalized,
      channel,
      role: expectedRole,
      otpHash: hashOtp(otp),
      attempts: 0,
      resendCount: existingOtp ? existingOtp.resendCount + 1 : 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (channel === 'email') {
    await sendLoginOtpEmail(user, otp);
  }

  const includeDevOtp = !env.IS_PRODUCTION && !isEmailTransportConfigured();

  if (!env.IS_PRODUCTION) {
    logger.info('Development OTP generated', { identifier: normalized, role: expectedRole, otp });
  }

  return {
    otpRequired: true,
    identifier: normalized,
    channel,
    expiresInSeconds: 300,
    ...(includeDevOtp ? { devOtp: otp } : {}),
  };
};

export const verifyLoginOtp = async (identifier, otp, expectedRole = 'user') => {
  const normalized = normalizeIdentifier(identifier);
  const user = await findUserByIdentifier(normalized);

  if (!user || user.role !== expectedRole) {
    throw new ApiError(401, 'Invalid or expired OTP');
  }
  if (user.blocked) throw new ApiError(403, 'Your account has been blocked');
  if (user.isActive === false) throw new ApiError(403, 'Your account is inactive');

  const otpRecord = await Otp.findOne({ identifier: normalized, role: expectedRole }).select('+otpHash');
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    await Otp.deleteMany({ identifier: normalized, role: expectedRole });
    throw new ApiError(401, 'Invalid or expired OTP');
  }

  if (otpRecord.attempts >= 5) {
    await handleFailedLogin(user);
    await Otp.deleteMany({ identifier: normalized, role: expectedRole });
    throw new ApiError(429, 'Maximum OTP attempts reached. Please request a new OTP.');
  }

  if (otpRecord.otpHash !== hashOtp(String(otp))) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    await handleFailedLogin(user);
    throw new ApiError(401, 'Invalid OTP');
  }

  await resetLoginAttempts(user);
  await Otp.deleteMany({ identifier: normalized, role: expectedRole });
  const tokens = await issueTokens(user);
  logger.info('User logged in with OTP', { email: user.email, role: user.role });
  return tokens;
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(403, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(403, 'Invalid refresh token');
  }

  const payload = getTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);
  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken, user };
};

export const logoutUser = async (userId, res) => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
  clearAuthCookies(res);
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user, resetLink);

  logger.info('Password reset requested', { email });
  return { message: 'If an account exists, a reset link has been sent.' };
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: new Date() },
  }).select('+password +resetToken +resetTokenExpiry');

  if (!user) throw new ApiError(400, 'Invalid or expired password reset token');

  user.password = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  user.refreshToken = undefined;
  await user.save();

  logger.info('Password reset completed', { email: user.email });
  return { message: 'Password reset successfully' };
};

export const formatAuthResponse = (tokens) => ({
  token: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  user: {
    id: tokens.user.id || tokens.user._id?.toString(),
    name: tokens.user.name,
    email: tokens.user.email,
    phone: tokens.user.phone,
    role: tokens.user.role,
  },
});
