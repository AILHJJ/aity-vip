# AITY VIP 项目上下文文档

> **文档版本**：v3.0.0
> **创建日期**：2026-01-30
> **最后更新**：2026-01-30
> **文档类型**：项目核心上下文和规范

## 🎯 项目核心目标

**项目必须同时支持小程序和H5双端部署，这是不可妥协的项目目标。**

- ✅ **必须支持小程序部署**（微信、支付宝、百度、字节跳动等）
- ✅ **必须支持 H5 网页部署**
- ✅ **一套代码，多端运行**
- ✅ **满足用户需求**

## 📁 项目结构

### 项目路径说明

```
d:\your-mcp-proxy\AITY_VIP\
├── backend\                    # 后端项目（Express + MySQL）
├── frontend\                  # 前端参考项目（Vue 3 + Element Plus）
├── aity-uni-app-new\         # 主要开发项目（uni-app）
└── docs\                     # 文档目录
```

### 项目角色说明

| 项目路径 | 角色 | 说明 | 是否使用 |
|---------|------|------|---------|
| `backend\` | 后端服务 | Express + MySQL，提供API服务 | ✅ **必须使用** |
| `frontend\` | 前端参考 | Vue 3 + Element Plus，仅作为业务逻辑参考 | ⚠️ **仅参考** |
| `aity-uni-app-new\` | 主要开发 | uni-app项目，支持小程序和H5双端 | ✅ **必须使用** |

## 📊 技术栈说明

### 后端技术栈

```
Node.js v20.20.0+
├── Express.js（Web框架）
├── MySQL 5.7.0+（数据库）
├── Sequelize（ORM框架）
├── JWT（身份认证）
├── PM2（进程管理）
└── Multer（文件上传）
```

### 前端技术栈（uni-app项目）

```
Vue 3 (Composition API)
├── uni-app（跨平台框架）
├── Vite 4.x（构建工具）
├── @dcloudio/vite-plugin-uni（uni-app插件）
├── Pinia 2.x（状态管理）
├── uni-ui（小程序端UI组件）
├── Element Plus（H5端UI组件，条件编译）
├── SCSS（样式方案）
└── uni.request（网络请求）
```

## 🔧 配置信息

### 后端配置

**开发环境：**
- 端口：3001
- API地址：http://localhost:3001/api
- 数据库：投研图灵室

**生产环境：**
- 端口：3001
- API地址：https://aity88.online:8443/api
- 数据库：投研图灵室_test

### 前端配置

**开发环境：**
- 端口：5173
- 访问地址：http://localhost:5173

**生产环境：**
- 访问地址：https://aity88.online:8443

## 📋 开发规范

### 前端开发规范

#### 组件使用
- **优先使用** uni-app内置组件
- **H5端** 可使用Element Plus（条件编译）
- **小程序端** 必须使用uni-app内置组件

#### 路由配置
- 使用 `pages.json` 配置路由
- 使用 uni-app 路由API进行页面跳转
- H5端可选择性使用Vue Router

#### API调用
- 使用 `uni.request` 进行网络请求
- H5端可选择性使用Axios

### 后端开发规范

#### 数据库操作
- 使用 Sequelize ORM 进行数据库操作
- 遵循模型定义规范

#### API设计
- 遵循 RESTful API 设计规范
- 使用统一响应格式

#### 认证授权
- 使用 JWT 进行身份认证
- 实现基于角色的权限控制

## 🚀 开发流程

### 1. 本地开发

**启动后端服务：**
```bash
cd backend
npm install
npm run dev
```

**启动前端服务：**
```bash
cd aity-uni-app-new
npm install
npm run dev
```

### 2. 多端测试

**H5端测试：**
```bash
cd aity-uni-app-new
npm run dev:h5
```

**小程序端测试：**
```bash
cd aity-uni-app-new
npm run build:mp-weixin
```
然后使用微信开发者工具打开 `dist/build/mp-weixin` 目录。

### 3. 部署流程

**构建H5版本：**
```bash
cd aity-uni-app-new
npm run build:h5
```

**构建小程序版本：**
```bash
cd aity-uni-app-new
npm run build:mp-weixin
```

## ⚠️ 常见问题和解决方案

### 1. 依赖冲突

**问题**：安装依赖时出现peer dependency警告

**解决方案**：
```bash
npm install --legacy-peer-deps
```

### 2. 组件兼容性

**问题**：某些组件在小程序端不工作

**解决方案**：
- 优先使用uni-app内置组件
- 使用条件编译处理平台差异
- 避免使用平台特定API

### 3. 路由跳转失败

**解决方案**：
- 确保在pages.json中配置了页面路径
- 使用uni-app路由API而不是Vue Router
- 检查路径格式是否正确

### 4. API请求失败

**解决方案**：
- 确保后端服务正在运行
- 检查API地址配置是否正确
- 确保token有效
- 检查网络请求是否被CORS拦截

### 5. 端口冲突

**解决方案**：
```bash
# 检查端口占用
lsof -i :3001
lsof -i :5173

# 杀掉占用端口的进程
kill -9 <PID>
```

## 📚 相关文档

| 文档名称 | 路径 | 说明 |
|---------|-------|------|
| 项目概述 | ../docs/core/项目概述.md | 项目简介、核心功能、技术栈、快速开始 |
| 需求文档 | ../docs/core/需求文档.md | 详细的需求确认和业务规则 |
| API文档 | ../docs/core/API文档.md | API接口说明、请求/响应格式 |
| 部署手册 | ../docs/core/部署手册.md | 部署流程、服务器配置、HTTPS设置 |

## ✅ 开发前检查清单

在开始任何开发工作前，请确认：

- [ ] 已阅读本文档
- [ ] 理解项目必须同时支持小程序和H5部署
- [ ] 知道主要开发项目是 `aity-uni-app-new`
- [ ] 知道 `frontend` 仅作为参考项目
- [ ] 知道后端端口是 3001
- [ ] 知道前端端口是 5173
- [ ] 知道使用 uni-app 组件的规范
- [ ] 知道使用 pages.json 配置路由
- [ ] 知道使用条件编译处理平台差异

---

**文档维护者**：开发团队
**最后更新**：2026-01-30
**适用范围**：AITY VIP 项目开发和维护
