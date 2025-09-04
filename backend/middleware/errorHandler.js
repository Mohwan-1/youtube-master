const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error
  let error = {
    message: 'Internal Server Error',
    statusCode: 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.statusCode = 400;
    error.details = Object.values(err.errors).map(val => val.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
