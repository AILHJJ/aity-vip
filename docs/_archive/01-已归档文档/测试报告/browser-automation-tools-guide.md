# 浏览器自动化工具完整指南

本文档整合了项目中可用的所有浏览器自动化测试工具，帮助团队成员根据需求选择合适的工具。

## 1. 工具概览

### 1.1 已安装的工具

| 工具 | 位置 | 状态 | 用途 |
|------|------|------|------|
| **Playwright Skill** | `~/.claude/skills/playwright-skill/` | ✅ 已安装 | 脚本式自动化测试 |
| **Dev Browser Skill** | `~/.claude/skills/dev-browser/` | ✅ 已安装 | 有状态浏览器控制 |
| **Chrome 扩展** | `C:\Users\DELL\Downloads\dev-browser-extension-1.0.0-chrome` | 🔶 待加载 | 连接用户 Chrome |
| **Chrome 浏览器** | `C:\Users\DELL\Downloads\chrome-win64\chrome-win64\` | ✅ 已下载 | 测试执行环境 |

### 1.2 权限配置

权限已在 `.claude/settings.local.json` 中配置：
```json
{
  "permissions": {
    "allow": [
      "Skill(dev-browser:dev-browser)",
      "Bash(npx tsx:*)",
      "Bash(npx playwright:*)",
      ...
    ]
  }
}
```

---

## 2. 工具对比

### 2.1 Playwright Skill vs Dev Browser Skill

| 特性 | Playwright Skill | Dev Browser Skill |
|------|-----------------|-------------------|
| **执行模式** | 每次从头运行完整脚本 | 保持浏览器状态 |
| **速度** | 较慢（需重新加载页面） | 快（页面持久化） |
| **登录状态** | 每次需重新登录 | 保留登录状态 |
| **适用场景** | CI/CD、回归测试 | 调试、交互式测试 |
| **学习曲线** | 简单 | 中等 |

### 2.2 性能对比（基准测试）

| 方法 | 时间 | 成本 | 成功率 |
|------|------|------|--------|
| **Dev Browser** | 3分53秒 | $0.88 | 100% |
| Playwright MCP | 4分31秒 | $1.45 | 100% |
| Playwright Skill | 8分07秒 | $1.45 | 67% |

---

## 3. Dev Browser Skill 使用指南

### 3.1 启动服务器

**模式 1: Standalone（默认）**
```bash
cd ~/.claude/skills/dev-browser && ./server.sh
```
- 启动新的 Chromium 实例
- 每次从干净状态开始

**模式 2: Extension（需要 Chrome 扩展）**
```bash
cd ~/.claude/skills/dev-browser && npm run start-extension
```
- 控制您现有的 Chrome
- 保留登录状态、Cookie、书签

### 3.2 基本使用

在 Claude Code 中，使用自然语言：

```
打开 localhost:5173 并验证登录流程是否正常工作
```

或编写脚本：

```bash
cd ~/.claude/skills/dev-browser && npx tsx <<'EOF'
import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("test-page");

await page.goto("http://localhost:5173");
await waitForPageLoad(page);

console.log({ title: await page.title(), url: page.url() });
await client.disconnect();
EOF
```

### 3.3 截图

```typescript
await page.screenshot({ path: "tmp/screenshot.png" });
```

### 3.4 获取页面快照

```typescript
const snapshot = await client.getAISnapshot("page-name");
console.log(snapshot); // 输出 ARIA 树结构
```

---

## 4. Playwright Skill 使用指南

### 4.1 基本使用

在 Claude Code 对话中：

```
帮我测试登录功能，
页面地址：http://localhost:5173/#/pages/login/login，
步骤：
1. 输入用户名 'admin'
2. 输入密码 '123456'
3. 点击登录按钮
验证：
1. 是否跳转到首页
2. 页面标题是否显示正确
```

### 4.2 运行测试脚本

```bash
cd aity-uni-app-v2
npx playwright test tests/e2e/login.spec.js --headed
```

### 4.3 查看测试报告

```bash
npx playwright show-report
```

---

## 5. Chrome 扩展安装

### 5.1 安装步骤

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions`
3. 开启右上角 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择文件夹：`C:\Users\DELL\Downloads\dev-browser-extension-1.0.0-chrome`

### 5.2 使用扩展

1. 点击 Chrome 工具栏中的 Dev Browser 扩展图标
2. 切换为 **"Active"** 状态
3. 在 Claude Code 中说："连接到我的 Chrome"

---

## 6. 使用场景推荐

### 6.1 选择 Playwright Skill 当：

- 需要 CI/CD 集成
- 执行回归测试
- 测试需要干净环境
- 团队协作共享测试脚本

### 6.2 选择 Dev Browser Skill 当：

- 需要 Debug UI 问题
- 测试需要登录的页面
- 快速交互式测试
- 保留浏览器状态

### 6.3 使用 Chrome 扩展当：

- 需要使用现有登录会话
- 测试生产环境
- 需要访问已保存的密码/Cookie

---

## 7. 常见问题

### Q1: Dev Browser 启动失败

```bash
# 检查依赖
cd ~/.claude/skills/dev-browser && npm install

# 检查端口占用
netstat -ano | findstr :3000
```

### Q2: Playwright 浏览器未找到

```bash
# 安装浏览器
npx playwright install chromium
```

### Q3: Chrome 扩展无法连接

1. 确保扩展已激活（Active 状态）
2. 确保 Dev Browser 服务器正在运行
3. 检查 WebSocket 连接

---

## 8. 文件结构

```
~/.claude/skills/
├── playwright-skill/          # Playwright Skill
│   ├── SKILL.md               # Skill 说明
│   └── package.json
│
└── dev-browser/               # Dev Browser Skill
    ├── SKILL.md               # Skill 说明
    ├── server.sh              # 服务器启动脚本
    ├── src/                   # 源代码
    └── references/            # 参考文档

C:\Users\DELL\Downloads\
├── chrome-win64/              # Chrome 浏览器
│   └── chrome-win64/
│       └── chrome.exe
│
└── dev-browser-extension-1.0.0-chrome/  # Chrome 扩展
    ├── manifest.json
    ├── background.js
    └── popup.html
```

---

## 9. 参考链接

- [Dev Browser GitHub](https://github.com/SawyerHood/dev-browser)
- [Playwright 官方文档](https://playwright.dev/)
- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)

---

**文档版本**：v2.0
**创建日期**：2026-02-27
**更新日期**：2026-02-27
**维护人**：AITY VIP 开发团队
