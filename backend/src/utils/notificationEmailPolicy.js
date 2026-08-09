function getEmailCooldownMinutes() {
  const value = Number(process.env.MAIL_NOTIFY_COOLDOWN_MINUTES || 10);
  if (!Number.isFinite(value) || value < 0) return 10;
  return Math.floor(value);
}

function buildNotificationEmail() {
  const cooldownMinutes = getEmailCooldownMinutes();
  return {
    subject: 'AITY投研提醒：小程序有新的内容更新',
    content: [
      'AITY投研小程序有新的内容更新。',
      '',
      '请打开微信小程序查看最新内容。',
      '',
      `为减少打扰，系统已控制提醒频率，${cooldownMinutes}分钟内不会重复发送同类邮件提醒。`,
      '',
      '本邮件仅作更新提醒，不包含任何投资建议或具体投研内容，请勿直接回复。'
    ].join('\n')
  };
}

function buildCooldownStatus(lastSentAt, now = new Date()) {
  const cooldownMinutes = getEmailCooldownMinutes();
  if (!lastSentAt || cooldownMinutes <= 0) {
    return {
      cooldownMinutes,
      lastSentAt: lastSentAt ? new Date(lastSentAt).toISOString() : null,
      nextAvailableAt: null,
      remainingSeconds: 0,
      inCooldown: false
    };
  }

  const lastTime = new Date(lastSentAt);
  const nextAvailable = new Date(lastTime.getTime() + cooldownMinutes * 60 * 1000);
  const remainingSeconds = Math.max(0, Math.ceil((nextAvailable.getTime() - now.getTime()) / 1000));

  return {
    cooldownMinutes,
    lastSentAt: lastTime.toISOString(),
    nextAvailableAt: nextAvailable.toISOString(),
    remainingSeconds,
    inCooldown: remainingSeconds > 0
  };
}

module.exports = {
  getEmailCooldownMinutes,
  buildNotificationEmail,
  buildCooldownStatus
};
