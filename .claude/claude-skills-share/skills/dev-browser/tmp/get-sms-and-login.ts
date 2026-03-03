import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("获取验证码并登录...");

// 等待页面加载
await page.waitForTimeout(1000);

// 点击"获取验证码"
console.log("点击获取验证码...");
const getSmsBtn = await client.selectSnapshotRef("login", "e94");
await getSmsBtn.click();
await page.waitForTimeout(2000);

// 输入验证码
console.log("输入短信验证码: 111111");
await page.evaluate(() => {
  const smsInput = document.querySelector('input[placeholder="请输入验证码"]') as HTMLInputElement;
  if (smsInput) {
    smsInput.removeAttribute('readonly');
    smsInput.value = '111111';
    smsInput.dispatchEvent(new Event('input', { bubbles: true }));
    smsInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

await page.waitForTimeout(500);

// 截图
await page.screenshot({ path: "tmp/before-sms-final-login.png" });

// 点击登录按钮
console.log("点击登录按钮...");
const loginButton = await client.selectSnapshotRef("login", "e33");
await loginButton.click();

// 等待页面跳转
console.log("等待页面跳转...");
await page.waitForTimeout(5000);

// 截图并查看当前页面
await page.screenshot({ path: "tmp/after-sms-final-login.png" });
console.log({
  url: page.url(),
  title: await page.title()
});

// 检查是否登录成功
if (!page.url().includes('login')) {
  console.log("✅ 登录成功!");
  // 获取登录后的页面 snapshot
  const snapshot = await client.getAISnapshot("login");
  console.log("登录后的页面结构:");
  console.log(snapshot);
} else {
  console.log("❌ 登录可能失败,仍在登录页面");
}

await client.disconnect();
