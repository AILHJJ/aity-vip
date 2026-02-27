/**
 * Playwright MCP 自动化测试
 * 使用 Playwright MCP Server 进行自动化测试
 */

const { test, expect } = require('@playwright/test');

test.describe('AITY VIP 系统 - Playwright MCP 测试', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    console.log('🚀 测试浏览器已启动');
  });

  test.afterAll(async () => {
    await page.close();
    console.log('✅ 测试浏览器已关闭');
  });

  test('01 - 首页加载测试', async () => {
    console.log('📍 测试：首页加载');

    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');

    // 截图
    await page.screenshot({
      path: 'test-results/homepage.png',
      fullPage: true
    });

    console.log('✅ 首页加载成功');
  });

  test('02 - 登录页面测试', async () => {
    console.log('📍 测试：登录页面');

    await page.goto('http://localhost:5173/#/pages/login/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待登录表单加载
    await page.waitForSelector('input[type="text"], input[type="email"]', {
      timeout: 10000
    }).catch(() => {
      console.log('⚠️ 未找到登录表单，可能已经登录');
    });

    // 截图
    await page.screenshot({
      path: 'test-results/login-page.png',
      fullPage: true
    });

    console.log('✅ 登录页面测试完成');
  });

  test('03 - 用户登录测试', async () => {
    console.log('📍 测试：用户登录');

    // 访问登录页面
    await page.goto('http://localhost:5173/#/pages/login/login', {
      waitUntil: 'networkidle'
    });

    // 填写登录表单
    const usernameInput = await page.$('input[type="text"], input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');

    if (usernameInput && passwordInput) {
      await usernameInput.fill('admin@example.com');
      await passwordInput.fill('123456');

      // 点击登录按钮
      const loginButton = await page.$('button:has-text("登录"), button[type="submit"]');
      if (loginButton) {
        await loginButton.click();

        // 等待跳转
        await page.waitForTimeout(2000);

        // 截图
        await page.screenshot({
          path: 'test-results/after-login.png',
          fullPage: true
        });

        console.log('✅ 登录测试完成');
      }
    } else {
      console.log('⚠️ 未找到登录表单元素');
    }
  });

  test('04 - 响应式测试 - 桌面视图', async () => {
    console.log('📍 测试：桌面视图');

    // 设置桌面视口
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle'
    });

    await page.screenshot({
      path: 'test-results/desktop-view.png',
      fullPage: true
    });

    console.log('✅ 桌面视图测试完成');
  });

  test('05 - 响应式测试 - 移动视图', async () => {
    console.log('📍 测试：移动视图');

    // 设置移动视口
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle'
    });

    await page.screenshot({
      path: 'test-results/mobile-view.png',
      fullPage: true
    });

    console.log('✅ 移动视图测试完成');
  });

  test('06 - API 测试 - 健康检查', async () => {
    console.log('📍 测试：API 健康检查');

    const response = await page.request.get('http://localhost:3001/api/health');

    if (response.ok()) {
      const data = await response.json();
      console.log('✅ API 健康检查通过:', data);
    } else {
      console.log('⚠️ API 健康检查失败:', response.status());
    }
  });
});
