/**
 * AITY VIP 自动化测试脚本
 *
 * 使用方法: node run-automation-test.js
 *
 * 功能:
 * - 登录测试
 * - 首页/消息列表测试
 * - 讨论功能测试
 * - 收藏功能测试
 * - 个人中心测试
 * - 用户管理测试
 * - AI投顾测试
 * - 行情中心测试
 * - 自动截图和录屏
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:5174',
  CHROME_PATH: 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe',
  VIDEO_DIR: path.join(__dirname, 'test-results/videos'),
  SCREENSHOT_DIR: path.join(__dirname, 'test-results/screenshots'),
  HEADLESS: false,
  SLOW_MO: 100
};

// 测试账号
const TEST_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: '123456',
    email: 'admin@example.com'
  }
};

// 测试结果
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
  startTime: null,
  endTime: null
};

// 创建目录
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 截图
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filePath = path.join(CONFIG.SCREENSHOT_DIR, `${name}-${timestamp}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 截图: ${filePath}`);
  return filePath;
}

// 记录测试结果
function logTest(name, passed, error = null) {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`  ✅ ${name}`);
  } else {
    results.failed++;
    console.log(`  ❌ ${name}: ${error}`);
  }
  results.tests.push({ name, passed, error });
}

// 登录函数
async function login(page, account = TEST_ACCOUNTS.admin) {
  console.log(`  🔐 登录: ${account.username}`);

  await page.goto(`${CONFIG.BASE_URL}/#/pages/login/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 查找输入框
  const usernameInput = page.locator('input[type="text"], input[placeholder*="邮箱"], input[placeholder*="账号"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const loginButton = page.locator('button:has-text("登录")').first();

  // 填写登录信息
  await usernameInput.fill(account.email);
  await passwordInput.fill(account.password);

  // 点击登录
  await loginButton.click();
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  return !currentUrl.includes('login');
}

// 主测试函数
async function runTests() {
  results.startTime = new Date();

  console.log('\n' + '='.repeat(60));
  console.log('🚀 AITY VIP 自动化测试');
  console.log('='.repeat(60));
  console.log(`📅 开始时间: ${results.startTime.toLocaleString()}`);
  console.log(`🌐 测试地址: ${CONFIG.BASE_URL}`);
  console.log(`🎬 Chrome路径: ${CONFIG.CHROME_PATH}`);
  console.log('='.repeat(60) + '\n');

  // 确保目录存在
  ensureDir(CONFIG.VIDEO_DIR);
  ensureDir(CONFIG.SCREENSHOT_DIR);

  let browser, context, page;

  try {
    // 启动浏览器
    console.log('🚀 启动浏览器...');
    browser = await chromium.launch({
      headless: CONFIG.HEADLESS,
      slowMo: CONFIG.SLOW_MO,
      executablePath: CONFIG.CHROME_PATH
    });

    // 创建带录屏的上下文
    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: CONFIG.VIDEO_DIR, size: { width: 1280, height: 800 } }
    });

    page = await context.newPage();
    console.log('✅ 浏览器启动成功\n');

    // ============================================
    // 测试 1: 登录页面
    // ============================================
    console.log('📝 测试 1: 登录页面');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, '01-login-page');

      const hasUsernameInput = await page.locator('input[type="text"]').count() > 0;
      const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
      const hasLoginButton = await page.locator('button:has-text("登录")').count() > 0;

      if (hasUsernameInput && hasPasswordInput && hasLoginButton) {
        logTest('登录页面元素检查', true);
      } else {
        logTest('登录页面元素检查', false, '缺少必要元素');
      }
    } catch (e) {
      logTest('登录页面加载', false, e.message);
    }

    // ============================================
    // 测试 2: 管理员登录
    // ============================================
    console.log('\n📝 测试 2: 管理员登录');
    try {
      const loginSuccess = await login(page);
      await takeScreenshot(page, '02-admin-login');
      logTest('管理员登录', loginSuccess, loginSuccess ? null : '登录失败');
    } catch (e) {
      logTest('管理员登录', false, e.message);
    }

    // ============================================
    // 测试 3: 首页
    // ============================================
    console.log('\n📝 测试 3: 首页');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '03-index-page');
      logTest('首页加载', true);
    } catch (e) {
      logTest('首页加载', false, e.message);
    }

    // ============================================
    // 测试 4: 消息列表
    // ============================================
    console.log('\n📝 测试 4: 消息列表');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '04-messages');
      logTest('消息列表页', true);
    } catch (e) {
      logTest('消息列表页', false, e.message);
    }

    // ============================================
    // 测试 5: 消息详情
    // ============================================
    console.log('\n📝 测试 5: 消息详情');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '05-message-detail');
      logTest('消息详情页', true);
    } catch (e) {
      logTest('消息详情页', false, e.message);
    }

    // ============================================
    // 测试 6: 讨论列表
    // ============================================
    console.log('\n📝 测试 6: 讨论列表');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '06-discussions');
      logTest('讨论列表页', true);
    } catch (e) {
      logTest('讨论列表页', false, e.message);
    }

    // ============================================
    // 测试 7: 收藏页面
    // ============================================
    console.log('\n📝 测试 7: 收藏页面');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '07-favorites');
      logTest('收藏页面', true);
    } catch (e) {
      logTest('收藏页面', false, e.message);
    }

    // ============================================
    // 测试 8: 个人中心
    // ============================================
    console.log('\n📝 测试 8: 个人中心');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '08-profile');
      logTest('个人中心页', true);
    } catch (e) {
      logTest('个人中心页', false, e.message);
    }

    // ============================================
    // 测试 9: 用户管理
    // ============================================
    console.log('\n📝 测试 9: 用户管理');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '09-user-management');
      logTest('用户管理页', true);
    } catch (e) {
      logTest('用户管理页', false, e.message);
    }

    // ============================================
    // 测试 10: AI投顾
    // ============================================
    console.log('\n📝 测试 10: AI投顾');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/ai-advisor/ai-advisor`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '10-ai-advisor');
      logTest('AI投顾页', true);
    } catch (e) {
      logTest('AI投顾页', false, e.message);
    }

    // ============================================
    // 测试 11: 行情中心
    // ============================================
    console.log('\n📝 测试 11: 行情中心');
    try {
      await page.goto(`${CONFIG.BASE_URL}/#/pages/market/market`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '11-market');
      logTest('行情中心页', true);
    } catch (e) {
      logTest('行情中心页', false, e.message);
    }

    // ============================================
    // 测试 12: 完整流程
    // ============================================
    console.log('\n📝 测试 12: 完整流程');
    try {
      // 重新登录
      await login(page);

      // 访问各页面
      const pages = [
        '/#/pages/index/index',
        '/#/pages/messages/messages',
        '/#/pages/discussions/discussions',
        '/#/pages/favorites/favorites',
        '/#/pages/profile/profile'
      ];

      for (const pagePath of pages) {
        await page.goto(`${CONFIG.BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      }

      await takeScreenshot(page, '12-full-flow');
      logTest('完整用户流程', true);
    } catch (e) {
      logTest('完整用户流程', false, e.message);
    }

  } catch (error) {
    console.error('❌ 测试执行出错:', error.message);
  } finally {
    // 关闭上下文和浏览器
    if (context) {
      await context.close();
    }
    if (browser) {
      await browser.close();
    }

    results.endTime = new Date();
    const duration = (results.endTime - results.startTime) / 1000;

    // 输出测试报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果汇总');
    console.log('='.repeat(60));
    console.log(`✅ 通过: ${results.passed}/${results.total}`);
    console.log(`❌ 失败: ${results.failed}/${results.total}`);
    console.log(`⏱️ 耗时: ${duration.toFixed(2)}秒`);
    console.log(`📸 截图目录: ${CONFIG.SCREENSHOT_DIR}`);
    console.log(`🎬 视频目录: ${CONFIG.VIDEO_DIR}`);
    console.log('='.repeat(60));

    // 保存测试报告
    const reportPath = path.join(__dirname, 'test-results/test-report.json');
    const report = {
      ...results,
      duration: `${duration.toFixed(2)}秒`,
      startTime: results.startTime.toISOString(),
      endTime: results.endTime.toISOString(),
      config: CONFIG
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 测试报告已保存: ${reportPath}`);
  }
}

// 运行测试
runTests().catch(console.error);
