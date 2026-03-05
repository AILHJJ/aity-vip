# 环境配置说明

> **文档版本**: v1.0.0
> **更新日期**: 2026-03-05
> **适用人群**: 开发者、运维人员

---

## 目录

- [环境架构](#环境架构)
- [本地开发环境配置](#本地开发环境配置)
- [生产环境配置](#生产环境配置)
- [环境变量说明](#环境变量说明)
- [数据库配置](#数据库配置)
- [版本管理](#版本管理)

---

## 环境架构

### 环境区分策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           环境架构                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  开发环境 (npm run dev:*)                                                │
│  ├── 前端: 本地运行 (localhost 或局域网IP)                               │
│  ├── 后端: 本地运行 (localhost:3001)                                     │
│  └── 数据库: 测试库 (投研图灵室_test)                                    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  生产环境 (npm run build:*)                                              │
│  ├── 前端: 编译后部署到微信服务器                                        │
│  ├── 后端: 生产服务器 (aity88.online:8443)                               │
│  └── 数据库: 生产库 (投研图灵室)                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 环境对比

| 环境变量 | 数据库 | 后端地址 | 前端地址 | 用途 |
|---------|--------|---------|----------|------|
| `development` | 投研图灵室_test | localhost:3001 | localhost:5173 | 本地开发 |
| `production` | 投研图灵室 | aity88.online:8443 | 微信小程序 | 生产环境 |

---

## 本地开发环境配置

### 基本配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **操作系统** | Windows 10/11 | 本地开发系统 |
| **项目路径** | D:\your-mcp-proxy\AITY_VIP | 本地项目路径 |
| **PowerShell版本** | 5.1+（推荐7+） | 脚本执行环境 |

### 软件要求

| 软件 | 版本 | 用途 |
|------|------|------|
| **Node.js** | v18+ (推荐 v20 LTS) | 运行环境 |
| **npm** | v9.0.0+ | 包管理工具 |
| **Git** | 2.0.0+ | 版本控制 |
| **MySQL** | 8.0+ | 数据库 |
| **VS Code** | 最新版本 | 代码编辑器 |
| **微信开发者工具** | 最新版本 | 小程序开发 |

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| **后端服务** | 3001 | 本地后端服务端口 |
| **前端服务** | 5173 | 本地前端服务端口（uni-app） |
| **数据库** | 3306 | MySQL默认端口 |

### 后端环境变量

**配置文件**: `backend/.env`

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=private_sharing_app
DB_USER=root
DB_PASSWORD=your_database_password

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3001
NODE_ENV=development

# CORS配置
ALLOWED_ORIGINS=http://localhost:5173,http://192.168.2.140:5173

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 日志配置
LOG_LEVEL=debug
LOG_DIR=./logs
```

### 前端环境变量

**配置文件**: `aity-uni-app-v2/.env.development`

```env
# 开发环境配置
NODE_ENV=development

# API配置
VITE_API_BASE_URL=http://localhost:3001/api

# 其他配置
VITE_APP_TITLE=VIP投研内部分享系统
VITE_APP_VERSION=1.0.0
```

---

## 生产环境配置

### 服务器信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **服务器** | 腾讯云 CVM | 云服务器 |
| **IP地址** | 124.221.119.134 | 服务器公网IP |
| **域名** | aity88.online | 生产域名 |
| **SSH端口** | 22 | SSH连接端口 |
| **HTTPS端口** | 8443 | 自定义HTTPS端口 |
| **项目路径** | /var/www/aity-vip | 项目部署路径 |

### 后端环境变量

**配置文件**: `backend/.env.production`

```env
# 数据库配置
DB_HOST=124.221.119.134
DB_PORT=3306
DB_USER=fl
DB_PASSWORD=fl10b312
DB_NAME=投研图灵室

# JWT配置
JWT_SECRET=4a1e8c5530aec9beab0d6af47176be105af27e3dc7f4962dab7220b446af492b
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3000
NODE_ENV=production

# CORS配置
FRONTEND_URL=https://aity88.online

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/aity-vip/backend.log
```

### 前端环境变量

**配置文件**: `aity-uni-app-v2/.env.production`

```env
# 生产环境配置
NODE_ENV=production

# API配置
VITE_API_BASE_URL=https://aity88.online:8443/api

# 其他配置
VITE_APP_TITLE=VIP投研内部分享系统
VITE_APP_VERSION=1.0.0
```

---

## 环境变量说明

### 后端环境变量详解

#### 数据库配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DB_HOST` | 数据库主机地址 | localhost / 124.221.119.134 |
| `DB_PORT` | 数据库端口 | 3306 |
| `DB_USER` | 数据库用户名 | root / fl |
| `DB_PASSWORD` | 数据库密码 | your_password / fl10b312 |
| `DB_NAME` | 数据库名称 | aity_vip / 投研图灵室 |

#### JWT配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `JWT_SECRET` | JWT签名密钥 | your-secret-key |
| `JWT_EXPIRES_IN` | Token过期时间 | 24h / 7d |

#### 服务器配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `PORT` | 服务端口 | 3001 / 3000 |
| `NODE_ENV` | 运行环境 | development / production |
| `FRONTEND_URL` | 前端URL（CORS） | http://localhost:5173 / https://aity88.online |

#### 文件上传配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `UPLOAD_DIR` | 上传目录 | ./uploads / /var/www/uploads |
| `MAX_FILE_SIZE` | 最大文件大小（字节） | 10485760 (10MB) |

#### 日志配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `LOG_LEVEL` | 日志级别 | debug / info / warn / error |
| `LOG_DIR` | 日志目录 | ./logs / /var/log/aity-vip |
| `LOG_FILE` | 日志文件路径 | /var/log/aity-vip/backend.log |

### 前端环境变量详解

#### API配置

| 变量名 | 说明 | 开发环境 | 生产环境 |
|--------|------|----------|----------|
| `VITE_API_BASE_URL` | API基础地址 | http://localhost:3001/api | https://aity88.online:8443/api |

#### 应用配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | VIP投研内部分享系统 |
| `VITE_APP_VERSION` | 应用版本 | 1.0.0 |

---

## 数据库配置

### 本地开发数据库

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **数据库类型** | MySQL | 数据库类型 |
| **数据库版本** | 8.0+ | 数据库版本 |
| **数据库名称** | aity_vip | 开发数据库名 |
| **数据库主机** | localhost | 本地主机 |
| **数据库端口** | 3306 | MySQL默认端口 |
| **数据库用户** | root | 开发用户 |
| **数据库密码** | your_password | 开发密码 |

### 生产数据库

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **数据库类型** | MySQL | 数据库类型 |
| **数据库版本** | 8.x | 数据库版本 |
| **数据库名称** | 投研图灵室 | 生产数据库名 |
| **数据库主机** | 124.221.119.134 | 数据库服务器IP |
| **数据库端口** | 3306 | MySQL默认端口 |
| **数据库用户** | fl | 生产用户 |
| **数据库密码** | fl10b312 | 生产密码 |

### 数据库初始化

#### 创建数据库

**开发环境**:
```sql
CREATE DATABASE IF NOT EXISTS `aity_vip`
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**生产环境**:
```sql
CREATE DATABASE IF NOT EXISTS `投研图灵室`
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 创建用户并授权

**开发环境**:
```sql
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON `aity_vip`.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

**生产环境**:
```sql
CREATE USER IF NOT EXISTS 'fl'@'localhost' IDENTIFIED BY 'fl10b312';
GRANT ALL PRIVILEGES ON `投研图灵室`.* TO 'fl'@'localhost';
FLUSH PRIVILEGES;
```

---

## 版本管理

### Node.js 版本

| 环境 | 当前版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| **本地** | v24.14.0 | v20 LTS 或 v24 LTS | 使用最新LTS版本 |
| **服务器** | v20.20.0 | v20 LTS | 保持稳定版本 |

**LTS时间线**:
```
Node.js 24 LTS
├── 发布日期: 2025-10-21 (预计)
├── Active LTS: 2026-04-21 ~ 2027-04-30 (预计)
└── End of Life: 2028-04-30 (预计)

Node.js 22 LTS
├── 发布日期: 2024-10-29
├── Active LTS: 2025-04-29 ~ 2026-04-30
└── End of Life: 2027-04-30
```

### 项目依赖版本

#### 前端 (aity-uni-app-v2)

| 依赖 | 版本 | 说明 |
|------|------|------|
| **uni-app** | 3.0.0+ | 跨平台框架 |
| **Vue** | 3.4.21 | 前端框架 |
| **Vite** | 5.2.8 | 构建工具 |
| **Pinia** | 2.3.1 | 状态管理 |
| **Sass** | 1.97.3 | CSS预处理器 |

#### 后端 (backend)

| 依赖 | 版本 | 说明 |
|------|------|------|
| **Express** | 4.18.2 | Web框架 |
| **Sequelize** | 6.35.1 | ORM |
| **MySQL2** | 3.6.5 | MySQL驱动 |
| **JWT** | 9.0.2 | 认证 |
| **Winston** | 3.11.0 | 日志 |

---

## 配置文件位置

### 后端配置文件

```
backend/
├── .env                    # 开发环境变量
├── .env.production         # 生产环境变量
├── .env.test              # 测试环境变量
└── src/
    └── config/
        └── index.js       # 配置加载逻辑
```

### 前端配置文件

```
aity-uni-app-v2/
├── .env                    # 基础配置
├── .env.development        # 开发环境
├── .env.production         # 生产环境
├── manifest.json           # 应用配置
├── pages.json             # 页面配置
└── vite.config.js         # Vite配置
```

### 服务器配置文件

```
/etc/nginx/
├── sites-available/
│   └── aity-vip          # Nginx站点配置
└── ssl/
    ├── aity88.online.crt # SSL证书
    └── aity88.online.key # SSL密钥
```

---

## 环境切换

### 前端环境切换

| 命令 | NODE_ENV | 连接的后端 | 最终数据库 |
|------|----------|-----------|-----------|
| `npm run dev:mp-weixin` | development | 本地后端 (192.168.2.140:3001) | 测试库 |
| `npm run build:mp-weixin` | production | 生产服务器 (aity88.online:8443) | 生产库 |

### 后端环境切换

```bash
# 开发环境
NODE_ENV=development node src/index.js

# 生产环境
NODE_ENV=production node src/index.js

# 使用PM2（自动读取环境变量）
pm2 start src/index.js --name aity-backend --env production
```

---

## 常见问题

### Q1: 如何确认当前使用的环境？

**后端**:
```bash
# 查看环境变量
echo $NODE_ENV

# 或查看日志
pm2 logs aity-backend
```

**前端**:
```bash
# 查看构建时的环境变量
# 在浏览器控制台执行
console.log(import.meta.env.MODE)
```

### Q2: 环境变量修改后不生效？

**解决方案**:
1. 后端：重启服务 `pm2 restart aity-backend`
2. 前端：重新构建 `npm run build:mp-weixin`
3. 清除缓存：重启微信开发者工具

### Q3: 数据库连接失败？

**检查清单**:
```bash
# 1. 检查数据库服务状态
systemctl status mysql

# 2. 测试数据库连接
mysql -u fl -p -h 124.221.119.134

# 3. 检查环境变量
cat backend/.env.production | grep DB_

# 4. 检查防火墙
ufw status
```

### Q4: CORS 错误？

**解决方案**:
1. 确认 `FRONTEND_URL` 配置正确
2. 确认前端请求的地址与配置一致
3. 检查后端 CORS 中间件配置

---

## 相关文档

- [本地开发环境配置](./local-setup.md)
- [服务器部署指南](./server-deployment.md)
- [小程序部署指南](./miniprogram-deployment.md)

---

**文档维护**: AITY VIP Team
**最后更新**: 2026-03-05
