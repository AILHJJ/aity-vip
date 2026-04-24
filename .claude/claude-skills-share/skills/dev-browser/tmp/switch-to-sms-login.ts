import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("切换到验证码登录...");

// 等待页面加载
await page.waitForTimeout(1000);

// 点击"验证码登录"按钮
console.log("点击验证码登录...");
const smsLoginBtn = await client.selectSnapshotRef("login", "e32");
await smsLoginBtn.click();
await page.waitForTimeout(1000);

// 获取新的页面结构
const snapshot = await client.getAISnapshot("login");
console.log("验证码登录页面结构:");
console.log(snapshot);

await page.screenshot({ path: "tmp/sms-login-page.png" });

await client.disconnect();
