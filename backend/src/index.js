// 主应用文件
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

// 导入日志工具
const logger = require('./utils/logger');

// 导入路由
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const statsRoutes = require('./routes/statsRoutes');
const healthRoutes = require('./routes/healthRoutes');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// 日志中间件
app.use(logger.requestLogger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', healthRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Private Sharing App Backend API' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// 错误处理
app.use(logger.errorLogger);

// 启动服务器
app.listen(PORT, HOST, () => {
  logger.info(`Server is running on ${HOST}:${PORT}`);
});