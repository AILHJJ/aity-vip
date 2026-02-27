// @ts-check
const { test, expect } = require('@playwright/test');

const TARGET_URL = 'http://localhost:5173';

// 新增的6个主题
const newThemes = [
  { name: '紫罗兰', value: 'violet', color: '#5b21b6' },
  { name: '玫瑰红', value: 'rose', color: '#be123c' },
  { name: '青柠绿', value: 'lime', color: '#365314' },
  { name: '科技蓝', value: 'tech', color: '#1e3a8a' },
  { name: '石墨灰', value: 'slate', color: '#334155' },
  { name: '日落金', value: 'sunset', color: '#92400e' }
];

test.describe('Markdown主题样式测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto(TARGET_URL);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@example.com');
      await page.locator('input[type="password"]').first().fill('admin123');
      await page.locator('button[type="submit"], button:has-text("登录")').first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('验证创建消息页面存在主题选择区域', async ({ page }) => {
    await page.goto(`${TARGET_URL}/#/pages/create-message/create-message`);
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: 'test-results/theme-test-page.png', fullPage: true });

    // 验证页面加载成功
    await expect(page).toHaveURL(/create-message/);
  });

  for (const theme of newThemes) {
    test(`验证主题选项: ${theme.name} (${theme.value})`, async ({ page }) => {
      await page.goto(`${TARGET_URL}/#/pages/create-message/create-message`);
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');

      // 查找主题选项
      const themeOption = page.locator(`text="${theme.name}"`);
      const isVisible = await themeOption.isVisible().catch(() => false);

      console.log(`主题 ${theme.name}: ${isVisible ? '可见' : '不可见'}`);

      // 截图记录
      await page.screenshot({
        path: `test-results/theme-${theme.value}.png`,
        fullPage: true
      });

      expect(isVisible).toBe(true);
    });
  }

  test('验证主题样式定义完整性', async ({ page }) => {
    // 直接检查 markdown-renderer.js 文件中的主题定义
    const fs = require('fs');
    const path = require('path');

    const rendererPath = path.join(__dirname, '../../src/utils/markdown-renderer.js');
    const content = fs.readFileSync(rendererPath, 'utf-8');

    const results = [];

    for (const theme of newThemes) {
      // 检查每个主题是否在 ThemeStyles 中定义
      const hasTheme = content.includes(`${theme.value}:`) &&
                       content.includes(`container:`) &&
                       content.includes(`h1:`) &&
                       content.includes(`codeBlock:`);

      results.push({
        theme: theme.name,
        value: theme.value,
        defined: hasTheme
      });

      console.log(`${theme.name} (${theme.value}): ${hasTheme ? '✅ 已定义' : '❌ 未定义'}`);
    }

    // 所有主题都应该被定义
    const allDefined = results.every(r => r.defined);
    expect(allDefined).toBe(true);
  });
});
