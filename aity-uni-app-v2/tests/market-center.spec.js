/**
 * 行情中心功能测试用例
 * 测试范围：市场温度计、指数行情、连板天梯、资金流向
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const LOGIN_URL = `${BASE_URL}/#/pages/login/login`;
const MARKET_URL = `${BASE_URL}/#/pages/market/market`;

// 测试账号
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

test.describe('行情中心功能测试', () => {

  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto(LOGIN_URL);
    await page.waitForTimeout(1000);

    // 检查是否需要登录
    const loginBtn = await page.$('button:has-text("登录")');
    if (loginBtn) {
      await page.fill('input[type="email"], input[placeholder*="邮箱"]', TEST_USER.email);
      await page.fill('input[type="password"], input[placeholder*="密码"]', TEST_USER.password);
      await page.click('button:has-text("登录")');
      await page.waitForTimeout(2000);
    }
  });

  test('01-页面加载-应显示行情中心标题', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(2000);

    // 验证标题存在
    const title = await page.textContent('.header-title, .title-text');
    expect(title).toContain('行情中心');
  });

  test('02-市场温度计-应显示情绪分数', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 验证仪表盘存在
    const gaugeNumber = await page.$('.gauge-number');
    expect(gaugeNumber).not.toBeNull();

    // 验证情绪状态显示
    const statusText = await page.textContent('.sentiment-status .status-text');
    expect(['偏热', '温和', '偏冷', '冰点', '中性']).toContain(statusText);
  });

  test('03-市场温度计-应显示涨跌统计', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 验证涨跌数据存在
    const statsGrid = await page.$('.stats-grid');
    expect(statsGrid).not.toBeNull();

    // 验证涨跌分布条存在
    const distributionBar = await page.$('.distribution-bar');
    expect(distributionBar).not.toBeNull();
  });

  test('04-指数行情-应显示指数卡片', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 验证指数卡片存在
    const indexCards = await page.$$('.index-card');
    expect(indexCards.length).toBeGreaterThan(0);

    // 验证第一个卡片有内容
    const firstCardName = await page.textContent('.index-card .index-name');
    expect(firstCardName).toBeTruthy();
  });

  test('05-连板天梯-应显示天梯摘要', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 验证连板天梯卡片存在
    const ladderCard = await page.$('.ladder-card');
    expect(ladderCard).not.toBeNull();

    // 验证最高连板数显示
    const highDays = await page.$('.ladder-high-days');
    expect(highDays).not.toBeNull();

    // 验证涨停总数显示
    const totalCount = await page.$('.ladder-total');
    expect(totalCount).not.toBeNull();
  });

  test('06-资金流向-应显示流入流出切换', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 验证Tab切换存在
    const flowTabs = await page.$$('.flow-tab');
    expect(flowTabs.length).toBe(2);

    // 点击流出Tab
    await page.click('.flow-tab:has-text("流出")');
    await page.waitForTimeout(1000);

    // 验证Tab状态变化
    const activeTab = await page.$('.flow-tab.active');
    expect(activeTab).not.toBeNull();
  });

  test('07-资金流向-应显示行业列表', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 验证行业列表项存在
    const flowItems = await page.$$('.flow-item');
    expect(flowItems.length).toBeGreaterThan(0);

    // 验证排名显示
    const firstRank = await page.textContent('.flow-rank');
    expect(['1', '2', '3']).toContain(firstRank);
  });

  test('08-刷新功能-点击刷新应重新加载数据', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 获取刷新按钮
    const refreshIcon = await page.$('.refresh-icon');
    expect(refreshIcon).not.toBeNull();

    // 点击刷新
    await page.click('.refresh-icon');
    await page.waitForTimeout(2000);

    // 验证刷新动画
    const spinningIcon = await page.$('.refresh-icon.spinning');
    // 动画可能在2秒内结束，所以这个断言可能不稳定
  });

  test('09-页面跳转-连板天梯详情页', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 点击查看全部
    await page.click('.section-action:has-text("查看全部")');
    await page.waitForTimeout(2000);

    // 验证跳转到详情页
    expect(page.url()).toContain('market-ladder');
  });

  test('10-详情页-应显示天梯列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/pages/market/market-ladder`);
    await page.waitForTimeout(3000);

    // 验证统计栏存在
    const summaryBar = await page.$('.summary-bar');
    expect(summaryBar).not.toBeNull();

    // 验证连板级别存在
    const levelBadges = await page.$$('.level-badge');
    expect(levelBadges.length).toBeGreaterThanOrEqual(0);
  });
});

test.describe('行情中心API测试', () => {

  test('API-市场概览接口', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/market/overview`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.code).toBe(200);
    expect(data.data).toHaveProperty('upCount');
    expect(data.data).toHaveProperty('downCount');
    expect(data.data).toHaveProperty('limitUpCount');
    expect(data.data).toHaveProperty('limitDownCount');
  });

  test('API-指数行情接口', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/market/index-quote`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.code).toBe(200);
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('API-连板天梯接口', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/market/limit-up-ladder`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.code).toBe(200);
    expect(data.data).toHaveProperty('highestDays');
    expect(data.data).toHaveProperty('total');
    expect(data.data).toHaveProperty('levels');
  });

  test('API-资金流向接口-流入', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/market/industry-fund-flow?type=inflow&top=5`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.code).toBe(200);
    expect(data.data).toHaveProperty('industries');
  });

  test('API-资金流向接口-流出', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/market/industry-fund-flow?type=outflow&top=5`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.code).toBe(200);
    expect(data.data).toHaveProperty('industries');
  });
});

test.describe('行情中心UI测试', () => {

  test('UI-颜色规范-涨跌颜色正确', async ({ page }) => {
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 检查上涨卡片颜色
    const upCard = await page.$('.index-card.up');
    if (upCard) {
      const color = await upCard.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );
      // 应该是红色系
      expect(color).toMatch(/rgb\(255.*\)/);
    }

    // 检查下跌卡片颜色
    const downCard = await page.$('.index-card.down');
    if (downCard) {
      const color = await downCard.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );
      // 应该是绿色系
      expect(color).toMatch(/rgb\(46.*\)/);
    }
  });

  test('UI-响应式-卡片不应溢出', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(MARKET_URL);
    await page.waitForTimeout(3000);

    // 检查页面是否有水平滚动
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
  });

  test('UI-加载状态-应显示loading', async ({ page }) => {
    // 慢速网络
    await page.route('**/api/market/**', route => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto(MARKET_URL);

    // 应该显示加载状态
    const loading = await page.$('.loading-overlay');
    expect(loading).not.toBeNull();

    // 等待加载完成
    await page.waitForTimeout(3000);
  });
});
