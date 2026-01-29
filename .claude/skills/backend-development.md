# 后端开发规范

> **适用范围**：AITY VIP 项目后端开发
> **技术栈**：Node.js + Express + Sequelize + MySQL
> **核心目标**：提供稳定、安全的API服务

---

## 🎯 核心原则

1. **使用 Sequelize ORM** 进行数据库操作
2. **统一响应格式**，确保API一致性
3. **使用 JWT** 进行身份认证
4. **使用中间件** 处理通用逻辑（认证、验证、缓存等）
5. **遵循 RESTful API** 设计规范

---

## 📋 项目结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   │   ├── db.js       # 数据库配置
│   │   ├── redis.js    # Redis配置
│   │   └── swagger.js  # Swagger配置
│   ├── controllers/      # 控制器
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── messageController.js
│   │   └── ...
│   ├── models/          # 数据模型
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── ...
│   ├── routes/          # 路由
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── ...
│   ├── middleware/      # 中间件
│   │   ├── validation.js
│   │   ├── cache.js
│   │   └── monitoring.js
│   ├── utils/           # 工具函数
│   │   ├── jwtUtils.js
│   │   └── logger.js
│   └── index.js        # 入口文件
├── .env.development    # 开发环境配置
├── .env.production     # 生产环境配置
├── ecosystem.config.js # PM2配置
└── package.json
```

---

## 🔧 配置规范

### 端口配置

**开发环境：**
- 后端端口：3001
- 前端端口：5173
- API地址：http://localhost:3001/api

**生产环境：**
- 后端端口：3001
- 前端端口：通过Nginx代理
- API地址：https://aity88.online:8443/api

### 数据库配置

**开发环境（.env.development）：**
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=投研图灵室
DB_USER=root
DB_PASSWORD=your-password

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**生产环境（.env.production）：**
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001

DB_HOST=124.221.119.134
DB_PORT=3306
DB_NAME=投研图灵室_test
DB_USER=root
DB_PASSWORD=your-password

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

CORS_ORIGINS=https://aity88.online:8443
```

---

## 📊 数据模型规范

### Sequelize模型定义

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '用户名'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '邮箱'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial'),
    allowNull: false,
    defaultValue: 'trial',
    comment: '角色'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  comment: '用户表'
});

module.exports = User;
```

### 关联关系定义

```javascript
const User = require('./User');
const Message = require('./Message');

// 一个用户可以发送多条消息
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages'
});

// 一条消息属于一个发送者
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'senderUser'
});
```

---

## 🎮 控制器规范

### 统一响应格式

```javascript
function success(data, message = 'Success') {
  return {
    code: 200,
    message,
    data
  };
}

function error(message, code = 500) {
  return {
    code,
    message
  };
}

function unauthorized(message = 'Unauthorized') {
  return {
    code: 401,
    message
  };
}

function forbidden(message = 'Forbidden') {
  return {
    code: 403,
    message
  };
}

function notFound(message = 'Not found') {
  return {
    code: 404,
    message
  };
}

function badRequest(message = 'Bad request') {
  return {
    code: 400,
    message
  };
}
```

### 控制器示例

```javascript
async function getUsers(req, res) {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (role) {
      where.role = role;
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json(success({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }));
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json(error('Server error'));
  }
}
```

---

## 🛣️ 路由规范

### RESTful API设计

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validation');

// 获取用户列表（需要认证）
router.get('/', authenticateToken, userController.getUsers);

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, userController.getCurrentUser);

// 获取指定用户（需要认证）
router.get('/:id', authenticateToken, userController.getUserById);

// 创建用户（需要管理员权限）
router.post('/', authenticateToken, checkAdmin, validateCreateUser, userController.createUser);

// 更新用户（需要认证）
router.put('/:id', authenticateToken, validateUpdateUser, userController.updateUser);

// 删除用户（需要管理员权限）
router.delete('/:id', authenticateToken, checkAdmin, userController.deleteUser);

module.exports = router;
```

### 路由注册

```javascript
// src/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

## 🔐 认证和授权

### JWT认证中间件

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(unauthorized('Access token is required'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json(forbidden('Invalid or expired token'));
  }

  req.user = decoded;
  next();
}
```

### 权限检查中间件

```javascript
function checkAdmin(req, res, next) {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json(forbidden('Admin access is required'));
  }
  next();
}

function checkSuperAdmin(req, res, next) {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json(forbidden('Super admin access is required'));
  }
  next();
}
```

---

## ✅ 数据验证

### 使用express-validator

```javascript
const { body, param, validationResult } = require('express-validator');

function validateCreateUser() {
  return [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial']).withMessage('Invalid role'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 400,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      next();
    }
  ];
}
```

---

## 📝 日志规范

### 使用winston

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
```

---

## ⚠️ 常见错误和解决方案

### 1. 数据库连接失败

**错误**：`SequelizeConnectionError: connect ECONNREFUSED`

**原因**：数据库服务未启动或配置错误

**解决方案**：
- 检查数据库服务是否运行
- 检查.env文件中的数据库配置
- 检查数据库用户名和密码

### 2. JWT验证失败

**错误**：`JsonWebTokenError: jwt malformed`

**原因**：Token格式错误或已过期

**解决方案**：
- 确保Token格式正确：`Bearer <token>`
- 检查JWT_SECRET配置
- 检查Token是否过期

### 3. CORS错误

**错误**：`Access to XMLHttpRequest has been blocked by CORS policy`

**原因**：跨域请求被阻止

**解决方案**：
- 检查CORS配置
- 确保前端地址在CORS_ORIGINS中
- 使用正确的请求头

### 4. 端口被占用

**错误**：`Error: listen EADDRINUSE: address already in use :::3001`

**原因**：端口已被占用

**解决方案**：
```bash
# 检查端口占用
lsof -i :3001

# 杀掉占用端口的进程
kill -9 <PID>
```

---

## 📋 开发检查清单

在开发后端API时，请确认：

- [ ] 使用 Sequelize ORM 进行数据库操作
- [ ] 使用统一的响应格式
- [ ] 使用 JWT 进行身份认证
- [ ] 使用中间件处理通用逻辑
- [ ] 遵循 RESTful API 设计规范
- [ ] 添加数据验证
- [ ] 添加错误处理
- [ ] 添加日志记录
- [ ] 测试API功能
- [ ] 检查端口配置（开发环境3001）

---

**文档维护者**：开发团队
**最后更新**：2026-01-29
**适用范围**：AITY VIP 项目后端开发
