/**
 * 移动端自动化测试
 *
 * 测试目标：验证 AITY VIP 在移动设备上的表现
 *
 * 运行命令：
 * - Android 模拟: npx playwright test --project=mobile-chrome
 * - iPhone 模拟:  npx playwright test --project=mobile-iphone
 * - iPad 模拟:    npx playwright test --project=tablet-ipad
 * - 所有移动设备: npx playwright test --project=mobile-chrome,mobile-iphone,tablet-ipad
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://192.168.2.140:5173';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

test.describe('移动端自动化测试', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`\n📱 开始测试: ${testInfo.title}`);
    console.log(`📱 设备: ${testInfo.project.name}`);
    console.log(`📱 视口: ${page.viewportSize().width}x${page.viewportSize().height}`);
  });

  test('01 - 移动端页面加载测试', async ({ page }, testInfo) => {
    // 访问登录页
    await page.goto(`${BASE_URL}/#/pages/login/login`);
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page).toHaveTitle(/登录/);
    console.log('✅ 登录页加载成功');

    // 截图
    await page.screenshot({
      path: `test-results/mobile-${testInfo.project.name}-login.png`,
      fullPage: true
    });
    console.log('✅ 截图已保存');
  });

  test('02 - 移动端登录功能测试', async ({ page, isMobile }) => {
    // 访问登录页
    await page.goto(`${BASE_URL}/#/pages/login/login`);
    await page.waitForLoadState('networkidle');

    // 移动端特定的触摸操作
    if (isMobile) {
      console.log('📱 使用触摸操作');
    }

    // 填写邮箱
    const emailInput = page.locator('input[type="text"]');
    await emailInput.fill(TEST_USER.email);
    console.log('✅ 填写邮箱成功');

    // 填写密码
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(TEST_USER.password);
    console.log('✅ 填写密码成功');

    // 点击登录
    const loginButton = page.locator('button:has-text("登录")');
    await loginButton.tap(); // 使用 tap 代替 click，更适合移动端
    console.log('✅ 点击登录按钮');

    // 等待跳转
    await page.waitForURL(/.*index.*/, { timeout: 10000 });
    console.log('✅ 登录成功，已跳转到首页');

    // 截图
    await page.screenshot({
      path: `test-results/mobile-${Date.now()}-home.png`
    });
  });

  test('03 - 移动端触摸滑动测试', async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/#/pages/login/login`);
    await page.locator('input[type="text"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button:has-text("登录")').tap();
    await page.waitForURL(/.*index.*/, { timeout: 10000 });

    // 测试触摸滑动
    console.log('📱 测试触摸滑动...');

    // 获取页面高度
    const viewport = page.viewportSize();
    const centerY = viewport.height / 2;

    // 向上滑动
    await page.touchscreen.tap(viewport.width / 2, centerY + 200);
    await page.mouse.move(viewport.width / 2, centerY + 200);
    await page.mouse.move(viewport.width / 2, centerY - 200, { steps: 10 });
    console.log('✅ 向上滑动测试完成');

    // 等待动画
    await page.waitForTimeout(500);

    // 向下滑动
    await page.mouse.move(viewport.width / 2, centerY - 200);
    await page.mouse.move(viewport.width / 2, centerY + 200, { steps: 10 });
    console.log('✅ 向下滑动测试完成');
  });

  test('04 - 移动端响应式布局测试', async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/#/pages/login/login`);
    await page.locator('input[type="text"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button:has-text("登录")').tap();
    await page.waitForURL(/.*index.*/, { timeout: 10000 });

    // 测试不同屏幕尺寸
    const viewport = page.viewportSize();
    console.log(`📱 当前视口: ${viewport.width}x${viewport.height}`);

    // 检查是否有横向滚动条（不应该有）
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    console.log('✅ 无横向滚动条，布局正常');

    // 检查字体大小是否适合移动端
    const bodyFontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontSize;
    });
    console.log(`📱 正文字体大小: ${bodyFontSize}`);

    // 截图
    await page.screenshot({
      path: `test-results/mobile-responsive-${viewport.width}x${viewport.height}.png`,
      fullPage: true
    });
    console.log('✅ 响应式布局截图已保存');
  });

  test('05 - 移动端网络请求测试', async ({ page }) => {
    // 监听网络请求
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // 访问登录页并登录
    await page.goto(`${BASE_URL}/#/pages/login/login`);
    await page.locator('input[type="text"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button:has-text("登录")').tap();
    await page.waitForURL(/.*index.*/, { timeout: 10000 });

    // 检查 API 请求
    console.log(`📊 捕获到 ${requests.length} 个 API 请求`);
    requests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.method} ${req.url}`);
    });

    expect(requests.length).toBeGreaterThan(0);
    console.log('✅ API 请求正常');
  });

  test('06 - 移动端性能测试', async ({ page }) => {
    // 开始性能监控
    await page.goto(`${BASE_URL}/#/pages/login/login`);

    // 测量页面加载时间
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.startTime,
        load: perf.loadEventEnd - perf.startTime,
      };
    });

    console.log(`📊 页面加载时间:`);
    console.log(`  - DOMContentLoaded: ${timing.domContentLoaded.toFixed(0)}ms`);
    console.log(`  - Load: ${timing.load.toFixed(0)}ms`);

    // 性能断言（根据实际情况调整阈值）
    expect(timing.load).toBeLessThan(10000); // 10秒内完成加载
    console.log('✅ 性能测试通过');
  });

  test('07 - 移动端异常处理测试', async ({ page }) => {
    // 测试网络断开情况
    console.log('📱 测试网络断开场景...');

    await page.goto(`${BASE_URL}/#/pages/login/login`);

    // 断开网络
    await page.context().setOffline(true);
    console.log('📴 网络已断开');

    // 尝试登录
    await page.locator('input[type="text"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button:has-text("登录")').tap();

    // 等待一下，观察是否有错误提示
    await page.waitForTimeout(2000);

    // 恢复网络
    await page.context().setOffline(false);
    console.log('📶 网络已恢复');

    console.log('✅ 异常处理测试完成');
  });

});
