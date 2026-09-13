// 企业微信智能机器人服务（二期：群内双向操作，发帖 + 回帖）
// 接入方式：智能机器人 API 模式 + 长连接（WebSocket）
//   - wss://openws.work.weixin.qq.com
//   - 握手 aibot_subscribe（bot_id + secret）
//   - 收消息 aibot_msg_callback
//   - 回消息 aibot_respond_msg（需透传回调的 req_id）
// 配置项见 .env.example 中 WECOM_BOT_* 段
const WebSocket = require('ws');
const User = require('../models/User');
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const WecomUserBinding = require('../models/WecomUserBinding');
const { notifyNewDiscussion, notifyNewReply } = require('./wecomNotifyService');
const { downloadAndSaveWecomImage } = require('../utils/wecomImage');

const WECOM_WS_URL = 'wss://openws.work.weixin.qq.com';
const MAX_CONTENT_LENGTH = 500;
const IMAGE_PENDING_MS = 60 * 1000; // 图片缓存有效期 60 秒

class WecomBotService {
  constructor() {
    this.ws = null;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.manualClose = false;
    this.processedMsgIds = new Set();
    this.pendingImages = {}; // { [wecomUserId]: [{url, filename}] }
  }

  start() {
    const botId = process.env.WECOM_BOT_ID;
    const secret = process.env.WECOM_BOT_SECRET;
    if (!botId || !secret) {
      console.log('[企微机器人] 未配置 WECOM_BOT_ID/WECOM_BOT_SECRET，跳过启动');
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
    console.log('[企微机器人] 建立 WebSocket 连接...');
    try {
      this.ws = new WebSocket(WECOM_WS_URL);
      this.ws.on('open', () => this.onOpen());
      this.ws.on('message', (data) => this.onMessage(data));
      this.ws.on('close', () => this.onClose());
      this.ws.on('error', (err) => console.error('[企微机器人] WebSocket 错误:', err.message));
    } catch (err) {
      console.error('[企微机器人] 连接异常:', err.message);
      this.scheduleReconnect();
    }
  }

  onOpen() {
    console.log('[企微机器人] 连接成功，发送订阅');
    this.subscribe();
    this.startHeartbeat();
  }

  subscribe() {
    this.send({
      cmd: 'aibot_subscribe',
      headers: { req_id: this.genReqId() },
      body: {
        bot_id: process.env.WECOM_BOT_ID,
        secret: process.env.WECOM_BOT_SECRET
      }
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ cmd: 'ping', headers: { req_id: this.genReqId() }, body: {} });
    }, 30000);
  }

  onClose() {
    console.log('[企微机器人] WebSocket 断开');
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (!this.manualClose) this.scheduleReconnect();
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    console.log('[企微机器人] 5 秒后重连...');
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
        console.error('[企微机器人] 发送失败:', err.message);
      }
    }
  }

  genReqId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }

  onMessage(data) {
    // 类型安全：ws 库的 message data 可能是 string / Buffer / ArrayBuffer
    // 注意 catch 里**不能再调 data.toString()**（可能不存在，会二次抛异常被吞）
    let text;
    if (typeof data === 'string') {
      text = data;
    } else if (Buffer.isBuffer(data)) {
      text = data.toString('utf8');
    } else if (data instanceof ArrayBuffer) {
      text = Buffer.from(data).toString('utf8');
    } else {
      console.log('[企微机器人] 未知消息类型:', typeof data);
      return;
    }
    let msg;
    try {
      msg = JSON.parse(text);
    } catch (err) {
      console.error('[企微机器人] JSON.parse 失败:', err.message, '前80字符:', text.substring(0, 80));
      return;
    }
    // 实际响应格式（与官方文档略有差异）：
    //  消息回调：{ cmd: "aibot_msg_callback", headers, body: {...} }
    //  订阅响应：{ headers: {req_id}, errcode, errmsg }（无 cmd 字段，errcode 在顶层）
    //  应用层 ping：{ headers: {req_id}, ... }（无 cmd，无 errcode，errcode undefined）
    if (msg.cmd === 'aibot_msg_callback') {
      this.onMsgCallback(msg);
    } else if (msg.cmd === 'aibot_subscribe' || (msg.errcode !== undefined && msg.cmd === undefined)) {
      this.onSubscribeResult(msg);
    } else {
      console.log('[企微机器人] 未知 cmd:', msg.cmd);
    }
  }

  onSubscribeResult(msg) {
    // errcode 可能位于顶层（实际响应）或 msg.body（按文档）
    const errcode = msg.errcode !== undefined ? msg.errcode : (msg.body && msg.body.errcode);
    if (errcode === 0) {
      console.log('[企微机器人] 订阅成功');
    } else {
      console.error('[企微机器人] 订阅失败:', JSON.stringify(msg));
    }
  }

  async onMsgCallback(msg) {
    const body = msg.body || {};
    const headers = msg.headers || {};
    const reqId = headers.req_id || this.genReqId();
    const msgid = body.msgid;

    // 幂等去重
    if (msgid) {
      if (this.processedMsgIds.has(msgid)) return;
      this.processedMsgIds.add(msgid);
      if (this.processedMsgIds.size > 10000) this.processedMsgIds.clear();
    }

    const fromUserId = body.from ? body.from.userid : null;
    const chattype = body.chattype;
    if (chattype !== 'group' || !fromUserId) return;

    const msgtype = body.msgtype;

    // 图片消息：缓存，等待文本指令关联（发帖/回复带图，先发图再发指令）
    if (msgtype === 'image' && body.image) {
      const img = await downloadAndSaveWecomImage(body.image);
      if (img) {
        if (!this.pendingImages[fromUserId]) this.pendingImages[fromUserId] = [];
        this.pendingImages[fromUserId].push(img);
        const self = this;
        setTimeout(() => {
          const arr = self.pendingImages[fromUserId];
          if (arr) {
            const i = arr.indexOf(img);
            if (i >= 0) arr.splice(i, 1);
          }
        }, IMAGE_PENDING_MS);
      }
      return;
    }

    // 文本消息
    let content = '';
    if (msgtype === 'text' && body.text) {
      content = (body.text.content || '').trim();
    }
    if (!content) return;

    // 取待关联图片（处理后清空）
    const images = this.pendingImages[fromUserId] || [];
    delete this.pendingImages[fromUserId];

    // 解析指令
    const parsed = this.parseCommand(content);
    if (!parsed) {
      this.respond(reqId, '指令格式不正确，发送「帮助」查看用法。');
      return;
    }

    if (parsed.cmd === 'help') {
      this.respond(reqId, this.helpText());
      return;
    }

    if (parsed.cmd === 'bind') {
      await this.handleBind(reqId, fromUserId, parsed.code);
      return;
    }

    // 其余指令需身份校验
    const binding = await this.findBinding(fromUserId);
    if (!binding) {
      this.respond(reqId, '未绑定管理员身份，请先发送「绑定 <绑定码>」完成绑定。');
      return;
    }

    if (parsed.cmd === 'post') {
      await this.handlePost(reqId, binding, parsed, images);
    } else if (parsed.cmd === 'reply') {
      await this.handleReply(reqId, binding, parsed, images);
    }
  }

  parseCommand(content) {
    let text = content.replace(/@[\u4e00-\u9fa5A-Za-z0-9_-]+/g, ' ').trim();
    if (!text) return null;

    if (text === '帮助' || text === 'help' || text === '？' || text === '?') {
      return { cmd: 'help' };
    }

    const bindMatch = text.match(/^绑定\s+(\S+)/);
    if (bindMatch) {
      return { cmd: 'bind', code: bindMatch[1] };
    }

    // 发帖：发(一个|个)?帖(子)? — 支持 "发帖/发个帖/发帖子/发个帖子/发一个帖子"
    const postMatch = text.match(/^发(?:一个|个)?帖(?:子)?\s*(公开|私密)?\s*([\s\S]+)/);
    if (postMatch) {
      return {
        cmd: 'post',
        visibility: postMatch[1] === '公开' ? 'public' : 'private',
        content: postMatch[2].trim()
      };
    }

    // 回帖：回(复|帖)(帖子)? — 支持 "回复/回帖/回复帖子"
    const replyMatch = text.match(/^回(?:复|帖)(?:帖子)?\s*([\s\S]+)/);
    if (replyMatch) {
      return { cmd: 'reply', raw: replyMatch[1].trim() };
    }

    return null;
  }

  async findBinding(wecomUserId) {
    const binding = await WecomUserBinding.findOne({
      where: { wecomUserId },
      include: [{ model: User, as: 'adminUser', attributes: ['id', 'name', 'role'] }]
    });
    if (!binding) return null;
    return {
      adminUserId: binding.adminUserId,
      adminName: binding.adminUser ? binding.adminUser.name : '管理员',
      adminRole: binding.adminUser ? binding.adminUser.role : 'admin'
    };
  }

  async handleBind(reqId, wecomUserId, code) {
    const expectCode = process.env.WECOM_BIND_CODE;
    if (!expectCode) {
      this.respond(reqId, '系统未配置绑定码，请联系管理员。');
      return;
    }
    if (code !== expectCode) {
      this.respond(reqId, '绑定码错误。');
      return;
    }
    const adminUser = await User.findOne({ where: { role: 'super_admin' }, attributes: ['id', 'name'] });
    if (!adminUser) {
      this.respond(reqId, '未找到管理员账号，请联系管理员。');
      return;
    }
    await WecomUserBinding.upsert({ wecomUserId, adminUserId: adminUser.id });
    this.respond(reqId, `绑定成功，欢迎 ${adminUser.name}！现在可用「发帖」「回复」指令。`);
  }

  async handlePost(reqId, binding, parsed, images) {
    const content = parsed.content;
    if (!content || content.length > MAX_CONTENT_LENGTH) {
      this.respond(reqId, `内容为空或超长（最多 ${MAX_CONTENT_LENGTH} 字）。`);
      return;
    }
    const title = content.length > 50 ? content.substring(0, 50) + '...' : content;

    try {
      const discussion = await Discussion.create({
        messageId: null,
        userId: binding.adminUserId,
        userName: binding.adminName,
        title,
        content,
        visibility: parsed.visibility,
        category: 'interaction',
        status: 'pending',
        images: images.length > 0 ? images : null
      });

      notifyNewDiscussion(discussion);

      const visibilityText = parsed.visibility === 'public' ? '公开' : '私密';
      const link = `https://aity88.online/#/pages/discussion-detail/discussion-detail?id=${discussion.id}`;
      this.respond(reqId, `✅ 已发布（${visibilityText}）《${title}》${images.length ? '（含图 ' + images.length + ' 张）' : ''}\n${link}`);
    } catch (err) {
      console.error('[企微机器人] 发帖失败:', err.message);
      this.respond(reqId, '发帖失败，请稍后重试。');
    }
  }

  async handleReply(reqId, binding, parsed, images) {
    const raw = parsed.raw;
    if (!raw) {
      this.respond(reqId, '回复格式：回复 <帖子ID> [公开|私密] <内容>，例如「回复 1024 感谢反馈」');
      return;
    }

    const m = raw.match(/^(\d+)\s*(公开|私密)?\s*([\s\S]*)$/);
    if (!m) {
      this.respond(reqId, '回复格式：回复 <帖子ID> [公开|私密] <内容>，例如「回复 1024 感谢反馈」');
      return;
    }

    const discussionId = parseInt(m[1], 10);
    const visibilityWord = m[2];
    const content = (m[3] || '').trim();

    if (!content || content.length > MAX_CONTENT_LENGTH) {
      this.respond(reqId, `内容为空或超长（最多 ${MAX_CONTENT_LENGTH} 字）。`);
      return;
    }

    try {
      const discussion = await Discussion.findByPk(discussionId);
      if (!discussion) {
        this.respond(reqId, `未找到帖子 ${discussionId}。`);
        return;
      }

      const isPrivate = visibilityWord === '私密';

      const reply = await DiscussionReply.create({
        discussionId,
        userId: binding.adminUserId,
        userName: binding.adminName,
        content,
        isPrivate: isPrivate ? 1 : 0,
        images: images.length > 0 ? images : null
      });

      await discussion.update({ status: 'replied' });

      notifyNewReply(discussion, reply);

      if (isPrivate) {
        this.respond(reqId, `✅ 已私密回复《${discussion.title}》（内容仅帖主与管理员可见）`);
      } else {
        this.respond(reqId, `✅ 已回复《${discussion.title}》`);
      }
    } catch (err) {
      console.error('[企微机器人] 回帖失败:', err.message);
      this.respond(reqId, '回复失败，请稍后重试。');
    }
  }

  respond(reqId, text) {
    this.send({
      cmd: 'aibot_respond_msg',
      headers: { req_id: reqId },
      body: {
        msgtype: 'markdown',
        markdown: { content: text }
      }
    });
  }

  helpText() {
    return [
      'AITY回帖助手 使用说明：',
      '• 发帖 [公开|私密] <内容>  发布帖子（缺省私密）',
      '• 回复 <帖子ID> [公开|私密] <内容>  回复帖子（缺省公开）',
      '• 绑定 <绑定码>  绑定管理员身份',
      '• 帮助  查看本说明',
      '（发帖/回复带图：先发图片，再发指令）'
    ].join('\n');
  }
}

module.exports = new WecomBotService();
