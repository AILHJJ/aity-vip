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
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户简介（资产规模、分享偏好等）'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
    comment: '上次登录时间'
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_changed_at',
    comment: '密码最后修改时间'
  },
  isInitialPassword: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_initial_password',
    comment: '是否使用初始密码'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 延迟加载关联模型以避免循环依赖
let UserFavorite, UserMessageRead, DiscussionFavorite;

try {
  UserFavorite = require('./UserFavorite');
  UserMessageRead = require('./UserMessageRead');
  DiscussionFavorite = require('./DiscussionFavorite');
} catch (e) {
  // 忽略模块未加载错误，稍后设置关联
}

// 设置关联关系
if (UserFavorite) {
  User.hasMany(UserFavorite, { foreignKey: 'userId', as: 'favorites' });
}

if (UserMessageRead) {
  User.hasMany(UserMessageRead, { foreignKey: 'userId', as: 'messageReads' });
}

if (DiscussionFavorite) {
  User.hasMany(DiscussionFavorite, { foreignKey: 'userId', as: 'discussionFavorites' });
}

module.exports = User;