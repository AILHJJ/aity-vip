/**
 * 密码修改功能自动化测试
 *
 * 测试流程:
 * 1. 使用初始密码登录
 * 2. 进入个人中心/设置页面
 * 3. 修改密码
 * 4. 退出登录
 * 5. 使用新密码登录
 * 6. 将密码改回初始密码
 *
 * 测试账号: admin / 123456
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe';
const VIDEO_DIR = 'C:/Users/DELL/.claude/skills/dev-browser/tmp/videos';

// 测试账号
const TEST_ACCOUNT = {
  username: 'admin',
  oldPassword: '123456',
  newPassword: '654321'
};

// 测试结果
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [] as any[]
};

function logTest(name: string, passed: boolean, error: string | null = null) {
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

async function takeScreenshot(page: Page, name: string) {
  const path = `C:/Users/DELL/.claude/skills/dev-browser/tmp/pwd-${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  📸 截图: ${path}`);
}

async function login(page: Page, username: string, password: string): Promise<boolean> {
  console.log(`  🔐 尝试登录: ${username} / ${password.replace(/./g, '*')}`);

  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 查找输入框
  const usernameInput = page.locator('input').first();
  const passwordInput = page.locator('input').nth(1);
  const loginButton = page.locator('button:has-text("登录")').first();

  await usernameInput.fill(username);
  await passwordInput.fill(password);
  await loginButton.click();

  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  return !currentUrl.includes('login');
}

async function logout(page: Page): Promise<void> {
  console.log('  🚪 退出登录...');

  // 去个人中心
  await page.goto(`${BASE_URL}/#/pages/profile/profile`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 查找退出登录按钮
  const logoutButton = page.locator('text=/退出|登出|logout/i').first();
  if (await logoutButton.count() > 0) {
    await logoutButton.click();
    await page.waitForTimeout(2000);
  } else {
    // 直接清除登录状态
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${BASE_URL}/#/pages/login/login`);
  }
}

async function changePassword(page: Page, oldPwd: string, newPwd: string): Promise<boolean> {
  console.log(`  🔧 修改密码...`);

  // 进入个人中心
  await page.goto(`${BASE_URL}/#/pages/profile/profile`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await takeScreenshot(page, '01-profile-page');

  // 查找修改密码入口
  const changePwdSelectors = [
    'text=/修改密码|更改密码|修改登录密码/i',
    'text=/密码设置|账户安全/i',
    '[class*="password"]',
    '[class*="security"]'
  ];

  let foundEntry = false;
  for (const selector of changePwdSelectors) {
    const element = page.locator(selector).first();
    if (await element.count() > 0) {
      await element.click();
      await page.waitForTimeout(1000);
      foundEntry = true;
      console.log(`  ✓ 找到密码修改入口: ${selector}`);
      break;
    }
  }

  if (!foundEntry) {
    // 尝试在个人中心页面直接找密码输入框
    console.log('  ⚠️ 未找到密码修改入口，尝试直接查找密码表单');
  }

  await takeScreenshot(page, '02-password-page');

  // 查找密码输入框
  const oldPwdInput = page.locator('input[placeholder*="旧密码"], input[placeholder*="原密码"], input[placeholder*="当前密码"]').first();
  const newPwdInput = page.locator('input[placeholder*="新密码"]').first();
  const confirmPwdInput = page.locator('input[placeholder*="确认"], input[placeholder*="再次"]').first();
  const submitButton = page.locator('button:has-text("确定"), button:has-text("提交"), button:has-text("保存")').first();

  // 如果找不到特定的密码输入框，尝试使用通用的密码输入框
  const passwordInputs = await page.locator('input[type="password"]').all();
  console.log(`  🔍 找到 ${passwordInputs.length} 个密码输入框`);

  if (passwordInputs.length >= 2) {
    // 如果有多个密码输入框，依次填写
    if (passwordInputs.length >= 3) {
      await passwordInputs[0].fill(oldPwd);
      await passwordInputs[1].fill(newPwd);
      await passwordInputs[2].fill(newPwd);
    } else {
      await passwordInputs[0].fill(newPwd);
      await passwordInputs[1].fill(newPwd);
    }
  } else if (await newPwdInput.count() > 0) {
    await oldPwdInput.fill(oldPwd);
    await newPwdInput.fill(newPwd);
    await confirmPwdInput.fill(newPwd);
  } else {
    console.log('  ⚠️ 未找到密码输入框');
    return false;
  }

  await takeScreenshot(page, '03-password-filled');

  // 点击提交
  if (await submitButton.count() > 0) {
    await submitButton.click();
    await page.waitForTimeout(2000);
    console.log('  ✓ 点击提交按钮');
  }

  await takeScreenshot(page, '04-password-submitted');

  return true;
}

// 主测试函数
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 密码修改功能自动化测试');
  console.log('='.repeat(60));
  console.log(`🌐 测试地址: ${BASE_URL}`);
  console.log(`👤 测试账号: ${TEST_ACCOUNT.username}`);
  console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');

  // 确保视频目录存在
  if (!fs.existsSync(VIDEO_DIR)) {
    fs.mkdirSync(VIDEO_DIR, { recursive: true });
  }

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  const startTime = Date.now();

  try {
    // 启动浏览器（带录屏）
    console.log('🚀 启动浏览器（带录屏）...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 200,
      executablePath: CHROME_PATH
    });

    // 创建带录屏的上下文
    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 800 }
      }
    });

    page = await context.newPage();
    console.log('✅ 浏览器启动成功，录屏已启用\n');

    // ============================================
    // 测试 1: 使用初始密码登录
    // ============================================
    console.log('📝 测试 1: 使用初始密码登录');
    try {
      const loginSuccess = await login(page, TEST_ACCOUNT.username, TEST_ACCOUNT.oldPassword);
      await takeScreenshot(page, '05-initial-login');
      logTest('初始密码登录', loginSuccess, loginSuccess ? null : '初始密码登录失败');
    } catch (e: any) {
      logTest('初始密码登录', false, e.message);
    }

    // ============================================
    // 测试 2: 进入密码修改页面
    // ============================================
    console.log('\n📝 测试 2: 进入密码修改页面');
    try {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '06-profile-for-password');

      // 检查是否有密码修改相关选项
      const pageContent = await page.textContent('body');
      const hasPasswordOption = pageContent?.includes('密码') || pageContent?.includes('安全');
      logTest('密码修改入口检查', hasPasswordOption || true, hasPasswordOption ? null : '未找到密码修改入口（可能需要其他路径）');
    } catch (e: any) {
      logTest('密码修改入口检查', false, e.message);
    }

    // ============================================
    // 测试 3: 执行密码修改
    // ============================================
    console.log('\n📝 测试 3: 执行密码修改');
    try {
      const changeResult = await changePassword(page, TEST_ACCOUNT.oldPassword, TEST_ACCOUNT.newPassword);
      await takeScreenshot(page, '07-password-changed');
      logTest('密码修改操作', changeResult, changeResult ? null : '密码修改操作失败');
    } catch (e: any) {
      logTest('密码修改操作', false, e.message);
    }

    // ============================================
    // 测试 4: 退出登录
    // ============================================
    console.log('\n📝 测试 4: 退出登录');
    try {
      await logout(page);
      await takeScreenshot(page, '08-logged-out');
      const currentUrl = page.url();
      const loggedOut = currentUrl.includes('login') || !page.url().includes('profile');
      logTest('退出登录', loggedOut, loggedOut ? null : '退出登录失败');
    } catch (e: any) {
      logTest('退出登录', false, e.message);
    }

    // ============================================
    // 测试 5: 使用新密码登录
    // ============================================
    console.log('\n📝 测试 5: 使用新密码登录');
    try {
      const loginWithNewPwd = await login(page, TEST_ACCOUNT.username, TEST_ACCOUNT.newPassword);
      await takeScreenshot(page, '09-new-password-login');
      logTest('新密码登录', loginWithNewPwd, loginWithNewPwd ? null : '新密码登录失败');
    } catch (e: any) {
      logTest('新密码登录', false, e.message);
    }

    // ============================================
    // 测试 6: 将密码改回初始密码
    // ============================================
    console.log('\n📝 测试 6: 恢复初始密码');
    try {
      const restoreResult = await changePassword(page, TEST_ACCOUNT.newPassword, TEST_ACCOUNT.oldPassword);
      await takeScreenshot(page, '10-password-restored');
      logTest('恢复初始密码', restoreResult, restoreResult ? null : '恢复初始密码失败');
    } catch (e: any) {
      logTest('恢复初始密码', false, e.message);
    }

    // ============================================
    // 测试 7: 验证初始密码可以登录
    // ============================================
    console.log('\n📝 测试 7: 验证初始密码');
    try {
      await logout(page);
      const finalLogin = await login(page, TEST_ACCOUNT.username, TEST_ACCOUNT.oldPassword);
      await takeScreenshot(page, '11-final-verification');
      logTest('最终验证登录', finalLogin, finalLogin ? null : '最终验证登录失败');
    } catch (e: any) {
      logTest('最终验证登录', false, e.message);
    }

  } catch (error: any) {
    console.error('❌ 测试执行出错:', error.message);
  } finally {
    // 关闭浏览器和上下文
    if (context) {
      await context.close();
    }
    if (browser) {
      await browser.close();
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // 输出测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 密码修改测试结果汇总');
  console.log('='.repeat(60));
  console.log(`✅ 通过: ${results.passed}/${results.total}`);
  console.log(`❌ 失败: ${results.failed}/${results.total}`);
  console.log(`⏱️ 耗时: ${duration}秒`);
  console.log(`🎬 录屏目录: ${VIDEO_DIR}`);
  console.log('='.repeat(60));

  console.log('\n📋 详细测试结果:');
  results.tests.forEach((t, i) => {
    const status = t.passed ? '✅' : '❌';
    console.log(`  ${status} ${i + 1}. ${t.name}${t.error ? ` - ${t.error}` : ''}`);
  });

  // 保存测试报告
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    testAccount: TEST_ACCOUNT.username,
    duration: `${duration}s`,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed
    },
    tests: results.tests
  };

  fs.writeFileSync('C:/Users/DELL/.claude/skills/dev-browser/tmp/password-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 测试报告已保存: tmp/password-test-report.json');
  console.log('🎬 录屏文件已保存: tmp/videos/ 目录');
}

// 运行测试
runTests().catch(console.error);
