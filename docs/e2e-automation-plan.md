# AITY VIP 端到端自动化测试方案

## 项目概述

**项目**: AITY VIP - 投研内部分享系统
**技术栈**:
- 前端: uni-app 3.0 (Vue 3) + H5 + 微信小程序
- 后端: Node.js + Express + MySQL
**文档版本**: v1.0.0
**创建日期**: 2026-02-26

---

## 1. 技术选型分析

### 1.1 E2E测试框架对比

| 框架 | 优势 | 劣势 | 适配度 |
|------|------|------|--------|
| **Playwright** | ✅ 跨浏览器支持<br>✅ 快速可靠<br>✅ 自动等待机制<br>✅ 网络拦截功能强<br>✅ 并行执行能力 | ❌ 生态相对新 | ⭐⭐⭐⭐⭐ (推荐) |
| **Cypress** | ✅ 优秀的开发者体验<br>✅ 实时重载<br>✅ 时间旅行调试 | ❌ 不支持多标签页<br>❌ 不支持微信小程序<br>❌ 性能较差 | ⭐⭐⭐ |
| **Puppeteer** | ✅ Chrome DevTools集成<br>✅ 轻量级 | ❌ 仅支持Chrome<br>❌ 需要手动处理等待 | ⭐⭐⭐ |
| **uni-automator** | ✅ 官方支持<br>✅ 小程序专用 | ❌ 仅支持小程序<br>❌ 功能有限 | ⭐⭐⭐⭐ (小程序必选) |

### 1.2 最终选型方案

#### 方案一: Playwright (H5端) + uni-automator (小程序端) - 推荐

**配置**:
```javascript
// H5端测试
- Playwright (Node.js)
- 测试环境: Chrome/Firefox/Safari
- 并发执行: 支持

// 小程序端测试
- @dcloudio/uni-automator (已安装)
- 微信开发者工具自动化
```

**优势**:
- Playwright处理H5端复杂交互
- uni-automator专门处理小程序特性
- 可在CI/CD中并行运行
- 覆盖面最全

#### 方案二: 全量Playwright (仅H5)

如果优先测试H5版本，可先使用Playwright完成H5端测试覆盖，小程序端通过手工测试补充。

---

## 2. 测试架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                   CI/CD Pipeline                        │
│              (GitHub Actions / GitLab CI)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Test Orchestrator (测试调度器)              │
│         - 定时触发 (24/7循环测试)                        │
│         - 失败重试机制                                   │
│         - 测试结果聚合                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│  H5 E2E Tests    │         │  MP E2E Tests    │
│   (Playwright)   │         │  (uni-automator) │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│  Test Server     │         │  WeChat DevTools │
│  (Docker/Staging)│         │   (Automation)   │
└──────────────────┘         └──────────────────┘
```

### 2.2 测试分层策略

```
E2E测试金字塔
          /\
         /  \        Smoke Tests (冒烟测试)
        /____\       - 核心流程快速验证
       /      \      - 5-10个关键用例
      /        \
     /          \    Critical Path Tests (关键路径)
    /____________\   - 主要业务流程
                    - 20-30个用例
```

### 2.3 24小时不间断测试方案

#### 方案A: GitHub Actions定时任务 (推荐)

```yaml
# .github/workflows/e2e-schedule.yml
name: 24/7 E2E Monitoring

on:
  schedule:
    # 每4小时执行一次
    - cron: '0 */4 * * *'
  workflow_dispatch:  # 手动触发

jobs:
  e2e-h5:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd aity-uni-app-v2
          npm install
          npm install -D @playwright/test

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build H5
        run: |
          cd aity-uni-app-v2
          npm run build:h5

      - name: Start Backend (Staging)
        run: |
          cd backend
          npm install
          npm start &
          sleep 10

      - name: Run E2E Tests
        run: |
          cd aity-uni-app-v2
          npx playwright test

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/e2e/playwright-report/

      - name: Notify on Failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'E2E测试失败，请立即检查！'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### 方案B: 自建测试服务器 + PM2

```javascript
// ecosystem.test.config.js
module.exports = {
  apps: [
    {
      name: 'e2e-test-runner',
      script: './tests/e2e/runner.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'test',
        TEST_INTERVAL: '4h'  // 每4小时运行一次
      }
    }
  ]
}

// tests/e2e/runner.js
const { exec } = require('child_process');
const schedule = require('node-schedule');

async function runTests() {
  console.log(`[E2E] 开始测试: ${new Date().toISOString()}`);

  exec('npm run test:e2e', (error, stdout, stderr) => {
    if (error) {
      console.error(`测试失败: ${error}`);
      notifyFailure(stdout);
      return;
    }
    console.log(`测试通过: ${stdout}`);
  });
}

// 每4小时运行一次
schedule.scheduleJob('0 */4 * * *', runTests);

// 启动时立即运行一次
runTests();
```

### 2.4 自动检测报错并触发修复流程

#### 错误检测机制

```javascript
// tests/e2e/helpers/error-monitor.js
class ErrorMonitor {
  constructor() {
    this.errors = [];
  }

  // 捕获控制台错误
  captureConsoleErrors(page) {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console',
          message: msg.text(),
          timestamp: new Date()
        });
      }
    });
  }

  // 捕获网络请求错误
  captureNetworkErrors(page) {
    page.on('response', response => {
      if (response.status() >= 400) {
        this.errors.push({
          type: 'network',
          url: response.url(),
          status: response.status(),
          timestamp: new Date()
        });
      }
    });
  }

  // 捕获未处理的Promise rejection
  capturePageErrors(page) {
    page.on('pageerror', error => {
      this.errors.push({
        type: 'page',
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
    });
  }

  // 生成错误报告
  generateReport() {
    return {
      total: this.errors.length,
      byType: this.groupByType(),
      errors: this.errors
    };
  }

  groupByType() {
    return this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = ErrorMonitor;
```

#### 自动修复流程

```javascript
// tests/e2e/helpers/auto-fix.js
const { execSync } = require('child_process');
const fs = require('fs');

class AutoFixer {
  constructor(errorReport) {
    this.errorReport = errorReport;
  }

  // 尝试自动修复
  async attemptFix() {
    const fixes = [];

    for (const error of this.errorReport.errors) {
      if (error.type === 'network' && error.status === 401) {
        fixes.push(this.handleAuthError(error));
      } else if (error.type === 'network' && error.status === 500) {
        fixes.push(this.handleServerError(error));
      } else if (error.type === 'console') {
        fixes.push(this.handleConsoleError(error));
      }
    }

    return Promise.all(fixes);
  }

  // 处理认证错误
  async handleAuthError(error) {
    console.log(`[AutoFix] 尝试修复认证错误: ${error.url}`);

    // 可能的修复方案:
    // 1. 清除并重新获取token
    // 2. 重启后端服务
    // 3. 重新登录

    return {
      action: 're-authenticate',
      status: 'attempted'
    };
  }

  // 处理服务器错误
  async handleServerError(error) {
    console.log(`[AutoFix] 服务器500错误，尝试重启后端`);

    try {
      // 重启后端服务
      execSync('pm2 restart aity-vip-backend');

      return {
        action: 'restart-backend',
        status: 'success'
      };
    } catch (e) {
      return {
        action: 'restart-backend',
        status: 'failed',
        error: e.message
      };
    }
  }

  // 生成修复报告
  async generateFixReport() {
    const report = {
      timestamp: new Date(),
      errors: this.errorReport.total,
      fixAttempts: [],
      recommendations: []
    };

    // 根据错误类型给出修复建议
    if (this.errorReport.byType?.network > 5) {
      report.recommendations.push({
        level: 'high',
        message: '检测到大量网络错误，建议检查后端服务状态'
      });
    }

    return report;
  }
}

module.exports = AutoFixer;
```

### 2.5 测试用例管理策略

#### 用例组织结构

```
tests/e2e/
├── specs/                    # 测试用例
│   ├── smoke/               # 冒烟测试
│   │   ├── login.spec.js
│   │   ├── homepage.spec.js
│   │   └── api-connectivity.spec.js
│   ├── critical-path/       # 关键路径
│   │   ├── message-publish.spec.js
│   │   ├── discussion-flow.spec.js
│   │   └── user-management.spec.js
│   └── regression/          # 回归测试
│       ├── search.spec.js
│       ├── filter.spec.js
│       └── image-upload.spec.js
├── helpers/                 # 辅助函数
│   ├── auth.js
│   ├── api-client.js
│   ├── error-monitor.js
│   └── auto-fix.js
├── fixtures/                # 测试数据
│   ├── users.json
│   └── messages.json
├── config/                  # 配置文件
│   ├── playwright.config.js
│   └── test-config.json
└── reports/                 # 测试报告
    ├── html/
    └── json/
```

#### 用例优先级定义

| 优先级 | 描述 | 示例 | 执行频率 |
|--------|------|------|----------|
| P0 | 核心功能，阻断性 | 登录、消息发布、讨论回复 | 每次部署 |
| P1 | 重要功能 | 用户管理、搜索筛选 | 每4小时 |
| P2 | 次要功能 | 图片上传、收藏 | 每日 |
| P3 | 边缘场景 | 边界值测试、异常处理 | 每周 |

---

## 3. CI/CD集成方案

### 3.1 完整CI/CD流程

```yaml
# .github/workflows/complete-ci.yml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main, feature/iteration-1]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */4 * * *'  # 每4小时

env:
  NODE_VERSION: '18'
  TEST_DB: '投研图灵室_test'

jobs:
  # 阶段1: 代码质量检查
  lint:
    name: Code Quality Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: |
          cd aity-uni-app-v2
          npm install
          cd ../backend
          npm install

      - name: Run ESLint
        run: |
          cd aity-uni-app-v2
          npm run lint

      - name: Run Prettier check
        run: |
          cd aity-uni-app-v2
          npm run format:check

  # 阶段2: 单元测试
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install backend dependencies
        run: |
          cd backend
          npm install

      - name: Run unit tests
        run: |
          cd backend
          npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  # 阶段3: E2E测试 - H5
  e2e-h5:
    name: E2E Tests (H5)
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: |
          cd aity-uni-app-v2
          npm install
          npm install -D @playwright/test

      - name: Install Playwright browsers
        run: |
          cd aity-uni-app-v2
          npx playwright install --with-deps

      - name: Build H5
        run: |
          cd aity-uni-app-v2
          npm run build:h5

      - name: Start test backend
        run: |
          cd backend
          npm install
          DB_ENV=test npm start &
          sleep 15

      - name: Run E2E tests
        run: |
          cd aity-uni-app-v2
          npx playwright test
        env:
          CI: true

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: h5-e2e-report
          path: tests/e2e/playwright-report/

  # 阶段4: 部署到Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [e2e-h5]
    if: github.ref == 'refs/heads/feature/iteration-1'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy backend to staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /root/AITY_VIP/backend
            git pull origin feature/iteration-1
            npm install
            pm2 restart aity-vip-backend

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging部署完成'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # 阶段5: 部署到生产
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /root/AITY_VIP/backend
            git pull origin main
            npm install
            pm2 restart aity-vip-backend

      - name: Build and upload mini-program
        run: |
          cd aity-uni-app-v2
          npm run build:mp-weixin
          node scripts/upload-weixin.js
```

### 3.2 本地Pre-commit Hook

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 运行类型检查
echo "Running type check..."
cd aity-uni-app-v2
npm run type-check || exit 1

# 运行lint
echo "Running lint..."
npm run lint || exit 1

# 运行单元测试
echo "Running unit tests..."
cd ../backend
npm test || exit 1

# 运行快速E2E测试
echo "Running smoke E2E tests..."
cd ../aity-uni-app-v2
npx playwright test --project=smoke || exit 1

echo "All checks passed! ✅"
```

---

## 4. 自动化修复可行性分析

### 4.1 可自动修复的问题

| 问题类型 | 可行性 | 修复方案 | 成功率 |
|---------|--------|----------|--------|
| **后端服务崩溃** | ✅ 高 | PM2自动重启 | 95% |
| **Token过期** | ✅ 高 | 自动重新登录 | 90% |
| **网络超时** | ✅ 中 | 自动重试 | 70% |
| **数据库连接断开** | ✅ 高 | 重连机制 | 85% |
| **测试数据污染** | ✅ 高 | 自动清理 | 95% |
| **API响应格式错误** | ❌ 低 | 需人工介入 | 10% |
| **UI元素定位失败** | ❌ 低 | 需人工介入 | 20% |
| **业务逻辑错误** | ❌ 无 | 需人工修复 | 0% |

### 4.2 智能修复建议系统

```javascript
// tests/e2e/helpers/smart-fixer.js
class SmartFixer {
  constructor() {
    this.fixHistory = [];
    this.successRate = {};
  }

  // 基于历史数据的修复决策
  async suggestFix(error) {
    const similarFixes = this.findSimilarFixes(error);

    if (similarFixes.length > 0) {
      const successRate = this.calculateSuccessRate(similarFixes);

      if (successRate > 0.8) {
        return {
          recommendation: 'auto_fix',
          action: similarFixes[0].action,
          confidence: successRate
        };
      }
    }

    return {
      recommendation: 'manual_review',
      reason: 'No successful auto-fix pattern found',
      suggestions: this.generateManualSuggestions(error)
    };
  }

  // 查找相似错误的历史修复记录
  findSimilarFixes(error) {
    return this.fixHistory.filter(fix =>
      fix.error.type === error.type &&
      fix.error.message.includes(error.message.substring(0, 20))
    );
  }

  // 计算成功率
  calculateSuccessRate(fixes) {
    const successful = fixes.filter(f => f.success).length;
    return successful / fixes.length;
  }

  // 生成人工修复建议
  generateManualSuggestions(error) {
    const suggestions = [];

    if (error.type === 'network' && error.status === 404) {
      suggestions.push('检查API路由配置');
      suggestions.push('验证后端服务是否正常启动');
    } else if (error.type === 'page' && error.message.includes('timeout')) {
      suggestions.push('增加等待时间');
      suggestions.push('检查网络状况');
    }

    return suggestions;
  }

  // 记录修复结果
  recordFix(error, action, success) {
    this.fixHistory.push({
      timestamp: new Date(),
      error,
      action,
      success
    });

    // 更新成功率统计
    const key = `${error.type}:${action}`;
    if (!this.successRate[key]) {
      this.successRate[key] = { attempts: 0, successes: 0 };
    }
    this.successRate[key].attempts++;
    if (success) {
      this.successRate[key].successes++;
    }
  }
}

module.exports = SmartFixer;
```

---

## 5. MVP方案实施

### 5.1 MVP阶段划分

#### 阶段1: 基础搭建 (Week 1-2)

**目标**: 建立可运行的E2E测试框架

```bash
# 安装依赖
cd aity-uni-app-v2
npm install -D @playwright/test
npx playwright install

# 创建配置文件
npx playwright init
```

**交付物**:
- Playwright基础配置
- 3个Smoke测试用例
- 本地可运行

#### 阶段2: 核心流程覆盖 (Week 3-4)

**目标**: 覆盖主要业务流程

**测试用例**:
1. 用户登录流程
2. 消息发布流程
3. 讨论创建和回复
4. 用户管理CRUD
5. 消息搜索和筛选

**交付物**:
- 15个E2E测试用例
- 测试数据fixtures
- 辅助函数库

#### 阶段3: CI/CD集成 (Week 5)

**目标**: 集成到持续集成流程

**任务**:
1. 配置GitHub Actions
2. 设置测试报告展示
3. 配置失败通知
4. 实现定时任务

**交付物**:
- 完整CI/CD配置
- 测试报告HTML
- 失败Slack通知

#### 阶段4: 监控与自动修复 (Week 6)

**目标**: 实现智能监控和修复

**功能**:
1. 错误捕获和分析
2. 自动重试机制
3. 后端服务自动重启
4. 修复建议系统

**交付物**:
- 错误监控系统
- 自动修复脚本
- 修复建议报告

### 5.2 MVP测试用例列表

```javascript
// tests/e2e/specs/smoke/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('用户登录 - Smoke测试', () => {
  test('应该能够成功登录', async ({ page }) => {
    // 导航到登录页
    await page.goto('http://localhost:5173/#/pages/login/login');

    // 输入凭证
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123456');

    // 点击登录
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await expect(page).toHaveURL(/.*\/pages\/index\/index/);
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });

  test('应该显示错误信息当凭证错误时', async ({ page }) => {
    await page.goto('http://localhost:5173/#/pages/login/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    await page.click('[data-testid="login-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]'))
      .toHaveText('用户名或密码错误');
  });
});
```

```javascript
// tests/e2e/specs/critical-path/message-publish.spec.js
const { test, expect } = require('@playwright/test');

test.describe('消息发布 - 关键路径测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/#/pages/login/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123456');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/pages\/index\/index/);
  });

  test('应该能够发布文本消息', async ({ page }) => {
    // 点击发布按钮
    await page.click('[data-testid="publish-button"]');

    // 选择消息类型
    await page.click('[data-testid="message-type-text"]');

    // 输入标题和内容
    await page.fill('[data-testid="message-title"]', '测试消息标题');
    await page.fill('[data-testid="message-content"]', '这是测试消息内容');

    // 选择分组
    await page.click('[data-testid="group-selector"]');
    await page.click('[data-testid="group-all"]');

    // 提交
    await page.click('[data-testid="submit-button"]');

    // 验证发布成功
    await expect(page.locator('[data-testid="toast-success"]'))
      .toHaveText('发布成功');

    // 验证消息出现在列表中
    await page.goto('http://localhost:5173/#/pages/index/index');
    await expect(page.locator('text=测试消息标题')).toBeVisible();
  });

  test('应该能够上传图片并发布', async ({ page }) => {
    await page.click('[data-testid="publish-button"]');
    await page.click('[data-testid="message-type-text"]');

    // 上传图片
    const fileInput = page.locator('[data-testid="image-upload-input"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.png');

    // 等待图片预览
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();

    // 填写其他信息
    await page.fill('[data-testid="message-title"]', '带图片的消息');
    await page.fill('[data-testid="message-content"]', '消息内容');

    // 提交
    await page.click('[data-testid="submit-button"]');

    // 验证
    await expect(page.locator('[data-testid="toast-success"]'))
      .toHaveText('发布成功');
  });
});
```

### 5.3 Playwright配置文件

```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e/specs',

  // 并行执行
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,

  // 测试报告
  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports/html' }],
    ['json', { outputFile: 'tests/e2e/reports/json/results.json' }],
    ['junit', { outputFile: 'tests/e2e/reports/junit/results.xml' }]
  ],

  use: {
    // 基础URL
    baseURL: 'http://localhost:5173',

    // 截图和录像
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 追踪
    trace: 'retain-on-failure',

    // 超时设置
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 测试项目
  projects: [
    {
      name: 'smoke',
      testMatch: '**/smoke/**/*.spec.js',
    },
    {
      name: 'critical-path',
      testMatch: '**/critical-path/**/*.spec.js',
    },
    {
      name: 'regression',
      testMatch: '**/regression/**/*.spec.js',
    },

    // 桌面浏览器
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 移动设备
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 开发服务器
  webServer: {
    command: 'npm run dev:h5',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.4 package.json脚本

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:smoke": "playwright test --project=smoke",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report tests/e2e/reports/html",
    "test:e2e:install": "playwright install --with-deps"
  }
}
```

---

## 6. 监控与告警

### 6.1 测试指标监控

```javascript
// tests/e2e/helpers/metrics.js
class TestMetrics {
  constructor() {
    this.metrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      flakyTests: 0,
      duration: 0,
      passRate: 0,
      flakyRate: 0
    };
  }

  calculate(results) {
    this.metrics.totalTests = results.numPassedTests + results.numFailedTests;
    this.metrics.passedTests = results.numPassedTests;
    this.metrics.failedTests = results.numFailedTests;
    this.metrics.duration = results.duration;
    this.metrics.passRate = (results.numPassedTests / this.metrics.totalTests) * 100;

    return this.metrics;
  }

  // 检查是否需要告警
  shouldAlert() {
    return {
      critical: this.metrics.passRate < 50,  // 通过率低于50%
      warning: this.metrics.passRate < 80,   // 通过率低于80%
      flaky: this.metrics.flakyRate > 10     // 不稳定测试超过10%
    };
  }
}

module.exports = TestMetrics;
```

### 6.2 Slack通知配置

```javascript
// tests/e2e/helpers/notifier.js
const IncomingWebhook = require('@slack/webhook').IncomingWebhook;

class SlackNotifier {
  constructor(webhookUrl) {
    this.webhook = new IncomingWebhook(webhookUrl);
  }

  async sendTestReport(results) {
    const { metrics } = results;
    const status = metrics.passRate >= 80 ? '✅ 成功' : '❌ 失败';
    const color = metrics.passRate >= 80 ? 'good' : 'danger';

    const message = {
      text: `E2E测试报告 - ${status}`,
      attachments: [
        {
          color,
          fields: [
            { title: '总测试数', value: metrics.totalTests, short: true },
            { title: '通过数', value: metrics.passedTests, short: true },
            { title: '失败数', value: metrics.failedTests, short: true },
            { title: '通过率', value: `${metrics.passRate}%`, short: true },
            { title: '耗时', value: `${Math.round(metrics.duration / 1000)}s`, short: true }
          ]
        },
        {
          title: '失败的测试',
          text: results.failedTests.map(t => `• ${t.title}`).join('\n') || '无'
        }
      ]
    };

    await this.webhook.send(message);
  }
}

module.exports = SlackNotifier;
```

---

## 7. 最佳实践建议

### 7.1 测试编写原则

1. **独立性**: 每个测试用例独立运行，不依赖其他用例
2. **可重复性**: 多次运行结果一致
3. **快速性**: 单个用例不超过30秒
4. **可维护性**: 使用Page Object模式
5. **明确性**: 测试名称清晰描述测试内容

### 7.2 数据管理策略

```javascript
// tests/e2e/helpers/test-data.js
class TestDataManager {
  constructor() {
    this.testDataPrefix = '[TEST]';
  }

  // 创建测试用户
  async createTestUser(role = 'vip_mid') {
    const timestamp = Date.now();
    return {
      email: `test_${timestamp}@example.com`,
      password: '123456',
      name: `测试用户${timestamp}`,
      role
    };
  }

  // 创建测试消息
  async createTestMessage() {
    const timestamp = Date.now();
    return {
      title: `${this.testDataPrefix} 消息${timestamp}`,
      content: '这是测试消息内容',
      type: 'text'
    };
  }

  // 清理测试数据
  async cleanupTestData() {
    // API调用删除所有以[TEST]开头的数据
  }
}

module.exports = TestDataManager;
```

### 7.3 性能测试集成

```javascript
// tests/e2e/specs/performance/load-time.spec.js
const { test, expect } = require('@playwright/test');

test.describe('性能测试', () => {
  test('首页加载时间应小于3秒', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5173/#/pages/index/index');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('消息列表渲染时间应小于1秒', async ({ page }) => {
    await page.goto('http://localhost:5173/#/pages/index/index');

    const startTime = Date.now();
    await page.waitForSelector('[data-testid="message-item"]');
    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(1000);
  });
});
```

---

## 8. 成本估算

### 8.1 开发成本

| 阶段 | 工作量 | 人力成本 | 备注 |
|------|--------|----------|------|
| 基础搭建 | 2周 | 1人 | 框架配置+Smoke测试 |
| 核心流程 | 2周 | 1人 | 15个核心用例 |
| CI/CD集成 | 1周 | 1人 | GitHub Actions配置 |
| 监控修复 | 1周 | 1人 | 智能监控系统 |
| **总计** | **6周** | **1人月** | |

### 8.2 运行成本

| 项目 | 成本 | 备注 |
|------|------|------|
| GitHub Actions | 免费 | 公开仓库免费 |
| 私有服务器 | ¥200/月 | 可复用现有服务器 |
| 通知服务 | 免费 | Slack免费版 |
| **总计** | **¥200/月** | |

### 8.3 维护成本

- 测试用例维护: 每周2-4小时
- 失败用例修复: 根据实际情况
- 版本升级: 每月1-2小时

---

## 9. 风险与挑战

### 9.1 技术风险

| 风险 | 影响 | 缓解方案 |
|------|------|----------|
| 小程序自动化支持有限 | 高 | 优先H5端，小程序用uni-automator |
| 测试环境不稳定 | 中 | 使用Docker隔离环境 |
| 测试数据污染 | 中 | 每次运行前清理数据 |
| CI/CD资源限制 | 低 | 使用缓存和并行执行 |

### 9.2 挑战

1. **微信小程序限制**: 官方自动化工具功能有限，需要手工测试补充
2. **测试环境管理**: 需要独立的测试数据库和后端服务
3. **测试数据准备**: 需要准备多样化的测试数据
4. **团队技能**: 需要培训团队E2E测试最佳实践

---

## 10. 后续扩展

### 10.1 视觉回归测试

```javascript
// 使用@playwright/visual-comparison
test('应该与设计稿一致', async ({ page }) => {
  await page.goto('http://localhost:5173/#/pages/index/index');

  // 截图对比
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### 10.2 API测试集成

```javascript
// tests/e2e/specs/api/api-test.spec.js
const { request } = require('@playwright/test');

test('API: /api/messages 应该返回消息列表', async ({ request }) => {
  const response = await request.get('http://localhost:3001/api/messages', {
    headers: {
      'Authorization': 'Bearer valid-token'
    }
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.data).toBeInstanceOf(Array);
});
```

### 10.3 可访问性测试

```javascript
// 使用axe-core
test('应该满足可访问性标准', async ({ page }) => {
  await page.goto('http://localhost:5173/#/pages/index/index');

  const accessibilityScanResults = await scan({
    page
  });

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## 11. 总结与建议

### 11.1 核心要点

1. **技术选型**: Playwright (H5) + uni-automator (小程序)
2. **测试策略**: Smoke → Critical Path → Regression
3. **CI/CD**: GitHub Actions + PM2定时任务
4. **监控**: 错误捕获 + 自动修复 + 智能告警
5. **MVP周期**: 6周完成核心功能

### 11.2 实施建议

**第一阶段 (Week 1-2)**:
- 搭建Playwright环境
- 实现3个Smoke测试
- 配置本地运行

**第二阶段 (Week 3-4)**:
- 补充15个核心用例
- 实现测试数据管理
- 建立辅助函数库

**第三阶段 (Week 5-6)**:
- 集成CI/CD
- 实现监控告警
- 文档和培训

### 11.3 成功标准

- ✅ E2E测试覆盖核心业务流程
- ✅ CI/CD自动运行测试
- ✅ 测试失败自动通知
- ✅ 24/7监控稳定运行
- ✅ 测试通过率 > 80%

---

## 附录

### A. 相关资源

- Playwright文档: https://playwright.dev
- uni-automator文档: https://uniapp.dcloud.net.cn/api/commands/uni-automator.html
- GitHub Actions文档: https://docs.github.com/actions

### B. 测试用例模板

```javascript
// 测试用例标准模板
const { test, expect } = require('@playwright/test');

test.describe('功能模块名称', () => {
  test.beforeEach(async ({ page }) => {
    // 前置条件
    await page.goto('/');
    await login(page);
  });

  test('测试用例名称_预期结果', async ({ page }) => {
    // Arrange (准备)
    const testData = { /* ... */ };

    // Act (执行)
    await page.click('[data-testid="button"]');
    await page.fill('[data-testid="input"]', testData.value);

    // Assert (断言)
    await expect(page.locator('[data-testid="result"]'))
      .toHaveText('expected value');
  });
});
```

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-26
**维护者**: AITY VIP 开发团队
