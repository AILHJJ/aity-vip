// 认证路由
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../utils/jwtUtils');
const { validateLogin } = require('../middleware/validation');

router.post('/login', 
  validateLogin,
  authController.login
);

router.get('/me', 
  authenticateToken, 
  authController.getCurrentUser
);

module.exports = router;