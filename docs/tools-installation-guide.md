# AI 开发工具安装指南

本文档记录了两个重要的 AI 开发辅助工具的安装方法。

---

## 工具对比

| 项目          | 类型   | 核心功能                       | 官方链接 |
|---------------|--------|--------------------------------|----------|
| claude-mem    | 记忆插件 | 跨会话持久化上下文、Web 查看器、MCP 搜索工具 | [GitHub](https://github.com/thedotmack/claude-mem) |
| BMAD-METHOD   | 开发框架 | 12+ AI 代理、敏捷工作流、从头脑风暴到部署 | [官网](https://docs.bmad-method.org) |

---

## 1. claude-mem (记忆插件)

### 简介

Claude-Mem 是一个为 Claude Code 构建的持久化记忆压缩系统。它能够：
- 自动捕获 Claude 在编码会话期间的所有操作
- 使用 AI (Claude agent-sdk) 压缩信息
- 将相关上下文注入到未来的会话中

### 核心功能

- 🧠 **持久化记忆** - 上下文跨会话保留
- 📊 **渐进式披露** - 分层记忆检索，显示 token 成本
- 🔍 **技能搜索** - 通过 mem-search 技能查询项目历史
- 🖥️ **Web 查看器 UI** - 实时记忆流 (http://localhost:37777)
- 💻 **Claude Desktop 技能** - 从 Claude Desktop 对话中搜索记忆
- 🔒 **隐私控制** - 使用 `<private>` 标签排除敏感内容
- 🔗 **引用功能** - 通过 ID 引用过去的观察记录

### 系统要求

- **Node.js**: 18.0.0 或更高版本
- **Claude Code**: 最新版本（需支持插件）
- **Bun**: JavaScript 运行时和进程管理器（缺失时自动安装）
- **uv**: Python 包管理器，用于向量搜索（缺失时自动安装）
- **SQLite 3**: 持久化存储（内置）

### 安装步骤

在 Claude Code 会话中依次执行以下命令：

```bash
# 步骤 1: 添加插件市场源
/plugin marketplace add thedotmack/claude-mem

# 步骤 2: 安装插件
/plugin install claude-mem
```

安装完成后，**重启 Claude Code**。来自之前会话的上下文将自动出现在新会话中。

> **注意**: Claude-Mem 也发布在 npm 上，但 `npm install -g claude-mem` 只安装 SDK/库 —— 不会注册插件钩子或设置 worker 服务。要将 Claude-Mem 作为插件使用，请始终通过上述 `/plugin` 命令安装。

### MCP 搜索工具

Claude-Mem 通过 **4 个 MCP 工具** 提供智能记忆搜索，采用 token 高效的 **3 层工作流模式**：

| 工具 | 功能 | Token 消耗 |
|------|------|------------|
| `search` | 搜索记忆索引，支持全文查询、类型/日期/项目过滤 | ~50-100 tokens/结果 |
| `timeline` | 获取特定观察或查询周围的时间上下文 | 中等 |
| `get_observations` | 通过 ID 获取完整观察详情（始终批量获取多个 ID） | ~500-1,000 tokens/结果 |

**使用示例**：
```
// 步骤 1: 搜索索引
search(query="authentication bug", type="bugfix", limit=10)

// 步骤 2: 查看索引，识别相关 ID（如 #123, #456）

// 步骤 3: 获取完整详情
get_observations(ids=[123, 456])
```

### 配置

设置文件位于 `~/.claude-mem/settings.json`（首次运行时自动创建默认配置）。

可配置项：
- AI 模型
- Worker 端口
- 数据目录
- 日志级别
- 上下文注入设置

### 故障排除

如果遇到问题，向 Claude 描述问题，troubleshoot 技能会自动诊断并提供修复方案。

### 相关链接

- 📚 **文档**: [docs.claude-mem.ai](https://docs.claude-mem.ai)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/thedotmack/claude-mem/issues)
- 💬 **Discord**: [加入 Discord](https://discord.gg/gk8jAdXWmj)
- 🐦 **Twitter**: [@Claude_Memory](https://twitter.com/Claude_Memory)

---

## 2. BMAD-METHOD (开发框架)

### 简介

BMAD-METHOD 是一个 AI 驱动的敏捷开发框架，提供了从头脑风暴到部署的完整工作流。

### 核心功能

- **12+ AI 代理** - 专业的开发辅助代理
- **敏捷工作流** - 完整的敏捷开发流程
- **文档生成** - PRD、架构设计、技术规范等
- **测试架构** - TEA (Test Architect) 测试设计
- **多 IDE 支持** - Claude Code、Cursor 等

### 安装方式

#### 方式一：交互式安装（推荐）

在项目目录下打开终端，运行：

```bash
npx bmad-method@latest install
```

然后按照提示选择：
- 安装目录
- 要安装的模块
- 工具配置（如 claude-code, cursor）
- 语言设置

#### 方式二：非交互式安装

适用于 CI/CD 或自动化场景：

```bash
npx bmad-method@latest install \
  --yes \
  --tools claude-code \
  --communication-language Chinese \
  --document-output-language Chinese
```

#### 安装选项说明

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--directory <path>` | 安装目录 | 当前目录 |
| `--modules <modules>` | 要安装的模块 ID 列表（逗号分隔） | - |
| `--tools <tools>` | 要配置的工具/IDE ID 列表 | - |
| `--communication-language <lang>` | 代理沟通语言 | English |
| `--document-output-language <lang>` | 文档输出语言 | English |
| `--output-folder <path>` | 输出文件夹路径（相对项目根目录） | _bmad-output |
| `--yes` | 接受所有默认值，跳过提示 | false |

### 主要工作流

| 工作流 | 说明 |
|--------|------|
| **头脑风暴** | 运行头脑风暴会议 |
| **快速规范** | 快速创建功能规范 |
| **PRD 创建** | 创建产品需求文档 |
| **架构设计** | 创建系统架构 |
| **Epic 和 Story** | 创建史诗和用户故事 |
| **UX 设计** | 创建 UX 设计文档 |
| **Story 实现** | 实现用户故事 |
| **代码审查** | 运行代码审查 |
| **Sprint 规划** | 运行 Sprint 规划 |
| **测试设计** | 使用 TEA 进行测试设计 |

### 安装后的目录结构

```
项目根目录/
├── .bmad-core/           # BMAD 核心文件（隐藏）
│   ├── agents/           # 代理定义
│   ├── workflows/        # 工作流定义
│   └── tasks/            # 任务定义
├── _bmad-output/         # 输出文档目录
│   ├── prd/              # PRD 文档
│   ├── architecture/     # 架构文档
│   └── ...
└── .bmad-config.json     # 配置文件
```

### 相关链接

- 📚 **官方文档**: [docs.bmad-method.org](https://docs.bmad-method.org)
- 💻 **GitHub**: [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- 📺 **YouTube**: [@BMadCode](https://www.youtube.com/@BMadCode)
- 💬 **Discord**: [加入 Discord](https://discord.gg/gk8jAdXWmj)
- 📖 **安装指南**: [Installation Guides](https://docs.bmad-method.org/how-to/installation/)

---

## 快速开始建议

### 推荐安装顺序

1. **先安装 claude-mem**
   - 在 Claude Code 中执行 `/plugin` 命令
   - 重启 Claude Code
   - 验证 Web 查看器可访问 (http://localhost:37777)

2. **再安装 BMAD-METHOD**
   - 在项目目录下运行 `npx bmad-method@latest install`
   - 按提示完成配置
   - 验证 `.bmad-core` 目录已创建

### 验证安装

```bash
# 检查 claude-mem
# 访问 http://localhost:37777 查看 Web 界面

# 检查 BMAD-METHOD
ls -la .bmad-core  # 应该看到代理和工作流文件
```

---

## 常见问题

### Q: claude-mem 安装后 Claude Code 无法启动？

A: 这是已知问题 ([GitHub Issue #303](https://github.com/thedotmack/claude-mem/issues/303))。尝试：
1. 删除 `~/.claude/plugins/marketplaces/thedotmack-claude-mem` 目录
2. 重新安装

### Q: BMAD-METHOD 安装卡住不动？

A: 这是交互式安装程序，需要用户输入。如果自动化安装，请使用 `--yes` 参数。

### Q: Windows 上 npm 命令找不到？

A: 确保 Node.js 和 npm 已安装并添加到 PATH。从 https://nodejs.org 下载安装程序，安装后重启终端。

---

*文档创建时间: 2026-03-10*
