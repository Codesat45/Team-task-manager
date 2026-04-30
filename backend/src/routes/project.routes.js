const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const projectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
];

const memberValidation = [
  body('userId')
    .notEmpty().withMessage('User ID is required.')
    .isMongoId().withMessage('Invalid user ID.'),
];

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('admin'), projectValidation, validate, createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin'), projectValidation, validate, updateProject)
  .delete(authorize('admin'), deleteProject);

router
  .route('/:id/members')
  .post(authorize('admin'), memberValidation, validate, addMember);

router
  .route('/:id/members/:userId')
  .delete(authorize('admin'), removeMember);

module.exports = router;
