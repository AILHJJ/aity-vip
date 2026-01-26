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
    type: DataTypes.ENUM('system', 'important', 'daily', 'pre_market_comment', 'morning_comment', 'morning_focus', 'afternoon_comment', 'afternoon_focus', 'close_comment', 'risk_warning'),
    allowNull: false
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
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false
  }
}, {
  tableName: 'messages',
  timestamps: false,
  // 明确指定字段映射
  underscored: false,
  // 禁用自动添加时间戳
  createdAt: false,
  updatedAt: false
});

// 关联关系
Message.belongsTo(User, { foreignKey: 'senderId', as: 'senderUser' });
Message.belongsTo(Group, { foreignKey: 'groupId', as: 'messageGroup' });

module.exports = Message;