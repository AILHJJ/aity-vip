# AITY VIP 项目开发规则

> **最后更新**: 2026-05-02  
> **适用范围**: 所有使用 CodeBuddy AI 协助开发的人员  
> **核心原则**: 先本地测试 → 用户验收 → 询问后部署生产

---

## 🌐 语言与命名规范（必须遵守）

### 核心原则
- **面向用户**: 本项目面向中国用户，所有文档、文件命名、目录结构应使用**简体中文**
- **避免中英混杂**: 禁止出现 `DIRECTORY_STRUCTURE`、`项目结构说明` 这类混合命名
- **代码注释**: 代码注释使用中文

### 文件命名规则
| 类型 | 规范 | 示例 |
|------|------|------|
| 文档文件 | 中文 | `项目结构说明.md`、`部署操作手册.md` |
| 目录名 | 中文 | `文档/`、`核心文档/`、`归档目录/` |
| 代码文件 | 保持英文（技术惯例） | `messageController.js` |
| 代码注释 | 中文 | `// 获取用户消息列表` |

### 禁止事项
- ❌ 禁止使用 `README.md`、`DIRECTORY_STRUCTURE.md` 这类英文文件名
- ❌ 禁止目录名出现英文（如 `docs/` 应改为 `文档/` 或直接使用英文 `docs/` 但内含中文文档）
- ❌ 禁止中英混杂：`我的文档_readme.md`

### 合规检查
每次创建文档或目录前，AI 应检查是否符合中文命名规范。

---

## 🚨 项目固定配置（无需询问，直接使用）

### 服务器信息
- 服务器IP: `124.221.119.134`
- SSH用户: `root`
- SSH密钥: `d:\your-mcp-proxy\AITY_VIP\AITY0127.pem`
- 域名: `aity88.online`
- 后端端口: `3001`

### 数据库配置
- 地址: `124.221.119.134:3306`
- Test数据库: `投研图灵室_test`
- 生产数据库: `投研图灵室`
- 用户名: `fl`（不是 root！）
- 密码: `fl10b312`

### 项目结构（重要！）
```
AITY_VIP/
├── backend/              # 后端服务 (Node.js + Express)
├── aity-uni-app-v2/     # 微信小程序前端 (uni-app)
├── docs/                # 文档目录
└── scripts/             # 部署脚本
```

**注意**: 
- ❌ 没有 `frontend/` 目录（已删除，是重复项目）
- ✅ 微信小程序源码: `aity-uni-app-v2/src/`
- ✅ 编译输出: `aity-uni-app-v2/dist/`

---

## 📋 标准迭代流程（强制执行）

### ⚠️ 核心原则：先确认方案，后执行编码

**每次迭代必须先与用户确认方案，避免重复迭代！**

### 每次迭代必须执行以下步骤：

```
1. 理解需求
   ↓
2. 【重要】提交方案设计（必须包含UI布局草图/描述）
   ↓
3. 等待用户确认方案
   ↓
4. 确认后才开始编码
   ↓
5. 编译测试
   ↓
6. 用户验收
   ↓
7. 提交 Git + 更新迭代记录
   ↓
8. 询问用户是否部署生产
```

### 步骤1：理解需求
- 仔细阅读用户需求
- 如有不清楚的地方，**必须先询问确认**，不能猜测

### 步骤2：提交方案设计（强制！）

**编码前必须先提交方案，等待用户确认！**

方案内容必须包含：
```
## 📋 方案设计

### 需求理解
- 确认对需求的理解是否正确

### UI设计方案
【必须包含】界面布局描述或草图，例如：
```
┌─────────────────────────────────┐
│ [类型]           10:30         │
│ 标题...                        │
│ 内容...                        │
├─────────────────────────────────┤
│ [标签]           👁12 💬3     │
└─────────────────────────────────┘
```

### 技术方案
- 修改哪些文件
- 关键代码改动点

### 修改文件清单
- 文件1
- 文件2

---

### ⚠️ 禁止事项
- ❌ 禁止不确认方案就编码
- ❌ 禁止用户说"确认"前就开始编码
- ❌ 禁止大幅修改代码而不先提交方案
```

### 步骤3：等待用户确认
- 用户回复"确认"或"可以"后才开始编码
- 如用户有修改意见，先修改方案，再等待确认

### 步骤3：本地测试（AI 自动执行，无需询问）

#### 3.1 后端修改后
```bash
# 重启后端
cd d:\your-mcp-proxy\AITY_VIP\backend
# 杀掉占用3001端口的进程
netstat -ano | findstr :3001 | Select-String "LISTENING" | ForEach-Object { $_.ToString().Split(' ')[-1] } | ForEach-Object { taskkill /PID $_ /F }
npm run dev
```

#### 3.2 前端修改后
```bash
# 重新编译微信小程序
cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run dev:mp-weixin
# 输出: dist/dev/mp-weixin/
```

#### 3.3 自动测试接口
```bash
# 测试后端是否正常运行
Invoke-RestMethod -Uri "http://localhost:3001/" -Method Get
```

### 步骤4：用户验收
- **提示用户**: "本地测试完成，请进行验收"
- **等待用户确认**后才能进入下一步
- **严禁跳过验收流程**

### 步骤5：提交 Git + 更新迭代记录（必须！）
```bash
# 1. 添加修改的文件
cd d:\your-mcp-proxy\AITY_VIP
git add <修改的文件>

# 2. 提交（提交信息格式如下）
git commit -m "feat: <简要描述>

- 修改内容1
- 修改内容2
- 测试情况: <测试结果>
- 已知问题: <如有>"

# 3. 更新迭代记录 (docs/iteration-records.md)
# 4. Push 到远程
git push origin <分支名>
```

**提交信息格式模板**:
```
feat: 添加未读消息数接口

- 新增 GET /api/messages/unread-count 接口
- 修改 messageController.js 添加 getUnreadCount 函数
- 修改 messageRoutes.js 添加路由
- 测试情况: 后端启动正常，接口返回200
- 已知问题: 无

迭代记录已更新: docs/iteration-records.md
```

### 步骤6：询问用户是否部署生产
- **询问**: "是否部署到生产环境？"
- **等待用户确认**后才能执行部署
- **严禁未经确认就部署**

### 步骤7：部署生产（用户确认后）
```bash
# 部署后端
cd d:\your-mcp-proxy\AITY_VIP\backend
node deploy-run.js

# 编译生产版本微信小程序
cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run build:mp-weixin
# 输出: dist/build/mp-weixin/
# 上传到微信公众平台
```

---

## 🔧 后端开发规范

### 配置文件
- **使用单一 `.env` 文件**
- **不要创建** `.env.development` 或 `.env.test`（已删除）
- **数据库切换**: 修改 `DB_NAME` 变量

```env
# 开发环境: 连接 test 数据库
DB_NAME=投研图灵室_test

# 生产环境: 连接生产数据库 (部署时修改)
DB_NAME=投研图灵室
```

### 代码规范
1. **新增函数必须导出**
   ```javascript
   // ✅ 正确
   async function getUnreadCount(req, res) { ... }
   module.exports = {
     getMessages,
     getUnreadCount,  // ← 必须添加
     ...
   };
   
   // ❌ 错误: 函数未导出
   async function getUnreadCount(req, res) { ... }
   module.exports = {
     getMessages,
     // ← 忘记添加 getUnreadCount
   };
   ```

2. **路由优先级**
   ```javascript
   // ✅ 正确: 静态路由放在动态路由之前
   router.get('/unread-count', ...);  // 静态路由
   router.get('/:id', ...);          // 动态路由
   
   // ❌ 错误: 动态路由会捕获 /unread-count
   router.get('/:id', ...);
   router.get('/unread-count', ...);
   ```

3. **启动后端**
   ```bash
   cd d:\your-mcp-proxy\AITY_VIP\backend
   npm run dev
   ```

---

## 📱 微信小程序开发规范

### 项目位置
- **源码目录**: `aity-uni-app-v2/src/`
- **编译输出**: `aity-uni-app-v2/dist/`
- **微信开发者工具导入**: `aity-uni-app-v2/dist/dev/mp-weixin/`

### 编译命令
```bash
# 开发版本 (本地测试用)
cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run dev:mp-weixin
# 输出: dist/dev/mp-weixin/

# 生产版本 (部署用)
npm run build:mp-weixin
# 输出: dist/build/mp-weixin/
```

### 代码修改后
1. **自动重新编译**: `npm run dev:mp-weixin`
2. **微信开发者工具会自动热重载**
3. **测试所有修改的功能**

---

## 📝 迭代记录规范（必须！）

### 记录位置
`docs/iteration-records.md`

### 记录格式
```markdown
### [版本号] 迭代标题
- **日期**: YYYY-MM-DD
- **Git Commit**: <commit-hash>
- **修改文件**:
  - 文件1: 修改内容
  - 文件2: 修改内容
- **测试情况**:
  - 后端: ✅/❌
  - 前端: ✅/❌
- **已知问题**: <如有>
- **回退命令**:
  ```bash
  git reset --hard <commit-hash>
  ```
```

### 每次迭代后必须
1. ✅ 更新 `docs/iteration-records.md`
2. ✅ 提交 Git (带详细提交信息)
3. ✅ Push 到远程仓库

---

## ✅ AI 可以自动执行的操作（无需询问）

**核心原则：所有不影响线上生产环境的本地操作，AI 必须自动执行，无需询问用户！**

### 后端相关（自动执行）
1. ✅ **修改后端代码后** → 自动重启后端
   ```bash
   # 自动执行（无需询问）
   cd d:\your-mcp-proxy\AITY_VIP\backend
   # 杀掉占用3001端口的进程，然后 npm run dev
   ```

2. ✅ **后端启动失败时** → 自动排查并修复
   - 检查端口占用
   - 杀掉冲突进程
   - 检查代码错误（如 module.exports 遗漏）
   - 修复后重新启动

3. ✅ **自动测试接口**
   - 检查后端是否启动：`Invoke-RestMethod -Uri "http://localhost:3001/"`
   - 测试关键接口

4. ✅ **自动查看日志**
   - 后端报错时自动查看日志定位问题

### 前端相关（自动执行）
1. ✅ **修改前端代码后** → 自动重新编译
   ```bash
   # 自动执行（无需询问）
   cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
   npm run dev:mp-weixin
   ```

2. ✅ **前端编译失败时** → 自动排查并修复
   - 检查依赖是否安装（自动运行 `npm install`）
   - 检查代码错误
   - 修复后重新编译

### 代码相关（自动执行）
1. ✅ **自动修复 Bug**
   - 发现代码错误自动修复并重新测试
   - 例如：忘记导出函数、路由顺序错误等

2. ✅ **自动提交 Git**（本地测试通过后）
   - 添加修改的文件
   - 写详细的提交信息
   - 更新 `docs/iteration-records.md`

### ❌ 只有以下操作需要询问用户
1. **部署到生产环境**
2. **修改生产环境配置**
3. **操作生产数据库**

---

## ❌ AI 禁止执行的操作

1. ❌ **未经用户确认就部署生产环境**
2. ❌ **跳过验收流程**
3. ❌ **在开发环境连接生产数据库**
4. ❌ **不记录迭代内容就提交 Git**

---

## 🆘 问题排查流程

### 后端无法启动
1. 检查端口是否被占用: `netstat -ano | findstr :3001`
2. 杀掉占用进程: `taskkill /PID <PID> /F`
3. 检查代码错误: 查看终端日志
4. 检查 `module.exports` 是否导出所有函数

### 前端编译失败
1. 检查依赖是否安装: `cd aity-uni-app-v2 && npm install`
2. 检查代码错误: 查看终端日志
3. 删除 `node_modules` 重新安装

### 接口返回 400/500
1. 检查路由是否正确定义
2. 检查中间件是否正确使用
3. 查看后端日志定位错误

---

## 📋 快速参考

### 本地测试完整流程
```bash
# 1. 启动后端
cd d:\your-mcp-proxy\AITY_VIP\backend
npm run dev

# 2. 编译前端 (新终端)
cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run dev:mp-weixin

# 3. 微信开发者工具导入
# 目录: d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\dist\dev\mp-weixin

# 4. 测试功能

# 5. 提示用户验收
```

### 生产部署完整流程
```bash
# 1. 用户确认后，部署后端
cd d:\your-mcp-proxy\AITY_VIP\backend
node deploy-run.js

# 2. 编译生产版本前端
cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run build:mp-weixin

# 3. 上传到微信公众平台
# 目录: d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\dist\build\mp-weixin
```

---

## 🎯 核心要点（AI 必须记住）

1. **项目结构**
   - 后端: `backend/`
   - 微信小程序: `aity-uni-app-v2/`
   - ❌ 没有 `frontend/` 目录

2. **迭代流程**
   - 修改代码 → 本地测试 → 用户验收 → 提交Git → 询问部署

3. **提交规范**
   - 必须写详细的提交信息
   - 必须更新 `docs/iteration-records.md`

4. **部署规范**
   - 只有用户确认后才能部署生产环境
   - 严禁跳过验收流程

---

**强制执行**: 是  
**适用范围**: 所有开发人员 + AI 助手
