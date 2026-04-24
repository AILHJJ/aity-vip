/**
 * AITY VIP 完整自动化测试
 *
 * 测试范围：
 * 1. 登录功能
 * 2. 首页/消息列表
 * 3. 消息详情
 * 4. 讨论功能
 * 5. 收藏功能
 * 6. 个人中心
 * 7. 用户管理（管理员）
 * 8. AI投顾
 * 9. 行情中心
 *
 * 运行命令：
 * BASE_URL=http://localhost:5174 npx playwright test aity-full-test.spec.js --project=chromium
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';
const CHROME_PATH = 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe';

// 测试账号
const TEST_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: '123456',
    email: 'admin@example.com'
  },
  vip_user: {
    username: '等风来',
    password: '112044',
    email: '625668823@qq.com'
  }
};

// 测试结果收集
const testResults = {
  passed: [],
  failed: [],
  screenshots: [],
  startTime: null,
  endTime: null
};

// 辅助函数：登录
async function login(page, account = TEST_ACCOUNTS.admin) {
  console.log(`🔐 尝试登录: ${account.username}`);

  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await page.waitForLoadState('networkidle');

  // 查找输入框
  const usernameInput = page.locator('input[type="text"], input[placeholder*="邮箱"], input[placeholder*="账号"], input[placeholder*="用户名"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const loginButton = page.locator('button:has-text("登录")').first();

  // 填写登录信息
  await usernameInput.fill(account.email || account.username);
  await passwordInput.fill(account.password);

  // 点击登录
  await loginButton.click();

  // 等待跳转
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  console.log(`📍 登录后URL: ${currentUrl}`);

  return !currentUrl.includes('login');
}

// 辅助函数：截图
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const path = `test-results/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  testResults.screenshots.push({ name, path });
  console.log(`📸 截图已保存: ${path}`);
}

test.describe('AITY VIP 完整功能测试', () => {

  test.beforeAll(async () => {
    testResults.startTime = new Date();
    console.log('\n' + '='.repeat(60));
    console.log('🚀 AITY VIP 自动化测试开始');
    console.log(`📅 开始时间: ${testResults.startTime.toLocaleString()}`);
    console.log(`🌐 测试地址: ${BASE_URL}`);
    console.log('='.repeat(60) + '\n');
  });

  test.afterAll(async () => {
    testResults.endTime = new Date();
    const duration = (testResults.endTime - testResults.startTime) / 1000;

    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果汇总');
    console.log('='.repeat(60));
    console.log(`✅ 通过: ${testResults.passed.length}`);
    console.log(`❌ 失败: ${testResults.failed.length}`);
    console.log(`⏱️ 总耗时: ${duration.toFixed(2)}秒`);
    console.log(`📸 截图数: ${testResults.screenshots.length}`);
    console.log('='.repeat(60) + '\n');
  });

  // ============================================
  // 1. 登录功能测试
  // ============================================
  test.describe('1️⃣ 登录功能', () => {

    test('1.1 登录页面加载', async ({ page }) => {
      const testName = '登录页面加载';
      try {
        await page.goto(`${BASE_URL}/#/pages/login/login`);
        await page.waitForLoadState('networkidle');

        // 验证页面元素
        const title = await page.title();
        console.log(`📄 页面标题: ${title}`);

        await takeScreenshot(page, '01-login-page');

        // 检查登录表单元素
        const hasUsernameInput = await page.locator('input[type="text"], input[placeholder*="邮箱"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
        const hasLoginButton = await page.locator('button:has-text("登录")').count() > 0;

        expect(hasUsernameInput).toBeTruthy();
        expect(hasPasswordInput).toBeTruthy();
        expect(hasLoginButton).toBeTruthy();

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });

    test('1.2 管理员登录', async ({ page }) => {
      const testName = '管理员登录';
      try {
        const loginSuccess = await login(page, TEST_ACCOUNTS.admin);
        await takeScreenshot(page, '02-admin-login');

        expect(loginSuccess).toBeTruthy();
        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });

    test('1.3 VIP用户登录', async ({ page }) => {
      const testName = 'VIP用户登录';
      try {
        const loginSuccess = await login(page, TEST_ACCOUNTS.vip_user);
        await takeScreenshot(page, '03-vip-login');

        expect(loginSuccess).toBeTruthy();
        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 2. 首页/消息列表测试
  // ============================================
  test.describe('2️⃣ 首页/消息列表', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('2.1 首页加载', async ({ page }) => {
      const testName = '首页加载';
      try {
        await page.goto(`${BASE_URL}/#/pages/index/index`);
        await page.waitForLoadState('networkidle');
        await takeScreenshot(page, '04-index-page');

        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy();

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });

    test('2.2 消息列表显示', async ({ page }) => {
      const testName = '消息列表显示';
      try {
        await page.goto(`${BASE_URL}/#/pages/index/index`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '05-message-list');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 3. 消息详情测试
  // ============================================
  test.describe('3️⃣ 消息详情', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('3.1 消息详情页加载', async ({ page }) => {
      const testName = '消息详情页加载';
      try {
        await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '06-message-detail');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 4. 讨论功能测试
  // ============================================
  test.describe('4️⃣ 讨论功能', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('4.1 讨论列表页', async ({ page }) => {
      const testName = '讨论列表页';
      try {
        await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '07-discussions');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 5. 收藏功能测试
  // ============================================
  test.describe('5️⃣ 收藏功能', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('5.1 收藏页面', async ({ page }) => {
      const testName = '收藏页面';
      try {
        await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '08-favorites');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 6. 个人中心测试
  // ============================================
  test.describe('6️⃣ 个人中心', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('6.1 个人中心页面', async ({ page }) => {
      const testName = '个人中心页面';
      try {
        await page.goto(`${BASE_URL}/#/pages/profile/profile`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '09-profile');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 7. 用户管理测试（管理员）
  // ============================================
  test.describe('7️⃣ 用户管理', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('7.1 用户管理页面', async ({ page }) => {
      const testName = '用户管理页面';
      try {
        await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '10-user-management');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 8. AI投顾测试
  // ============================================
  test.describe('8️⃣ AI投顾', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('8.1 AI投顾页面', async ({ page }) => {
      const testName = 'AI投顾页面';
      try {
        await page.goto(`${BASE_URL}/#/pages/ai-advisor/ai-advisor`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '11-ai-advisor');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 9. 行情中心测试
  // ============================================
  test.describe('9️⃣ 行情中心', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, TEST_ACCOUNTS.admin);
    });

    test('9.1 行情中心页面', async ({ page }) => {
      const testName = '行情中心页面';
      try {
        await page.goto(`${BASE_URL}/#/pages/market/market`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, '12-market');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });

  // ============================================
  // 10. 综合流程测试
  // ============================================
  test.describe('🔟 综合流程', () => {

    test('10.1 完整用户流程', async ({ page }) => {
      const testName = '完整用户流程';
      try {
        // 1. 登录
        await login(page, TEST_ACCOUNTS.admin);
        console.log('  ✓ 登录成功');

        // 2. 访问首页
        await page.goto(`${BASE_URL}/#/pages/index/index`);
        await page.waitForLoadState('networkidle');
        console.log('  ✓ 访问首页');

        // 3. 访问消息列表
        await page.goto(`${BASE_URL}/#/pages/messages/messages`);
        await page.waitForLoadState('networkidle');
        console.log('  ✓ 访问消息列表');

        // 4. 访问讨论区
        await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
        await page.waitForLoadState('networkidle');
        console.log('  ✓ 访问讨论区');

        // 5. 访问个人中心
        await page.goto(`${BASE_URL}/#/pages/profile/profile`);
        await page.waitForLoadState('networkidle');
        console.log('  ✓ 访问个人中心');

        await takeScreenshot(page, '13-full-flow');

        testResults.passed.push(testName);
        console.log(`✅ ${testName} - 通过`);
      } catch (error) {
        testResults.failed.push({ name: testName, error: error.message });
        console.log(`❌ ${testName} - 失败: ${error.message}`);
        throw error;
      }
    });
  });
});
