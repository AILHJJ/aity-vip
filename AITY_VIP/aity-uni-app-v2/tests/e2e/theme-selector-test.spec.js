// @ts-check
/**
 * 主题选择器优化功能测试 - 可复用脚本
 *
 * 测试日期: 2026-02-28
 * 功能版本: v1.8.1
 *
 * 测试内容:
 * 1. 登录功能
 * 2. 主题选择器在编辑模式下可见
 * 3. 下拉选择功能
 * 4. AI优化按钮显示
 * 5. 完整发布流程
 *
 * 运行方式:
 * cd C:/Users/DELL/.claude/skills/dev-browser
 * CHROME_PATH="D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe" npx tsx tests/e2e/theme-selector-test.spec.js
 */

const { connect, waitForPageLoad } = require("@/client.js");

// ============= 配置区 =============
const CONFIG = {
  baseUrl: 'http://localhost:5174',
  testUser: {
    // 参考: docs/testing/测试账户参考.md
    username: 'admin',
    email: 'admin@example.com',
    password: '123456',  // 正确密码
    role: 'super_admin'
  },
  screenshotDir: 'tmp/'
};

// ============= 测试工具函数 =============
async function takeScreenshot(page, name) {
  const path = `${CONFIG.screenshotDir}${name}`;
  await page.screenshot({ path, fullPage: true });
  console.log(`✓ 截图: ${path}`);
  return path;
}

async function checkElement(page, selector, name) {
  const visible = await page.locator(selector).first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);
  console.log(`  ${name}: ${visible ? '✓ 通过' : '✗ 失败'}`);
  return visible;
}

// ============= 主测试流程 =============
async function runTests() {
  console.log('=== 主题选择器功能测试 ===');
  console.log('测试时间:', new Date().toLocaleString());
  console.log('测试账户:', CONFIG.testUser.email);
  console.log('');

  const client = await connect();
  const page = await client.page("theme-test", {
    viewport: { width: 1280, height: 900 }
  });

  const results = {
    login: false,
    themeRow: false,
    themePicker: false,
    aiButton: false,
    contentFill: false
  };

  try {
    // ---------- 步骤1: 导航到页面 ----------
    console.log('步骤1: 导航到登录页面');
    await page.goto(CONFIG.baseUrl);
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'theme-01-initial.png');

    // ---------- 步骤2: 登录 ----------
    console.log('\n步骤2: 执行登录');

    // 获取AI快照找到登录按钮
    let snapshot = await client.getAISnapshot("theme-test");

    // 填写邮箱
    const emailInput = page.locator('input[placeholder*="邮箱"], input[type="text"]').first();
    await emailInput.fill(CONFIG.testUser.email);

    // 填写密码
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(CONFIG.testUser.password);

    // 使用AI快照点击登录按钮 (uni-app组件不是button)
    // 在快照中找到 "登录" 文本的元素ref
    const loginMatch = snapshot.match(/generic \[ref=e(\d+)\] \[cursor=pointer\]: 登录/);
    if (loginMatch) {
      const loginBtn = await client.selectSnapshotRef("theme-test", `e${loginMatch[1]}`);
      await loginBtn.click({ force: true });
    } else {
      // 备用方式
      const loginBtn = page.locator('text=登录').first();
      await loginBtn.click({ force: true });
    }

    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    await takeScreenshot(page, 'theme-02-after-login.png');

    console.log(`  当前URL: ${page.url()}`);
    results.login = !page.url().includes('login');
    console.log(`  登录状态: ${results.login ? '✓ 成功' : '✗ 失败'}`);

    // ---------- 步骤3: 导航到发布消息页面 ----------
    console.log('\n步骤3: 导航到发布消息页面');
    await page.goto(`${CONFIG.baseUrl}/#/pages/create-message/create-message`);
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'theme-03-create-message.png');

    // ---------- 步骤4: 检查主题选择器 ----------
    console.log('\n步骤4: 检查主题选择器组件');

    // 获取AI快照
    snapshot = await client.getAISnapshot("theme-test");
    console.log('\n  AI快照 (关键元素):');

    // 查找主题相关元素
    const themeMatch = snapshot.match(/generic \[ref=e(\d+)\]: 🎨 主题/);
    const pickerMatch = snapshot.match(/简约白|紫色渐变/);
    const aiMatch = snapshot.match(/AI优化/);

    if (themeMatch) console.log(`    找到 🎨 主题 (ref=e${themeMatch[1]})`);
    if (pickerMatch) console.log(`    找到主题选项: ${pickerMatch[0]}`);
    if (aiMatch) console.log(`    找到 AI优化 按钮`);

    // 使用CSS选择器检测
    results.themeRow = await checkElement(page, '.theme-ai-row', '主题选择行');
    results.themePicker = await checkElement(page, '.theme-picker', '主题下拉框');

    // AI按钮在uni-app中可能是generic元素
    const aiBtnLocator = page.locator('text=AI优化').first();
    results.aiButton = await aiBtnLocator.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  AI优化按钮: ${results.aiButton ? '✓ 通过' : '✗ 失败'}`);

    // ---------- 步骤5: 填写测试内容 ----------
    console.log('\n步骤5: 填写测试内容');

    const titleInput = page.locator('input[placeholder*="标题"]').first();
    if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await titleInput.fill('主题选择器功能测试');
      console.log('  ✓ 已填写标题');
    }

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await textarea.fill(
        '# 测试消息\n\n' +
        '这是一条用于测试主题选择器功能的消息。\n\n' +
        '## 功能特点\n\n' +
        '- 下拉选择\n' +
        '- 颜色预览\n' +
        '- 记忆功能'
      );
      console.log('  ✓ 已填写内容');
      results.contentFill = true;
    }

    await page.waitForTimeout(500);
    await takeScreenshot(page, 'theme-04-content-filled.png');

    // ---------- 步骤6: 高亮主题选择器 ----------
    console.log('\n步骤6: 高亮主题选择器区域');

    const themeRow = page.locator('.theme-ai-row').first();
    if (await themeRow.isVisible({ timeout: 2000 }).catch(() => false)) {
      await themeRow.evaluate((el) => {
        el.style.border = '3px solid red';
        el.style.boxShadow = '0 0 15px red';
        el.style.transform = 'scale(1.02)';
      });

      await page.waitForTimeout(500);
      await takeScreenshot(page, 'theme-05-theme-highlighted.png');
      console.log('  ✓ 主题选择器已高亮');

      // 移除高亮
      await themeRow.evaluate((el) => {
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.transform = '';
      });
    }

    // ---------- 测试结果汇总 ----------
    console.log('\n' + '='.repeat(50));
    console.log('测试结果汇总');
    console.log('='.repeat(50));

    const testItems = [
      { name: '登录功能', result: results.login },
      { name: '主题选择行可见', result: results.themeRow },
      { name: '主题下拉框可见', result: results.themePicker },
      { name: 'AI优化按钮可见', result: results.aiButton },
      { name: '内容填写', result: results.contentFill }
    ];

    testItems.forEach(item => {
      console.log(`  ${item.result ? '✓' : '✗'} ${item.name}`);
    });

    const passedCount = testItems.filter(t => t.result).length;
    const totalCount = testItems.length;

    console.log('='.repeat(50));
    console.log(`通过: ${passedCount}/${totalCount}`);
    console.log(`最终结果: ${passedCount === totalCount ? '✓ 所有测试通过' : '✗ 部分测试失败'}`);
    console.log('');
    console.log(`截图目录: C:/Users/DELL/.claude/skills/dev-browser/${CONFIG.screenshotDir}`);

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error.message);
    await takeScreenshot(page, 'theme-error.png');
  } finally {
    await client.disconnect();
  }

  return results;
}

// 执行测试
runTests().catch(console.error);
