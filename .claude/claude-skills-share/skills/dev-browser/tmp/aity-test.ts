import { connect, waitForPageLoad } from "@/client.js";

async function runTests() {
  const client = await connect();

  // 创建测试页面，开启视频录制
  const page = await client.page("aity-test", {
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: "tmp/videos" }
  });

  console.log("=== 测试开始 ===");
  console.log("1. 导航到H5应用...");

  // 导航到H5应用
  await page.goto("http://localhost:5176");
  await waitForPageLoad(page);

  // 截图查看首页
  await page.screenshot({ path: "tmp/01-homepage.png", fullPage: true });
  console.log("首页截图保存: tmp/01-homepage.png");
  console.log("当前URL:", page.url());

  // 获取页面快照分析
  const snapshot = await client.getAISnapshot("aity-test");
  console.log("\n页面快照:\n", snapshot);

  await client.disconnect();
  console.log("\n=== 第一步完成 ===");
}

runTests().catch(console.error);
