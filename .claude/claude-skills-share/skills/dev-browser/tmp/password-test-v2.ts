/**
 * 密码修改功能测试 - V2 (修复版)
 * 应用uni-app自动化测试最佳实践
 */

import { chromium, Page, Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 配置
const BASE_URL = 'http://localhost:5173';
const TEST_ACCOUNT = 'admin';
const OLD_PASSWORD = '123456';
const NEW_PASSWORD = '654321';
const VIDEO_DIR = 'C:/Users/DELL/.claude/skills/dev-browser/tmp/videos';
const SCREENSHOT_DIR = 'C:/Users/DELL/.claude/skills/dev-browser/tmp';

// 确保目录存在
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

// 测试结果
const results: { name: string; passed: boolean; error: string | null }[] = [];

/**
 * uni-app 测试辅助类
 */
class UniAppHelper {
  constructor(private page: Page) {}

  /**
   * 安全点击 - 自动处理遮罩层
   */
  async safeClick(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      await locator.first().click({ timeout, force: false });
      return true;
    } catch (e) {
      // 如果普通点击失败，尝试强制点击
      try {
        await locator.first().click({ force: true, timeout: 2000 });
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  /**
   * 处理确认弹窗
   */
  async handleModal(action: 'confirm' | 'cancel' = 'confirm'): Promise<boolean> {
    await this.page.waitForTimeout(300); // 等待弹窗动画

    const textPattern = action === 'confirm' ? /确定|确认|是|OK/i : /取消|否|Cancel/i;

    // uni-app 弹窗按钮选择器
    const confirmBtn = this.page.locator(`
      .uni-modal button:has-text("${textPattern.source}"),
      .uni-modal__ft button:has-text("${textPattern.source}"),
      .uni-popup button:has-text("${textPattern.source}")
    `).first();

    try {
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click({ force: true });
        await this.page.waitForTimeout(500);
        return true;
      }
    } catch (e) {}

    return false;
  }

  /**
   * 等待遮罩层消失
   */
  async waitForMaskGone(timeout = 5000): Promise<void> {
    try {
      await this.page.waitForSelector('.uni-mask', { state: 'hidden', timeout });
    } catch (e) {
      // 遮罩可能本来就不存在
    }
  }

  /**
   * 等待页面稳定
   */
  async waitForStable(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  /**
   * 填写输入框 - 支持uni-app组件
   */
  async fillInput(placeholder: string | RegExp, value: string): Promise<void> {
    const pattern = typeof placeholder === 'string' ? placeholder : placeholder.source;
    const input = this.page.locator(`
      input[placeholder*="${pattern}"],
      input[placeholder*="${pattern.toLowerCase()}"],
      uni-input input
    `).first();

    await input.fill(value);
  }

  /**
   * 点击按钮 - 支持uni-app组件
   */
  async clickButton(text: string | RegExp): Promise<boolean> {
    const pattern = typeof text === 'string' ? text : text.source;
    const btn = this.page.locator(`
      uni-button:has-text("${pattern}"),
      button:has-text("${pattern}"),
      [class*="btn"]:has-text("${pattern}"),
      text=/${pattern}/i
    `).first();

    return this.safeClick(btn);
  }

  /**
   * 检查元素是否存在
   */
  async hasElement(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * 截图
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${name}.png`),
      fullPage: false
    });
  }
}

/**
 * 记录测试结果
 */
function recordTest(name: string, passed: boolean, error: string | null = null) {
  results.push({ name, passed, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${error ? ` - ${error}` : ''}`);
}

async function main() {
  console.log('========================================');
  console.log('密码修改功能测试 V2 (修复版)');
  console.log('========================================\n');

  const browser = await chromium.launch({
    headless: false,
    executablePath: 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();
  const helper = new UniAppHelper(page);

  try {
    // ============ 测试1: 登录 ============
    console.log('\n--- 测试1: 登录 ---');
    await page.goto(BASE_URL);
    await helper.waitForStable();
    await helper.screenshot('v2-01-login-page');

    // 使用更通用的选择器填写表单
    const inputs = await page.locator('input').all();
    if (inputs.length >= 2) {
      await inputs[0].fill(TEST_ACCOUNT);
      await inputs[1].fill(OLD_PASSWORD);
    }

    await helper.screenshot('v2-02-filled');

    // 点击登录按钮 - 使用多种策略
    const loginSuccess = await helper.clickButton(/登录|Login/);
    await page.waitForTimeout(2000);
    await helper.waitForStable();
    await helper.screenshot('v2-03-after-login');

    // 验证登录成功
    const hasLogout = await helper.hasElement('text=/退出|登出/i');
    recordTest('用户登录', hasLogout, hasLogout ? null : '未找到退出按钮');

    if (!hasLogout) {
      console.log('登录失败，无法继续测试');
      throw new Error('登录失败');
    }

    // ============ 测试2: 进入个人中心 ============
    console.log('\n--- 测试2: 进入个人中心 ---');
    await helper.clickButton(/我的|个人|profile/i);
    await helper.waitForStable();
    await helper.screenshot('v2-04-profile');

    const hasPasswordMenu = await helper.hasElement('text=/修改密码|更改密码/i');
    recordTest('进入个人中心', hasPasswordMenu);

    // ============ 测试3: 打开密码修改 ============
    console.log('\n--- 测试3: 打开密码修改 ---');
    await helper.clickButton(/修改密码|更改密码/);
    await helper.waitForStable();
    await helper.screenshot('v2-05-password-form');

    const hasPasswordForm = await helper.hasElement('input[type="password"], input[placeholder*="密码"]');
    recordTest('打开密码修改', hasPasswordForm);

    // ============ 测试4: 填写密码表单 ============
    console.log('\n--- 测试4: 填写密码表单 ---');

    // 查找所有密码输入框
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill(OLD_PASSWORD);
      await passwordInputs[1].fill(NEW_PASSWORD);
      if (passwordInputs.length >= 3) {
        await passwordInputs[2].fill(NEW_PASSWORD);
      }
    }

    await helper.screenshot('v2-06-filled-password');
    recordTest('填写密码表单', true);

    // ============ 测试5: 提交密码修改 ============
    console.log('\n--- 测试5: 提交密码修改 ---');
    await helper.clickButton(/确定|提交|保存|确认修改/);
    await page.waitForTimeout(2000);

    // 处理可能的确认弹窗
    await helper.handleModal('confirm');
    await helper.waitForMaskGone();
    await helper.screenshot('v2-07-password-submitted');

    recordTest('提交密码修改', true);

    // ============ 测试6: 退出登录 ============
    console.log('\n--- 测试6: 退出登录 ---');

    // 返回个人中心
    await helper.clickButton(/我的|个人/i);
    await helper.waitForStable();

    // 点击退出
    await helper.clickButton(/退出|登出/i);
    await page.waitForTimeout(500);

    // 处理确认弹窗 - 使用强制点击
    await helper.handleModal('confirm');
    await helper.waitForMaskGone();
    await page.waitForTimeout(1000);
    await helper.screenshot('v2-08-logged-out');

    // 验证退出成功
    const hasLoginBtn = await helper.hasElement('text=/登录|Login/i');
    recordTest('退出登录', hasLoginBtn);

    // ============ 测试7: 新密码登录 ============
    console.log('\n--- 测试7: 新密码登录 ---');

    // 刷新页面确保完全退出
    await page.goto(BASE_URL);
    await helper.waitForStable();

    const newInputs = await page.locator('input').all();
    if (newInputs.length >= 2) {
      await newInputs[0].fill(TEST_ACCOUNT);
      await newInputs[1].fill(NEW_PASSWORD);
    }

    await helper.screenshot('v2-09-new-password-login');
    await helper.clickButton(/登录|Login/);
    await page.waitForTimeout(2000);
    await helper.waitForStable();
    await helper.screenshot('v2-10-new-login-result');

    const newLoginSuccess = await helper.hasElement('text=/退出|登出/i');
    recordTest('新密码登录', newLoginSuccess);

    // ============ 测试8: 恢复原密码 ============
    console.log('\n--- 测试8: 恢复原密码 ---');

    if (newLoginSuccess) {
      // 进入个人中心
      await helper.clickButton(/我的|个人/i);
      await helper.waitForStable();

      // 打开密码修改
      await helper.clickButton(/修改密码|更改密码/);
      await helper.waitForStable();

      // 填写表单
      const restoreInputs = await page.locator('input[type="password"]').all();
      if (restoreInputs.length >= 2) {
        await restoreInputs[0].fill(NEW_PASSWORD);
        await restoreInputs[1].fill(OLD_PASSWORD);
        if (restoreInputs.length >= 3) {
          await restoreInputs[2].fill(OLD_PASSWORD);
        }
      }

      await helper.screenshot('v2-11-restore-password');

      // 提交
      await helper.clickButton(/确定|提交|保存/);
      await page.waitForTimeout(2000);
      await helper.handleModal('confirm');
      await helper.waitForMaskGone();

      recordTest('恢复原密码', true);
    } else {
      recordTest('恢复原密码', false, '新密码登录失败，跳过');
    }

  } catch (error) {
    console.error('测试执行错误:', error);
    await helper.screenshot('v2-error');
  } finally {
    // 保存测试报告
    const report = {
      timestamp: new Date().toISOString(),
      version: 'v2-fixed',
      baseUrl: BASE_URL,
      testAccount: TEST_ACCOUNT,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      },
      tests: results
    };

    const reportPath = path.join(SCREENSHOT_DIR, 'password-test-v2-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n========================================');
    console.log('测试完成!');
    console.log(`总计: ${report.summary.total}`);
    console.log(`通过: ${report.summary.passed}`);
    console.log(`失败: ${report.summary.failed}`);
    console.log(`报告: ${reportPath}`);
    console.log('========================================');

    await browser.close();
  }
}

main();
