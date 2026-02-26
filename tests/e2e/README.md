# E2E测试快速开始指南

本目录包含AITY VIP项目的端到端自动化测试。

## 目录结构

```
tests/e2e/
├── basic.spec.js           # 基础测试示例
├── playwright.config.js    # Playwright配置文件
├── helpers/                # 辅助函数（待创建）
│   ├── auth.js            # 认证辅助
│   ├── api-client.js      # API客户端
│   └── test-data.js       # 测试数据管理
├── specs/                 # 测试用例（待创建）
│   ├── smoke/            # 冒烟测试
│   ├── critical-path/    # 关键路径测试
│   └── regression/       # 回归测试
└── screenshots/          # 失败截图（自动生成）
```

## 快速开始

### 1. 安装依赖

```bash
# 进入前端项目目录
cd aity-uni-app-v2

# 安装Playwright
npm install -D @playwright/test

# 安装浏览器
npx playwright install --with-deps
```

### 2. 启动测试环境

**方式1: 使用本地开发服务器**

```bash
# 终端1: 启动后端
cd backend
npm run dev

# 终端2: 启动H5前端
cd aity-uni-app-v2
npm run dev:h5

# 终端3: 运行测试
cd aity-uni-app-v2
npx playwright test tests/e2e/basic.spec.js
```

**方式2: 使用已部署的服务器**

```bash
# 设置环境变量
export BASE_URL=https://aity88.online:8443

# 运行测试
npx playwright test tests/e2e/basic.spec.js
```

### 3. 运行测试命令

```bash
# 运行所有测试
npx playwright test

# 运行指定测试文件
npx playwright test tests/e2e/basic.spec.js

# 调试模式（带浏览器界面）
npx playwright test tests/e2e/basic.spec.js --debug

# UI模式（交互式测试运行器）
npx playwright test tests/e2e/basic.spec.js --ui

# 查看测试报告
npx playwright show-report

# 运行特定测试
npx playwright test -g "应该能够成功登录"

# 在指定浏览器运行
npx playwright test --project=chromium
npx playwright test --project=webkit
```

## 测试账号

测试使用以下账号（在测试数据库中）：

```
超级管理员: admin@example.com / 123456
管理员: subadmin@example.com / 123456
VIP中线: vip_mid@example.com / 123456
VIP短线: vip_short@example.com / 123456
体验用户: trial@example.com / 123456
```

## 注意事项

### 1. 添加测试标识符

为了使测试更稳定，建议在关键元素上添加 `data-testid` 属性：

```vue
<template>
  <view>
    <input
      type="email"
      data-testid="email-input"
      v-model="email"
      placeholder="邮箱"
    />
    <input
      type="password"
      data-testid="password-input"
      v-model="password"
      placeholder="密码"
    />
    <button
      data-testid="login-button"
      @click="handleLogin"
    >
      登录
    </button>
  </view>
</template>
```

### 2. 环境变量配置

创建 `.env.test` 文件：

```bash
# 测试环境配置
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3001
TEST_DB=投研图灵室_test
```

### 3. 现有测试的局限性

当前 `basic.spec.js` 使用通用选择器（如 `input[type="email"]`），这可能不够稳定。建议：

1. 在uni-app页面中添加 `data-testid` 属性
2. 使用更具体的选择器
3. 实现Page Object模式

## 下一步

### Week 1-2: 基础搭建

- [x] 创建Playwright配置
- [x] 编写基础测试示例
- [ ] 添加 data-testid 到关键页面
- [ ] 配置测试报告
- [ ] 设置CI/CD基础

### Week 3-4: 扩展测试

- [ ] 实现Smoke测试套件（5个用例）
- [ ] 实现关键路径测试（15个用例）
- [ ] 创建测试数据fixtures
- [ ] 实现辅助函数库

### Week 5-6: 高级功能

- [ ] 集成GitHub Actions
- [ ] 实现自动重试机制
- [ ] 配置Slack通知
- [ ] 实现错误监控系统

## 故障排除

### 问题1: 找不到元素

**原因**: 页面加载未完成或选择器不正确

**解决**:
```javascript
// 添加显式等待
await page.waitForSelector('.my-element', { timeout: 10000 });
```

### 问题2: 测试超时

**原因**: 网络慢或操作时间过长

**解决**:
```javascript
// 增加超时时间
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

### 问题3: 测试数据污染

**原因**: 测试间数据未清理

**解决**: 每个测试后清理数据
```javascript
test.afterEach(async ({ page }) => {
  await cleanupTestData();
});
```

## 参考资源

- [Playwright官方文档](https://playwright.dev)
- [uni-app官方文档](https://uniapp.dcloud.net.cn/)
- [项目完整E2E方案](../../docs/e2e-automation-plan.md)

## 支持

如有问题，请联系：
- 技术负责人: ___________
- 问题反馈: GitHub Issues
