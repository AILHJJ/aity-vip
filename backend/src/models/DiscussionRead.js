// 讨论帖级已读记录（用户对每个讨论帖的最后查看时间）
// 用于计算"该帖有多少条新回复未读"，解决全局未读粒度太粗的问题
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Discussion = require('./Discussion');

const DiscussionRead = sequelize.define('DiscussionRead', {
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
  lastSeenAt: {
    type: DataTypes.DATE,
    field: 'last_seen_at',
    allowNull: false
  }
}, {
  tableName: 'discussion_reads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_id', 'discussion_id'] }
  ]
});

DiscussionRead.belongsTo(Discussion, { foreignKey: 'discussionId', as: 'discussion' });
DiscussionRead.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = DiscussionRead;
