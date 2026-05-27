// 收藏路由
const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authenticateToken } = require('../utils/jwtUtils');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

// 获取收藏列表
router.get('/',
  authenticateToken,
  cacheMiddleware('favorites:list', 300),
  favoritesController.getFavorites
);

// 检查消息是否已收藏
router.get('/check/:messageId',
  authenticateToken,
  favoritesController.checkFavorite
);

// 添加收藏
router.post('/',
  authenticateToken,
  clearCache('favorites:*'),
  favoritesController.addFavorite
);

// 取消收藏
router.delete('/:id',
  authenticateToken,
  clearCache('favorites:*'),
  favoritesController.removeFavorite
);

module.exports = router;
