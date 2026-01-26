# AITY VIP - 投研内部分享系统

## 项目简介
AITY VIP是一个专为投研团队设计的内部分享系统，支持消息发布、讨论交流、用户管理等功能，采用前后端分离架构。

## 技术栈

### 前端
- **框架**：uni-app（支持多端部署）
- **构建工具**：Vite
- **样式**：SCSS
- **状态管理**：Pinia
- **路由**：Vue Router

### 后端
- **语言**：Node.js
- **框架**：Express
- **数据库**：MySQL
- **认证**：JWT
- **进程管理**：PM2

## 项目结构

```
AITY_VIP/
├── frontend/              # 前端代码（uni-app）
│   ├── src/               # 源代码
│   ├── package.json       # 依赖配置
│   ├── vite.config.js     # 构建配置
│   └── ...
├── backend/               # 后端代码
│   ├── src/               # 源代码
│   ├── package.json       # 依赖配置
│   ├── ecosystem.config.js # PM2配置
│   └── ...
├── docs/                  # 文档
│   ├── 需求文档.md
│   ├── API文档.md
│   ├── 部署指南.md
│   └── ...
├── scripts/               # 部署和运维脚本
│   ├── deploy.sh          # 部署脚本
│   ├── build.sh           # 构建脚本
│   ├── start.sh           # 启动脚本
│   └── ...
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明
```

## 快速开始

### 开发环境要求
- **Node.js**：v16.0.0+
- **npm**：v7.0.0+
- **MySQL**：v5.7+

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url> AITY_VIP
   cd AITY_VIP
   ```

2. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   ```

3. **安装后端依赖**
   ```bash
   cd ../backend
   npm install
   ```

4. **配置数据库**
   - 复制 `.env.example` 文件为 `.env`
   - 修改 `.env` 文件中的数据库配置
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=aity_vip
   ```

5. **初始化数据库**
   - 执行数据库初始化脚本
   ```bash
   node init-test-data.js
   ```

### 开发流程

1. **启动开发服务器**
   ```bash
   # 方式1：使用启动脚本
   cd scripts
   bash start.sh
   
   # 方式2：手动启动
   # 启动后端
   cd backend
   npm run dev
   
   # 启动前端
   cd ../frontend
   npm run dev
   ```

2. **访问开发环境**
   - 前端：http://localhost:5173
   - 后端API：http://localhost:3001/api

3. **代码提交规范**
   - 采用 Conventional Commits 规范
   - 提交信息格式：`type(scope): description`
   - 示例：`feat(auth): 添加登录验证码功能`

## 构建和部署

### 构建项目
```bash
cd scripts
bash build.sh
```

### 部署到腾讯云
1. **配置部署脚本**
   - 修改 `scripts/deploy.sh` 中的服务器配置
   ```bash
   SERVER_IP="your-server-ip"
   SERVER_USER="ubuntu"
   ```

2. **执行部署**
   ```bash
   cd scripts
   bash deploy.sh
   ```

3. **服务器配置**
   - 安装 Node.js、PM2、Nginx
   - 配置 Nginx 反向代理
   - 配置防火墙规则

## Git 分支管理

采用 Git Flow 工作流：
- **main**：稳定版本，用于生产部署
- **develop**：开发分支，集成所有功能开发
- **feature/xxx**：新功能开发分支
- **hotfix/xxx**：生产环境紧急修复分支
- **release/xxx**：版本发布分支

## 功能模块

### 核心功能
- **消息管理**：发布、编辑、删除消息，支持定时发布
- **讨论功能**：发起讨论、回复讨论，支持私密讨论
- **用户管理**：用户注册、登录、权限控制
- **分组管理**：用户分组、消息分组
- **统计分析**：消息统计、用户活跃度统计

### 权限管理
- **super_admin**：超级管理员（所有权限）
- **admin**：管理员（内容管理权限）
- **vip_mid**：VIP用户（中线策略）
- **vip_short**：VIP用户（短线策略）
- **trial**：体验用户（试用期7天）

## 配置说明

### 前端配置
- **API地址**：修改 `frontend/src/utils/request.js` 中的 `baseURL`
- **构建配置**：修改 `frontend/vite.config.js`

### 后端配置
- **环境变量**：修改 `backend/.env` 文件
- **PM2配置**：修改 `backend/ecosystem.config.js`

## 常见问题

### 1. 数据库连接失败
- 检查 `.env` 文件中的数据库配置
- 确保 MySQL 服务正在运行
- 确保数据库用户有正确的权限

### 2. 前端无法访问后端API
- 检查后端服务是否启动
- 检查前端 `baseURL` 配置
- 检查服务器防火墙规则

### 3. 部署后页面空白
- 检查 Nginx 配置
- 检查前端构建文件是否正确部署
- 检查浏览器控制台错误信息

## 开发规范

### 代码规范
- **前端**：遵循 Vue 风格指南
- **后端**：遵循 Node.js 代码规范
- **命名**：采用小驼峰命名法
- **缩进**：使用 2 个空格缩进

### 文档规范
- **API文档**：使用 RESTful 风格
- **代码注释**：关键代码添加注释
- **提交信息**：遵循 Conventional Commits 规范

## 版本历史

### v1.0.0
- 初始版本
- 实现消息发布、讨论功能
- 实现用户管理、权限控制
- 实现基本统计分析

## 联系方式

- **项目负责人**：__________
- **技术负责人**：__________
- **产品负责人**：__________

## 许可证

MIT License