import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();

// 关闭之前的页面，创建新页面
await client.close("final-test").catch(() => {});
const page = await client.page("final-test", { viewport: { width: 1280, height: 900 } });

console.log("=== 主题选择器功能最终验证测试 ===");
console.log("测试时间:", new Date().toLocaleString());
console.log("测试账户: admin@example.com / 123456");
console.log("");

// ============= 步骤1: 导航到登录页 =============
console.log("步骤1: 导航到登录页面");
await page.goto("http://localhost:5174");
await waitForPageLoad(page);
await page.waitForTimeout(2000);
await page.screenshot({ path: "tmp/final-01-initial.png" });
console.log("✓ 截图: tmp/final-01-initial.png");

// ============= 步骤2: 登录 =============
console.log("\n步骤2: 执行登录");

// 填写邮箱
const emailInput = page.locator('input[placeholder*="邮箱"], input[type="text"]').first();
await emailInput.fill("admin@example.com");
console.log("  填写邮箱: admin@example.com");

// 填写密码
const passwordInput = page.locator('input[type="password"]').first();
await passwordInput.fill("123456");
console.log("  填写密码: 123456");

// 获取AI快照找到登录按钮
const snapshot = await client.getAISnapshot("final-test");
const loginMatch = snapshot.match(/generic \[ref=e(\d+)\] \[cursor=pointer\]: 登录/);

if (loginMatch) {
  const loginBtn = await client.selectSnapshotRef("final-test", `e${loginMatch[1]}`);
  await loginBtn.click({ force: true });
  console.log("  点击登录按钮 (ref=e" + loginMatch[1] + ")");
} else {
  const loginBtn = page.locator('text=登录').first();
  await loginBtn.click({ force: true });
  console.log("  点击登录按钮 (备用方式)");
}

await page.waitForTimeout(3000);
await waitForPageLoad(page);
await page.screenshot({ path: "tmp/final-02-after-login.png" });
console.log("✓ 截图: tmp/final-02-after-login.png");
console.log("  当前URL:", page.url());

// ============= 步骤3: 导航到发布消息页面 =============
console.log("\n步骤3: 导航到发布消息页面");
await page.goto("http://localhost:5174/#/pages/create-message/create-message");
await waitForPageLoad(page);
await page.waitForTimeout(3000); // 增加等待时间确保页面完全加载
await page.screenshot({ path: "tmp/final-03-create-message.png", fullPage: true });
console.log("✓ 截图: tmp/final-03-create-message.png");

// ============= 步骤4: 检查主题选择器 =============
console.log("\n步骤4: 检查主题选择器组件");

// 使用更宽松的方式检测元素
const results = {
  login: !page.url().includes("login"),
  themeRow: false,
  themePicker: false,
  aiButton: false,
  themeOptions: false,
  colorPreview: false
};

// 检测主题行 - 使用evaluate直接在页面中查找
results.themeRow = await page.evaluate(() => {
  const el = document.querySelector('.theme-ai-row');
  return el !== null && el.getBoundingClientRect().height > 0;
});

results.themePicker = await page.evaluate(() => {
  const el = document.querySelector('.theme-picker');
  return el !== null && el.getBoundingClientRect().height > 0;
});

results.colorPreview = await page.evaluate(() => {
  const el = document.querySelector('.theme-color-preview');
  return el !== null;
});

// 检测AI优化按钮
const aiBtnText = await page.evaluate(() => {
  return document.body.innerText.includes('AI优化');
});
results.aiButton = aiBtnText;

// 检测主题选项
const themeText = await page.evaluate(() => {
  return document.body.innerText.includes('简约白') &&
         document.body.innerText.includes('暗夜模式');
});
results.themeOptions = themeText;

console.log("\n  测试结果:");
console.log("    登录功能: " + (results.login ? "✓ 通过" : "✗ 失败"));
console.log("    主题选择行: " + (results.themeRow ? "✓ 通过" : "✗ 失败"));
console.log("    主题下拉框: " + (results.themePicker ? "✓ 通过" : "✗ 失败"));
console.log("    AI优化按钮: " + (results.aiButton ? "✓ 通过" : "✗ 失败"));
console.log("    主题选项列表: " + (results.themeOptions ? "✓ 通过" : "✗ 失败"));
console.log("    颜色预览: " + (results.colorPreview ? "✓ 通过" : "✗ 失败"));

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
await page.screenshot({ path: "tmp/final-04-content-filled.png", fullPage: true });
console.log("✓ 截图: tmp/final-04-content-filled.png");

// ============= 步骤6: 高亮主题选择器 =============
console.log("\n步骤6: 高亮主题选择器区域");

if (results.themeRow) {
  await page.evaluate(() => {
    const el = document.querySelector('.theme-ai-row') as HTMLElement;
    if (el) {
      el.style.border = "3px solid red";
      el.style.boxShadow = "0 0 15px red";
      el.style.transform = "scale(1.02)";
    }
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: "tmp/final-05-theme-highlighted.png", fullPage: true });
  console.log("✓ 截图: tmp/final-05-theme-highlighted.png (主题选择器已高亮)");
}

// ============= 测试结果汇总 =============
console.log("\n" + "=".repeat(60));
console.log("测试结果汇总");
console.log("=".repeat(60));

const testItems = [
  { name: "登录功能", pass: results.login },
  { name: "主题选择行可见", pass: results.themeRow },
  { name: "主题下拉框可见", pass: results.themePicker },
  { name: "AI优化按钮显示", pass: results.aiButton },
  { name: "主题选项完整", pass: results.themeOptions },
  { name: "颜色预览组件", pass: results.colorPreview }
];

testItems.forEach(item => {
  console.log("  " + (item.pass ? "✓" : "✗") + " " + item.name);
});

const passed = testItems.filter(t => t.pass).length;
console.log("=".repeat(60));
console.log("通过: " + passed + "/" + testItems.length);

if (passed === testItems.length) {
  console.log("\n✓✓✓ 所有测试通过！主题选择器功能正常！ ✓✓✓");
} else {
  console.log("\n✗ 部分测试失败，需要检查");
}

console.log("\n截图目录: C:/Users/DELL/.claude/skills/dev-browser/tmp/");
console.log("关键截图:");
console.log("  - final-03-create-message.png (页面完整视图)");
console.log("  - final-04-content-filled.png (填写内容后)");
console.log("  - final-05-theme-highlighted.png (主题选择器高亮)");

await client.disconnect();
