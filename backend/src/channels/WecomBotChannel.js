// 企微智能机器人渠道实现（长连接 WebSocket）
// 负责：WebSocket 连接、消息收发、企微消息 → ChannelMessage 转换、图片 AES 解密
// 业务逻辑（指令解析/发帖/回帖/讨论/绑定）不在此文件，见 services/botService.js
const WebSocket = require('ws');
const BotChannel = require('./BotChannel');
const { downloadAndSaveWecomImage } = require('../utils/wecomImage');

const WECOM_WS_URL = 'wss://openws.work.weixin.qq.com';

class WecomBotChannel extends BotChannel {
  constructor(config) {
    super('wecom');
    this.config = config; // { botId, secret }
    this.ws = null;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.manualClose = false;
  }

  start() {
    if (!this.config || !this.config.botId || !this.config.secret) {
      console.log('[企微渠道] 未配置 botId/secret，跳过启动');
      return;
    }
    this.manualClose = false;
    this.connect();
  }

  stop() {
    this.manualClose = true;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
  }

  connect() {
    console.log('[企微渠道] 建立 WebSocket 连接...');
    try {
      this.ws = new WebSocket(WECOM_WS_URL);
      this.ws.on('open', () => this.onOpen());
      this.ws.on('message', (data) => this.onMessage(data));
      this.ws.on('close', () => this.onClose());
      this.ws.on('error', (err) => console.error('[企微渠道] WebSocket 错误:', err.message));
    } catch (err) {
      console.error('[企微渠道] 连接异常:', err.message);
      this.scheduleReconnect();
    }
  }

  onOpen() {
    console.log('[企微渠道] 连接成功，发送订阅');
    this.subscribe();
    this.startHeartbeat();
  }

  subscribe() {
    this.send({
      cmd: 'aibot_subscribe',
      headers: { req_id: this.genReqId() },
      body: {
        bot_id: this.config.botId,
        secret: this.config.secret
      }
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ cmd: 'ping', headers: { req_id: this.genReqId() }, body: {} });
    }, 30000);
  }

  onClose() {
    console.log('[企微渠道] WebSocket 断开');
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (!this.manualClose) this.scheduleReconnect();
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    console.log('[企微渠道] 5 秒后重连...');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(obj));
      } catch (err) {
        console.error('[企微渠道] 发送失败:', err.message);
      }
    }
  }

  genReqId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }

  onMessage(data) {
    let text;
    if (typeof data === 'string') {
      text = data;
    } else if (Buffer.isBuffer(data)) {
      text = data.toString('utf8');
    } else if (data instanceof ArrayBuffer) {
      text = Buffer.from(data).toString('utf8');
    } else {
      console.log('[企微渠道] 未知消息类型:', typeof data);
      return;
    }
    let msg;
    try {
      msg = JSON.parse(text);
    } catch (err) {
      console.error('[企微渠道] JSON.parse 失败:', err.message, '前80字符:', text.substring(0, 80));
      return;
    }
    if (msg.cmd === 'aibot_msg_callback') {
      this.toChannelMessage(msg);
    } else if (msg.cmd === 'aibot_subscribe' || (msg.errcode !== undefined && msg.cmd === undefined)) {
      const errcode = msg.errcode !== undefined ? msg.errcode : (msg.body && msg.body.errcode);
      if (errcode === 0) {
        console.log('[企微渠道] 订阅成功');
      } else {
        console.error('[企微渠道] 订阅失败:', JSON.stringify(msg));
      }
    } else {
      console.log('[企微渠道] 未知 cmd:', msg.cmd);
    }
  }

  // 企微消息 → 统一 ChannelMessage，交给 botService 处理
  toChannelMessage(msg) {
    const body = msg.body || {};
    const headers = msg.headers || {};
    const chatType = body.chattype;
    const userId = body.from ? body.from.userid : null;
    if (chatType !== 'group' || !userId) return;

    const channelMsg = {
      msgId: body.msgid,
      userId,
      chatId: body.chatid || null,
      chatType,
      content: '',
      imageObjs: [],
      reqId: headers.req_id || this.genReqId()
    };

    const msgtype = body.msgtype;

    // 提取文本和图片
    if (msgtype === 'text' && body.text) {
      channelMsg.content = (body.text.content || '').trim();
    } else if (msgtype === 'image' && body.image) {
      channelMsg.imageObjs = [body.image];
    } else if (msgtype === 'mixed' && body.mixed && Array.isArray(body.mixed.msg_item)) {
      const texts = [];
      for (const item of body.mixed.msg_item) {
        if (item.msgtype === 'text' && item.text) {
          texts.push((item.text.content || '').trim());
        } else if (item.msgtype === 'image' && item.image) {
          channelMsg.imageObjs.push(item.image);
        }
      }
      channelMsg.content = texts.join(' ').trim();
    }

    // 无文本且无图片的消息忽略
    if (!channelMsg.content && channelMsg.imageObjs.length === 0) return;

    if (this.messageHandler) {
      this.messageHandler(channelMsg);
    }
  }

  // 被动回复
  reply(reqId, text) {
    this.send({
      cmd: 'aibot_respond_msg',
      headers: { req_id: reqId },
      body: { msgtype: 'markdown', markdown: { content: text } }
    });
  }

  // 主动推送（业务通知）
  sendToGroup(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    if (!this.groupChatId) return false;
    try {
      this.send({
        cmd: 'aibot_send_msg',
        headers: { req_id: this.genReqId() },
        body: { chatid: this.groupChatId, msgtype: 'markdown', markdown: { content: text } }
      });
      return true;
    } catch (err) {
      console.error('[企微渠道] 主动推送失败:', err.message);
      return false;
    }
  }

  // 图片下载解密（企微 AES 解密 + 格式检测）
  async downloadImage(imageObj) {
    return downloadAndSaveWecomImage(imageObj);
  }
}

module.exports = WecomBotChannel;
