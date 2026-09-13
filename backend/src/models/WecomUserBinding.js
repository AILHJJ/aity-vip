// 企业微信用户绑定模型：企微 userid ↔ AITY 管理员账号
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const WecomUserBinding = sequelize.define('WecomUserBinding', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wecomUserId: {
    type: DataTypes.STRING(128),
    field: 'wecom_user_id',
    allowNull: false,
    unique: true,
    comment: '企业微信 userid'
  },
  adminUserId: {
    type: DataTypes.INTEGER,
    field: 'admin_user_id',
    allowNull: false,
    comment: '绑定的 AITY 管理员账号 id'
  }
}, {
  tableName: 'wecom_user_bindings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

WecomUserBinding.belongsTo(User, { foreignKey: 'adminUserId', as: 'adminUser' });

module.exports = WecomUserBinding;
