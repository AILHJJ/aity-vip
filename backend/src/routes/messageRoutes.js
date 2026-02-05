// 消息路由
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateMessage, validateUpdateMessage, validateIdParam, validateQueryParams } = require('../middleware/validation');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

router.get('/',
  authenticateToken,
  messageController.getMessages
);

router.get('/:id',
  authenticateToken,
  ...validateIdParam(),
  cacheMiddleware('messages:detail', 600),
  messageController.getMessageById
);

router.post('/',
  authenticateToken,
  checkAdmin,
  ...validateCreateMessage(),
  clearCache('messages:*'),
  messageController.createMessage
);

router.put('/:id',
  authenticateToken,
  checkAdmin,
  ...validateUpdateMessage(),
  clearCache('messages:*'),
  messageController.updateMessage
);

router.delete('/:id',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  clearCache('messages:*'),
  messageController.deleteMessage
);

// 标记消息为已读
router.post('/:id/read',
  authenticateToken,
  ...validateIdParam(),
  messageController.markMessageAsRead
);

// 收藏消息
router.post('/:id/favorite',
  authenticateToken,
  ...validateIdParam(),
  messageController.favoriteMessage
);

// 取消收藏消息
router.delete('/:id/favorite',
  authenticateToken,
  ...validateIdParam(),
  messageController.unfavoriteMessage
);

// 置顶消息
router.post('/:id/pin',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  clearCache('messages:*'),
  messageController.pinMessage
);

// 取消置顶消息
router.delete('/:id/pin',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  clearCache('messages:*'),
  messageController.unpinMessage
);

module.exports = router;