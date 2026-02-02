# AITY VIP 项目技能文档

> **文档版本**：v3.0.0
> **创建日期**：2026-01-30
> **最后更新**：2026-01-30
> **适用范围**：AITY VIP 项目开发和维护

## 📋 文档导航

| 文档名称 | 描述 | 适用人群 |
|---------|------|----------|
| [项目上下文.md](./project-context.md) | 项目概述、技术栈、开发规范 | 所有人员 |
| [后端开发.md](./backend-development.md) | 后端技术实现、API设计、数据库操作 | 后端开发 |
| [前端开发.md](./uniapp-development.md) | uni-app开发、多端兼容、组件使用 | 前端开发 |
| [部署与运维.md](./deployment-info.md) | 服务器配置、部署流程、监控维护 | 运维人员 |
| [需求实现检查.md](./requirement-checklist.md) | 需求符合性检查、功能验证 | 测试人员 |

## 🎯 项目核心目标

**项目必须同时支持小程序和H5双端部署，这是不可妥协的项目目标。**

- ✅ **必须支持小程序部署**（微信、支付宝、百度、字节跳动等）
- ✅ **必须支持 H5 网页部署**
- ✅ **一套代码，多端运行**
- ✅ **满足用户需求**

## 📁 项目结构

```
d:\your-mcp-proxy\AITY_VIP\
├── backend/                    # 后端项目（Express + MySQL）
├── frontend/                  # 前端参考项目（Vue 3 + Element Plus）
├── aity-uni-app-new/         # 主要开发项目（uni-app）
└── docs/                     # 文档目录
```

## 🚀 快速开始

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

### 2. 访问地址
- 前端：http://localhost:5173
- 后端API：http://localhost:3001/api

## 🔧 技术栈

### 后端
- Node.js v20.20.0+
- Express.js
- MySQL 5.7.0+
- Sequelize
- JWT
- PM2

### 前端
- Vue 3 (Composition API)
- uni-app
- Vite 4.x
- Pinia 2.x
- uni-ui
- Element Plus（H5端）

## 📚 相关文档

- [项目概述.md](../docs/core/项目概述.md)
- [需求文档.md](../docs/core/需求文档.md)
- [API文档.md](../docs/core/API文档.md)
- [部署手册.md](../docs/core/部署手册.md)

## ✅ 开发前检查

在开始开发前，请确认：

- [ ] 已阅读本技能文档
- [ ] 理解项目必须同时支持小程序和H5部署
- [ ] 知道主要开发项目是 `aity-uni-app-new`
- [ ] 知道 `frontend` 仅作为参考项目
- [ ] 知道后端端口是 3001
- [ ] 知道前端端口是 5173

---

**文档维护者**：开发团队
**最后更新**：2026-01-30
**适用范围**：AITY VIP 项目开发和维护