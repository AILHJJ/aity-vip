require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    console.log('正在查询数据库用户...\n');

    // 1. 查询用户总数
    const count = await User.count();
    console.log('========================================');
    console.log(`用户总数: ${count}`);
    console.log('========================================\n');

    // 2. 查询所有用户
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'groupId', 'status', 'expireDate', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log('========================================');
    console.log('用户列表:');
    console.log('========================================\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   姓名: ${user.name}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   用户组: ${user.groupId}`);
      console.log(`   状态: ${user.status}`);
      if (user.expireDate) {
        console.log(`   过期时间: ${user.expireDate}`);
      }
      console.log(`   创建时间: ${user.createdAt}`);
      console.log('');
    });

    // 3. 统计角色分布
    console.log('========================================');
    console.log('角色分布:');
    console.log('========================================\n');

    const roleCounts = {};
    users.forEach(u => {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    });

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}个`);
    });

    // 4. 统计用户组分布
    console.log('\n========================================');
    console.log('用户组分布:');
    console.log('========================================\n');

    const groupCounts = {};
    users.forEach(u => {
      groupCounts[u.groupId] = (groupCounts[u.groupId] || 0) + 1;
    });

    Object.entries(groupCounts).forEach(([group, count]) => {
      console.log(`  ${group}: ${count}个`);
    });

    // 5. 角色权限说明
    console.log('\n========================================');
    console.log('角色权限说明:');
    console.log('========================================\n');
    console.log('super_admin - 超级管理员');
    console.log('  - 可以管理所有用户和内容');
    console.log('  - 可以发送消息给所有用户组');
    console.log('  - 可以查看所有统计数据\n');

    console.log('admin - 管理员');
    console.log('  - 可以管理普通用户');
    console.log('  - 可以发送消息');
    console.log('  - 可以查看统计数据\n');

    console.log('vip_short - VIP短线用户');
    console.log('  - 只能查看带有 short_term 标签的消息');
    console.log('  - 可以创建讨论和收藏\n');

    console.log('vip_mid - VIP中线用户');
    console.log('  - 只能查看带有 mid_term 标签的消息');
    console.log('  - 可以创建讨论和收藏\n');

    console.log('trial - 体验用户');
    console.log('  - 只能查看带有 all_users 标签的消息');
    console.log('  - 有时间限制（默认7天）');
    console.log('  - 可以创建讨论和收藏\n');

    console.log('消息标签说明:');
    console.log('  - all_users: 全部用户可见（包括体验用户）');
    console.log('  - short_term: VIP短线用户可见');
    console.log('  - mid_term: VIP中线用户可见');
    console.log('  - 消息可以同时有多个标签，例如 ["short_term", "mid_term"]');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

checkUsers();
