/**
 * 从生产库同步表结构到测试库
 * 使用方式: node scripts/sync-test-db-from-prod.js
 */

const mysql = require('mysql2/promise');

const config = {
  host: '124.221.119.134',
  port: 3306,
  user: 'fl',
  password: 'fl10b312',
  multipleStatements: true,
  charset: 'utf8mb4'
};

const PROD_DB = '投研图灵室';
const TEST_DB = '投研图灵室_test';

async function syncDatabase() {
  let conn;
  
  try {
    console.log('🔄 正在连接数据库...');
    conn = await mysql.createConnection(config);
    console.log('✅ 连接成功');

    // 1. 清空测试库所有表
    console.log('\n🗑️  清空测试库...');
    await conn.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
    await conn.query(`CREATE DATABASE ${TEST_DB} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ 测试库已重建');

    // 2. 获取生产库所有表
    console.log('\n📋 获取生产库表结构...');
    const [tables] = await conn.query(`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`, [PROD_DB]);
    console.log(`找到 ${tables.length} 个表`);

    // 3. 逐个表复制结构和数据
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`   📄 复制表: ${tableName}`);
      
      // 获取建表语句
      const [createSQL] = await conn.query(`SHOW CREATE TABLE \`${PROD_DB}\`.\`${tableName}\``);
      const createStmt = createSQL[0]['Create Table'];
      
      // 在测试库创建表
      await conn.query(`USE ${TEST_DB}`);
      await conn.query(createStmt.replace(new RegExp(`\`${PROD_DB}\`\.`, 'g'), TEST_DB + '.'));
      
      // 复制数据
      await conn.query(`INSERT INTO \`${TEST_DB}\`.\`${tableName}\` SELECT * FROM \`${PROD_DB}\`.\`${tableName}\``);
      console.log(`   ✅ 完成`);
    }

    // 4. 验证
    console.log('\n📊 验证同步结果...');
    const [prodCounts] = await conn.query(`
      SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?
    `, [PROD_DB]);
    
    const [testCounts] = await conn.query(`
      SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?
    `, [TEST_DB]);

    console.log(`\n生产库表数: ${prodCounts[0].cnt}`);
    console.log(`测试库表数: ${testCounts[0].cnt}`);

    console.log('\n✅ 同步完成！');
    console.log('测试库: 投研图灵室_test');
    console.log('可以切换 .env 中的 DB_ENV=test 使用测试库');

  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    throw error;
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

syncDatabase();
