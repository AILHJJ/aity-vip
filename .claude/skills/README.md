# AITY VIP 技能文档

> **版本**: v2.0.0
> **更新**: 2026-02-28

---

## 文档导航

| 文档 | 说明 | 用途 |
|------|------|------|
| [快速参考卡](./quick-reference.md) | 核心信息速查 | ⭐ 推荐首先阅读 |
| [后端开发指南](./backend-guide.md) | 后端规范和示例 | 后端开发时参考 |
| [前端开发指南](./frontend-guide.md) | uni-app 开发规范 | 前端开发时参考 |
| [部署命令参考](./deployment-commands.md) | 常用部署命令 | 部署时参考 |

---

## 项目核心目标

**项目必须同时支持小程序和H5双端部署**

- ✅ 微信小程序
- ✅ H5 网页
- ⏳ 支付宝小程序（计划中）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + uni-app + Vite + Pinia |
| 后端 | Node.js + Express + Sequelize |
| 数据库 | MySQL 5.7+ |
| 部署 | PM2 + Nginx + HTTPS |

---

## 项目路径

```
D:\your-mcp-proxy\AITY_VIP\
├── backend/              # 后端项目 ⭐
├── aity-uni-app-v2/      # 前端项目 ⭐
│   ├── src/              # 源代码
│   ├── dist/             # 编译输出
│   └── scripts/          # 部署脚本
└── docs/                 # 项目文档
```

---

## 快速开始

### 启动开发环境
```bash
# 后端
cd backend && npm run dev

# 前端 H5
cd aity-uni-app-v2 && npm run dev:h5
```

### 访问地址
- 前端 H5: http://localhost:5173
- 后端 API: http://localhost:3001/api
- 生产环境: https://aity88.online:8443

---

## 历史文档（已归档）

以下文档已整合到新文档中，保留作为参考：
- `project-context.md` → 整合到 `quick-reference.md`
- `backend-development.md` → 精简为 `backend-guide.md`
- `uniapp-development.md` → 精简为 `frontend-guide.md`
- `deployment-info.md` → 整合到 `deployment-commands.md`
- `development-workflow.md` → 整合到主 `README.md`
- `requirement-checklist.md` → 移动到 `docs/testing/`

---

**维护者**: AI Coding Assistant
**最后更新**: 2026-02-28
