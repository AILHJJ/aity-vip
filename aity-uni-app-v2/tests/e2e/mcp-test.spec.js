// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('AITY VIP 系统MCP测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');
  });

  test('01 - 首页加载测试', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证标题
    await expect(page).toHaveTitle(/投研图灵室/);

    console.log('✅ 首页加载成功');
  });

  test('02 - 登录功能测试', async ({ page }) => {
    // 访问登录页
    await page.goto('http://localhost:5173/#/pages/login/login');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 填写登录信息
    const emailInput = page.locator('input[type="text"], input[placeholder*="邮箱"], input[placeholder*="账号"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('admin@example.com');
      console.log('✅ 填写邮箱成功');
    }

    if (await passwordInput.count() > 0) {
      await passwordInput.fill('admin123');
      console.log('✅ 填写密码成功');
    }

    // 点击登录按钮
    const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');
    if (await loginButton.count() > 0) {
      await loginButton.click();
      console.log('✅ 点击登录按钮');

      // 等待登录响应
      await page.waitForTimeout(2000);
    }

    // 截图
    await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });
  });

  test('03 - 后端API健康检查', async ({ page }) => {
    // 测试后端API
    const response = await page.request.get('http://localhost:3001/api/health');

    expect(response.ok()).toBeTruthy();

    const health = await response.json();
    expect(health.status).toBe('ok');

    console.log('✅ 后端API健康检查通过:', health);
  });

  test('04 - 用户注册API测试', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'Test123456'
    };

    const response = await page.request.post('http://localhost:3001/api/auth/register', {
      data: testUser
    });

    console.log('注册响应状态:', response.status());

    if (response.ok()) {
      const result = await response.json();
      console.log('✅ 用户注册成功:', result);
    } else {
      const error = await response.json();
      console.log('⚠️ 注册失败（可能用户已存在）:', error);
    }
  });

  test('05 - 用户登录API测试', async ({ page }) => {
    const response = await page.request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });

    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    console.log('✅ 登录成功，获取到token');

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
  });

  test('06 - 页面导航测试', async ({ page }) => {
    // 测试主要页面路由
    const routes = [
      { path: '/#/', name: '首页' },
      { path: '/#/pages/login/login', name: '登录页' }
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:5173${route.path}`);
      await page.waitForLoadState('networkidle');
      console.log(`✅ 访问${route.name}成功`);
    }
  });

  test('07 - 响应式布局测试', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
    console.log('✅ 移动端视图测试完成');

    // 测试桌面端视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/desktop-view.png', fullPage: true });
    console.log('✅ 桌面端视图测试完成');
  });
});
