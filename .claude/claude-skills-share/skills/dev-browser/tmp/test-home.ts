import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("aity-home", { viewport: { width: 1920, height: 1080 } });

// 访问项目首页
await page.goto("http://localhost:5173");
await waitForPageLoad(page);

// 截图
await page.screenshot({ path: "tmp/home-page.png" });

// 获取页面信息
const title = await page.title();
const url = page.url();

// 获取 ARIA 快照来了解页面结构
const snapshot = await client.getAISnapshot("aity-home");

console.log("=== 页面信息 ===");
console.log("标题:", title);
console.log("URL:", url);
console.log("\n=== 页面结构 ===");
console.log(snapshot);

await client.disconnect();
