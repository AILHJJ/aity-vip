const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '124.221.119.134',
    port: 3306,
    user: '投研图灵室',
    password: 'fl10b312',
    database: '投研图灵室'
  });
  
  // 查看表结构
  const [fields] = await conn.query('DESCRIBE users');
  console.log('📋 users表结构:');
  fields.forEach(f => {
    console.log(`   ${f.Field.padEnd(20)} ${f.Type.padEnd(20)} ${f.Null}`);
  });
  
  // 查看所有数据
  console.log('\n📋 用户数据:');
  const [users] = await conn.query('SELECT * FROM users LIMIT 10');
  users.forEach(u => {
    console.log(`   ${JSON.stringify(u)}`);
  });
  
  await conn.end();
})();
