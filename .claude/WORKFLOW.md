# AI 编码工作流程规范

> **创建日期**: 2026-03-05
> **适用范围**: Claude Code 在 AITY_VIP 项目中的所有编码任务
> **目的**: 确保代码质量,规范开发流程,减少错误

---

## 一、代码编写后的标准流程

### 1.1 强制执行步骤(按顺序)

当 Claude 完成任何代码编写、修改或重构任务后,**必须**按以下顺序执行:

#### 步骤 1: 编译检查

```bash
# 1. 编译微信小程序开发版
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run dev:mp-weixin

# 2. 编译微信小程序生产版
npm run build:mp-weixin:local

# 3. 启动/重启 H5 开发服务器
npm run dev:h5
```

**检查要点**:
- ✅ 所有编译命令必须成功完成(显示 `DONE Build complete`)
- ✅ 无阻塞性错误(允许 Sass 废弃警告)
- ✅ 输出目录存在完整文件(app.js, app.json, pages等)

#### 步骤 2: 后端服务管理

```bash
# 检查后端是否运行
curl -s http://localhost:3001/health

# 如果未运行,启动后端
cd D:\your-mcp-proxy\AITY_VIP\backend
npm run dev
```

**检查要点**:
- ✅ 后端服务运行在 `localhost:3001`
- ✅ 健康检查返回正常响应
- ✅ 数据库连接正常

#### 步骤 3: Git 提交(仅在编译成功时)

```bash
# 仅当前两步都成功时才执行
git add .
git commit -m "feat: 功能描述"
```

**禁止事项**:
- ❌ 编译失败时禁止提交代码
- ❌ 后端未启动时禁止提交代码
- ❌ 跳过测试直接提交

---

## 二、编译错误处理流程

### 2.1 增量编译 vs 完整编译

**增量编译错误**:
- 表现: 开发模式下出现错误提示,但最终编译成功
- 原因: Vite/uni-app 增量编译缓存问题
- 处理: 检查最终编译结果,如果成功可忽略增量错误

**完整编译错误**:
- 表现: `npm run build:mp-weixin:local` 失败
- 原因: 代码存在实际错误
- 处理: **必须修复后才能继续**

### 2.2 常见编译问题排查

| 错误类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `'return' outside of function` | 函数结构错误或增量缓存问题 | 检查实际代码结构,运行完整编译验证 |
| `Identifier already declared` | 变量重复声明或缓存问题 | 检查变量声明,清理缓存后重新编译 |
| Sass DEPRECATION WARNING | 使用了废弃的 Sass API | 暂时忽略,后续优化 |
| 模块未找到 | 导入路径错误 | 检查 import 路径和文件是否存在 |

---

## 三、后端服务管理规范

### 3.1 启动前检查

```bash
# 1. 检查端口占用
netstat -ano | findstr ":3001"

# 2. 检查进程是否运行
tasklist | findstr "node"
```

### 3.2 启动流程

```bash
# 标准启动
cd D:\your-mcp-proxy\AITY_VIP\backend
npm run dev

# 如果端口被占用,先停止旧进程
taskkill /F /PID <进程ID>
```

### 3.3 验证后端正常

```bash
# 健康检查
curl http://localhost:3001/health

# 预期返回
{
  "status": "ok",
  "timestamp": "2026-03-05T..."
}
```

---

## 四、Git 提交规范

### 4.1 提交时机

**允许提交的条件**:
- ✅ 微信小程序开发版编译成功
- ✅ 微信小程序生产版编译成功
- ✅ H5 编译成功(或服务运行正常)
- ✅ 后端服务运行正常
- ✅ 手动测试通过(如果用户要求)

**禁止提交的情况**:
- ❌ 任何编译失败
- ❌ 后端服务未启动
- ❌ 存在未解决的 TypeScript/ESLint 错误
- ❌ 用户明确要求暂不提交

### 4.2 Commit Message 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档修改
- `style`: 代码格式调整(不影响功能)
- `refactor`: 重构(不是新功能也不是修复)
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:
```bash
feat(create-message): 添加股票代码关联功能

- 支持6位股票代码输入
- 自动识别沪/深/京市场
- 点击查看实时行情

Closes #123
```

### 4.3 提交前检查清单

- [ ] 代码编译通过(小程序 dev + build)
- [ ] H5 服务运行正常
- [ ] 后端服务运行正常
- [ ] 无 console.log 调试代码(除非必要)
- [ ] 无注释掉的代码块
- [ ] Commit message 符合规范

---

## 五、特殊情况处理

### 5.1 紧急修复流程

如果用户要求立即提交(跳过部分检查):

1. 明确告知用户风险
2. 在 commit message 中标注 `[WIP]` 或 `[UNTESTED]`
3. 后续必须补充完整测试

### 5.2 长时间运行的任务

如果编译/启动耗时超过 5 分钟:

1. 检查是否有进程卡死
2. 尝试清理缓存: `rm -rf node_modules/.vite`
3. 重新运行编译命令

### 5.3 多个任务并行

如果同时处理多个功能:

1. 每个功能完成后立即编译验证
2. 使用 git stash 保存未完成的工作
3. 确保每次提交都是独立可用的功能

---

## 六、自动化工具

### 6.1 一键编译脚本

建议创建 `scripts/compile-all.sh`:

```bash
#!/bin/bash
echo "🚀 开始编译所有平台..."

# 微信小程序开发版
echo "📦 编译微信小程序开发版..."
npm run dev:mp-weixin

# 微信小程序生产版
echo "📦 编译微信小程序生产版..."
npm run build:mp-weixin:local

# H5
echo "🌐 启动 H5 开发服务器..."
npm run dev:h5 &

echo "✅ 所有编译完成!"
```

### 6.2 健康检查脚本

建议创建 `scripts/health-check.sh`:

```bash
#!/bin/bash
echo "🔍 检查服务状态..."

# 检查后端
BACKEND_STATUS=$(curl -s http://localhost:3001/health)
if [ $? -eq 0 ]; then
  echo "✅ 后端服务正常"
else
  echo "❌ 后端服务未启动"
fi

# 检查 H5
H5_STATUS=$(curl -s http://localhost:5177)
if [ $? -eq 0 ]; then
  echo "✅ H5 服务正常"
else
  echo "❌ H5 服务未启动"
fi
```

---

## 七、Claude 执行规范

### 7.1 任务开始前

1. 确认后端服务运行状态
2. 确认当前分支
3. 拉取最新代码(如果是协作项目)

### 7.2 任务执行中

1. 每完成一个功能点,立即编译验证
2. 遇到编译错误,优先修复再继续
3. 保持代码风格一致性

### 7.3 任务完成后

1. 执行完整编译流程(Section 1.1)
2. 运行健康检查
3. 按规范提交代码
4. 向用户报告完成状态

---

## 八、需求文档管理

### 8.1 需求文档规范

**重要**: 所有确定的需求**必须**及时记录到需求文档中，避免因会话中断导致需求丢失。

#### 需求文档位置
```
docs/plans/YYYY-MM-DD-迭代名-requirements.md
```

#### 文档内容要求
1. **已完成功能**: 详细记录实现内容、涉及文件、关键代码
2. **进行中功能**: 记录当前进度、待完成事项
3. **待开发功能**: 记录需求描述、预期方案
4. **技术决策**: 记录重要的技术选型和原因
5. **Git提交记录**: 记录相关commit hash

### 8.2 Claude规则

**会话开始时**:
1. 检查是否存在当前迭代的需求文档
2. 如果存在，阅读文档了解项目状态和待办事项
3. 继续未完成的工作

**会话结束时**:
1. 更新需求文档，记录已完成和进行中的工作
2. 确保下次会话可以快速恢复上下文

**需求变更时**:
1. 立即更新需求文档
2. 记录变更原因和影响范围

---

## 九、变更记录
| 日期 | 变更内容 | 变更人 |
|------|---------|--------|
| 2026-03-05 | 创建初始版本 | Claude |
| 2026-03-06 | 新增需求文档管理规范（第八章） | Claude |
| 2026-03-06 | 新增需求文档管理规范（第八节） | Claude |

---

## 九、参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [项目浏览器自动化配置](../docs/07-testing/browser-automation-config.md)
