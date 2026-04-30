const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

/**
 * Creates a new project. Only admins can call this.
 */
const createProject = async ({ name, description, createdBy }) => {
  const project = await Project.create({ name, description, createdBy });
  return project.populate('createdBy', 'name email');
};

/**
 * Returns all projects visible to the requesting user.
 * Admins see all projects; members see only projects they belong to.
 * Includes tasks for each project.
 */
const getProjects = async (user) => {
  let query = {};
  if (user.role === 'member') {
    query = { members: user._id };
  }

  const projects = await Project.find(query)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role')
    .sort({ createdAt: -1 });

  // Fetch tasks for each project
  const projectsWithTasks = await Promise.all(
    projects.map(async (project) => {
      let taskQuery = { projectId: project._id };
      
      // Members only see tasks assigned to them
      if (user.role === 'member') {
        taskQuery.assignedTo = user._id;
      }

      const tasks = await Task.find(taskQuery)
        .populate('assignedTo', 'name email')
        .sort({ dueDate: 1 });

      return {
        ...project.toObject(),
        tasks,
      };
    })
  );

  return projectsWithTasks;
};

/**
 * Returns a single project by id with its tasks.
 * Members can only access projects they belong to.
 */
const getProjectById = async (projectId, user) => {
  const project = await Project.findById(projectId)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');

  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  if (
    user.role === 'member' &&
    !project.members.some((m) => m._id.toString() === user._id.toString())
  ) {
    throw new ApiError(403, 'You do not have access to this project.');
  }

  // Fetch tasks for this project
  let taskQuery = { projectId };
  if (user.role === 'member') {
    taskQuery.assignedTo = user._id;
  }

  const tasks = await Task.find(taskQuery)
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 });

  return {
    ...project.toObject(),
    tasks,
  };
};

/**
 * Updates project name/description. Admin only.
 */
const updateProject = async (projectId, { name, description }) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description },
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');

  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  return project;
};

/**
 * Deletes a project and all its tasks. Admin only.
 */
const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  await Task.deleteMany({ projectId });
  await project.deleteOne();
};

/**
 * Adds a member to a project. Admin only.
 */
const addMember = async (projectId, memberId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  const user = await User.findById(memberId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (project.members.includes(memberId)) {
    throw new ApiError(409, 'User is already a member of this project.');
  }

  project.members.push(memberId);
  await project.save();

  return project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);
};

/**
 * Removes a member from a project. Admin only.
 */
const removeMember = async (projectId, memberId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found.');
  }

  const memberIndex = project.members.findIndex(
    (m) => m.toString() === memberId
  );
  if (memberIndex === -1) {
    throw new ApiError(404, 'User is not a member of this project.');
  }

  project.members.splice(memberIndex, 1);
  await project.save();

  return project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
