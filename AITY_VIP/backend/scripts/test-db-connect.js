// 测试数据库连接
// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.DB_ENV = 'test';

// 加载环境变量
require('dotenv').config({ path: './.env.development' });

const db = require('../src/config/db');

console.log('🔍 测试数据库连接...\n');
console.log('📊 目标数据库:', db.config.database);
console.log('🔧 配置用户名:', db.config.username);
console.log('🔧 配置密码:', db.config.password ? '已设置' : '未设置');

db.authenticate()
  .then(() => {
    console.log('✅ 数据库连接成功！');
    
    // 查询测试库中的表
    return db.query('SHOW TABLES', { type: db.QueryTypes.SHOWTABLES });
  })
  .then(tables => {
    console.log('\n📋 ' + db.config.database + ' 中的表:');
    tables.forEach(t => console.log('   -', t));
    console.log('\n✅ 测试完成！');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ 失败:', err.message);
    process.exit(1);
  });
