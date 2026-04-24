import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("检查当前页面状态...");

// 等待页面加载
await page.waitForTimeout(1000);

// 截图
await page.screenshot({ path: "tmp/current-status.png" });

// 获取当前页面 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("当前页面结构:");
console.log(snapshot);

console.log({
  url: page.url(),
  title: await page.title()
});

await client.disconnect();
