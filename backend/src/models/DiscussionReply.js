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
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    field: 'images',
    allowNull: true,
    defaultValue: null,
    comment: '图片列表 [{url, filename}]'
  },
  isPrivate: {
    type: DataTypes.TINYINT(1),
    field: 'is_private',
    allowNull: false,
    defaultValue: 0,
    comment: '1=私密回复(仅管理员和发帖人可见), 0=公开(所有人可见)'
  }
}, {
  tableName: 'discussion_replies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 关联关系
DiscussionReply.belongsTo(Discussion, { foreignKey: 'discussionId', as: 'discussion' });
DiscussionReply.belongsTo(User, { foreignKey: 'userId', as: 'sender' });

module.exports = DiscussionReply;