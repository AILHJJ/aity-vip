# AITY VIP 项目完整上下文文档

> **文档版本**：v2.0.0
> **创建日期**：2026-01-29
> **最后更新**：2026-01-29
> **文档类型**：项目核心上下文和规范

---

## 🎯 项目核心目标（不可妥协）

**项目必须同时支持小程序和H5双端部署，这是不可妥协的项目目标。**

- ✅ **必须支持小程序部署**（微信、支付宝、百度、字节跳动等）
- ✅ **必须支持 H5 网页部署**
- ✅ **一套代码，多端运行**
- ✅ **满足用户需求**

---

## 📁 项目结构

### 项目路径说明

```
d:\your-mcp-proxy\AITY_VIP\
├── backend\                    # 后端项目（Express + MySQL）
│   ├── src\                   # 源代码
│   ├── .env.development        # 开发环境配置（端口3000）
│   ├── ecosystem.config.js      # PM2配置（端口3001）
│   └── package.json
├── frontend\                  # 前端参考项目（Vue 3 + Element Plus）
│   ├── src\                   # 源代码
│   ├── .env.development       # 开发环境配置
│   └── package.json
├── aity-uni-app-new\         # 主要开发项目（uni-app）
│   ├── src\                   # 源代码
│   ├── pages.json             # uni-app路由配置
│   ├── vite.config.js         # Vite + uni-app配置
│   └── package.json
└── docs\                     # 文档目录
```

### 项目角色说明

| 项目路径 | 角色 | 说明 | 是否使用 |
|---------|------|------|---------|
| `backend\` | 后端服务 | Express + MySQL，提供API服务 | ✅ **必须使用** |
| `frontend\` | 前端参考 | Vue 3 + Element Plus，仅作为业务逻辑参考 | ⚠️ **仅参考** |
| `aity-uni-app-new\` | 主要开发 | uni-app项目，支持小程序和H5双端 | ✅ **必须使用** |

---

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

**配置信息：**
- **开发环境端口**：3001（注意：.env.development中是3000，但实际使用3001）
- **生产环境端口**：3001
- **数据库名（开发）**：投研图灵室
- **数据库名（测试）**：投研图灵室_test
- **数据库地址**：124.221.119.134:3306

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

**配置信息：**
- **开发环境端口**：5173
- **API基础路径**：http://localhost:3001/api
- **路由配置**：pages.json（uni-app路由）
- **H5端可选**：Vue Router 4.x

### 前端技术栈（参考项目）

```
Vue 3 (Composition API)
├── Vite 4.x（构建工具）
├── Element Plus 2.x（UI组件库）
├── Pinia 2.x（状态管理）
├── Vue Router 4.x（路由管理）
├── Axios 1.x（HTTP客户端）
└── SCSS（样式方案）
```

**注意**：此项目仅作为业务逻辑参考，不能编译为小程序。

---

## 🌐 云服务器信息

### 服务器基本信息

| 配置项 | 值 |
|--------|-----|
| 服务器IP | 124.221.119.134 |
| 服务器用户 | root |
| 域名 | aity88.online |
| HTTPS端口 | 8443 |
| HTTP端口 | 8080 |
| SSH端口 | 22 |

### 部署目录

| 服务 | 部署目录 |
|------|---------|
| 前端 | /var/www/aity-vip/frontend |
| 后端 | /var/www/aity-vip/backend |
| Nginx配置 | /etc/nginx |

### 数据库信息

| 配置项 | 值 |
|--------|-----|
| 数据库地址 | 124.221.119.134:3306 |
| 数据库名（测试） | 投研图灵室_test |
| 数据库用户 | root |
| 数据库密码 | （见.env文件） |

---

## 📋 开发规范

### 1. 前端开发规范（uni-app项目）

#### ✅ 组件使用规范

**uni-app内置组件（推荐）：**
```vue
<template>
  <view class="container">
    <button @click="handleClick">按钮</button>
    <input v-model="value" placeholder="请输入" />
    <checkbox v-model="checked">选项</checkbox>
    <text>文本内容</text>
    <image src="/static/logo.png" />
  </view>
</template>
```

**条件编译（H5端使用Element Plus）：**
```vue
<template>
  <view class="container">
    <!-- #ifdef H5 -->
    <el-button @click="handleClick">按钮</el-button>
    <el-input v-model="value" placeholder="请输入" />
    <el-checkbox v-model="checked">选项</el-checkbox>
    <!-- #endif -->
    
    <!-- #ifdef MP-WEIXIN -->
    <button @click="handleClick">按钮</button>
    <input v-model="value" placeholder="请输入" />
    <checkbox v-model="checked">选项</checkbox>
    <!-- #endif -->
  </view>
</template>
```

#### ✅ 路由配置规范

**使用pages.json（主要）：**
```json
{
  "pages": [
    {
      "path": "pages/login/login",
      "style": {
        "navigationBarTitleText": "登录"
      }
    },
    {
      "path": "pages/messages/messages",
      "style": {
        "navigationBarTitleText": "消息中心"
      }
    }
  ],
  "globalStyle": {
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "AITY VIP",
    "backgroundColor": "#f5f5f5"
  }
}
```

**H5端可选Vue Router：**
```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('@/pages/login/login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

#### ✅ API调用规范

**使用uni.request（推荐）：**
```javascript
// src/utils/request.js
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: import.meta.env.VITE_API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Authorization': 'Bearer ' + uni.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
```

**H5端可选Axios：**
```javascript
// #ifdef H5
import axios from 'axios'
// #endif
```

#### ✅ 路由跳转规范

**使用uni-app路由API：**
```javascript
// 跳转到新页面
uni.navigateTo({
  url: '/pages/messages/messages'
})

// 关闭当前页面，跳转到新页面
uni.redirectTo({
  url: '/pages/messages/messages'
})

// 返回上一页
uni.navigateBack({
  delta: 1
})

// 切换TabBar页面
uni.switchTab({
  url: '/pages/messages/messages'
})
```

### 2. 后端开发规范

#### ✅ 端口配置

**开发环境：**
- 后端端口：3001
- 前端端口：5173
- API地址：http://localhost:3001/api

**生产环境：**
- 后端端口：3001
- 前端端口：通过Nginx代理
- API地址：https://aity88.online:8443/api

#### ✅ 数据库配置

**开发环境：**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=投研图灵室
DB_USER=root
DB_PASSWORD=your-password
```

**生产环境：**
```env
DB_HOST=124.221.119.134
DB_PORT=3306
DB_NAME=投研图灵室_test
DB_USER=root
DB_PASSWORD=your-password
```

#### ✅ ORM使用规范

**Sequelize模型定义：**
```javascript
// src/models/User.js
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
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'users'
});

module.exports = User;
```

#### ✅ 控制器规范

**统一响应格式：**
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
```

---

## 🚀 开发流程

### 1. 本地开发

#### 启动后端服务
```bash
cd backend
npm install
npm run dev
```

#### 启动前端服务（uni-app项目）
```bash
cd aity-uni-app-new
npm install
npm run dev
```

#### 访问地址
- 前端：http://localhost:5173
- 后端API：http://localhost:3001/api

### 2. 多端测试

#### H5端测试
```bash
cd aity-uni-app-new
npm run dev:h5
```

#### 小程序端测试
```bash
cd aity-uni-app-new
npm run build:mp-weixin
```
然后使用微信开发者工具打开 `dist/build/mp-weixin` 目录。

### 3. 部署流程

#### 构建H5版本
```bash
cd aity-uni-app-new
npm run build:h5
```

#### 构建小程序版本
```bash
cd aity-uni-app-new
npm run build:mp-weixin
```

#### 部署到服务器
```bash
# 使用部署脚本
cd scripts
bash deploy.sh
```

---

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

### 3. 路由配置

**问题**：路由跳转失败

**解决方案**：
- 确保在pages.json中配置了页面路径
- 使用uni-app路由API而不是Vue Router
- 检查路径格式是否正确

### 4. API调用

**问题**：API请求失败

**解决方案**：
- 确保后端服务正在运行
- 检查API地址配置是否正确
- 确保token有效
- 检查网络请求是否被CORS拦截

### 5. 端口冲突

**问题**：端口被占用

**解决方案**：
```bash
# 检查端口占用
lsof -i :3001
lsof -i :5173

# 杀掉占用端口的进程
kill -9 <PID>
```

---

## 📚 相关文档

| 文档名称 | 路径 | 说明 |
|---------|-------|------|
| 需求文档 | docs/需求文档.md | 详细的需求确认和业务规则 |
| API文档 | docs/API文档.md | API接口文档 |
| 部署指南 | docs/部署指南.md | 部署流程和运维指南 |
| 腾讯云部署方案 | docs/腾讯云部署方案.md | 腾讯云特定配置 |

---

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
- [ ] 知道云服务器信息和部署目录

---

**文档维护者**：开发团队
**最后更新**：2026-01-29
**适用范围**：AITY VIP 项目开发和维护
