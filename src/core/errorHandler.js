const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const config = require('../config');

const notFound = (req, _res, next) => next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(err.stack || err.message, { path: req.path, method: req.method });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.app.env !== 'production' && err.details ? { details: err.details } : {}),
    ...(config.app.env !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
