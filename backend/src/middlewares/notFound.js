const { failure } = require('../utils/apiResponse');

function notFound(req, res) {
  res.status(404).json(failure(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
