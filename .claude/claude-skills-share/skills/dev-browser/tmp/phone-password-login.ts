import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("切换到手机号密码登录...");

// 1. 点击"账号密码登录"
const passwordLoginBtn = await client.selectSnapshotRef("login", "e32");
await passwordLoginBtn.click();
await page.waitForTimeout(1000);

// 2. 获取新的 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("手机号密码登录页面结构:");
console.log(snapshot);

await page.screenshot({ path: "tmp/phone-password-login.png" });

await client.disconnect();
