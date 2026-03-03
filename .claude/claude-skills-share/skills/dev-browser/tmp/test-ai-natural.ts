import { connect, waitForPageLoad } from "@/client.js";

console.log("========================================");
console.log("投研图灵室 - AI对话功能测试");
console.log("========================================\n");

const client = await connect();

// 步骤1: 打开应用
console.log("📝 步骤 1: 打开应用...");
const page = await client.page("ai-test", {
  viewport: { width: 1920, height: 1080 }
});

await page.goto("http://localhost:5174", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.screenshot({ path: "tmp/ai-test-01-initial.png", fullPage: true });
console.log("✅ 初始页面截图已保存");

const currentUrl = page.url();
console.log("当前URL:", currentUrl);

// 步骤2: 登录
if (currentUrl.includes("login")) {
  console.log("\n📝 步骤 2: 执行登录...");

  const usernameInput = await page.$('input[type="text"], input[placeholder*="账号"]');
  if (usernameInput) {
    await usernameInput.click();
    await page.keyboard.type("admin", { delay: 50 });
    console.log("✅ 输入用户名: admin");
  }

  const passwordInput = await page.$('input[type="password"]');
  if (passwordInput) {
    await passwordInput.click();
    await page.keyboard.type("123456", { delay: 50 });
    console.log("✅ 输入密码: 123456");
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/ai-test-02-login-filled.png" });

  const loginButton = await page.$('button:has-text("登录")');
  if (loginButton) {
    await loginButton.click();
    console.log("✅ 点击登录按钮");
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/ai-test-03-after-login.png" });
  console.log("✅ 登录后截图已保存");
}

// 步骤3: 查找AI输入框
console.log("\n📝 步骤 3: 查找AI对话输入框...");
await page.screenshot({ path: "tmp/ai-test-04-main-page.png", fullPage: true });

// 获取页面结构
const snapshot = await client.getAISnapshot("ai-test");
console.log("页面结构:\n", snapshot.substring(0, 500));

await client.disconnect();
console.log("\n✅ 测试步骤1-3完成,请查看截图");
