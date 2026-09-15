// 渠道工厂：根据配置创建 BotChannel 实例
// 新增渠道（飞书/钉钉）只需在此注册 + 新增对应 Channel 类
const WecomBotChannel = require('../channels/WecomBotChannel');
const FeishuBotChannel = require('../channels/FeishuBotChannel');
const BotService = require('./botService');

/**
 * 创建 botService 实例（渠道无关业务 + 注入渠道）
 * @param {string} channelName 'wecom' | 'feishu' | 'dingtalk'
 * @param {object} config 渠道配置
 * @param {object} options { bindCode }
 * @returns {BotService}
 */
function createBotService(channelName, config, options = {}) {
  let channel;
  switch (channelName) {
    case 'wecom':
      channel = new WecomBotChannel(config);
      break;
    case 'feishu':
      channel = new FeishuBotChannel(config);
      break;
    // 未来扩展：
    // case 'dingtalk':
    //   channel = new DingTalkBotChannel(config);
    //   break;
    default:
      throw new Error(`不支持的渠道: ${channelName}`);
  }
  return new BotService(channel, options);
}

module.exports = { createBotService };
