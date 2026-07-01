import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { hashPassword } from '../utils/password.js';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  setAuthCookies,
  formatAuthResponse,
} from '../services/authService.js';
import { logAudit } from '../services/auditService.js';

export const register = asyncHandler(async (req, res) => {
  const tokens = await registerUser(req.body);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.status(201).json(formatAuthResponse(tokens));
});

export const login = asyncHandler(async (req, res) => {
  const tokens = await loginUser(req.body.email, req.body.password, 'user');
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json(formatAuthResponse(tokens));
});

export const adminLogin = asyncHandler(async (req, res) => {
  const tokens = await loginUser(req.body.email, req.body.password, 'admin');
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  await logAudit({ userId: tokens.user._id, action: 'ADMIN_LOGIN', req });
  res.json(formatAuthResponse(tokens));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const tokens = await refreshAccessToken(refreshToken);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  ApiResponse.success(res, 200, 'Token refreshed', formatAuthResponse(tokens));
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user?.id, res);
  ApiResponse.success(res, 200, 'Logged out successfully');
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  const result = await forgotPassword(req.body.email);
  ApiResponse.success(res, 200, result.message);
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const password = req.body.newPassword || req.body.password;
  const result = await resetPassword(req.body.token, password);
  ApiResponse.success(res, 200, result.message);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  ApiResponse.success(res, 200, 'Profile retrieved', user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.password) user.password = await hashPassword(req.body.password);

  await user.save();
  ApiResponse.success(res, 200, 'Profile updated', user);
});
