// 用户路由
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateUser, validateUpdateUser, validateIdParam, validateQueryParams } = require('../middleware/validation');

router.get('/', 
  authenticateToken, 
  checkAdmin, 
  validateQueryParams, 
  userController.getAllUsers
);

router.get('/:id', 
  authenticateToken, 
  validateIdParam, 
  userController.getUserById
);

router.post('/', 
  authenticateToken, 
  checkAdmin, 
  validateCreateUser, 
  userController.createUser
);

router.put('/:id', 
  authenticateToken, 
  checkAdmin, 
  validateUpdateUser, 
  userController.updateUser
);

router.delete('/:id', 
  authenticateToken, 
  checkAdmin, 
  validateIdParam, 
  userController.deleteUser
);

module.exports = router;