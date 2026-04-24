import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("开始登录流程...");

// 等待页面加载
await page.waitForTimeout(1000);

// 1. 点击邮箱输入框使其获得焦点
console.log("点击邮箱输入框...");
await page.locator('input[placeholder="请输入邮箱"]').click();
await page.waitForTimeout(500);

// 2. 使用 keyboard.type 输入邮箱
console.log("输入邮箱: tdxhuangzhengni@tdx.com.cn");
await page.keyboard.type("tdxhuangzhengni@tdx.com.cn", { delay: 50 });
await page.waitForTimeout(500);

// 3. 点击密码输入框
console.log("点击密码输入框...");
await page.locator('input[placeholder="请输入密码"]').click();
await page.waitForTimeout(500);

// 4. 输入密码
console.log("输入密码: 12345678");
await page.keyboard.type("12345678", { delay: 50 });
await page.waitForTimeout(500);

// 5. 勾选同意协议
console.log("勾选同意协议...");
const agreementCheckbox = await client.selectSnapshotRef("login", "e37");
await agreementCheckbox.click();
await page.waitForTimeout(500);

// 6. 截图
await page.screenshot({ path: "tmp/before-login-with-agreement.png" });

// 7. 点击登录按钮
console.log("点击登录按钮...");
await page.locator('text=登录').first().click();

// 8. 等待页面跳转
await page.waitForTimeout(5000);

// 9. 截图并查看当前页面
await page.screenshot({ path: "tmp/after-login-with-agreement.png" });
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
