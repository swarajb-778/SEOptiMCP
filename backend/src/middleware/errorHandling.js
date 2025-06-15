import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'error',
  format: format.json(),
  transports: [
    new transports.File({ filename: 'logs/error.log' }),
    new transports.Console()
  ]
});

// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

// Async error handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new APIError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new APIError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new APIError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new APIError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new APIError(message, 401, 'TOKEN_EXPIRED');
  }

  // API rate limit errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new APIError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  // External API errors
  if (err.response && err.response.status) {
    const message = `External API error: ${err.response.statusText}`;
    error = new APIError(message, err.response.status, 'EXTERNAL_API_ERROR');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new APIError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}; 