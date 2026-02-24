/**
 * VIP账号验证脚本
 * 验证VIP测试账号是否正常工作
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const User = require('../src/models/User');

async function verifyVipAccount() {
  try {
    console.log('========================================');
    console.log('VIP测试账号验证报告');
    console.log('========================================\n');

    // 1. 检查账号是否存在
    console.log('1. 检查账号是否存在...');
    const user = await User.findOne({
      where: { email: 'vip_test@example.com' }
    });

    if (!user) {
      console.log('   ✗ VIP测试账号不存在');
      console.log('\n请先运行: node scripts/create-vip-test-user.js');
      await sequelize.close();
      process.exit(1);
    }

    console.log('   ✓ VIP测试账号存在\n');

    // 2. 验证账号信息
    console.log('2. 账号信息:');
    console.log('   用户ID:', user.id);
    console.log('   用户名:', user.name);
    console.log('   邮箱:', user.email);
    console.log('   角色:', user.role);
    console.log('   状态:', user.status);
    console.log('   组ID:', user.groupId);
    console.log('   创建时间:', user.createdAt);
    console.log('');

    // 3. 验证密码
    console.log('3. 验证密码...');
    const isPasswordValid = await bcrypt.compare('123456', user.password);
    if (isPasswordValid) {
      console.log('   ✓ 密码验证成功 (123456)\n');
    } else {
      console.log('   ✗ 密码验证失败\n');
      await sequelize.close();
      process.exit(1);
    }

    // 4. 验证VIP角色
    console.log('4. 验证VIP角色...');
    const vipRoles = ['vip_mid', 'vip_short'];
    if (vipRoles.includes(user.role)) {
      console.log('   ✓ 角色验证成功:', user.role);
      console.log('   角色' + user.role + '说明:');
      if (user.role === 'vip_mid') {
        console.log('   - VIP中线用户，可以查看中线相关的消息内容');
      } else if (user.role === 'vip_short') {
        console.log('   - VIP短线用户，可以查看短线相关的消息内容');
      }
    } else {
      console.log('   ✗ 角色不是VIP用户\n');
      await sequelize.close();
      process.exit(1);
    }
    console.log('');

    // 5. 验证账号状态
    console.log('5. 验证账号状态...');
    if (user.status === 'active') {
      console.log('   ✓ 账号状态正常 (active)\n');
    } else {
      console.log('   ✗ 账号状态异常:', user.status, '\n');
      await sequelize.close();
      process.exit(1);
    }

    // 6. 总结
    console.log('========================================');
    console.log('验证结果: ✓ 通过');
    console.log('========================================\n');

    console.log('登录信息:');
    console.log('  邮箱: vip_test@example.com');
    console.log('  密码: 123456');
    console.log('  角色: ' + user.role + ' (VIP中线用户)');
    console.log('  状态: ' + user.status);
    console.log('');

    console.log('如何验证VIP身份:');
    console.log('1. 使用上述账号登录系统');
    console.log('2. 登录成功后，系统会返回用户信息');
    console.log('3. 在返回的用户信息中，role字段应该显示为"vip_mid"');
    console.log('4. 该用户拥有VIP中线用户的所有权限\n');

    console.log('测试建议:');
    console.log('- 使用该账号登录前端应用');
    console.log('- 检查是否能看到VIP专用的消息内容');
    console.log('- 验证权限控制是否正常工作');
    console.log('- 测试消息的读取、收藏等功能\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('验证失败:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// 执行验证
verifyVipAccount();
