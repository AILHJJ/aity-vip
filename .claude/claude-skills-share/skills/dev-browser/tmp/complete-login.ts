import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("重新开始登录流程...");

// 等待页面加载
await page.waitForTimeout(1000);

// 使用邮箱账号登录
console.log("切换到邮箱登录...");
const emailTab = await client.selectSnapshotRef("login", "e14");
await emailTab.click();
await page.waitForTimeout(1000);

// 点击"账号密码登录"
console.log("切换到账号密码登录...");
const passwordLoginBtn = await client.selectSnapshotRef("login", "e54");
await passwordLoginBtn.click();
await page.waitForTimeout(1000);

// 填写邮箱和密码
console.log("填写邮箱和密码...");
await page.evaluate(() => {
  const emailInput = document.querySelector('input[placeholder="请输入邮箱"]') as HTMLInputElement;
  if (emailInput) {
    emailInput.removeAttribute('readonly');
    emailInput.value = 'tdxhuangzhengni@tdx.com.cn';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

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
await page.screenshot({ path: "tmp/ready-to-login.png" });

// 获取当前页面 snapshot
const snapshot = await client.getAISnapshot("login");
console.log("当前页面结构:");
console.log(snapshot);

await client.disconnect();
