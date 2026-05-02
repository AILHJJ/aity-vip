# AITY VIP 投研内部分享系统 - uni-app 版本

> 基于 uni-app 框架的多端应用，支持 H5 和微信小程序
> 
> 更新日期：2026-01-26

---

## 📋 项目简介

AITY VIP 投研内部分享系统是一个专业的投研信息分享平台，采用 uni-app 框架开发，支持多端部署（H5 和微信小程序）。系统提供消息推送、讨论交流、用户管理、统计分析等核心功能。

### 技术栈

- **前端框架**：Vue 3 + Vite
- **跨平台框架**：uni-app
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP 客户端**：Axios
- **后端框架**：Node.js + Express
- **数据库**：MySQL
- **认证方式**：JWT

### 支持平台

- ✅ H5（浏览器）
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 字节跳动小程序
- ✅ QQ 小程序
- ✅ 快手小程序

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- HBuilderX（可选，用于小程序开发）

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
# 启动前端开发服务器
npm run dev

# 前端服务运行在 http://localhost:3002
```

### 构建生产版本

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# 支付宝小程序构建
npm run build:mp-alipay
```

---

## 📁 项目结构

```
aity-uni-app/
├── src/
│   ├── api/                 # API 接口层
│   │   ├── auth.js         # 认证相关 API
│   │   ├── message.js      # 消息相关 API
│   │   ├── discussion.js   # 讨论相关 API
│   │   ├── favorite.js    # 收藏相关 API
│   │   ├── user.js        # 用户相关 API
│   │   ├── group.js       # 分组相关 API
│   │   └── stats.js       # 统计相关 API
│   ├── components/          # 公共组件
│   ├── pages/              # 页面组件
│   │   ├── login/         # 登录页面
│   │   ├── messages/       # 消息相关页面
│   │   ├── discussions/    # 讨论相关页面
│   │   ├── favorites/      # 收藏页面
│   │   ├── profile/       # 个人资料页面
│   │   ├── stats/         # 统计页面
│   │   └── admin/         # 管理页面
│   ├── router/             # 路由配置
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── public/                # 静态资源
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
├── package.json           # 项目配置
└── README.md             # 项目说明
```

---

## 🔧 配置说明

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# API 基础路径
VITE_API_BASE_URL=http://localhost:3001/api

# 应用标题
VITE_APP_TITLE=AITY VIP投研内部分享系统
```

### Vite 配置

[vite.config.js](vite.config.js) 文件包含以下配置：

- **开发服务器端口**：3000
- **API 代理**：/api -> http://localhost:3001
- **插件**：@vitejs/plugin-vue

---

## 📱 页面说明

### 用户页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | /login | 用户登录 |
| 消息列表 | /messages | 查看消息列表 |
| 消息详情 | /message-detail | 查看消息详情 |
| 创建消息 | /create-message | 发布新消息 |
| 讨论列表 | /discussions | 查看讨论列表 |
| 讨论详情 | /discussion-detail | 查看讨论详情 |
| 创建讨论 | /create-discussion | 发起新讨论 |
| 收藏 | /favorites | 我的收藏 |
| 个人资料 | /profile | 个人信息管理 |

### 管理页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 用户管理 | /admin/users | 管理系统用户 |
| 分组管理 | /admin/groups | 管理用户分组 |
| 消息管理 | /admin/messages | 管理系统消息 |
| 统计分析 | /stats | 查看统计数据 |

---

## 🔐 认证说明

### 登录流程

1. 用户输入用户名和密码
2. 调用 `/auth/login` 接口
3. 服务器返回 JWT token
4. 将 token 存储到本地（localStorage 或 uni.storage）
5. 更新用户状态和用户信息
6. 跳转到首页

### Token 管理

- Token 存储位置：localStorage（H5）或 uni.storage（小程序）
- Token 有效期：24小时
- Token 刷新：自动刷新机制

### 权限控制

- 路由守卫：检查用户登录状态
- API 请求：自动携带 token
- 401 处理：自动跳转到登录页

---

## 🎨 样式规范

### 颜色变量

```scss
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #fa8c16;
$danger-color: #ff4d4f;
$text-color: #333;
$text-secondary: #666;
$text-muted: #999;
$border-color: #e8e8e8;
$card-bg: #ffffff;
$input-bg: #f5f5f5;
```

### 响应式设计

- 移动端：< 750rpx
- 平板端：768px - 1024px
- 桌面端：> 1024px

---

## 📊 API 接口

### 基础配置

- **基础 URL**：/api
- **请求方式**：GET、POST、PUT、DELETE
- **响应格式**：JSON

### 认证接口

- POST /auth/login - 用户登录
- POST /auth/logout - 用户登出
- GET /auth/info - 获取用户信息
- PUT /auth/profile - 更新个人资料
- PUT /auth/password - 修改密码

详细 API 文档请参考 [API文档.md](../docs/API文档.md)

---

## 🚢 部署说明

### H5 部署

1. 构建生产版本：`npm run build:h5`
2. 将 `dist` 目录部署到服务器
3. 配置 Nginx 反向代理

### 微信小程序部署

1. 构建小程序版本：`npm run build:mp-weixin`
2. 使用微信开发者工具打开 `dist/dev/mp-weixin` 目录
3. 上传到微信公众平台
4. 提交审核

详细部署指南请参考 [部署指南.md](../docs/部署指南.md)

---

## 🛠️ 开发指南

### 代码规范

- 使用 Vue 3 Composition API
- 使用 `<script setup>` 语法
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 样式使用 scoped

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具链更新
```

详细开发指南请参考 [README.md](../README.md)

---

## 📞 技术支持

- **问题反馈**：GitHub Issues
- **技术文档**：[项目文档](./)
- **更新日志**：[CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

MIT License

---

**项目维护者**：开发团队
**最后更新**：2026-01-26
**版本**：v1.0.0