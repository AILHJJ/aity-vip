// 统计路由
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../utils/jwtUtils');

// 获取全局统计数据（新增）
router.get('/', authenticateToken, statsController.getGlobalStats);

// 获取个人统计数据
router.get('/personal', authenticateToken, statsController.getPersonalStats);

// 获取用户增长趋势
router.get('/user-growth', authenticateToken, statsController.getUserGrowth);

// 获取消息阅读趋势
router.get('/message-trend', authenticateToken, statsController.getMessageTrend);

// 获取活跃用户列表
router.get('/active-users', authenticateToken, statsController.getActiveUsers);

// 获取用户角色分布
router.get('/user-role-distribution', authenticateToken, statsController.getUserRoleDistribution);

// 获取消息类型分布
router.get('/message-type-distribution', authenticateToken, statsController.getMessageTypeDistribution);

module.exports = router;