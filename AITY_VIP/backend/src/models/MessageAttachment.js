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
    field: 'type',
    allowNull: false,
    defaultValue: 'image'
  },
  url: {
    type: DataTypes.STRING(500),
    field: 'file_url',
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    field: 'file_name',
    allowNull: false,
    defaultValue: ''
  },
  fileType: {
    type: DataTypes.STRING(50),
    field: 'file_type',
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size',
    allowNull: true
  }
}, {
  tableName: 'message_attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 关联关系
MessageAttachment.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

module.exports = MessageAttachment;