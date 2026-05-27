const mysql = require('mysql2/promise');

async function checkTestDb() {
  const config = {
    host: '124.221.119.134',
    port: 3306,
    user: '投研图灵室',
    password: 'fl10b312'
  };

  console.log('🔍 检查测试库状态...\n');

  // 连接MySQL服务器
  const conn = await mysql.createConnection(config);
  console.log('✅ 连接成功\n');

  // 列出所有数据库
  const [databases] = await conn.query("SHOW DATABASES LIKE '%test%'");
  console.log('📦 测试相关数据库:');
  databases.forEach(db => {
    console.log('   -', Object.values(db)[0]);
  });

  // 检查测试库是否存在
  const dbName = '投研图灵室_test';
  const [[dbExists]] = await conn.query(`SHOW DATABASES LIKE ?`, [dbName]);
  
  if (dbExists) {
    console.log('\n✅ 测试库已存在:', dbName);
    
    // 切换到测试库
    await conn.query(`USE \`${dbName}\``);
    
    // 列出表
    const [tables] = await conn.query('SHOW TABLES');
    console.log('\n📋 测试库中的表:');
    if (tables.length === 0) {
      console.log('   (空表，需要复制表结构)');
    } else {
      tables.forEach(t => {
        console.log('   -', Object.values(t)[0]);
      });
    }

    // 检查权限
    const [[userResult]] = await conn.query(`
      SELECT Host, User FROM mysql.user 
      WHERE User = '投研图灵室' AND Host = '%'
    `);
    
    console.log('\n🔐 远程访问权限:');
    if (userResult) {
      console.log('   ✅ 已授权 (Host=%): 可以从任何IP访问');
    } else {
      console.log('   ⚠️ 未授权远程访问');
    }
  } else {
    console.log('\n❌ 测试库不存在:', dbName);
  }

  // 比较两个库的数据量
  console.log('\n📊 数据库对比:');
  
  const [prodTables] = await conn.query('SELECT COUNT(*) as count FROM `投研图灵室`.messages');
  console.log('   生产库 messages:', prodTables[0].count, '条');
  
  try {
    const [testTables] = await conn.query('SELECT COUNT(*) as count FROM `投研图灵室_test`.messages');
    console.log('   测试库 messages:', testTables[0].count, '条');
  } catch (e) {
    console.log('   测试库 messages: ❌ 表不存在');
  }

  await conn.end();
  console.log('\n✅ 检查完成');
}

checkTestDb().catch(console.error);
