// 测试数据库连接脚本
require('dotenv').config({ path: '.env.test' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
  }
);

async function testConnection() {
  try {
    console.log('=== 测试数据库连接 ===');
    console.log('数据库配置:');
    console.log('  Host:', process.env.DB_HOST);
    console.log('  Port:', process.env.DB_PORT);
    console.log('  Database:', process.env.DB_NAME);
    console.log('  User:', process.env.DB_USER);
    console.log('  Password:', process.env.DB_PASSWORD ? '***' : '(empty)');

    // 测试连接
    await sequelize.authenticate();
    console.log('\n✅ 数据库连接成功！');

    // 查询数据库信息
    const [results] = await sequelize.query('SELECT DATABASE() as db');
    console.log('\n当前数据库:', results[0].db);

    // 查询所有表
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\n数据库中的表:');
    if (tables.length === 0) {
      console.log('  (无表)');
    } else {
      tables.forEach(table => {
        console.log('  -', Object.values(table)[0]);
      });
    }

    // 测试创建表
    console.log('\n=== 测试创建表 ===');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100)
      )
    `);
    console.log('✅ 创建测试表成功');

    // 测试删除表
    await sequelize.query('DROP TABLE IF EXISTS test_table');
    console.log('✅ 删除测试表成功');

    console.log('\n🎉 所有数据库操作测试通过！');

  } catch (error) {
    console.error('\n❌ 数据库测试失败:');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    console.error('SQL状态:', error.sqlState);
  } finally {
    await sequelize.close();
  }
}

testConnection();
