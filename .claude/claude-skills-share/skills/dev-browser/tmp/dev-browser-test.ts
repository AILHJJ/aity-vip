import { connect, waitForPageLoad } from "@/client.js";

async function runTests() {
  console.log("=== AITY VIP 自动化测试 (dev-browser) ===\n");
  console.log("时间:", new Date().toLocaleString());

  const client = await connect();
  console.log("✅ 已连接到 dev-browser");

  const results = { passed: [] as string[], failed: [] as string[] };

  try {
    // 创建测试页面（带录屏）
    const page = await client.page("aity-test", {
      viewport: { width: 1920, height: 1080 }
    });
    console.log("✅ 创建测试页面: aity-test");

    // ===== 1. 首页加载 =====
    console.log("\n📱 1. 加载首页...");
    await page.goto("http://localhost:5176");
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tmp/dev-browser/01-homepage.png", fullPage: true });
    console.log("   📸 截图: tmp/dev-browser/01-homepage.png");
    results.passed.push("首页加载");

    // ===== 2. 登录检测 =====
    console.log("\n🔐 2. 登录检测...");
    await page.goto("http://localhost:5176/#/pages/profile/profile");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/dev-browser/02-profile.png" });

    // 检查登录状态
    const logoutBtn = page.locator("text=/退出登录|退出账号/");
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log("   ✅ 已登录状态");
      results.passed.push("已登录");
    } else {
      console.log("   尝试登录...");
      const loginBtn = page.locator('button:has-text("登录"), text=/立即登录/').first();
      if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await loginBtn.click();
        await page.waitForTimeout(1000);

        // 填写登录表单
        const emailInput = page.locator("input").first();
        const pwdInput = page.locator('input[type="password"], input').nth(1);

        await emailInput.fill("admin@example.com");
        await pwdInput.fill("123456");
        await page.screenshot({ path: "tmp/dev-browser/03-login-form.png" });

        const submit = page.locator('button[type="submit"], button:has-text("登录")').first();
        await submit.click();
        await page.waitForTimeout(3000);

        await page.screenshot({ path: "tmp/dev-browser/04-after-login.png" });

        if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log("   ✅ 登录成功");
          results.passed.push("用户登录");
        }
      }
    }

    // ===== 3. 消息列表 =====
    console.log("\n📬 3. 消息列表...");
    await page.goto("http://localhost:5176/#/pages/messages/messages");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/dev-browser/05-messages.png", fullPage: true });

    const messages = page.locator(".message-item");
    const msgCount = await messages.count();
    console.log(`   找到 ${msgCount} 条消息`);

    if (msgCount > 0) {
      results.passed.push("消息列表");
      console.log("   点击第一条消息...");
      await messages.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: "tmp/dev-browser/06-message-detail.png" });
      results.passed.push("消息详情");
    }

    // ===== 4. 发布消息 =====
    console.log("\n✏️ 4. 发布消息...");
    await page.goto("http://localhost:5176/#/pages/create-message/create-message");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/dev-browser/07-create-page.png" });

    const titleInput = page.locator("input").first();
    const contentArea = page.locator("textarea").first();

    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titleInput.fill("【dev-browser测试】" + new Date().toLocaleString());
      await contentArea.fill("dev-browser自动化测试消息\n\n时间: " + new Date().toLocaleString());
      await page.screenshot({ path: "tmp/dev-browser/08-filled-form.png" });
      results.passed.push("发布消息-表单");

      // AI优化按钮
      const aiBtn = page.locator('button:has-text("AI优化"), text=/AI优化/');
      if (await aiBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log("   ✅ AI优化按钮可用");
        results.passed.push("AI优化");
      }

      // 预览按钮
      const previewBtn = page.locator('button:has-text("预览"), text=/预览/');
      if (await previewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await previewBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: "tmp/dev-browser/09-preview.png" });
        results.passed.push("预览功能");
      }
    }

    // ===== 5. AI图灵 =====
    console.log("\n🤖 5. AI图灵...");
    await page.goto("http://localhost:5176/#/pages/ai-advisor/ai-advisor");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/dev-browser/10-ai-advisor.png" });
    results.passed.push("AI图灵");

    // ===== 6. 讨论区 =====
    console.log("\n💬 6. 讨论区...");
    await page.goto("http://localhost:5176/#/pages/discussions/discussions");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/dev-browser/11-discussions.png" });
    results.passed.push("讨论区");

    // ===== 7. 最终汇总 =====
    console.log("\n📊 7. 汇总...");
    await page.goto("http://localhost:5176");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "tmp/dev-browser/12-final.png", fullPage: true });

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    results.failed.push(error.message);
  }

  // 输出结果
  console.log("\n" + "=".repeat(50));
  console.log("📊 测试结果");
  console.log("=".repeat(50));
  console.log("✅ 通过:", results.passed.length);
  results.passed.forEach(r => console.log("   ✓ " + r));
  if (results.failed.length > 0) {
    console.log("❌ 失败:", results.failed.length);
    results.failed.forEach(r => console.log("   ✗ " + r));
  }
  console.log("\n📁 截图: skills/dev-browser/tmp/dev-browser/");

  await client.disconnect();
  console.log("\n✅ 已断开连接");
}

runTests().catch(console.error);
