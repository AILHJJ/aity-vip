# AI编程交互与部署决策分析

**日期**: 2026-02-06
**问题**: 编译应该在本地还是服务器端进行？

---

## 🤔 问题分析

### 问题1: AI提交代码时会自动编译吗？

**答案**: ❌ **不会自动编译**

**原因**:
1. 我只能执行您明确要求的操作
2. Git commit是提交源代码，不会触发编译
3. 编译需要明确执行 `npm run build` 命令

**当前流程**:
```bash
# 1. 我执行的操作
git add .
git commit -m "xxx"
git push

# 2. 您需要手动执行（或我明确执行）
npm run build:h5
npm run build:mp-weixin
```

**优化建议**:
- 在规范文档中明确说明："提交后必须立即编译"
- 我可以在commit后提醒您需要编译
- 或者我们创建一个脚本自动化这个流程

---

### 问题2: 编译应该在本地还是服务器端？

**决策分析**:

#### 方案A: 本地编译，上传静态文件（推荐✅）

**命令**:
```bash
# 服务器端执行
cd /tmp/AITY/backend && git reset --hard && git pull origin feature/iteration-1 && pm2 restart aity-backend -f

# 本地Windows执行
npm run build:h5
# 上传到服务器
# 服务器解压部署
```

**优点**:
- ✅ 服务器不需要Node.js环境和npm依赖
- ✅ 编译过程不影响服务器性能
- ✅ 本地可以快速测试编译结果
- ✅ 编译失败只在本地，不影响线上环境
- ✅ 可以多次编译，只上传成功的版本

**缺点**:
- ⚠️ 需要在本地安装Node.js环境
- ⚠️ 需要手动上传文件（已通过脚本自动化）

---

#### 方案B: 服务器端编译（不推荐❌）

**命令**:
```bash
cd /tmp/AITY/backend && git reset --hard && git pull origin feature/iteration-1 && pm2 restart aity-backend -f
cd /tmp/AITY/aity-uni-app-v2 && npm run build:h5
cp -r dist/build/h5/* /var/www/html/h5/
pm2 restart aity-frontend -f  # ❌ 需要额外的PM2进程
```

**优点**:
- ✅ 一条命令完成所有操作

**缺点**:
- ❌ 服务器需要安装完整的Node.js和npm依赖
- ❌ 编译占用服务器资源（CPU、内存）
- ❌ 编译失败可能影响线上服务
- ❌ `pm2 restart aity-frontend` 会导致H5服务中断
- ❌ 需要额外的PM2进程管理H5（实际上H5是静态文件，不需要PM2）

**关键问题**:
- **H5是静态文件，不需要PM2管理！**
- H5通过Nginx直接提供静态文件服务，不需要Node.js进程
- 只有后端API需要PM2管理

---

## 🚀 部署方案选择（AI必读规则）

**AI部署决策规则**: 当用户要求部署时，AI必须根据场景评估并推荐最合适的部署方案。

### 三种部署方案快速对比

| 方案 | 命令 | 时间 | 使用场景 | 推荐度 |
|------|------|------|---------|--------|
| **方案1** | `scripts/full-deploy.bat` | 2分钟 | 日常开发，SSH可用 | ⭐⭐⭐⭐⭐ |
| **方案2** | 切换.gitignore | 1分钟 | SSH不可用，紧急 | ⭐⭐ |
| **方案3** | `scripts/deploy-server-build.bat` | 3分钟 | 服务器有Node.js | ⭐⭐⭐⭐ |

**详细文档**: `aity-uni-app-v2/docs/三种部署方案完整指南.md`

---

### AI部署决策流程

```
用户要求部署
    ↓
检查SSH是否可用？
    ├─ 否 → 推荐方案2（Git提交编译产物）
    └─ 是 ↓
        检查更新内容？
        ├─ 仅后端 → deploy-backend.bat（30秒）
        ├─ 仅前端 → upload-h5-to-server.bat（1分钟）
        └─ 全部 ↓
            检查服务器Node.js？
            ├─ 有 → 提供方案1和方案3
            └─ 无 → 推荐方案1（默认）
```

---

### 方案1: 本地编译+上传（默认推荐）

```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
full-deploy.bat
```

**AI提示模板**:
```
✅ 推荐使用方案1 - 本地编译+上传

自动完成：
  1. 本地编译H5
  2. 压缩并上传到服务器
  3. 更新后端代码
  4. 重启后端服务
  5. 部署前端到Web目录

时间：约2分钟
优点：快速、可靠、本地可测试
```

---

### 方案2: Git提交编译产物（紧急备用）

```bash
cp .gitignore .gitignore.backup
cp .gitignore.allow-dist .gitignore
npm run build:h5
git add dist/ && git commit -m "chore: 添加编译产物" && git push
```

**AI提示模板**:
```
⚠️ 检测到SSH可能不可用，推荐方案2

注意：
  - 会导致Git仓库体积增大
  - 不建议作为常规方案
  - 详细说明：docs/方案2-Git提交编译产物指南.md
```

---

### 方案3: 服务器端编译（备选）

```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
deploy-server-build.bat
```

**AI提示模板**:
```
✅ 方案3可用 - 服务器端编译

前提：服务器已安装Node.js环境
时间：约3分钟
优点：不需要本地编译

如果方案1失败，可以尝试方案3。
```

---

## ✅ 推荐方案

### 方案：本地编译 + 服务器部署静态文件

#### 完整流程

**方式1: 使用统一部署脚本（推荐）**

```batch
# Windows本地执行
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
full-deploy.bat
```

**自动执行**:
1. 本地编译H5
2. 上传到服务器
3. 更新后端代码
4. 重启后端服务
5. 部署H5静态文件到Nginx目录

---

**方式2: 分步执行**

```bash
# 1. 本地编译（Windows本地）
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run build:h5
npm run build:mp-weixin

# 2. 上传到服务器
# 使用WinSCP或脚本上传

# 3. 服务器端部署（SSH到服务器）
cd /tmp/AITY
# 更新后端
cd backend && git reset --hard && git pull origin feature/iteration-1 && pm2 restart aity-backend -f
# 部署前端
cd /var/www/html/h5
# 解压并覆盖文件
```

---

## 🔧 为什么不使用PM2管理H5？

### PM2的作用
- **管理Node.js进程**（如Express服务器）
- **自动重启崩溃的进程**
- **负载均衡和集群**

### H5的本质
- **静态文件**（HTML + CSS + JS）
- **由Nginx直接提供**
- **不需要Node.js进程**

### 正确的架构

```
┌─────────────────┐
│  Nginx (端口80)  │
│                 │
│  ┌───────────┐  │
│  │ H5静态文件 │  │
│  └───────────┘  │
└─────────────────┘

┌─────────────────┐
│ PM2             │
│                 │
│  ┌───────────┐  │
│  │ 后端API   │  │
│  └───────────┘  │
└─────────────────┘
```

**结论**: H5不需要PM2管理，只需要部署到Nginx的静态文件目录

---

## 📋 最终推荐的部署流程

### 日常开发（一键部署）

```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
full-deploy.bat
```

### 仅更新后端（快速修复）

```bash
cd /tmp/AITY/backend && git reset --hard && git pull origin feature/iteration-1 && pm2 restart aity-backend -f
```

**或使用脚本**:
```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
deploy-backend.bat
```

### 仅更新前端

```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
upload-h5-to-server.bat
```

---

## 🎯 Skills目录 vs Docs目录

### 建议配置

#### Skills目录（.claude/skills/）
添加简洁的快速参考文档：
- **coding-standards.md** - 核心规范摘要
- **project-context.md** - 项目上下文
- **development-workflow.md** - 开发工作流

**优点**: 每次会话自动加载，快速获取上下文

#### Docs目录（aity-uni-app-v2/docs/）
保留详细文档：
- **AI编码交互规范与最佳实践.md** - 完整规范
- **AI编程交互关键规范.md** - 概念澄清
- **统一部署脚本使用指南.md** - 部署指南
- **各种完成报告** - 历史记录

**优点**: 详细说明，版本控制，用户可读

---

## ✅ 最终答案

### Q1: AI会自动编译吗？
**答**: ❌ 不会，需要明确执行编译命令

### Q2: 编译应该在哪里进行？
**答**: ✅ **本地编译，服务器部署静态文件**

### Q3: 应该使用哪种命令？
**答**:
```bash
# ❌ 不推荐：服务器端编译
cd /tmp/AITY/backend && git pull && pm2 restart aity-backend -f
cd /tmp/AITY/aity-uni-app-v2 && npm run build:h5
cp -r dist/build/h5/* /var/www/html/h5/
pm2 restart aity-frontend -f  # ❌ 不需要！

# ✅ 推荐：本地编译 + 自动化部署
cd scripts && full-deploy.bat  # 自动完成所有操作
```

---

## 💡 优化建议

### 更新Skills目录

在 `.claude/skills/` 添加 `development-workflow.md`:

```markdown
# AITY VIP 开发工作流

## 快速开始
- 主要项目: aity-uni-app-v2
- 核心规范: docs/AI编程交互规范与最佳实践.md
- 概念澄清: docs/AI编程交互关键规范.md

## 开发流程
1. 需求确认
2. 查看相关文档
3. 编写代码
4. 提交代码
5. **立即编译** (npm run build:h5 && npm run build:mp-weixin)
6. 更新文档
7. 部署测试

## 核心原则
- 提交即编译
- 概念清晰（消息标签≠消息类型）
- 文档同步更新

## 部署命令
- 完整部署: scripts\full-deploy.bat
- 仅后端: scripts\deploy-backend.bat
- 仅前端: scripts\upload-h5-to-server.bat
```

这样每次会话开始时，我会自动加载这些关键信息！
