const {
  isValidNotificationEmail,
  resolveTargetRoles
} = require('../src/utils/notificationRules');

describe('notification rules', () => {
  test('resolves target roles from message tags', () => {
    expect(resolveTargetRoles(['short_term'])).toEqual(['vip_short']);
    expect(resolveTargetRoles(['mid_term'])).toEqual(['vip_mid']);
    expect(resolveTargetRoles(['short_term', 'mid_term'])).toEqual(['vip_short', 'vip_mid']);
    expect(resolveTargetRoles(['all_users'])).toEqual(['vip_short', 'vip_mid', 'trial']);
    expect(resolveTargetRoles(['all_users'], { notifyAdmins: true })).toEqual([
      'vip_short',
      'vip_mid',
      'trial',
      'admin',
      'super_admin'
    ]);
  });

  test('filters placeholder and invalid emails', () => {
    expect(isValidNotificationEmail('user@example.com')).toBe(true);
    expect(isValidNotificationEmail('name@users.aity.vip')).toBe(false);
    expect(isValidNotificationEmail('bad-email')).toBe(false);
    expect(isValidNotificationEmail('')).toBe(false);
    expect(isValidNotificationEmail(null)).toBe(false);
  });
});
