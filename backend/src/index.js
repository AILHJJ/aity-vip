// 主应用文件
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');
const { trackRequest, trackError, getMetrics } = require('./middleware/monitoring');
const { startUserExpirySync } = require('./services/userExpiryService');

// ============================================
// 环境变量自动加载
// 根据 NODE_ENV 自动选择对应的 .env 文件
// ============================================
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFileMap = {
  production: '.env.production',
  test: '.env.test',
  development: '.env.development'
};
const envFile = envFileMap[NODE_ENV] || '.env.development';
const envPath = path.resolve(__dirname, `../${envFile}`);

// 加载对应环境的配置文件
const dotenvResult = require('dotenv').config({ path: envPath });

if (dotenvResult.error) {
  console.warn(`⚠️  未找到环境配置文件: ${envFile}，使用默认 .env`);
  require('dotenv').config();
} else {
  console.log(`✅ 已加载环境配置: ${envFile}`);
}

// 导入路由
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const statsRoutes = require('./routes/statsRoutes');
const healthRoutes = require('./routes/healthRoutes');
const versionRoutes = require('./routes/versionRoutes');
const monitorRoutes = require('./routes/monitorRoutes');
const uploadRoutes = require('./routes/upload');
const marketRoutes = require('./routes/marketRoutes');
const aiAdvisorRoutes = require('./routes/aiAdvisorRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const aiRoutes = require('./routes/ai');
const messageTypeRoutes = require('./routes/messageTypeRoutes');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://aity88.online:8443',
      'https://aity88.online',
      'http://aity88.online:8443',
      'http://aity88.online'
    ];

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 微信小程序请求不带origin头，直接允许
    // H5请求需要验证origin
    if (!origin) {
      // 没有origin头（微信小程序、移动应用等），允许访问
      callback(null, true);
    } else if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      // origin在白名单中，允许访问
      callback(null, true);
    } else if (origin.includes('aity88.online')) {
      // 允许所有来自 aity88.online 的请求（包括不同端口）
      callback(null, true);
    } else {
      // 其他情况，记录并拒绝访问
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', ALLOWED_ORIGINS);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 预检请求缓存24小时
};

// 安全头部配置
const securityHeaders = {
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"],
      frameAncestors: ["'none'"]
    }
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
};

// 中间件配置
app.use(cors(corsOptions));
app.use(helmet(securityHeaders));
app.use(trackRequest);

// 增加请求超时限制（2分钟，考虑慢速网络）
app.use((req, res, next) => {
  res.setTimeout(120000, () => {
    console.error(`[请求超时] ${req.method} ${req.url} - 超过120秒`);
    res.status(408).json({
      code: 408,
      message: 'Request timeout',
      data: null
    });
  });
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// 请求日志中间件(移到body-parser之后,这样才能正确打印请求体)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[请求开始] ${req.method} ${req.url}`, {
      query: req.query,
      body: req.body ? JSON.stringify(req.body).substring(0, 200) : 'none'
    });

    // 记录响应完成
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[请求完成] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  });
}

// 静态文件服务 (带CORS支持)
app.use('/uploads', (req, res, next) => {
  // CORS 头
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

  // CORP 头 (解决 OpaqueResponseBlocking)
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'credentialless');

  // 允许图片缓存
  res.header('Cache-Control', 'public, max-age=31536000');

  next();
}, express.static(path.join(__dirname, '../uploads')));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/version', versionRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai-advisor', aiAdvisorRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/message-types', messageTypeRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Private Sharing App Backend API' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    logger.info('Server started', {
      port: PORT,
      host: HOST,
      environment: NODE_ENV,
      allowedOrigins: ALLOWED_ORIGINS
    });
    startUserExpirySync();
  });
}

// 导出app供测试使用
module.exports = app;
