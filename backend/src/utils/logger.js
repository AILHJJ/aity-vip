const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 创建日志目录
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}${metadata ? ' ' + JSON.stringify(metadata) : ''}`;
  })
);

// 创建不同级别的日志文件
const errorTransport = new winston.transports.File({
  filename: path.join(logDir, 'error.log'),
  level: 'error',
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  format: logFormat
});

const infoTransport = new winston.transports.File({
  filename: path.join(logDir, 'info.log'),
  level: 'info',
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  format: logFormat
});

const combinedTransport = new winston.transports.File({
  filename: path.join(logDir, 'combined.log'),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  format: logFormat
});

// 控制台输出
const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, metadata }) => {
      return `${timestamp} [${level}] ${message}${metadata ? ' ' + JSON.stringify(metadata) : ''}`;
    })
  )
});

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'aity-vip-backend' },
  transports: [
    errorTransport,
    infoTransport,
    combinedTransport,
    consoleTransport
  ]
});

// 扩展 logger 方法
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, headers, body } = req;
  
  // 过滤敏感信息
  const safeBody = { ...body };
  if (safeBody.password) safeBody.password = '******';
  if (safeBody.token) safeBody.token = '******';
  
  logger.debug('HTTP Request', {
    method,
    url,
    headers: { 'user-agent': headers['user-agent'], 'content-type': headers['content-type'] },
    body: safeBody
  });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    logger.info('HTTP Response', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};

logger.errorLogger = (err, req, res, next) => {
  const { method, url } = req;
  
  logger.error('HTTP Error', {
    method,
    url,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
};

module.exports = logger;
