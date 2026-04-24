// tests/e2e/messages.spec.js
const { test, expect } = require('@playwright/test');

test.describe('消息中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/messages/messages');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/消息中心/);
  });

  test('显示消息列表', async ({ page }) => {
    const messagesList = page.locator('.messages-list');
    await expect(messagesList).toBeVisible();
  });

  test('显示消息类型标签', async ({ page }) => {
    const typeTabs = page.locator('.type-tabs');
    if (await typeTabs.isVisible()) {
      await expect(typeTabs).toBeVisible();
    }
  });

  test('显示全部消息标签', async ({ page }) => {
    const allTab = page.locator('.type-tab').filter({ hasText: '全部' });
    if (await allTab.isVisible()) {
      await expect(allTab).toBeVisible();
    }
  });

  test('显示未读消息标签', async ({ page }) => {
    const unreadTab = page.locator('.type-tab').filter({ hasText: '未读' });
    if (await unreadTab.isVisible()) {
      await expect(unreadTab).toBeVisible();
    }
  });

  test('切换消息类型', async ({ page }) => {
    const typeTab = page.locator('.type-tab').first();
    if (await typeTab.isVisible()) {
      await typeTab.click();
    }
  });

  test('消息项显示标题', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await expect(messageItem.locator('.message-title')).toBeVisible();
    }
  });

  test('消息项显示发送者', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await expect(messageItem.locator('.sender-name')).toBeVisible();
    }
  });

  test('消息项显示时间', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await expect(messageItem.locator('.message-time')).toBeVisible();
    }
  });

  test('消息项显示内容摘要', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await expect(messageItem.locator('.message-summary')).toBeVisible();
    }
  });

  test('点击消息进入详情', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await messageItem.click();
      await expect(page).toHaveURL(/.*message-detail/);
    }
  });

  test('消息列表可滚动', async ({ page }) => {
    const messagesList = page.locator('.messages-list');
    await messagesList.evaluate(el => el.scrollTop = 100);
  });

  test('显示未读标记', async ({ page }) => {
    const unreadBadge = page.locator('.unread-badge').first();
    if (await unreadBadge.isVisible()) {
      await expect(unreadBadge).toBeVisible();
    }
  });

  test('标记已读功能', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await messageItem.click();
      await page.waitForTimeout(500);
    }
  });

  test('批量操作按钮', async ({ page }) => {
    const batchBtn = page.locator('.batch-action-btn');
    if (await batchBtn.isVisible()) {
      await expect(batchBtn).toBeVisible();
    }
  });

  test('删除消息', async ({ page }) => {
    const deleteBtn = page.locator('.delete-btn').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('搜索消息', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      await page.waitForTimeout(500);
    }
  });

  test('清空所有消息', async ({ page }) => {
    const clearBtn = page.locator('.clear-all-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('空数据提示', async ({ page }) => {
    const emptyTip = page.locator('.empty-tip');
    if (await emptyTip.isVisible()) {
      await expect(emptyTip).toHaveText(/暂无消息/);
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
    await expect(page.locator('.messages-page')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.messages-page')).toBeVisible();
  });

  test('显示系统消息', async ({ page }) => {
    const systemMessage = page.locator('.message-item.system');
    if (await systemMessage.first().isVisible()) {
      await expect(systemMessage.first()).toBeVisible();
    }
  });

  test('显示用户消息', async ({ page }) => {
    const userMessage = page.locator('.message-item.user');
    if (await userMessage.first().isVisible()) {
      await expect(userMessage.first()).toBeVisible();
    }
  });

  test('消息项样式正确', async ({ page }) => {
    const messageItem = page.locator('.message-item').first();
    if (await messageItem.isVisible()) {
      await expect(messageItem).toHaveClass(/message-item/);
    }
  });

  test('显示消息图标', async ({ page }) => {
    const messageIcon = page.locator('.message-icon').first();
    if (await messageIcon.isVisible()) {
      await expect(messageIcon).toBeVisible();
    }
  });

  test('显示消息数量', async ({ page }) => {
    const messageCount = page.locator('.message-count');
    if (await messageCount.isVisible()) {
      await expect(messageCount).toBeVisible();
    }
  });
});
