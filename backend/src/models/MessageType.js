/**
 * 消息类型模型
 * 支持管理员动态管理消息类型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MessageType = sequelize.define('MessageType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '类型标识（英文）'
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '显示名称（中文）'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '#667eea',
    comment: '标签颜色'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '',
    comment: '图标（emoji或图标名）'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序顺序，数字越小越靠前'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否启用'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '类型描述'
  }
}, {
  tableName: 'message_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['type'] },
    { fields: ['sort_order'] },
    { fields: ['is_active'] }
  ]
});

// 初始化默认消息类型
MessageType.initDefaultTypes = async function() {
  const defaultTypes = [
    { type: 'position_handle', label: '持仓处理', color: '#ef4444', icon: '📊', sortOrder: 1, description: '持仓处理相关消息' },
    { type: 'pre_market_comment', label: '盘前点评', color: '#f59e0b', icon: '🌅', sortOrder: 2, description: '开盘前的市场点评' },
    { type: 'morning_comment', label: '早盘点评', color: '#10b981', icon: '☀️', sortOrder: 3, description: '早盘市场分析' },
    { type: 'morning_focus', label: '早盘关注', color: '#06b6d4', icon: '🎯', sortOrder: 4, description: '早盘重点关注标的' },
    { type: 'afternoon_comment', label: '午盘点评', color: '#8b5cf6', icon: '🌤️', sortOrder: 5, description: '午盘市场分析' },
    { type: 'afternoon_focus', label: '午盘关注', color: '#ec4899', icon: '💫', sortOrder: 6, description: '午盘重点关注标的' },
    { type: 'close_comment', label: '收盘点评', color: '#6366f1', icon: '🌙', sortOrder: 7, description: '收盘总结与分析' },
    { type: 'risk_warning', label: '风险提示', color: '#dc2626', icon: '⚠️', sortOrder: 8, description: '风险警示消息' },
    { type: 'system', label: '系统消息', color: '#64748b', icon: '🔔', sortOrder: 9, description: '系统通知类消息' },
    { type: 'important', label: '重要消息', color: '#eab308', icon: '⭐', sortOrder: 10, description: '重要通知' },
    { type: 'daily', label: '日常消息', color: '#667eea', icon: '📝', sortOrder: 11, description: '日常消息' }
  ];

  for (const typeData of defaultTypes) {
    try {
      const [type, created] = await MessageType.findOrCreate({
        where: { type: typeData.type },
        defaults: typeData
      });
      if (created) {
        console.log(`✅ 创建消息类型: ${typeData.label}`);
      }
    } catch (err) {
      console.error(`创建消息类型失败: ${typeData.type}`, err);
    }
  }
};

module.exports = MessageType;
