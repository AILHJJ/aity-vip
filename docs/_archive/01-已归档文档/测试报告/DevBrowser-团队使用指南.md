# Dev Browser 安装与使用指南

## 📋 文档概述

本文档为开发团队提供 Dev Browser 的安装、配置和使用指南，帮助团队成员快速上手浏览器自动化测试。

**适用人群**：前端开发、测试工程师、全栈开发
**文档版本**：v1.1
**更新日期**：2026-02-27
**变更记录**：
- 纠正 Dev Browser 概念，明确它是一个 Skill 系统
- 添加系统架构说明和工作流程
- 更新安装步骤，区分 Skill 和 Chrome 扩展的安装
- 强调通过自然语言指令使用 Dev Browser Skill
- 优化文档结构和说明

---

## 1. Dev Browser 是什么？

### 1.1 核心功能
Dev Browser 是一个基于 AI 的浏览器自动化系统，由两部分组成：
- **Dev Browser Skill**：Claude Code 的"大脑"，负责编写自动化脚本和处理逻辑
- **Chrome 浏览器扩展**：浏览器"桥梁"，负责执行实际的浏览器操作

主要功能：
- **自动化测试**：执行端到端测试
- **浏览器控制**：通过自然语言指令控制浏览器
- **截图调试**：自动截取页面截图
- **数据采集**：从网页提取数据
- **状态管理**：保持浏览器状态和登录信息

### 1.2 系统架构

Dev Browser 采用分层架构设计：

| 组件 | 类型 | 位置 | 作用 | 功能 |
|------|------|------|------|------|
| **Dev Browser** | Claude Skill | `~/.claude/skills/dev-browser/` | 核心控制 | 接收指令、编写脚本、管理状态 |
| **Chrome 扩展** | 浏览器插件 | 浏览器扩展系统 | 执行层 | 执行操作、连接 Skill 和 Chrome |
| **Chrome 浏览器** | 应用程序 | 本地安装 | 被控制对象 | 执行实际的浏览器操作 |

### 1.3 工作流程

1. **用户** → 向 Claude 发送自然语言指令
2. **Claude** → 调用 Dev Browser Skill
3. **Dev Browser Skill** → 分析指令，编写 Playwright 自动化脚本
4. **Chrome 扩展** → 通过 WebSocket 接收控制指令
5. **Chrome 浏览器** → 执行实际的浏览器操作
6. **结果** → 返回给用户并显示

### 1.4 概念澄清

| 术语 | 定义 | 作用 |
|------|------|------|
| **Skill** | Claude Code 的功能扩展模块 | 处理核心逻辑，编写自动化脚本 |
| **浏览器扩展** | 安装在浏览器中的插件 | 执行实际的浏览器操作 |
| **Dev Browser** | 完整的浏览器自动化系统 | 包含 Skill 和浏览器扩展两部分 |

### 1.5 与其他工具的关系

| 工具 | 类型 | 作用 | 关系 |
|------|------|------|------|
| **Dev Browser** | Claude Skill + 浏览器扩展 | 完整的浏览器自动化系统 | 核心工具 |
| **Playwright** | 浏览器自动化库 | 底层技术 | 依赖项 |
| **Chrome 浏览器** | 应用程序 | 执行浏览器操作 | 被控制对象 |

### 1.6 使用场景
- ✅ 新功能测试
- ✅ 回归测试
- ✅ Bug 修复验证
- ✅ 性能测试
- ✅ 兼容性测试

---

## 2. 环境准备

### 2.1 系统要求

| 组件 | 最低要求 | 推荐版本 |
|------|---------|---------|
| **操作系统** | Windows 10 | Windows 11 |
| **Node.js** | 16.0.0 | 18.0.0+ |
| **Chrome 浏览器** | 90+ | 最新稳定版 |
| **Claude Code** | 最新版 | 最新版 |

### 2.2 检查环境

```bash
# 检查 Node.js 版本
node --version

# 检查 Chrome 版本
"D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" --version

# 检查 Playwright 安装
npm list playwright
```

### 2.3 环境要求说明

**重要**：确保满足以下条件：
- ✅ Node.js 版本 ≥ 16.0.0
- ✅ Chrome 浏览器已安装
- ✅ Claude Code 已安装并更新到最新版本
- ✅ 有管理员权限（如需要）

---

## 3. 安装步骤

Dev Browser 系统需要安装两个组件：Dev Browser Skill（通过 Claude Code 插件市场）和 Chrome 扩展。

### 3.1 安装 Dev Browser Skill（通过插件市场）

#### 步骤 1：打开 Claude Code
- 双击 Claude Code 图标启动应用
- 等待应用完全加载

#### 步骤 2：进入插件市场
- **方法 1**：点击左侧边栏的 "插件" 图标
- **方法 2**：使用快捷键 `Ctrl+Shift+P`，输入 "插件市场"

#### 步骤 3：添加并安装 Dev Browser
- 执行命令添加插件市场：
  ```bash
  /plugin marketplace add sawyerhood/dev-browser
  ```
- 执行命令安装插件：
  ```bash
  /plugin install dev-browser@sawyerhood/dev-browser
  ```

#### 步骤 4：重启 Claude Code
- 关闭 Claude Code 应用
- 重新打开应用
- 确保插件生效

### 3.2 安装 Chrome 扩展

#### 步骤 1：下载 Chrome 扩展
- 从 GitHub 下载：`https://github.com/SawyerHood/dev-browser/releases`
- 选择最新版本的扩展文件

#### 步骤 2：安装扩展
- 打开 Chrome 浏览器
- 访问 `chrome://extensions/`
- 启用 "开发者模式"
- 点击 "加载已解压的扩展程序"
- 选择下载并解压的扩展目录

### 3.3 验证安装

在 Claude Code 中执行以下命令验证安装：

```bash
/dev-browser help
```

**预期结果**：显示 Dev Browser 的帮助信息，包括可用命令列表。

### 3.4 常见安装问题

| 问题 | 解决方案 |
|------|----------|
| **插件安装失败** | 检查网络连接，使用 HTTPS 地址：`/plugin marketplace add https://github.com/SawyerHood/dev-browser.git` |
| **Chrome 扩展安装失败** | 确保启用了开发者模式，检查扩展文件完整性 |
| **WebSocket 连接失败** | 检查网络设置，确保 Chrome 扩展可以连接到 Skill |
| **命令无响应** | 重启 Claude Code 和 Chrome 浏览器 |

---

## 4. 配置说明

### 4.1 Chrome 浏览器配置

#### 4.1.1 检查 Chrome 路径

```bash
# Windows - 检查 Chrome 是否在系统路径
where chrome

# 检查项目中的 Chrome
Test-Path "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"
```

#### 4.1.2 配置 Playwright 使用项目 Chrome

编辑 `playwright.config.js` 文件：

```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 配置使用项目中的 Chrome 浏览器
        executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe'
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**重要配置说明**：
- `executablePath`：指向项目中的 Chrome 浏览器
- `baseURL`：本地开发服务器地址
- `webServer`：自动启动开发服务器

### 4.2 端口配置

#### 4.2.1 检查端口占用

```bash
# 检查 5173 端口是否被占用
netstat -ano | findstr :5173

# 如果有输出，说明端口被占用
# 记录 PID（最后一列的数字）
```

#### 4.2.2 停止占用端口的进程

```bash
# 停止占用端口的进程
taskkill /F /PID [PID]

# 示例：如果 PID 是 12345
taskkill /F /PID 12345
```

#### 4.2.3 修改端口（如果需要）

如果 5173 端口无法使用，可以修改项目配置：

```javascript
// vite.config.js 或 vue.config.js
export default {
  server: {
    port: 5174, // 修改为其他端口
  }
}
```

同时更新 `playwright.config.js`：

```javascript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5174', // 更新为新端口
  reuseExistingServer: !process.env.CI,
}
```

### 4.3 权限配置

#### 4.3.1 以管理员身份运行

如果遇到权限问题，以管理员身份运行 Claude Code：
1. 右键点击 Claude Code 快捷方式
2. 选择 "以管理员身份运行"
3. 确认 UAC 提示

#### 4.3.2 检查文件权限

```bash
# 检查 Chrome 目录权限
icacls "D:\your-mcp-proxy\AITY_VIP\chrome-win64"

# 检查项目目录权限
icacls "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2"
```

确保当前用户有读取和执行权限。

---

## 5. 使用指南

### 5.1 基本使用流程

#### 5.1.1 启动开发服务器

```bash
# 进入项目目录
cd "D:/your-mcp-proxy/AITY_VIP/aity-uni-app-v2"

# 启动开发服务器
npm run dev:h5
```

#### 5.1.2 使用自然语言指令控制

Dev Browser Skill 支持通过自然语言指令进行控制，这是最推荐的使用方式：

**示例 1：打开页面并测试**
```
帮我测试登录功能，访问 http://localhost:5173/#/pages/login/login，
输入用户名 admin，密码 123456，点击登录按钮，
验证是否跳转到首页
```

**示例 2：截取页面截图**
```
帮我访问 http://localhost:5173，截取全屏截图
```

**示例 3：测试表单提交**
```
帮我测试注册功能，访问注册页面，
填写用户名 testuser，邮箱 test@example.com，密码 123456，
点击注册按钮，验证注册成功
```

#### 5.1.3 使用命令行指令

除了自然语言指令，也可以使用命令行指令：

```bash
# 打开指定 URL
/dev-browser open http://localhost:5173

# 截取页面截图
/dev-browser screenshot http://localhost:5173 --output test.png

# 显示帮助信息
/dev-browser help
```

#### 5.1.4 执行测试

```bash
# 运行所有测试
npx playwright test

# 运行特定测试文件
npx playwright test tests/e2e/login.spec.js

# 以调试模式运行
npx playwright test --debug
```

### 5.2 常用使用方式

| 使用方式 | 功能 | 示例 |
|----------|------|------|
| **自然语言指令** | 智能控制浏览器 | `帮我测试登录功能...` |
| **命令行指令** | 直接控制浏览器 | `/dev-browser open http://localhost:5173` |
| **测试脚本** | 执行预定义测试 | `npx playwright test` |
| **截图功能** | 页面截图 | `帮我截取首页截图` |
| **数据采集** | 从网页提取数据 | `帮我提取页面中的所有链接` |

### 5.3 测试示例

#### 示例 1：登录功能测试

```javascript
// tests/e2e/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/#/pages/login/login');
  });

  test('成功登录', async ({ page }) => {
    // 输入用户名
    await page.fill('input[type="text"]', 'admin');
    
    // 输入密码
    await page.fill('input[type="password"]', '123456');
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 验证跳转到首页
    await expect(page).toHaveURL(/.*index/);
  });

  test('空用户名时显示错误提示', async ({ page }) => {
    // 直接点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 验证错误提示
    await expect(page.locator('text=请输入用户名或邮箱')).toBeVisible();
  });
});
```

#### 示例 2：页面截图测试

```javascript
const { test } = require('@playwright/test');

test('首页截图测试', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  
  // 截取全屏截图
  await page.screenshot({ 
    path: 'screenshots/homepage.png',
    fullPage: true 
  });
  
  console.log('截图已保存');
});
```

---

## 6. 故障排除

### 6.1 常见问题与解决方案

#### 问题 1：Dev Browser 安装失败

**症状**：
- 插件市场无法访问
- 安装过程中断
- 安装后无法使用

**解决方案**：

1. **检查网络连接**
   ```bash
   # 测试网络连接
   ping github.com
   ```

2. **使用 HTTPS 方式安装**
   ```bash
   /plugin marketplace add https://github.com/SawyerHood/dev-browser.git
   /plugin install dev-browser@sawyerhood/dev-browser
   ```

3. **以管理员身份运行 Claude Code**
   - 右键 Claude Code → 以管理员身份运行

4. **更新 Claude Code**
   - 检查并更新到最新版本

#### 问题 2：Chrome 浏览器启动失败

**症状**：
- 测试执行时报错：`browserType.launch: Failed to launch chromium`
- Chrome 无法启动

**解决方案**：

1. **验证 Chrome 路径**
   ```bash
   Test-Path "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"
   ```

2. **检查 Chrome 版本**
   ```bash
   "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" --version
   ```

3. **更新 Playwright 配置**
   ```javascript
   // 确保 playwright.config.js 中的路径正确
   executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe'
   ```

4. **检查防火墙设置**
   - 确保 Chrome 可以访问网络
   - 添加 Chrome 到防火墙白名单

#### 问题 3：端口被占用

**症状**：
- 开发服务器启动失败
- 测试无法访问页面
- 错误信息：`Port 5173 is already in use`

**解决方案**：

1. **查找占用端口的进程**
   ```bash
   netstat -ano | findstr :5173
   ```

2. **停止占用进程**
   ```bash
   taskkill /F /PID [PID]
   ```

3. **修改端口配置**
   - 修改 `vite.config.js` 中的端口
   - 更新 `playwright.config.js` 中的 URL

#### 问题 4：权限不足

**症状**：
- 安装失败：权限错误
- 测试执行失败：访问被拒绝
- Chrome 启动失败：权限不足

**解决方案**：

1. **以管理员身份运行**
   - 右键 Claude Code → 以管理员身份运行
   - 右键终端 → 以管理员身份运行

2. **检查文件权限**
   ```bash
   # 检查目录权限
   icacls "D:\your-mcp-proxy\AITY_VIP\chrome-win64"
   
   # 如果需要，添加权限
   icacls "D:\your-mcp-proxy\AITY_VIP\chrome-win64" /grant Users:F
   ```

3. **检查 UAC 设置**
   - 确保允许管理员权限
   - 调整 UAC 级别

#### 问题 5：服务一直无法启动

**症状**：
- Dev Browser 命令无响应
- 测试执行卡住
- 浏览器无法打开

**解决方案**：

1. **检查 Dev Browser 安装**
   ```bash
   /dev-browser help
   ```

2. **验证浏览器配置**
   ```bash
   # 创建测试脚本
   node test-dev-browser.js
   ```

3. **检查网络连接**
   ```bash
   # 测试本地服务器
   curl http://localhost:5173
   ```

4. **重启 Claude Code**
   - 完全关闭 Claude Code
   - 重新打开应用
   - 重试操作

5. **完全重装 Dev Browser**
   - 卸载现有插件
   - 重新安装插件
   - 重启 Claude Code

### 6.2 诊断步骤

#### 步骤 1：环境检查

```bash
# 创建环境检查脚本
node -e "
console.log('=== 环境检查 ===');
const { execSync } = require('child_process');

try {
  // 检查 Node.js
  const nodeVersion = execSync('node --version').toString().trim();
  console.log('✅ Node.js:', nodeVersion);
  
  // 检查 Chrome
  const chromePath = 'D:\\\\your-mcp-proxy\\\\AITY_VIP\\\\chrome-win64\\\\chrome.exe';
  const chromeVersion = execSync(`\"${chromePath}\" --version`).toString().trim();
  console.log('✅ Chrome:', chromeVersion);
  
  // 检查 Playwright
  const playwrightVersion = execSync('npm list playwright').toString();
  console.log('✅ Playwright:', playwrightVersion.match(/playwright@(\S+)/)?.[1]);
  
  console.log('=== 环境检查完成 ===');
} catch (error) {
  console.error('❌ 环境检查失败:', error.message);
}
"
```

#### 步骤 2：功能测试

```bash
# 创建功能测试脚本
node -e "
const { chromium } = require('playwright');

(async () => {
  console.log('=== 功能测试 ===');
  
  try {
    // 测试浏览器启动
    const browser = await chromium.launch({
      headless: false,
      executablePath: 'D:\\\\your-mcp-proxy\\\\AITY_VIP\\\\chrome-win64\\\\chrome.exe'
    });
    console.log('✅ 浏览器启动成功');
    
    const page = await browser.newPage();
    
    // 测试页面访问
    await page.goto('http://localhost:5173');
    console.log('✅ 页面访问成功');
    
    // 测试截图
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('✅ 截图成功');
    
    // 关闭浏览器
    await browser.close();
    console.log('✅ 浏览器关闭成功');
    
    console.log('=== 功能测试完成 ===');
  } catch (error) {
    console.error('❌ 功能测试失败:', error.message);
  }
})();
"
```

#### 步骤 3：日志分析

如果问题仍然存在，查看详细日志：

```bash
# 查看 Playwright 测试日志
npx playwright test --reporter=list

# 查看详细错误信息
npx playwright test --debug

# 查看测试报告
npx playwright show-report
```

---

## 7. 最佳实践

### 7.1 开发流程

#### 7.1.1 新功能开发

1. **开发功能**
   - 编写功能代码
   - 本地测试功能

2. **编写测试**
   - 使用 Playwright Skill 生成测试代码
   - 根据需求调整测试用例

3. **执行测试**
   - 运行相关测试用例
   - 验证功能正确性

4. **修复问题**
   - 根据测试结果修复问题
   - 重新运行测试验证

#### 7.1.2 Bug 修复

1. **复现 Bug**
   - 编写测试用例复现问题
   - 确认 Bug 存在

2. **修复 Bug**
   - 修改代码修复问题
   - 运行测试验证修复

3. **回归测试**
   - 运行完整测试套件
   - 确保没有引入新问题

### 7.2 测试策略

#### 7.2.1 测试用例设计

- **正向测试**：验证功能正常工作
- **负向测试**：验证异常情况处理
- **边界测试**：测试边界值和极限情况
- **性能测试**：验证性能指标

#### 7.2.2 测试数据管理

- **测试数据**：使用专门的测试数据
- **数据隔离**：每个测试用例独立
- **数据清理**：测试后清理测试数据

#### 7.2.3 测试执行

- **并行执行**：提高测试效率
- **重试机制**：处理偶发失败
- **超时设置**：合理设置测试超时

### 7.3 代码规范

#### 7.3.1 测试文件命名

- 使用描述性的文件名：`login.spec.js`
- 使用小写字母和连字符：`user-management.spec.js`
- 放置在正确的目录：`tests/e2e/`

#### 7.3.2 测试用例命名

- 使用描述性的测试名称
- 使用 "应该" 或 "验证" 等词汇
- 示例：`test('应该成功登录', async ({ page }) => { ... })`

#### 7.3.3 代码注释

- 添加必要的注释
- 解释复杂的测试逻辑
- 说明测试目的和预期结果

---

## 8. 团队协作

### 8.1 代码审查

#### 8.1.1 测试代码审查

- **测试覆盖**：检查测试覆盖率
- **测试质量**：验证测试用例的完整性
- **代码规范**：遵循团队编码规范

#### 8.1.2 审查清单

- [ ] 测试用例覆盖所有功能点
- [ ] 测试用例包含正向和负向测试
- [ ] 测试代码遵循团队规范
- [ ] 测试数据独立且可重复
- [ ] 测试执行时间合理

### 8.2 文档维护

#### 8.2.1 更新文档

- **新增功能**：更新测试用例文档
- **环境变更**：更新配置说明
- **问题解决**：更新故障排除指南

#### 8.2.2 文档版本

- **版本号**：使用语义化版本号
- **更新日期**：记录最后更新日期
- **变更记录**：记录主要变更内容

### 8.3 知识共享

#### 8.3.1 经验分享

- **问题解决**：分享常见问题的解决方案
- **最佳实践**：分享测试最佳实践
- **工具使用**：分享工具使用技巧

#### 8.3.2 培训支持

- **新成员培训**：帮助新成员快速上手
- **技能提升**：组织技能分享会
- **问题支持**：提供技术支持

---

## 9. 附录

### 9.1 相关文档

- [Playwright 官方文档](https://playwright.dev/)
- [DevBrowser-PlaywrightSkill-安装指南.md](./DevBrowser-PlaywrightSkill-安装指南.md)
- [Playwright测试环境配置.md](./Playwright测试环境配置.md)
- [测试策略文档.md](./测试策略文档.md)

### 9.2 快速参考

#### 9.2.1 常用命令

```bash
# 安装 Dev Browser
/plugin marketplace add sawyerhood/dev-browser
/plugin install dev-browser@sawyerhood/dev-browser

# 验证安装
/dev-browser help

# 运行测试
npx playwright test

# 调试测试
npx playwright test --debug

# 查看报告
npx playwright show-report
```

#### 9.2.2 配置文件

| 文件 | 位置 | 用途 |
|------|------|------|
| `playwright.config.js` | 项目根目录 | Playwright 配置 |
| `package.json` | 项目根目录 | 项目依赖 |
| `.env` | 项目根目录 | 环境变量 |

### 9.3 联系方式

- **技术支持**：[团队邮箱]
- **问题反馈**：[问题跟踪系统]
- **文档更新**：[文档维护人]

---

## 10. 总结

本文档提供了 Dev Browser 的完整安装、配置和使用指南，帮助开发团队快速上手浏览器自动化测试。

**核心要点**：
1. ✅ 确保环境满足要求
2. ✅ 按照步骤正确安装
3. ✅ 配置正确的浏览器路径
4. ✅ 遵循最佳实践
5. ✅ 及时更新文档

通过遵循本文档，团队成员应该能够：
- 成功安装和配置 Dev Browser
- 编写和执行自动化测试
- 解决常见的技术问题
- 提高测试效率和质量

**持续改进**：本文档会根据团队反馈和技术发展持续更新，请定期查看最新版本。

---

**文档维护**：[团队名称]
**最后更新**：2026-02-27
**文档版本**：v1.1
