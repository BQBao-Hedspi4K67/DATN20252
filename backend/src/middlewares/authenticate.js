const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { failure } = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json(failure('Unauthorized: missing bearer token'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email
    };
    return next();
  } catch (_error) {
    return res.status(401).json(failure('Unauthorized: invalid token'));
  }
}

module.exports = authenticate;
