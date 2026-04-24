// ============================================
// 数据库连接诊断工具
// 用于诊断和解决MySQL权限问题
// ============================================

const mysql = require('mysql2/promise');

async function diagnoseDatabaseConnection() {
  console.log('==========================================');
  console.log('🔍 数据库连接诊断');
  console.log('==========================================\n');

  const problemHost = '58.49.104.171'; // 当前客户端IP
  const dbConfigs = [
    {
      name: '腾讯云数据库 - 投研图灵室用户',
      host: '124.221.119.134',
      port: 3306,
      user: '投研图灵室',
      password: 'fl10b312'
    },
    {
      name: '腾讯云数据库 - fl用户',
      host: '124.221.119.134',
      port: 3306,
      user: 'fl',
      password: 'fl10b312'
    }
  ];

  console.log('🌐 当前客户端IP:', problemHost);
  console.log('📍 数据库主机: 124.221.119.134:3306\n');

  for (const dbConfig of dbConfigs) {
    console.log('==========================================');
    console.log('测试配置:', dbConfig.name);
    console.log('==========================================');

    const config = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    };

    console.log('配置信息:');
    console.log('  主机:', config.host);
    console.log('  端口:', config.port);
    console.log('  用户:', config.user);
    console.log('  密码:', config.password ? '***' : '(empty)');
    console.log('');

    try {
      console.log('🔄 正在尝试连接...');
      const conn = await mysql.createConnection(config);
      console.log('✅ 连接成功！\n');

      // 获取数据库列表
      const [dbs] = await conn.execute('SHOW DATABASES');
      console.log('📊 可用数据库:');
      dbs.forEach(db => {
        const dbName = Object.values(db)[0];
        console.log('   -', dbName);
      });
      console.log('');

      // 检查当前用户权限
      const [grants] = await conn.execute('SHOW GRANTS FOR CURRENT_USER()');
      console.log('📋 当前用户权限:');
      grants.forEach(grant => {
        const grantText = Object.values(grant)[0];
        console.log('   ', grantText);
      });
      console.log('');

      await conn.end();

      console.log('==========================================');
      console.log('✅ 数据库连接正常！');
      console.log('==========================================\n');
      return; // 成功连接，退出测试

    } catch (error) {
      console.error('❌ 连接失败');
      console.error('   错误代码:', error.code);
      console.error('   错误信息:', error.message);
      console.log('');

      if (error.code === 'ER_HOST_NOT_PRIVILEGED') {
        console.log('💡 问题分析:');
        console.log('   当前IP地址 (' + problemHost + ') 没有被授权访问数据库');
        console.log('');
        console.log('🔧 解决方案:');
        console.log('   请在腾讯云数据库管理界面执行以下操作:');
        console.log('');
        console.log('   方法1: 通过phpMyAdmin Web界面');
        console.log('   1. 访问: https://124.221.119.134:8888/database/mysql');
        console.log('   2. 登录后，点击 "权限" 标签');
        console.log('   3. 编辑用户 "' + config.user + '" 的权限');
        console.log('   4. 添加主机 "' + problemHost + '" 或选择 "任意主机 (%)"');
        console.log('   5. 刷新权限');
        console.log('');
        console.log('   方法2: 通过SQL命令 (需要管理员权限)');
        console.log("   GRANT ALL PRIVILEGES ON *.* TO '" + config.user + "'@'" + problemHost + "' IDENTIFIED BY '" + config.password + "';");
        console.log("   FLUSH PRIVILEGES;");
        console.log('');
        console.log('   方法3: 授权所有IP (仅用于开发测试)');
        console.log("   GRANT ALL PRIVILEGES ON *.* TO '" + config.user + "'@'%' IDENTIFIED BY '" + config.password + "';");
        console.log("   FLUSH PRIVILEGES;");
        console.log('');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('💡 问题分析:');
        console.log('   连接超时，可能是:');
        console.log('   1. 防火墙阻止了端口访问');
        console.log('   2. 数据库服务未启动');
        console.log('   3. 端口号配置错误');
        console.log('');
        console.log('🔧 解决方案:');
        console.log('   1. 检查腾讯云安全组配置，确保3306端口开放');
        console.log('   2. 确认数据库服务正在运行');
        console.log('   3. 检查端口号是否正确');
        console.log('');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('💡 问题分析:');
        console.log('   连接被拒绝，可能是:');
        console.log('   1. 数据库服务未启动');
        console.log('   2. 端口号错误');
        console.log('   3. 网络配置问题');
        console.log('');
      }

      console.log('==========================================\n');
    }
  }

  console.log('==========================================');
  console.log('📝 诊断总结');
  console.log('==========================================');
  console.log('❌ 数据库连接失败，需要解决权限问题');
  console.log('');
  console.log('🔗 相关链接:');
  console.log('   - phpMyAdmin: https://124.221.119.134:8888/database/mysql');
  console.log('   - 腾讯云控制台: https://console.cloud.tencent.com/cdb');
  console.log('');
}

// 执行诊断
diagnoseDatabaseConnection().catch(console.error);
