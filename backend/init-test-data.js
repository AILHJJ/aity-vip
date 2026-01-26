// 初始化测试数据
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');
const { Op } = require('sequelize');

// 导入所有模型
const User = require('./src/models/User');
const Group = require('./src/models/Group');
const Message = require('./src/models/Message');
const MessageAttachment = require('./src/models/MessageAttachment');
const Discussion = require('./src/models/Discussion');
const DiscussionReply = require('./src/models/DiscussionReply');
const UserFavorite = require('./src/models/UserFavorite');
const UserMessageRead = require('./src/models/UserMessageRead');

async function initTestData() {
  try {
    console.log('开始初始化测试数据...');

    // 同步数据库表
    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');

    // 等待1秒确保表结构更新完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 创建符合需求的测试群组
    const testGroups = [
      { id: 'super_admin', name: '超级管理员组', description: '系统最高权限组' },
      { id: 'admin', name: '管理员组', description: '内容管理组' },
      { id: 'vip_mid', name: 'VIP中线组', description: '中线投资者组' },
      { id: 'vip_short', name: 'VIP短线组', description: '短线投资者组' },
      { id: 'trial', name: '体验用户组', description: '试用期用户组' }
    ];

    for (const groupData of testGroups) {
      const existingGroup = await Group.findOne({
        where: {
          id: groupData.id
        }
      });

      if (!existingGroup) {
        await Group.create(groupData);
        console.log(`创建测试群组: ${groupData.name}`);
      } else {
        console.log(`群组已存在: ${groupData.name}`);
      }
    }

    // 创建符合需求的测试用户
    const testUsers = [
      {
        name: '超级管理员',
        email: 'superadmin@example.com',
        password: '123456',
        role: 'super_admin',
        groupId: 'super_admin',
        status: 'active'
      },
      {
        name: '管理员',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
        groupId: 'admin',
        status: 'active'
      },
      {
        name: 'VIP中线用户',
        email: 'vipmid@example.com',
        password: '123456',
        role: 'vip_mid',
        groupId: 'vip_mid',
        status: 'active'
      },
      {
        name: 'VIP短线用户',
        email: 'vipshort@example.com',
        password: '123456',
        role: 'vip_short',
        groupId: 'vip_short',
        status: 'active'
      },
      {
        name: '体验用户',
        email: 'trial@example.com',
        password: '123456',
        role: 'trial',
        groupId: 'trial',
        status: 'active',
        expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天体验期
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
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
        createdUsers.push(user);
        console.log(`创建测试用户: ${userData.name} (${userData.email})`);
      } else {
        createdUsers.push(existingUser);
        console.log(`用户已存在: ${userData.name} (${userData.email})`);
      }
    }

    // 创建符合需求的测试消息
    if (createdUsers.length >= 2) {
      const testMessages = [
        {
          title: '欢迎加入投研图灵室',
          content: '欢迎加入我们的投研内部分享系统，这里有最新的研究成果和行业动态。',
          type: 'system',
          sender: createdUsers[0].name,
          senderId: createdUsers[0].id,
          groupId: 'admin',
          readCount: 0,
          totalCount: 5,
          createdAt: new Date()
        },
        {
          title: '盘前点评：市场走势分析',
          content: '今日市场预计将震荡上行，重点关注科技板块的表现。',
          type: 'pre_market_comment',
          sender: createdUsers[1].name,
          senderId: createdUsers[1].id,
          groupId: 'vip_mid',
          readCount: 0,
          totalCount: 3,
          createdAt: new Date()
        },
        {
          title: '风险提示：注意市场波动',
          content: '近期市场波动较大，投资者需注意风险控制。',
          type: 'risk_warning',
          sender: createdUsers[1].name,
          senderId: createdUsers[1].id,
          groupId: 'vip_short',
          readCount: 0,
          totalCount: 2,
          createdAt: new Date()
        }
      ];

      for (const messageData of testMessages) {
        const existingMessage = await Message.findOne({
          where: {
            title: messageData.title,
            senderId: messageData.senderId
          }
        });

        if (!existingMessage) {
          await Message.create(messageData);
          console.log(`创建测试消息: ${messageData.title}`);
        }
      }
    }

    // 创建符合需求的测试讨论
    if (createdUsers.length >= 3) {
      // 先获取已创建的消息
      const messages = await Message.findAll();
      
      if (messages.length > 0) {
        const testDiscussions = [
          {
            messageId: messages[0].id,
            userId: createdUsers[0].id,
            userName: createdUsers[0].name,
            title: '系统使用指南讨论',
            content: '欢迎大家讨论系统使用过程中的问题和建议，我们会不断优化系统功能。',
            status: 'pending',
            visibility: 'public'
          },
          {
            messageId: messages[1].id || messages[0].id,
            userId: createdUsers[2].id,
            userName: createdUsers[2].name,
            title: '中线投资策略讨论',
            content: '根据盘前点评，我认为科技板块有较好的中线投资机会，大家怎么看？',
            status: 'pending',
            visibility: 'private'
          }
        ];

        for (const discussionData of testDiscussions) {
          const existingDiscussion = await Discussion.findOne({
            where: {
              title: discussionData.title,
              userId: discussionData.userId
            }
          });

          if (!existingDiscussion) {
            const discussion = await Discussion.create(discussionData);
            console.log(`创建测试讨论: ${discussionData.title}`);
          }
        }
      }
    }

    console.log('测试数据初始化完成');
    console.log('\n测试账号信息:');
    console.log('超级管理员: superadmin@example.com / 123456');
    console.log('管理员: admin@example.com / 123456');
    console.log('VIP中线用户: vipmid@example.com / 123456');
    console.log('VIP短线用户: vipshort@example.com / 123456');
    console.log('体验用户: trial@example.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    process.exit(1);
  }
}

initTestData();