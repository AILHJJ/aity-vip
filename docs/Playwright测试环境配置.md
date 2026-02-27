# Playwright 自动化测试环境配置

## 📋 环境概述

本项目使用 Playwright 进行端到端自动化测试，配置了专用的 Chrome 浏览器。

## 🌐 Chrome 浏览器配置

### Chrome 路径
```
D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe
```

### 配置说明
- Chrome 浏览器已从下载目录移动到项目目录
- 位置稳定，不会被下载管理器清理
- 专门用于自动化测试，不影响日常使用的浏览器

## 🚀 快速开始

### 运行快速测试
```bash
node quick-test.js
```

### 运行完整测试套件
```bash
npx playwright test
```

### 查看测试报告
```bash
npx playwright show-report
```

### 运行特定测试文件
```bash
npx playwright test tests/e2e/example.spec.js
```

### 以调试模式运行测试
```bash
npx playwright test --debug
```

## 📁 项目结构

```
AITY_VIP/
├── aity-uni-app-v2/
│   ├── playwright.config.js          # Playwright 配置文件
│   ├── tests/
│   │   └── e2e/
│   │       └── example.spec.js      # 示例测试用例
│   └── quick-test.js              # 快速测试脚本
├── chrome-win64/                  # Chrome 浏览器（专用）
│   ├── chrome.exe
│   ├── chrome.dll
│   └── ...
└── docs/
    └── DevBrowser-PlaywrightSkill-安装指南.md
```

## ⚙️ 配置文件说明

### playwright.config.js
```javascript
{
  testDir: './tests/e2e',           // 测试文件目录
  baseURL: 'http://localhost:5173', // 基础URL
  executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe', // Chrome路径
  webServer: {
    command: 'npm run dev',         // 启动开发服务器
    url: 'http://localhost:5173',
    reuseExistingServer: true        // 复用已有服务器
  }
}
```

## 🧪 编写测试用例

### 基本测试示例
```javascript
const { test, expect } = require('@playwright/test');

test('页面标题测试', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/投研图灵室/);
});

test('登录功能测试', async ({ page }) => {
  await page.goto('/#/pages/login/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("登录")');
  await expect(page).toHaveURL(/.*index/);
});
```

## 🎯 Playwright MCP 服务器

项目已配置 Playwright MCP 服务器，可在 Claude Code 中直接使用浏览器自动化功能。

配置位置：`C:\Users\DELL\.claude\settings.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

## 📚 相关文档

- [Playwright 官方文档](https://playwright.dev/)
- [DevBrowser-PlaywrightSkill-安装指南.md](./DevBrowser-PlaywrightSkill-安装指南.md)
- [自动化测试方案对比](./automation-test-solutions-comparison.md)

## 🔧 故障排除

### Chrome 启动失败
检查 Chrome 路径是否正确：
```bash
Test-Path "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"
```

### 端口被占用
如果端口 5173 被占用，可以修改 `playwright.config.js` 中的端口配置。

### 测试超时
增加测试超时时间：
```javascript
test.setTimeout(60000); // 60秒
```

## 📝 注意事项

1. **Chrome 路径**：确保 Chrome 路径正确，不要随意移动 `chrome-win64` 文件夹
2. **端口配置**：默认使用 5173 端口，确保该端口未被占用
3. **测试隔离**：每个测试用例应该独立，不依赖其他测试的状态
4. **异步操作**：使用 `await` 等待异步操作完成

## 🎉 完成

环境配置完成！现在可以开始编写和运行自动化测试了。
