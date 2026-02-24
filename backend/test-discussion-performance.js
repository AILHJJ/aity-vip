// 测试创建讨论的性能
require('dotenv').config();
const sequelize = require('./src/config/db');
const Discussion = require('./src/models/Discussion');
const User = require('./src/models/User');
const Message = require('./src/models/Message');

async function testDiscussionCreation() {
  console.log('开始测试创建讨论性能...\n');

  const startTime = Date.now();

  try {
    console.log('1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log(`   ✅ 数据库连接成功 (${Date.now() - startTime}ms)\n`);

    // 先查询一个存在的用户
    console.log('2. 查询存在的用户...');
    const existingUser = await User.findOne({
      attributes: ['id', 'name', 'avatar', 'role', 'groupId'],
      limit: 1
    });

    if (!existingUser) {
      throw new Error('数据库中没有用户数据');
    }

    console.log(`   找到用户: ${existingUser.name} (ID: ${existingUser.id})\n`);

    // 测试查询用户
    console.log(`3. 测试查询用户 (userId=${existingUser.id})...`);
    const userStart = Date.now();
    const user = await User.findByPk(existingUser.id, {
      attributes: ['id', 'name', 'avatar', 'role', 'groupId']
    });
    console.log(`   ✅ 用户查询完成 (${Date.now() - userStart}ms)`);
    console.log(`   用户: ${user?.name}\n`);

    // 测试查询消息
    console.log('4. 测试查询消息 (messageId=93)...');
    const msgStart = Date.now();
    const message = await Message.findByPk(93, {
      attributes: ['id', 'title', 'type', 'status']
    });
    console.log(`   ✅ 消息查询完成 (${Date.now() - msgStart}ms)`);
    console.log(`   消息: ${message?.title}\n`);

    // 测试创建讨论
    console.log('5. 测试创建讨论...');
    const createStart = Date.now();
    const discussion = await Discussion.create({
      messageId: 93,
      userId: user.id,
      userName: user.name,
      title: message.title,
      content: '性能测试讨论',
      visibility: 'private',
      status: 'pending'
    });
    console.log(`   ✅ 讨论创建完成 (${Date.now() - createStart}ms)`);
    console.log(`   讨论ID: ${discussion.id}\n`);

    const totalTime = Date.now() - startTime;
    console.log('='.repeat(50));
    console.log(`✅ 总耗时: ${totalTime}ms`);
    console.log('='.repeat(50));

    if (totalTime > 10000) {
      console.log('\n⚠️  警告: 总耗时超过10秒，可能存在性能问题');
    } else if (totalTime > 5000) {
      console.log('\n⚠️  警告: 总耗时超过5秒，建议优化');
    } else {
      console.log('\n✅ 性能良好，可以正常使用');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await sequelize.close();
  }
}

testDiscussionCreation();
