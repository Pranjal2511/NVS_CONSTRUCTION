import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export const authenticate = async (req, _res, next) => {
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
    const user = await User.findById(decoded.id);
    if (!user || user.blocked || user.isActive === false || !user.isVerified || (user.sessionVersion || 0) !== (decoded.sessionVersion || 0)) throw new ApiError(401, 'Session expired or revoked');
    req.user = { ...decoded, role: user.role, email: user.email };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    let token = req.cookies?.accessToken;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isVerified && !user.blocked && user.isActive !== false && (user.sessionVersion || 0) === (decoded.sessionVersion || 0)) req.user = { ...decoded, role: user.role, email: user.email };
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
