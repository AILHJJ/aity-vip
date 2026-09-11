const assert = require('assert');

const {
  createAgentOpenApiService,
  mapSafeAgent
} = require('../src/services/agentOpenApiService');

async function run() {
  const calls = [];
  const service = createAgentOpenApiService({
    baseUrl: 'https://agent.example.test',
    apiKey: 'server-only-key',
    timeoutMs: 3210,
    httpClient: {
      async get(url, options) {
        calls.push({ method: 'GET', url, options });
        return {
          data: {
            data: [
              {
                agentId: 'agent-default',
                name: '投研 Agent',
                description: '提供内部信息查询',
                icon: 'chart',
                agentClass: 1,
                systemPrompt: 'must never leave upstream'
              }
            ]
          }
        };
      },
      async post(url, body, options) {
        calls.push({ method: 'POST', url, body, options });
        return {
          data: {
            requestId: 'request-1',
            conversationId: 'conversation-1',
            output: { type: 'text', content: '回答' },
            usage: { mcpCalls: 0 }
          }
        };
      }
    }
  });

  const agents = await service.listAgents();
  assert.deepStrictEqual(agents, [{
    agentId: 'agent-default',
    name: '投研 Agent',
    description: '提供内部信息查询',
    icon: 'chart',
    agentClass: 1
  }]);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(agents[0], 'systemPrompt'), false);

  const result = await service.chat({
    agentId: 'agent-default',
    message: '请给出信息摘要',
    externalUserId: 'user-7',
    conversationId: 'conversation-1',
    requestId: 'request-1'
  });
  assert.strictEqual(result.requestId, 'request-1');
  assert.strictEqual(calls[1].url, 'https://agent.example.test/openapi/v1/chat/completions');
  assert.strictEqual(calls[1].options.headers.Authorization, 'Bearer server-only-key');
  assert.strictEqual(calls[1].body.agentId, 'agent-default');
  assert.strictEqual(calls[1].body.externalUserId, 'user-7');
  assert.strictEqual(calls[1].body.userId, undefined);
  assert.strictEqual(calls[1].options.timeout, 3210);

  assert.throws(
    () => mapSafeAgent({ name: 'x', systemPrompt: 'secret' }),
    /agentId/
  );

  console.log('agentOpenApiService unit tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
