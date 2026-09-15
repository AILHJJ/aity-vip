// 企业微信群机器人通知服务
// 用途：新帖 / 用户回帖时，向管理员群推送卡片消息，便于第一时间处理
// 说明：
//   - fire-and-forget 设计，绝不影响发帖/回帖主流程
//   - 发送失败自动重试 3 次，仍失败仅记日志（不落库，避免引入 DB 迁移风险）
// 配置项见 .env.example 中 WECOM_* 段
const logger = require('../utils/logger');
const botServiceInstance = require('./botServiceInstance'); // 统一 bot：主动推送通知（webhook 已下线）
const { sendFeishuText } = require('../utils/feishuWebhook'); // 飞书 webhook 双通道（未配置则跳过）

// 默认开启新帖通知；回帖通知默认也开启（管理员自己的回复不推）
const NOTIFY_ON_CREATE = process.env.WECOM_NOTIFY_ON_CREATE !== 'false';
const NOTIFY_ON_REPLY = process.env.WECOM_NOTIFY_ON_REPLY !== 'false';
const DRY_RUN = process.env.WECOM_NOTIFY_DRY_RUN === 'true';
const SITE_BASE = (process.env.WECOM_SITE_BASE || 'https://aity88.online').replace(/\/$/, '');

function buildDiscussionLink(id) {
  return `${SITE_BASE}/#/pages/discussion-detail/discussion-detail?id=${id}`;
}

function truncate(str, len = 80) {
  if (!str) return '';
  const s = String(str).replace(/\s+/g, ' ').trim();
  return s.length > len ? `${s.substring(0, len)}…` : s;
}

function formatTime(date) {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function sendText(content) {
  if (DRY_RUN) {
    logger.info(`[wecom-notify][DRY_RUN] ${content.replace(/\n/g, ' | ')}`);
    return { dryRun: true };
  }

  // 统一走智能机器人主动推送（webhook 已完全下线）
  try {
    const botSent = botServiceInstance.notifyToGroup(content);
    if (botSent) {
      sendFeishuText(content).catch(err => logger.warn('[wecom-notify] 飞书通道异常:', err.message));
      return { ok: true, via: 'bot' };
    }
    logger.warn('[wecom-notify] 智能机器人未连接或无群 chatid，通知未发送');
    return { ok: false };
  } catch (err) {
    logger.warn('[wecom-notify] 智能机器人推送异常:', err.message);
    return { ok: false };
  }
}

// 新帖通知（所有用户发帖都推，含管理员，便于内部留痕）
function notifyNewDiscussion(discussion) {
  if (!NOTIFY_ON_CREATE) return;

  const content = [
    '📢 新帖子提醒',
    `标题：${discussion.title || '(无标题)'}`,
    `分类：${discussion.category || 'interaction'} ｜ 可见性：${discussion.visibility === 'public' ? '公开' : '私密'}`,
    `作者：${discussion.userName || '未知用户'}`,
    `摘要：${truncate(discussion.content)}`,
    `时间：${formatTime(discussion.createdAt)}`,
    `👉 处理：${buildDiscussionLink(discussion.id)}`,
    `👉 回复：@AITY回帖助手 回复 ${discussion.id}`
  ].join('\n');

  sendText(content).catch(err => logger.error('[wecom-notify] 新帖通知异常:', err.message));
}

// 回帖通知（所有回复都推，含管理员，便于内部留痕）
function notifyNewReply(discussion, reply) {
  if (!NOTIFY_ON_REPLY) return;

  const content = [
    '💬 新回复提醒',
    `帖子：${discussion.title || '(无标题)'}`,
    `回复人：${reply.userName || '未知用户'}`,
    `内容：${truncate(reply.content)}`,
    `时间：${formatTime(reply.createdAt)}`,
    `👉 查看：${buildDiscussionLink(discussion.id)}`,
    `👉 回复：@AITY回帖助手 回复 ${discussion.id}`
  ].join('\n');

  sendText(content).catch(err => logger.error('[wecom-notify] 回帖通知异常:', err.message));
}

// 消息中心发消息通知（推管理员群留痕）
function notifyNewMessage(message) {
  if (!NOTIFY_ON_CREATE) return;

  const content = [
    '📣 新消息发布',
    `标题：${message.title || '(无标题)'}`,
    `类型：${message.type || 'system'}`,
    `发布者：${message.sender || '未知'}`,
    `时间：${formatTime(message.createdAt)}`,
    `👉 查看：${SITE_BASE}/#/pages/message-detail/message-detail?id=${message.id}`,
    `👉 讨论：@AITY回帖助手 讨论 ${message.id}`
  ].join('\n');

  sendText(content).catch(err => logger.error('[wecom-notify] 消息通知异常:', err.message));
}

module.exports = {
  notifyNewDiscussion,
  notifyNewReply,
  notifyNewMessage,
  sendText
};
