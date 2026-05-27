// AI配置模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AiConfig = sequelize.define('AiConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  modelName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'model_name',
    comment: 'AI模型名称，如 glm-4-flash'
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'display_name',
    comment: '显示名称'
  },
  apiKey: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'api_key',
    comment: 'API密钥'
  },
  baseUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'base_url',
    comment: 'API基础URL'
  },
  promptTemplate: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'prompt_template',
    comment: '提示词模板'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: '是否激活（默认使用的模型）'
  },
  defaultVersion: {
    type: DataTypes.ENUM('original', 'ai_optimized'),
    allowNull: false,
    defaultValue: 'ai_optimized',
    field: 'default_version',
    comment: '默认版本'
  },
  // 新增字段
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: '厂商代码，如 zhipu, volcengine, aliyun'
  },
  providerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    field: 'provider_name',
    comment: '厂商名称，如 智谱AI, 火山引擎, 阿里云'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    defaultValue: '',
    comment: '模型简介'
  },
  features: {
    type: DataTypes.STRING(500),
    allowNull: false,
    defaultValue: '',
    comment: '模型特点，用|分隔'
  },
  status: {
    type: DataTypes.ENUM('available', 'insufficient_balance', 'error', 'unknown'),
    allowNull: false,
    defaultValue: 'unknown',
    comment: '可用状态'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order',
    comment: '排序顺序'
  }
}, {
  tableName: 'ai_config',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AiConfig;
