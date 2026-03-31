const { failure } = require('../utils/apiResponse');

function authorizeRoles(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json(failure('Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(failure('Forbidden: insufficient permission'));
    }

    return next();
  };
}

module.exports = authorizeRoles;
