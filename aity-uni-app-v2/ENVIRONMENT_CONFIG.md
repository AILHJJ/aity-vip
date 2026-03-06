# 环境配置说明

## 概述

项目现在支持两套环境配置，可以轻松切换本地开发和云端部署：

- **本地环境 (local)**: 连接本地后端服务 `http://localhost:3001`
- **云端环境 (cloud)**: 连接腾讯云后端服务 `https://aity88.online:8443/api`

## 可用命令

### H5 版本

```bash
# 本地环境 - 开发模式
npm run dev:h5:local

# 云端环境 - 开发模式
npm run dev:h5:cloud

# 本地环境 - 构建生产版本
npm run build:h5:local

# 云端环境 - 构建生产版本
npm run build:h5:cloud
```

### 微信小程序版本

```bash
# 本地环境 - 开发模式
npm run dev:mp-weixin:local

# 云端环境 - 开发模式
npm run dev:mp-weixin:cloud

# 本地环境 - 构建生产版本
npm run build:mp-weixin:local

# 云端环境 - 构建生产版本
npm run build:mp-weixin:cloud
```

## 环境配置文件

### .env.development.local (本地开发环境)
- **API地址**: `http://localhost:3001`
- **调试模式**: 开启
- **日志级别**: debug
- **存储前缀**: `aity_vip_local_`

### .env.production.cloud (云端生产环境)
- **API地址**: `https://aity88.online:8443/api`
- **调试模式**: 关闭
- **日志级别**: error
- **存储前缀**: `aity_vip_prod_`

## 工作原理

1. 当运行环境特定的npm命令时，会自动将对应的环境配置文件复制到 `.env` 文件
2. Vite会读取 `.env` 文件中的环境变量，并将其注入到构建过程中
3. 在代码中可以通过 `import.meta.env.VITE_APP_*` 访问这些环境变量

## 当前运行状态

### 后端服务
- **状态**: ✅ 运行中
- **地址**: `http://localhost:3001`
- **进程ID**: 6ccc3f

### H5开发服务
- **状态**: ✅ 运行中
- **地址**: `http://localhost:5174`
- **环境**: 自动检测 `.env` 文件变化

### 微信小程序开发版本 (本地环境)
- **状态**: ✅ 运行中
- **环境**: local (localhost:3001)
- **进程ID**: 1524a8

### 微信小程序构建版本 (云端环境)
- **状态**: ✅ 运行中
- **环境**: cloud (aity88.online:8443)
- **进程ID**: 8088d7

## 使用建议

1. **本地开发测试**: 使用 `*:local` 命令，连接本地后端
2. **云端集成测试**: 使用 `*:cloud` 命令，连接腾讯云后端
3. **生产部署**: 使用 `build:*:cloud` 构建生产版本

## 注意事项

- 每次运行环境特定命令时，`.env` 文件会被覆盖
- 确保在运行命令前停止旧的编译进程
- H5开发服务器会自动检测 `.env` 文件变化并重启
- 微信小程序需要手动重启才能应用新的环境配置
