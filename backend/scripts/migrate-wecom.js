/**
 * 企微智能机器人二期 数据库迁移脚本
 * 1. discussions 表加 images 列（JSON，发帖带图）
 * 2. 建 wecom_user_bindings 表（企微 userid ↔ admin 账号绑定）
 *
 * 使用：node scripts/migrate-wecom.js
 * 幂等：可重复执行
 */
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '124.221.119.134',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || '投研图灵室',
  password: process.env.DB_PASSWORD || 'fl10b312'
};

const databases = ['投研图灵室_test', '投研图灵室'];

async function migrate(dbName) {
  const conn = await mysql.createConnection({ ...config, database: dbName });
  try {
    // 1. discussions 加 images 列
    try {
      await conn.query('ALTER TABLE discussions ADD COLUMN images JSON NULL');
      console.log(`[${dbName}] discussions.images 列已添加`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`[${dbName}] discussions.images 已存在，跳过`);
      } else {
        throw err;
      }
    }

    // 2. 建 wecom_user_bindings 表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wecom_user_bindings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wecom_user_id VARCHAR(128) NOT NULL,
        admin_user_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_wecom_user_id (wecom_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log(`[${dbName}] wecom_user_bindings 表已就绪`);

    console.log(`✅ [${dbName}] 迁移完成\n`);
  } finally {
    await conn.end();
  }
}

async function main() {
  console.log('企微机器人二期数据库迁移');
  console.log(`服务器: ${config.host}:${config.port}\n`);
  for (const db of databases) {
    try {
      await migrate(db);
    } catch (err) {
      console.error(`❌ [${db}] 迁移失败: ${err.message}`);
    }
  }
}

main().catch(console.error);
