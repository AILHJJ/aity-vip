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

// 获取当前用户未读消息数（必须在 /:id 之前，否则会被 :id 参数匹配）
router.get('/unread-count',
  authenticateToken,
  messageController.getUnreadCount
);

router.post('/notifications/process',
  authenticateToken,
  checkAdmin,
  messageController.processEmailNotifications
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

// 获取消息阅读详情（管理员专用）
router.get('/:id/read-details',
  authenticateToken,
  checkAdmin,
  ...validateIdParam(),
  messageController.getMessageReadDetails
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
