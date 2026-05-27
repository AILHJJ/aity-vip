/**
 * 应用启动时初始化脚本
 * 自动创建数据库表并初始化默认数据
 */

const sequelize = require('./src/config/db');
const MessageType = require('./src/models/MessageType');
const Message = require('./src/models/Message');
const User = require('./src/models/User');
const Group = require('./src/models/Group');
const MessageAttachment = require('./src/models/MessageAttachment');
const UserMessageRead = require('./src/models/UserMessageRead');
const UserFavorite = require('./src/models/UserFavorite');
const Discussion = require('./src/models/Discussion');
const DiscussionReply = require('./src/models/DiscussionReply');

async function initializeDatabase() {
  console.log('🚀 开始初始化数据库...');
  
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步 MessageType 模型（创建表）
    await sequelize.sync({ alter: true });
    console.log('✅ message_types 表已同步');
    
    // 初始化默认消息类型
    await MessageType.initDefaultTypes();
    console.log('✅ 默认消息类型已初始化');
    
    console.log('🎉 数据库初始化完成！');
    process.exit(0);
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
    process.exit(1);
  }
}

initializeDatabase();
