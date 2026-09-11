const express = require('express');
const router = express.Router();
const aiAdvisorController = require('../controllers/aiAdvisorController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

/**
 * Agent 对话与管理路由。
 * 小程序始终通过本服务使用 OpenAPI，服务端负责密钥与用户身份映射。
 */

router.get('/config', authenticateToken, aiAdvisorController.getConfig);
router.get('/agents', authenticateToken, checkAdmin, aiAdvisorController.listAgents);
router.put('/config', authenticateToken, checkAdmin, aiAdvisorController.updateConfig);
router.post('/chat', authenticateToken, aiAdvisorController.chat);
router.get('/usage/personal', authenticateToken, aiAdvisorController.personalUsage);
router.get('/usage', authenticateToken, checkAdmin, aiAdvisorController.globalUsage);

module.exports = router;
