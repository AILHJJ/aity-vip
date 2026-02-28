# 测试文档目录

> 本目录包含 AITY VIP 项目的自动化测试相关文档
>
> **最后更新**: 2026-02-28

---

## 📚 文档导航

### 新用户必读

| 优先级 | 文档 | 说明 |
|--------|------|------|
| ⭐⭐⭐ | [自动化测试工作流程指南](自动化测试工作流程指南.md) | **完整工作流程、策略、最佳实践** |
| ⭐⭐ | [uni-app自动化测试最佳实践](uni-app自动化测试最佳实践.md) | **常见问题与解决方案** |
| ⭐⭐ | [DevBrowser使用指南](DevBrowser使用指南.md) | Dev Browser 详细使用方法 |

### 详细参考

| 文档 | 说明 |
|------|------|
| [自动化测试指南](自动化测试指南.md) | Playwright 测试框架使用 |
| [测试方案选型指南](测试方案选型指南.md) | 多种测试方案对比 |
| [test-cases.md](test-cases.md) | 功能测试用例清单 |
| [测试账户参考](测试账户参考.md) | 测试账号信息 |

### 示例与报告

| 文档 | 说明 |
|------|------|
| [密码修改功能测试报告-2026-02-28.md](密码修改功能测试报告-2026-02-28.md) | 完整测试报告示例 |
| [DevBrowser-测试用例示例.md](DevBrowser-测试用例示例.md) | 测试脚本示例 |

---

## 🚀 快速开始

### 1. 了解测试策略

阅读 [自动化测试工作流程指南](自动化测试工作流程指南.md)，了解：
- 分层测试策略
- 预制脚本 vs AI临时生成
- 日常工作流程

### 2. 学习 Dev Browser

阅读 [DevBrowser使用指南](DevBrowser使用指南.md)，了解：
- 如何启动 Dev Browser
- 基本API使用
- AI快照功能

### 3. 解决常见问题

遇到问题时查看 [uni-app自动化测试最佳实践](uni-app自动化测试最佳实践.md)：
- uni-mask 遮罩层问题
- 组件选择器兼容性
- 完整工具类代码

---

## 📋 核心知识点

### Dev Browser 核心API

```typescript
import { connect, waitForPageLoad } from "@/client.js";

// 连接浏览器
const client = await connect();
const page = await client.page("test-name");

// 使用AI快照
const snapshot = await client.getAISnapshot("test-name");
const btn = await client.selectSnapshotRef("test-name", "e30");
await btn.click();
```

### uni-app 常见问题解决

```typescript
// 问题1: 遮罩层拦截 - 使用 force
await locator.click({ force: true });

// 问题2: 组件选择器 - 使用AI快照
const element = await client.selectSnapshotRef("page", "e17");
```

---

## 📂 目录结构

```
docs/testing/
├── README.md                           # 本文档
├── 自动化测试工作流程指南.md            # ⭐ 必读
├── uni-app自动化测试最佳实践.md         # ⭐ 推荐
├── DevBrowser使用指南.md               # Dev Browser 使用
├── 自动化测试指南.md                   # Playwright 指南
├── test-cases.md                       # 测试用例
├── 测试账户参考.md                      # 测试账号
└── 密码修改功能测试报告-2026-02-28.md   # 报告示例
```

---

**文档维护**: AITY VIP Team
