/**
 * 创建VIP测试账号脚本
 * 用于创建VIP测试用户账号
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const User = require('../src/models/User');

async function createVipTestUser() {
  try {
    console.log('开始创建VIP测试账号...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        email: 'vip_test@example.com'
      }
    });

    if (existingUser) {
      console.log('VIP测试账号已存在:');
      console.log('  用户名:', existingUser.name);
      console.log('  邮箱:', existingUser.email);
      console.log('  角色:', existingUser.role);
      console.log('  状态:', existingUser.status);
      console.log('\n如需重新创建，请先删除现有账号');
      await sequelize.close();
      process.exit(0);
    }

    // 创建VIP测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);

    const vipUser = await User.create({
      name: 'vip_test',
      email: 'vip_test@example.com',
      password: hashedPassword,
      role: 'vip_mid', // VIP中线用户
      groupId: 'vip_mid',
      status: 'active'
    });

    console.log('\n========================================');
    console.log('VIP测试账号创建成功！\n');
    console.log('账号信息:');
    console.log('  用户名: vip_test');
    console.log('  邮箱: vip_test@example.com');
    console.log('  密码: 123456');
    console.log('  角色: vip_mid (VIP中线用户)');
    console.log('  状态: active');
    console.log('  用户ID:', vipUser.id);
    console.log('========================================\n');

    console.log('如何使用此账号登录:');
    console.log('1. 在登录页面输入邮箱: vip_test@example.com');
    console.log('2. 输入密码: 123456');
    console.log('3. 点击登录按钮\n');

    console.log('VIP角色权限说明:');
    console.log('- vip_mid: VIP中线用户，可以查看中线相关的消息内容');
    console.log('- vip_short: VIP短线用户，可以查看短线相关的消息内容');
    console.log('- trial: 体验用户，有7天体验期');
    console.log('- admin: 管理员，拥有管理权限');
    console.log('- super_admin: 超级管理员，拥有所有权限\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('创建VIP测试账号失败:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// 执行脚本
createVipTestUser();
