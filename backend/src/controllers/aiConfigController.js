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

// ============================================================================
// 系统提示词配置
// ============================================================================

// 通用提示词模板（适用于大多数模型）
// 重要：必须返回纯JSON格式
const DEFAULT_PROMPT = `你是一位专业的投资研报编辑助手。请优化以下投研消息。

## 优化规则
1. 使用Markdown格式：标题(###)、列表(-)、粗体(**)
2. 核心内容置顶，用1-2句话概括
3. **保留原文所有信息**：不删除、不添加、不篡改
4. **保留专业术语和准确数据**：股价、点位、百分比等
5. **保留所有URL链接**：原文中的URL必须原样保留
6. 如有操作建议/标的，要特别醒目

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字、解释或说明：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

注意：
- optimizedContent: 优化后的正文（Markdown格式）
- optimizationNote: 简要说明做了什么优化
- 直接输出JSON，不要用代码块包裹
- 不要有任何开头或结尾的说明文字`;

// 模型特定提示词配置
// 针对不同模型的特点进行优化
// 重要：所有提示词必须要求输出JSON格式
const MODEL_SPECIFIC_PROMPTS = {
  // ============================================================================
  // 智谱 AI (Zhipu AI)
  // 特点：中文理解能力强，逻辑推理出色，适合复杂投资分析
  // ============================================================================
  'glm-4-flash': `你是一位专业的投资研报编辑助手。请优化以下投研消息。

## 核心要求
1. **信息完整**：保留原文所有信息、数据、URL链接，不删除不篡改
2. **格式规范**：使用Markdown格式（###标题、-列表、**粗体**）
3. **结构优化**：核心观点置顶，关键信息列表化，便于扫读
4. **突出重点**：操作建议、标的、价位等关键信息特别醒目

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'glm-4.7': `你是一位资深的投资分析师和财经编辑。请深度优化以下投研内容。

## 优化目标
1. **逻辑严密**：确保论证链条完整，推理严密
2. **深度分析**：挖掘数据背后的投资逻辑
3. **专业表达**：使用准确的金融术语和行业表达
4. **信息完整**：保留原文所有信息、数据、URL链接

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  // ============================================================================
  // DeepSeek 系列
  // 特点：逻辑推理能力极强，擅长深度分析和复杂推理
  // ============================================================================
  'deepseek-v3': `你是一位专业的投资研报编辑。请用逻辑严密的方式优化以下投资内容。

## 核心任务
1. **梳理核心观点**：提炼最重要的投资要点
2. **强化论证逻辑**：确保推理链条完整、论证充分
3. **数据支撑分析**：保留所有关键数据和指标
4. **结论清晰明确**：让读者快速理解投资价值

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'deepseek-v3-250324': `你是一位专业的投资研报编辑。请用逻辑严密的方式优化以下投资内容。

## 核心任务
1. **梳理核心观点**：提炼最重要的投资要点
2. **强化论证逻辑**：确保推理链条完整、论证充分
3. **数据支撑分析**：保留所有关键数据和指标
4. **结论清晰明确**：让读者快速理解投资价值

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'deepseek-r1': `你是一位资深的投资研究专家。请优化以下投资内容。

## 深度优化要点
1. **逻辑推理**：分析原文的推理过程，确保论证严密
2. **数据挖掘**：识别关键数据背后的投资含义
3. **风险收益**：平衡呈现机会与风险
4. **可操作性**：如有建议，确保清晰可执行

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'deepseek-r1-250528': `你是一位资深的投资研究专家。请优化以下投资内容。

## 深度优化要点
1. **逻辑推理**：分析原文的推理过程，确保论证严密
2. **数据挖掘**：识别关键数据背后的投资含义
3. **风险收益**：平衡呈现机会与风险
4. **可操作性**：如有建议，确保清晰可执行

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  // ============================================================================
  // Qwen 系列（通义千问）
  // 特点：综合能力强，中文表现优秀，理解力强
  // ============================================================================
  'qwen3-max': `你是一位顶级的投资分析师和财经编辑。请以最专业的视角优化以下投研内容。

## 优化标准
1. **结构清晰**：使用Markdown格式，层次分明
2. **重点突出**：核心观点、关键数据用粗体标注
3. **语言精练**：去除冗余，保留核心信息
4. **逻辑严密**：确保论证完整、推理清晰
5. **专业准确**：保持金融术语的准确性

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'qwen3.5-plus': `你是一位专业的投资分析师。请优化以下投研内容，使其专业且易读。

## 优化要求
1. **结构清晰**：使用Markdown格式组织内容
2. **重点突出**：关键信息用粗体标注
3. **信息完整**：保留原文所有信息、数据、URL
4. **专业准确**：保持金融术语的准确性
5. **易于理解**：适当简化复杂表达

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'qwen3.5-flash': `请快速优化以下投研内容，保持简洁有力。

## 要求
- 保留所有信息和URL链接
- 使用Markdown格式
- 核心观点置顶
- 关键信息突出显示

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'qwen-plus': `你是一位专业的投资分析师。请优化以下投研内容，使其表达更加有力、重点突出。

## 优化要点
1. 保留原文所有信息和URL链接
2. 使用Markdown格式
3. 核心观点置顶，简洁有力
4. 关键数据和观点突出显示
5. 语言精练，逻辑清晰

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'qwen-turbo': `快速优化以下投研内容。

## 要求
- 保留所有信息和URL
- 使用Markdown格式
- 核心观点置顶
- 简洁有力

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  // ============================================================================
  // Kimi（月之暗面）
  // 特点：长文本处理能力强，理解深度好
  // ============================================================================
  'kimi-k2.5': `你是一位专业的投资研报编辑助手。请优化以下投研消息。

## 核心要求
1. **信息完整**：保留原文所有信息、数据、URL链接
2. **格式规范**：使用Markdown格式（###标题、-列表、**粗体**）
3. **结构优化**：核心观点置顶，关键信息列表化
4. **突出重点**：操作建议、标的、价位等醒目标注

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  // ============================================================================
  // 豆包系列（火山引擎）
  // 特点：通俗易懂，亲和力强，适合普通投资者
  // ============================================================================
  'doubao-1-5-pro-32k-250115': `你是一位专业的投资分析师。请用通俗易懂的方式优化以下投资内容。

## 优化策略
1. **简化表达**：在保持专业性的前提下，简化复杂术语
2. **生动说明**：用比喻等方式说明复杂概念
3. **亲和力强**：语言自然流畅，增强可读性
4. **信息完整**：保留原文所有信息、数据、URL链接

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  'doubao-1-5-lite-32k-250115': `请快速优化以下投研内容，保持简洁有力。

## 要求
- 保留所有信息和URL链接
- 使用Markdown格式
- 核心观点置顶
- 简洁明了

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`,

  // ============================================================================
  // MiniMax
  // 特点：多模态能力强，理解力强
  // ============================================================================
  'MiniMax-M2.5': `你是一位专业的投资研报编辑助手。请优化以下投研消息。

## 核心要求
1. **信息完整**：保留原文所有信息、数据、URL链接
2. **格式规范**：使用Markdown格式（###标题、-列表、**粗体**）
3. **结构优化**：核心观点置顶，关键信息列表化
4. **突出重点**：操作建议、标的、价位等醒目标注

## 输出格式（严格遵守）

你必须且只能输出以下JSON格式，不要输出任何其他文字：

{"optimizedContent":"优化后的Markdown内容","optimizationNote":"一句话说明优化要点"}

直接输出JSON：`
};

// 获取模型特定的提示词
function getModelSpecificPrompt(modelName) {
  return MODEL_SPECIFIC_PROMPTS[modelName] || DEFAULT_PROMPT;
}

// 获取默认提示词
async function getDefaultPrompt(req, res) {
  try {
    res.json(success({
      prompt: DEFAULT_PROMPT,
      modelSpecificPrompts: MODEL_SPECIFIC_PROMPTS,
      version: '2.0.0',
      updatedAt: '2026-03-02',
      modelsCount: Object.keys(MODEL_SPECIFIC_PROMPTS).length
    }));
  } catch (err) {
    console.error('获取默认提示词失败:', err);
    res.status(500).json(error('获取默认提示词失败'));
  }
}

// 获取特定模型的默认提示词
async function getModelPrompt(req, res) {
  try {
    const { modelName } = req.params;
    const prompt = getModelSpecificPrompt(modelName);

    if (!prompt) {
      return res.status(404).json(notFound(`未找到模型 ${modelName} 的特定提示词`));
    }

    res.json(success({
      modelName,
      prompt,
      isDefault: prompt === DEFAULT_PROMPT
    }));
  } catch (err) {
    console.error('获取模型提示词失败:', err);
    res.status(500).json(error('获取模型提示词失败'));
  }
}

// 应用模型特定提示词到数据库
async function applyModelSpecificPrompts(req, res) {
  try {
    const configs = await AiConfig.findAll();
    let appliedCount = 0;
    const results = [];

    for (const config of configs) {
      const specificPrompt = getModelSpecificPrompt(config.modelName);

      // 如果找到模型特定的提示词，则应用
      if (specificPrompt && specificPrompt !== DEFAULT_PROMPT) {
        await config.update({ promptTemplate: specificPrompt });
        appliedCount++;
        results.push({
          modelName: config.modelName,
          displayName: config.displayName,
          applied: true
        });
      } else {
        results.push({
          modelName: config.modelName,
          displayName: config.displayName,
          applied: false,
          reason: '未配置特定提示词，使用通用提示词'
        });
      }
    }

    res.json(success({
      totalModels: configs.length,
      appliedCount,
      results,
      message: `已为 ${appliedCount} 个模型应用专属提示词`
    }, '模型特定提示词应用成功'));
  } catch (err) {
    console.error('应用模型特定提示词失败:', err);
    res.status(500).json(error('应用模型特定提示词失败'));
  }
}

// 批量更新所有模型的提示词
async function updateAllPrompts(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json(error('提示词不能为空'));
    }

    const [count] = await AiConfig.update(
      { promptTemplate: prompt.trim() },
      { where: {} }
    );

    res.json(success({
      updatedCount: count,
      prompt: prompt.trim()
    }, `已更新 ${count} 个模型的提示词`));
  } catch (err) {
    console.error('批量更新提示词失败:', err);
    res.status(500).json(error('批量更新提示词失败'));
  }
}

// 恢复所有模型为默认提示词（清空数据库中的自定义提示词）
async function resetAllPrompts(req, res) {
  try {
    const [count] = await AiConfig.update(
      { promptTemplate: null },
      { where: {} }
    );

    res.json(success({
      resetCount: count,
      defaultPrompt: DEFAULT_PROMPT
    }, `已恢复 ${count} 个模型为默认提示词`));
  } catch (err) {
    console.error('恢复默认提示词失败:', err);
    res.status(500).json(error('恢复默认提示词失败'));
  }
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

// 将详细错误状态映射到数据库支持的ENUM值
// 数据库ENUM: 'available', 'insufficient_balance', 'error', 'unknown'
function mapStatusToEnum(detailedStatus) {
  const statusMap = {
    'available': 'available',
    'insufficient_balance': 'insufficient_balance',
    'auth_failed': 'error',
    'model_not_found': 'error',
    'rate_limited': 'error',
    'server_error': 'error',
    'timeout': 'error',
    'network_error': 'error',
    'error': 'error',
    'unknown': 'unknown'
  };
  return statusMap[detailedStatus] || 'error';
}

// 测试模型连接内部函数
async function testModelConnection(config) {
  try {
    await axios.post(config.baseUrl + '/chat/completions',
      { model: config.modelName, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 },
      {
        headers: { 'Authorization': 'Bearer ' + config.apiKey, 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    return { status: 'available', message: '连接成功', available: true, detailedStatus: 'available' };
  } catch (apiError) {
    let detailedStatus = 'error', message = apiError.message;

    if (apiError.response) {
      const statusCode = apiError.response.status;
      const errorMsg = (
        apiError.response.data?.error?.message ||
        apiError.response.data?.message ||
        JSON.stringify(apiError.response.data)
      ).toLowerCase();

      // 余额不足检测（增强版）
      if (statusCode === 402 ||
        errorMsg.includes('余额不足') ||
        errorMsg.includes('insufficient') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('exceeded') ||
        errorMsg.includes('billing')) {
        detailedStatus = 'insufficient_balance';
        message = '余额不足，请充值';
      }
      // 鉴权失败
      else if (statusCode === 401 ||
        errorMsg.includes('invalid') ||
        errorMsg.includes('unauthorized')) {
        detailedStatus = 'auth_failed';
        message = 'API Key 无效';
      }
      // 模型不存在
      else if (statusCode === 404 ||
        (errorMsg.includes('model') && errorMsg.includes('not found'))) {
        detailedStatus = 'model_not_found';
        message = '模型不存在';
      }
      // 限流
      else if (statusCode === 429 ||
        errorMsg.includes('rate limit')) {
        detailedStatus = 'rate_limited';
        message = '请求过于频繁';
      }
      // 服务器错误
      else if (statusCode >= 500) {
        detailedStatus = 'server_error';
        message = '服务暂时不可用';
      }
      else {
        message = `HTTP ${statusCode}: ${errorMsg.substring(0, 50)}`;
      }
    }
    // 连接超时
    else if (apiError.code === 'ECONNABORTED') {
      detailedStatus = 'timeout';
      message = '连接超时';
    }
    // 网络错误
    else if (apiError.code === 'ENOTFOUND' || apiError.code === 'ECONNREFUSED') {
      detailedStatus = 'network_error';
      message = '网络无法访问';
    }

    // 返回详细状态供前端显示，同时返回映射后的ENUM值供数据库存储
    return {
      status: mapStatusToEnum(detailedStatus),  // 数据库ENUM值
      detailedStatus: detailedStatus,           // 详细状态供前端使用
      message,
      available: false
    };
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

// 批量测试所有模型（并行优化版本）
async function testAllConnections(req, res) {
  try {
    const configs = await AiConfig.findAll();

    // 使用 Promise.all 并行测试所有模型，大幅提升性能
    const testPromises = configs.map(async (config) => {
      const result = await testModelConnection(config);
      const resultData = {
        id: config.id,
        modelName: config.modelName,
        displayName: config.displayName,
        provider: config.provider,
        providerName: config.providerName,
        ...result
      };
      // 并发更新数据库状态
      await config.update({ status: result.status });
      return resultData;
    });

    // 等待所有测试完成
    const results = await Promise.all(testPromises);

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

// 获取单个模型的提示词选项（通用/专属）
async function getPromptOptions(req, res) {
  try {
    const { id } = req.params;
    const config = await AiConfig.findByPk(parseInt(id));

    if (!config) {
      return res.status(404).json(notFound('AI配置不存在'));
    }

    const specificPrompt = MODEL_SPECIFIC_PROMPTS[config.modelName] || null;

    res.json(success({
      defaultPrompt: BASE_PROMPT,
      specificPrompt: specificPrompt,
      currentPrompt: config.promptTemplate,
      modelName: config.displayName
    }));
  } catch (err) {
    console.error('获取提示词选项失败:', err);
    res.status(500).json(error('获取提示词选项失败'));
  }
}

module.exports = {
  getAllConfigs,
  getActiveConfig,
  setActiveModel,
  updateConfig,
  updateProviderApiKey,
  testConnection,
  testAllConnections,
  getDefaultPrompt,
  getModelPrompt,
  getPromptOptions,
  applyModelSpecificPrompts,
  updateAllPrompts,
  resetAllPrompts
};
