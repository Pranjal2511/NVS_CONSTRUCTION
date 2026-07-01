import { verifyAccessToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

export const authenticate = (req, _res, next) => {
  try {
    let token = req.cookies?.accessToken;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const optionalAuth = (req, _res, next) => {
  try {
    let token = req.cookies?.accessToken;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (token) {
      req.user = verifyAccessToken(token);
    }
  } catch {
    // ignore invalid optional token
  }
  next();
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Access denied'));
  }
  next();
};

export const adminOnly = [authenticate, authorize('admin')];
export const userOnly = [authenticate, authorize('user')];
