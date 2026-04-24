import { connect, waitForPageLoad } from "@/client.js";
import fs from "fs";

const BASE_URL = "http://localhost:5173";

console.log("\n" + "=".repeat(60));
console.log("🚀 AITY VIP 完整自动化测试");
console.log("=".repeat(60));
console.log(`🌐 测试地址: ${BASE_URL}`);
console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
console.log("=".repeat(60) + "\n");

const client = await connect();
const page = await client.page("aity-full-test", { viewport: { width: 1280, height: 800 } });

const results = { passed: 0, failed: 0, tests: [] as any[] };
const startTime = Date.now();

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
// 测试 1: 登录页面
// ============================================
console.log("📝 测试 1: 登录页面加载");
try {
  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await waitForPageLoad(page);
  await page.waitForTimeout(3000);
  await screenshot("test-01-login-page");

  const snapshot = await client.getAISnapshot("aity-full-test");
  console.log("  📋 页面元素:\n" + snapshot.substring(0, 500));

  logTest("登录页面加载", true);
} catch (e: any) {
  logTest("登录页面加载", false, e.message);
}

// ============================================
// 测试 2: 管理员登录
// ============================================
console.log("\n📝 测试 2: 管理员登录");
try {
  // 查找所有输入框
  const allInputs = await page.locator('input').all();
  console.log(`  🔍 找到 ${allInputs.length} 个input元素`);

  // 填写登录信息
  const emailInput = page.locator('input').nth(0);
  const passwordInput = page.locator('input').nth(1);
  const loginButton = page.locator('button:has-text("登录")');

  await emailInput.fill("admin@example.com");
  console.log("  ✓ 填写邮箱");

  await passwordInput.fill("123456");
  console.log("  ✓ 填写密码");

  await loginButton.click();
  console.log("  ✓ 点击登录按钮");

  await page.waitForTimeout(3000);
  await screenshot("test-02-after-login");

  const currentUrl = page.url();
  const loginSuccess = !currentUrl.includes("login");

  if (loginSuccess) {
    console.log(`  ✓ 登录成功，跳转到: ${currentUrl}`);
  } else {
    console.log(`  ✗ 仍在登录页: ${currentUrl}`);
  }

  logTest("管理员登录", loginSuccess, loginSuccess ? null : "登录后仍在登录页");
} catch (e: any) {
  await screenshot("test-02-login-error");
  logTest("管理员登录", false, e.message);
}

// ============================================
// 测试 3-11: 各功能页面（需要登录后访问）
// ============================================
const testPages = [
  { name: "首页", path: "/#/pages/index/index", screenshot: "test-03-index" },
  { name: "消息列表", path: "/#/pages/messages/messages", screenshot: "test-04-messages" },
  { name: "消息详情", path: "/#/pages/message-detail/message-detail?id=1", screenshot: "test-05-message-detail" },
  { name: "讨论列表", path: "/#/pages/discussions/discussions", screenshot: "test-06-discussions" },
  { name: "收藏页面", path: "/#/pages/favorites/favorites", screenshot: "test-07-favorites" },
  { name: "个人中心", path: "/#/pages/profile/profile", screenshot: "test-08-profile" },
  { name: "用户管理", path: "/#/pages/user-management/user-management", screenshot: "test-09-user-management" },
  { name: "AI投顾", path: "/#/pages/ai-advisor/ai-advisor", screenshot: "test-10-ai-advisor" },
  { name: "行情中心", path: "/#/pages/market/market", screenshot: "test-11-market" }
];

for (let i = 0; i < testPages.length; i++) {
  const p = testPages[i];
  console.log(`\n📝 测试 ${i + 3}: ${p.name}`);
  try {
    await page.goto(`${BASE_URL}${p.path}`);
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    await screenshot(p.screenshot);

    const title = await page.title();
    const url = page.url();
    console.log(`  📄 标题: ${title}`);
    console.log(`  🔗 URL: ${url}`);

    logTest(`${p.name}加载`, true);
  } catch (e: any) {
    logTest(`${p.name}加载`, false, e.message);
  }
}

// ============================================
// 测试 12: 完整用户流程
// ============================================
console.log("\n📝 测试 12: 完整用户流程");
try {
  const flowPages = [
    "/#/pages/index/index",
    "/#/pages/messages/messages",
    "/#/pages/discussions/discussions",
    "/#/pages/favorites/favorites",
    "/#/pages/profile/profile"
  ];

  for (const path of flowPages) {
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForTimeout(500);
  }

  await screenshot("test-12-full-flow");
  logTest("完整用户流程", true);
} catch (e: any) {
  logTest("完整用户流程", false, e.message);
}

// ============================================
// 输出测试报告
// ============================================
const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);
const total = results.passed + results.failed;

console.log("\n" + "=".repeat(60));
console.log("📊 测试结果汇总");
console.log("=".repeat(60));
console.log(`✅ 通过: ${results.passed}/${total}`);
console.log(`❌ 失败: ${results.failed}/${total}`);
console.log(`⏱️ 耗时: ${duration}秒`);
console.log(`📸 截图目录: C:/Users/DELL/.claude/skills/dev-browser/tmp/`);
console.log("=".repeat(60));

console.log("\n📋 详细测试结果:");
results.tests.forEach((t, i) => {
  const status = t.passed ? "✅" : "❌";
  console.log(`  ${status} ${i + 1}. ${t.name}${t.error ? ` - ${t.error}` : ""}`);
});

// 保存测试报告
const report = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  duration: `${duration}s`,
  summary: {
    total,
    passed: results.passed,
    failed: results.failed
  },
  tests: results.tests
};
fs.writeFileSync('tmp/test-report.json', JSON.stringify(report, null, 2));
console.log("\n📄 测试报告已保存: tmp/test-report.json");

await client.disconnect();
