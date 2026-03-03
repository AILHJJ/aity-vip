import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("输入图形验证码并登录...");

// 等待页面加载
await page.waitForTimeout(1000);

// 输入图形验证码
console.log("输入图形验证码: 111111");
await page.evaluate(() => {
  const captchaInput = document.querySelector('input[placeholder="请输入图形验证码"]') as HTMLInputElement;
  if (captchaInput) {
    captchaInput.removeAttribute('readonly');
    captchaInput.value = '111111';
    captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
    captchaInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

await page.waitForTimeout(500);

// 截图
await page.screenshot({ path: "tmp/before-final-login.png" });

// 点击登录按钮
console.log("点击登录按钮...");
const loginButton = await client.selectSnapshotRef("login", "e33");
await loginButton.click();

// 等待页面跳转
console.log("等待页面跳转...");
await page.waitForTimeout(5000);

// 截图并查看当前页面
await page.screenshot({ path: "tmp/after-final-login.png" });
console.log({
  url: page.url(),
  title: await page.title()
});

// 获取登录后的页面 snapshot
try {
  const snapshot = await client.getAISnapshot("login");
  console.log("登录后的页面结构:");
  console.log(snapshot);
} catch (error) {
  console.log("获取 snapshot 失败,可能页面已经跳转");
}

await client.disconnect();
