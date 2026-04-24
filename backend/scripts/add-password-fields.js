/**
 * 数据库迁移脚本
 * 添加密码安全相关字段
 *
 * 运行方式：
 * cd backend
 * node scripts/add-password-fields.js test        # 测试数据库
 * node scripts/add-password-fields.js production  # 生产数据库
 */

const TARGET_ENV = process.argv[2] || 'test';

if (TARGET_ENV === 'production') {
  require('dotenv').config({ path: '.env.production-remote' });
  console.log('⚠️  注意：正在操作【生产环境】数据库！');
} else {
  require('dotenv').config({ path: '.env.development' });
  console.log('🟢 操作【测试环境】数据库');
}

const sequelize = require('../src/config/db');

async function migrate() {
  console.log('========================================');
  console.log('数据库迁移 - 添加密码安全字段');
  console.log('========================================\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 添加 last_login_at 字段
    try {
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL COMMENT '上次登录时间';
      `);
      console.log('✅ 添加字段: last_login_at');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('⏭️  字段已存在: last_login_at');
      } else {
        throw e;
      }
    }

    // 添加 password_changed_at 字段
    try {
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN password_changed_at DATETIME NULL COMMENT '密码最后修改时间';
      `);
      console.log('✅ 添加字段: password_changed_at');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('⏭️  字段已存在: password_changed_at');
      } else {
        throw e;
      }
    }

    // 添加 is_initial_password 字段
    try {
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN is_initial_password TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否使用初始密码';
      `);
      console.log('✅ 添加字段: is_initial_password');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('⏭️  字段已存在: is_initial_password');
      } else {
        throw e;
      }
    }

    console.log('\n========================================');
    console.log('✅ 迁移完成！');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
