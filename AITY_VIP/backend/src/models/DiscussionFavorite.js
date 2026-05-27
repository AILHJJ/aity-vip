// 用户讨论收藏模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Discussion = require('./Discussion');

const DiscussionFavorite = sequelize.define('DiscussionFavorite', {
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
  discussionId: {
    type: DataTypes.INTEGER,
    field: 'discussion_id',
    allowNull: false
  }
}, {
  tableName: 'discussion_favorites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'discussion_id']
    }
  ]
});

// 关联关系
DiscussionFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DiscussionFavorite.belongsTo(Discussion, { foreignKey: 'discussionId', as: 'discussion' });

module.exports = DiscussionFavorite;
