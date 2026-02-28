# Dev-Browser 自动化测试完整指南

> 最后更新: 2026-02-27

## 一、什么是 Dev-Browser

Dev-Browser 是一个基于 Playwright 的浏览器自动化测试工具，允许通过代码控制浏览器进行自动化测试。

## 二、两种运行模式详解

### 模式对比总览

| 模式 | 命令 | 浏览器来源 | 需要扩展 | 登录态 |
|------|------|-----------|---------|--------|
| **Standalone** | `./server.sh` | 启动新浏览器 | ❌ 不需要 | 独立（需重新登录） |
| **Extension** | `npm run start-extension` | 复用用户浏览器 | ✅ 需要 | 共享（复用已有登录） |

---

### Standalone 模式优缺点

| 优点 | 说明 |
|------|------|
| ✅ **配置简单** | 不需要安装任何浏览器扩展，开箱即用 |
| ✅ **稳定性高** | 独立的浏览器进程，不受用户操作影响 |
| ✅ **环境干净** | 每次都是全新的浏览器环境，无历史数据干扰 |
| ✅ **持久化Profile** | 可以保存测试专用的登录状态（profiles目录） |
| ✅ **多实例运行** | 可以同时运行多个测试实例，互不干扰 |
| ✅ **适合CI/CD** | 服务器环境无GUI也能运行（--headless模式） |
| ✅ **可重复性** | 每次测试环境一致，便于复现问题 |

| 缺点 | 说明 |
|------|------|
| ❌ **需要重新登录** | 不共享日常浏览器的登录状态，测试前需登录 |
| ❌ **资源占用较高** | 额外启动一个Chrome进程（约200-400MB内存） |
| ❌ **需指定Chrome路径** | Windows下需手动设置CHROME_PATH环境变量 |
| ❌ **无法测试真实用户环境** | 与用户实际浏览器环境可能存在差异 |
| ❌ **首次启动较慢** | 需要初始化新的浏览器Profile |

---

### Extension 模式优缺点

| 优点 | 说明 |
|------|------|
| ✅ **复用登录态** | 直接使用已登录的网站，无需重复登录操作 |
| ✅ **真实用户环境** | 测试环境与用户实际使用环境完全一致 |
| ✅ **零额外资源** | 不启动新浏览器，复用已有Chrome进程 |
| ✅ **共享Cookie/Session** | 可以测试需要特定Cookie的复杂场景 |
| ✅ **适合调试** | 可以边手动操作浏览器边运行测试脚本 |
| ✅ **测试SSO/内网** | 企业内网SSO登录态可直接复用 |
| ✅ **启动速度快** | 无需启动新浏览器，连接即用 |

| 缺点 | 说明 |
|------|------|
| ❌ **需要安装扩展** | 必须手动下载并安装Chrome扩展程序 |
| ❌ **可能不稳定** | 扩展与浏览器通信可能超时（常见问题） |
| ❌ **用户操作干扰** | 用户手动操作浏览器可能影响测试结果 |
| ❌ **不适合CI/CD** | 依赖用户已打开的浏览器，无法自动化 |
| ❌ **权限限制** | 某些网站可能阻止扩展访问 |
| ❌ **浏览器版本兼容** | 扩展可能与新版Chrome不兼容 |

---

### 模式选择建议

| 场景 | 推荐模式 | 原因 |
|------|----------|------|
| 🧪 **自动化测试** | Standalone | 稳定、可重复、适合CI |
| 🐛 **开发调试** | Standalone 或 Extension | 视是否需要已有登录态 |
| 🔄 **CI/CD集成** | Standalone | 无需GUI，可headless运行 |
| 📱 **测试登录功能** | Standalone | 环境干净，便于测试登录流程 |
| 🔐 **测试已登录功能** | Extension | 复用登录态，省去登录步骤 |
| 🚀 **快速开始/新手** | Standalone | 无需额外配置扩展 |
| 💼 **企业内网/SSO** | Extension | 复用复杂的SSO登录状态 |
| 📊 **性能测试** | Standalone | 独立环境，结果更准确 |

---

### Standalone 模式（推荐）

```
┌─────────────────────────────────────────────────┐
│  你的电脑                                        │
│                                                 │
│  ┌──────────────┐    ┌──────────────────────┐  │
│  │ 日常Chrome    │    │ dev-browser启动的    │  │
│  │ (你的书签、   │    │ 新Chrome实例         │  │
│  │  登录状态)    │    │ (独立的Profile)      │  │
│  │              │    │                      │  │
│  │  ❌ 不共享    │    │ ✅ 测试专用          │  │
│  └──────────────┘    └──────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**"新浏览器"含义**：
- 启动一个**全新的Chrome浏览器进程**
- 拥有独立的用户数据目录（Profile）
- 不共享日常浏览器的任何数据（Cookie、登录态、书签）
- 相当于一个"干净"的测试环境

### Extension 模式

```
┌─────────────────────────────────────────────────┐
│  你的电脑                                        │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │        你正在使用的Chrome浏览器            │  │
│  │                                          │  │
│  │   📌 你的登录状态 ───────────┐            │  │
│  │   📌 你的Cookie              │            │  │
│  │   📌 dev-browser扩展 ←─── 测试脚本控制    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**适用场景**：
- 需要测试已登录状态的页面
- 不想重复登录各种网站
- 复用用户现有的浏览器环境

---

## 三、快速开始（Standalone 模式）

### 1. 环境准备

```bash
# 确保有 Chrome 浏览器
# Windows 示例路径: D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe

# 设置环境变量（Windows CMD）
set CHROME_PATH=D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe

# 设置环境变量（Windows PowerShell）
$env:CHROME_PATH="D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"

# 设置环境变量（Git Bash / Linux / Mac）
export CHROME_PATH=/path/to/chrome
```

### 2. 启动服务器

```bash
cd ~/.claude/skills/dev-browser

# 方式1: 使用脚本（推荐）
./server.sh

# 方式2: 直接运行
npx tsx scripts/start-server.ts
```

**等待看到以下输出表示启动成功**：
```
Creating tmp directory...
Creating profiles directory...
Using custom Chrome: D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe
Starting dev browser server...
Dev browser server started
  WebSocket: ws://127.0.0.1:9223/devtools/browser/xxx
Ready

Press Ctrl+C to stop
```

### 3. 编写测试脚本

创建文件 `tmp/my-test.ts`：

```typescript
import { connect, waitForPageLoad } from "@/client.js";

async function test() {
  // 连接到 dev-browser 服务器
  const client = await connect();
  console.log("✅ 已连接");

  // 创建测试页面
  const page = await client.page("my-test", {
    viewport: { width: 1920, height: 1080 }
  });
  console.log("✅ 创建测试页面");

  // 导航到目标页面
  await page.goto("http://localhost:5176");
  await waitForPageLoad(page);
  console.log("✅ 页面加载完成");

  // 截图
  await page.screenshot({ path: "tmp/screenshot.png", fullPage: true });
  console.log("📸 截图已保存");

  // 断开连接
  await client.disconnect();
  console.log("✅ 测试完成");
}

test().catch(console.error);
```

### 4. 运行测试

```bash
cd ~/.claude/skills/dev-browser
npx tsx tmp/my-test.ts
```

---

## 四、Extension 模式配置

### 1. 下载扩展

```bash
# 从 GitHub 下载
https://github.com/SawyerHood/dev-browser/releases

# 下载对应版本的 dev-browser-extension-x.x.x-chrome.zip
# 解压到: ~/Downloads/dev-browser-extension-1.0.0-chrome
```

### 2. 安装扩展到 Chrome

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角 **"开发者模式"**
3. 点击 **"加载已解压的扩展程序"**
4. 选择解压后的扩展目录

### 3. 启动 Extension 模式服务器

```bash
cd ~/.claude/skills/dev-browser
npm run start-extension
```

**等待看到**：
```
Waiting for extension to connect...
Extension connected
```

### 4. 确认扩展已连接

```bash
curl http://localhost:9222
# 应该返回: {"extensionConnected":true,...}
```

---

## 五、常用 API

```typescript
import { connect, waitForPageLoad } from "@/client.js";

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
console.log(snapshot);

// 通过快照选择元素
const element = await client.selectSnapshotRef("page-name", "e1");
await element.click();

// 列出所有页面
const pages = await client.list();

// 关闭页面
await client.close("page-name");

// 断开连接
await client.disconnect();
```

---

## 六、测试用例示例

### 登录测试

```typescript
import { connect, waitForPageLoad } from "@/client.js";

async function testLogin() {
  const client = await connect();
  const page = await client.page("login-test");

  await page.goto("http://localhost:5176/#/pages/profile/profile");
  await waitForPageLoad(page);

  // 检查是否已登录
  const logoutBtn = page.locator("text=/退出登录/");
  if (await logoutBtn.isVisible()) {
    console.log("已登录");
  } else {
    // 执行登录
    await page.locator("input").first().fill("admin@example.com");
    await page.locator('input[type="password"]').fill("123456");
    await page.locator('button:has-text("登录")').click();
    await page.waitForTimeout(3000);
    console.log("登录完成");
  }

  await client.disconnect();
}

testLogin();
```

---

## 七、常见问题

### Q: Extension request timeout 错误？

**原因**：扩展模式通信超时

**解决**：使用 Standalone 模式
```bash
./server.sh  # 不带参数即为 Standalone 模式
```

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

## 八、文件结构

```
~/.claude/skills/dev-browser/
├── src/                    # 源代码
├── scripts/
│   └── start-server.ts     # 服务器启动脚本
├── tmp/                    # 临时文件（截图等）
├── profiles/               # 浏览器 Profile 数据
├── server.sh               # 启动脚本
└── SKILL.md                # 使用说明
```

---

## 九、与 Playwright-Skill 对比

| 特性 | dev-browser | playwright-skill |
|------|-------------|------------------|
| 持久化浏览器 | ✅ 页面保持打开 | ❌ 每次关闭 |
| 复用登录态 | ✅ Extension模式 | ❌ |
| 录屏功能 | ❌ 需手动配置 | ✅ 原生支持 |
| 学习成本 | 较低 | 较低 |
| 适用场景 | 增量测试、调试 | 完整测试流程 |

**推荐**：
- 开发调试：使用 **dev-browser**
- CI/CD 测试：使用 **playwright-skill**

---

## 十、Extension 模式 CDP 超时问题深度分析

### 问题现象

Extension 模式下，扩展连接成功，但执行 CDP 命令时超时：
```
Failed to get page: {"error":"Extension request timeout after 30000ms: forwardCDPCommand"}
```

### 技术原因

1. **Extension 使用 `chrome.debugger` API**
   - 这是 Chrome 特有的 API，用于发送 CDP (Chrome DevTools Protocol) 命令
   - 需要 `debugger` 权限（在 manifest.json 中已声明）

2. **超时发生在 `forwardCDPCommand` 环节**
   - Extension 接收到服务器的 CDP 命令
   - 通过 `chrome.debugger.sendCommand()` 转发给浏览器
   - 这一步可能因为浏览器安全策略或 API 限制而超时

3. **WebSocket 通信链路**
   ```
   测试脚本 → dev-browser服务器(9222) → WebSocket → Extension → chrome.debugger API → 浏览器
   ```

### 浏览器兼容性

| 浏览器 | Extension 模式支持 | 说明 |
|--------|------------------|------|
| **Chrome** | ⚠️ 部分支持 | 原生支持，但可能出现超时 |
| **Edge (Chromium)** | ⚠️ 理论支持 | 支持 Chrome 扩展，`debugger` API 可能有差异 |
| **Firefox** | ❌ 不支持 | 不支持 `chrome.debugger` API |
| **Safari** | ❌ 不支持 | 不支持 CDP 协议 |

### 解决方案

**方案 1：使用 Standalone 模式（强烈推荐）**
```bash
cd ~/.claude/skills/dev-browser
CHROME_PATH="D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe" ./server.sh
```
- 不依赖 Extension，稳定性最高
- 已验证可正常工作

**方案 2：尝试 Edge 浏览器**
1. 在 Edge 中访问 `edge://extensions/`
2. 开启"开发人员模式"
3. 加载扩展：`C:/Users/DELL/Downloads/dev-browser-extension-1.0.0-chrome`
4. 启动 Extension 模式服务器

**方案 3：检查 Chrome 扩展设置**
1. 访问 `chrome://extensions/`
2. 确认 dev-browser 扩展已启用
3. 点击扩展图标，确认状态显示 "Connected"
4. 尝试禁用后重新启用扩展

### 结论

Extension 模式的超时问题是 dev-browser 的已知限制：
- Extension 与浏览器的 CDP 通信依赖 `chrome.debugger` API
- 该 API 在某些情况下响应缓慢或超时
- 这是 Chrome Extension 的固有限制，难以完全解决

**最终建议**：对于自动化测试，**Standalone 模式是最佳选择**。
