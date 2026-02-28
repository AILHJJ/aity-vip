// AITY VIP 完整功能测试 - 登录、消息列表、发送消息
const { chromium } = require('playwright');

// 目标URL - H5前端
const TARGET_URL = process.env.BASE_URL || 'http://localhost:5176';

// 测试账户列表
const TEST_ACCOUNTS = [
  { email: 'admin@example.com', password: '123456', desc: '管理员' },
  { email: '等风来', password: '112044', desc: 'VIP' },
];

(async () => {
  console.log('=== AITY VIP 自动化测试 ===\n');
  console.log('目标:', TARGET_URL);
  console.log('时间:', new Date().toLocaleString());

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
    executablePath: 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: 'D:/your-mcp-proxy/AITY_VIP/test-results/videos' }
  });

  const page = await context.newPage();
  const results = { passed: [], failed: [] };

  const shot = async (name) => {
    await page.screenshot({ path: `D:/your-mcp-proxy/AITY_VIP/test-results/${name}`, fullPage: true });
    console.log(`   📸 ${name}`);
  };

  try {
    // ===== 1. 首页 =====
    console.log('\n📱 1. 首页加载');
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    await shot('01-homepage.png');
    results.passed.push('首页加载');

    // ===== 2. 登录检测 =====
    console.log('\n🔐 2. 登录检测');
    await page.goto(TARGET_URL + '/#/pages/profile/profile');
    await page.waitForTimeout(2000);
    await shot('02-profile.png');

    // 检查登录状态
    const logoutBtn = page.locator('text=/退出登录|退出账号/');
    const loginBtn = page.locator('button:has-text("登录"), text=/立即登录|点击登录/');

    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   ✅ 已登录状态');
      results.passed.push('已登录');
    } else if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   尝试登录...');
      await loginBtn.first().click();
      await page.waitForTimeout(1000);

      const emailInput = page.locator('input').first();
      const pwdInput = page.locator('input[type="password"], input').nth(1);

      for (const acc of TEST_ACCOUNTS) {
        await emailInput.fill(acc.email);
        await pwdInput.fill(acc.password);
        await shot(`03-login-${acc.desc}.png`);

        const submit = page.locator('button[type="submit"], button:has-text("登录")').first();
        await submit.click();
        await page.waitForTimeout(3000);

        if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`   ✅ 登录成功: ${acc.desc}`);
          results.passed.push(`登录-${acc.desc}`);
          break;
        }
      }
    }

    // ===== 3. 消息列表 =====
    console.log('\n📬 3. 消息列表');
    await page.goto(TARGET_URL + '/#/pages/messages/messages');
    await page.waitForTimeout(2000);
    await shot('04-messages.png');

    // 使用精确的 .message-item 选择器
    const messages = page.locator('.message-item');
    const msgCount = await messages.count();
    console.log(`   找到 ${msgCount} 条消息`);

    if (msgCount > 0) {
      results.passed.push('消息列表');

      // 点击第一条消息
      console.log('   查看消息详情...');
      await messages.first().click();
      await page.waitForTimeout(2000);
      await shot('05-message-detail.png');
      results.passed.push('消息详情');

      // 返回
      const backBtn = page.locator('.uni-icons-back, .uni-nav-bar__left, text=返回').first();
      if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // ===== 4. 发布消息 =====
    console.log('\n✏️ 4. 发布消息');
    await page.goto(TARGET_URL + '/#/pages/create-message/create-message');
    await page.waitForTimeout(2000);
    await shot('06-create-page.png');

    const titleInput = page.locator('input').first();
    const contentArea = page.locator('textarea').first();

    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titleInput.fill('【自动化测试】' + new Date().toLocaleString());
      await contentArea.fill('自动化测试消息内容\n\n时间: ' + new Date().toLocaleString());
      await shot('07-filled-form.png');
      results.passed.push('发布消息-表单');

      // 检查AI优化
      const aiBtn = page.locator('button:has-text("AI优化"), text=/AI优化/');
      if (await aiBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   ✅ AI优化按钮可用');
        results.passed.push('AI优化');
      }

      // 检查预览
      const previewBtn = page.locator('button:has-text("预览"), text=/预览/');
      if (await previewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await previewBtn.click();
        await page.waitForTimeout(1500);
        await shot('08-preview.png');
        results.passed.push('预览功能');
      }
    }

    // ===== 5. AI图灵 =====
    console.log('\n🤖 5. AI图灵');
    await page.goto(TARGET_URL + '/#/pages/ai-advisor/ai-advisor');
    await page.waitForTimeout(2000);
    await shot('09-ai-advisor.png');

    const chatInput = page.locator('input[type="text"], textarea').first();
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      results.passed.push('AI图灵');
    }

    // ===== 6. 讨论区 =====
    console.log('\n💬 6. 讨论区');
    await page.goto(TARGET_URL + '/#/pages/discussions/discussions');
    await page.waitForTimeout(2000);
    await shot('10-discussions.png');

    const discussionItem = page.locator('.discussion-item, .uni-list-item');
    if (await discussionItem.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      results.passed.push('讨论区');
    }

    // ===== 7. 最终汇总 =====
    console.log('\n📊 7. 汇总');
    await page.goto(TARGET_URL);
    await page.waitForTimeout(1500);
    await shot('11-final.png');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    results.failed.push(error.message);
    await shot('error.png');
  } finally {
    await context.close();
    await browser.close();
  }

  // 结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果');
  console.log('='.repeat(50));
  console.log('✅ 通过:', results.passed.length);
  results.passed.forEach(r => console.log('   ✓ ' + r));
  if (results.failed.length > 0) {
    console.log('❌ 失败:', results.failed.length);
    results.failed.forEach(r => console.log('   ✗ ' + r));
  }
  console.log('\n📁 截图: D:/your-mcp-proxy/AITY_VIP/test-results/');
  console.log('🎬 视频: D:/your-mcp-proxy/AITY_VIP/test-results/videos/');
  console.log('='.repeat(50));

})().catch(console.error);
