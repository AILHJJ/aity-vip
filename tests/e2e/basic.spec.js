/**
 * AITY VIP - E2E测试基础示例
 *
 * 这是一个基础的Playwright E2E测试示例，展示如何测试H5版本的核心功能
 *
 * 运行方式:
 * 1. 安装依赖: cd aity-uni-app-v2 && npm install -D @playwright/test
 * 2. 安装浏览器: npx playwright install --with-deps
 * 3. 启动H5开发服务器: npm run dev:h5
 * 4. 运行测试: npx playwright tests/e2e/basic.spec.js
 *
 * 文档: D:\your-mcp-proxy\AITY_VIP\docs\e2e-automation-plan.md
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: '123456',
    name: '超级管理员'
  },
  vip_mid: {
    email: 'vip_mid@example.com',
    password: '123456',
    name: 'VIP中线用户'
  }
};

// ========================
// 辅助函数
// ========================

/**
 * 登录辅助函数
 */
async function login(page, userKey = 'admin') {
  const user = TEST_USERS[userKey];

  // 导航到登录页
  await page.goto(`${BASE_URL}/#/pages/login/login`);

  // 等待页面加载
  await page.waitForLoadState('networkidle');

  // 填写登录表单
  // 注意: 需要在uni-app页面中添加data-testid属性以便于测试
  const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"], input[placeholder*="账号"]');
  await emailInput.fill(user.email);

  const passwordInput = page.locator('input[type="password"], input[placeholder*="密码"]');
  await passwordInput.fill(user.password);

  // 点击登录按钮
  const loginButton = page.locator('button:has-text("登录"), button:has-text("Login"), .login-btn');
  await loginButton.click();

  // 等待登录成功 - 应该跳转到首页
  await page.waitForURL(/.*\/pages\/index\/index/, { timeout: 10000 });
}

/**
 * 等待并检查toast消息
 */
async function checkToast(page, expectedText) {
  const toast = page.locator('.uni-toast, .toast, [class*="toast"]').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(expectedText);
}

// ========================
// 测试套件: 页面加载
// ========================

test.describe('AITY VIP - 页面加载测试', () => {

  test('应该能够访问H5首页', async ({ page }) => {
    await page.goto(BASE_URL);

    // 检查页面标题
    await expect(page).toHaveTitle(/AITY VIP|图灵AI/);

    // 检查是否加载成功
    const url = page.url();
    expect(url).toContain('localhost:5173');
  });

  test('应该显示登录页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/pages/login/login`);

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查登录表单元素
    const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });
});

// ========================
// 测试套件: 用户登录
// ========================

test.describe('AITY VIP - 用户登录测试', () => {

  test('管理员用户应该能够成功登录', async ({ page }) => {
    await login(page, 'admin');

    // 验证登录成功 - 检查用户信息显示
    const userAvatar = page.locator('.user-avatar, [class*="avatar"], img[alt*="头像"]');
    await expect(userAvatar.first()).toBeVisible({ timeout: 10000 });
  });

  test('普通VIP用户应该能够成功登录', async ({ page }) => {
    await login(page, 'vip_mid');

    // 验证登录成功
    const currentUrl = page.url();
    expect(currentUrl).toContain('/pages/index/index');
  });

  test('错误的密码应该显示错误提示', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/pages/login/login`);

    // 输入错误凭证
    const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"]');
    await emailInput.fill(TEST_USERS.admin.email);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');

    // 点击登录
    const loginButton = page.locator('button:has-text("登录"), button');
    await loginButton.click();

    // 验证错误提示 - 可能是toast或者inline message
    const errorMessage = page.locator('.uni-toast, .error-message, [class*="error"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('登录后刷新页面应该保持登录状态', async ({ page }) => {
    await login(page, 'admin');

    // 刷新页面
    await page.reload();

    // 验证仍然在首页（没有跳转回登录页）
    await page.waitForURL(/.*\/pages\/index\/index/);
    const currentUrl = page.url();
    expect(currentUrl).toContain('index');
  });
});

// ========================
// 测试套件: 消息列表
// ========================

test.describe('AITY VIP - 消息列表测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
  });

  test('应该显示消息列表', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForLoadState('networkidle');

    // 检查消息列表容器
    const messageList = page.locator('.message-list, [class*="message-list"], .list').first();
    await expect(messageList).toBeVisible();

    // 检查是否有消息项（至少应该有容器）
    const messageItems = page.locator('.message-item, [class*="message-item"], .list-item');
    const count = await messageItems.count();

    console.log(`找到 ${count} 条消息`);

    // 如果有消息，验证第一条消息的结构
    if (count > 0) {
      const firstMessage = messageItems.first();
      await expect(firstMessage).toBeVisible();
    }
  });

  test('应该能够下拉刷新消息列表', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 获取初始消息数量
    const messageItems = page.locator('.message-item, [class*="message-item"]');
    const initialCount = await messageItems.count();

    // 执行下拉刷新（uni-app的下拉刷新）
    // 注意: 实际实现可能需要根据具体页面结构调整
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    const listElement = page.locator('.message-list, .list, [class*="scroll"]').first();
    await listElement.click(); // 聚焦
    await page.mouse.wheel(0, -500); // 向下滚动

    // 等待刷新完成
    await page.waitForTimeout(2000);

    // 验证列表仍然存在
    await expect(messageItems.first()).toBeVisible();
  });

  test('应该能够点击消息查看详情', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 等待消息加载
    await page.waitForTimeout(1000);

    const messageItems = page.locator('.message-item, [class*="message-item"], .list-item');
    const count = await messageItems.count();

    if (count > 0) {
      const firstMessage = messageItems.first();

      // 点击第一条消息
      await firstMessage.click();

      // 验证跳转到详情页
      await page.waitForURL(/.*\/pages\/message-detail\/message-detail/, { timeout: 5000 });

      const currentUrl = page.url();
      expect(currentUrl).toContain('message-detail');
    } else {
      console.log('没有可用的消息进行测试');
      test.skip();
    }
  });
});

// ========================
// 测试套件: 消息发布
// ========================

test.describe('AITY VIP - 消息发布测试', () => {
  beforeEach(async ({ page }) => {
    await login(page, 'admin');
  });

  test('应该能够导航到发布页面', async ({ page }) => {
    // 查找发布按钮（可能是fab按钮或者导航栏按钮）
    const publishButton = page.locator(
      'button:has-text("发布"), button:has-text("发布消息"), ' +
      '.fab, .publish-btn, [class*="publish"], [class*="fab"]'
    ).first();

    if (await publishButton.isVisible({ timeout: 5000 })) {
      await publishButton.click();

      // 验证跳转到发布页面
      await page.waitForURL(/.*\/pages\/message-publish\/message-publish/, { timeout: 5000 });

      const currentUrl = page.url();
      expect(currentUrl).toContain('message-publish');
    } else {
      console.log('未找到发布按钮');
      test.skip();
    }
  });

  test('发布页面应该包含必要的表单元素', async ({ page }) => {
    // 导航到发布页面
    await page.goto(`${BASE_URL}/#/pages/message-publish/message-publish`);
    await page.waitForLoadState('networkidle');

    // 检查表单元素
    const titleInput = page.locator('input[placeholder*="标题"], textarea[placeholder*="标题"], .title-input');
    const contentInput = page.locator('textarea[placeholder*="内容"], .content-input, [contenteditable="true"]');
    const submitButton = page.locator('button:has-text("发布"), button:has-text("提交"), .submit-btn');

    await expect(titleInput.first()).toBeVisible();
    await expect(contentInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
  });

  test('应该能够填写并提交表单（不实际发布）', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/pages/message-publish/message-publish`);
    await page.waitForLoadState('networkidle');

    // 填写标题
    const titleInput = page.locator('input[placeholder*="标题"], .title-input').first();
    await titleInput.fill('[E2E测试] 这是一个测试消息标题');

    // 填写内容
    const contentInput = page.locator('textarea[placeholder*="内容"], .content-input').first();
    if (await contentInput.isVisible()) {
      await contentInput.fill('[E2E测试] 这是测试消息内容');
    }

    // 注意: 这里我们只是验证表单可以填写，不实际提交
    // 实际提交可能会创建真实数据

    // 验证填写成功
    await expect(titleInput).toHaveValue(/\[E2E测试\]/);
  });
});

// ========================
// 测试套件: API连接测试
// ========================

test.describe('AITY VIP - API连接测试', () => {

  test('应该能够成功连接后端API', async ({ page }) => {
    // 监听网络请求
    const apiRequests = [];

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    await login(page, 'admin');

    // 等待API请求完成
    await page.waitForLoadState('networkidle');

    console.log('捕获到的API请求:', apiRequests);

    // 验证至少有一个API请求
    expect(apiRequests.length).toBeGreaterThan(0);

    // 验证登录API被调用
    const hasLoginRequest = apiRequests.some(req =>
      req.url.includes('/login') || req.url.includes('/auth')
    );
    expect(hasLoginRequest).toBeTruthy();
  });

  test('API响应时间应该在合理范围内', async ({ page }) => {
    const apiResponseTimes = [];

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const timing = response.timing();
        const responseTime = timing.responseEnd;
        apiResponseTimes.push({
          url: response.url(),
          time: responseTime
        });
      }
    });

    await login(page, 'admin');
    await page.waitForLoadState('networkidle');

    // 输出API响应时间
    console.log('API响应时间统计:');
    apiResponseTimes.forEach(({ url, time }) => {
      console.log(`${url}: ${time}ms`);
    });

    // 验证所有API响应时间都在5秒以内
    apiResponseTimes.forEach(({ url, time }) => {
      expect(time).toBeLessThan(5000);
    });
  });
});

// ========================
// 测试套件: 响应式设计
// ========================

test.describe('AITY VIP - 响应式设计测试', () => {

  test('应该在移动设备上正常显示', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await login(page, 'admin');

    // 检查移动端元素是否正常显示
    const mainContainer = page.locator('body, .container, #app');
    await expect(mainContainer).toBeVisible();
  });

  test('应该在桌面设备上正常显示', async ({ page }) => {
    // 设置桌面视口
    await page.setViewportSize({ width: 1920, height: 1080 });

    await login(page, 'admin');

    // 检查桌面端元素
    const mainContainer = page.locator('body, .container, #app');
    await expect(mainContainer).toBeVisible();
  });
});

// ========================
// 测试套件: 错误处理
// ========================

test.describe('AITY VIP - 错误处理测试', () => {

  test('应该优雅处理网络错误', async ({ page }) => {
    // 模拟网络离线
    await page.context().setOffline(true);

    await page.goto(`${BASE_URL}/#/pages/login/login`);

    // 尝试登录
    const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"]');
    await emailInput.fill(TEST_USERS.admin.email);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(TEST_USERS.admin.password);

    const loginButton = page.locator('button');
    await loginButton.click();

    // 等待错误提示
    await page.waitForTimeout(2000);

    // 恢复网络
    await page.context().setOffline(false);

    // 验证页面没有崩溃
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('不应该在控制台中有JavaScript错误', async ({ page }) => {
    const jsErrors = [];

    page.on('pageerror', error => {
      jsErrors.push(error.toString());
    });

    await login(page, 'admin');

    // 等待页面稳定
    await page.waitForTimeout(3000);

    // 输出所有JS错误
    if (jsErrors.length > 0) {
      console.log('检测到JavaScript错误:', jsErrors);
    }

    // 验证没有严重的JS错误（可以有一些非关键错误）
    const criticalErrors = jsErrors.filter(err =>
      err.includes('Uncaught') || err.includes('TypeError')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

// ========================
// 全局钩子
// ========================

test.afterEach(async ({ page }) => {
  // 每个测试后截图（如果测试失败）
  if (test.info().status !== 'passed') {
    const screenshotName = `${test.info().title.replace(/\s+/g, '_')}.png`;
    await page.screenshot({
      path: `tests/e2e/screenshots/${screenshotName}`,
      fullPage: true
    });
  }
});
