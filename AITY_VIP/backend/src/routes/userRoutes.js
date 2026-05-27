// 用户路由
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateUser, validateUpdateUser, validateIdParam, validateQueryParams, validatePasswordReset } = require('../middleware/validation');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

router.get('/',
  authenticateToken,
  checkAdmin,
  ...validateQueryParams(),
  cacheMiddleware('users:list', 300),
  userController.getAllUsers
);

router.get('/:id',
  authenticateToken,
  ...validateIdParam(),
  cacheMiddleware('users:detail', 600),
  userController.getUserById
);

router.post('/',
  authenticateToken,
  checkAdmin,
  ...validateCreateUser(),
  clearCache('users:*'),
  userController.createUser
);

router.put('/:id',
  authenticateToken,
  checkAdmin,
  ...validateUpdateUser(),
  clearCache('users:*'),
  userController.updateUser
);

router.delete('/:id',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  clearCache('users:*'),
  userController.deleteUser
);

// 停用用户（逻辑删除）
router.put('/:id/deactivate',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  clearCache('users:*'),
  userController.deactivateUser
);

// 启用用户
router.put('/:id/activate',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  clearCache('users:*'),
  userController.activateUser
);

router.put('/:id/password',
  authenticateToken,
  checkAdmin,
  ...validatePasswordReset(),
  clearCache('users:*'),
  userController.resetUserPassword
);

module.exports = router;