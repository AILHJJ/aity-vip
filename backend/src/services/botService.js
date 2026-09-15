// 渠道无关的机器人业务逻辑
// 职责：指令解析、发帖/回帖/讨论/绑定、身份校验、图片缓存管理
// 不感知具体 IM 渠道（企微/飞书/钉钉），通过注入的 BotChannel 收发消息
const User = require('../models/User');
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const WecomUserBinding = require('../models/WecomUserBinding');
const Message = require('../models/Message');

const MAX_CONTENT_LENGTH = 2000;
const IMAGE_PENDING_MS = 60 * 1000; // 图片缓存有效期 60 秒

class BotService {
  constructor(channel, options = {}) {
    this.channel = channel;
    this.bindCode = options.bindCode || process.env.WECOM_BIND_CODE || '';
    this.processedMsgIds = new Set();
    this.pendingImages = {}; // { [userId]: [{url, filename}] }
  }

  async start() {
    this.channel.onUserMessage((msg) => this.handleMessage(msg).catch(err => {
      console.error('[botService] 消息处理异常:', err.message, err.stack);
    }));
    this.channel.start();
  }

  stop() {
    this.channel.stop();
  }

  // 主动推送（业务通知用，供 notifyService 调用）
  notifyToGroup(text) {
    return this.channel.sendToGroup(text);
  }

  async handleMessage(msg) {
    // 幂等去重
    if (msg.msgId) {
      if (this.processedMsgIds.has(msg.msgId)) return;
      this.processedMsgIds.add(msg.msgId);
      if (this.processedMsgIds.size > 10000) this.processedMsgIds.clear();
    }

    // 缓存群会话 ID（供渠道主动推送）
    if (msg.chatId) {
      this.channel.groupChatId = msg.chatId;
    }

    // 下载并缓存图片（image 消息的图片，或 mixed 内嵌图片）
    for (const imageObj of msg.imageObjs || []) {
      const img = await this.channel.downloadImage(imageObj);
      if (img) {
        if (!this.pendingImages[msg.userId]) this.pendingImages[msg.userId] = [];
        this.pendingImages[msg.userId].push(img);
        const self = this;
        setTimeout(() => {
          const arr = self.pendingImages[msg.userId];
          if (arr) {
            const i = arr.indexOf(img);
            if (i >= 0) arr.splice(i, 1);
          }
        }, IMAGE_PENDING_MS);
      }
    }

    // 纯图片消息（无文本）：只缓存图片，不处理指令
    if (!msg.content) return;

    // 取待关联图片（处理后清空）
    const images = this.pendingImages[msg.userId] || [];
    delete this.pendingImages[msg.userId];

    // 解析指令
    const parsed = this.parseCommand(msg.content);
    if (!parsed) {
      this.channel.reply(msg.reqId, '指令格式不正确，发送「帮助」查看用法。');
      return;
    }

    if (parsed.cmd === 'help') {
      this.channel.reply(msg.reqId, this.helpText());
      return;
    }

    if (parsed.cmd === 'bind') {
      try {
        await this.handleBind(msg.reqId, msg.userId, parsed.code);
      } catch (err) {
        console.error('[botService] 绑定异常:', err.message, err.stack);
        this.channel.reply(msg.reqId, '绑定失败，请稍后重试：' + err.message);
      }
      return;
    }

    // 其余指令需身份校验
    const binding = await this.findBinding(msg.userId);
    if (!binding) {
      this.channel.reply(msg.reqId, '未绑定管理员身份，请先发送「绑定 <绑定码>」完成绑定。');
      return;
    }

    if (parsed.cmd === 'post') {
      await this.handlePost(msg.reqId, binding, parsed, images);
    } else if (parsed.cmd === 'reply') {
      await this.handleReply(msg.reqId, binding, parsed, images);
    } else if (parsed.cmd === 'discuss') {
      await this.handleCreateDiscussion(msg.reqId, binding, parsed);
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

    const postMatch = text.match(/^发(?:一个|个)?帖(?:子)?([\s\S]*)$/);
    if (postMatch) {
      let rest = postMatch[1] || '';
      let visibility = 'public';
      const visMatch = rest.match(/^\s*(公开|私密)\s*/);
      if (visMatch) {
        visibility = visMatch[1] === '私密' ? 'private' : 'public';
        rest = rest.substring(visMatch[0].length);
      }
      const hashMatch = rest.match(/^\s*#+\s*([^\n]+)\n?([\s\S]*)$/);
      let title = '';
      let content = rest.trim();
      if (hashMatch) {
        title = hashMatch[1].trim();
        content = (hashMatch[2] || '').trim();
      }
      return { cmd: 'post', title, content, visibility };
    }

    const replyMatch = text.match(/^回(?:复|帖)(?:帖子)?\s*([\s\S]+)/);
    if (replyMatch) {
      return { cmd: 'reply', raw: replyMatch[1].trim() };
    }

    const discussMatch = text.match(/^(?:创建)?讨论\s+(\d+)\s*(公开|私密)?\s*([\s\S]*)/);
    if (discussMatch) {
      return {
        cmd: 'discuss',
        messageId: parseInt(discussMatch[1], 10),
        visibility: discussMatch[2] === '私密' ? 'private' : 'public',
        title: (discussMatch[3] || '').trim()
      };
    }

    return null;
  }

  async findBinding(channelUserId) {
    const binding = await WecomUserBinding.findOne({
      where: { wecomUserId: channelUserId },
      include: [{ model: User, as: 'adminUser', attributes: ['id', 'name', 'role'] }]
    });
    if (!binding) return null;
    return {
      adminUserId: binding.adminUserId,
      adminName: binding.adminUser ? binding.adminUser.name : '管理员',
      adminRole: binding.adminUser ? binding.adminUser.role : 'admin'
    };
  }

  async handleBind(reqId, channelUserId, code) {
    const expectCode = this.bindCode;
    if (!expectCode) {
      this.channel.reply(reqId, '系统未配置绑定码，请联系管理员。');
      return;
    }
    if (code !== expectCode) {
      this.channel.reply(reqId, '绑定码错误。');
      return;
    }
    const adminUser = await User.findOne({ where: { role: 'super_admin' }, attributes: ['id', 'name'] });
    if (!adminUser) {
      this.channel.reply(reqId, '未找到管理员账号，请联系管理员。');
      return;
    }
    await WecomUserBinding.upsert({ wecomUserId: channelUserId, adminUserId: adminUser.id });
    this.channel.reply(reqId, `绑定成功，欢迎 ${adminUser.name}！现在可用「发帖」「回复」指令。`);
  }

  async handlePost(reqId, binding, parsed, images) {
    const content = (parsed.content || '').trim();
    if (!content || content.length > MAX_CONTENT_LENGTH) {
      this.channel.reply(reqId, `正文为空或超长（最多 ${MAX_CONTENT_LENGTH} 字）。`);
      return;
    }
    const title = (parsed.title || '').trim() || (content.length > 20 ? content.substring(0, 20) + '...' : content);
    const isPrivate = parsed.visibility === 'private';

    try {
      const message = await Message.create({
        title,
        content,
        type: 'daily',
        sender: binding.adminName,
        senderId: binding.adminUserId,
        groupId: isPrivate ? 'admin_only' : 'all',
        totalCount: 0,
        theme: 'default',
        status: 'published',
        images: images.length > 0 ? images : null
      });

      const link = `https://aity88.online/#/pages/message-detail/message-detail?id=${message.id}`;
      const scopeText = isPrivate ? '私密（仅发帖人+管理员）' : '公开（全员）';
      this.channel.reply(reqId, `✅ 已发布《${title}》\n范围：${scopeText} ｜ 类型：日常消息\n${link}`);
    } catch (err) {
      console.error('[botService] 发帖失败:', err.message);
      this.channel.reply(reqId, '发帖失败，请稍后重试。');
    }
  }

  async handleReply(reqId, binding, parsed, images) {
    const raw = parsed.raw;
    if (!raw) {
      this.channel.reply(reqId, '回复格式：回复 <帖子ID> [公开|私密] <内容>，例如「回复 1024 感谢反馈」');
      return;
    }

    const m = raw.match(/^(\d+)\s*(公开|私密)?\s*([\s\S]*)$/);
    if (!m) {
      this.channel.reply(reqId, '回复格式：回复 <帖子ID> [公开|私密] <内容>，例如「回复 1024 感谢反馈」');
      return;
    }

    const discussionId = parseInt(m[1], 10);
    const visibilityWord = m[2];
    const content = (m[3] || '').trim();

    if (!content || content.length > MAX_CONTENT_LENGTH) {
      this.channel.reply(reqId, `内容为空或超长（最多 ${MAX_CONTENT_LENGTH} 字）。`);
      return;
    }

    try {
      const discussion = await Discussion.findByPk(discussionId);
      if (!discussion) {
        this.channel.reply(reqId, `未找到帖子 ${discussionId}。`);
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

      if (isPrivate) {
        this.channel.reply(reqId, `✅ 已私密回复《${discussion.title}》（内容仅帖主与管理员可见）`);
      } else {
        this.channel.reply(reqId, `✅ 已回复《${discussion.title}》`);
      }
    } catch (err) {
      console.error('[botService] 回帖失败:', err.message);
      this.channel.reply(reqId, '回复失败，请稍后重试。');
    }
  }

  async handleCreateDiscussion(reqId, binding, parsed) {
    const messageId = parsed.messageId;
    const isPrivate = parsed.visibility === 'private';

    try {
      const message = await Message.findByPk(messageId);
      if (!message) {
        this.channel.reply(reqId, `未找到消息 ${messageId}（注意：只能对「消息中心」的消息创建讨论，讨论帖请用「回复」指令）。`);
        return;
      }

      const title = (parsed.title || '').trim() || message.title || `讨论：${message.title}`;

      const discussion = await Discussion.create({
        messageId,
        userId: binding.adminUserId,
        userName: binding.adminName,
        title,
        content: message.content || '',
        visibility: isPrivate ? 'private' : 'public',
        category: 'interaction',
        status: 'pending'
      });

      const link = `https://aity88.online/#/pages/discussion-detail/discussion-detail?id=${discussion.id}`;
      const scopeText = isPrivate ? '私密' : '公开';
      this.channel.reply(reqId, [
        `✅ 已为消息《${message.title}》创建讨论帖`,
        `标题：${title}`,
        `ID：${discussion.id} ｜ ${scopeText}`,
        `👉 回帖：@AITY回帖助手 回复 ${discussion.id} <内容>`,
        `👉 查看：${link}`
      ].join('\n'));
    } catch (err) {
      console.error('[botService] 创建讨论失败:', err.message);
      this.channel.reply(reqId, '创建讨论失败，请稍后重试。');
    }
  }

  helpText() {
    return [
      'AITY助手 使用说明：',
      '• 发帖 [公开|私密] 发布消息到消息中心（markdown 格式）',
      '  发帖 [公开|私密] # 标题',
      '  正文内容（支持 markdown 渲染）',
      '  例：发帖 # 今日盘前策略',
      '      今天关注xxx板块',
      '  私密=仅发帖人+管理员可见，缺省公开',
      '• 回复 <帖子ID> [公开|私密] <内容>  回复讨论帖',
      '  例：回复 95 感谢反馈',
      '• 讨论 <消息ID> [公开|私密] [标题]  把消息中心的消息转成讨论帖',
      '  例：讨论 235 公开',
      '  例：创建讨论 235 私密 讨论标题',
      '• 绑定 <绑定码>  绑定管理员身份',
      '• 帮助  查看本说明',
      '（发帖/回复带图：先发图片，再发指令）'
    ].join('\n');
  }
}

module.exports = BotService;
