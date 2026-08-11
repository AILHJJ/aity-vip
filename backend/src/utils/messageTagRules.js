const SHORT_TERM_TAG = 'short_term';
const MID_TERM_TAG = 'mid_term';
const ALL_USERS_TAG = 'all_users';

const ALL_ACTIVE_MEMBER_ROLES = ['vip_short', 'vip_mid', 'trial'];
const ADMIN_ROLES = ['admin', 'super_admin'];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeMessageTags(tags = []) {
  const normalizedTags = Array.isArray(tags) ? unique(tags) : [];

  // 产品规则：中线机会面向全部普通用户，避免只传 mid_term 时短线用户收不到/看不到。
  if (normalizedTags.includes(MID_TERM_TAG) && !normalizedTags.includes(ALL_USERS_TAG)) {
    normalizedTags.push(ALL_USERS_TAG);
  }

  return normalizedTags;
}

function resolveRolesByMessageTags(tags = [], options = {}) {
  const normalizedTags = normalizeMessageTags(tags);

  if (normalizedTags.includes(ALL_USERS_TAG)) {
    const roles = [...ALL_ACTIVE_MEMBER_ROLES];
    if (options.includeAdmins === true) {
      roles.push(...ADMIN_ROLES);
    }
    return roles;
  }

  const roles = [];
  if (normalizedTags.includes(SHORT_TERM_TAG)) roles.push('vip_short');
  if (normalizedTags.includes(MID_TERM_TAG)) roles.push(...ALL_ACTIVE_MEMBER_ROLES);

  return unique(roles);
}

function getVisibleTagsForRole(role) {
  if (role === 'vip_mid') return [MID_TERM_TAG, ALL_USERS_TAG];
  if (role === 'vip_short') return [SHORT_TERM_TAG, MID_TERM_TAG, ALL_USERS_TAG];
  return [];
}

module.exports = {
  SHORT_TERM_TAG,
  MID_TERM_TAG,
  ALL_USERS_TAG,
  ALL_ACTIVE_MEMBER_ROLES,
  ADMIN_ROLES,
  normalizeMessageTags,
  resolveRolesByMessageTags,
  getVisibleTagsForRole
};
