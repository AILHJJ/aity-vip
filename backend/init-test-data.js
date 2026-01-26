// 初始化测试数据
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');
const { Op } = require('sequelize');
const User = require('./src/models/User');

async function initTestData() {
  try {
    console.log('开始初始化测试数据...');

    // 同步数据库表
    await sequelize.sync({ force: false });
    console.log('数据库表同步完成');

    // 创建测试用户
    const testUsers = [
      {
        name: 'admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'super_admin',
        groupId: 'admin',
        status: 'active'
      },
      {
        name: 'subadmin',
        email: 'subadmin@example.com',
        password: '123456',
        role: 'admin',
        groupId: 'group1',
        status: 'active'
      },
      {
        name: 'user1',
        email: 'user1@example.com',
        password: '123456',
        role: 'vip_mid',
        groupId: 'group1',
        status: 'active'
      },
      {
        name: 'user2',
        email: 'user2@example.com',
        password: '123456',
        role: 'vip_short',
        groupId: 'group2',
        status: 'active'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({
        where: {
          email: userData.email
        }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({
          ...userData,
          password: hashedPassword
        });
        console.log(`创建测试用户: ${userData.name} (${userData.email})`);
      } else {
        console.log(`用户已存在: ${userData.name} (${userData.email})`);
      }
    }

    console.log('测试数据初始化完成');
    console.log('\n测试账号信息:');
    console.log('管理员账号: admin / 123456');
    console.log('子管理员账号: subadmin / 123456');
    console.log('普通用户1: user1 / 123456');
    console.log('普通用户2: user2 / 123456');

    process.exit(0);
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    process.exit(1);
  }
}

initTestData();
