const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AgentUsageRecord = sequelize.define('AgentUsageRecord', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  requestId: { type: DataTypes.STRING(100), allowNull: false, field: 'request_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  agentId: { type: DataTypes.STRING(255), allowNull: false, field: 'agent_id' },
  agentName: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '', field: 'agent_name' },
  conversationId: { type: DataTypes.STRING(255), allowNull: true, field: 'conversation_id' },
  status: { type: DataTypes.ENUM('success', 'failed', 'timeout'), allowNull: false, defaultValue: 'failed' },
  elapsedMs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'elapsed_ms' },
  mcpCalls: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'mcp_calls' },
  errorCode: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '', field: 'error_code' }
}, {
  tableName: 'agent_usage_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AgentUsageRecord;
