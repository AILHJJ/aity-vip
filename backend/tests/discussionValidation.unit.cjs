const assert = require('assert');
const { validationResult } = require('express-validator');
const { validateCreateDiscussion } = require('../src/middleware/validation');

async function validateImageIds(imageIds) {
  const req = { body: { content: 'test discussion', imageIds } };
  const validators = validateCreateDiscussion();
  await Promise.all(validators.slice(0, -1).map((validator) => validator.run(req)));
  return validationResult(req).array().map((item) => item.msg);
}

(async () => {
  assert.deepStrictEqual(await validateImageIds(Array.from({ length: 9 }, (_, index) => index + 1)), []);
  assert.ok((await validateImageIds(Array.from({ length: 10 }, (_, index) => index + 1))).some((message) => message.includes('9')));
  assert.ok((await validateImageIds([2, 2])).some((message) => message.includes('重复')));
  assert.ok((await validateImageIds([0])).some((message) => message.includes('无效')));
  console.log('discussion validation unit tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
