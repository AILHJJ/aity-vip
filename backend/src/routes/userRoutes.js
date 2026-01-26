// 用户路由
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

// 获取所有用户（需要管理员权限）
router.get('/', authenticateToken, checkAdmin, userController.getAllUsers);

// 获取用户详情
router.get('/:id', authenticateToken, userController.getUserById);

// 创建用户（需要管理员权限）
router.post('/', authenticateToken, checkAdmin, userController.createUser);

// 更新用户（需要管理员权限）
router.put('/:id', authenticateToken, checkAdmin, userController.updateUser);

// 删除用户（需要管理员权限）
router.delete('/:id', authenticateToken, checkAdmin, userController.deleteUser);

module.exports = router;