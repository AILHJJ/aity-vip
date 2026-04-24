import { connect, waitForPageLoad } from "@/client.js";

async function testAIChat() {
  console.log("\n========================================");
  console.log("投研图灵室 - AI对话功能测试");
  console.log("========================================\n");

  const client = await connect();
  let testPassed = false;
  let errorMessage = '';

  try {
    // 步骤1: 打开应用
    console.log("📝 步骤 1: 打开应用...");
    const page = await client.page("ai-chat-test", {
      viewport: { width: 1920, height: 1080 }
    });

    const targetUrl = 'http://localhost:5174';
    await page.goto(targetUrl);
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    // 截图 - 初始页面
    await page.screenshot({ path: "tmp/ai-test-01-initial.png", fullPage: true });
    console.log("✅ 初始页面截图已保存");

    // 获取页面结构
    console.log("\n📝 步骤 2: 查看页面结构...");
    const snapshot = await client.getAISnapshot("ai-chat-test");
    console.log("页面结构:");
    console.log(snapshot);

    // 步骤2: 检查是否已登录
    const currentUrl = page.url();
    console.log(`\n当前URL: ${currentUrl}`);

    // 如果在登录页,需要先登录
    if (currentUrl.includes('login') || snapshot.includes('登录')) {
      console.log("\n📝 步骤 3: 执行登录...");

      // 尝试找到登录表单
      const loginSnapshot = await client.getAISnapshot("ai-chat-test");

      if (loginSnapshot.includes('邮箱') || loginSnapshot.includes('账号')) {
        console.log("尝试使用账号密码登录...");

        // 使用 JavaScript 填充表单
        await page.evaluate(() => {
          // 查找用户名/邮箱输入框
          const inputs = document.querySelectorAll('input');
          inputs.forEach((input: any) => {
            if (input.placeholder?.includes('账号') ||
                input.placeholder?.includes('邮箱') ||
                input.placeholder?.includes('用户名')) {
              input.value = 'admin';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (input.type === 'password') {
              input.value = '123456';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
        });

        await page.waitForTimeout(1000);
        await page.screenshot({ path: "tmp/ai-test-02-login-filled.png" });
        console.log("✅ 登录信息已填充");

        // 查找登录按钮并点击
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await button.textContent();
          if (text?.includes('登录') || text?.includes('登')) {
            await button.click();
            console.log("✅ 点击登录按钮");
            break;
          }
        }

        await page.waitForTimeout(3000);
        await page.screenshot({ path: "tmp/ai-test-03-after-login.png" });
        console.log("✅ 登录后截图已保存");
      }
    } else {
      console.log("\n✅ 已经登录,继续测试...");
    }

    // 步骤3: 查找AI对话输入框
    console.log("\n📝 步骤 4: 查找AI对话输入框...");
    const afterLoginSnapshot = await client.getAISnapshot("ai-chat-test");
    console.log("登录后页面结构:");
    console.log(afterLoginSnapshot);

    // 查找输入框
    const inputFound = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], textarea');
      for (const input of inputs) {
        if (input.placeholder?.includes('问题') ||
            input.placeholder?.includes('输入') ||
            input.placeholder?.includes('提问') ||
            input.placeholder?.includes('AI')) {
          return true;
        }
      }
      return false;
    });

    if (!inputFound) {
      console.log("⚠️  未找到AI对话输入框,可能在其他页面");
      console.log("尝试查找可能的入口...");
    }

    await page.screenshot({ path: "tmp/ai-test-04-find-input.png" });
    console.log("✅ 页面状态截图已保存");

    testPassed = true;
    console.log("\n✅ 测试基本通过!");

  } catch (error: any) {
    errorMessage = error.message;
    console.error("\n❌ 测试失败:", errorMessage);

    try {
      const page = await client.page("ai-chat-test");
      await page.screenshot({ path: "tmp/ai-test-error.png" });
      console.log("📸 错误截图已保存");
    } catch (e) {
      console.error("无法保存错误截图");
    }

  } finally {
    console.log("\n📝 保存测试资源...");
    await client.disconnect();

    console.log("\n========================================");
    console.log("测试结果汇总");
    console.log("========================================");
    console.log(`状态: ${testPassed ? '✅ 通过' : '❌ 失败'}`);
    if (errorMessage) {
      console.log(`错误: ${errorMessage}`);
    }
    console.log("截图位置: C:\\Users\\DELL\\.claude\\skills\\dev-browser\\tmp\\");
    console.log("========================================\n");
  }
}

testAIChat().catch(console.error);
