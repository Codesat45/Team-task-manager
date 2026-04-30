const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const taskService = require('../services/task.service');

/**
 * POST /api/tasks
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, projectId, assignedTo, dueDate, status } = req.body;
  const task = await taskService.createTask({
    title,
    description,
    projectId,
    assignedTo,
    dueDate,
    status,
  });
  sendSuccess(res, 201, 'Task created successfully.', { task });
});

/**
 * GET /api/tasks
 */
const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.user, req.query);
  sendSuccess(res, 200, 'Tasks retrieved successfully.', result);
});

/**
 * PUT /api/tasks/:id
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);
  sendSuccess(res, 200, 'Task updated successfully.', { task });
});

/**
 * DELETE /api/tasks/:id
 */
const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  sendSuccess(res, 200, 'Task deleted successfully.', {});
});

module.exports = { createTask, getTasks, updateTask, deleteTask };
