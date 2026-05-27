/**
 * 数据库初始化脚本
 * 用于创建数据库和表结构
 */

require('dotenv').config({ path: '.env.production-remote' });
const { Sequelize } = require('sequelize');

// 数据库配置
const config = {
  host: process.env.DB_HOST || '124.221.119.134',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'fl',
  password: process.env.DB_PASSWORD || 'fl10b312',
};

// 生产数据库名称（先尝试英文名称）
const PROD_DB_NAME = 'aity_vip_prod';
const TEST_DB_NAME = 'aity_vip_test';

async function initDatabase() {
  console.log('==========================================');
  console.log('🔧 数据库初始化工具');
  console.log('==========================================\n');

  // 第1步：连接MySQL服务器（不指定数据库）
  console.log('【步骤1/4】连接MySQL服务器...');
  let sequelize;
  try {
    sequelize = new Sequelize('', config.user, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'mysql',
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ 连接成功\n');
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    process.exit(1);
  }

  // 第2步：创建数据库
  console.log('【步骤2/4】创建数据库...');
  try {
    // 创建生产数据库
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${PROD_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 创建生产数据库: ${PROD_DB_NAME}`);

    // 创建测试数据库
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${TEST_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 创建测试数据库: ${TEST_DB_NAME}\n`);

    // 关闭连接
    await sequelize.close();
  } catch (error) {
    console.error('❌ 创建数据库失败:', error.message);
    await sequelize.close();
    process.exit(1);
  }

  // 第3步：连接到生产数据库并创建表结构
  console.log('【步骤3/4】创建表结构...');
  try {
    // 连接到生产数据库
    const dbSequelize = new Sequelize(PROD_DB_NAME, config.user, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    });

    await dbSequelize.authenticate();
    console.log(`✅ 连接到数据库: ${PROD_DB_NAME}`);

    // 导入所有模型
    console.log('\n导入数据模型...');
    const Group = require('../src/models/Group');
    const User = require('../src/models/User');
    const Message = require('../src/models/Message');
    const MessageAttachment = require('../src/models/MessageAttachment');
    const UserFavorite = require('../src/models/UserFavorite');
    const UserMessageRead = require('../src/models/UserMessageRead');
    const Discussion = require('../src/models/Discussion');
    const DiscussionReply = require('../src/models/DiscussionReply');
    const DiscussionFavorite = require('../src/models/DiscussionFavorite');
    const AiConfig = require('../src/models/AiConfig');

    console.log('✅ 所有模型导入成功');

    // 创建表（使用 alter: true 来更新现有表结构）
    console.log('\n同步数据库表结构...');
    await dbSequelize.sync({ alter: true });
    console.log('✅ 表结构创建成功');

    // 第4步：运行迁移脚本
    console.log('\n【步骤4/4】运行数据库迁移...');
    const migrations = [
      '20260227-add-bio-column.sql',
      '20260227-add-ai-optimization.sql',
      'create_ai_configs_table.sql',
      '20260227-ai-optimization-complete.sql',
      '20260227-ai-config-upgrade.sql'
    ];

    const fs = require('fs');
    const path = require('path');

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, '../migrations', migration);
      if (fs.existsSync(migrationPath)) {
        console.log(`\n运行迁移: ${migration}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        try {
          await dbSequelize.query(sql);
          console.log(`✅ ${migration} 完成`);
        } catch (e) {
          console.log(`⚠️  ${migration} 跳过 (可能已运行): ${e.message.substring(0, 100)}`);
        }
      }
    }

    await dbSequelize.close();

    console.log('\n==========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('==========================================');
    console.log(`\n生产数据库: ${PROD_DB_NAME}`);
    console.log(`测试数据库: ${TEST_DB_NAME}`);
    console.log(`\n下一步: 运行 npm run create-test-data 创建测试数据`);

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行初始化
initDatabase().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
