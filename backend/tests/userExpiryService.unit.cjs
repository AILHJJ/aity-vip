const assert = require('assert');

const {
  isAdminRole,
  isUserExpired
} = require('../src/utils/userAccessPolicy');

assert.strictEqual(isAdminRole('admin'), true);
assert.strictEqual(isAdminRole('super_admin'), true);
assert.strictEqual(isUserExpired({
  role: 'vip_short',
  expireDate: '2026-08-18'
}, new Date('2026-08-19T08:00:00.000Z')), true);
assert.strictEqual(isUserExpired({
  role: 'vip_short',
  expireDate: '2026-08-19'
}, new Date('2026-08-19T08:00:00.000Z')), false);

console.log('userExpiryService unit tests passed');
