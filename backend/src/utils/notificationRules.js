const {
  resolveRolesByMessageTags
} = require('./messageTagRules');

function isValidNotificationEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.endsWith('@users.aity.vip')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveTargetRoles(tags = [], options = {}) {
  return resolveRolesByMessageTags(tags, {
    includeAdmins: options.notifyAdmins === true
  });
}

module.exports = {
  isValidNotificationEmail,
  resolveTargetRoles
};
