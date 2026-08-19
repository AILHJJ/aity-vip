const assert = require('assert');

const {
  isAdminRole,
  isUserExpired,
  getUserAccessStatus,
  resolvePersistedStatus
} = require('../src/utils/userAccessPolicy');

const beforeExpiry = new Date('2026-08-19T08:00:00.000Z');
const afterExpiry = new Date('2026-08-20T08:00:00.000Z');

assert.strictEqual(isAdminRole('admin'), true);
assert.strictEqual(isAdminRole('super_admin'), true);
assert.strictEqual(isAdminRole('vip_mid'), false);

assert.strictEqual(
  isUserExpired(
    { role: 'vip_mid', expireDate: '2026-08-19' },
    beforeExpiry
  ),
  false
);
assert.strictEqual(
  isUserExpired(
    { role: 'vip_mid', expireDate: '2026-08-19' },
    afterExpiry
  ),
  true
);
assert.strictEqual(
  isUserExpired(
    { role: 'admin', expireDate: '2020-01-01' },
    afterExpiry
  ),
  false
);
assert.strictEqual(
  isUserExpired(
    { role: 'vip_short', expireDate: null },
    afterExpiry
  ),
  false
);

assert.deepStrictEqual(
  getUserAccessStatus(
    { role: 'vip_mid', status: 'active', expireDate: '2026-08-19' },
    afterExpiry
  ),
  {
    active: false,
    expired: true,
    reason: 'expired'
  }
);
assert.deepStrictEqual(
  getUserAccessStatus(
    { role: 'vip_mid', status: 'inactive', expireDate: '2026-12-31' },
    afterExpiry
  ),
  {
    active: false,
    expired: false,
    reason: 'inactive'
  }
);
assert.deepStrictEqual(
  getUserAccessStatus(
    { role: 'admin', status: 'active', expireDate: '2020-01-01' },
    afterExpiry
  ),
  {
    active: true,
    expired: false,
    reason: null
  }
);
assert.strictEqual(
  resolvePersistedStatus(
    { role: 'vip_mid', status: 'active', expireDate: '2026-08-18' },
    afterExpiry
  ),
  'inactive'
);
assert.strictEqual(
  resolvePersistedStatus(
    { role: 'vip_mid', status: 'inactive', expireDate: '2026-12-31' },
    afterExpiry
  ),
  'inactive'
);
assert.strictEqual(
  resolvePersistedStatus(
    { role: 'vip_mid', status: 'active', expireDate: '2026-12-31' },
    afterExpiry
  ),
  'active'
);

console.log('userAccessPolicy unit tests passed');
