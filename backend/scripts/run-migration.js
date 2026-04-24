/**
 * 执行数据库迁移脚本 - 修复版
 */
const mysql = require('mysql2/promise');

async function runMigration() {
  console.log('🔄 数据库迁移工具\n');
  
  // 连接数据库
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '124.221.119.134',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || '投研图灵室',
    password: process.env.DB_PASSWORD || 'fl10b312',
    database: '投研图灵室'  // 生产库
  });
  
  console.log('✅ 数据库连接成功');
  console.log('📦 数据库: 投研图灵室\n');
  
  try {
    // 1. 检查表是否存在
    const [tables] = await conn.query('SHOW TABLES LIKE "message_types"');
    
    if (tables.length === 0) {
      console.log('📝 创建 message_types 表...');
      
      // 创建表
      await conn.query(`
        CREATE TABLE IF NOT EXISTS message_types (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50) NOT NULL UNIQUE COMMENT '类型标识',
          label VARCHAR(100) NOT NULL COMMENT '显示名称',
          color VARCHAR(20) NOT NULL DEFAULT '#667eea' COMMENT '标签颜色',
          icon VARCHAR(50) DEFAULT '' COMMENT '图标',
          sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
          is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
          description VARCHAR(255) DEFAULT '' COMMENT '描述',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uk_type (type),
          KEY idx_sort_order (sort_order),
          KEY idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息类型配置表'
      `);
      console.log('✅ 表创建成功\n');
    } else {
      console.log('📋 message_types 表已存在\n');
    }
    
    // 2. 插入默认数据（使用 INSERT IGNORE 避免重复）
    console.log('📝 插入默认消息类型...');
    
    const defaultTypes = [
      ['position_handle', '持仓处理', '#ef4444', '📊', 1, '持仓处理相关消息'],
      ['pre_market_comment', '盘前点评', '#f59e0b', '🌅', 2, '开盘前的市场点评'],
      ['morning_comment', '早盘点评', '#10b981', '☀️', 3, '早盘市场分析'],
      ['morning_focus', '早盘关注', '#06b6d4', '🎯', 4, '早盘重点关注标的'],
      ['afternoon_comment', '午盘点评', '#8b5cf6', '🌤️', 5, '午盘市场分析'],
      ['afternoon_focus', '午盘关注', '#ec4899', '💫', 6, '午盘重点关注标的'],
      ['close_comment', '收盘点评', '#6366f1', '🌙', 7, '收盘总结与分析'],
      ['risk_warning', '风险提示', '#dc2626', '⚠️', 8, '风险警示消息'],
      ['system', '系统消息', '#64748b', '🔔', 9, '系统通知类消息'],
      ['important', '重要消息', '#eab308', '⭐', 10, '重要通知'],
      ['daily', '日常消息', '#667eea', '📝', 11, '日常消息']
    ];
    
    for (const type of defaultTypes) {
      await conn.query(`
        INSERT IGNORE INTO message_types 
        (type, label, color, icon, sort_order, is_active, description) 
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `, type);
    }
    console.log('✅ 默认数据插入完成\n');
    
    // 3. 查询验证
    const [rows] = await conn.query('SELECT * FROM message_types ORDER BY sort_order');
    console.log('📋 当前消息类型列表:');
    console.log('─'.repeat(50));
    rows.forEach(row => {
      console.log(`  ${String(row.icon || '•').padEnd(3)} ${row.label.padEnd(10)} [${row.type}] ${row.color}`);
    });
    console.log('─'.repeat(50));
    console.log(`总计: ${rows.length} 个类型\n`);
    
    console.log('✅ 迁移完成！');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error(error.stack);
  } finally {
    await conn.end();
  }
}

runMigration();
