const { test, expect } = require('@playwright/test');

test('Android设备测试', async ({ page }) => {
  // 访问H5应用
  await page.goto('http://localhost:5173/#/pages/login/login');
  
  // 验证登录页面是否加载成功
  await expect(page).toHaveTitle('登录');
  
  // 输入账号密码
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  
  // 点击登录按钮
  await page.click('button');
  
  // 验证是否跳转到首页
  await expect(page).toHaveURL('http://localhost:5173/#/pages/index/index');
  
  // 验证首页是否加载成功
  await expect(page.locator('.uni-page-head__title')).toHaveText('首页');
  
  console.log('Android设备测试成功！');
});
