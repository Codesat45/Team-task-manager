const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies JWT token and attaches user to request.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Token is invalid or user no longer exists.');
  }

  req.user = user;
  next();
});

/**
 * Restricts access to specific roles.
 * Usage: authorize('admin') or authorize('admin', 'member')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
