const { failure } = require('../utils/apiResponse');

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json(
    failure(message, {
      code: err.code || 'UNEXPECTED_ERROR'
    })
  );
}

module.exports = errorHandler;
