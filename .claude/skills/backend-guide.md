# 后端开发指南

> 精简版 - 核心规范和常用模式

---

## 项目结构

```
backend/
├── src/
│   ├── config/           # 配置（db.js, index.js）
│   ├── controllers/      # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── middleware/      # 中间件（auth, validation）
│   └── utils/           # 工具（jwtUtils, responseUtils）
├── .env.development     # 开发环境配置
├── .env.production      # 生产环境配置
└── ecosystem.config.js  # PM2配置
```

---

## 数据模型

### User 用户模型
```javascript
// 字段: id, name, email, password, role, status, expireDate, groupId
role: ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial')
status: ENUM('active', 'inactive')
```

### Message 消息模型
```javascript
// 字段: id, title, content, senderId, tags, type, publishTime, status, isPinned
tags: JSON  // ['短线策略', '中线策略', '全部用户']
type: ENUM('pre_market_comment', 'morning_comment', 'daily', ...)
status: ENUM('draft', 'scheduled', 'published')
```

### Discussion 讨论模型
```javascript
// 字段: id, messageId, userId, title, content, visibility, status
visibility: ENUM('private', 'public')
status: ENUM('pending', 'replied')
```

---

## 统一响应格式

```javascript
// src/utils/responseUtils.js
const success = (data, message = 'Success') => ({
  code: 200, message, data
});

const error = (message, code = 500) => ({
  code, message
});

const unauthorized = (message = 'Unauthorized') => ({
  code: 401, message
});

const forbidden = (message = 'Forbidden') => ({
  code: 403, message
});

module.exports = { success, error, unauthorized, forbidden };
```

---

## 认证中间件

```javascript
// src/middleware/auth.js
const { verifyToken } = require('../utils/jwtUtils');
const { unauthorized, forbidden } = require('../utils/responseUtils');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json(unauthorized('需要登录'));

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json(forbidden('Token无效或已过期'));

  req.user = decoded;
  next();
}

function checkAdmin(req, res, next) {
  if (!['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json(forbidden('需要管理员权限'));
  }
  next();
}

module.exports = { authenticateToken, checkAdmin };
```

---

## 路由规范

```javascript
// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdmin } = require('../middleware/auth');

// 公开接口
router.post('/login', authController.login);

// 需要认证
router.get('/', authenticateToken, userController.getUsers);
router.get('/me', authenticateToken, userController.getCurrentUser);

// 需要管理员权限
router.post('/', authenticateToken, checkAdmin, userController.createUser);
router.delete('/:id', authenticateToken, checkAdmin, userController.deleteUser);

module.exports = router;
```

---

## 控制器示例

```javascript
// src/controllers/messageController.js
const { Op } = require('sequelize');
const Message = require('../models/Message');
const { success, error } = require('../utils/responseUtils');

async function getMessages(req, res) {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    const currentUser = req.user;

    const where = { status: 'published' };
    if (type) where.type = type;

    // 标签权限过滤
    if (!['trial', 'super_admin', 'admin'].includes(currentUser.role)) {
      const allowedTags = currentUser.role === 'vip_mid'
        ? ['中线策略', '全部用户']
        : ['短线策略', '全部用户'];

      where[Op.or] = [
        { tags: null },
        // JSON_CONTAINS 权限检查
      ];
    }

    const { count, rows } = await Message.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json(success({
      data: rows,
      pagination: { total: count, page, limit, pages: Math.ceil(count / limit) }
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('服务器错误'));
  }
}

module.exports = { getMessages };
```

---

## 环境配置

### 开发环境 (.env.development)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=投研图灵室
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### 生产环境 (.env.production)
```env
NODE_ENV=production
PORT=3001
DB_HOST=124.221.119.134
DB_NAME=投研图灵室_test
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://aity88.online:8443
```

---

## 常见错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| ECONNREFUSED | 数据库未启动 | 检查MySQL服务 |
| JsonWebTokenError | Token无效 | 检查JWT_SECRET |
| CORS错误 | 跨域被阻止 | 检查CORS_ORIGINS |
| EADDRINUSE | 端口被占用 | `lsof -i :3001` 查找并终止 |

---

## 开发检查清单

- [ ] 使用 Sequelize ORM
- [ ] 统一响应格式
- [ ] JWT 身份认证
- [ ] 权限中间件
- [ ] RESTful API 设计
- [ ] 错误处理

---

**详细文档**: `docs/core/API文档.md`
**更新**: 2026-02-28
