// 用户路由
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateUser, validateUpdateUser, validateIdParam, validateQueryParams } = require('../middleware/validation');
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

module.exports = router;