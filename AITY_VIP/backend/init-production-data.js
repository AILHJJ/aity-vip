// 初始化生产数据
require('dotenv').config({ path: '.env.production' });
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');

// 导入所有模型
const User = require('./src/models/User');
const Group = require('./src/models/Group');
const Message = require('./src/models/Message');
const MessageAttachment = require('./src/models/MessageAttachment');
const Discussion = require('./src/models/Discussion');
const DiscussionReply = require('./src/models/DiscussionReply');
const UserFavorite = require('./src/models/UserFavorite');
const UserMessageRead = require('./src/models/UserMessageRead');

async function initProductionData() {
  try {
    console.log('开始初始化生产数据...');

    // 同步数据库表
    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');

    // 等待1秒确保表结构更新完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 创建符合需求的群组
    const groups = [
      { id: 'super_admin', name: '超级管理员组', description: '系统最高权限组' },
      { id: 'admin', name: '管理员组', description: '内容管理组' },
      { id: 'vip_mid', name: 'VIP中线组', description: '中线投资者组' },
      { id: 'vip_short', name: 'VIP短线组', description: '短线投资者组' },
      { id: 'trial', name: '体验用户组', description: '试用期用户组' }
    ];

    for (const groupData of groups) {
      const existingGroup = await Group.findOne({
        where: {
          id: groupData.id
        }
      });

      if (!existingGroup) {
        await Group.create(groupData);
        console.log(`创建群组: ${groupData.name}`);
      } else {
        console.log(`群组已存在: ${groupData.name}`);
      }
    }

    // 创建生产环境的管理员用户
    const adminUsers = [
      {
        name: '超级管理员',
        email: 'superadmin@aity.com',
        password: 'Admin123!',
        role: 'super_admin',
        groupId: 'super_admin',
        status: 'active'
      },
      {
        name: '管理员',
        email: 'admin@aity.com',
        password: 'Admin123!',
        role: 'admin',
        groupId: 'admin',
        status: 'active'
      }
    ];

    for (const userData of adminUsers) {
      const existingUser = await User.findOne({
        where: {
          email: userData.email
        }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });
        console.log(`创建用户: ${userData.name} (${userData.email})`);
      } else {
        console.log(`用户已存在: ${userData.name} (${userData.email})`);
      }
    }

    // 创建系统欢迎消息
    const adminUser = await User.findOne({ where: { role: 'super_admin' } });
    if (adminUser) {
      const welcomeMessage = await Message.findOne({
        where: {
          title: '欢迎加入投研图灵室',
          type: 'system'
        }
      });

      if (!welcomeMessage) {
        await Message.create({
          title: '欢迎加入投研图灵室',
          content: '欢迎加入我们的投研内部分享系统，这里有最新的研究成果和行业动态。',
          type: 'system',
          sender: adminUser.name,
          senderId: adminUser.id,
          groupId: 'admin',
          readCount: 0,
          totalCount: 0,
          createdAt: new Date()
        });
        console.log('创建系统欢迎消息');
      }
    }

    console.log('生产数据初始化完成');
    console.log('\n生产环境账号信息:');
    console.log('超级管理员: superadmin@aity.com / Admin123!');
    console.log('管理员: admin@aity.com / Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('初始化生产数据失败:', error);
    process.exit(1);
  }
}

initProductionData();
