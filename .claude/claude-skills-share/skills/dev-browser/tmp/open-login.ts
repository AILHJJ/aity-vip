import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();

// 创建登录页面
const page = await client.page("login", { viewport: { width: 1920, height: 1080 } });

// 打开登录页面
await page.goto("http://192.168.30.134:8081/mobile-login/zh-login.html?langKey=zh-Hans");
await waitForPageLoad(page);

// 截图查看页面
await page.screenshot({ path: "tmp/login-page.png" });

console.log({
  title: await page.title(),
  url: page.url()
});

await client.disconnect();
