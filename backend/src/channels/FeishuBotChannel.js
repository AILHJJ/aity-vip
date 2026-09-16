// 飞书渠道实现（官方 SDK WebSocket 长连接，无需公网回调）
// 依赖：@larksuiteoapi/node-sdk
// 前置条件（飞书开放平台后台）：
//   1. 应用开启「机器人」能力
//   2. 事件与回调 → 订阅方式选择「使用长连接接收事件」
//   3. 订阅事件 im.message.receive_v1
//   4. 权限：接收群聊消息 / 发送消息 / 读取图片资源
//   5. 创建版本并发布
const Lark = require('@larksuiteoapi/node-sdk');
const BotChannel = require('./BotChannel');
const { downloadAndSaveFeishuImage } = require('../utils/feishuImage');

class FeishuBotChannel extends BotChannel {
  constructor(config) {
    super('feishu');
    this.config = config; // { appId, appSecret }
    this.client = null;
    this.wsClient = null;
    this.manualClose = false;
  }

  start() {
    if (!this.config || !this.config.appId || !this.config.appSecret) {
      console.log('[飞书渠道] 未配置 appId/appSecret，跳过启动');
      return;
    }
    this.manualClose = false;
    this.client = new Lark.Client({
      appId: this.config.appId,
      appSecret: this.config.appSecret,
      domain: Lark.Domain.Feishu
    });

    const eventDispatcher = new Lark.EventDispatcher({}).register({
      'im.message.receive_v1': async (data) => {
        try {
          await this.onMessageEvent(data);
        } catch (err) {
          console.error('[飞书渠道] 消息事件处理异常:', err.message);
        }
      }
    });

    this.wsClient = new Lark.WSClient({
      appId: this.config.appId,
      appSecret: this.config.appSecret,
      domain: Lark.Domain.Feishu,
      loggerLevel: Lark.LoggerLevel.warn
    });

    console.log('[飞书渠道] 启动 WebSocket 长连接...');
    this.wsClient.start({ eventDispatcher })
      .then(() => console.log('[飞书渠道] 长连接已建立'))
      .catch(err => console.error('[飞书渠道] 长连接启动失败:', err.message));
  }

  stop() {
    this.manualClose = true;
    if (this.wsClient) {
      try { this.wsClient.close && this.wsClient.close(); } catch (e) {}
      this.wsClient = null;
    }
  }

  // 飞书事件 → 统一 ChannelMessage，交给 botService 处理
  async onMessageEvent(data) {
    const event = data && data.event ? data.event : data;
    if (!event || !event.message || !event.sender) return;

    const message = event.message;
    const sender = event.sender;
    // 只处理群聊 + 人类用户发送
    if (message.chat_type !== 'group') return;
    if (sender.sender_type && sender.sender_type !== 'user') return;
    const userId = sender.sender_id && (sender.sender_id.open_id || sender.sender_id.user_id);
    if (!userId) return;

    let content = '';
    let imageObjs = [];

    try {
      if (message.message_type === 'text') {
        const parsed = JSON.parse(message.content || '{}');
        content = parsed.text || '';
        // 去掉 @机器人 的占位符（如 @_user_1）
        for (const m of message.mentions || []) {
          if (m.key) content = content.split(m.key).join(' ');
        }
        content = content.trim();
      } else if (message.message_type === 'image') {
        const parsed = JSON.parse(message.content || '{}');
        if (parsed.image_key) {
          imageObjs.push({ imageKey: parsed.image_key, messageId: message.message_id });
        }
      } else if (message.message_type === 'post') {
        // 富文本：提取纯文本段
        const post = JSON.parse(message.content || '{}').content || {};
        for (const lines of Object.values(post)) {
          for (const line of lines || []) {
            for (const node of line || []) {
              if (node.tag === 'text') content += (node.content || '');
            }
          }
        }
        content = content.trim();
      }
    } catch (err) {
      console.error('[飞书渠道] 消息内容解析失败:', err.message);
      return;
    }

    if (!content && imageObjs.length === 0) return;

    if (this.messageHandler) {
      this.messageHandler({
        msgId: message.message_id,
        userId,
        chatId: message.chat_id || null,
        chatType: 'group',
        content,
        imageObjs,
        reqId: message.message_id
      });
    }
  }

  // 被动回复（reqId = 飞书 message_id）
  reply(reqId, text) {
    if (!this.client || !reqId) return;
    this.client.im.message.reply({
      path: { message_id: reqId },  // SDK 1.74：path 参数承载 URL 中的 message_id
      data: { msg_type: 'text', content: JSON.stringify({ text }) }
    }).catch(err => console.error('[飞书渠道] 回复失败:', err.message));
  }

  // 主动推送（业务通知），返回是否发送成功
  sendToGroup(text) {
    if (!this.client || !this.groupChatId) return false;
    try {
      this.client.im.message.create({
        params: { receive_id_type: 'chat_id' },
        data: {
          receive_id: this.groupChatId,
          msg_type: 'text',
          content: JSON.stringify({ text })
        }
      }).catch(err => console.error('[飞书渠道] 主动推送失败:', err.message));
      return true;
    } catch (err) {
      console.error('[飞书渠道] 主动推送异常:', err.message);
      return false;
    }
  }

  // 图片下载（飞书无需解密，直接保存）
  async downloadImage(imageObj) {
    if (!this.client) return null;
    return downloadAndSaveFeishuImage(this.client, imageObj);
  }
}

module.exports = FeishuBotChannel;
