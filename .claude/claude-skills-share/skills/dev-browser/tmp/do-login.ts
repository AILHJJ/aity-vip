import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("开始登录流程...");

// 1. 填写邮箱
console.log("填写邮箱: tdxhuangzhengni@tdx.com.cn");
const emailInput = await client.selectSnapshotRef("login", "e47");
await emailInput.fill("tdxhuangzhengni@tdx.com.cn");
await page.waitForTimeout(500);

// 2. 填写密码
console.log("填写密码: 12345678");
const passwordInput = await client.selectSnapshotRef("login", "e58");
await passwordInput.fill("12345678");
await page.waitForTimeout(500);

// 3. 截图
await page.screenshot({ path: "tmp/before-login.png" });

// 4. 点击登录按钮
console.log("点击登录按钮...");
const loginButton = await client.selectSnapshotRef("login", "e33");
await loginButton.click();

// 5. 等待页面跳转
await page.waitForTimeout(3000);

// 6. 截图并查看当前页面
await page.screenshot({ path: "tmp/after-login.png" });
console.log({
  url: page.url(),
  title: await page.title()
});

// 7. 获取登录后的页面 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("登录后的页面结构:");
console.log(snapshot);

await client.disconnect();
