/**
 * 消息类型管理路由
 */
const express = require('express');
const router = express.Router();
const messageTypeController = require('../controllers/messageTypeController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

// 获取消息类型列表（所有人可访问）
router.get('/', authenticateToken, messageTypeController.getMessageTypes);

// 获取单个消息类型
router.get('/:id', authenticateToken, messageTypeController.getMessageTypeById);

// 创建消息类型（仅管理员）
router.post('/', authenticateToken, checkAdmin, messageTypeController.createMessageType);

// 更新消息类型（仅管理员）
router.put('/:id', authenticateToken, checkAdmin, messageTypeController.updateMessageType);

// 删除消息类型（仅管理员）
router.delete('/:id', authenticateToken, checkAdmin, messageTypeController.deleteMessageType);

// 初始化默认消息类型（仅管理员）
router.post('/init', authenticateToken, checkAdmin, messageTypeController.initDefaultTypes);

module.exports = router;
