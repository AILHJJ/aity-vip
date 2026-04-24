// tests/e2e/example.spec.js
const { test, expect } = require('@playwright/test');

test('首页加载测试', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/投研图灵室/);
});

test('登录功能测试', async ({ page }) => {
  await page.goto('/#/pages/login/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("登录")');
  await expect(page).toHaveURL(/.*index/);
});
