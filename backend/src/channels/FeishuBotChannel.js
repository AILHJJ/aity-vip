// 飞书渠道实现（官方 SDK WebSocket 长连接，无需公网回调）
// 依赖：@larksuiteoapi/node-sdk
// 前置条件（飞书开放平台后台）：
//   1. 应用开启「机器人」能力
//   2. 事件与回调 → 订阅方式选择「使用长连接接收事件」
//   3. 订阅事件 im.message.receive_v1
//   4. 权限：接收群聊消息 / 发送消息 / 读取图片资源
//   5. 创建版本并发布
const Lark = require('@larksuiteoapi/node-sdk');
const https = require('https');
const BotChannel = require('./BotChannel');
const { downloadAndSaveFeishuImage } = require('../utils/feishuImage');

// 飞书开放平台 HTTPS JSON 请求（用于获取机器人自身身份，SDK 未封装该接口）
function httpsJson(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('JSON解析失败: ' + data.substring(0, 80))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('请求超时')));
    if (body) req.write(body);
    req.end();
  });
}

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

    // 获取机器人自身 open_id（用于识别"是否 @了本机器人"，避免抢答 @其他机器人的消息）
    this.fetchSelfOpenId();
  }

  async fetchSelfOpenId() {
    try {
      const tokenRes = await httpsJson({
        hostname: 'open.feishu.cn',
        path: '/open-apis/auth/v3/tenant_access_token/internal',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, JSON.stringify({ app_id: this.config.appId, app_secret: this.config.appSecret }));
      if (tokenRes.code !== 0 || !tokenRes.tenant_access_token) {
        throw new Error('token 获取失败: ' + (tokenRes.msg || 'unknown'));
      }
      const info = await httpsJson({
        hostname: 'open.feishu.cn',
        path: '/open-apis/bot/v3/info',
        method: 'GET',
        headers: { Authorization: 'Bearer ' + tokenRes.tenant_access_token }
      });
      if (info.code === 0 && info.bot && info.bot.open_id) {
        this.selfOpenId = info.bot.open_id;
        console.log('[飞书渠道] 机器人身份 open_id:', this.selfOpenId);
      } else {
        throw new Error('bot info 异常: ' + JSON.stringify(info).substring(0, 100));
      }
    } catch (err) {
      console.error('[飞书渠道] 获取机器人身份失败（@过滤将降级为不过滤）:', err.message);
    }
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

    // 文本消息必须 @了本机器人才处理（防止抢答 @其他机器人 / 普通群聊闲聊）。
    // 图片消息不做此过滤：保留"先发图、紧接着 @机器人 发帖"的组合流程。
    if (content && this.selfOpenId) {
      const atMe = (message.mentions || []).some(m => m.id && m.id.open_id === this.selfOpenId);
      if (!atMe) return;
    }

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
