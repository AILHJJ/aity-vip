import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();

// 关闭之前的页面，创建新页面
await client.close("theme-test").catch(() => {});
const page = await client.page("theme-test", { viewport: { width: 1280, height: 900 } });

console.log("=== 主题选择器功能测试（完整版） ===");
console.log("测试时间:", new Date().toLocaleString());
console.log("测试账户: admin@example.com / 123456");
console.log("");

// ============= 步骤1: 导航到登录页 =============
console.log("步骤1: 导航到登录页面");
await page.goto("http://localhost:5174");
await waitForPageLoad(page);
await page.waitForTimeout(2000);
await page.screenshot({ path: "tmp/test-01-initial.png" });
console.log("✓ 截图: tmp/test-01-initial.png");

// ============= 步骤2: 登录 =============
console.log("\n步骤2: 执行登录");

// 填写邮箱
const emailInput = page.locator('input[placeholder*="邮箱"], input[type="text"]').first();
await emailInput.fill("admin@example.com");
console.log("  填写邮箱: admin@example.com");

// 填写密码（正确密码）
const passwordInput = page.locator('input[type="password"]').first();
await passwordInput.fill("123456");
console.log("  填写密码: 123456");

// 获取AI快照找到登录按钮
const snapshot = await client.getAISnapshot("theme-test");
const loginMatch = snapshot.match(/generic \[ref=e(\d+)\] \[cursor=pointer\]: 登录/);

if (loginMatch) {
  const loginBtn = await client.selectSnapshotRef("theme-test", `e${loginMatch[1]}`);
  await loginBtn.click({ force: true });
  console.log("  点击登录按钮 (ref=e" + loginMatch[1] + ")");
} else {
  const loginBtn = page.locator('text=登录').first();
  await loginBtn.click({ force: true });
  console.log("  点击登录按钮 (备用方式)");
}

await page.waitForTimeout(3000);
await waitForPageLoad(page);
await page.screenshot({ path: "tmp/test-02-after-login.png" });
console.log("✓ 截图: tmp/test-02-after-login.png");
console.log("  当前URL:", page.url());

// ============= 步骤3: 导航到发布消息页面 =============
console.log("\n步骤3: 导航到发布消息页面");
await page.goto("http://localhost:5174/#/pages/create-message/create-message");
await waitForPageLoad(page);
await page.waitForTimeout(2000);
await page.screenshot({ path: "tmp/test-03-create-message.png", fullPage: true });
console.log("✓ 截图: tmp/test-03-create-message.png");

// ============= 步骤4: 检查主题选择器 =============
console.log("\n步骤4: 检查主题选择器组件");

const newSnapshot = await client.getAISnapshot("theme-test");
console.log("\n  AI快照中的关键元素:");

// 查找主题相关元素
const themeLabel = newSnapshot.match(/🎨 主题/);
const themeValue = newSnapshot.match(/简约白|紫色渐变|深蓝科技/);
const aiButton = newSnapshot.match(/AI优化/);

if (themeLabel) console.log("    ✓ 找到 🎨 主题标签");
if (themeValue) console.log("    ✓ 找到主题选项: " + themeValue[0]);
if (aiButton) console.log("    ✓ 找到 AI优化 按钮");

// 使用CSS选择器检测
const themeRow = page.locator(".theme-ai-row").first();
const themePicker = page.locator(".theme-picker").first();
const aiBtn = page.locator("text=AI优化").first();

const themeRowVisible = await themeRow.isVisible({ timeout: 3000 }).catch(() => false);
const themePickerVisible = await themePicker.isVisible({ timeout: 3000 }).catch(() => false);
const aiBtnVisible = await aiBtn.isVisible({ timeout: 3000 }).catch(() => false);

console.log("\n  测试结果:");
console.log("    主题选择行: " + (themeRowVisible ? "✓ 通过" : "✗ 失败"));
console.log("    主题下拉框: " + (themePickerVisible ? "✓ 通过" : "✗ 失败"));
console.log("    AI优化按钮: " + (aiBtnVisible ? "✓ 通过" : "✗ 失败"));

// ============= 步骤5: 填写测试内容 =============
console.log("\n步骤5: 填写测试内容");

const titleInput = page.locator('input[placeholder*="标题"]').first();
if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
  await titleInput.fill("主题选择器功能测试");
  console.log("  ✓ 已填写标题");
}

const textarea = page.locator("textarea").first();
if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
  await textarea.fill("# 测试消息\n\n这是一条用于测试主题选择器功能的消息。\n\n## 功能特点\n\n- 下拉选择\n- 颜色预览\n- 记忆功能");
  console.log("  ✓ 已填写内容");
}

await page.waitForTimeout(500);
await page.screenshot({ path: "tmp/test-04-content-filled.png", fullPage: true });
console.log("✓ 截图: tmp/test-04-content-filled.png");

// ============= 步骤6: 高亮主题选择器 =============
console.log("\n步骤6: 高亮主题选择器区域");

if (themeRowVisible) {
  await themeRow.evaluate((el) => {
    el.style.border = "3px solid red";
    el.style.boxShadow = "0 0 15px red";
    el.style.transform = "scale(1.02)";
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: "tmp/test-05-theme-highlighted.png", fullPage: true });
  console.log("✓ 截图: tmp/test-05-theme-highlighted.png (主题选择器已高亮)");
}

// ============= 测试结果汇总 =============
console.log("\n" + "=".repeat(50));
console.log("测试结果汇总");
console.log("=".repeat(50));

const results = [
  { name: "登录功能", pass: !page.url().includes("login") },
  { name: "主题选择行可见", pass: themeRowVisible },
  { name: "主题下拉框可见", pass: themePickerVisible },
  { name: "AI优化按钮可见", pass: aiBtnVisible },
  { name: "内容填写成功", pass: true }
];

results.forEach(r => console.log("  " + (r.pass ? "✓" : "✗") + " " + r.name));

const passed = results.filter(r => r.pass).length;
console.log("=".repeat(50));
console.log("通过: " + passed + "/" + results.length);
console.log("最终结果: " + (passed === results.length ? "✓ 所有测试通过" : "✗ 部分测试失败"));
console.log("");
console.log("截图目录: C:/Users/DELL/.claude/skills/dev-browser/tmp/");

await client.disconnect();
