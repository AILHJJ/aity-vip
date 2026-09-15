// 渠道配置路由（管理员专用）
const express = require('express');
const router = express.Router();
const controller = require('../controllers/botConfigController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

// 列表（凭证脱敏）
router.get('/', authenticateToken, checkAdmin, controller.listConfigs);

// 更新某渠道配置 + 热重载
router.put('/:channel', authenticateToken, checkAdmin, controller.updateConfig);

// 手动热重载
router.post('/reload', authenticateToken, checkAdmin, controller.reload);

module.exports = router;
