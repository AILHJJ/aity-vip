const ROLE_BY_TAG = {
  short_term: 'vip_short',
  mid_term: 'vip_mid'
};

function isValidNotificationEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.endsWith('@users.aity.vip')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveTargetRoles(tags = [], options = {}) {
  const normalizedTags = Array.isArray(tags) ? tags : [];

  if (normalizedTags.includes('all_users')) {
    const roles = ['vip_short', 'vip_mid', 'trial'];
    if (options.notifyAdmins === true) {
      roles.push('admin', 'super_admin');
    }
    return roles;
  }

  const roles = normalizedTags
    .map(tag => ROLE_BY_TAG[tag])
    .filter(Boolean);

  return [...new Set(roles)];
}

module.exports = {
  isValidNotificationEmail,
  resolveTargetRoles
};
