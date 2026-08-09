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
    body('email').optional({ nullable: true }).isEmail().withMessage('邮箱格式不正确'),
    body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ];
}

function validateCreateUser() {
  return [
    body('name').notEmpty().withMessage('姓名不能为空').isLength({ min: 1, max: 100 }).withMessage('姓名长度须在1-100个字符之间'),
    body('email').optional({ nullable: true }).isEmail().withMessage('邮箱格式不正确'),
    body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('role').optional().isIn(['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial']).withMessage('角色值不合法'),
    body('groupId').optional().isLength({ max: 50 }).withMessage('分组ID过长'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('状态值不合法'),
    handleValidationErrors
  ];
}

function validateUpdateUser() {
  return [
    param('id').isInt().withMessage('无效的用户ID'),
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('姓名长度须在1-100个字符之间'),
    body('email').optional({ nullable: true }).isEmail().withMessage('邮箱格式不正确'),
    body('role').optional().isIn(['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial']).withMessage('角色值不合法'),
    body('groupId').optional().isLength({ max: 50 }).withMessage('分组ID过长'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('状态值不合法'),
    handleValidationErrors
  ];
}

function validateCreateMessage() {
  return [
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('groupId').optional().isLength({ max: 50 }).withMessage('Group ID must be at most 50 characters'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('publishTime').optional().isISO8601().withMessage('Publish time must be a valid date'),
    body('emailNotify').optional().isBoolean().withMessage('Email notify must be a boolean'),
    body('emailNotifyForce').optional().isBoolean().withMessage('Email notify force must be a boolean'),
    handleValidationErrors
  ];
}

function validateUpdateMessage() {
  return [
    param('id').isInt().withMessage('Invalid message ID'),
    body('title').optional().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').optional(),
    body('type').optional(),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('publishTime').optional().isISO8601().withMessage('Publish time must be a valid date'),
    handleValidationErrors
  ];
}

function validateCreateGroup() {
  return [
    body('name').notEmpty().withMessage('分组名不能为空').isLength({ min: 1, max: 100 }).withMessage('分组名长度须在1-100个字符之间'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    handleValidationErrors
  ];
}

function validateUpdateGroup() {
  return [
    param('id').isInt().withMessage('无效的分组ID'),
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('分组名长度须在1-100个字符之间'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    handleValidationErrors
  ];
}

function validateCreateDiscussion() {
  return [
    body('title').optional().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').notEmpty().withMessage('Content is required'),
    body('messageId').optional({ values: 'null' }).isInt({ min: 1 }).withMessage('Message ID must be a positive integer'),
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
  const validTypes = [
    'position_handle', 'pre_market_comment', 'morning_comment', 'morning_focus',
    'afternoon_comment', 'afternoon_focus', 'close_comment',
    'risk_warning', 'system', 'important', 'daily'
  ];

  return [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(validTypes).withMessage('Invalid type'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    handleValidationErrors
  ];
}

function validatePasswordReset() {
  return [
    param('id').isInt().withMessage('Invalid user ID'),
    body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('adminPassword').optional().isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
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
  validateQueryParams,
  validatePasswordReset
};
