const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AgentSetting = sequelize.define('AgentSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  defaultAgentId: { type: DataTypes.STRING(255), allowNull: false, field: 'default_agent_id' },
  defaultAgentName: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '', field: 'default_agent_name' },
  defaultAgentDescription: { type: DataTypes.STRING(1000), allowNull: false, defaultValue: '', field: 'default_agent_description' },
  defaultAgentIcon: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '', field: 'default_agent_icon' },
  defaultAgentClass: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'default_agent_class' },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'updated_by' }
}, {
  tableName: 'agent_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AgentSetting;
