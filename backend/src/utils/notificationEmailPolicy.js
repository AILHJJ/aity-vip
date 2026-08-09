function getEmailCooldownMinutes() {
  const value = Number(process.env.MAIL_NOTIFY_COOLDOWN_MINUTES || 10);
  if (!Number.isFinite(value) || value < 0) return 10;
  return Math.floor(value);
}

function getBusinessTimezoneOffsetMinutes() {
  const value = Number(process.env.BUSINESS_TIMEZONE_OFFSET_MINUTES || 480);
  if (!Number.isFinite(value)) return 480;
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
  const normalizedLastSentAt = normalizeNotificationTime(lastSentAt, now);
  if (!normalizedLastSentAt || cooldownMinutes <= 0) {
    return {
      cooldownMinutes,
      lastSentAt: normalizedLastSentAt ? normalizedLastSentAt.toISOString() : null,
      nextAvailableAt: null,
      remainingSeconds: 0,
      inCooldown: false
    };
  }

  const lastTime = normalizedLastSentAt;
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

function normalizeNotificationTime(value, now = new Date()) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const futureMs = parsed.getTime() - now.getTime();
  if (futureMs <= 60 * 1000) {
    return parsed;
  }

  const offsetMs = getBusinessTimezoneOffsetMinutes() * 60 * 1000;
  const adjusted = new Date(parsed.getTime() - offsetMs);

  if (adjusted.getTime() <= now.getTime() + 60 * 1000) {
    return adjusted;
  }

  return parsed;
}

module.exports = {
  getEmailCooldownMinutes,
  getBusinessTimezoneOffsetMinutes,
  buildNotificationEmail,
  buildCooldownStatus,
  normalizeNotificationTime
};
