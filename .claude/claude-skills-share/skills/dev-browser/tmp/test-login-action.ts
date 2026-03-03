import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("aity-test");

// 获取页面元素
const snapshot = await client.getAISnapshot("aity-test");
console.log("=== 当前页面结构 ===");
console.log(snapshot);

// 使用 ref 填写登录表单
console.log("\n=== 开始登录测试 ===");

// 填写用户名
const usernameInput = await client.selectSnapshotRef("aity-test", "e17");
await usernameInput.fill("admin@example.com");
console.log("✓ 已填写用户名");

// 填写密码
const passwordInput = await client.selectSnapshotRef("aity-test", "e22");
await passwordInput.fill("admin123");
console.log("✓ 已填写密码");

// 截图 - 登录前
await page.screenshot({ path: "tmp/before-login.png" });
console.log("✓ 已保存登录前截图");

// 点击登录按钮
const loginButton = await client.selectSnapshotRef("aity-test", "e30");
await loginButton.click();
console.log("✓ 已点击登录按钮");

// 等待页面跳转
await page.waitForTimeout(3000);

// 截图 - 登录后
await page.screenshot({ path: "tmp/after-login.png" });
console.log("✓ 已保存登录后截图");

// 获取登录后的页面信息
const newSnapshot = await client.getAISnapshot("aity-test");
console.log("\n=== 登录后页面结构 ===");
console.log(newSnapshot);

console.log("\n当前URL:", page.url());
console.log("页面标题:", await page.title());

await client.disconnect();
