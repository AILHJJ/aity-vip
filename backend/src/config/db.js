// 数据库配置
// 注意：dotenv 由 src/index.js 根据 NODE_ENV 加载对应 .env 文件
// 这里不再重复 require('dotenv').config()，避免覆盖已加载的环境变量
const { Sequelize } = require('sequelize');

// ============================================
// 环境判断
// ============================================
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_ENV = process.env.DB_ENV || 'test'; // 'test' 或 'production'

// ============================================
// 数据库配置
// ============================================

// 根据环境选择数据库名称
const getDatabaseName = () => {
  // 如果 .env 中明确指定了 DB_NAME，优先使用
  if (process.env.DB_NAME) {
    return process.env.DB_NAME;
  }

  // 否则根据 DB_ENV 自动选择
  if (DB_ENV === 'production') {
    return '投研图灵室'; // 生产数据库
  } else {
    return '投研图灵室_test'; // 测试数据库
  }
};

const dbName = getDatabaseName();

// 创建 Sequelize 连接
const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 10,           // 最大连接数（降低以减少服务器压力）
      min: 2,            // 最小连接数
      acquire: 180000,   // 获取连接超时：180秒（3分钟）
      idle: 30000,       // 空闲连接超时：30秒（快速回收）
      evict: 60000       // 连接回收时间：60秒
    },
    dialectOptions: {
      // 增加MySQL连接超时和重试配置
      connectTimeout: 180000,  // 连接超时180秒（3分钟）
      multipleStatements: false,
      // 启用 keepAlive 以保持连接
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    },
    retry: {
      max: 5,  // 最大重试次数（从3次增加到5次）
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /SequelizeConnectionAcquireTimeoutError/,
        /ECONNRESET/,
        /ETIMEDOUT/
      ]
    },
    // 添加查询超时配置
    query: {
      timeout: 15000,  // 单个查询超时15秒
      logging: NODE_ENV === 'development' ? console.log : false
    },
    define: {
      timestamps: true,
      underscored: true
    },
    logging: false // 关闭SQL日志以减少IO
  }
);

// ============================================
// 连接测试
// ============================================
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    console.log(`   环境: ${DB_ENV === 'production' ? '🔴 生产环境' : '🟢 测试环境'}`);
    console.log(`   数据库: ${dbName}`);
    console.log(`   地址: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  } catch (error) {
    console.error('❌ 数据库连接失败');
    console.error(`   环境: ${DB_ENV}`);
    console.error(`   数据库: ${dbName}`);
    console.error(`   错误: ${error.message}`);
    console.warn('⚠️  服务器将在无数据库连接的情况下继续运行');
  }
}

// 异步测试连接，不阻塞服务器启动
testConnection();

// ============================================
// 连接健康检查和自动重连
// ============================================
let isHealthy = true;
let healthCheckInterval = null;

// 检查数据库连接健康状态
async function healthCheck() {
  try {
    await sequelize.authenticate();
    if (!isHealthy) {
      console.log('🔄 数据库连接已恢复');
      isHealthy = true;
    }
  } catch (error) {
    if (isHealthy) {
      console.error('⚠️  数据库连接异常，尝试重连中...', error.message);
      isHealthy = false;
    }
    // 尝试重新连接
    try {
      await sequelize.authenticate();
      console.log('✅ 数据库重连成功');
      isHealthy = true;
    } catch (retryError) {
      // 静默失败，等待下次健康检查
    }
  }
}

// 每30秒检查一次连接健康状态
if (NODE_ENV === 'production' || DB_ENV === 'test') {
  healthCheckInterval = setInterval(healthCheck, 30000);

  // 优雅关闭时清除定时器
  process.on('SIGINT', () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
  });

  process.on('SIGTERM', () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
  });
}

// 导出配置信息供其他模块使用
sequelize.config = {
  env: DB_ENV,
  dbName: dbName,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306
};

module.exports = sequelize;