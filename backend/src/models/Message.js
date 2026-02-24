/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-20 14:51:23
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-23 15:10:01
 * @FilePath: \your-mcp-proxy\AITY_VIP(1)\AITY_VIP\AITY0118\backend\src\models\Message.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 消息模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Group = require('./Group');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'pre_market_comment',    // 盘前点评
      'morning_comment',       // 早盘点评
      'morning_focus',         // 早盘关注
      'afternoon_comment',     // 尾盘点评
      'afternoon_focus',       // 尾盘关注
      'close_comment',         // 收盘点评
      'risk_warning',          // 风险提示
      'system',                // 系统消息
      'important',             // 重要消息
      'daily'                  // 日常消息
    ),
    allowNull: false,
    defaultValue: 'daily'
  },
  sender: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    field: 'sender_id',
    allowNull: false
  },
  groupId: {
    type: DataTypes.STRING(50),
    field: 'group_id',
    allowNull: false
  },
  readCount: {
    type: DataTypes.INTEGER,
    field: 'read_count',
    defaultValue: 0
  },
  totalCount: {
    type: DataTypes.INTEGER,
    field: 'total_count',
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: '消息标签数组，如 ["短线策略", "中线策略", "全部用户"]'
  },
  theme: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'default',
    comment: 'Markdown主题样式：default, github, emerald, ocean, warm, dark'
  },
  publishTime: {
    type: DataTypes.DATE,
    field: 'publish_time',
    allowNull: true,
    defaultValue: null,
    comment: '定时发布时间，null表示立即发布'
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'published'),
    allowNull: false,
    defaultValue: 'published',
    comment: 'draft:草稿, scheduled:定时发布, published:已发布'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// 关联关系
Message.belongsTo(User, { foreignKey: 'senderId', as: 'senderUser' });
// 注意：groupId 不设置外键约束，因为它可以是特殊值 'all' 或实际的 group_id
// Message.belongsTo(Group, { foreignKey: 'groupId', as: 'messageGroup' });

module.exports = Message;