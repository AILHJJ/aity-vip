const assert = require('assert');

process.env.DB_ENV = 'unit';

const { createAgentAdvisorController } = require('../src/controllers/aiAdvisorController');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

function createSettings(initial = null) {
  let row = initial;
  return {
    async findOne() { return row; },
    async create(values) {
      row = { ...values, async update(next) { Object.assign(this, next); return this; } };
      return row;
    }
  };
}

async function run() {
  const records = [];
  const chatCalls = [];
  const agents = [{ agentId: 'research-agent', name: '投研 Agent', description: '仅供内部使用', icon: '', agentClass: 1 }];
  const openApiService = {
    isConfigured: () => true,
    async listAgents() { return agents; },
    async chat(input) {
      chatCalls.push(input);
      return { requestId: input.requestId, conversationId: 'conv-1', output: { type: 'text', content: '已收到' }, usage: { mcpCalls: 0 } };
    }
  };
  const usageService = {
    async record(record) { records.push(record); },
    async getPersonalSummary(userId) { return { userId, usageCount: 0, successCount: 0, lastUsedAt: null }; },
    async getGlobalSummary() { return { total: 0, success: 0, failed: 0 }; },
    async getUserSummaries() { return []; }
  };
  const controller = createAgentAdvisorController({ openApiService, settingModel: createSettings(), usageService });

  const configResponse = createResponse();
  await controller.getConfig({}, configResponse);
  assert.strictEqual(configResponse.statusCode, 200);
  assert.deepStrictEqual(configResponse.body.data, { configured: true, agent: null });
  assert.strictEqual(Object.prototype.hasOwnProperty.call(configResponse.body.data, 'apiKey'), false);

  const rejectedResponse = createResponse();
  await controller.updateConfig({ body: { agentId: 'forged-agent' }, user: { userId: 9 } }, rejectedResponse);
  assert.strictEqual(rejectedResponse.statusCode, 400);
  assert.strictEqual(rejectedResponse.body.message, '只能选择当前已授权的 Agent');

  const updateResponse = createResponse();
  await controller.updateConfig({ body: { agentId: 'research-agent' }, user: { userId: 9 } }, updateResponse);
  assert.strictEqual(updateResponse.statusCode, 200);
  assert.deepStrictEqual(updateResponse.body.data, agents[0]);

  const chatResponse = createResponse();
  await controller.chat({ body: { message: '查询摘要', externalUserId: 'forged-user', conversationId: 'existing-conv' }, user: { userId: 9 } }, chatResponse);
  assert.strictEqual(chatResponse.statusCode, 200);
  assert.strictEqual(chatCalls[0].externalUserId, 'aity-vip:9');
  assert.strictEqual(chatCalls[0].conversationId, 'existing-conv');
  assert.strictEqual(records[0].status, 'success');
  assert.strictEqual(records[0].userId, 9);

  openApiService.chat = async () => {
    const error = new Error('Agent 响应超时，请稍后重试');
    error.code = 'AGENT_OPENAPI_TIMEOUT';
    error.statusCode = 504;
    throw error;
  };
  const failureResponse = createResponse();
  await controller.chat({ body: { message: '再次查询' }, user: { userId: 9 } }, failureResponse);
  assert.strictEqual(failureResponse.statusCode, 504);
  assert.strictEqual(records[1].status, 'timeout');

  console.log('agentAdvisorController unit tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
