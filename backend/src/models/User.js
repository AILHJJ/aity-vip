// 用户模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '邮箱地址，可选字段'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial'),
    allowNull: false,
    defaultValue: 'trial'
  },
  groupId: {
    type: DataTypes.STRING(50),
    field: 'group_id'
  },
  avatar: {
    type: DataTypes.STRING(100)
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  expireDate: {
    type: DataTypes.DATE,
    field: 'expire_date'
  }
}, {
  tableName: 'users'
});

module.exports = User;