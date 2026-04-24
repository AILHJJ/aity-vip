import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("login");

console.log("尝试使用常见测试验证码...");

// 等待页面加载
await page.waitForTimeout(1000);

// 尝试输入常见测试验证码
const testCaptchas = ['1234', '0000', 'test', '8888'];

for (const captcha of testCaptchas) {
  console.log(`\n尝试验证码: ${captcha}`);

  // 清空验证码输入框
  await page.evaluate(() => {
    const captchaInput = document.querySelector('input[placeholder="请输入图形验证码"]') as HTMLInputElement;
    if (captchaInput) {
      captchaInput.removeAttribute('readonly');
      captchaInput.value = '';
      captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await page.waitForTimeout(300);

  // 输入验证码
  await page.evaluate((code) => {
    const captchaInput = document.querySelector('input[placeholder="请输入图形验证码"]') as HTMLInputElement;
    if (captchaInput) {
      captchaInput.value = code;
      captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
      captchaInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, captcha);

  await page.waitForTimeout(500);

  // 点击登录
  const loginButton = await client.selectSnapshotRef("login", "e33");
  await loginButton.click();

  // 等待
  await page.waitForTimeout(3000);

  // 检查是否登录成功
  const currentUrl = page.url();
  console.log(`当前URL: ${currentUrl}`);

  if (!currentUrl.includes('login')) {
    console.log(`✅ 登录成功! 验证码是: ${captcha}`);
    await page.screenshot({ path: "tmp/login-success.png" });

    // 获取登录后的页面 snapshot
    const snapshot = await client.getAISnapshot("login");
    console.log("登录后的页面:");
    console.log(snapshot);

    await client.disconnect();
    process.exit(0);
  }

  console.log(`❌ 验证码 ${captcha} 不正确`);
}

console.log("\n所有常见验证码都失败了");
await page.screenshot({ path: "tmp/captcha-failed.png" });

await client.disconnect();
