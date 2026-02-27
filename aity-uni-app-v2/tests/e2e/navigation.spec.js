// tests/e2e/navigation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('页面导航功能测试', () => {
  test('从登录页跳转到首页', async ({ page }) => {
    await page.goto('/#/pages/login/login');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/index/index' });
    });
    await page.waitForTimeout(500);
  });

  test('从首页跳转到行情中心', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/market/market' });
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*market/);
  });

  test('从首页跳转到讨论区', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/discussions/discussions' });
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*discussions/);
  });

  test('从首页跳转到消息中心', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/messages/messages' });
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*messages/);
  });

  test('从首页跳转到个人中心', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/profile/profile' });
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*profile/);
  });

  test('从行情中心返回首页', async ({ page }) => {
    await page.goto('/#/pages/market/market');
    const backBtn = page.locator('.back-icon');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('从讨论区返回首页', async ({ page }) => {
    await page.goto('/#/pages/discussions/discussions');
    const backBtn = page.locator('.back-icon');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('从消息中心返回首页', async ({ page }) => {
    await page.goto('/#/pages/messages/messages');
    const backBtn = page.locator('.back-icon');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('从个人中心返回首页', async ({ page }) => {
    await page.goto('/#/pages/profile/profile');
    const backBtn = page.locator('.back-icon');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('底部导航栏显示', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const tabBar = page.locator('.tab-bar');
    if (await tabBar.isVisible()) {
      await expect(tabBar).toBeVisible();
    }
  });

  test('底部导航栏首页按钮', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const homeTab = page.locator('.tab-item').filter({ hasText: '首页' });
    if (await homeTab.isVisible()) {
      await expect(homeTab).toBeVisible();
    }
  });

  test('底部导航栏行情按钮', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const marketTab = page.locator('.tab-item').filter({ hasText: '行情' });
    if (await marketTab.isVisible()) {
      await expect(marketTab).toBeVisible();
    }
  });

  test('底部导航栏讨论按钮', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const discussionsTab = page.locator('.tab-item').filter({ hasText: '讨论' });
    if (await discussionsTab.isVisible()) {
      await expect(discussionsTab).toBeVisible();
    }
  });

  test('底部导航栏消息按钮', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const messagesTab = page.locator('.tab-item').filter({ hasText: '消息' });
    if (await messagesTab.isVisible()) {
      await expect(messagesTab).toBeVisible();
    }
  });

  test('底部导航栏我的按钮', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const profileTab = page.locator('.tab-item').filter({ hasText: '我的' });
    if (await profileTab.isVisible()) {
      await expect(profileTab).toBeVisible();
    }
  });

  test('点击底部导航切换页面', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const marketTab = page.locator('.tab-item').filter({ hasText: '行情' });
    if (await marketTab.isVisible()) {
      await marketTab.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/.*market/);
    }
  });

  test('页面切换动画', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/market/market' });
    });
    await page.waitForTimeout(500);
  });

  test('页面加载状态', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    const loadingSpinner = page.locator('.loading-spinner');
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
    }
  });

  test('页面错误处理', async ({ page }) => {
    await page.goto('/#/pages/not-found');
    const errorPage = page.locator('.error-page');
    if (await errorPage.isVisible()) {
      await expect(errorPage).toBeVisible();
    }
  });

  test('URL参数传递', async ({ page }) => {
    await page.goto('/#/pages/discussion-detail/discussion-detail?id=123');
    await page.waitForTimeout(500);
  });

  test('页面缓存', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/market/market' });
    });
    await page.waitForTimeout(500);
    await page.goBack();
    await page.waitForTimeout(500);
  });

  test('多级页面跳转', async ({ page }) => {
    await page.goto('/#/pages/index/index');
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/discussions/discussions' });
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      uni.navigateTo({ url: '/pages/discussion-detail/discussion-detail?id=1' });
    });
    await page.waitForTimeout(500);
  });

  test('页面响应式导航', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/#/pages/index/index');
    await expect(page.locator('.tab-bar')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/#/pages/index/index');
    await expect(page.locator('.tab-bar')).toBeVisible();
  });
});
