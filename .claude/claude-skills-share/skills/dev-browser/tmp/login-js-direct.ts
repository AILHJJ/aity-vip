import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("开始登录流程...");

// 等待页面加载
await page.waitForTimeout(1000);

// 使用 JavaScript 直接设置输入框的值
console.log("使用 JavaScript 直接设置输入框的值...");

await page.evaluate(() => {
  // 查找邮箱输入框
  const emailInput = document.querySelector('input[placeholder="请输入邮箱"]') as HTMLInputElement;
  if (emailInput) {
    // 移除 readonly 属性
    emailInput.removeAttribute('readonly');
    emailInput.value = 'tdxhuangzhengni@tdx.com.cn';
    // 触发 input 事件
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
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

// 5. 勾选同意协议
console.log("勾选同意协议...");
const agreementCheckbox = await client.selectSnapshotRef("login", "e37");
await agreementCheckbox.click();
await page.waitForTimeout(500);

// 6. 截图
await page.screenshot({ path: "tmp/before-login-js.png" });

// 7. 点击登录按钮
console.log("点击登录按钮...");
await page.locator('text=登录').first().click();

// 8. 等待页面跳转
await page.waitForTimeout(5000);

// 9. 截图并查看当前页面
await page.screenshot({ path: "tmp/after-login-js.png" });
console.log({
  url: page.url(),
  title: await page.title()
});

// 10. 获取登录后的页面 snapshot
try {
  const snapshot = await client.getAISnapshot("login");
  console.log("登录后的页面结构:");
  console.log(snapshot);
} catch (error) {
  console.log("获取 snapshot 失败,可能页面已经跳转");
}

await client.disconnect();
