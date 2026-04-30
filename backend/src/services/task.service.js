const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');

const ITEMS_PER_PAGE = 10;

/**
 * Creates a new task. Admin only.
 */
const createTask = async ({ title, description, projectId, assignedTo, dueDate, status }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  // If assignedTo is provided and not already a member, auto-add them to the project
  if (assignedTo) {
    const isMember = project.members.some(
      (m) => m.toString() === assignedTo.toString()
    );
    if (!isMember) {
      project.members.push(assignedTo);
      await project.save();
    }
  }

  const task = await Task.create({
    title,
    description,
    projectId,
    assignedTo: assignedTo || null,
    dueDate: dueDate || null,
    status: status || 'Todo',
  });

  return task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'projectId', select: 'name' },
  ]);
};

/**
 * Returns tasks with filtering, sorting, and pagination.
 * Admins see all tasks; members only see tasks assigned to them or in their projects.
 */
const getTasks = async (user, query) => {
  try {
    const {
      status,
      projectId,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      page = 1,
      limit = ITEMS_PER_PAGE,
    } = query;

    const filter = {};

    // Role-based filtering
    if (user.role === 'member') {
      // Members see tasks in their projects
      const memberProjects = await Project.find({ members: user._id }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);
      filter.projectId = { $in: projectIds };
    }
    // Admins see all tasks (no filter)

    if (status) filter.status = status;
    if (projectId) filter.projectId = projectId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || ITEMS_PER_PAGE));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw new ApiError(400, `Error fetching tasks: ${error.message}`);
  }
};

/**
 * Updates a task.
 * Admins can update everything; members can only update status of their assigned tasks.
 */
const updateTask = async (taskId, updates, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (user.role === 'member') {
    // Members can only update status of tasks assigned to them
    const isAssigned =
      task.assignedTo && task.assignedTo.toString() === user._id.toString();
    if (!isAssigned) {
      throw new ApiError(403, 'You can only update tasks assigned to you.');
    }
    // Members can only change status
    const allowedFields = ['status'];
    Object.keys(updates).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updates[key];
      }
    });
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name');

  return updatedTask;
};

/**
 * Deletes a task. Admin only.
 */
const deleteTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }
  await task.deleteOne();
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
