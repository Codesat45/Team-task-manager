const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password, role });

  sendSuccess(res, 201, 'Account created successfully.', { user, token });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  sendSuccess(res, 200, 'Login successful.', { user, token });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'User profile retrieved.', { user: req.user });
});

module.exports = { register, login, getMe };
