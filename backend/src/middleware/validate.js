const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check express-validator results.
 * Must be placed after validation chains in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(400, messages[0], errors.array());
  }
  next();
};

module.exports = validate;
