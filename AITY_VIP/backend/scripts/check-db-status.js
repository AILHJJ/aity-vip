/**
 * 数据库状态检查脚本
 * 
 * 功能：检查开发和生产数据库的连接状态和数据情况
 * 
 * 使用方式：
 *   node scripts/check-db-status.js
 */

const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '124.221.119.134',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || '投研图灵室',
  password: process.env.DB_PASSWORD || 'fl10b312',
  databases: ['投研图灵室', '投研图灵室_test']
};

async function checkDatabase(dbName) {
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 ${dbName}`);
  console.log('=' .repeat(50));
  
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: dbName
    });
    
    console.log('✅ 连接成功\n');
    
    // 获取所有表
    const [tables] = await conn.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('📭 数据库为空，未创建任何表');
      return;
    }
    
    console.log(`📋 表列表 (${tables.length} 个表):\n`);
    
    const tableList = [];
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      // 获取表的行数
      const [countResult] = await conn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const rowCount = countResult[0].count;
      
      tableList.push({ name: tableName, count: rowCount });
      
      const countDisplay = rowCount > 0 ? `🔢 ${rowCount} 条` : '📭 空表';
      console.log(`   • ${tableName.padEnd(25)} ${countDisplay}`);
    }
    
    // 统计
    const totalRows = tableList.reduce((sum, t) => sum + t.count, 0);
    console.log('\n' + '-'.repeat(50));
    console.log('📈 总计: ' + tableList.length + ' 个表, ' + totalRows + ' 条数据');
    
  } catch (error) {
    console.log(`❌ 连接失败: ${error.message}`);
    
    // 常见错误判断
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 提示: 数据库不存在，请先运行 create-test-db.sql 创建');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 无法连接到数据库服务器，请检查网络和配置');
    }
  } finally {
    if (conn) await conn.end();
  }
}

async function main() {
  console.log('\n🔍 数据库状态检查工具');
  console.log('=' .repeat(50));
  console.log(`📡 服务器: ${config.host}:${config.port}`);
  console.log(`👤 用户: ${config.user}`);
  console.log(`🔧 当前环境: ${process.env.DB_ENV || '未设置'}`);
  
  for (const db of config.databases) {
    await checkDatabase(db);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('💡 相关命令:');
  console.log('   npm run db:sync       - 同步生产数据到测试库');
  console.log('   npm run db:sync:dry   - 预览同步内容');
  console.log('   npm run db:init       - 初始化测试数据');
  console.log('=' .repeat(50) + '\n');
}

main().catch(console.error);
