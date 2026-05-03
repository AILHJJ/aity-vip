# 环境配置指南

> 本文档描述了 AITY VIP 项目的前后端环境配置策略，确保开发环境和生产环境正确隔离。

## 目录

- [环境架构概览](#环境架构概览)
- [前端环境配置](#前端环境配置)
- [后端环境配置](#后端环境配置)
- [快速命令参考](#快速命令参考)
- [部署检查清单](#部署检查清单)
- [常见问题](#常见问题)

---

## 环境架构概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端 (小程序/H5)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  npm run dev:mp-weixin  →  编译时替换 → API = 192.168.2.140:3001       │
│  npm run build:mp-weixin → 编译时替换 → API = aity88.online:8443       │
│                                                                         │
│  配置文件: aity-uni-app-v2/src/utils/config.js                          │
│  环境判断: process.env.NODE_ENV === 'production'                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                                    ↓ HTTP 请求
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           后端 (Node.js)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  npm run dev  → NODE_ENV=development → .env.development                 │
│  npm start    → NODE_ENV=production  → .env.production                  │
│                                                                         │
│  配置文件: backend/.env.development / backend/.env.production           │
│  环境判断: 根据 NODE_ENV 自动加载对应 .env 文件                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                                    ↓ 数据库连接
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           数据库 (MySQL)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  开发环境: DB_ENV=test  → 投研图灵室_test                                │
│  生产环境: DB_ENV=production → 投研图灵室                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 前端环境配置

### 配置文件位置

```
aity-uni-app-v2/src/utils/config.js
```

### 环境切换机制

前端使用 **编译时替换** 方式，Vite 在构建时会静态替换 `process.env.NODE_ENV`：

```javascript
// 源代码
const isProduction = process.env.NODE_ENV === 'production'

// dev 编译后
const isProduction = false

// build 编译后
const isProduction = true
```

### 配置说明

| 环境 | 命令 | API 地址 | 用途 |
|------|------|----------|------|
| 开发 | `npm run dev:mp-weixin` | `http://192.168.2.140:3001/api` | 本地开发调试 |
| 生产 | `npm run build:mp-weixin` | `https://aity88.online:8443/api` | 正式发布 |

### 修改开发环境 API 地址

如果需要在其他设备上开发，需要修改 `config.js` 中的局域网 IP：

```javascript
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'http://你的局域网IP:3001/api',
  BASE_URL: 'http://你的局域网IP:3001',
  ENV: 'development'
}
```

> 注意：小程序无法使用 `localhost`，必须使用局域网 IP 地址。

---

## 后端环境配置

### 配置文件位置

```
backend/
├── .env              # 默认配置（兼容旧版）
├── .env.development  # 开发环境配置
├── .env.production   # 生产环境配置
├── .env.example      # 配置模板（供参考）
└── .env.test         # 测试环境配置
```

### 环境切换机制

后端使用 **运行时加载** 方式，根据 `NODE_ENV` 自动选择对应的 `.env` 文件：

```javascript
// src/index.js 中的环境加载逻辑
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.resolve(__dirname, `../${envFile}`) });
```

### 配置文件对比

| 配置项 | .env.development | .env.production |
|--------|------------------|-----------------|
| NODE_ENV | development | production |
| PORT | 3001 | 3000 |
| DB_ENV | test | production |
| 数据库 | 投研图灵室_test | 投研图灵室 |
| JWT_SECRET | 开发密钥 | 生产密钥 |

### 数据库环境选择

通过 `DB_ENV` 变量控制数据库选择：

```bash
# 开发环境 - 使用测试数据库
DB_ENV=test          # → 投研图灵室_test

# 生产环境 - 使用生产数据库
DB_ENV=production    # → 投研图灵室
```

---

## 快速命令参考

### 前端命令

```bash
# 进入前端目录
cd aity-uni-app-v2

# 开发模式（微信小程序）
npm run dev:mp-weixin

# 开发模式（H5）
npm run dev:h5

# 构建生产版本（微信小程序）
npm run build:mp-weixin

# 构建生产版本（H5）
npm run build:h5

# 上传微信小程序
npm run upload:weixin
```

### 后端命令

```bash
# 进入后端目录
cd backend

# 安装依赖（首次或更新后）
npm install

# 开发模式（热重载 + 测试数据库）
npm run dev

# 生产模式（正式运行 + 生产数据库）
npm start

# 运行测试
npm test
```

---

## 部署检查清单

### 部署前检查

- [ ] 前端：确认 `npm run build:mp-weixin` 编译成功
- [ ] 前端：检查 `dist/build/mp-weixin/utils/config.js` 确认 API 地址正确
- [ ] 后端：确认 `.env.production` 配置正确
- [ ] 后端：确认 `DB_ENV=production`
- [ ] 后端：确认数据库连接正常

### 部署步骤

1. **前端部署**
   ```bash
   cd aity-uni-app-v2
   npm run build:mp-weixin
   # 使用微信开发者工具上传 dist/build/mp-weixin 目录
   ```

2. **后端部署**
   ```bash
   cd backend
   npm install --production
   npm start
   # 或者使用 PM2
   pm2 start npm --name "aity-backend" -- start
   ```

### 部署后验证

- [ ] 检查后端启动日志，确认显示 `已加载环境配置: .env.production`
- [ ] 检查数据库连接，确认显示 `🔴 生产环境`
- [ ] 测试前端登录功能
- [ ] 测试 API 请求是否正常

---

## 常见问题

### Q1: 本地开发时前端无法连接后端？

**检查项：**
1. 确认后端服务已启动（`npm run dev`）
2. 确认 `config.js` 中的 IP 地址与你的本机 IP 一致
3. 确认防火墙允许 3001 端口访问

**解决方法：**
```bash
# 查看本机 IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# 更新 config.js 中的 IP
API_BASE_URL: 'http://你的实际IP:3001/api'
```

### Q2: 构建后的前端连接了错误的 API？

**检查项：**
1. 检查 `dist/build/mp-weixin/utils/config.js` 内容
2. 确认使用的是 `npm run build:mp-weixin` 而非 `npm run dev:mp-weixin`

### Q3: 后端启动时连接了错误的数据库？

**检查项：**
1. 检查启动日志中的环境配置
2. 确认使用正确的命令：
   - 开发：`npm run dev` → 应显示 `.env.development` 和 `🟢 测试环境`
   - 生产：`npm start` → 应显示 `.env.production` 和 `🔴 生产环境`

### Q4: 如何临时切换数据库环境？

**方法一：修改 .env 文件**
```bash
# 编辑对应的 .env 文件
# 修改 DB_ENV=test 或 DB_ENV=production
# 重启后端服务
```

**方法二：直接指定数据库名（优先级更高）**
```bash
# 在 .env 文件中添加
DB_NAME=投研图灵室_test  # 或 投研图灵室
```

### Q5: 环境变量不生效？

**检查项：**
1. 确认已安装 `cross-env` 依赖：`npm install cross-env --save-dev`
2. 确认 `.env.*` 文件在 `backend/` 目录下
3. 确认 `.env.*` 文件格式正确（无多余空格、引号）

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-02-26 | 1.0.0 | 初始版本，实现前后端环境自动切换 |

---

## 相关文件

- 前端配置：`aity-uni-app-v2/src/utils/config.js`
- 后端入口：`backend/src/index.js`
- 数据库配置：`backend/src/config/db.js`
- 环境变量：`backend/.env.*`
