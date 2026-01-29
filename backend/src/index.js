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
require('dotenv').config();

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

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  });
}

// 导出app供测试使用
module.exports = app;