/**
 * 统一标签格式为JSON数组
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixTagsFormat() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('✅ 数据库连接成功\n');

  try {
    // 查找所有不是JSON数组格式的标签
    const [messages] = await conn.query(`
      SELECT id, title, tags
      FROM messages
      WHERE tags NOT LIKE '[%'
    `);

    console.log(`📊 需要修复的消息数: ${messages.length}\n`);

    for (const message of messages) {
      let tagsArray;

      // 处理逗号分隔的字符串
      if (typeof message.tags === 'string' && message.tags.includes(',')) {
        tagsArray = message.tags.split(',');
      } else {
        // 单个标签
        tagsArray = [message.tags];
      }

      const newTagsJson = JSON.stringify(tagsArray);

      await conn.query(
        'UPDATE messages SET tags = ? WHERE id = ?',
        [newTagsJson, message.id]
      );

      console.log(`✅ ID ${message.id}: ${message.title}`);
      console.log(`   ${message.tags} -> ${newTagsJson}`);
    }

    console.log('\n✅ 标签格式统一完成！');

    // 验证结果
    const [allMessages] = await conn.query('SELECT COUNT(*) as total FROM messages WHERE tags LIKE "[%"');
    console.log(`\n📊 JSON格式消息数: ${allMessages[0].total}/${await conn.query('SELECT COUNT(*) as total FROM messages').then(r => r[0].total)}`);

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await conn.end();
  }
}

fixTagsFormat();
