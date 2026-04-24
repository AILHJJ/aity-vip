import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("切换到手机号登录...");

// 1. 点击手机标签
const phoneTab = await client.selectSnapshotRef("login", "e11");
await phoneTab.click();
await page.waitForTimeout(1000);

// 2. 获取新的 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("手机登录页面结构:");
console.log(snapshot);

await page.screenshot({ path: "tmp/phone-login-page.png" });

await client.disconnect();
