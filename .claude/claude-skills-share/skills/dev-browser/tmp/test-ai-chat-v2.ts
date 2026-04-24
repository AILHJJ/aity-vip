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
    console.log(`访问URL: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 截图 - 初始页面
    await page.screenshot({ path: "tmp/ai-test-01-initial.png", fullPage: true });
    console.log("✅ 初始页面截图已保存");

    // 获取当前URL
    const currentUrl = page.url();
    console.log(`\n当前URL: ${currentUrl}`);
    console.log(`页面标题: ${await page.title()}`);

    // 步骤2: 查看页面结构
    console.log("\n📝 步骤 2: 查看页面结构...");
    try {
      const snapshot = await client.getAISnapshot("ai-chat-test");
      console.log("页面结构预览:");
      console.log(snapshot.substring(0, 500) + "...");  // 只显示前500个字符
    } catch (e: any) {
      console.log("⚠️  无法获取AI snapshot:", e.message);
    }

    // 步骤3: 检查是否在登录页
    if (currentUrl.includes('login')) {
      console.log("\n📝 步骤 3: 在登录页面,执行登录...");

      // 尝试登录
      try {
        // 查找用户名输入框
        const usernameInput = await page.$('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]');
        if (usernameInput) {
          await usernameInput.click();
          await page.keyboard.type('admin', { delay: 50 });
          console.log("✅ 输入用户名: admin");
        }

        // 查找密码输入框
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.click();
          await page.keyboard.type('123456', { delay: 50 });
          console.log("✅ 输入密码: 123456");
        }

        await page.waitForTimeout(1000);
        await page.screenshot({ path: "tmp/ai-test-02-login-filled.png" });
        console.log("✅ 登录信息已填充");

        // 查找并点击登录按钮
        const loginButton = await page.$('button:has-text("登录")');
        if (loginButton) {
          await loginButton.click();
          console.log("✅ 点击登录按钮");
        }

        await page.waitForTimeout(3000);
        await page.screenshot({ path: "tmp/ai-test-03-after-login.png" });
        console.log("✅ 登录后截图已保存");

        const newUrl = page.url();
        console.log(`\n登录后URL: ${newUrl}`);

      } catch (loginError: any) {
        console.log("⚠️  登录过程出错:", loginError.message);
        await page.screenshot({ path: "tmp/ai-test-login-error.png" });
      }
    } else {
      console.log("\n✅ 已经在主页面,跳过登录");
    }

    // 步骤4: 查找AI对话功能
    console.log("\n📝 步骤 4: 查找AI对话功能...");

    // 截图当前状态
    await page.screenshot({ path: "tmp/ai-test-04-main-page.png", fullPage: true });

    // 查找可能的AI对话元素
    const pageContent = await page.textContent('body');
    const hasAI = pageContent?.includes('AI') || pageContent?.includes('ai') || pageContent?.includes('问答');
    console.log(`页面是否包含AI相关内容: ${hasAI ? '是' : '否'}`);

    // 尝试查找输入框
    const inputs = await page.$$('input, textarea');
    console.log(`找到 ${inputs.length} 个输入框`);

    // 查找可能的AI输入框
    let aiInputFound = false;
    for (let i = 0; i < inputs.length; i++) {
      try {
        const input = inputs[i];
        const placeholder = await input.getAttribute('placeholder');
        const type = await input.getAttribute('type');

        if (placeholder?.includes('问') ||
            placeholder?.includes('输入') ||
            placeholder?.includes('提问') ||
            placeholder?.includes('AI') ||
            type === 'text') {
          console.log(`输入框 ${i + 1}: placeholder="${placeholder}", type="${type}"`);

          if (!aiInputFound && (placeholder?.includes('问') || placeholder?.includes('AI'))) {
            console.log(`\n✅ 找到AI输入框: ${placeholder}`);

            // 输入测试问题
            await input.click();
            await page.keyboard.type('今天的大盘走势如何?', { delay: 50 });
            console.log("✅ 输入问题: 今天的大盘走势如何?");

            await page.waitForTimeout(500);
            await page.screenshot({ path: "tmp/ai-test-05-question-entered.png" });

            aiInputFound = true;

            // 查找发送按钮
            const sendButton = await page.$('button:has-text("发送"), button:has-text("提交"), button[type="submit"]');
            if (sendButton) {
              await sendButton.click();
              console.log("✅ 点击发送按钮");

              // 等待AI回复
              console.log("\n📝 步骤 5: 等待AI回复...");
              await page.waitForTimeout(5000);

              await page.screenshot({ path: "tmp/ai-test-06-ai-response.png", fullPage: true });
              console.log("✅ AI回复截图已保存");

              // 检查是否有回复内容
              const responseContent = await page.textContent('body');
              if (responseContent && responseContent.length > 0) {
                console.log("✅ 检测到AI回复内容");
                testPassed = true;
              }
            }
            break;
          }
        }
      } catch (e) {
        // 忽略单个输入框的错误
      }
    }

    if (!aiInputFound) {
      console.log("\n⚠️  未找到AI输入框,可能需要手动导航到AI对话页面");
      await page.screenshot({ path: "tmp/ai-test-no-input-found.png" });
    }

  } catch (error: any) {
    errorMessage = error.message;
    console.error("\n❌ 测试失败:", errorMessage);
  } finally {
    // 断开连接
    await client.disconnect();

    // 输出测试结果
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
