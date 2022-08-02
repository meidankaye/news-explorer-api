const jwt = require('jsonwebtoken');
const AuthorizationError = require('../utils/autherror');
const { FORBIDDEN } = require('../utils/httpstatuscodes');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AuthorizationError('No token provided.', FORBIDDEN));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (error) {
    next(new AuthorizationError('Invalid token provided.', FORBIDDEN));
  }
  req.user = payload;

  next();
};