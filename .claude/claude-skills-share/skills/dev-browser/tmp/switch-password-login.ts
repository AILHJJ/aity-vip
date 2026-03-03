import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

// 点击"账号密码登录"
console.log("切换到账号密码登录...");
const passwordLoginBtn = await client.selectSnapshotRef("login", "e54");
await passwordLoginBtn.click();
await page.waitForTimeout(1000);

// 获取新的 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("账号密码登录页面结构:");
console.log(snapshot);

await page.screenshot({ path: "tmp/password-login.png" });

await client.disconnect();
