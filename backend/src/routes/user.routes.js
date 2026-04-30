const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/users
 * Returns all users (admin only) — used for member assignment dropdowns.
 */
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.find().select('name email role').sort({ name: 1 });
    sendSuccess(res, 200, 'Users retrieved successfully.', { users });
  })
);

/**
 * DELETE /api/users/:id
 * Deletes a user (admin only). Also removes user from all projects and reassigns their tasks.
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    // Prevent deleting the admin themselves
    if (user._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot delete your own account.');
    }

    // Delete all tasks assigned to this user
    await Task.deleteMany({ assignedTo: user._id });

    // Delete the user
    await user.deleteOne();

    sendSuccess(res, 200, 'User deleted successfully.', {});
  })
);

module.exports = router;
