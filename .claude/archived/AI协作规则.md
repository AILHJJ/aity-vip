# AI Claude Code 协作规则

**项目**: AITY VIP - 投研内部分享系统
**文档版本**: v1.0.0
**创建日期**: 2025-02-04
**适用对象**: Claude Code (AI Coding Assistant)

---

## 📋 目的

本文档定义了使用 Claude Code (AI Coding Assistant) 进行项目开发时必须遵守的规则和流程。

**核心原则**:
1. **生产环境优先**: 所有代码默认为生产环境配置
2. **明确部署流程**: 代码修改后必须明确部署步骤
3. **文档同步更新**: 代码变更必须同步更新文档

---

## 🚀 核心规则

### 规则1: API环境配置

#### 配置位置
```javascript
// 文件: aity-uni-app-v2/src/utils/request.js
```

#### 配置规则
```javascript
/**
 * ⚠️ 生产环境配置（默认）
 */
const PRODUCTION_API_URL = 'https://aity88.online:8443/api'

/**
 * 本地开发配置（仅调试时临时使用）
 */
const DEVELOPMENT_API_URL = 'http://192.168.2.140:3001/api'

/**
 * 默认使用生产环境
 */
const API_BASE_URL = PRODUCTION_API_URL
```

#### ⚠️ 重要
- **默认**: 小程序编译后始终连接生产环境
- **真机预览**: 自动连接 `https://aity88.online:8443`
- **正式版**: 自动连接 `https://aity88.online:8443`
- **本地调试**: 临时修改为 `DEVELOPMENT_API_URL`，调试完改回

---

### 规则2: 后端代码修改流程

#### 2.1 修改后端代码

当需要修改后端代码时（`backend/` 目录）:

```bash
# 1. 修改代码
# 2. 本地测试
cd backend
npm run dev

# 3. 提交代码
git add .
git commit -m "feat: 功能描述"
git push origin feature/iteration-1
```

#### 2.2 部署到服务器

**⚠️ 重要: 后端代码修改后，必须同步更新生产服务器**

```bash
# 连接到腾讯云服务器
ssh root@aity88.online

# 进入后端目录
cd /root/AITY_VIP/backend

# 拉取最新代码
git pull origin feature/iteration-1

# 安装依赖（如有新增）
npm install

# 重启PM2服务
pm2 restart aity-vip-backend

# 查看服务状态
pm2 status
pm2 logs aity-vip-backend --lines 50
```

#### 2.3 验证部署

```bash
# 测试API是否正常
curl https://aity88.online:8443/api/health

# 或使用浏览器访问
# https://aity88.online:8443/api/health
```

---

### 规则3: 小程序代码修改流程

#### 3.1 修改小程序代码

当需要修改小程序代码时（`aity-uni-app-v2/src/` 目录）:

```bash
# 1. 修改代码
# 2. 提交代码
cd aity-uni-app-v2
git add .
git commit -m "feat: 功能描述"
git push origin feature/iteration-1

# 3. 编译小程序
npm run build:mp-weixin

# 4. 微信开发者工具上传
# 项目路径: dist/build/mp-weixin
# 版本号: 自动递增
```

#### 3.2 API配置检查

**⚠️ 每次修改 `request.js` 时，必须确认**:
- `API_BASE_URL = PRODUCTION_API_URL` ✅
- 不要误改为 `DEVELOPMENT_API_URL`（除非调试需要）

#### 3.3 编译后验证

```bash
# 查看编译输出
dist/build/mp-weixin/

# 确认API地址
# 微信开发者工具 → 网络 → 查看请求URL
# 应该是: https://aity88.online:8443/api
```

---

### 规则4: 提交信息规范

#### 4.1 Commit Message格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 4.2 Type类型

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

#### 4.3 示例

```bash
# 新功能
git commit -m "feat(message): 添加消息置顶功能"

# Bug修复
git commit -m "fix(auth): 修复登录过期问题"

# 文档更新
git commit -m "docs(readme): 更新部署说明"
```

---

### 规则5: 文档同步更新

#### 5.1 必须更新的文档

修改以下功能时，必须同步更新文档:

| 修改内容 | 必须更新的文档 | 文档位置 |
|---------|--------------|---------|
| 新增功能 | README.md | 项目根目录 |
| API变更 | API文档.md | docs/core/ |
| 部署流程 | 部署指南.md | docs/ |
| 配置变更 | 环境配置.md | docs/config/ |
| 版本发布 | 更新日志.md | docs/ |

#### 5.2 文档更新清单

```markdown
## 本次更新涉及文档

- [ ] README.md
- [ ] docs/core/API文档.md
- [ ] docs/config/环境配置.md
- [ ] aity-uni-app-v2/docs/更新日志.md
```

---

## 📝 AI Claude Code 工作流程

### 标准开发流程

```
用户需求
  ↓
AI分析需求
  ↓
检查是否涉及后端修改
  ├─ 是 → 提醒用户需要部署服务器
  └─ 否 → 继续下一步
  ↓
修改代码
  ↓
提交Git（自动生成Commit Message）
  ↓
编译小程序（如需要）
  ↓
生成部署文档
  ↓
提醒用户下一步操作
```

### AI必须执行的检查项

每次代码修改后，AI必须：

- [ ] 1. 检查是否修改了 `backend/` 目录
  - 是 → 提醒用户: "后端代码已修改，需要更新服务器部署"
  - 否 → 跳过

- [ ] 2. 检查是否修改了 `aity-uni-app-v2/src/utils/request.js`
  - 是 → 确认API配置是否为 `PRODUCTION_API_URL`
  - 否 → 跳过

- [ ] 3. 提交代码到Git
  - 后端: `git push origin feature/iteration-1`
  - 小程序: `git push origin feature/iteration-1`

- [ ] 4. 编译小程序（如修改了小程序代码）
  - 执行: `npm run build:mp-weixin`

- [ ] 5. 生成部署指南
  - 创建: `docs/v{版本号}部署指南.md`

- [ ] 6. 总结并提醒用户
  - 明确告知需要执行的操作
  - 提供详细的命令和步骤

---

## ⚠️ 常见场景处理

### 场景1: 只修改小程序代码

**示例**: 修改UI样式

**AI处理流程**:
```bash
1. 修改代码
2. git add + git commit + git push
3. npm run build:mp-weixin
4. 提示: "小程序已编译，请在微信开发者工具中上传"
```

**不需要**: 更新服务器

---

### 场景2: 只修改后端代码

**示例**: 修复API Bug

**AI处理流程**:
```bash
1. 修改代码
2. git add + git commit + git push
3. 生成部署命令:
   ssh root@aity88.online
   cd /root/AITY_VIP/backend
   git pull origin feature/iteration-1
   pm2 restart aity-vip-backend
```

**提醒**: "⚠️ 后端代码已修改，必须更新服务器才能生效"

---

### 场景3: 同时修改前后端

**示例**: 新增功能（前端UI + 后端API）

**AI处理流程**:
```bash
1. 修改后端代码
2. 修改前端代码
3. 分别提交到Git
4. 编译小程序
5. 提醒:
   "⚠️ 本次修改涉及前后端，部署步骤：
   1. 先部署后端（执行命令...）
   2. 再上传小程序（微信开发者工具...）"
```

---

## 🔍 环境配置快速参考

### 生产环境配置

```javascript
// aity-uni-app-v2/src/utils/request.js
const API_BASE_URL = 'https://aity88.online:8443/api'
```

### 服务器信息

```bash
地址: aity88.online
SSH端口: 22
HTTPS端口: 8443
后端端口: 3001
用户: root
```

### PM2命令

```bash
# 查看状态
pm2 status

# 重启服务
pm2 restart aity-vip-backend

# 查看日志
pm2 logs aity-vip-backend --lines 50

# 查看错误日志
pm2 logs aity-vip-backend --err
```

---

## 📋 每次协作的输出模板

### 完成任务后，AI应该输出:

```markdown
## ✅ 任务完成

### 修改内容
- 后端: ✅ 已修改 / ❌ 未修改
- 小程序: ✅ 已修改 / ❌ 未修改

### Git提交
- 后端: ✅ 已提交
- 小程序: ✅ 已提交
- Commit: <commit-hash>

### 编译状态
- 小程序: ✅ 已编译
- 输出: dist/build/mp-weixin

---

## 🚀 部署步骤

### 后端部署
```bash
# 1. 连接服务器
ssh root@aity88.online

# 2. 拉取代码
cd /root/AITY_VIP/backend
git pull origin feature/iteration-1

# 3. 重启服务
pm2 restart aity-vip-backend

# 4. 验证
pm2 status
pm2 logs aity-vip-backend --lines 50
```

### 小程序部署
```bash
# 1. 打开微信开发者工具
# 2. 导入项目: dist/build/mp-weixin
# 3. 上传代码
# 4. 提交审核
```

---

## ⚠️ 重要提示

- [ ] 后端代码已修改，必须更新服务器部署
- [ ] 小程序已编译，可直接上传
- [ ] API配置为生产环境，连接到 https://aity88.online:8443

---

**文档版本**: v1.0.0
**最后更新**: 2025-02-04
```

---

## 📚 相关文档

- [项目README](../../README.md)
- [API文档](../docs/core/API文档.md)
- [部署指南](../docs/core/部署手册.md)
- [环境配置](../docs/config/环境配置.md)

---

## 🔄 文档更新记录

| 版本 | 日期 | 修改内容 | 修改人 |
|------|------|---------|--------|
| v1.0.0 | 2025-02-04 | 创建初始版本 | Claude Code |

---

**⚠️ 重要提醒**:
1. 本文档由AI Claude Code维护
2. 每次使用AI协作时，AI首先读取本文档
3. 如有规则变更，必须同步更新本文档
4. 文档位置: `.claude/AI协作规则.md`

---

**📞 问题反馈**:
如发现规则不合理或有改进建议，请联系项目负责人。
