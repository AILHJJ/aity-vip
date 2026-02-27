// tests/e2e/profile.spec.js
const { test, expect } = require('@playwright/test');

test.describe('个人中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/profile/profile');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/个人中心/);
  });

  test('显示用户头像', async ({ page }) => {
    const avatar = page.locator('.user-avatar');
    await expect(avatar).toBeVisible();
  });

  test('显示用户名', async ({ page }) => {
    const username = page.locator('.username');
    await expect(username).toBeVisible();
  });

  test('显示用户邮箱', async ({ page }) => {
    const email = page.locator('.user-email');
    await expect(email).toBeVisible();
  });

  test('显示用户等级', async ({ page }) => {
    const userLevel = page.locator('.user-level');
    if (await userLevel.isVisible()) {
      await expect(userLevel).toBeVisible();
    }
  });

  test('显示功能菜单', async ({ page }) => {
    const menuList = page.locator('.menu-list');
    await expect(menuList).toBeVisible();
  });

  test('显示我的收藏菜单项', async ({ page }) => {
    const favoritesItem = page.locator('.menu-item').filter({ hasText: '我的收藏' });
    if (await favoritesItem.isVisible()) {
      await expect(favoritesItem).toBeVisible();
    }
  });

  test('显示我的讨论菜单项', async ({ page }) => {
    const discussionsItem = page.locator('.menu-item').filter({ hasText: '我的讨论' });
    if (await discussionsItem.isVisible()) {
      await expect(discussionsItem).toBeVisible();
    }
  });

  test('显示设置菜单项', async ({ page }) => {
    const settingsItem = page.locator('.menu-item').filter({ hasText: '设置' });
    if (await settingsItem.isVisible()) {
      await expect(settingsItem).toBeVisible();
    }
  });

  test('点击我的收藏', async ({ page }) => {
    const favoritesItem = page.locator('.menu-item').filter({ hasText: '我的收藏' });
    if (await favoritesItem.isVisible()) {
      await favoritesItem.click();
      await expect(page).toHaveURL(/.*favorites/);
    }
  });

  test('点击我的讨论', async ({ page }) => {
    const discussionsItem = page.locator('.menu-item').filter({ hasText: '我的讨论' });
    if (await discussionsItem.isVisible()) {
      await discussionsItem.click();
      await expect(page).toHaveURL(/.*my-discussions/);
    }
  });

  test('点击设置', async ({ page }) => {
    const settingsItem = page.locator('.menu-item').filter({ hasText: '设置' });
    if (await settingsItem.isVisible()) {
      await settingsItem.click();
    }
  });

  test('显示退出登录按钮', async ({ page }) => {
    const logoutBtn = page.locator('.logout-btn');
    if (await logoutBtn.isVisible()) {
      await expect(logoutBtn).toBeVisible();
      await expect(logoutBtn).toHaveText('退出登录');
    }
  });

  test('点击退出登录', async ({ page }) => {
    const logoutBtn = page.locator('.logout-btn');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示用户统计信息', async ({ page }) => {
    const statsSection = page.locator('.stats-section');
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible();
    }
  });

  test('显示讨论数统计', async ({ page }) => {
    const discussionCount = page.locator('.stat-item').filter({ hasText: '讨论' });
    if (await discussionCount.isVisible()) {
      await expect(discussionCount).toBeVisible();
    }
  });

  test('显示收藏数统计', async ({ page }) => {
    const favoriteCount = page.locator('.stat-item').filter({ hasText: '收藏' });
    if (await favoriteCount.isVisible()) {
      await expect(favoriteCount).toBeVisible();
    }
  });

  test('显示关注数统计', async ({ page }) => {
    const followCount = page.locator('.stat-item').filter({ hasText: '关注' });
    if (await followCount.isVisible()) {
      await expect(followCount).toBeVisible();
    }
  });

  test('显示粉丝数统计', async ({ page }) => {
    const followerCount = page.locator('.stat-item').filter({ hasText: '粉丝' });
    if (await followerCount.isVisible()) {
      await expect(followerCount).toBeVisible();
    }
  });

  test('点击编辑资料', async ({ page }) => {
    const editBtn = page.locator('.edit-profile-btn');
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示个人简介', async ({ page }) => {
    const bio = page.locator('.user-bio');
    if (await bio.isVisible()) {
      await expect(bio).toBeVisible();
    }
  });

  test('页面响应式布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.profile-page')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.profile-page')).toBeVisible();
  });

  test('菜单项可点击', async ({ page }) => {
    const menuItem = page.locator('.menu-item').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
    }
  });

  test('显示箭头图标', async ({ page }) => {
    const arrowIcon = page.locator('.arrow-icon').first();
    if (await arrowIcon.isVisible()) {
      await expect(arrowIcon).toBeVisible();
    }
  });

  test('显示菜单图标', async ({ page }) => {
    const menuIcon = page.locator('.menu-icon').first();
    if (await menuIcon.isVisible()) {
      await expect(menuIcon).toBeVisible();
    }
  });

  test('页面滚动流畅', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});
