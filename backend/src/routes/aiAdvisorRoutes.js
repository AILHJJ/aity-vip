const express = require('express');
const router = express.Router();
const aiAdvisorController = require('../controllers/aiAdvisorController');
const { authenticate, isAdmin } = require('../middleware/auth');

/**
 * 图灵AI代理路由
 * 用于代理通达信问小达API请求，自动处理token认证
 */

// 获取当前token状态
router.get('/token-status', aiAdvisorController.getTokenStatus);

// 刷新token（需要手动触发或定时任务）
router.post('/refresh-token', aiAdvisorController.refreshToken);

// 手动设置token（管理员接口）
router.post('/set-token', authenticate, isAdmin, aiAdvisorController.setToken);

// 代理图灵聊天请求
router.post('/chat', aiAdvisorController.proxyChat);

// 流式聊天代理
router.post('/stream-chat', aiAdvisorController.proxyStreamChat);

module.exports = router;
