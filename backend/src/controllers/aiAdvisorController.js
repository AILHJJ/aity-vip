const crypto = require('crypto');
const sequelize = require('../config/db');
const AgentSetting = require('../models/AgentSetting');
const AgentUsageRecord = require('../models/AgentUsageRecord');
const { createAgentOpenApiService } = require('../services/agentOpenApiService');
const { createAgentUsageService, createSequelizeUsageRepository } = require('../services/agentUsageService');

function safeAgent(setting) {
  if (!setting) return null;
  return {
    agentId: setting.defaultAgentId,
    name: setting.defaultAgentName || 'Agent',
    description: setting.defaultAgentDescription || '',
    icon: setting.defaultAgentIcon || '',
    agentClass: Number(setting.defaultAgentClass || 1) === 2 ? 2 : 1
  };
}

function createRequestId() {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function createAgentAdvisorController({ openApiService, settingModel, usageService } = {}) {
  const client = openApiService || createAgentOpenApiService();
  const settings = settingModel || AgentSetting;
  const usage = usageService || createAgentUsageService({ repository: createSequelizeUsageRepository(AgentUsageRecord, sequelize) });

  async function getDefaultSetting() {
    const row = await settings.findOne({ order: [['updatedAt', 'DESC']] });
    if (row) return row;
    const fallbackId = String(process.env.AGENT_OPENAPI_DEFAULT_AGENT_ID || '').trim();
    return fallbackId ? { defaultAgentId: fallbackId, defaultAgentName: 'Agent' } : null;
  }

  async function getConfig(req, res) {
    try {
      const setting = await getDefaultSetting();
      return res.json({ code: 200, data: { configured: client.isConfigured(), agent: safeAgent(setting) } });
    } catch (error) {
      return res.status(500).json({ code: 500, message: '读取 Agent 配置失败' });
    }
  }

  async function listAgents(req, res) {
    try { return res.json({ code: 200, data: await client.listAgents() }); }
    catch (error) { return res.status(error.statusCode || 502).json({ code: error.statusCode || 502, message: error.message, errorCode: error.code || '' }); }
  }

  async function updateConfig(req, res) {
    try {
      const agentId = String(req.body?.agentId || '').trim();
      const agents = await client.listAgents();
      const agent = agents.find(item => item.agentId === agentId);
      if (!agent) return res.status(400).json({ code: 400, message: '只能选择当前已授权的 Agent' });
      const current = await settings.findOne({ order: [['updatedAt', 'DESC']] });
      const values = {
        defaultAgentId: agent.agentId, defaultAgentName: agent.name, defaultAgentDescription: agent.description,
        defaultAgentIcon: agent.icon, defaultAgentClass: agent.agentClass, updatedBy: req.user.userId
      };
      const saved = current ? await current.update(values) : await settings.create(values);
      return res.json({ code: 200, message: '默认 Agent 已更新', data: safeAgent(saved) });
    } catch (error) { return res.status(error.statusCode || 502).json({ code: error.statusCode || 502, message: error.message || '更新 Agent 配置失败' }); }
  }

  async function chat(req, res) {
    const requestId = createRequestId();
    const startedAt = Date.now();
    let agent = null;
    try {
      const message = String(req.body?.message || req.body?.content || '').trim();
      const setting = await getDefaultSetting();
      agent = safeAgent(setting);
      if (!agent) return res.status(503).json({ code: 503, message: '当前 Agent 暂未配置' });
      const result = await client.chat({ agentId: agent.agentId, message, externalUserId: `aity-vip:${req.user.userId}`, conversationId: req.body?.conversationId, requestId });
      await usage.record({ requestId: result.requestId || requestId, userId: req.user.userId, agentId: agent.agentId, agentName: agent.name, conversationId: result.conversationId, status: 'success', elapsedMs: Date.now() - startedAt, mcpCalls: result.usage?.mcpCalls || 0 });
      return res.json({ code: 200, data: { requestId: result.requestId || requestId, conversationId: result.conversationId || '', output: result.output || { type: 'text', content: '' }, usage: { mcpCalls: Number(result.usage?.mcpCalls || 0) } } });
    } catch (error) {
      const status = error.code === 'AGENT_OPENAPI_TIMEOUT' ? 'timeout' : 'failed';
      if (agent) await usage.record({ requestId, userId: req.user.userId, agentId: agent.agentId, agentName: agent.name, status, elapsedMs: Date.now() - startedAt, errorCode: error.code || 'AGENT_CHAT_FAILED' });
      return res.status(error.statusCode || 502).json({ code: error.statusCode || 502, message: error.message || 'Agent 对话失败', errorCode: error.code || '' });
    }
  }

  async function personalUsage(req, res) {
    return res.json({ code: 200, data: await usage.getPersonalSummary(req.user.userId) });
  }
  async function globalUsage(req, res) {
    return res.json({ code: 200, data: { summary: await usage.getGlobalSummary(), users: await usage.getUserSummaries() } });
  }
  return { getConfig, listAgents, updateConfig, chat, personalUsage, globalUsage };
}

module.exports = createAgentAdvisorController();
module.exports.createAgentAdvisorController = createAgentAdvisorController;
