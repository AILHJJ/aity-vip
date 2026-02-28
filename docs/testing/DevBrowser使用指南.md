# Dev Browser 使用指南

> 本文档介绍 Dev Browser 自动化测试工具的使用方法
>
> **最后更新**: 2026-02-28

---

## 📋 概述

Dev Browser 是一个基于 Playwright 的浏览器自动化测试工具，支持两种运行模式。

---

## 🔄 两种运行模式

### 模式对比

| 模式 | 命令 | 浏览器来源 | 需要扩展 | 登录态 |
|------|------|-----------|---------|--------|
| **Standalone** | `./server.sh` | 启动新浏览器 | ❌ 不需要 | 独立（需重新登录） |
| **Extension** | `npm run start-extension` | 复用用户浏览器 | ✅ 需要 | 共享（复用已有登录） |

### 模式选择

| 场景 | 推荐模式 |
|------|----------|
| 自动化测试/CI/CD | **Standalone** |
| 测试登录功能 | **Standalone** |
| 复用登录态 | **Extension** |
| 企业内网/SSO | **Extension** |
| 快速调试 | **Extension** |

---

## 🚀 Standalone 模式

### 环境准备

```bash
# 设置 Chrome 路径（Windows）
set CHROME_PATH=D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe

# 设置 Chrome 路径（Git Bash / Linux / Mac）
export CHROME_PATH=/path/to/chrome
```

### 启动服务器

```bash
cd ~/.claude/skills/dev-browser

# 启动 Standalone 模式
./server.sh
```

等待看到以下输出表示启动成功：
```
Creating tmp directory...
Creating profiles directory...
Using custom Chrome: D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe
Starting dev browser server...
Dev browser server started
Ready
```

---

## 🔌 Extension 模式

### 安装扩展

1. 从 GitHub 下载扩展：https://github.com/SawyerHood/dev-browser/releases
2. 解压到本地目录
3. 打开 Chrome/Edge，访问 `chrome://extensions/`
4. 开启右上角 **"开发者模式"**
5. 点击 **"加载已解压的扩展程序"**，选择解压后的目录

### 启动服务器

```bash
cd ~/.claude/skills/dev-browser

# 启动 Extension 模式
npm run start-extension
```

等待看到：
```
Waiting for extension to connect...
Extension connected
```

### ⚠️ 注意事项

**Extension 模式只能有一个浏览器连接！**
- 如果 Edge 和 Chrome 同时安装了扩展，只能打开一个浏览器
- 多浏览器同时连接会导致测试失败

---

## 📝 测试代码示例

### 基础测试

```typescript
import { connect, waitForPageLoad } from "@/client.js";

async function test() {
  // 连接到服务器
  const client = await connect();
  console.log("✅ 已连接");

  // 创建测试页面
  const page = await client.page("test-page", {
    viewport: { width: 1920, height: 1080 }
  });

  // 导航到目标页面
  await page.goto("http://localhost:5173");
  await waitForPageLoad(page);

  // 截图
  await page.screenshot({ path: "tmp/screenshot.png" });

  // 断开连接
  await client.disconnect();
}

test().catch(console.error);
```

### 登录测试

```typescript
import { connect, waitForPageLoad } from "@/client.js";

async function testLogin() {
  const client = await connect();
  const page = await client.page("login-test");

  await page.goto("http://localhost:5173/#/pages/login/login");
  await waitForPageLoad(page);

  // 填写登录表单
  await page.locator("input").first().fill("admin@example.com");
  await page.locator('input[type="password"]').fill("admin123");
  await page.locator('button:has-text("登录")').click();

  // 等待跳转
  await page.waitForTimeout(3000);

  // 验证登录成功
  const url = page.url();
  console.log("当前URL:", url);

  await client.disconnect();
}

testLogin();
```

### 运行测试

```bash
cd ~/.claude/skills/dev-browser
npx tsx tmp/my-test.ts
```

---

## 🛠️ 常用 API

```typescript
// 连接服务器
const client = await connect();

// 创建/获取页面
const page = await client.page("page-name", {
  viewport: { width: 1920, height: 1080 }
});

// 页面操作
await page.goto("https://example.com");
await waitForPageLoad(page);
await page.click("button");
await page.fill("input", "text");
await page.screenshot({ path: "screenshot.png" });

// 获取页面快照（用于分析页面结构）
const snapshot = await client.getAISnapshot("page-name");

// 列出所有页面
const pages = await client.list();

// 关闭页面
await client.close("page-name");

// 断开连接
await client.disconnect();
```

---

## ❓ 常见问题

### Q: Extension request timeout 错误？

**原因**：Extension 模式通信超时

**解决**：
1. 确保只有一个浏览器连接
2. 或改用 Standalone 模式

### Q: 找不到 Chrome？

**解决**：设置 CHROME_PATH 环境变量
```bash
set CHROME_PATH=D:\path\to\chrome.exe
```

### Q: 页面元素找不到？

**解决**：
1. 增加等待时间 `await page.waitForTimeout(2000)`
2. 使用 `await client.getAISnapshot()` 分析页面结构
3. 使用更精确的选择器

---

## 📚 相关文档

- [测试方案选型指南](测试方案选型指南.md)
- [自动化测试指南](自动化测试指南.md)
- [测试账户参考](测试账户参考.md)

---

**文档维护**: AITY VIP Team
**最后更新**: 2026-02-28
