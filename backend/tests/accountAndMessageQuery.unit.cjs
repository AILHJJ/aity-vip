const assert = require('assert');

const {
  buildVisibleMessageWhere,
  normalizeReadStatus
} = require('../src/utils/messageQueryOptions');
const {
  normalizeAccountEmail,
  validateAccountEmail
} = require('../src/utils/accountEmail');
const {
  buildNotificationEmail,
  buildCooldownStatus,
  normalizeNotificationTime
} = require('../src/utils/notificationEmailPolicy');

const fakeOp = {
  or: Symbol.for('or'),
  and: Symbol.for('and'),
  is: Symbol.for('is'),
  lte: Symbol.for('lte'),
  ne: Symbol.for('ne'),
  in: Symbol.for('in'),
  notIn: Symbol.for('notIn')
};

const fakeSequelize = {
  col: (name) => ({ col: name }),
  fn: (name, column, value) => ({ fn: name, column, value }),
  where: (left, right) => ({ left, right })
};

assert.strictEqual(normalizeReadStatus('unread'), 'unread');
assert.strictEqual(normalizeReadStatus('read'), 'read');
assert.strictEqual(normalizeReadStatus('all'), '');

const unreadWhere = buildVisibleMessageWhere({
  user: { id: 7, role: 'vip_short' },
  query: { readStatus: 'unread', tag: 'short_term' },
  readMessageIds: [10, 11],
  sequelize: fakeSequelize,
  Op: fakeOp
});

assert.deepStrictEqual(unreadWhere.id, { [fakeOp.notIn]: [10, 11] });
assert.ok(unreadWhere[fakeOp.and].length >= 2);
assert.ok(
  unreadWhere[fakeOp.and].some(condition =>
    Array.isArray(condition[fakeOp.or]) &&
    condition[fakeOp.or].some(item => item.senderId && item.senderId[fakeOp.ne] === 7)
  )
);
assert.ok(
  unreadWhere[fakeOp.and].some(condition =>
    condition.left?.fn === 'JSON_CONTAINS' && condition.left?.value === JSON.stringify('short_term')
  )
);

const readWhere = buildVisibleMessageWhere({
  user: { id: 7, role: 'vip_short' },
  query: { readStatus: 'read' },
  readMessageIds: [10, 11],
  sequelize: fakeSequelize,
  Op: fakeOp
});

assert.deepStrictEqual(readWhere.id, { [fakeOp.in]: [10, 11] });

assert.strictEqual(normalizeAccountEmail('  USER@Example.COM  '), 'user@example.com');
assert.deepStrictEqual(validateAccountEmail('user@example.com'), { valid: true, email: 'user@example.com' });
assert.strictEqual(validateAccountEmail('bad-email').valid, false);
assert.strictEqual(validateAccountEmail('demo@users.aity.vip').valid, false);

const email = buildNotificationEmail();
assert.strictEqual(email.subject.includes('小程序有新的内容更新'), true);
assert.strictEqual(email.content.includes('请打开微信小程序查看最新内容'), true);
assert.strictEqual(email.content.includes('投资建议'), true);
assert.strictEqual(email.content.includes('10分钟内不会重复发送'), true);
assert.strictEqual(email.content.includes('邮件测试'), false);

process.env.MAIL_NOTIFY_COOLDOWN_MINUTES = '10';
const cooldownStatus = buildCooldownStatus(
  '2026-08-09T10:00:00.000Z',
  new Date('2026-08-09T10:05:30.000Z')
);
assert.strictEqual(cooldownStatus.inCooldown, true);
assert.strictEqual(cooldownStatus.remainingSeconds, 270);

process.env.BUSINESS_TIMEZONE_OFFSET_MINUTES = '480';
const normalizedFutureMysqlDate = normalizeNotificationTime(
  new Date('2026-08-09T23:30:49.000Z'),
  new Date('2026-08-09T16:03:25.000Z')
);
assert.strictEqual(normalizedFutureMysqlDate.toISOString(), '2026-08-09T15:30:49.000Z');

const timezoneCooldownStatus = buildCooldownStatus(
  new Date('2026-08-09T23:30:49.000Z'),
  new Date('2026-08-09T16:03:25.000Z')
);
assert.strictEqual(timezoneCooldownStatus.inCooldown, false);

console.log('accountAndMessageQuery unit tests passed');
