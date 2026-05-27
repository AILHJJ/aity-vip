/**
 * 数据库同步脚本：将测试数据库同步到生产数据库
 *
 * 使用场景：项目未正式上线前，用测试环境覆盖生产环境
 *
 * 警告：此操作会清空并覆盖生产数据库的所有数据！
 *
 * 运行方式：
 * cd D:\your-mcp-proxy\AITY_VIP\backend
 * node scripts/sync-test-to-production.js
 */

const mysql = require('mysql2/promise');

// 数据库配置
const DB_HOST = '124.221.119.134';
const DB_PORT = 3306;
const DB_USER = 'fl';
const DB_PASSWORD = 'fl10b312';

const TEST_DB = '投研图灵室_test';
const PROD_DB = '投研图灵室';

// 需要同步的表（按依赖顺序）
const TABLES_TO_SYNC = [
  'users',
  'groups',
  'messages',
  'message_attachments',
  'user_message_reads',
  'user_favorites',
  'discussions',
  'discussion_replies',
  'discussion_favorites',
  'user_settings',
  'vip_orders'
];

async function main() {
  console.log('============================================');
  console.log('  数据库同步工具：测试环境 → 生产环境');
  console.log('============================================');
  console.log();
  console.log(`源数据库: ${TEST_DB}`);
  console.log(`目标数据库: ${PROD_DB}`);
  console.log(`服务器: ${DB_HOST}:${DB_PORT}`);
  console.log();

  // 创建连接
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true
  });

  console.log('✅ 数据库连接成功');
  console.log();

  // 1. 获取测试数据库的表结构
  console.log('📋 步骤 1: 获取测试数据库表结构...');

  const tablesStructure = {};

  for (const table of TABLES_TO_SYNC) {
    try {
      // 获取建表语句
      const [rows] = await connection.query(`SHOW CREATE TABLE \`${TEST_DB}\`.\`${table}\``);
      if (rows.length > 0) {
        tablesStructure[table] = rows[0]['Create Table'];
        console.log(`   ✓ 获取表结构: ${table}`);
      }
    } catch (err) {
      console.log(`   ⚠ 表不存在，跳过: ${table}`);
    }
  }

  console.log();

  // 2. 在生产数据库中重建表
  console.log('📋 步骤 2: 在生产数据库中重建表...');

  // 禁用外键检查
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of Object.keys(tablesStructure)) {
    try {
      // 删除旧表
      await connection.query(`DROP TABLE IF EXISTS \`${PROD_DB}\`.\`${table}\``);
      console.log(`   ✓ 删除旧表: ${table}`);

      // 创建新表
      // 将表名从测试库替换为生产库
      const createSQL = tablesStructure[table].replace(
        new RegExp(`\`${TEST_DB}\`\.`, 'g'),
        `\`${PROD_DB}\`.`
      ).replace(
        new RegExp(`\`${TEST_DB}\``),
        `\`${PROD_DB}\``
      );

      // 提取纯建表语句
      const cleanSQL = createSQL.replace(/CREATE TABLE `[^`]+`\./, 'CREATE TABLE ');

      await connection.query(`CREATE TABLE \`${PROD_DB}\`.${cleanSQL.replace('CREATE TABLE ', '')}`);
      console.log(`   ✓ 创建新表: ${table}`);
    } catch (err) {
      console.log(`   ✗ 创建表失败 ${table}: ${err.message}`);
    }
  }

  // 启用外键检查
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log();

  // 3. 复制数据
  console.log('📋 步骤 3: 复制数据...');

  for (const table of Object.keys(tablesStructure)) {
    try {
      // 获取数据
      const [rows] = await connection.query(`SELECT * FROM \`${TEST_DB}\`.\`${table}\``);

      if (rows.length === 0) {
        console.log(`   - ${table}: 0 行 (空表)`);
        continue;
      }

      // 插入数据
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const columnNames = columns.map(c => `\`${c}\``).join(', ');

      const insertSQL = `INSERT INTO \`${PROD_DB}\`.\`${table}\` (${columnNames}) VALUES (${placeholders})`;

      let successCount = 0;
      let failCount = 0;

      for (const row of rows) {
        try {
          // 处理不同类型的字段数据
          const values = columns.map(c => {
            const val = row[c];
            if (val === null) {
              return null;
            }
            // Date 对象保持原样（mysql2 会自动处理）
            if (val instanceof Date) {
              return val;
            }
            // 如果是普通对象或数组（非 Date），序列化为 JSON 字符串
            if (typeof val === 'object') {
              return JSON.stringify(val);
            }
            return val;
          });
          await connection.query(insertSQL, values);
          successCount++;
        } catch (rowErr) {
          failCount++;
          if (failCount <= 3) {
            console.log(`      警告: 行插入失败 - ${rowErr.message}`);
          }
        }
      }

      if (failCount === 0) {
        console.log(`   ✓ ${table}: ${successCount} 行`);
      } else {
        console.log(`   ⚠ ${table}: 成功 ${successCount} 行, 失败 ${failCount} 行`);
      }
    } catch (err) {
      console.log(`   ✗ 复制数据失败 ${table}: ${err.message}`);
    }
  }

  console.log();

  // 4. 验证同步结果
  console.log('📋 步骤 4: 验证同步结果...');

  for (const table of Object.keys(tablesStructure)) {
    try {
      const [testRows] = await connection.query(`SELECT COUNT(*) as count FROM \`${TEST_DB}\`.\`${table}\``);
      const [prodRows] = await connection.query(`SELECT COUNT(*) as count FROM \`${PROD_DB}\`.\`${table}\``);

      const testCount = testRows[0].count;
      const prodCount = prodRows[0].count;

      if (testCount === prodCount) {
        console.log(`   ✓ ${table}: ${prodCount} 行 (与测试库一致)`);
      } else {
        console.log(`   ⚠ ${table}: 测试库 ${testCount} 行, 生产库 ${prodCount} 行`);
      }
    } catch (err) {
      console.log(`   ✗ 验证失败 ${table}: ${err.message}`);
    }
  }

  console.log();
  console.log('============================================');
  console.log('  同步完成！');
  console.log('============================================');
  console.log();
  console.log('后续步骤:');
  console.log('1. 重启线上后端服务: pm2 restart aity-backend');
  console.log('2. 测试线上API是否正常工作');

  await connection.end();
}

main().catch(err => {
  console.error('同步失败:', err);
  process.exit(1);
});
