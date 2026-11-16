import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
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

  if (['MongoNetworkError', 'MongoServerSelectionError', 'MongooseServerSelectionError', 'MongoNotConnectedError'].includes(err.name) || /bufferCommands = false/.test(message)) {
    statusCode = 503;
    message = 'Database temporarily unavailable. Please retry shortly.';
  }
  if (err.name === 'MulterError') { statusCode = 400; message = 'Upload exceeds file size or count limits'; }
  if (statusCode >= 500) {
    logger.error('Request failed', {
      path: req.path,
      method: req.method,
      errorType: err.name,
    });
  }

  if (statusCode === 500) { message = 'Internal server error'; errors = []; }
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  });
};
