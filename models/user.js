const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: isEmail,
      message: 'Email is invalid.',
    },
  },
  password: {
    type: String,
    minLength: 6,
    select: false,
    required: true,
  },
  name: {
    type: String,
    require: true,
    minLength: 2,
    maxLength: 30,
  },
});

module.exports = mongoose.model('user', userSchema);