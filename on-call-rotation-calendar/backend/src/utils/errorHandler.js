/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware for Express
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || [];
  
  res.status(statusCode).json({
    code: err.name || 'INTERNAL_SERVER_ERROR',
    message,
    details,
    timestamp: new Date().toISOString(),
    path: req.path,
    correlationId: req.headers['x-correlation-id'] || 'unknown'
  });
};

/**
 * Async handler to avoid try/catch blocks in route handlers
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  ApiError,
  errorMiddleware,
  asyncHandler
};