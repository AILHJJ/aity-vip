// 消息路由
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

// 获取消息列表
router.get('/', authenticateToken, messageController.getMessages);

// 获取消息详情
router.get('/:id', authenticateToken, messageController.getMessageById);

// 创建消息（需要管理员权限）
router.post('/', authenticateToken, checkAdmin, messageController.createMessage);

// 更新消息（需要管理员权限）
router.put('/:id', authenticateToken, checkAdmin, messageController.updateMessage);

// 删除消息（需要管理员权限）
router.delete('/:id', authenticateToken, checkAdmin, messageController.deleteMessage);

module.exports = router;