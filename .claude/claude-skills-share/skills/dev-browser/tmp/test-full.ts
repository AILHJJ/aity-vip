import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("aity-home");

// 刷新页面
await page.reload();
await waitForPageLoad(page);
await page.waitForTimeout(3000);

// 获取 ARIA 快照来了解页面结构
const snapshot = await client.getAISnapshot("aity-home");

console.log("=== 登录页面结构 ===");
console.log(snapshot);

// 截图
await page.screenshot({ path: "tmp/login-page-refreshed.png" });
console.log("\n登录页面截图已保存");

await client.disconnect();
