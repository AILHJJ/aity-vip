const ADMIN_ROLES = new Set(['admin', 'super_admin']);

function isAdminRole(role) {
  return ADMIN_ROLES.has(role);
}

function getBusinessTimezoneOffsetMinutes() {
  const value = Number(process.env.BUSINESS_TIMEZONE_OFFSET_MINUTES || 480);
  return Number.isFinite(value) ? Math.floor(value) : 480;
}

function toDateKey(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  // DATE 字段通常由 MySQL 以 UTC 零点映射为 Date，使用 UTC 日期避免跨时区前移一天。
  return date.toISOString().slice(0, 10);
}

function getBusinessDateKey(now = new Date()) {
  const businessTime = new Date(
    now.getTime() + getBusinessTimezoneOffsetMinutes() * 60 * 1000
  );
  return businessTime.toISOString().slice(0, 10);
}

function isUserExpired(user, now = new Date()) {
  if (!user || isAdminRole(user.role)) return false;

  const expireDateKey = toDateKey(user.expireDate || user.expire_date || user.expiresAt);
  if (!expireDateKey) return false;

  return expireDateKey < getBusinessDateKey(now);
}

function getUserAccessStatus(user, now = new Date()) {
  const expired = isUserExpired(user, now);
  if (expired) {
    return {
      active: false,
      expired: true,
      reason: 'expired'
    };
  }

  if (!user || user.status !== 'active') {
    return {
      active: false,
      expired: false,
      reason: 'inactive'
    };
  }

  return {
    active: true,
    expired: false,
    reason: null
  };
}

function resolvePersistedStatus(user, now = new Date()) {
  return isUserExpired(user, now) ? 'inactive' : user?.status || 'inactive';
}

async function syncUserExpiryStatus(user, now = new Date()) {
  if (!user || !isUserExpired(user, now) || user.status !== 'active') {
    return {
      user,
      changed: false,
      access: getUserAccessStatus(user, now)
    };
  }

  await user.update({ status: 'inactive' });
  return {
    user,
    changed: true,
    access: getUserAccessStatus(user, now)
  };
}

module.exports = {
  isAdminRole,
  toDateKey,
  getBusinessDateKey,
  isUserExpired,
  getUserAccessStatus,
  resolvePersistedStatus,
  syncUserExpiryStatus
};
