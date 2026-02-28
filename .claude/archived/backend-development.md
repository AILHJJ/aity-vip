# 后端开发规范

> **适用范围**：AITY VIP 项目后端开发
> **技术栈**：Node.js + Express + Sequelize + MySQL
> **核心目标**：提供稳定、安全的API服务

## 🎯 核心原则

1. **使用 Sequelize ORM** 进行数据库操作
2. **统一响应格式**，确保API一致性
3. **使用 JWT** 进行身份认证
4. **使用中间件** 处理通用逻辑（认证、验证、缓存等）
5. **遵循 RESTful API** 设计规范

## 📋 项目结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   │   ├── db.js       # 数据库配置
│   │   └── index.js    # 配置入口
│   ├── controllers/      # 控制器
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── messageController.js
│   │   ├── discussionController.js
│   │   └── statsController.js
│   ├── models/          # 数据模型
│   │   ├── User.js
│   │   ├── Message.js
│   │   ├── Discussion.js
│   │   └── MessageRead.js
│   ├── routes/          # 路由
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── discussionRoutes.js
│   │   └── statsRoutes.js
│   ├── middleware/      # 中间件
│   │   ├── auth.js       # 认证中间件
│   │   ├── validation.js  # 数据验证
│   │   └── errorHandler.js  # 错误处理
│   ├── utils/           # 工具函数
│   │   ├── jwtUtils.js
│   │   └── responseUtils.js
│   └── index.js        # 入口文件
├── .env.development    # 开发环境配置
├── .env.production     # 生产环境配置
├── ecosystem.config.js # PM2配置
└── package.json
```

## 🔧 配置规范

### 环境变量配置

**开发环境（.env.development）：**
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=投研图灵室
DB_USER=fl
DB_PASSWORD=fl10b312

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
DB_USER=fl
DB_PASSWORD=fl10b312

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

CORS_ORIGINS=https://aity88.online:8443
```

## 📊 数据模型规范

### 用户模型（User.js）

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
  expireDate: {
    type: DataTypes.DATE,
    field: 'expire_date',
    allowNull: true,
    comment: '过期日期'
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

### 消息模型（Message.js）

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '消息标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  senderId: {
    type: DataTypes.INTEGER,
    field: 'sender_id',
    allowNull: false,
    comment: '发送者ID'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: '消息标签数组'
  },
  type: {
    type: DataTypes.ENUM('pre_market_comment', 'morning_comment', 'morning_focus', 'afternoon_comment', 'afternoon_focus', 'close_comment', 'risk_warning', 'system', 'important', 'daily'),
    allowNull: false,
    defaultValue: 'daily',
    comment: '消息类型'
  },
  publishTime: {
    type: DataTypes.DATE,
    field: 'publish_time',
    allowNull: true,
    defaultValue: null,
    comment: '定时发布时间'
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'published'),
    allowNull: false,
    defaultValue: 'published',
    comment: '消息状态'
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
  tableName: 'messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  comment: '消息表'
});

module.exports = Message;
```

### 讨论模型（Discussion.js）

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Discussion = sequelize.define('Discussion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    field: 'message_id',
    allowNull: false,
    comment: '关联消息ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false,
    comment: '发起用户ID'
  },
  userName: {
    type: DataTypes.STRING(100),
    field: 'user_name',
    allowNull: false,
    comment: '发起用户名称'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '讨论标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '讨论内容'
  },
  visibility: {
    type: DataTypes.ENUM('private', 'public'),
    allowNull: false,
    defaultValue: 'private',
    comment: '可见性'
  },
  status: {
    type: DataTypes.ENUM('pending', 'replied'),
    allowNull: false,
    defaultValue: 'pending',
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
  tableName: 'discussions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  comment: '讨论表'
});

module.exports = Discussion;
```

## 🎮 控制器规范

### 统一响应格式

```javascript
// src/utils/responseUtils.js

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

module.exports = {
  success,
  error,
  unauthorized,
  forbidden,
  notFound,
  badRequest
};
```

### 认证控制器示例

```javascript
// src/controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwtUtils');
const { success, error, unauthorized } = require('../utils/responseUtils');

async function login(req, res) {
  try {
    const { email, username, password } = req.body;
    
    // 查找用户
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (username) {
      user = await User.findOne({ where: { name: username } });
    }
    
    if (!user) {
      return res.status(401).json(unauthorized('Invalid email/username or password'));
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json(unauthorized('Account is inactive'));
    }
    
    // 检查密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(unauthorized('Invalid email/username or password'));
    }
    
    // 生成token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    res.json(success({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }, 'Login successful'));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  login
};
```

### 消息控制器示例

```javascript
// src/controllers/messageController.js
const { Op } = require('sequelize');
const Message = require('../models/Message');
const { success, error, forbidden } = require('../utils/responseUtils');

async function getMessages(req, res) {
  try {
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    const currentUser = req.user;
    
    const where = {};
    
    // 消息类型过滤
    if (type) {
      where.type = type;
    }
    
    // 时间范围过滤
    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.gte]: new Date(startDate)
      };
    }
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }
    
    // 标签权限过滤（trial用户和管理员不受限制）
    if (currentUser.role !== 'trial' && currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      const allowedTags = currentUser.role === 'vip_mid'
        ? ['中线策略', '全部用户']
        : ['短线策略', '全部用户'];
      
      where[Op.or] = [
        { tags: null },
        sequelize.where(
          sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTags[0])),
          1
        ),
        sequelize.where(
          sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTags[1])),
          1
        )
      ];
    }
    
    // 只查询已发布的消息
    where.status = 'published';
    where.publishTime = {
      [Op.or]: [
        { [Op.is]: null },
        { [Op.lte]: new Date() }
      ]
    };
    
    const { count, rows } = await Message.findAndCountAll({
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
    console.error('Get messages error:', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getMessages
};
```

## 🛣️ 路由规范

### 认证路由

```javascript
// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middleware/validation');

// 登录
router.post('/login', validateLogin, authController.login);

module.exports = router;
```

### 用户路由

```javascript
// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../middleware/auth');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validation');

// 获取用户列表（需要认证）
router.get('/', authenticateToken, userController.getUsers);

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, userController.getCurrentUser);

// 创建用户（需要管理员权限）
router.post('/', authenticateToken, checkAdmin, validateCreateUser, userController.createUser);

// 更新用户（需要认证）
router.put('/:id', authenticateToken, validateUpdateUser, userController.updateUser);

// 删除用户（需要管理员权限）
router.delete('/:id', authenticateToken, checkAdmin, userController.deleteUser);

module.exports = router;
```

## 🔐 认证和授权

### 认证中间件

```javascript
// src/middleware/auth.js
const { verifyToken } = require('../utils/jwtUtils');
const { unauthorized, forbidden } = require('../utils/responseUtils');

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

module.exports = {
  authenticateToken,
  checkAdmin,
  checkSuperAdmin
};
```

## ✅ 数据验证

### 验证中间件

```javascript
// src/middleware/validation.js
const { body, param, validationResult } = require('express-validator');
const { badRequest } = require('../utils/responseUtils');

function validateLogin() {
  return [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(badRequest('Validation failed'));
      }
      next();
    }
  ];
}

function validateCreateUser() {
  return [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial']).withMessage('Invalid role'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(badRequest('Validation failed'));
      }
      next();
    }
  ];
}

module.exports = {
  validateLogin,
  validateCreateUser
};
```

## 📝 错误处理

### 错误处理中间件

```javascript
// src/middleware/errorHandler.js
const { error } = require('../utils/responseUtils');

function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // 处理验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json(error('Validation failed', 400));
  }
  
  // 处理Sequelize错误
  if (err.name === 'SequelizeError') {
    return res.status(500).json(error('Database error', 500));
  }
  
  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(error('Invalid token', 401));
  }
  
  // 默认错误
  return res.status(500).json(error('Internal server error', 500));
}

module.exports = errorHandler;
```

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

## 📋 开发检查清单

在开发后端API时，请确认：

- [ ] 使用 Sequelize ORM 进行数据库操作
- [ ] 使用统一的响应格式
- [ ] 使用 JWT 进行身份认证
- [ ] 使用中间件处理通用逻辑
- [ ] 遵循 RESTful API 设计规范
- [ ] 添加数据验证
- [ ] 添加错误处理
- [ ] 测试API功能
- [ ] 检查端口配置（开发环境3001）

---

**文档维护者**：开发团队
**最后更新**：2026-01-30
**适用范围**：AITY VIP 项目后端开发
