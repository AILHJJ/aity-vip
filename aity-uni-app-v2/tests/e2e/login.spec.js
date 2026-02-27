// tests/e2e/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/login/login');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/登录/);
  });

  test('显示应用标题和副标题', async ({ page }) => {
    await expect(page.locator('.app-title')).toHaveText('投研图灵室');
    await expect(page.locator('.app-subtitle')).toHaveText('金融知识学习平台');
  });

  test('显示用户名输入框', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveAttribute('placeholder', '请输入用户名或邮箱');
  });

  test('显示密码输入框', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', '请输入密码');
  });

  test('显示记住我复选框', async ({ page }) => {
    const checkbox = page.locator('.checkbox-label');
    await expect(checkbox).toBeVisible();
    await expect(checkbox.locator('.checkbox-text')).toHaveText('记住我');
  });

  test('显示登录按钮', async ({ page }) => {
    const loginBtn = page.locator('.login-btn');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toHaveText('登录');
  });

  test('输入用户名和密码', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"]');
    const passwordInput = page.locator('input[type="password"]');

    await usernameInput.fill('test@example.com');
    await expect(usernameInput).toHaveValue('test@example.com');

    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('空用户名时显示错误提示', async ({ page }) => {
    const loginBtn = page.locator('.login-btn');
    await loginBtn.click();

    await expect(page.locator('text=请输入用户名或邮箱')).toBeVisible();
  });

  test('空密码时显示错误提示', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"]');
    const loginBtn = page.locator('.login-btn');

    await usernameInput.fill('test@example.com');
    await loginBtn.click();

    await expect(page.locator('text=请输入密码')).toBeVisible();
  });

  test('点击记住我复选框', async ({ page }) => {
    const checkbox = page.locator('checkbox');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('登录按钮在加载时禁用', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginBtn = page.locator('.login-btn');

    await usernameInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await loginBtn.click();

    await expect(loginBtn).toHaveText('登录中...');
  });

  test('显示底部提示文字', async ({ page }) => {
    const footerText = page.locator('.footer-text');
    await expect(footerText).toBeVisible();
    await expect(footerText).toHaveText('请使用管理员分配的账号登录');
  });

  test('表单输入框样式正确', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(usernameInput).toHaveClass(/form-input/);
    await expect(passwordInput).toHaveClass(/form-input/);
  });

  test('密码输入框支持回车登录', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"]');
    const passwordInput = page.locator('input[type="password"]');

    await usernameInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await passwordInput.press('Enter');
  });

  test('页面布局响应式', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.login-container')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.login-container')).toBeVisible();
  });
});
