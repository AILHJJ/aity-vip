// 讨论模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Message = require('./Message');

const Discussion = sequelize.define('Discussion', {
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
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING(100),
    field: 'user_name',
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'replied'),
    allowNull: false,
    defaultValue: 'pending'
  },
  visibility: {
    type: DataTypes.ENUM('private', 'public'),
    allowNull: false,
    defaultValue: 'private',
    comment: 'private: 只有管理员和发起者可见, public: 所有人可见'
  }
}, {
  tableName: 'discussions'
});

// 关联关系
Discussion.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Discussion;