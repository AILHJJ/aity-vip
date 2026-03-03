import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

// 1. 点击"邮箱"标签
console.log("点击邮箱标签...");
const emailTab = await client.selectSnapshotRef("login", "e14");
await emailTab.click();
await page.waitForTimeout(1000);

// 2. 获取新的 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("切换到邮箱后的页面结构:");
console.log(snapshot);

await client.disconnect();
