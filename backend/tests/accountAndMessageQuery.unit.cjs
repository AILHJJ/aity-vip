const assert = require('assert');

const {
  buildVisibleMessageWhere,
  normalizeReadStatus
} = require('../src/utils/messageQueryOptions');
const {
  normalizeAccountEmail,
  validateAccountEmail
} = require('../src/utils/accountEmail');

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

console.log('accountAndMessageQuery unit tests passed');
