const assert = require('assert');

const {
  createAgentUsageService,
  normalizeUsageRecord
} = require('../src/services/agentUsageService');

async function run() {
  const created = [];
  const service = createAgentUsageService({
    repository: {
      async create(record) {
        created.push(record);
        return record;
      },
      async countByUser(userId) {
        return created.filter(item => item.userId === userId).length;
      },
      async summaryByUser() {
        const grouped = new Map();
        for (const item of created) {
          const key = String(item.userId);
          const current = grouped.get(key) || { userId: item.userId, usageCount: 0, successCount: 0, lastUsedAt: item.createdAt };
          current.usageCount += 1;
          if (item.status === 'success') current.successCount += 1;
          if (new Date(item.createdAt) > new Date(current.lastUsedAt)) current.lastUsedAt = item.createdAt;
          grouped.set(key, current);
        }
        return [...grouped.values()];
      },
      async summaryGlobal() {
        return {
          total: created.length,
          success: created.filter(item => item.status === 'success').length,
          failed: created.filter(item => item.status !== 'success').length
        };
      }
    }
  });

  await service.record({
    requestId: 'r-1',
    userId: 7,
    agentId: 'agent-1',
    agentName: 'Agent',
    status: 'success',
    elapsedMs: 120,
    mcpCalls: 0,
    conversationId: 'c-1'
  });
  await service.record({
    requestId: 'r-2',
    userId: 7,
    agentId: 'agent-1',
    agentName: 'Agent',
    status: 'failed',
    elapsedMs: 300,
    errorCode: 'UPSTREAM_ERROR'
  });

  assert.strictEqual(created[0].status, 'success');
  assert.strictEqual(created[0].userId, 7);
  assert.strictEqual(created[0].mcpCalls, 0);
  assert.strictEqual(created[1].errorCode, 'UPSTREAM_ERROR');
  assert.strictEqual(await service.getPersonalCount(7), 2);
  assert.deepStrictEqual(await service.getPersonalSummary(7), {
    userId: 7,
    usageCount: 2,
    successCount: 1,
    lastUsedAt: created[1].createdAt
  });
  assert.deepStrictEqual(await service.getGlobalSummary(), { total: 2, success: 1, failed: 1 });

  assert.deepStrictEqual(normalizeUsageRecord({
    requestId: 'x',
    userId: 'bad',
    status: 'unexpected',
    elapsedMs: 'bad',
    mcpCalls: '-1'
  }), {
    requestId: 'x',
    userId: 0,
    agentId: '',
    agentName: '',
    conversationId: '',
    status: 'failed',
    elapsedMs: 0,
    mcpCalls: 0,
    errorCode: ''
  });

  console.log('agentUsageService unit tests passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
