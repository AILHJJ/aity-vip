// AI配置控制器
const AiConfig = require('../models/AiConfig');
const axios = require('axios');

// 统一响应格式
function success(data, message = 'Success') {
  return { code: 200, message, data };
}

function error(message, code = 500) {
  return { code, message };
}

function notFound(message = 'Not found') {
  return { code: 404, message };
}

// 获取所有AI配置（按厂商分组）
async function getAllConfigs(req, res) {
  try {
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';
    const configs = await AiConfig.findAll({ order: [['provider', 'ASC'], ['sortOrder', 'ASC']] });

    const groupedConfigs = {};
    configs.forEach(config => {
      const provider = config.provider || 'other';
      if (!groupedConfigs[provider]) {
        groupedConfigs[provider] = { provider, providerName: config.providerName || provider, models: [] };
      }

      const modelData = {
        id: config.id,
        modelName: config.modelName,
        displayName: config.displayName,
        description: config.description,
        features: config.features ? config.features.split('|') : [],
        baseUrl: config.baseUrl,
        promptTemplate: config.promptTemplate,
        isActive: config.isActive,
        defaultVersion: config.defaultVersion,
        status: config.status,
        sortOrder: config.sortOrder
      };
      modelData.apiKey = isAdmin ? config.apiKey : '***hidden***';
      groupedConfigs[provider].models.push(modelData);
    });

    res.json(success(Object.values(groupedConfigs)));
  } catch (err) {
    console.error('获取AI配置失败:', err);
    res.status(500).json(error('获取AI配置失败'));
  }
}

// 获取当前活跃的AI配置
async function getActiveConfig(req, res) {
  try {
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';
    const config = await AiConfig.findOne({ where: { isActive: true } });

    if (!config) {
      return res.status(404).json(notFound('未找到活跃的AI配置'));
    }

    const response = {
      id: config.id,
      modelName: config.modelName,
      displayName: config.displayName,
      description: config.description,
      features: config.features ? config.features.split('|') : [],
      provider: config.provider,
      providerName: config.providerName,
      baseUrl: config.baseUrl,
      promptTemplate: config.promptTemplate,
      isActive: config.isActive,
      defaultVersion: config.defaultVersion,
      status: config.status
    };
    response.apiKey = isAdmin ? config.apiKey : '***hidden***';

    res.json(success(response));
  } catch (err) {
    console.error('获取AI配置失败:', err);
    res.status(500).json(error('获取AI配置失败'));
  }
}

// 设置活跃模型
async function setActiveModel(req, res) {
  try {
    const { id } = req.params;
    await AiConfig.update({ isActive: false }, { where: {} });
    const config = await AiConfig.findByPk(parseInt(id));
    if (!config) return res.status(404).json(notFound('AI配置不存在'));
    await config.update({ isActive: true });
    res.json(success(config, '已设置默认模型'));
  } catch (err) {
    console.error('设置活跃模型失败:', err);
    res.status(500).json(error('设置活跃模型失败'));
  }
}

// 更新AI配置
async function updateConfig(req, res) {
  try {
    const { id } = req.params;
    const config = await AiConfig.findByPk(parseInt(id));
    if (!config) return res.status(404).json(notFound('AI配置不存在'));

    const fields = ['modelName', 'displayName', 'apiKey', 'baseUrl', 'promptTemplate', 'defaultVersion', 'description', 'features', 'status'];
    const updateData = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

    await config.update(updateData);
    res.json(success(config, 'AI配置更新成功'));
  } catch (err) {
    console.error('更新AI配置失败:', err);
    res.status(500).json(error('更新AI配置失败'));
  }
}

// 更新厂商API Key
async function updateProviderApiKey(req, res) {
  try {
    const { provider } = req.params;
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json(error('API Key不能为空'));

    const [count] = await AiConfig.update({ apiKey }, { where: { provider } });
    res.json(success({ updatedCount: count }, '已更新 ' + count + ' 个模型的API Key'));
  } catch (err) {
    console.error('更新厂商API Key失败:', err);
    res.status(500).json(error('更新厂商API Key失败'));
  }
}

// 测试模型连接内部函数
async function testModelConnection(config) {
  try {
    await axios.post(config.baseUrl + '/chat/completions',
      { model: config.modelName, messages: [{ role: 'user', content: 'Say ok' }], max_tokens: 10 },
      { headers: { 'Authorization': 'Bearer ' + config.apiKey, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    return { status: 'available', message: '连接成功', available: true };
  } catch (apiError) {
    let status = 'error', message = apiError.message;
    if (apiError.response) {
      const errorMsg = apiError.response.data?.error?.message || apiError.response.data?.message || '';
      if (errorMsg.includes('余额不足') || errorMsg.includes('insufficient') || apiError.response.status === 402) {
        status = 'insufficient_balance'; message = '余额不足，请充值';
      } else if (apiError.response.status === 401) {
        message = 'API Key 无效';
      } else {
        message = errorMsg || 'HTTP ' + apiError.response.status;
      }
    } else if (apiError.code === 'ECONNABORTED') {
      message = '连接超时';
    }
    return { status, message, available: false };
  }
}

// 测试单个模型
async function testConnection(req, res) {
  try {
    const config = await AiConfig.findByPk(parseInt(req.params.id));
    if (!config) return res.status(404).json(notFound('AI配置不存在'));
    const result = await testModelConnection(config);
    await config.update({ status: result.status });
    res.json(success(result));
  } catch (err) {
    console.error('测试AI连接失败:', err);
    res.status(500).json(error('测试AI连接失败'));
  }
}

// 批量测试所有模型
async function testAllConnections(req, res) {
  try {
    const configs = await AiConfig.findAll();
    const results = [];
    for (const config of configs) {
      const result = await testModelConnection(config);
      results.push({
        id: config.id,
        modelName: config.modelName,
        displayName: config.displayName,
        provider: config.provider,
        providerName: config.providerName,
        ...result
      });
      await config.update({ status: result.status });
    }
    const summary = {
      total: results.length,
      available: results.filter(r => r.status === 'available').length,
      insufficientBalance: results.filter(r => r.status === 'insufficient_balance').length,
      error: results.filter(r => r.status === 'error').length
    };
    res.json(success({ results, summary }));
  } catch (err) {
    console.error('批量测试AI连接失败:', err);
    res.status(500).json(error('批量测试AI连接失败'));
  }
}

module.exports = {
  getAllConfigs,
  getActiveConfig,
  setActiveModel,
  updateConfig,
  updateProviderApiKey,
  testConnection,
  testAllConnections
};
