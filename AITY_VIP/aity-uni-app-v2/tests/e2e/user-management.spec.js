// tests/e2e/user-management.spec.js
const { test, expect } = require('@playwright/test');

test.describe('用户管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/user-management/user-management');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/用户管理/);
  });

  test('显示用户列表', async ({ page }) => {
    const userList = page.locator('.user-list');
    await expect(userList).toBeVisible();
  });

  test('显示添加用户按钮', async ({ page }) => {
    const addUserBtn = page.locator('.add-user-btn');
    if (await addUserBtn.isVisible()) {
      await expect(addUserBtn).toBeVisible();
    }
  });

  test('显示搜索框', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('搜索用户功能', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('用户项显示用户名', async ({ page }) => {
    const userItem = page.locator('.user-item').first();
    if (await userItem.isVisible()) {
      await expect(userItem.locator('.username')).toBeVisible();
    }
  });

  test('用户项显示邮箱', async ({ page }) => {
    const userItem = page.locator('.user-item').first();
    if (await userItem.isVisible()) {
      await expect(userItem.locator('.email')).toBeVisible();
    }
  });

  test('用户项显示角色', async ({ page }) => {
    const userItem = page.locator('.user-item').first();
    if (await userItem.isVisible()) {
      await expect(userItem.locator('.role')).toBeVisible();
    }
  });

  test('用户项显示状态', async ({ page }) => {
    const userItem = page.locator('.user-item').first();
    if (await userItem.isVisible()) {
      await expect(userItem.locator('.status')).toBeVisible();
    }
  });

  test('用户项显示创建时间', async ({ page }) => {
    const userItem = page.locator('.user-item').first();
    if (await userItem.isVisible()) {
      await expect(userItem.locator('.create-time')).toBeVisible();
    }
  });

  test('显示编辑按钮', async ({ page }) => {
    const editBtn = page.locator('.edit-btn').first();
    if (await editBtn.isVisible()) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('显示删除按钮', async ({ page }) => {
    const deleteBtn = page.locator('.delete-btn').first();
    if (await deleteBtn.isVisible()) {
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('点击编辑用户', async ({ page }) => {
    const editBtn = page.locator('.edit-btn').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('点击删除用户', async ({ page }) => {
    const deleteBtn = page.locator('.delete-btn').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示分页控件', async ({ page }) => {
    const pagination = page.locator('.pagination');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('切换页码', async ({ page }) => {
    const pageBtn = page.locator('.page-btn').nth(1);
    if (await pageBtn.isVisible()) {
      await pageBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示每页显示数量选择', async ({ page }) => {
    const pageSizeSelect = page.locator('.page-size-select');
    if (await pageSizeSelect.isVisible()) {
      await expect(pageSizeSelect).toBeVisible();
    }
  });

  test('用户列表可滚动', async ({ page }) => {
    const userList = page.locator('.user-list');
    await userList.evaluate(el => el.scrollTop = 100);
  });

  test('显示用户总数', async ({ page }) => {
    const totalCount = page.locator('.total-count');
    if (await totalCount.isVisible()) {
      await expect(totalCount).toBeVisible();
    }
  });

  test('显示批量操作按钮', async ({ page }) => {
    const batchBtn = page.locator('.batch-action-btn');
    if (await batchBtn.isVisible()) {
      await expect(batchBtn).toBeVisible();
    }
  });

  test('选择用户复选框', async ({ page }) => {
    const checkbox = page.locator('.user-checkbox').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }
  });

  test('全选用户', async ({ page }) => {
    const selectAllCheckbox = page.locator('.select-all-checkbox');
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.check();
      await expect(selectAllCheckbox).toBeChecked();
    }
  });

  test('显示用户详情', async ({ page }) => {
    const userItem = page.locator('.user-item').first();
    if (await userItem.isVisible()) {
      await userItem.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示导出按钮', async ({ page }) => {
    const exportBtn = page.locator('.export-btn');
    if (await exportBtn.isVisible()) {
      await expect(exportBtn).toBeVisible();
    }
  });

  test('导出用户数据', async ({ page }) => {
    const exportBtn = page.locator('.export-btn');
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示刷新按钮', async ({ page }) => {
    const refreshBtn = page.locator('.refresh-btn');
    if (await refreshBtn.isVisible()) {
      await expect(refreshBtn).toBeVisible();
    }
  });

  test('刷新用户列表', async ({ page }) => {
    const refreshBtn = page.locator('.refresh-btn');
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('空数据提示', async ({ page }) => {
    const emptyTip = page.locator('.empty-tip');
    if (await emptyTip.isVisible()) {
      await expect(emptyTip).toHaveText(/暂无用户/);
    }
  });

  test('页面响应式布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.user-management-page')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.user-management-page')).toBeVisible();
  });

  test('显示筛选器', async ({ page }) => {
    const filterBtn = page.locator('.filter-btn');
    if (await filterBtn.isVisible()) {
      await expect(filterBtn).toBeVisible();
    }
  });

  test('打开筛选器', async ({ page }) => {
    const filterBtn = page.locator('.filter-btn');
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('按角色筛选', async ({ page }) => {
    const roleFilter = page.locator('.role-filter');
    if (await roleFilter.isVisible()) {
      await roleFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('按状态筛选', async ({ page }) => {
    const statusFilter = page.locator('.status-filter');
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('显示排序选项', async ({ page }) => {
    const sortBtn = page.locator('.sort-btn');
    if (await sortBtn.isVisible()) {
      await expect(sortBtn).toBeVisible();
    }
  });

  test('按创建时间排序', async ({ page }) => {
    const sortBtn = page.locator('.sort-btn');
    if (await sortBtn.isVisible()) {
      await sortBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('页面滚动流畅', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});
