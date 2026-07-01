import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

export const getTokenPayload = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
});
