import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
// 创建新页面
const page = await client.page("aity-test", { viewport: { width: 1920, height: 1080 } });

// 访问项目首页
await page.goto("http://localhost:5173");
await waitForPageLoad(page);
await page.waitForTimeout(3000);

// 获取 ARIA 快照来了解页面结构
const snapshot = await client.getAISnapshot("aity-test");

console.log("=== 登录页面结构 ===");
console.log(snapshot);

// 截图
await page.screenshot({ path: "tmp/login-ready.png" });
console.log("\n登录页面截图已保存到 tmp/login-ready.png");

await client.disconnect();
