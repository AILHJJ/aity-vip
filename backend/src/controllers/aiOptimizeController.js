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

// 统一的智能优化提示词
// 核心思路：让AI根据内容特点自主调整，不做过多预判
// 重要：必须返回纯JSON格式，不要有任何其他文字
const BASE_PROMPT = `你是一位专业的投资研报编辑助手。请优化以下投研消息。

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
