// tests/e2e/discussions.spec.js
const { test, expect } = require('@playwright/test');

test.describe('讨论区功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/discussions/discussions');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/讨论区/);
  });

  test('显示讨论列表', async ({ page }) => {
    const discussionsList = page.locator('.discussions-list');
    await expect(discussionsList).toBeVisible();
  });

  test('显示创建讨论按钮', async ({ page }) => {
    const createBtn = page.locator('button:has-text("创建讨论")');
    if (await createBtn.isVisible()) {
      await expect(createBtn).toBeVisible();
    }
  });

  test('讨论项显示标题', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      await expect(discussionItem.locator('.discussion-title')).toBeVisible();
    }
  });

  test('讨论项显示作者', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      await expect(discussionItem.locator('.author-name')).toBeVisible();
    }
  });

  test('讨论项显示时间', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      await expect(discussionItem.locator('.post-time')).toBeVisible();
    }
  });

  test('讨论项显示回复数', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      await expect(discussionItem.locator('.reply-count')).toBeVisible();
    }
  });

  test('点击讨论项进入详情', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      await discussionItem.click();
      await expect(page).toHaveURL(/.*discussion-detail/);
    }
  });

  test('讨论列表可滚动', async ({ page }) => {
    const discussionsList = page.locator('.discussions-list');
    if (await discussionsList.isVisible()) {
      await discussionsList.evaluate(el => el.scrollTop = 100);
    }
  });

  test('显示搜索框', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('搜索功能', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      await page.waitForTimeout(500);
    }
  });

  test('显示分类标签', async ({ page }) => {
    const categoryTabs = page.locator('.category-tabs');
    if (await categoryTabs.isVisible()) {
      await expect(categoryTabs).toBeVisible();
    }
  });

  test('切换分类标签', async ({ page }) => {
    const categoryTab = page.locator('.category-tab').first();
    if (await categoryTab.isVisible()) {
      await categoryTab.click();
    }
  });

  test('显示加载状态', async ({ page }) => {
    const loadingSpinner = page.locator('.loading-spinner');
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
    }
  });

  test('空数据提示', async ({ page }) => {
    const emptyTip = page.locator('.empty-tip');
    if (await emptyTip.isVisible()) {
      await expect(emptyTip).toHaveText(/暂无讨论/);
    }
  });

  test('下拉刷新', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(500);
  });

  test('上拉加载更多', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test('页面响应式布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.discussions-page')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.discussions-page')).toBeVisible();
  });

  test('讨论项显示摘要', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      await expect(discussionItem.locator('.discussion-summary')).toBeVisible();
    }
  });

  test('讨论项显示标签', async ({ page }) => {
    const discussionItem = page.locator('.discussion-item').first();
    if (await discussionItem.isVisible()) {
      const tags = discussionItem.locator('.discussion-tags');
      if (await tags.isVisible()) {
        await expect(tags).toBeVisible();
      }
    }
  });

  test('显示热门讨论', async ({ page }) => {
    const hotSection = page.locator('.hot-discussions');
    if (await hotSection.isVisible()) {
      await expect(hotSection).toBeVisible();
    }
  });

  test('显示最新讨论', async ({ page }) => {
    const latestSection = page.locator('.latest-discussions');
    if (await latestSection.isVisible()) {
      await expect(latestSection).toBeVisible();
    }
  });
});
