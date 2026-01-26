// 认证路由
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../utils/jwtUtils');

// 登录
router.post('/login', authController.login);

// 注册路由已移除，用户注册由管理员统一管理

// 获取当前用户信息
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;