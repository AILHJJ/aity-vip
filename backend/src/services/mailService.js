const nodemailer = require('nodemailer');
const { isValidNotificationEmail } = require('../utils/notificationRules');

let transporter;

function isMailEnabled() {
  return process.env.MAIL_ENABLED === 'true';
}

function isDryRun() {
  return process.env.MAIL_DRY_RUN !== 'false';
}

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

function buildFromAddress() {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const name = process.env.MAIL_FROM_NAME || 'AITY投研提醒';
  return name ? `"${name}" <${from}>` : from;
}

async function sendEmail({ to, subject, text }) {
  if (!isValidNotificationEmail(to)) {
    return { skipped: true, reason: 'invalid_recipient' };
  }

  if (isDryRun()) {
    return { dryRun: true, reason: 'MAIL_DRY_RUN is enabled' };
  }

  if (!isMailEnabled()) {
    return { skipped: true, reason: 'MAIL_ENABLED is not true' };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_USER or SMTP_PASS is not configured');
  }

  const result = await getTransporter().sendMail({
    from: buildFromAddress(),
    to,
    subject,
    text
  });

  return { sent: true, messageId: result.messageId };
}

module.exports = {
  isMailEnabled,
  isDryRun,
  sendEmail
};
