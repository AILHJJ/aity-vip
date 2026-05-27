const mysql = require('mysql2/promise');

async function test() {
  // 测试数据库
  let conn = await mysql.createConnection({
    host: '124.221.119.134',
    user: 'fl',
    password: 'fl10b312',
    database: '投研图灵室_test'
  });
  let [rows] = await conn.query('SELECT COUNT(*) as cnt FROM users');
  console.log('测试库 users:', rows[0].cnt);
  [rows] = await conn.query('SELECT COUNT(*) as cnt FROM messages');
  console.log('测试库 messages:', rows[0].cnt);
  await conn.end();

  // 生产数据库
  conn = await mysql.createConnection({
    host: '124.221.119.134',
    user: 'fl',
    password: 'fl10b312',
    database: '投研图灵室'
  });
  [rows] = await conn.query('SELECT COUNT(*) as cnt FROM users');
  console.log('生产库 users:', rows[0].cnt);
  [rows] = await conn.query('SELECT COUNT(*) as cnt FROM messages');
  console.log('生产库 messages:', rows[0].cnt);
  await conn.end();
}

test().catch(console.error);
