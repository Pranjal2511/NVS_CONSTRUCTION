import crypto from 'crypto';
import User from '../models/User.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenPayload,
} from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { sendPasswordResetEmail } from './emailService.js';
import logger from '../utils/logger.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
};

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
  await user.save();

  return { accessToken, refreshToken, user };
};

export const registerUser = async ({ name, email, phone, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'User with this email already exists');

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, phone, password: hashed, role: 'user' });
  const tokens = await issueTokens(user);

  logger.info('User registered', { email: user.email });
  return tokens;
};

export const loginUser = async (email, password, expectedRole = 'user') => {
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +refreshToken');

  if (!user || user.role !== expectedRole) {
    logger.warn('Failed login attempt', { email, reason: 'invalid_credentials' });
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.blocked) throw new ApiError(403, 'Your account has been blocked');

  if (user.isLocked()) {
    throw new ApiError(423, 'Account temporarily locked. Try again later.');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    await handleFailedLogin(user);
    logger.warn('Failed login attempt', { email, reason: 'wrong_password' });
    throw new ApiError(401, 'Invalid credentials');
  }

  await resetLoginAttempts(user);
  const tokens = await issueTokens(user);
  logger.info('User logged in', { email: user.email, role: user.role });
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
