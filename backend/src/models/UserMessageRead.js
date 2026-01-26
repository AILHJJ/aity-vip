// 用户消息阅读模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Message = require('./Message');

const UserMessageRead = sequelize.define('UserMessageRead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false
  },
  messageId: {
    type: DataTypes.INTEGER,
    field: 'message_id',
    allowNull: false
  }
}, {
  tableName: 'user_message_reads',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'message_id']
    }
  ]
});

// 关联关系
UserMessageRead.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserMessageRead.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

module.exports = UserMessageRead;