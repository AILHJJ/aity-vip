# 归档文档说明

> 本目录存放已整合的历史文档，仅供参考

---

## 归档时间

2026-02-28

---

## 文档映射

| 原文档 | 整合到 | 说明 |
|--------|--------|------|
| `AI协作规则.md` | `../README.md` | 核心规则已整合 |
| `coding-rules.md` | `../README.md` | 自动执行原则已整合 |
| `project-context.md` | `../skills/quick-reference.md` | 项目信息已整合 |
| `backend-development.md` | `../skills/backend-guide.md` | 精简为后端指南 |
| `uniapp-development.md` | `../skills/frontend-guide.md` | 精简为前端指南 |
| `deployment-info.md` | `../skills/deployment-commands.md` | 部署命令已整合 |
| `development-workflow.md` | `../README.md` | 工作流已整合 |
| `requirement-checklist.md` | `../../docs/testing/` | 移动到测试目录 |

---

## 新文档结构

```
.claude/
├── README.md                    # 主入口
├── rules/
│   └── browser-config.md        # 浏览器测试配置
├── skills/
│   ├── README.md                # 技能导航
│   ├── quick-reference.md       # 快速参考卡 ⭐
│   ├── backend-guide.md         # 后端指南
│   ├── frontend-guide.md        # 前端指南
│   └── deployment-commands.md   # 部署命令
└── archived/                    # 本目录
```

---

## 为什么要归档

1. **减少 Context 消耗** - 原文档过多（~3000行），影响AI响应效率
2. **消除重复内容** - 多个文档有重复信息
3. **提高查找效率** - 精简后的文档更易查找
4. **保持信息更新** - 原文档有部分过时信息

---

**归档者**: AI Coding Assistant
