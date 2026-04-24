import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("开始手机号密码登录流程...");

// 等待页面加载
await page.waitForTimeout(1000);

// 使用 JavaScript 直接设置输入框的值
console.log("填写手机号和密码...");

await page.evaluate(() => {
  // 查找手机号输入框
  const phoneInput = document.querySelector('input[placeholder="请输入手机号"]') as HTMLInputElement;
  if (phoneInput) {
    phoneInput.removeAttribute('readonly');
    phoneInput.value = '18162327517';
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 查找密码输入框
  const passwordInput = document.querySelector('input[placeholder="请输入密码"]') as HTMLInputElement;
  if (passwordInput) {
    passwordInput.removeAttribute('readonly');
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

await page.waitForTimeout(500);

// 勾选同意协议
console.log("勾选同意协议...");
const agreementCheckbox = await client.selectSnapshotRef("login", "e37");
await agreementCheckbox.click();
await page.waitForTimeout(500);

// 截图
await page.screenshot({ path: "tmp/before-phone-login.png" });

// 点击登录按钮
console.log("点击登录按钮...");
const loginButton = await client.selectSnapshotRef("login", "e33");
await loginButton.click();

// 等待页面跳转
console.log("等待页面跳转...");
await page.waitForTimeout(5000);

// 截图并查看当前页面
await page.screenshot({ path: "tmp/after-phone-login.png" });
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
