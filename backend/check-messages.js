require('dotenv').config();
const sequelize = require('./src/config/db');
const Message = require('./src/models/Message');

async function checkMessages() {
  try {
    console.log('正在查询数据库消息...\n');

    // 1. 查询消息总数
    const count = await Message.count();
    console.log('========================================');
    console.log(`消息总数: ${count}`);
    console.log('========================================\n');

    // 2. 查询所有消息
    const messages = await Message.findAll({
      attributes: ['id', 'title', 'tags', 'type', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    console.log('========================================');
    console.log('最近50条消息列表:');
    console.log('========================================\n');

    messages.forEach((m, index) => {
      console.log(`${index + 1}. ID: ${m.id}`);
      console.log(`   标题: ${m.title}`);
      console.log(`   标签: ${JSON.stringify(m.tags)}`);
      console.log(`   类型: ${m.type}`);
      console.log(`   状态: ${m.status}`);
      console.log(`   创建时间: ${m.createdAt}`);
      console.log('');
    });

    // 3. 统计标签分布
    console.log('========================================');
    console.log('标签分布统计:');
    console.log('========================================\n');

    const tagCounts = {};
    messages.forEach(m => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    console.log('标签使用次数:');
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count}次`);
      });

    // 4. 统计类型分布
    console.log('\n========================================');
    console.log('消息类型分布:');
    console.log('========================================\n');

    const typeCounts = {};
    messages.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });

    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}条`);
      });

    // 5. 统计状态分布
    console.log('\n========================================');
    console.log('消息状态分布:');
    console.log('========================================\n');

    const statusCounts = {};
    messages.forEach(m => {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}条`);
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

checkMessages();
