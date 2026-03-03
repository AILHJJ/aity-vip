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
const page = await client.page("full-test", { viewport: { width: 1280, height: 800 } });

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
// 测试 1: 登录
// ============================================
console.log("📝 测试 1: 用户登录");
try {
  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await waitForPageLoad(page);
  await page.waitForTimeout(2000);

  // 获取页面快照
  const snapshot = await client.getAISnapshot("full-test");

  // 使用快照ref找到元素
  const usernameInput = await client.selectSnapshotRef("full-test", "e17");
  const passwordInput = await client.selectSnapshotRef("full-test", "e22");
  const loginButton = await client.selectSnapshotRef("full-test", "e30");

  await usernameInput.fill("admin");
  await passwordInput.fill("123456");
  await loginButton.click();

  await page.waitForTimeout(3000);
  await screenshot("final-01-login");

  const currentUrl = page.url();
  const loginSuccess = !currentUrl.includes("login");
  logTest("用户登录", loginSuccess, loginSuccess ? null : "登录失败");
} catch (e: any) {
  await screenshot("final-01-login-error");
  logTest("用户登录", false, e.message);
}

// ============================================
// 测试 2-10: 各功能页面
// ============================================
const testPages = [
  { name: "首页", path: "/#/pages/index/index", screenshot: "final-02-index" },
  { name: "消息列表", path: "/#/pages/messages/messages", screenshot: "final-03-messages" },
  { name: "消息详情", path: "/#/pages/message-detail/message-detail?id=1", screenshot: "final-04-message-detail" },
  { name: "讨论列表", path: "/#/pages/discussions/discussions", screenshot: "final-05-discussions" },
  { name: "收藏页面", path: "/#/pages/favorites/favorites", screenshot: "final-06-favorites" },
  { name: "个人中心", path: "/#/pages/profile/profile", screenshot: "final-07-profile" },
  { name: "用户管理", path: "/#/pages/user-management/user-management", screenshot: "final-08-user-management" },
  { name: "AI投顾", path: "/#/pages/ai-advisor/ai-advisor", screenshot: "final-09-ai-advisor" },
  { name: "行情中心", path: "/#/pages/market/market", screenshot: "final-10-market" }
];

for (let i = 0; i < testPages.length; i++) {
  const p = testPages[i];
  console.log(`\n📝 测试 ${i + 2}: ${p.name}`);
  try {
    await page.goto(`${BASE_URL}${p.path}`);
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    await screenshot(p.screenshot);

    const title = await page.title();
    const url = page.url();
    console.log(`  📄 标题: ${title}`);
    console.log(`  🔗 URL: ${url.split('/').slice(3).join('/')}`);

    logTest(`${p.name}加载`, true);
  } catch (e: any) {
    logTest(`${p.name}加载`, false, e.message);
  }
}

// ============================================
// 测试 11: 页面导航流程
// ============================================
console.log("\n📝 测试 11: 页面导航流程");
try {
  const navPages = [
    "/#/pages/index/index",
    "/#/pages/messages/messages",
    "/#/pages/discussions/discussions",
    "/#/pages/favorites/favorites",
    "/#/pages/profile/profile",
    "/#/pages/market/market"
  ];

  for (const path of navPages) {
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForTimeout(300);
  }

  await screenshot("final-11-navigation");
  logTest("页面导航流程", true);
} catch (e: any) {
  logTest("页面导航流程", false, e.message);
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
console.log(`📸 截图数: ${total + 1}`);
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
fs.writeFileSync('tmp/final-test-report.json', JSON.stringify(report, null, 2));
console.log("\n📄 测试报告已保存: tmp/final-test-report.json");

await client.disconnect();
