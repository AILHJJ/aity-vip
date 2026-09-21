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
    allowNull: true
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
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'interaction',
    comment: '讨论分类: interaction=互动交流'
  },
  visibility: {
    type: DataTypes.ENUM('private', 'public'),
    allowNull: false,
    defaultValue: 'private',
    comment: 'private: 只有管理员和发起者可见, public: 所有人可见'
  },
  images: {
    type: DataTypes.JSON,
    field: 'images',
    allowNull: true,
    defaultValue: null,
    comment: '图片列表 [{url, filename}]'
  },
  lastReplyAt: {
    type: DataTypes.DATE,
    field: 'last_reply_at',
    allowNull: true,
    comment: '最后回复时间（冗余，用于列表按最新回复排序）'
  },
  stockCodes: {
    type: DataTypes.STRING(255),
    field: 'stock_codes',
    allowNull: true,
    defaultValue: null,
    comment: '关联股票代码（逗号分隔，仅持仓帖）'
  },
  // 时间戳必须显式定义（sequelize 6 下 options 写法 createdAt:'created_at' 会导致 rawAttributes 无 createdAt，toJSON 输出 created_at，前端全部拿不到时间）
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'discussions',
  timestamps: true
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
