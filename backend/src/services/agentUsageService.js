function normalizeUsageRecord(input = {}) {
  const status = ['success', 'failed', 'timeout'].includes(input.status) ? input.status : 'failed';
  const elapsedMs = Number(input.elapsedMs);
  const mcpCalls = Number(input.mcpCalls);
  const userId = Number(input.userId);

  return {
    requestId: String(input.requestId || '').trim(),
    userId: Number.isInteger(userId) && userId > 0 ? userId : 0,
    agentId: String(input.agentId || '').trim(),
    agentName: String(input.agentName || '').trim(),
    conversationId: String(input.conversationId || '').trim(),
    status,
    elapsedMs: Number.isFinite(elapsedMs) && elapsedMs >= 0 ? Math.round(elapsedMs) : 0,
    mcpCalls: Number.isFinite(mcpCalls) && mcpCalls >= 0 ? Math.round(mcpCalls) : 0,
    errorCode: String(input.errorCode || '').trim()
  };
}

function createAgentUsageService({ repository }) {
  if (!repository || typeof repository.create !== 'function') {
    throw new Error('Agent usage repository is required');
  }

  return {
    async record(input) {
      const record = normalizeUsageRecord(input);
      if (!record.requestId || !record.userId || !record.agentId) return null;
      return repository.create(record);
    },

    async getPersonalCount(userId) {
      return repository.countByUser(normalizeUsageRecord({ userId }).userId);
    },

    async getPersonalSummary(userId) {
      const normalizedUserId = normalizeUsageRecord({ userId }).userId;
      const rows = await repository.summaryByUser(normalizedUserId);
      const first = rows[0];
      return first || {
        userId: normalizedUserId,
        usageCount: 0,
        successCount: 0,
        lastUsedAt: null
      };
    },

    async getGlobalSummary() {
      return repository.summaryGlobal();
    },

    async getUserSummaries() {
      return repository.summaryByUser('');
    }
  };
}

module.exports = {
  createAgentUsageService,
  normalizeUsageRecord,
  createSequelizeUsageRepository
};

function createSequelizeUsageRepository(UsageRecord, sequelize) {
  const { QueryTypes } = require('sequelize');
  return {
    create(record) { return UsageRecord.create(record); },
    countByUser(userId) { return UsageRecord.count({ where: { userId } }); },
    async summaryByUser(userId) {
      const filter = userId ? 'WHERE r.user_id = :userId' : '';
      return sequelize.query(
        `SELECT r.user_id AS userId, u.name AS userName, COUNT(*) AS usageCount,
                SUM(r.status = 'success') AS successCount, MAX(r.created_at) AS lastUsedAt
         FROM agent_usage_records r LEFT JOIN users u ON u.id = r.user_id
         ${filter} GROUP BY r.user_id, u.name ORDER BY lastUsedAt DESC`,
        { replacements: userId ? { userId } : {}, type: QueryTypes.SELECT }
      );
    },
    async summaryGlobal() {
      const rows = await sequelize.query(
        `SELECT COUNT(*) AS total, SUM(status = 'success') AS success,
                SUM(status <> 'success') AS failed FROM agent_usage_records`,
        { type: QueryTypes.SELECT }
      );
      const row = rows[0] || {};
      return { total: Number(row.total || 0), success: Number(row.success || 0), failed: Number(row.failed || 0) };
    }
  };
}
