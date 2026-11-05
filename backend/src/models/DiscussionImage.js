const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DiscussionImage = sequelize.define('DiscussionImage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  filename: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: false },
  discussionId: { type: DataTypes.INTEGER, field: 'discussion_id', allowNull: true },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
}, {
  tableName: 'discussion_images',
  timestamps: true,
  indexes: [
    { fields: ['user_id', 'discussion_id'] },
    { fields: ['discussion_id'] }
  ]
});

module.exports = DiscussionImage;
