const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required.')
    .isLength({ min: 2, max: 150 }).withMessage('Title must be 2–150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('projectId')
    .notEmpty().withMessage('Project ID is required.')
    .isMongoId().withMessage('Invalid project ID.'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid user ID for assignedTo.'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date.'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed']).withMessage('Invalid status value.'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Title must be 2–150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid user ID for assignedTo.'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date.'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed']).withMessage('Invalid status value.'),
];

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('admin'), createTaskValidation, validate, createTask);

router
  .route('/:id')
  .put(updateTaskValidation, validate, updateTask)
  .delete(authorize('admin'), deleteTask);

module.exports = router;
