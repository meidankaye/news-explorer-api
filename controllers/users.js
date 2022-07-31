const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../utils/conflicterror');
const AuthorizationError = require('../utils/autherror');

const { JWT_SECRET, NODE_ENV } = process.env;

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send({ email: user.email, name: user.name });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { email, name, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({ email, name, password: hash })
        .then((user) => {
          res.send({ name, email, _id: user._id });
        })
        .catch((error) => {
          if (error.code === 11000) {
            next(new ConflictError('User already exists.'));
          } else next(error);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('password')
    .select('name')
    .then((user) => {
      if (!user) {
        throw new AuthorizationError('User not found.');
      }
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) {
          throw new AuthorizationError('Incorrect email or password.');
        }
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token, name: user.name });
      }).catch(next);
    })
    .catch(next);
};

module.exports = { getCurrentUser, createUser, login };
