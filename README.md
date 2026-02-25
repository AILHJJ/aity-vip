# AITY VIP - 投研内部分享系统

## ⚠️ AI协作重要提示

**使用 Claude Code (AI Coding Assistant) 开发前，请务必阅读**:
- 📖 [AI协作规则](.claude/AI协作规则.md) - **必须遵守的协作流程**

### 核心规则摘要

1. **环境区分**:
   - 开发环境 (`npm run dev:*`) → 本地后端 + 测试数据库
   - 生产环境 (`npm run build:*`) → 生产服务器 + 生产数据库
2. **后端更新**: 修改后端代码后必须同步更新服务器
3. **文档同步**: 代码变更必须同步更新文档

### 环境配置快速参考

| 命令 | 连接后端 | 数据库 |
|------|---------|--------|
| `npm run dev:mp-weixin` | 本地 (192.168.2.140:3001) | 测试库 (投研图灵室_test) |
| `npm run build:mp-weixin` | 生产 (aity88.online:8443) | 生产库 (投研图灵室) |

---

## 项目简介

AITY VIP是一个专为投研团队设计的内部分享系统，支持消息发布、讨论交流、用户管理等功能，采用前后端分离架构。

## 技术栈

### 前端
- **框架**: uni-app 3.0 (Vue 3)
- **构建工具**: Vite 5.2.8
- **状态管理**: Pinia
- **样式**: SCSS
- **平台**: 微信小程序、H5

### 后端
- **语言**: Node.js
- **框架**: Express
- **数据库**: MySQL
- **认证**: JWT
- **进程管理**: PM2

## 项目结构

```
AITY_VIP/
├── .claude/                    # AI协作配置
│   └── AI协作规则.md           # ⚠️ 必读：AI协作规则
├── backend/                    # 后端代码
│   ├── src/                    # 源代码
│   ├── package.json            # 依赖配置
│   ├── ecosystem.config.js     # PM2配置
│   └── ...
├── aity-uni-app-v2/            # 小程序代码
│   ├── src/                    # 源代码
│   ├── dist/                   # 编译输出
│   ├── docs/                   # 文档
│   ├── package.json            # 依赖配置
│   └── ...
├── docs/                       # 项目文档
│   ├── core/                   # 核心文档
│   ├── config/                 # 配置文档
│   └── iteration/              # 迭代文档
└── README.md                   # 本文件
```

---

## 🚀 快速开始

### 开发环境要求

- **Node.js**: v16.0.0+
- **npm**: v7.0.0+
- **MySQL**: v5.7+
- **微信开发者工具**: 最新版

### 安装步骤

#### 1. 克隆仓库

```bash
git clone <repository-url> AITY_VIP
cd AITY_VIP
```

#### 2. 安装后端依赖

```bash
cd backend
npm install
```

#### 3. 配置后端环境

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件
# 开发环境使用测试数据库
DB_ENV=test          # 连接测试库 (投研图灵室_test)
# DB_ENV=production  # 连接生产库 (投研图灵室)
```

#### 4. 初始化数据库

```bash
node init-test-data.js
```

#### 5. 安装小程序依赖

```bash
cd ../aity-uni-app-v2
npm install
```

---

## 🏃 运行项目

### 本地开发

#### 启动后端

```bash
cd backend
npm run dev
# 后端运行在 http://localhost:3001
```

#### 启动小程序

```bash
cd aity-uni-app-v2
npm run dev:mp-weixin
```

#### 微信开发者工具

1. 打开微信开发者工具
2. 导入项目: `aity-uni-app-v2`
3. 勾选"不校验合法域名"
4. **⚠️ 注意**:
   - 开发环境 (`npm run dev:*`) 连接本地后端 + 测试数据库
   - 生产环境 (`npm run build:*`) 连接生产服务器 + 生产数据库

---

## 📦 生产部署

### 环境配置

生产环境配置通过 `DB_ENV` 环境变量自动切换：

```
开发: npm run dev:*     → 本地后端 (192.168.2.140:3001) → 测试库
生产: npm run build:*   → 生产服务器 (aity88.online:8443) → 生产库
```

#### 服务器信息

```
地址: aity88.online
SSH端口: 22
HTTPS端口: 8443
后端端口: 3000
```

### 部署步骤

#### 1. 部署后端

```bash
# 连接到服务器
ssh root@aity88.online

# 进入后端目录
cd /root/AITY_VIP/backend

# 拉取最新代码
git pull origin feature/iteration-1

# 安装依赖（如有新增）
npm install

# 重启服务
pm2 restart aity-vip-backend

# 查看状态
pm2 status
pm2 logs aity-vip-backend --lines 50
```

#### 2. 部署小程序

```bash
# 编译小程序
cd aity-uni-app-v2
npm run build:mp-weixin

# 微信开发者工具上传
# 项目路径: dist/build/mp-weixin
# 版本号: 1.6.1
# 版本描述: 更新说明
```

**⚠️ 重要**:
- 小程序编译后自动连接生产环境
- 真机预览和正式版都连接 `https://aity88.online:8443`
- 后端代码修改后必须同步更新服务器

---

## 🔄 Git工作流

### 分支策略

- **main**: 稳定版本，用于生产部署
- **feature/iteration-1**: 当前开发分支
- **feature/xxx**: 新功能开发分支

### 提交规范

采用 Conventional Commits 规范:

```bash
# 新功能
git commit -m "feat(message): 添加消息置顶功能"

# Bug修复
git commit -m "fix(auth): 修复登录过期问题"

# 文档更新
git commit -m "docs(readme): 更新部署说明"
```

### 代码流程

```bash
# 1. 修改代码
# 2. 提交到Git
git add .
git commit -m "feat: 功能描述"
git push origin feature/iteration-1

# 3. 如修改了后端，部署到服务器
ssh root@aity88.online
cd /root/AITY_VIP/backend
git pull origin feature/iteration-1
pm2 restart aity-vip-backend

# 4. 如修改了小程序，编译并上传
cd aity-uni-app-v2
npm run build:mp-weixin
# 微信开发者工具上传
```

---

## 📚 文档

### 📖 文档索引

- 🎉 **[文档优化最终完成报告](docs/文档优化最终完成报告.md)** - ✅ **最新**（2026-02-12）
  - 阶段1 + 阶段2：全部完成
  - API文档：70% → 95%（+25%）
  - 功能文档：77% → 98%（+21%）
  - 技术文档：60% → 98%（+38%）
  - 新建10个关键文档，约50,000字

- 📋 **[文档系统性审查报告](docs/文档系统性审查报告.md)** - 审查报告
  - API文档一致性审查
  - 功能文档覆盖度评估
  - 部署文档准确性检查
  - 文档结构优化建议

- 🎯 **[文档优化行动计划](docs/文档优化行动计划.md)** - 执行计划
  - 阶段1：关键修复 ✅ 完成
  - 阶段2：结构优化 ✅ 完成
  - 阶段3：长期维护 ⏳ 待开始

- 📚 **[文档索引INDEX](docs/INDEX.md)** - 完整文档导航
  - 按主题浏览（8大主题）
  - 按时间浏览（最新/历史）
  - 按状态浏览（当前/归档/待更新）
  - 按关键词快速搜索
  - 文档目录结构树

### 核心文档

- [AI协作规则](.claude/AI协作规则.md) - ⚠️ **必读**
- [需求文档](docs/core/需求文档.md)
- [API文档](docs/core/API文档.md)
- [部署手册](docs/core/部署手册.md)
- [开发指南](docs/core/开发指南.md)

### 配置文档

- [环境配置](docs/config/环境配置.md)
- [服务器部署](docs/config/服务器部署详细指令.md)
- [微信小程序部署](docs/config/微信小程序部署指南.md)

### 版本文档

- [v1.6.1部署指南](aity-uni-app-v2/docs/v1.6.1部署指南.md)
- [Markdown编辑器优化说明](aity-uni-app-v2/docs/Markdown编辑器优化说明-v1.6.1.md)
- [更新日志](aity-uni-app-v2/docs/更新日志-v1.6.0.md)

---

## ✅ 功能清单

### 核心功能

- ✅ 用户认证与权限管理
  - 5级用户角色 (super_admin, admin, vip_mid, vip_short, trial)
  - JWT Token认证
  - 权限控制

- ✅ 消息系统
  - 10种消息类型
  - Markdown编辑器 (参考mdnice设计)
  - 消息搜索、筛选、收藏
  - 消息置顶功能
  - 图片上传（支持粘贴）

- ✅ 讨论系统
  - 发起讨论
  - 回复讨论
  - 公开/私密讨论

- ✅ 管理员功能
  - 发布消息
  - 编辑/删除消息
  - 草稿保存
  - 数据统计

- ✅ 用户管理
  - 用户列表
  - 创建/编辑/删除用户
  - 用户搜索

### 功能完成度: 95%

详见: [功能清单](aity-uni-app-v2/docs/features.md)

---

## 🧪 测试

### 测试账号

```
超级管理员: admin@example.com / 123456
管理员: subadmin@example.com / 123456
VIP中线: vip_mid@example.com / 123456
VIP短线: vip_short@example.com / 123456
体验用户: trial@example.com / 123456
```

### 功能测试

详见: [功能测试指南](docs/iteration/功能测试指南.md)

---

## 📞 支持

### 问题反馈

- GitHub Issues
- 技术负责人: ___________
- 紧急联系: ___________

---

## 📄 许可证

MIT License

---

## 🎯 版本历史

### v1.6.1 (2025-02-04)

**修复**:
- 修复消息发布400错误 (groupId验证问题)

**优化**:
- Markdown编辑器优化 (参考mdnice设计)
- 发布按钮固定底部
- 图片附件优化
- 粘贴图片功能

**详见**: [v1.6.1部署指南](aity-uni-app-v2/docs/v1.6.1部署指南.md)

### v1.6.0 (2025-02-03)

**新增**:
- 消息置顶功能
- 动画性能优化

**优化**:
- 完善文档体系

### v1.5.1 (2025-02-02)

**优化**:
- UI全面优化
- 设计系统建立

---

## ⚠️ 重要提示

### 开发注意事项

1. **环境区分**
   - 开发环境 (`npm run dev:*`) 连接本地后端 + 测试数据库
   - 生产环境 (`npm run build:*`) 连接生产服务器 + 生产数据库
   - 修改前端 `config.js` 中的局域网IP为本机IP

2. **后端更新流程**
   - 修改后端代码后必须同步更新服务器
   - 使用 `pm2 restart` 重启服务
   - 查看日志确认无错误

3. **小程序部署**
   - `npm run build:mp-weixin` 编译后自动连接生产环境
   - 真机预览前确认后端已更新
   - 上传前测试所有功能

4. **AI协作**
   - 使用Claude Code前必读 [.claude/AI协作规则.md](.claude/AI协作规则.md)
   - 遵循Git提交规范
   - 同步更新相关文档

---

**文档版本**: v2.1.0
**最后更新**: 2026-02-25
**项目版本**: v1.6.2
