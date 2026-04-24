import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("使用手机号和验证码登录...");

// 等待页面加载
await page.waitForTimeout(1000);

// 获取当前页面 snapshot
let snapshot = await client.getAISnapshot("login");
console.log("当前页面结构:");
console.log(snapshot);

// 确保在手机验证码登录页面
console.log("切换到手机标签...");
const phoneTab = await client.selectSnapshotRef("login", "e11");
await phoneTab.click();
await page.waitForTimeout(1000);

// 填写手机号
console.log("填写手机号: 18162327517");
await page.evaluate(() => {
  const phoneInput = document.querySelector('input[placeholder="请输入手机号"]') as HTMLInputElement;
  if (phoneInput) {
    phoneInput.removeAttribute('readonly');
    phoneInput.value = '18162327517';
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

await page.waitForTimeout(500);

// 填写验证码
console.log("填写验证码: 111111");
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

// 勾选同意协议
console.log("勾选同意协议...");
const agreementCheckbox = await client.selectSnapshotRef("login", "e37");
await agreementCheckbox.click();
await page.waitForTimeout(500);

// 截图
await page.screenshot({ path: "tmp/before-sms-login.png" });

// 点击登录按钮
console.log("点击登录按钮...");
const loginButton = await client.selectSnapshotRef("login", "e33");
await loginButton.click();

// 等待页面跳转
console.log("等待页面跳转...");
await page.waitForTimeout(5000);

// 截图并查看当前页面
await page.screenshot({ path: "tmp/after-sms-login.png" });
console.log({
  url: page.url(),
  title: await page.title()
});

// 获取登录后的页面 snapshot
try {
  snapshot = await client.getAISnapshot("login");
  console.log("登录后的页面结构:");
  console.log(snapshot);
} catch (error) {
  console.log("获取 snapshot 失败,可能页面已经跳转");
}

await client.disconnect();
