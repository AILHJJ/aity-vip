/**
 * 测试数据库同步脚本
 * 
 * 功能：从生产库同步数据到测试库（用于开发测试）
 * 使用前请确保测试库已创建
 * 
 * 使用方式：
 *   node sync-test-db.js          // 同步所有数据
 *   node sync-test-db.js --tables  // 仅同步表结构
 *   node sync-test-db.js --dry-run // 预览同步内容
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  host: process.env.DB_HOST || '124.221.119.134',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || '投研图灵室',
  password: process.env.DB_PASSWORD || 'fl10b312',
  prodDb: '投研图灵室',
  testDb: '投研图灵室_test',
  tables: [
    'users',
    'messages', 
    'discussions',
    'discussion_replies',
    'message_categories',
    'groups',
    'user_favorites',
    'user_message_reads',
    'discussion_favorites',
    'ai_configs'
  ]
};

// 命令行参数
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tablesOnly = args.includes('--tables');

async function syncDatabase() {
  console.log('🔄 测试数据库同步工具\n');
  console.log('=' .repeat(50));
  
  if (dryRun) {
    console.log('⚠️  预览模式 - 不会执行任何更改\n');
  }
  
  console.log(`生产库: ${config.prodDb}`);
  console.log(`测试库: ${config.testDb}`);
  console.log('=' .repeat(50) + '\n');
  
  let prodConn, testConn;
  
  try {
    // 连接数据库
    console.log('📡 正在连接数据库...');
    
    prodConn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.prodDb,
      multipleStatements: true
    });
    
    testConn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.testDb,
      multipleStatements: true
    });
    
    console.log('✅ 数据库连接成功\n');
    
    if (dryRun) {
      console.log('📋 预览待同步的表和数据量:\n');
    }
    
    // 同步每个表
    for (const table of config.tables) {
      process.stdout.write(`处理表 ${table}... `);
      
      try {
        if (tablesOnly) {
          // 仅同步表结构
          const [createStmt] = await prodConn.query(`SHOW CREATE TABLE \`${table}\``);
          if (createStmt && createStmt[0]) {
            const createSQL = createStmt[0]['Create Table'];
            if (dryRun) {
              console.log(`\n  [预览] CREATE TABLE: ${createSQL.substring(0, 80)}...`);
            } else {
              // 先删除现有表
              await testConn.query(`DROP TABLE IF EXISTS \`${table}\``);
              // 创建新表
              await testConn.query(createSQL);
              console.log('✅ 结构已同步');
            }
          }
        } else {
          // 同步表结构和数据
          const [rows] = await prodConn.query(`SELECT * FROM \`${table}\``);
          
          if (dryRun) {
            console.log(`✅ ${rows.length} 条记录待同步`);
          } else {
            if (rows.length > 0) {
              // 禁用外键检查
              await testConn.query('SET FOREIGN_KEY_CHECKS = 0');
              
              // 清空表
              await testConn.query(`TRUNCATE TABLE \`${table}\``);
              
              // 插入数据
              for (const row of rows) {
                const columns = Object.keys(row);
                const values = Object.values(row);
                
                // 处理日期格式
                const processedValues = values.map(v => {
                  if (v instanceof Date) {
                    return v.toISOString().slice(0, 19).replace('T', ' ');
                  }
                  return v;
                });
                
                const placeholders = columns.map(() => '?').join(', ');
                await testConn.query(
                  `INSERT INTO \`${table}\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`,
                  processedValues
                );
              }
              
              // 重新启用外键检查
              await testConn.query('SET FOREIGN_KEY_CHECKS = 1');
            }
            console.log(`✅ ${rows.length} 条记录已同步`);
          }
        }
      } catch (err) {
        console.log(`❌ 失败: ${err.message}`);
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    
    if (dryRun) {
      console.log('\n✅ 预览完成！');
      console.log('   如需执行同步，请运行: node sync-test-db.js');
    } else {
      console.log('\n✅ 数据库同步完成！');
      console.log('\n📝 注意事项:');
      console.log('   - 测试库密码已重置，请使用测试账号登录');
      console.log('   - 生产库用户密码保持不变');
    }
    
  } catch (error) {
    console.error('\n❌ 同步失败:', error.message);
    console.error('\n请检查:');
    console.error('   1. 数据库服务器是否可访问');
    console.error('   2. 测试库是否已创建（运行 create-test-db.sql）');
    console.error('   3. 数据库账号密码是否正确');
  } finally {
    if (prodConn) await prodConn.end();
    if (testConn) await testConn.end();
  }
}

// 执行
syncDatabase();
