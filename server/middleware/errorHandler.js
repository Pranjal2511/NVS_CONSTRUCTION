import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
    const field = Object.keys(err.keyPattern || {})[0];
    errors = [{ field, message: `${field} already exists` }];
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (statusCode >= 500) {
    logger.error(message, {
      path: req.originalUrl,
      method: req.method,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
