import { connect, waitForPageLoad } from "@/client.js";
import fs from "fs";

const BASE_URL = "http://localhost:5173";

console.log("\n" + "=".repeat(60));
console.log("🔐 登录功能专项测试");
console.log("=".repeat(60));
console.log(`🌐 测试地址: ${BASE_URL}`);
console.log("👤 测试账号: admin / 123456");
console.log("=".repeat(60) + "\n");

const client = await connect();
const page = await client.page("login-test", { viewport: { width: 1280, height: 800 } });

const results = { passed: 0, failed: 0, tests: [] as any[] };

async function screenshot(name: string) {
  await page.screenshot({ path: `tmp/${name}.png`, fullPage: true });
  console.log(`  📸 截图: tmp/${name}.png`);
}

function logTest(name: string, passed: boolean, error: string | null = null) {
  if (passed) {
    results.passed++;
    console.log(`  ✅ ${name}`);
  } else {
    results.failed++;
    console.log(`  ❌ ${name}: ${error}`);
  }
  results.tests.push({ name, passed, error });
}

// ============================================
// 登录测试
// ============================================
console.log("📝 步骤 1: 访问登录页面");
try {
  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await waitForPageLoad(page);
  await page.waitForTimeout(3000);
  await screenshot("login-01-page");

  const snapshot = await client.getAISnapshot("login-test");
  console.log("  📋 页面快照:\n" + snapshot);

  logTest("访问登录页面", true);
} catch (e: any) {
  logTest("访问登录页面", false, e.message);
}

// ============================================
console.log("\n📝 步骤 2: 填写登录表单");
try {
  // 使用快照中的ref找到输入框
  const usernameInput = await client.selectSnapshotRef("login-test", "e17");
  const passwordInput = await client.selectSnapshotRef("login-test", "e22");

  console.log("  ✓ 找到用户名输入框");
  console.log("  ✓ 找到密码输入框");

  // 填写用户名 (使用admin而不是邮箱)
  await usernameInput.fill("admin");
  console.log("  ✓ 填写用户名: admin");

  // 填写密码
  await passwordInput.fill("123456");
  console.log("  ✓ 填写密码: 123456");

  await screenshot("login-02-filled");
  logTest("填写登录表单", true);
} catch (e: any) {
  logTest("填写登录表单", false, e.message);
}

// ============================================
console.log("\n📝 步骤 3: 点击登录按钮");
try {
  // 使用快照中的ref找到登录按钮
  const loginButton = await client.selectSnapshotRef("login-test", "e30");
  console.log("  ✓ 找到登录按钮");

  await loginButton.click();
  console.log("  ✓ 点击登录按钮");

  await page.waitForTimeout(3000);
  await screenshot("login-03-after-click");

  const currentUrl = page.url();
  console.log(`  🔗 当前URL: ${currentUrl}`);

  const loginSuccess = !currentUrl.includes("login");

  if (loginSuccess) {
    console.log("  🎉 登录成功！");
  } else {
    console.log("  ⚠️ 仍在登录页");
  }

  logTest("点击登录按钮", true);
  logTest("登录成功", loginSuccess, loginSuccess ? null : "仍停留在登录页");
} catch (e: any) {
  await screenshot("login-03-error");
  logTest("点击登录按钮", false, e.message);
}

// ============================================
// 输出结果
// ============================================
const total = results.passed + results.failed;
console.log("\n" + "=".repeat(60));
console.log("📊 登录测试结果");
console.log("=".repeat(60));
console.log(`✅ 通过: ${results.passed}/${total}`);
console.log(`❌ 失败: ${results.failed}/${total}`);
console.log("=".repeat(60));

console.log("\n📋 详细结果:");
results.tests.forEach((t, i) => {
  const status = t.passed ? "✅" : "❌";
  console.log(`  ${status} ${i + 1}. ${t.name}${t.error ? ` - ${t.error}` : ""}`);
});

await client.disconnect();
