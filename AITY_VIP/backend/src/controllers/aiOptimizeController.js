// AI优化控制器
const axios = require('axios');
const AiConfig = require('../models/AiConfig');
const { BASE_PROMPT, MODEL_SPECIFIC_PROMPTS } = require('../constants/prompts');

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

    // 构建提示词（优先级：数据库自定义 > 模型专属 > 系统默认）
    const modelSpecificPrompt = MODEL_SPECIFIC_PROMPTS[config.modelName];
    const promptTemplate = config.promptTemplate || modelSpecificPrompt || BASE_PROMPT;
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
          timeout: 120000 // 120秒超时（2分钟），AI优化可能需要较长时间
        }
      );

      // 提取AI返回的内容
      let aiResponse = response.data.choices[0]?.message?.content || content;

      // 尝试解析JSON格式的响应
      let optimizedContent = content;
      let optimizationNote = '';

      try {
        // 清理可能的markdown代码块标记
        aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        // 尝试解析JSON
        const jsonData = JSON.parse(aiResponse);

        if (jsonData.optimizedContent) {
          optimizedContent = jsonData.optimizedContent;
          optimizationNote = jsonData.optimizationNote || 'AI优化完成';
          console.log('成功解析JSON格式的优化结果');
        } else {
          // 如果JSON格式不正确，回退到原始响应
          console.warn('JSON格式缺少optimizedContent字段，使用原始响应');
          optimizedContent = aiResponse;
          optimizationNote = 'AI优化完成';
        }
      } catch (parseError) {
        // JSON解析失败，可能是旧格式或其他格式
        console.warn('JSON解析失败，使用原始响应:', parseError.message);
        optimizedContent = aiResponse;
        optimizationNote = 'AI优化完成';
      }

      console.log('AI优化成功');

      res.json(success({
        original: content,
        optimized: optimizedContent,
        optimizationNote: optimizationNote,
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
