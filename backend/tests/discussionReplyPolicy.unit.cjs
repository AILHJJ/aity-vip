const assert = require('assert');

const {
  canViewPrivateReply,
  resolveReplyPrivacy
} = require('../src/utils/discussionReplyPolicy');

assert.strictEqual(
  resolveReplyPrivacy({ isAdmin: true, requestedIsPrivate: false }),
  0,
  '管理员默认公开回复'
);

assert.strictEqual(
  resolveReplyPrivacy({ isAdmin: true, requestedIsPrivate: true }),
  1,
  '管理员选择私密时发送私密回复'
);

assert.strictEqual(
  resolveReplyPrivacy({ isAdmin: false, requestedIsPrivate: false }),
  1,
  '普通用户默认私密回复'
);

assert.strictEqual(
  resolveReplyPrivacy({ isAdmin: false, requestedIsPrivate: true }),
  1,
  '普通用户即使传入公开参数也保持私密回复'
);

const discussion = { userId: 10 };
const reply = { userId: 20 };

assert.strictEqual(
  canViewPrivateReply({ isAdmin: true, discussion, reply, currentUserId: 30 }),
  true,
  '管理员可见私密回复'
);

assert.strictEqual(
  canViewPrivateReply({ isAdmin: false, discussion, reply, currentUserId: 10 }),
  true,
  '讨论发起人可见私密回复'
);

assert.strictEqual(
  canViewPrivateReply({ isAdmin: false, discussion, reply, currentUserId: 20 }),
  true,
  '回复者本人可见私密回复'
);

assert.strictEqual(
  canViewPrivateReply({ isAdmin: false, discussion, reply, currentUserId: 30 }),
  false,
  '其他用户不可见私密回复'
);

console.log('discussionReplyPolicy unit tests passed');
