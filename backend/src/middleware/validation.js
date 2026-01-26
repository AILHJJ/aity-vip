const { body, param, query, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

function validateLogin() {
  return [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ];
}

function validateCreateUser() {
  return [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial']).withMessage('Invalid role'),
    body('groupId').optional().isLength({ max: 50 }).withMessage('Group ID must be at most 50 characters'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    handleValidationErrors
  ];
}

function validateUpdateUser() {
  return [
    param('id').isInt().withMessage('Invalid user ID'),
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('role').optional().isIn(['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial']).withMessage('Invalid role'),
    body('groupId').optional().isLength({ max: 50 }).withMessage('Group ID must be at most 50 characters'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    handleValidationErrors
  ];
}

function validateCreateMessage() {
  return [
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').notEmpty().withMessage('Type is required').isIn(['system', 'important', 'daily']).withMessage('Invalid type'),
    body('groupId').notEmpty().withMessage('Group ID is required').isIn(['all']).withMessage('Invalid group ID'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    handleValidationErrors
  ];
}

function validateUpdateMessage() {
  return [
    param('id').isInt().withMessage('Invalid message ID'),
    body('title').optional().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').optional(),
    body('type').optional().isIn(['system', 'important', 'daily']).withMessage('Invalid type'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    handleValidationErrors
  ];
}

function validateCreateGroup() {
  return [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
    handleValidationErrors
  ];
}

function validateUpdateGroup() {
  return [
    param('id').isInt().withMessage('Invalid group ID'),
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
    handleValidationErrors
  ];
}

function validateCreateDiscussion() {
  return [
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').notEmpty().withMessage('Content is required'),
    body('groupId').optional().isLength({ max: 50 }).withMessage('Group ID must be at most 50 characters'),
    handleValidationErrors
  ];
}

function validateAddReply() {
  return [
    param('id').isInt().withMessage('Invalid discussion ID'),
    body('content').notEmpty().withMessage('Content is required'),
    handleValidationErrors
  ];
}

function validateIdParam() {
  return [
    param('id').isInt().withMessage('Invalid ID'),
    handleValidationErrors
  ];
}

function validateQueryParams() {
  return [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['system', 'important', 'daily']).withMessage('Invalid type'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    handleValidationErrors
  ];
}

module.exports = {
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateCreateMessage,
  validateUpdateMessage,
  validateCreateGroup,
  validateUpdateGroup,
  validateCreateDiscussion,
  validateAddReply,
  validateIdParam,
  validateQueryParams
};
