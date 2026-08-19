const assert = require('assert');

process.env.DB_ENV = 'unit';

const { authenticateToken } = require('../src/utils/jwtUtils');

(async () => {
  let statusCode = null;
  let responseBody = null;

  const req = {
    headers: {
      authorization: 'Bearer invalid-token'
    }
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  await authenticateToken(req, res, () => {
    throw new Error('无效 Token 不应继续进入业务处理');
  });

  assert.strictEqual(statusCode, 401);
  assert.strictEqual(responseBody.message, 'Invalid or expired token');
  console.log('authMiddleware unit tests passed');
})();
