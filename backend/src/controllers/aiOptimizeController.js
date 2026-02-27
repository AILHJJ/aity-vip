// AI优化控制器
const axios = require('axios');
const AiConfig = require('../models/AiConfig');

// 统一响应格式
function success(data, message = 'Success') {
  return {
    code: 200,
    message,
    data
  };
}

function error(message, code = 500) {
  return {
    code,
    message
  };
}

function badRequest(message = 'Bad request') {
  return {
    code: 400,
    message
  };
}

// 优化文案
async function optimizeContent(req, res) {
  try {
    const { content } = req.body;

    // 验证必填字段
    if (!content) {
      return res.status(400).json(badRequest('请提供要优化的内容'));
    }

    // 获取活跃的AI配置
    const config = await AiConfig.findOne({
      where: { isActive: true }
    });

    if (!config) {
      return res.status(404).json({ code: 404, message: '未找到活跃的AI配置' });
    }

    // 构建提示词
    const promptTemplate = config.promptTemplate || '请优化以下文案，使其更加专业和流畅：';
    const fullPrompt = `${promptTemplate}\n\n${content}`;

    console.log('开始调用AI API优化内容...');

    // 调用AI API
    try {
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        {
          model: config.modelName,
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        }
      );

      // 提取优化后的内容
      const optimizedContent = response.data.choices[0]?.message?.content || content;

      console.log('AI优化成功');

      res.json(success({
        original: content,
        optimized: optimizedContent,
        model: config.modelName,
        timestamp: new Date().toISOString()
      }, 'AI优化成功'));

    } catch (apiError) {
      console.error('AI API调用失败:', apiError.message);

      if (apiError.response) {
        console.error('API响应错误:', {
          status: apiError.response.status,
          data: apiError.response.data
        });
        return res.status(500).json(error(
          `AI API错误: ${apiError.response.data?.error?.message || apiError.response.statusText}`,
          500
        ));
      }

      if (apiError.code === 'ECONNABORTED') {
        return res.status(504).json(error('AI API请求超时，请稍后重试', 504));
      }

      res.status(500).json(error(`AI API调用失败: ${apiError.message}`));
    }

  } catch (err) {
    console.error('优化内容失败:', err);
    res.status(500).json(error('优化内容失败'));
  }
}

module.exports = {
  optimizeContent
};
