const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Generates a signed JWT for a given user id.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Registers a new user.
 * @param {Object} data - { name, email, password, role }
 */
const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, email, password, role: role || 'member' });
  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Authenticates a user with email and password.
 * @param {Object} data - { email, password }
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user._id);

  // Remove password from returned user object
  user.password = undefined;

  return { user, token };
};

module.exports = { registerUser, loginUser };
