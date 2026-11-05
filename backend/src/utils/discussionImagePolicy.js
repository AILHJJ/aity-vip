const crypto = require('crypto');

const SIGNED_IMAGE_TTL_SECONDS = 10 * 60;

function detectDiscussionImageType(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: '.jpg', mimeType: 'image/jpeg' };
  }
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { extension: '.png', mimeType: 'image/png' };
  }
  if (buffer.length >= 10 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a')) {
    return { extension: '.gif', mimeType: 'image/gif' };
  }
  if (buffer.length >= 16 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { extension: '.webp', mimeType: 'image/webp' };
  }
  return null;
}

function canAttachDiscussionImage({ image, currentUserId }) {
  return !!image && Number(image.userId) === Number(currentUserId) && image.discussionId == null;
}

function createImageSignature({ discussionId, imageId, expiresAt, key }) {
  if (!key) throw new Error('Discussion image signing key is not configured');
  const payload = `${discussionId}:${imageId}:${expiresAt}`;
  return crypto.createHmac('sha256', key).update(payload).digest('hex');
}

function verifyImageSignature({ discussionId, imageId, expiresAt, signature, key, now = Math.floor(Date.now() / 1000) }) {
  const expiry = Number(expiresAt);
  if (!Number.isInteger(expiry) || expiry <= now || expiry > now + SIGNED_IMAGE_TTL_SECONDS || !/^[a-f\d]{64}$/i.test(signature || '')) {
    return false;
  }
  const expected = Buffer.from(createImageSignature({ discussionId, imageId, expiresAt: expiry, key }), 'hex');
  const actual = Buffer.from(signature, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

module.exports = {
  SIGNED_IMAGE_TTL_SECONDS,
  detectDiscussionImageType,
  canAttachDiscussionImage,
  createImageSignature,
  verifyImageSignature
};
