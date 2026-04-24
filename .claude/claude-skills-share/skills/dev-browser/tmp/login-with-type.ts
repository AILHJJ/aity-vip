import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("重新开始 - 使用 type 方法输入...");

// 等待页面加载
await page.waitForTimeout(1000);

// 1. 点击手机号输入框并清空
console.log("清空并重新输入手机号...");
const phoneInput = await page.locator('input[placeholder="请输入手机号"]');
await phoneInput.click({ clickCount: 3 }); // 三击选中全部
await page.keyboard.press('Backspace');
await page.waitForTimeout(300);

// 2. 逐个字符输入手机号
await page.keyboard.type('18162327517', { delay: 100 });
await page.waitForTimeout(500);

// 3. 点击验证码输入框
console.log("输入验证码...");
const smsInput = await page.locator('input[placeholder="请输入验证码"]');
await smsInput.click();
await page.waitForTimeout(300);

// 4. 逐个字符输入验证码
await page.keyboard.type('111111', { delay: 100 });
await page.waitForTimeout(500);

// 5. 截图
await page.screenshot({ path: "tmp/before-type-login.png" });

// 6. 点击登录按钮
console.log("点击登录按钮...");
const loginButton = await client.selectSnapshotRef("login", "e33");
await loginButton.click();

// 7. 等待页面跳转
console.log("等待页面跳转...");
await page.waitForTimeout(5000);

// 8. 截图并查看当前页面
await page.screenshot({ path: "tmp/after-type-login.png" });
const currentUrl = page.url();
console.log({
  url: currentUrl,
  title: await page.title()
});

// 9. 检查是否登录成功
if (!currentUrl.includes('login')) {
  console.log("✅ 登录成功!");
  const snapshot = await client.getAISnapshot("login");
  console.log("登录后的页面结构:");
  console.log(snapshot);
} else {
  console.log("❌ 登录失败,仍在登录页面");
  // 获取当前页面状态
  const snapshot = await client.getAISnapshot("login");
  console.log("当前页面结构:");
  console.log(snapshot);
}

await client.disconnect();
