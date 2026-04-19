// 测试8888端口的腾讯云数据库
const mysql = require('mysql2/promise');

async function testTencentDB() {
  console.log('==========================================');
  console.log('🔍 腾讯云数据库连接测试');
  console.log('==========================================\n');

  const config = {
    host: '124.221.119.134',
    port: 8888,  // 腾讯云数据库端口
    user: 'fl',
    password: 'fl10b312'
  };

  console.log('📡 连接配置:');
  console.log(`   主机: ${config.host}`);
  console.log(`   端口: ${config.port} ⭐️`);
  console.log(`   用户: ${config.user}`);
  console.log(`   密码: ${config.password ? '***' : '(empty)'}\n`);

  try {
    console.log('🔄 正在连接...');
    const conn = await mysql.createConnection(config);
    console.log('✅ 连接成功！\n');

    // 列出所有数据库
    console.log('📊 可用数据库:');
    const [dbs] = await conn.execute('SHOW DATABASES');
    dbs.forEach(db => {
      const dbName = Object.values(db)[0];
      console.log(`   - ${dbName}`);
    });

    // 检查业务数据库
    const businessDBs = dbs.filter(db => {
      const name = Object.values(db)[0];
      return !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(name);
    });

    if (businessDBs.length > 0) {
      console.log('\n📁 业务数据库详情:');
      for (const db of businessDBs) {
        const dbName = Object.values(db)[0];
        try {
          await conn.execute(`USE \`${dbName}\``);
          const [tables] = await conn.execute('SHOW TABLES');
          console.log(`\n   🗃️  ${dbName}:`);
          console.log(`      表数量: ${tables.length}`);

          if (tables.length > 0) {
            console.log(`      表列表:`);
            for (const t of tables) {
              const tableName = Object.values(t)[0];
              console.log(`         - ${tableName}`);

              // 查询表记录数
              try {
                const [count] = await conn.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
                console.log(`           记录数: ${count[0].cnt}`);
              } catch (e) {
                // 忽略查询错误
              }
            }
          }
        } catch (e) {
          console.log(`   ❌ 无法访问 ${dbName}: ${e.message}`);
        }
      }
    } else {
      console.log('\n⚠️  未找到业务数据库');
    }

    await conn.end();
    console.log('\n==========================================');
    console.log('✅ 测试完成');
    console.log('==========================================');

  } catch (error) {
    console.error('\n❌ 连接失败');
    console.error(`错误代码: ${error.code}`);
    console.error(`错误信息: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 端口8888可能无法访问');
      console.error('   请检查:');
      console.error('   1. 腾讯云安全组是否开放8888端口');
      console.error('   2. 数据库实例是否正在运行');
      console.error('   3. 端口号是否正确');
    }

    console.log('\n==========================================');
  }
}

testTencentDB().catch(console.error);
