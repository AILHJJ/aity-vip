# 浏览器自动化测试配置指南

> **创建日期**: 2026-03-05
> **状态**: 已完成
> **适用项目**: AITY_VIP

---

## 一、本地浏览器资源

### 1.1 可用浏览器列表

| 浏览器 | 路径 | 状态 | 用途 |
|--------|------|------|------|
| Chrome Portable | `C:\chrome-win64\chrome.exe` | ✅ 可用 | 自动化测试首选 |
| Microsoft Edge | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` | ✅ 可用 | 备选浏览器 |
| Playwright Chromium | `C:\Users\DELL\AppData\Local\ms-playwright\chromium-1200\chrome-win64\chrome.exe` | ⚠️ 需安装 | Playwright默认 |

### 1.2 环境变量配置

在系统环境变量中添加：

```bash
# Chrome Portable (优先使用)
CHROME_PATH=C:\chrome-win64\chrome.exe

# Edge (备选)
EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

---

## 二、已配置的 Skills

### 2.1 dev-browser 配置

配置文件：`C:\Users\DELL\.claude\skills\dev-browser\.env`

```env
# 本地浏览器配置
CHROME_PATH=C:\chrome-win64\chrome.exe
EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
HEADLESS=false
SLOW_MO=100
```

### 2.2 playwright-skill 配置

配置文件：`C:\Users\DELL\.claude\skills\playwright-skill\.env`

```env
# 本地浏览器配置
CHROME_PATH=C:\chrome-win64\chrome.exe
EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
HEADLESS=false
SLOW_MO=100
```

---

## 三、使用方法

### 3.1 dev-browser skill

自动读取 `.env` 配置，启动时会使用本地 Chrome：

```bash
cd ~/.claude/skills/dev-browser && ./server.sh
```

### 3.2 playwright-skill

在测试脚本中使用本地浏览器：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: process.env.CHROME_PATH || 'C:\\chrome-win64\\chrome.exe',
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5177');

  // ... 测试代码

  await browser.close();
})();
```

---

## 四、常见问题

### 4.1 浏览器启动失败

检查：
1. 浏览器路径是否正确
2. 浏览器是否正在运行（关闭后再试）
3. 权限问题（以管理员身份运行）

### 4.2 Playwright 浏览器未安装

```bash
# 安装 Playwright 自带浏览器
npx playwright install chromium

# 或使用本地浏览器，跳过安装
```

---

## 五、更新日志

| 日期 | 变更内容 |
|------|----------|
| 2026-03-05 | 创建文档，配置本地 Chrome 和 Edge 浏览器 |
