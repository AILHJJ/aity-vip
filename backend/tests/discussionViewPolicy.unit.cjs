const assert = require('assert');
const {
  canCountDiscussionViewer,
  canRevealDiscussionViews,
  canReadDiscussion,
  countUniqueDiscussionViewers
} = require('../src/utils/discussionViewPolicy');

assert.strictEqual(canCountDiscussionViewer({ userId: 2, role: 'user' }, { userId: 1 }), true);
assert.strictEqual(canCountDiscussionViewer({ userId: 1, role: 'user' }, { userId: 1 }), false, 'the author is not a reader');
assert.strictEqual(canCountDiscussionViewer({ userId: 3, role: 'admin' }, { userId: 1 }), false, 'admin traffic is excluded');
assert.strictEqual(canCountDiscussionViewer({ userId: 4, role: 'super_admin' }, { userId: 1 }), false);
assert.strictEqual(canRevealDiscussionViews('admin'), true);
assert.strictEqual(canRevealDiscussionViews('super_admin'), true);
assert.strictEqual(canRevealDiscussionViews('vip_mid'), false);
assert.strictEqual(canReadDiscussion({ discussion: { visibility: 'public', userId: 1 }, currentUserId: 2, currentUserRole: 'vip_mid' }), true);
assert.strictEqual(canReadDiscussion({ discussion: { visibility: 'private', userId: 1 }, currentUserId: 2, currentUserRole: 'vip_mid' }), false);
assert.strictEqual(canReadDiscussion({ discussion: { visibility: 'private', userId: 1 }, currentUserId: 1, currentUserRole: 'vip_mid' }), true);
assert.strictEqual(canReadDiscussion({ discussion: { visibility: 'private', userId: 1 }, currentUserId: 2, currentUserRole: 'admin' }), true);
assert.strictEqual(
  countUniqueDiscussionViewers([
    { userId: 2, role: 'user' },
    { userId: 2, role: 'user' },
    { userId: 1, role: 'user' },
    { userId: 3, role: 'admin' }
  ], { userId: 1 }),
  1
);

console.log('discussionViewPolicy unit tests passed');
