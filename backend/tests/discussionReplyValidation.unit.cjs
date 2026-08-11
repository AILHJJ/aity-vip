const assert = require('assert');

const { validateAddReply } = require('../src/middleware/validation');

async function runValidation({ params = { id: '1' }, body = {} }) {
  const req = { params, body };
  let statusCode = 200;
  let jsonBody = null;
  let nextCalled = false;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      jsonBody = payload;
      return this;
    }
  };

  for (const middleware of validateAddReply()) {
    await middleware(req, res, () => {
      nextCalled = true;
    });
  }

  return { statusCode, jsonBody, nextCalled };
}

(async () => {
  const imageOnly = await runValidation({
    body: {
      content: '',
      images: [{ url: 'https://aity88.online/uploads/reply.png', filename: 'reply.png' }]
    }
  });
  assert.strictEqual(imageOnly.nextCalled, true, '只发图片的回复应该通过校验');
  assert.strictEqual(imageOnly.jsonBody, null);

  const emptyReply = await runValidation({
    body: {
      content: '',
      images: []
    }
  });
  assert.strictEqual(emptyReply.statusCode, 400, '空回复应该被拒绝');
  assert.strictEqual(emptyReply.jsonBody.code, 400);

  console.log('discussionReplyValidation unit tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
