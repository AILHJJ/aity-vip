const mysql = require('mysql2/promise');

async function verifyTestDb() {
  const config = {
    host: '124.221.119.134',
    port: 3306,
    user: '投研图灵室',
    password: 'fl10b312',
    database: '投研图灵室_test'
  };

  console.log('🔍 验证测试库...\n');

  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ 测试库连接成功！\n');

    // 列出所有表
    const [tables] = await conn.query('SHOW TABLES');
    console.log('📋 测试库中的表:');
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [[{count}]] = await conn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`   - ${tableName}: ${count} 条数据`);
    }

    // 检查 message_types 表内容
    const [types] = await conn.query('SELECT * FROM message_types');
    console.log('\n📨 消息类型:');
    types.forEach(t => console.log(`   - [${t.id}] ${t.name}`));

    await conn.end();
    console.log('\n✅ 验证完成！测试库已就绪');
    process.exit(0);
  } catch (err) {
    console.log('❌ 验证失败:', err.message);
    process.exit(1);
  }
}

verifyTestDb();
