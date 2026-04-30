const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const projectService = require('../services/project.service');

/**
 * POST /api/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await projectService.createProject({
    name,
    description,
    createdBy: req.user._id,
  });
  sendSuccess(res, 201, 'Project created successfully.', { project });
});

/**
 * GET /api/projects
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(req.user);
  sendSuccess(res, 200, 'Projects retrieved successfully.', { projects });
});

/**
 * GET /api/projects/:id
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user);
  sendSuccess(res, 200, 'Project retrieved successfully.', { project });
});

/**
 * PUT /api/projects/:id
 */
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await projectService.updateProject(req.params.id, { name, description });
  sendSuccess(res, 200, 'Project updated successfully.', { project });
});

/**
 * DELETE /api/projects/:id
 */
const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  sendSuccess(res, 200, 'Project deleted successfully.', {});
});

/**
 * POST /api/projects/:id/members
 */
const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await projectService.addMember(req.params.id, userId);
  sendSuccess(res, 200, 'Member added successfully.', { project });
});

/**
 * DELETE /api/projects/:id/members/:userId
 */
const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(req.params.id, req.params.userId);
  sendSuccess(res, 200, 'Member removed successfully.', { project });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
