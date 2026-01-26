// 讨论回复模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Discussion = require('./Discussion');

const DiscussionReply = sequelize.define('DiscussionReply', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  discussionId: {
    type: DataTypes.INTEGER,
    field: 'discussion_id',
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    field: 'sender_id',
    allowNull: false
  },
  senderName: {
    type: DataTypes.STRING(100),
    field: 'sender_name',
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'discussion_replies'
});

// 关联关系
DiscussionReply.belongsTo(Discussion, { foreignKey: 'discussionId', as: 'discussion' });
DiscussionReply.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = DiscussionReply;