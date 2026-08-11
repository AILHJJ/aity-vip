const assert = require('assert');

const {
  normalizeMessageTags,
  resolveRolesByMessageTags,
  getVisibleTagsForRole
} = require('../src/utils/messageTagRules');
const {
  isValidNotificationEmail,
  resolveTargetRoles
} = require('../src/utils/notificationRules');

assert.deepStrictEqual(normalizeMessageTags(['short_term']), ['short_term']);
assert.deepStrictEqual(normalizeMessageTags(['mid_term']), ['mid_term', 'all_users']);
assert.deepStrictEqual(normalizeMessageTags(['mid_term', 'all_users']), ['mid_term', 'all_users']);
assert.deepStrictEqual(normalizeMessageTags(['short_term', 'mid_term']), ['short_term', 'mid_term', 'all_users']);
assert.deepStrictEqual(normalizeMessageTags(null), []);

assert.deepStrictEqual(resolveTargetRoles(['short_term']), ['vip_short']);
assert.deepStrictEqual(resolveTargetRoles(['mid_term']), ['vip_short', 'vip_mid', 'trial']);
assert.deepStrictEqual(resolveTargetRoles(['short_term', 'mid_term']), ['vip_short', 'vip_mid', 'trial']);
assert.deepStrictEqual(resolveTargetRoles(['all_users']), ['vip_short', 'vip_mid', 'trial']);
assert.deepStrictEqual(resolveTargetRoles(['mid_term'], { notifyAdmins: true }), [
  'vip_short',
  'vip_mid',
  'trial',
  'admin',
  'super_admin'
]);

assert.deepStrictEqual(resolveRolesByMessageTags(['mid_term']), ['vip_short', 'vip_mid', 'trial']);
assert.deepStrictEqual(getVisibleTagsForRole('vip_short'), ['short_term', 'mid_term', 'all_users']);
assert.deepStrictEqual(getVisibleTagsForRole('vip_mid'), ['mid_term', 'all_users']);
assert.deepStrictEqual(getVisibleTagsForRole('trial'), []);

assert.strictEqual(isValidNotificationEmail('user@example.com'), true);
assert.strictEqual(isValidNotificationEmail('name@users.aity.vip'), false);
assert.strictEqual(isValidNotificationEmail('bad-email'), false);

console.log('notificationRules unit tests passed');
