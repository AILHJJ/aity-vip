const NotificationOutbox = require('../models/NotificationOutbox');
const User = require('../models/User');
const { getEmailTargetsByTags } = require('./notificationTargetService');
const { sendEmail } = require('./mailService');
const { isValidNotificationEmail } = require('../utils/notificationRules');
const { Op } = require('sequelize');
const {
  buildNotificationEmail,
  buildReplyNotificationEmail,
  buildCooldownStatus
} = require('../utils/notificationEmailPolicy');
const {
  selectLatestEmailNotification
} = require('../utils/notificationOutboxPolicy');

let tableReadyPromise;

function ensureOutboxTable() {
  if (process.env.NOTIFICATION_OUTBOX_AUTO_SYNC === 'false') {
    return Promise.resolve();
  }

  if (!tableReadyPromise) {
    tableReadyPromise = NotificationOutbox.sync();
  }

  return tableReadyPromise;
}

async function getLastEmailNotification() {
  await ensureOutboxTable();

  const rows = await NotificationOutbox.findAll({
    where: {
      channel: 'email',
      status: { [Op.in]: ['sent', 'dry_run'] },
      sentAt: { [Op.ne]: null }
    },
    order: [['id', 'DESC']],
    limit: 1000
  });

  return selectLatestEmailNotification(rows);
}

async function getEmailNotificationStatus(now = new Date()) {
  const row = await getLastEmailNotification();
  const status = buildCooldownStatus(row?.sentAt, now);

  return {
    ...status,
    lastStatus: row?.status || null,
    lastRecipient: row?.recipient || null
  };
}

async function queueMessageEmailNotifications({ message, tags, senderId, force = false }) {
  await ensureOutboxTable();

  const emailStatus = await getEmailNotificationStatus();
  if (emailStatus.inCooldown && force !== true) {
    return {
      queued: 0,
      targets: 0,
      skipped: true,
      reason: 'cooldown',
      cooldown: emailStatus
    };
  }

  const targets = await getEmailTargetsByTags(tags, senderId);
  if (targets.length === 0) {
    return { queued: 0, targets: 0, cooldown: emailStatus };
  }

  const email = buildNotificationEmail(message.id);

  const rows = targets.map(target => ({
    messageId: message.id,
    userId: target.userId,
    channel: 'email',
    recipient: target.email,
    subject: email.subject,
    content: email.content,
    status: 'pending'
  }));

  await NotificationOutbox.bulkCreate(rows);
  return { queued: rows.length, targets: targets.length, cooldown: emailStatus, forced: force === true };
}

// 回帖邮件冷却（按讨论帖维度，内存 Map，零 DB 复杂度）
const replyEmailCooldownMap = new Map();
const REPLY_EMAIL_COOLDOWN_MS = 10 * 60 * 1000;

function isReplyEmailInCooldown(discussionId, now = Date.now()) {
  const last = replyEmailCooldownMap.get(discussionId);
  if (last && now - last < REPLY_EMAIL_COOLDOWN_MS) return true;
  replyEmailCooldownMap.set(discussionId, now);
  return false;
}

// 管理员回帖后，邮件通知发帖人（一对一，脱敏，按帖 10 分钟冷却）
async function queueReplyEmailNotification({ discussion, reply, force = false }) {
  const authorId = discussion && discussion.userId;
  if (!authorId || authorId === (reply && reply.userId)) {
    return { sent: 0, skipped: true, reason: 'self-reply-or-no-author' };
  }

  if (isReplyEmailInCooldown(discussion.id) && force !== true) {
    return { sent: 0, skipped: true, reason: 'cooldown' };
  }

  const author = await User.findByPk(authorId, { attributes: ['id', 'name', 'email'] });
  if (!author || !isValidNotificationEmail(author.email)) {
    return { sent: 0, skipped: true, reason: 'no-valid-email' };
  }

  const email = buildReplyNotificationEmail(discussion.id);
  try {
    const result = await sendEmail({ to: author.email, subject: email.subject, text: email.content });
    if (result.dryRun) return { sent: 0, skipped: true, reason: 'dry_run' };
    if (result.skipped) return { sent: 0, skipped: true, reason: result.reason || 'skipped' };
    return { sent: 1, skipped: false, recipient: author.email };
  } catch (error) {
    console.error('[回帖邮件通知] 发送失败:', error.message);
    return { sent: 0, skipped: false, error: error.message };
  }
}

async function processPendingEmailOutbox(limit = 20) {
  await ensureOutboxTable();

  const rows = await NotificationOutbox.findAll({
    where: { channel: 'email', status: 'pending' },
    limit,
    order: [['created_at', 'ASC']]
  });

  const results = [];

  for (const row of rows) {
    await row.update({ status: 'sending' });

    try {
      const result = await sendEmail({
        to: row.recipient,
        subject: row.subject,
        text: row.content
      });

      if (result.dryRun) {
        await row.update({
          status: 'dry_run',
          lastError: result.reason,
          sentAt: new Date()
        });
      } else if (result.skipped) {
        await row.update({
          status: 'skipped',
          lastError: result.reason
        });
      } else {
        await row.update({
          status: 'sent',
          lastError: null,
          sentAt: new Date()
        });
      }

      results.push({ id: row.id, ok: true });
    } catch (error) {
      const nextRetryCount = row.retryCount + 1;
      const finalStatus = nextRetryCount >= row.maxRetries ? 'failed' : 'pending';
      await row.update({
        status: finalStatus,
        retryCount: nextRetryCount,
        lastError: error.message
      });
      results.push({ id: row.id, ok: false, error: error.message });
    }
  }

  return results;
}

function processPendingEmailOutboxInBackground() {
  setImmediate(() => {
    processPendingEmailOutbox().catch(error => {
      console.error('[邮件推送] 处理 outbox 失败:', error);
    });
  });
}

module.exports = {
  buildNotificationEmail,
  getEmailNotificationStatus,
  queueMessageEmailNotifications,
  queueReplyEmailNotification,
  processPendingEmailOutbox,
  processPendingEmailOutboxInBackground
};
