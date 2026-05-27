const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '124.221.119.134',
    port: 3306,
    user: '投研图灵室',
    password: 'fl10b312',
    database: '投研图灵室'
  });
  
  // 检查消息类型表
  const [tables] = await conn.query('SHOW TABLES LIKE "message_types"');
  console.log('message_types 表存在:', tables.length > 0);
  
  if (tables.length > 0) {
    const [rows] = await conn.query('SELECT * FROM message_types');
    console.log('消息类型数据:', JSON.stringify(rows, null, 2));
  }
  
  await conn.end();
})();
