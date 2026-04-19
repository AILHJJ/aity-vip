// 讨论模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Message = require('./Message');

// 延迟加载关联模型以避免循环依赖
let DiscussionReply, DiscussionFavorite;

try {
  DiscussionReply = require('./DiscussionReply');
  DiscussionFavorite = require('./DiscussionFavorite');
} catch (e) {
  // 忽略模块未加载错误，稍后设置关联
}

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
  tableName: 'discussions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 关联关系
Discussion.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 设置其他关联（如果模型已加载）
if (DiscussionReply) {
  Discussion.hasMany(DiscussionReply, { foreignKey: 'discussionId', as: 'replies' });
}

if (DiscussionFavorite) {
  Discussion.hasMany(DiscussionFavorite, { foreignKey: 'discussionId', as: 'favorites' });
}

module.exports = Discussion;