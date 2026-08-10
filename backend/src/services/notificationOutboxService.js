const NotificationOutbox = require('../models/NotificationOutbox');
const { getEmailTargetsByTags } = require('./notificationTargetService');
const { sendEmail } = require('./mailService');
const { Op } = require('sequelize');
const {
  buildNotificationEmail,
  buildCooldownStatus
} = require('../utils/notificationEmailPolicy');
const {
  getLastEmailNotificationOrder
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

  const row = await NotificationOutbox.findOne({
    where: {
      channel: 'email',
      status: { [Op.in]: ['sent', 'dry_run'] },
      sentAt: { [Op.ne]: null }
    },
    order: getLastEmailNotificationOrder()
  });

  return row;
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

  const email = buildNotificationEmail();

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
  processPendingEmailOutbox,
  processPendingEmailOutboxInBackground
};
