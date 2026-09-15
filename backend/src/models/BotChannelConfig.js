// 渠道配置模型：存 IM 渠道（企微/飞书/钉钉）的接入配置，供后台可配置
// 这样 bot 配置不写死代码/env，管理员可在小程序后台改，改动后热生效
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BotChannelConfig = sequelize.define('BotChannelConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  channel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '渠道名：wecom / feishu / dingtalk'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否启用该渠道'
  },
  config: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '渠道配置 JSON，如 { botId, secret, bindCode } 或 { appId, appSecret, bindCode }'
  }
}, {
  tableName: 'bot_channel_configs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = BotChannelConfig;
