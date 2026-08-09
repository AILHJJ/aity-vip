const NotificationOutbox = require('../models/NotificationOutbox');
const { getEmailTargetsByTags } = require('./notificationTargetService');
const { sendEmail } = require('./mailService');

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

function buildMessageEmail({ title, content }) {
  const textContent = String(content || '').replace(/\s+/g, ' ').trim();
  const summary = textContent.length > 120 ? `${textContent.slice(0, 120)}...` : textContent;

  return {
    subject: `AITY投研提醒：${title}`,
    content: [
      '有新的投研消息，请打开小程序查看。',
      '',
      `标题：${title}`,
      summary ? `摘要：${summary}` : '',
      '',
      '本邮件为系统提醒，请勿直接回复。'
    ].filter(Boolean).join('\n')
  };
}

async function queueMessageEmailNotifications({ message, tags, senderId }) {
  await ensureOutboxTable();

  const targets = await getEmailTargetsByTags(tags, senderId);
  if (targets.length === 0) {
    return { queued: 0, targets: 0 };
  }

  const email = buildMessageEmail({
    title: message.title,
    content: message.content
  });

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
  return { queued: rows.length, targets: targets.length };
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
  buildMessageEmail,
  queueMessageEmailNotifications,
  processPendingEmailOutbox,
  processPendingEmailOutboxInBackground
};
