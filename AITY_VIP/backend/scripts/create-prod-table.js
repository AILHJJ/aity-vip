const mysql = require('mysql2/promise');

async function createProdTable() {
  const config = {
    host: '124.221.119.134',
    port: 3306,
    user: '投研图灵室',
    password: 'fl10b312',
    database: '投研图灵室'
  };

  console.log('🔧 为生产库创建 message_types 表...\n');

  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ 连接生产库成功');

    // 创建表
    const sql = `
      CREATE TABLE IF NOT EXISTS \`message_types\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`type\` VARCHAR(50) NOT NULL UNIQUE COMMENT '类型标识',
        \`label\` VARCHAR(100) NOT NULL COMMENT '显示名称',
        \`color\` VARCHAR(20) DEFAULT '#667eea' COMMENT '主题色',
        \`icon\` VARCHAR(50) DEFAULT '' COMMENT '图标',
        \`sort_order\` INT DEFAULT 0 COMMENT '排序',
        \`is_active\` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息类型表'
    `;

    await conn.query(sql);
    console.log('✅ 表创建成功: message_types');

    // 检查是否已有数据
    const [[count]] = await conn.query('SELECT COUNT(*) as count FROM message_types');
    console.log('📊 当前数据量:', count.count);

    if (count.count === 0) {
      // 从测试库复制数据
      console.log('\n📥 从测试库复制数据...');
      
      try {
        // 复制数据
        const [result] = await conn.query(`
          INSERT INTO \`message_types\` (\`type\`, \`label\`, \`color\`, \`icon\`, \`sort_order\`, \`is_active\`)
          SELECT \`type\`, \`label\`, \`color\`, \`icon\`, \`sort_order\`, \`is_active\` 
          FROM \`投研图灵室_test\`.\`message_types\`
        `);
        console.log('✅ 复制完成，新增', result.affectedRows, '条记录');
      } catch (e) {
        console.log('⚠️ 复制失败，可能表已存在或数据重复');
      }
    }

    // 显示所有类型
    const [types] = await conn.query('SELECT * FROM message_types ORDER BY sort_order, id');
    console.log('\n📋 消息类型列表:');
    types.forEach(t => console.log(`   [${t.id}] ${t.icon} ${t.label} (${t.type})`));

    await conn.end();
    console.log('\n✅ 生产库 message_types 表已就绪！');
    process.exit(0);
  } catch (err) {
    console.log('❌ 失败:', err.message);
    process.exit(1);
  }
}

createProdTable();
