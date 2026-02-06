/**
 * 修复消息标签格式
 * 将中文标签转换为英文标签，匹配后端代码逻辑
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixTags() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
  });

  console.log('✅ 数据库连接成功\n');

  try {
    // 1. 查看当前数据
    const [messages] = await conn.query('SELECT id, title, tags FROM messages');
    console.log(`📊 当前消息总数: ${messages.length}\n`);

    console.log('修复前的标签:');
    messages.forEach(m => {
      console.log(`  ID: ${m.id}, 标签: ${m.tags}`);
    });
    console.log('\n');

    // 2. 更新标签格式
    console.log('🔄 开始修复标签格式...\n');

    for (const message of messages) {
      let newTags;
      const oldTags = message.tags;

      // 将字符串转换为数组
      let tagsArray;
      if (typeof oldTags === 'string') {
        try {
          tagsArray = JSON.parse(oldTags);
        } catch (e) {
          console.log(`⚠️  消息 ${message.id} 的标签格式错误: ${oldTags}`);
          continue;
        }
      } else if (Array.isArray(oldTags)) {
        tagsArray = oldTags;
      } else {
        console.log(`⚠️  消息 ${message.id} 的标签类型: ${typeof oldTags}`);
        continue;
      }

      // 转换中文标签为英文标签
      newTags = tagsArray.map(tag => {
        const tagMap = {
          '中线策略': 'mid_term',
          '短线策略': 'short_term',
          '全部用户': 'all_users',
          'all': 'all_users'
        };
        return tagMap[tag] || tag;
      });

      // 更新数据库
      const newTagsJson = JSON.stringify(newTags);
      await conn.query(
        'UPDATE messages SET tags = ? WHERE id = ?',
        [newTagsJson, message.id]
      );

      console.log(`✅ 消息 ${message.id}: "${message.title}"`);
      console.log(`   旧标签: ${oldTags}`);
      console.log(`   新标签: ${newTagsJson}\n`);
    }

    // 3. 验证修复结果
    const [updatedMessages] = await conn.query('SELECT id, title, tags FROM messages');
    console.log('\n✅ 修复完成！验证结果:\n');
    console.log('修复后的标签:');
    updatedMessages.forEach(m => {
      console.log(`  ID: ${m.id}, 标签: ${m.tags}`);
    });

    // 4. 统计各类型消息
    const [stats] = await conn.query(`
      SELECT
        JSON_CONTAINS(tags, '"all_users"') as all_users,
        JSON_CONTAINS(tags, '"mid_term"') as mid_term,
        JSON_CONTAINS(tags, '"short_term"') as short_term,
        COUNT(*) as count
      FROM messages
      GROUP BY
        JSON_CONTAINS(tags, '"all_users"'),
        JSON_CONTAINS(tags, '"mid_term"'),
        JSON_CONTAINS(tags, '"short_term"')
    `);

    console.log('\n📊 标签分布统计:');
    stats.forEach(s => {
      const types = [];
      if (s.all_users) types.push('全部用户');
      if (s.mid_term) types.push('中线策略');
      if (s.short_term) types.push('短线策略');
      console.log(`  ${types.join(' + ')}: ${s.count}条`);
    });

    console.log('\n✅ 所有标签已修复完成！');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await conn.end();
  }
}

fixTags();
