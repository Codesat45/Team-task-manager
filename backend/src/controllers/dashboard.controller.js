const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user);
  sendSuccess(res, 200, 'Dashboard data retrieved successfully.', { stats });
});

module.exports = { getDashboard };
