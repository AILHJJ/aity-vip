import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("点击同意协议...");

// 等待页面加载
await page.waitForTimeout(1000);

// 点击同意按钮
console.log("点击同意按钮...");
const agreeButton = await client.selectSnapshotRef("login", "e88");
await agreeButton.click();

// 等待
await page.waitForTimeout(2000);

// 截图
await page.screenshot({ path: "tmp/after-agree.png" });

// 获取当前页面 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("同意协议后的页面结构:");
console.log(snapshot);

console.log({
  url: page.url(),
  title: await page.title()
});

await client.disconnect();
