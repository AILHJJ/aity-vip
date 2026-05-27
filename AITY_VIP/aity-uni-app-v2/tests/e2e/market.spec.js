// tests/e2e/market.spec.js
const { test, expect } = require('@playwright/test');

test.describe('行情中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pages/market/market');
  });

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/行情中心/);
  });

  test('显示顶部导航栏', async ({ page }) => {
    const header = page.locator('.header-bar');
    await expect(header).toBeVisible();

    await expect(header.locator('.header-title')).toHaveText('行情中心');
    await expect(header.locator('.header-subtitle')).toHaveText('实时市场数据');
  });

  test('显示返回按钮', async ({ page }) => {
    const backBtn = page.locator('.back-icon');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toHaveText('‹');
  });

  test('显示主要指数区域', async ({ page }) => {
    const indexSection = page.locator('.index-section');
    await expect(indexSection).toBeVisible();

    await expect(indexSection.locator('.title-text')).toHaveText('主要指数');
  });

  test('显示指数更新时间', async ({ page }) => {
    const updateTime = page.locator('.update-time');
    await expect(updateTime).toBeVisible();
  });

  test('指数卡片可滚动', async ({ page }) => {
    const indexScroll = page.locator('.index-scroll');
    await expect(indexScroll).toBeVisible();

    await indexScroll.evaluate(el => el.scrollLeft = 100);
  });

  test('显示指数卡片', async ({ page }) => {
    const indexCards = page.locator('.index-card');
    await expect(indexCards.first()).toBeVisible();
  });

  test('指数卡片显示名称', async ({ page }) => {
    const indexName = page.locator('.index-name');
    await expect(indexName.first()).toBeVisible();
  });

  test('指数卡片显示价格', async ({ page }) => {
    const indexPrice = page.locator('.index-price');
    await expect(indexPrice.first()).toBeVisible();
  });

  test('指数卡片显示涨跌幅', async ({ page }) => {
    const changePct = page.locator('.change-pct');
    await expect(changePct.first()).toBeVisible();
  });

  test('显示连板天梯区域', async ({ page }) => {
    const ladderSection = page.locator('.ladder-section');
    await expect(ladderSection).toBeVisible();

    await expect(ladderSection.locator('.title-text')).toHaveText('连板天梯');
  });

  test('显示涨停总数', async ({ page }) => {
    const totalCount = page.locator('.total-count');
    await expect(totalCount).toBeVisible();
  });

  test('连板天梯可滚动', async ({ page }) => {
    const ladderScroll = page.locator('.ladder-scroll');
    await expect(ladderScroll).toBeVisible();

    await ladderScroll.evaluate(el => el.scrollTop = 100);
  });

  test('显示连板级别', async ({ page }) => {
    const levelBadge = page.locator('.level-badge');
    await expect(levelBadge.first()).toBeVisible();
  });

  test('连板级别显示天数', async ({ page }) => {
    const badgeText = page.locator('.badge-text');
    await expect(badgeText.first()).toBeVisible();
  });

  test('显示行业资金流向区域', async ({ page }) => {
    const fundFlowSection = page.locator('.fund-flow-section');
    await expect(fundFlowSection).toBeVisible();

    await expect(fundFlowSection.locator('.title-text')).toHaveText('行业资金流向');
  });

  test('显示资金流向标签', async ({ page }) => {
    const flowTabs = page.locator('.flow-tabs');
    await expect(flowTabs).toBeVisible();

    await expect(flowTabs.locator('.tab-item').first()).toHaveText('流入');
    await expect(flowTabs.locator('.tab-item').nth(1)).toHaveText('流出');
  });

  test('点击流入标签', async ({ page }) => {
    const inflowTab = page.locator('.tab-item').filter({ hasText: '流入' });
    await inflowTab.click();
    await expect(inflowTab).toHaveClass(/active/);
  });

  test('点击流出标签', async ({ page }) => {
    const outflowTab = page.locator('.tab-item').filter({ hasText: '流出' });
    await outflowTab.click();
    await expect(outflowTab).toHaveClass(/active/);
  });

  test('显示资金流向列表', async ({ page }) => {
    const flowList = page.locator('.fund-flow-list');
    await expect(flowList).toBeVisible();
  });

  test('返回按钮可点击', async ({ page }) => {
    const backBtn = page.locator('.back-icon');
    await backBtn.click();
  });

  test('页面响应式布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.market-page')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.market-page')).toBeVisible();
  });

  test('指数涨跌幅颜色正确', async ({ page }) => {
    const indexCard = page.locator('.index-card').first();
    await expect(indexCard).toHaveClass(/(up|down|flat)/);
  });

  test('连板级别徽章样式正确', async ({ page }) => {
    const levelBadge = page.locator('.level-badge').first();
    await expect(levelBadge).toBeVisible();
  });

  test('股票项显示名称和代码', async ({ page }) => {
    const stockItem = page.locator('.stock-item').first();
    await expect(stockItem.locator('.stock-name')).toBeVisible();
    await expect(stockItem.locator('.stock-code')).toBeVisible();
  });

  test('股票项显示涨停徽章', async ({ page }) => {
    const stockBadge = page.locator('.stock-badge').first();
    await expect(stockBadge).toBeVisible();
    await expect(stockBadge.locator('.badge-text')).toHaveText('涨停');
  });

  test('空数据提示', async ({ page }) => {
    const emptyTip = page.locator('.empty-tip');
    if (await emptyTip.isVisible()) {
      await expect(emptyTip).toHaveText('暂无数据');
    }
  });

  test('页面滚动流畅', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});
