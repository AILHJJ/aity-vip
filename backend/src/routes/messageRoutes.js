// 消息路由
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateMessage, validateUpdateMessage, validateIdParam, validateQueryParams } = require('../middleware/validation');

router.get('/', authenticateToken, validateQueryParams, messageController.getMessages);
router.get('/:id', authenticateToken, validateIdParam, messageController.getMessageById);
router.post('/', authenticateToken, checkAdmin, validateCreateMessage, messageController.createMessage);
router.put('/:id', authenticateToken, checkAdmin, validateUpdateMessage, messageController.updateMessage);
router.delete('/:id', authenticateToken, checkAdmin, validateIdParam, messageController.deleteMessage);

module.exports = router;