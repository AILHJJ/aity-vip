# Playwright 测试用例说明

## 1. 测试用例概述

本文档详细说明了投研图灵室项目的 Playwright 端到端测试用例，包括测试文件结构、测试覆盖范围、测试执行方法等内容。

## 2. 测试文件结构

### 2.1 目录结构

```
aity-uni-app-v2/
├── tests/
│   └── e2e/              # 端到端测试目录
│       ├── login.spec.js           # 登录功能测试
│       ├── market.spec.js          # 行情中心测试
│       ├── discussions.spec.js      # 讨论区测试
│       ├── messages.spec.js        # 消息中心测试
│       ├── profile.spec.js         # 个人中心测试
│       ├── ai-advisor.spec.js     # AI顾问测试
│       ├── navigation.spec.js      # 页面导航测试
│       └── user-management.spec.js # 用户管理测试
├── playwright.config.js    # Playwright 配置文件
└── package.json            # 项目配置文件
```

### 2.2 配置文件

**playwright.config.js**

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe'
      },
    },
  ],
});
```

## 3. 测试用例详情

### 3.1 登录功能测试 (`login.spec.js`)

**测试覆盖**：13 个测试用例

**测试内容**：
- 页面元素显示（标题、输入框、按钮等）
- 表单验证（空用户名、空密码）
- 用户输入（用户名、密码）
- 交互操作（记住我、登录按钮）
- 响应式布局

**关键测试点**：
- 登录页面标题显示
- 用户名和密码输入框存在
- 登录按钮显示
- 空用户名时的错误提示
- 空密码时的错误提示
- 记住我复选框功能
- 登录按钮点击效果

### 3.2 行情中心测试 (`market.spec.js`)

**测试覆盖**：23 个测试用例

**测试内容**：
- 顶部导航栏
- 主要指数展示
- 连板天梯
- 行业资金流向
- 数据滚动和交互

**关键测试点**：
- 行情中心标题显示
- 顶部导航栏元素
- 主要指数卡片显示
- 指数涨跌幅数据
- 连板天梯表格
- 行业资金流向图表
- 数据加载状态

### 3.3 讨论区测试 (`discussions.spec.js`)

**测试覆盖**：21 个测试用例

**测试内容**：
- 讨论列表展示
- 搜索功能
- 分类切换
- 讨论详情
- 下拉刷新和上拉加载

**关键测试点**：
- 讨论区标题显示
- 讨论列表加载
- 搜索输入框功能
- 分类标签切换
- 讨论详情页面
- 回复功能
- 分页加载

### 3.4 消息中心测试 (`messages.spec.js`)

**测试覆盖**：23 个测试用例

**测试内容**：
- 消息列表展示
- 消息类型切换
- 消息详情
- 标记已读
- 删除消息

**关键测试点**：
- 消息中心标题显示
- 消息列表加载
- 消息类型标签切换
- 未读消息标记
- 消息详情查看
- 标记已读功能
- 删除消息功能

### 3.5 个人中心测试 (`profile.spec.js`)

**测试覆盖**：23 个测试用例

**测试内容**：
- 用户信息展示
- 功能菜单
- 统计数据
- 设置和退出

**关键测试点**：
- 个人中心标题显示
- 用户头像和昵称
- 功能菜单列表
- 统计数据展示
- 设置页面访问
- 退出登录功能

### 3.6 AI 顾问测试 (`ai-advisor.spec.js`)

**测试覆盖**：23 个测试用例

**测试内容**：
- 对话交互
- 快捷问题
- 消息展示
- Markdown 支持
- 复制功能

**关键测试点**：
- AI 顾问标题显示
- 对话输入框
- 发送消息功能
- 快捷问题点击
- 消息列表展示
- Markdown 渲染
- 复制答案功能

### 3.7 页面导航测试 (`navigation.spec.js`)

**测试覆盖**：20 个测试用例

**测试内容**：
- 页面跳转
- 返回功能
- 底部导航
- URL 参数
- 页面缓存

**关键测试点**：
- 底部导航栏功能
- 页面间跳转
- 返回按钮功能
- URL 参数传递
- 页面缓存状态
- 导航动画效果

### 3.8 用户管理测试 (`user-management.spec.js`)

**测试覆盖**：33 个测试用例

**测试内容**：
- 用户列表展示
- 搜索和筛选
- 增删改查
- 批量操作
- 分页和排序

**关键测试点**：
- 用户管理标题显示
- 用户列表加载
- 搜索功能
- 筛选功能
- 添加用户功能
- 编辑用户功能
- 删除用户功能
- 批量操作
- 分页功能
- 排序功能

## 4. 测试执行方法

### 4.1 运行所有测试

```bash
# 进入项目目录
cd AITY_VIP\aity-uni-app-v2

# 运行所有测试
npx playwright test

# 运行所有测试并生成报告
npx playwright test --reporter=html
```

### 4.2 运行特定测试文件

```bash
# 运行登录功能测试
npx playwright test tests/e2e/login.spec.js

# 运行行情中心测试
npx playwright test tests/e2e/market.spec.js

# 运行讨论区测试
npx playwright test tests/e2e/discussions.spec.js

# 运行消息中心测试
npx playwright test tests/e2e/messages.spec.js

# 运行个人中心测试
npx playwright test tests/e2e/profile.spec.js

# 运行 AI 顾问测试
npx playwright test tests/e2e/ai-advisor.spec.js

# 运行页面导航测试
npx playwright test tests/e2e/navigation.spec.js

# 运行用户管理测试
npx playwright test tests/e2e/user-management.spec.js
```

### 4.3 运行特定测试用例

```bash
# 运行包含特定关键字的测试
npx playwright test --grep "登录"

# 运行包含特定标签的测试
npx playwright test --grep "@smoke"
```

### 4.4 调试测试

```bash
# 以调试模式运行测试
npx playwright test --debug

# 以 UI 模式运行测试
npx playwright test --ui

# 慢速执行测试
npx playwright test --slow-mo=1000
```

### 4.5 查看测试报告

```bash
# 查看测试报告
npx playwright show-report

# 生成 JUnit 格式报告
npx playwright test --reporter=junit
```

## 5. 测试用例编写规范

### 5.1 测试用例结构

```javascript
import { test, expect } from '@playwright/test';

test.describe('功能模块', () => {
  test.beforeEach(async ({ page }) => {
    // 测试前的准备工作
    await page.goto('/path/to/page');
  });

  test('测试用例名称', async ({ page }) => {
    // 测试步骤
    // 1. 执行操作
    // 2. 验证结果
    
    // 示例：
    const element = page.locator('.element-selector');
    await element.click();
    await expect(element).toBeVisible();
  });

  // 更多测试用例...
});
```

### 5.2 命名规范

- **测试文件**：使用 `功能名称.spec.js` 格式
- **测试套件**：使用描述性的功能模块名称
- **测试用例**：使用清晰的动作-结果描述
- **变量名**：使用语义化的变量名

### 5.3 最佳实践

- **独立性**：每个测试用例应该独立运行
- **可重复性**：测试应该在任何环境下都能重复执行
- **清晰性**：测试代码应该清晰易读
- **全面性**：测试应该覆盖正常、边界和异常情况
- **速度**：测试应该快速执行，避免不必要的等待

## 6. 测试环境配置

### 6.1 浏览器配置

- **Chrome 路径**：`D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe`
- **浏览器版本**：Chrome 最新稳定版
- **浏览器参数**：默认参数，无特殊配置

### 6.2 测试配置

- **基础 URL**：`http://localhost:5173`
- **测试超时**：默认超时设置
- **重试机制**：CI 环境下重试 2 次
- **并行执行**：启用完全并行测试

### 6.3 环境变量

| 环境变量 | 用途 | 默认值 |
|---------|------|--------|
| `CI` | 持续集成环境标识 | 未设置 |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Chrome 可执行文件路径 | 配置文件中设置 |

## 7. 测试数据管理

### 7.1 测试数据类型

- **用户数据**：测试账号和密码
- **业务数据**：测试用的行情数据、讨论内容等
- **配置数据**：测试环境配置

### 7.2 数据准备

- **静态数据**：在测试代码中硬编码
- **动态数据**：在测试运行时生成
- **外部数据**：从外部文件或 API 获取

### 7.3 数据清理

- **测试后清理**：在测试完成后清理测试数据
- **隔离测试**：确保测试之间的数据隔离

## 8. 常见问题与解决方案

### 8.1 页面加载问题

- **问题**：页面加载超时
- **解决方案**：增加等待时间，检查网络连接

### 8.2 元素定位问题

- **问题**：元素定位失败
- **解决方案**：使用更稳定的选择器，增加等待时间

### 8.3 测试失败问题

- **问题**：测试不稳定，偶尔失败
- **解决方案**：增加适当的等待，使用重试机制，检查测试环境

### 8.4 环境配置问题

- **问题**：浏览器启动失败
- **解决方案**：检查 Chrome 路径配置，确保浏览器可访问

### 8.5 性能问题

- **问题**：测试执行速度慢
- **解决方案**：优化测试代码，使用并行测试，减少不必要的操作

## 9. 测试维护

### 9.1 测试用例更新

- **功能变更**：当功能变更时更新相应的测试用例
- **UI 变更**：当页面结构变更时更新元素选择器
- **API 变更**：当 API 变更时更新测试数据和验证逻辑

### 9.2 测试套件管理

- **定期运行**：定期运行测试套件，确保功能正常
- **代码审查**：对测试代码进行代码审查
- **测试覆盖率**：监控测试覆盖率，确保覆盖关键功能

### 9.3 文档维护

- **定期更新**：定期更新测试文档
- **文档同步**：确保文档与测试代码同步
- **最佳实践**：持续优化测试方法和文档

## 10. 总结

本测试用例说明文档详细介绍了投研图灵室项目的 Playwright 端到端测试用例，包括测试文件结构、测试覆盖范围、测试执行方法等内容。通过这些测试用例，我们可以确保项目的功能完整性和稳定性，为用户提供优质的产品体验。

测试是一个持续改进的过程，我们将不断优化测试用例和测试方法，适应项目的发展和变化，为项目的成功保驾护航。

---

**文档版本**：v1.0
**创建日期**：2026-02-27
**更新日期**：2026-02-27
**维护团队**：投研图灵室测试团队
