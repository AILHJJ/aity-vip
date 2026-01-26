// 消息路由
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateMessage, validateUpdateMessage, validateIdParam, validateQueryParams } = require('../middleware/validation');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

router.get('/', 
  authenticateToken, 
  validateQueryParams, 
  cacheMiddleware('messages:list', 300),
  messageController.getMessages
);

router.get('/:id', 
  authenticateToken, 
  validateIdParam, 
  cacheMiddleware('messages:detail', 600),
  messageController.getMessageById
);

router.post('/', 
  authenticateToken, 
  checkAdmin, 
  validateCreateMessage, 
  clearCache('messages:*'),
  messageController.createMessage
);

router.put('/:id', 
  authenticateToken, 
  checkAdmin, 
  validateUpdateMessage, 
  clearCache('messages:*'),
  messageController.updateMessage
);

router.delete('/:id', 
  authenticateToken, 
  checkAdmin, 
  validateIdParam, 
  clearCache('messages:*'),
  messageController.deleteMessage
);

module.exports = router;