# E2E测试快速实施指南

本文档提供AITY VIP项目E2E测试的快速实施步骤。

## 预估时间: 6周

---

## Week 1-2: 基础搭建 ✅ 已完成

### 任务清单

- [x] 创建E2E测试方案文档
- [x] 创建基础测试示例 (basic.spec.js)
- [x] 创建Playwright配置文件
- [x] 创建GitHub Actions工作流
- [ ] 在关键页面添加 data-testid 属性
- [ ] 本地运行测试验证

### 本周任务

#### 1. 添加测试标识符到页面

修改以下关键页面，添加 `data-testid` 属性：

**优先级 P0**:
- [ ] 登录页面 (pages/login/login.vue)
- [ ] 首页 (pages/index/index.vue)
- [ ] 消息发布页 (pages/message-publish/message-publish.vue)
- [ ] 消息详情页 (pages/message-detail/message-detail.vue)

**优先级 P1**:
- [ ] 讨论列表页
- [ ] 讨论详情页
- [ ] 用户管理页

**示例修改**:

```vue
<!-- pages/login/login.vue -->
<template>
  <view class="login-page">
    <input
      type="email"
      data-testid="email-input"
      v-model="formData.email"
      placeholder="请输入邮箱"
    />
    <input
      type="password"
      data-testid="password-input"
      v-model="formData.password"
      placeholder="请输入密码"
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

#### 2. 安装依赖

```bash
cd aity-uni-app-v2
npm install -D @playwright/test
npx playwright install --with-deps
```

#### 3. 本地验证测试

```bash
# 终端1: 启动后端
cd backend
npm run dev

# 终端2: 启动H5前端
cd aity-uni-app-v2
npm run dev:h5

# 终端3: 运行测试
cd aity-uni-app-v2
npx playwright test tests/e2e/basic.spec.js --ui
```

#### 4. 更新测试用例

将 `basic.spec.js` 中的通用选择器替换为 `data-testid`:

```javascript
// 修改前
const emailInput = page.locator('input[type="email"]');

// 修改后
const emailInput = page.locator('[data-testid="email-input"]');
```

---

## Week 3-4: 扩展测试用例

### 任务清单

- [ ] 创建Smoke测试套件 (5个用例)
- [ ] 创建关键路径测试套件 (15个用例)
- [ ] 创建测试数据fixtures
- [ ] 实现辅助函数库

### Smoke测试用例 (5个)

1. [ ] 用户登录测试
2. [ ] 首页加载测试
3. [ ] API连接测试
4. [ ] 消息列表加载测试
5. [ ] 基础导航测试

### 关键路径测试用例 (15个)

**消息模块** (5个):
- [ ] 发布文本消息
- [ ] 发布带图片的消息
- [ ] 消息搜索功能
- [ ] 消息筛选功能
- [ ] 消息详情查看

**讨论模块** (4个):
- [ ] 创建讨论
- [ ] 回复讨论
- [ ] 公开/私密讨论切换
- [ ] 讨论列表筛选

**用户管理** (3个):
- [ ] 创建用户
- [ ] 编辑用户
- [ ] 删除用户

**其他** (3个):
- [ ] 用户登出
- [ ] 个人信息修改
- [ ] 图片上传功能

### 文件结构

```
tests/e2e/
├── specs/
│   ├── smoke/
│   │   ├── login.spec.js
│   │   ├── homepage.spec.js
│   │   ├── api-connectivity.spec.js
│   │   ├── message-list.spec.js
│   │   └── navigation.spec.js
│   └── critical-path/
│       ├── message-publish.spec.js
│       ├── message-detail.spec.js
│       ├── discussion-create.spec.js
│       └── user-management.spec.js
├── helpers/
│   ├── auth.js
│   ├── api-client.js
│   └── test-data.js
└── fixtures/
    ├── users.json
    └── messages.json
```

---

## Week 5: CI/CD集成

### 任务清单

- [ ] 配置GitHub Actions secrets
- [ ] 测试CI工作流
- [ ] 配置测试报告展示
- [ ] 设置失败通知

### 配置步骤

#### 1. 添加GitHub Secrets

在GitHub仓库设置中添加以下secrets:

```
SLACK_WEBHOOK_URL       # Slack通知webhook
NOTIFICATION_EMAIL      # 失败通知邮箱
EMAIL_USERNAME          # 邮箱用户名
EMAIL_PASSWORD          # 邮箱密码
```

#### 2. 测试工作流

```bash
# 推送代码触发CI
git add .
git commit -m "test: 添加E2E测试配置"
git push origin feature/iteration-1

# 检查GitHub Actions运行状态
# 访问: https://github.com/your-org/AITY_VIP/actions
```

#### 3. 查看测试报告

测试完成后，从GitHub Actions artifacts下载HTML报告，本地查看:

```bash
unzip e2e-report-*.zip
cd tests/e2e/reports/html
python -m http.server 8000
# 浏览器访问: http://localhost:8000
```

---

## Week 6: 监控与优化

### 任务清单

- [ ] 实现错误捕获机制
- [ ] 实现自动重试逻辑
- [ ] 配置定时监控任务
- [ ] 优化测试稳定性

### 监控指标

- 测试通过率 > 80%
- 测试执行时间 < 10分钟
- 假阳性率 < 10%

### 优化策略

1. **并行执行**: 使用多个worker并行运行测试
2. **测试分组**: 按优先级分组执行
3. **缓存优化**: 缓存依赖和构建结果
4. **选择性运行**: PR时只运行smoke测试

---

## 常见问题解决

### 问题1: 测试超时

**症状**: 测试在某个步骤超时失败

**解决方案**:
```javascript
// 增加特定测试的超时时间
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2分钟
  // ...
});
```

### 问题2: 元素找不到

**症状**: `TimeoutError: Element not found`

**解决方案**:
```javascript
// 1. 添加显式等待
await page.waitForSelector('[data-testid="my-element"]', {
  timeout: 10000
});

// 2. 检查元素是否存在
const element = page.locator('[data-testid="my-element"]');
if (await element.count() > 0) {
  await element.click();
}
```

### 问题3: 测试数据污染

**症状**: 测试间互相影响

**解决方案**:
```javascript
// 每个测试前清理数据
test.beforeEach(async ({ page }) => {
  await cleanupTestData();
});

// 使用唯一的测试数据
const uniqueId = Date.now();
await page.fill('[data-testid="title"]', `测试标题_${uniqueId}`);
```

### 问题4: CI环境失败但本地通过

**症状**: 本地测试通过，CI失败

**常见原因**:
1. 环境变量未配置
2. 依赖未正确安装
3. 网络问题
4. 时区问题

**解决方案**:
```yaml
# GitHub Actions中添加调试步骤
- name: Debug environment
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Environment variables:"
    env | sort
```

---

## 成功标准

### Week 1-2
- [x] 基础配置完成
- [ ] 至少3个测试本地通过
- [ ] 测试文档完善

### Week 3-4
- [ ] 20个测试用例实现
- [ ] 测试通过率 > 90%
- [ ] 测试数据管理完善

### Week 5
- [ ] CI/CD集成完成
- [ ] 测试自动运行
- [ ] 失败通知配置

### Week 6
- [ ] 24/7监控运行
- [ ] 自动修复机制实现
- [ ] 测试报告可视化

---

## 下一步行动

### 本周必须完成

1. ✅ 查看完整的E2E方案文档
2. ⬜ 在关键页面添加 data-testid
3. ⬜ 安装Playwright依赖
4. ⬜ 本地运行基础测试

### 下周准备

1. 创建Smoke测试套件
2. 实现测试辅助函数
3. 准备测试数据fixtures

---

## 参考资源

- [完整E2E方案](../../docs/e2e-automation-plan.md)
- [Playwright官方文档](https://playwright.dev)
- [uni-app测试指南](https://uniapp.dcloud.net.cn/api/commands/uni-automator.html)
- [GitHub Actions文档](https://docs.github.com/actions)

---

**最后更新**: 2026-02-26
**当前进度**: Week 1-2 (基础搭建阶段)
