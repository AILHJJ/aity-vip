// 消息附件模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Message = require('./Message');

const MessageAttachment = sequelize.define('MessageAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    field: 'message_id',
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'message_attachments',
  timestamps: false
});

// 关联关系
MessageAttachment.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

module.exports = MessageAttachment;