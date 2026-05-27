// AI路由
const express = require('express');
const router = express.Router();
const aiConfigController = require('../controllers/aiConfigController');
const aiOptimizeController = require('../controllers/aiOptimizeController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

// 获取所有AI配置（按厂商分组）
router.get('/configs', authenticateToken, aiConfigController.getAllConfigs);

// 获取当前活跃的AI配置
router.get('/config', authenticateToken, aiConfigController.getActiveConfig);

// 设置活跃模型（需要管理员权限）
router.put('/config/:id/active', authenticateToken, checkAdmin, aiConfigController.setActiveModel);

// 更新AI配置（需要管理员权限）
router.put('/config/:id', authenticateToken, checkAdmin, aiConfigController.updateConfig);

// 更新厂商API Key（需要管理员权限）
router.put('/provider/:provider/apikey', authenticateToken, checkAdmin, aiConfigController.updateProviderApiKey);

// 测试单个AI连接（需要管理员权限）
router.post('/test-connection/:id', authenticateToken, checkAdmin, aiConfigController.testConnection);

// 批量测试所有AI连接（需要管理员权限）
router.post('/test-all-connections', authenticateToken, checkAdmin, aiConfigController.testAllConnections);

// 优化文案（需要管理员权限）
router.post('/optimize', authenticateToken, checkAdmin, aiOptimizeController.optimizeContent);

// ========== 提示词管理 ==========
// 获取系统默认提示词（包含所有模型特定提示词）
router.get('/prompt/default', authenticateToken, checkAdmin, aiConfigController.getDefaultPrompt);

// 获取特定模型的默认提示词
router.get('/prompt/model/:modelName', authenticateToken, checkAdmin, aiConfigController.getModelPrompt);

// 获取单个模型的提示词选项（通用/专属）
router.get('/config/:id/prompt-options', authenticateToken, checkAdmin, aiConfigController.getPromptOptions);

// 应用模型特定提示词到数据库
router.post('/prompt/apply-model-specific', authenticateToken, checkAdmin, aiConfigController.applyModelSpecificPrompts);

// 批量更新所有模型的提示词
router.put('/prompt/all', authenticateToken, checkAdmin, aiConfigController.updateAllPrompts);

// 恢复所有模型为默认提示词
router.post('/prompt/reset', authenticateToken, checkAdmin, aiConfigController.resetAllPrompts);

module.exports = router;
