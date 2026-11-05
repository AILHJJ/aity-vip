const assert = require('assert');
const {
  detectDiscussionImageType,
  canAttachDiscussionImage,
  createImageSignature,
  verifyImageSignature
} = require('../src/utils/discussionImagePolicy');

const now = 1_800_000_000;
const key = 'test-signing-key-that-is-long-enough';
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

assert.deepStrictEqual(detectDiscussionImageType(jpeg), { extension: '.jpg', mimeType: 'image/jpeg' });
assert.strictEqual(detectDiscussionImageType(Buffer.from('<script>alert(1)</script>')), null);
assert.strictEqual(detectDiscussionImageType(Buffer.from('GIF89a')), null, 'truncated image signatures are rejected');

assert.strictEqual(
  canAttachDiscussionImage({ image: { userId: 12, discussionId: null }, currentUserId: 12 }),
  true
);
assert.strictEqual(
  canAttachDiscussionImage({ image: { userId: 13, discussionId: null }, currentUserId: 12 }),
  false,
  'another users pending image cannot be attached'
);
assert.strictEqual(
  canAttachDiscussionImage({ image: { userId: 12, discussionId: 9 }, currentUserId: 12 }),
  false,
  'an already attached image cannot be reused'
);

const signature = createImageSignature({ discussionId: 9, imageId: 4, expiresAt: now + 600, key });
assert.strictEqual(verifyImageSignature({ discussionId: 9, imageId: 4, expiresAt: now + 600, signature, key, now }), true);
assert.strictEqual(verifyImageSignature({ discussionId: 10, imageId: 4, expiresAt: now + 600, signature, key, now }), false);
assert.strictEqual(verifyImageSignature({ discussionId: 9, imageId: 4, expiresAt: now, signature, key, now }), false);

console.log('discussionImagePolicy unit tests passed');
