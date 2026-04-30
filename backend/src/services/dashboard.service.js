const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Aggregates dashboard statistics for the requesting user.
 * Admins see global stats; members see stats for their assigned tasks.
 */
const getDashboardStats = async (user) => {
  const now = new Date();

  let taskFilter = {};
  let projectFilter = {};

  if (user.role === 'member') {
    // Members see only their assigned tasks and their projects
    taskFilter.assignedTo = user._id;
    projectFilter.members = user._id;
  }

  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    totalProjects,
    recentTasks,
  ] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: 'Completed' }),
    Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
    Task.countDocuments({ ...taskFilter, status: 'Todo' }),
    Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: 'Completed' },
    }),
    Project.countDocuments(projectFilter),
    Task.find(taskFilter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const stats = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    pendingTasks: totalTasks - completedTasks,
    totalProjects,
    completionRate:
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    recentTasks,
  };

  // Admin-only: total users count
  if (user.role === 'admin') {
    stats.totalUsers = await User.countDocuments();
  }

  return stats;
};

module.exports = { getDashboardStats };
