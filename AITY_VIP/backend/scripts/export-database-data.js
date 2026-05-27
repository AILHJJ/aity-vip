/**
 * 导出数据库完整数据脚本
 * 用于从现有数据库导出所有数据
 */

require('dotenv').config({ path: '.env.production-remote' });
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 数据库配置
const config = {
  host: process.env.DB_HOST || '124.221.119.134',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'fl',
  password: process.env.DB_PASSWORD || 'fl10b312',
};

// 可能的数据库名称
const POSSIBLE_DB_NAMES = [
  '投研图灵室_v2',
  'aity_vip_prod',
  '投研图灵室',
  'aity_vip'
];

async function exportDatabase() {
  console.log('==========================================');
  console.log('📦 数据库导出工具');
  console.log('==========================================\n');

  let sequelize;
  let dbName = null;

  // 第1步：查找正确的数据库
  console.log('【步骤1/5】查找数据库...');
  try {
    sequelize = new Sequelize('', config.user, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'mysql',
      logging: false
    });

    await sequelize.authenticate();

    // 查询所有数据库
    const [databases] = await sequelize.query('SHOW DATABASES');
    const dbList = databases.map(db => Object.values(db)[0]);

    console.log('📋 现有数据库列表:');
    dbList.forEach(db => console.log(`   - ${db}`));

    // 查找目标数据库
    for (const possibleName of POSSIBLE_DB_NAMES) {
      if (dbList.includes(possibleName)) {
        dbName = possibleName;
        break;
      }
    }

    if (!dbName) {
      console.log('\n⚠️  未找到预设数据库，请选择:');
      dbList.forEach((db, index) => {
        if (!['information_schema', 'performance_schema', 'mysql', 'sys'].includes(db)) {
          console.log(`   ${index + 1}. ${db}`);
        }
      });
      throw new Error('未找到目标数据库');
    }

    console.log(`\n✅ 找到数据库: ${dbName}\n`);

    // 关闭连接
    await sequelize.close();
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    if (sequelize) await sequelize.close();
    process.exit(1);
  }

  // 第2步：连接到目标数据库
  console.log('【步骤2/5】连接数据库...');
  try {
    sequelize = new Sequelize(dbName, config.user, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'mysql',
      logging: false,
      timezone: '+08:00'
    });

    await sequelize.authenticate();
    console.log(`✅ 连接成功: ${dbName}\n`);
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    if (sequelize) await sequelize.close();
    process.exit(1);
  }

  // 第3步：导出数据
  console.log('【步骤3/5】导出数据...');

  const tables = [
    'groups_table',
    'users',
    'message_attachments',
    'messages',
    'user_favorites',
    'user_message_reads',
    'discussions',
    'discussion_replies',
    'discussion_favorites',
    'ai_config'
  ];

  const exportData = {};

  for (const table of tables) {
    try {
      console.log(`📊 导出表: ${table}`);

      // 检查表是否存在
      const [tablesResult] = await sequelize.query(`SHOW TABLES LIKE '${table}'`);

      if (tablesResult.length === 0) {
        console.log(`   ⚠️  表不存在，跳过\n`);
        continue;
      }

      // 查询所有数据
      const [rows] = await sequelize.query(`SELECT * FROM ${table}`);
      exportData[table] = rows;

      console.log(`   ✅ 导出 ${rows.length} 条记录\n`);
    } catch (error) {
      console.log(`   ❌ 导出失败: ${error.message}\n`);
    }
  }

  // 第4步：生成SQL文件
  console.log('【步骤4/5】生成SQL文件...');

  const sqlContent = generateSQL(exportData, dbName);

  // 保存文件
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `database-export-${timestamp}.sql`;
  const filepath = path.join(__dirname, filename);

  fs.writeFileSync(filepath, sqlContent, 'utf8');
  console.log(`✅ SQL文件已保存: ${filename}\n`);

  // 第5步：生成统计报告
  console.log('【步骤5/5】生成统计报告...');
  console.log('\n==========================================');
  console.log('📊 数据导出统计');
  console.log('==========================================');

  let totalRecords = 0;
  for (const [table, rows] of Object.entries(exportData)) {
    const count = rows ? rows.length : 0;
    totalRecords += count;
    console.log(`${table.padEnd(30)} ${count.toString().padStart(6)} 条`);
  }

  console.log('------------------------------------------');
  console.log(`${'总计'.padEnd(30)} ${totalRecords.toString().padStart(6)} 条`);
  console.log('==========================================');
  console.log(`\n✅ 导出完成！文件: ${filename}`);
  console.log(`\n📝 使用方法:`);
  console.log(`   1. 创建新数据库: CREATE DATABASE \`新数据库名\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`   2. 导入数据: mysql -u root -p 新数据库名 < ${filename}`);
  console.log('==========================================\n');

  await sequelize.close();
}

function generateSQL(exportData, dbName) {
  let sql = '';

  // 文件头
  sql += `-- =====================================================\n`;
  sql += `-- AITY VIP 数据库完整导出\n`;
  sql += `-- 导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
  sql += `-- 源数据库: ${dbName}\n`;
  sql += `-- =====================================================\n\n`;

  // 创建数据库
  sql += `-- =====================================================\n`;
  sql += `-- 第一步：创建数据库\n`;
  sql += `-- =====================================================\n\n`;
  sql += `DROP DATABASE IF EXISTS \`投研图灵室_v2\`;\n`;
  sql += `CREATE DATABASE \`投研图灵室_v2\`\n`;
  sql += `  CHARACTER SET utf8mb4\n`;
  sql += `  COLLATE utf8mb4_unicode_ci;\n\n`;
  sql += `USE \`投研图灵室_v2\`;\n\n`;

  // 表结构（使用已有的表结构）
  sql += `-- =====================================================\n`;
  sql += `-- 第二步：创建表结构\n`;
  sql += `-- =====================================================\n\n`;

  // 表结构定义
  const tableStructures = {
    groups_table: `CREATE TABLE IF NOT EXISTS \`groups_table\` (
  \`id\` VARCHAR(50) PRIMARY KEY COMMENT '分组ID',
  \`name\` VARCHAR(100) NOT NULL COMMENT '分组名称',
  \`description\` TEXT COMMENT '分组描述',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户分组表';`,

    users: `CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  \`name\` VARCHAR(100) NOT NULL COMMENT '用户名称',
  \`email\` VARCHAR(100) UNIQUE COMMENT '邮箱地址（可选）',
  \`password\` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  \`role\` ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial') NOT NULL DEFAULT 'trial' COMMENT '用户角色',
  \`group_id\` VARCHAR(50) COMMENT '所属分组ID',
  \`avatar\` VARCHAR(100) COMMENT '头像URL',
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '账户状态',
  \`expire_date\` DATE COMMENT 'VIP过期日期',
  \`bio\` TEXT COMMENT '用户简介（资产规模、分享偏好等）',
  \`last_login_at\` DATETIME COMMENT '上次登录时间',
  \`password_changed_at\` DATETIME COMMENT '密码最后修改时间',
  \`is_initial_password\` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否使用初始密码',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX \`idx_role\` (\`role\`),
  INDEX \`idx_group_id\` (\`group_id\`),
  INDEX \`idx_status\` (\`status\`),
  INDEX \`idx_expire_date\` (\`expire_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';`,

    message_attachments: `CREATE TABLE IF NOT EXISTS \`message_attachments\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '附件ID',
  \`message_id\` INT NOT NULL COMMENT '消息ID',
  \`file_name\` VARCHAR(255) NOT NULL COMMENT '文件名',
  \`file_url\` VARCHAR(500) NOT NULL COMMENT '文件URL',
  \`file_type\` VARCHAR(50) COMMENT '文件类型',
  \`file_size\` INT COMMENT '文件大小（字节）',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX \`idx_message_id\` (\`message_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息附件表';`,

    messages: `CREATE TABLE IF NOT EXISTS \`messages\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  \`title\` VARCHAR(255) NOT NULL COMMENT '消息标题',
  \`content\` TEXT NOT NULL COMMENT '消息内容',
  \`type\` ENUM('pre_market_comment', 'morning_comment', 'morning_focus', 'afternoon_comment', 'afternoon_focus', 'close_comment', 'risk_warning', 'system', 'important', 'daily') NOT NULL DEFAULT 'daily' COMMENT '消息类型',
  \`sender\` VARCHAR(100) NOT NULL COMMENT '发送者名称',
  \`sender_id\` INT NOT NULL COMMENT '发送者用户ID',
  \`group_id\` VARCHAR(50) NOT NULL COMMENT '目标分组ID',
  \`read_count\` INT NOT NULL DEFAULT 0 COMMENT '已读人数',
  \`total_count\` INT NOT NULL DEFAULT 0 COMMENT '总人数',
  \`tags\` JSON COMMENT '消息标签数组',
  \`theme\` VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT 'Markdown主题样式',
  \`original_content\` TEXT COMMENT '原始内容（AI优化前）',
  \`ai_optimized_content\` TEXT COMMENT 'AI优化后的内容',
  \`publish_time\` DATETIME COMMENT '定时发布时间',
  \`status\` ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'published' COMMENT '发布状态',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX \`idx_type\` (\`type\`),
  INDEX \`idx_group_id\` (\`group_id\`),
  INDEX \`idx_status\` (\`status\`),
  INDEX \`idx_created_at\` (\`created_at\`),
  INDEX \`idx_publish_time\` (\`publish_time\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';`,

    user_favorites: `CREATE TABLE IF NOT EXISTS \`user_favorites\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
  \`user_id\` INT NOT NULL COMMENT '用户ID',
  \`message_id\` INT NOT NULL COMMENT '消息ID',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY \`unique_user_message\` (\`user_id\`, \`message_id\`),
  INDEX \`idx_user_id\` (\`user_id\`),
  INDEX \`idx_message_id\` (\`message_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';`,

    user_message_reads: `CREATE TABLE IF NOT EXISTS \`user_message_reads\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  \`user_id\` INT NOT NULL COMMENT '用户ID',
  \`message_id\` INT NOT NULL COMMENT '消息ID',
  \`read_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  UNIQUE KEY \`unique_user_message_read\` (\`user_id\`, \`message_id\`),
  INDEX \`idx_user_id\` (\`user_id\`),
  INDEX \`idx_message_id\` (\`message_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户消息已读表';`,

    discussions: `CREATE TABLE IF NOT EXISTS \`discussions\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '讨论ID',
  \`message_id\` INT NOT NULL COMMENT '关联消息ID',
  \`user_id\` INT NOT NULL COMMENT '发起用户ID',
  \`user_name\` VARCHAR(100) NOT NULL COMMENT '发起用户名',
  \`title\` VARCHAR(255) NOT NULL COMMENT '讨论标题',
  \`content\` TEXT NOT NULL COMMENT '讨论内容',
  \`status\` ENUM('pending', 'replied') NOT NULL DEFAULT 'pending' COMMENT '回复状态',
  \`visibility\` ENUM('private', 'public') NOT NULL DEFAULT 'private' COMMENT '可见性',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX \`idx_message_id\` (\`message_id\`),
  INDEX \`idx_user_id\` (\`user_id\`),
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论表';`,

    discussion_replies: `CREATE TABLE IF NOT EXISTS \`discussion_replies\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '回复ID',
  \`discussion_id\` INT NOT NULL COMMENT '讨论ID',
  \`user_id\` INT NOT NULL COMMENT '回复用户ID',
  \`user_name\` VARCHAR(100) NOT NULL COMMENT '回复用户名',
  \`content\` TEXT NOT NULL COMMENT '回复内容',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX \`idx_discussion_id\` (\`discussion_id\`),
  INDEX \`idx_user_id\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论回复表';`,

    discussion_favorites: `CREATE TABLE IF NOT EXISTS \`discussion_favorites\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  \`user_id\` INT NOT NULL COMMENT '用户ID',
  \`discussion_id\` INT NOT NULL COMMENT '讨论ID',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY \`unique_user_discussion\` (\`user_id\`, \`discussion_id\`),
  INDEX \`idx_discussion_id\` (\`discussion_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论收藏表';`,

    ai_config: `CREATE TABLE IF NOT EXISTS \`ai_config\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  \`model_name\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'AI模型名称',
  \`display_name\` VARCHAR(100) COMMENT '显示名称',
  \`api_key\` VARCHAR(255) NOT NULL COMMENT 'API密钥',
  \`base_url\` VARCHAR(255) NOT NULL COMMENT 'API基础URL',
  \`prompt_template\` TEXT COMMENT '提示词模板',
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  \`default_version\` ENUM('original', 'ai_optimized') NOT NULL DEFAULT 'ai_optimized' COMMENT '默认版本',
  \`provider\` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '厂商代码',
  \`provider_name\` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '厂商名称',
  \`description\` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '模型简介',
  \`features\` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '模型特点',
  \`status\` ENUM('available', 'insufficient_balance', 'error', 'unknown') NOT NULL DEFAULT 'unknown' COMMENT '可用状态',
  \`sort_order\` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX \`idx_model_name\` (\`model_name\`),
  INDEX \`idx_is_active\` (\`is_active\`),
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI配置表';`
  };

  for (const [table, structure] of Object.entries(tableStructures)) {
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- ${table}\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sql += structure + ';\n\n';
  }

  // 插入数据
  sql += `-- =====================================================\n`;
  sql += `-- 第三步：插入数据\n`;
  sql += `-- =====================================================\n\n`;

  // 禁用外键检查
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  for (const [table, rows] of Object.entries(exportData)) {
    if (!rows || rows.length === 0) continue;

    sql += `-- -----------------------------------------------------\n`;
    sql += `-- ${table}: ${rows.length} 条记录\n`;
    sql += `-- -----------------------------------------------------\n`;

    // 重置自增ID
    sql += `ALTER TABLE \`${table}\` AUTO_INCREMENT = 1;\n`;

    // 生成INSERT语句
    const columns = Object.keys(rows[0]);
    const columnsStr = columns.map(col => `\`${col}\``).join(', ');

    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'string') {
          // 转义特殊字符
          let escapedVal = val
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "''")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
          return `'${escapedVal}'`;
        }
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      }).join(', ');

      sql += `INSERT INTO \`${table}\` (${columnsStr}) VALUES (${values});\n`;
    }

    sql += '\n';
  }

  // 恢复外键检查
  sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;

  // 完成
  sql += `-- =====================================================\n`;
  sql += `-- 完成！\n`;
  sql += `-- =====================================================\n`;

  return sql;
}

// 运行导出
exportDatabase().catch(error => {
  console.error('❌ 导出失败:', error.message);
  console.error(error.stack);
  process.exit(1);
});
