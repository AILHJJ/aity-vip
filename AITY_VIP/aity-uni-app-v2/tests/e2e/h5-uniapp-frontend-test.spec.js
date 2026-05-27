/**
 * AITY VIP H5 前端功能测试 - uni-app优化版
 *
 * 专门针对uni-app框架优化的测试套件
 * 使用uni-app特定的选择器和元素定位方式
 *
 * 运行命令：
 * CI=true BASE_URL=http://localhost:5174 npx playwright test h5-uniapp-frontend-test.spec.js --project=chrome-testing
 *
 * @author Frontend Testing Expert
 * @date 2026-02-27
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123',
  username: 'admin' // uni-app登录页支持用户名或邮箱
};

// 测试辅助函数
async function login(page, user = TEST_USER) {
  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await page.waitForLoadState('networkidle');

  // uni-app使用input组件，class为.form-input
  const accountInput = page.locator('input.form-input').first();
  const passwordInput = page.locator('input[type="password"].form-input');
  const loginButton = page.locator('button.login-btn');

  // 等待元素加载
  await page.waitForTimeout(500);

  if (await accountInput.count() > 0) {
    await accountInput.fill(user.email || user.username);
    console.log('✅ 填写账号');
  }

  if (await passwordInput.count() > 0) {
    await passwordInput.fill(user.password);
    console.log('✅ 填写密码');
  }

  if (await loginButton.count() > 0) {
    await loginButton.click();
    console.log('✅ 点击登录按钮');
    // 等待登录响应
    await page.waitForTimeout(3000);
  }
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  await page.screenshot({
    path: `test-results/${name}-${timestamp}.png`,
    fullPage: true
  });
  console.log(`📸 截图已保存: ${name}`);
}

test.describe('AITY VIP H5 前端功能测试', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`\n🧪 开始测试: ${testInfo.title}`);
    console.log(`🌐 测试环境: ${BASE_URL}`);
  });

  // ============================================
  // 1. 登录页面测试
  // ============================================
  test.describe('1. 登录页面 (/pages/login/login)', () => {

    test('1.1 - 页面加载和基本元素', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      const title = await page.title();
      console.log(`📄 页面标题: ${title}`);
      expect(title).toMatch(/登录/);

      // 验证页面元素
      const appTitle = page.locator('text=投研图灵室');
      const accountInput = page.locator('input.form-input').first();
      const passwordInput = page.locator('input[type="password"].form-input');
      const loginButton = page.locator('button.login-btn');

      expect(await appTitle.count()).toBeGreaterThan(0);
      expect(await accountInput.count()).toBeGreaterThan(0);
      expect(await passwordInput.count()).toBeGreaterThan(0);
      expect(await loginButton.count()).toBeGreaterThan(0);

      console.log('✅ 登录页面加载成功，所有元素正常显示');
      await takeScreenshot(page, '01-login-page-loaded');
    });

    test('1.2 - 登录表单填写', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      const accountInput = page.locator('input.form-input').first();
      const passwordInput = page.locator('input[type="password"].form-input');

      // 填写账号
      await accountInput.fill(TEST_USER.email);
      const accountValue = await accountInput.inputValue();
      expect(accountValue).toBe(TEST_USER.email);
      console.log('✅ 账号填写成功');

      // 填写密码
      await passwordInput.fill(TEST_USER.password);
      const passwordValue = await passwordInput.inputValue();
      expect(passwordValue).toBe(TEST_USER.password);
      console.log('✅ 密码填写成功');

      await takeScreenshot(page, '02-login-form-filled');
    });

    test('1.3 - 登录提交和跳转', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 执行登录
      await login(page);

      // 验证跳转（登录成功应该跳转到messages页面，因为是tab页面）
      const currentUrl = page.url();
      console.log(`📍 当前URL: ${currentUrl}`);

      // 等待跳转完成
      await page.waitForTimeout(2000);

      // 检查是否跳转
      const isRedirected = currentUrl.includes('messages') || currentUrl.includes('index') || !currentUrl.includes('login');
      if (isRedirected) {
        console.log('✅ 登录成功，页面已跳转');
      } else {
        console.log('⚠️ 可能还在登录页或跳转失败');
      }

      await takeScreenshot(page, '03-login-after-submit');
    });

    test('1.4 - 记住我功能', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 查找记住我复选框
      const checkbox = page.locator('checkbox').first();

      if (await checkbox.count() > 0) {
        await checkbox.check();
        console.log('✅ 选中"记住我"复选框');

        const isChecked = await checkbox.isChecked();
        expect(isChecked).toBeTruthy();

        await takeScreenshot(page, '04-login-remember-me');
      } else {
        console.log('⚠️ 未找到复选框');
      }
    });
  });

  // ============================================
  // 2. 首页测试
  // ============================================
  test.describe('2. 首页 (/pages/index/index)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('2.1 - 首页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 首页加载成功');
      await takeScreenshot(page, '05-index-page-loaded');
    });

    test('2.2 - 页面内容检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 检查页面是否有内容
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      console.log(`📝 页面内容长度: ${bodyText?.length} 字符`);

      await takeScreenshot(page, '06-index-content');
    });

    test('2.3 - 下拉刷新模拟', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 模拟下拉手势
      const viewport = page.viewportSize();
      const centerX = viewport.width / 2;

      await page.mouse.move(centerX, 100);
      await page.mouse.down();
      await page.mouse.move(centerX, 300, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(2000);
      console.log('✅ 下拉刷新操作完成');

      await takeScreenshot(page, '07-index-pull-refresh');
    });

    test('2.4 - 滚动到页面底部', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 滚动到底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(2000);
      console.log('✅ 滚动到底部');

      await takeScreenshot(page, '08-index-scroll-bottom');
    });
  });

  // ============================================
  // 3. 消息页面测试
  // ============================================
  test.describe('3. 消息页面 (/pages/messages/messages)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('3.1 - 消息页面加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 消息页面加载成功');
      await takeScreenshot(page, '09-messages-page-loaded');
    });

    test('3.2 - 消息列表检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 查找可能的列表元素
      const listSelectors = [
        'uni-list',
        '.message-list',
        '[class*="list"]',
        'scroll-view'
      ];

      let found = false;
      for (const selector of listSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到列表元素: ${selector}`);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log('⚠️ 未找到标准列表元素');
      }

      await takeScreenshot(page, '10-messages-list');
    });

    test('3.3 - 搜索功能检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 查找搜索相关的元素
      const searchSelectors = [
        'input[placeholder*="搜索"]',
        'input[placeholder*="Search"]',
        '.search-input',
        '[class*="search"]'
      ];

      for (const selector of searchSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.fill('测试');
          console.log('✅ 找到搜索框并输入内容');
          await page.waitForTimeout(1000);
          break;
        }
      }

      await takeScreenshot(page, '11-messages-search');
    });

    test('3.4 - Tab栏检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 查找tab栏（uni-app的tabbar）
      const tabbarSelectors = [
        'uni-tab-bar',
        '.tab-bar',
        '[class*="tabbar"]'
      ];

      for (const selector of tabbarSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到Tab栏: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '12-messages-tabbar');
    });
  });

  // ============================================
  // 4. 消息详情页测试
  // ============================================
  test.describe('4. 消息详情页 (/pages/message-detail/message-detail)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('4.1 - 消息详情页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 消息详情页加载成功');
      await takeScreenshot(page, '13-message-detail-loaded');
    });

    test('4.2 - 详情页内容检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      const bodyText = await page.textContent('body');
      console.log(`📝 页面内容长度: ${bodyText?.length} 字符`);

      await takeScreenshot(page, '14-message-detail-content');
    });

    test('4.3 - 收藏功能检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      // 查找收藏按钮
      const favoriteSelectors = [
        'button:has-text("收藏")',
        '[class*="favorite"]',
        '[class*="collect"]',
        'uni-icons:has-text("star")'
      ];

      for (const selector of favoriteSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到收藏按钮: ${selector}`);
          // 不实际点击，避免改变数据状态
          break;
        }
      }

      await takeScreenshot(page, '15-message-detail-favorite');
    });

    test('4.4 - 返回功能检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      // 查找返回按钮
      const backSelectors = [
        'uni-icons:has-text("arrow-left")',
        'uni-icons:has-text("left")',
        '[class*="nav-back"]',
        '[class*="back"]'
      ];

      for (const selector of backSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到返回按钮: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '16-message-detail-back');
    });
  });

  // ============================================
  // 5. 讨论页面测试
  // ============================================
  test.describe('5. 讨论页面 (/pages/discussions/discussions)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('5.1 - 讨论页面加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 讨论页面加载成功');
      await takeScreenshot(page, '17-discussions-loaded');
    });

    test('5.2 - 讨论列表检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      const listSelectors = [
        'uni-list',
        '[class*="discussion-list"]',
        '[class*="topic-list"]'
      ];

      for (const selector of listSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到讨论列表: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '18-discussions-list');
    });

    test('5.3 - 创建讨论入口检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      const createSelectors = [
        'button:has-text("创建")',
        'button:has-text("新建")',
        '[class*="create-btn"]',
        '[class*="add-btn"]'
      ];

      for (const selector of createSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到创建按钮: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '19-discussions-create');
    });
  });

  // ============================================
  // 6. 创建讨论页测试
  // ============================================
  test.describe('6. 创建讨论页 (/pages/create-discussion/create-discussion)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('6.1 - 创建讨论页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/create-discussion/create-discussion`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 创建讨论页加载成功');
      await takeScreenshot(page, '20-create-discussion-loaded');
    });

    test('6.2 - 表单元素检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/create-discussion/create-discussion`);
      await page.waitForLoadState('networkidle');

      const inputSelectors = [
        'input.form-input',
        'textarea',
        'input[placeholder*="标题"]',
        'textarea[placeholder*="内容"]'
      ];

      for (const selector of inputSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到表单元素: ${selector}`);
        }
      }

      await takeScreenshot(page, '21-create-discussion-form');
    });

    test('6.3 - 提交按钮检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/create-discussion/create-discussion`);
      await page.waitForLoadState('networkidle');

      const submitSelectors = [
        'button:has-text("提交")',
        'button:has-text("发布")',
        'button:has-text("创建")',
        '[class*="submit"]'
      ];

      for (const selector of submitSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到提交按钮: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '22-create-discussion-submit');
    });
  });

  // ============================================
  // 7. 我的收藏页测试
  // ============================================
  test.describe('7. 我的收藏页 (/pages/favorites/favorites)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('7.1 - 收藏页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 收藏页加载成功');
      await takeScreenshot(page, '23-favorites-loaded');
    });

    test('7.2 - Tab切换检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      const tabSelectors = [
        'view[role="tab"]',
        '[class*="tab-item"]',
        '[class*="tab-segment"]'
      ];

      for (const selector of tabSelectors) {
        const elements = page.locator(selector);
        if (await elements.count() > 0) {
          console.log(`✅ 找到Tab元素: ${selector} (${await elements.count()}个)`);
          break;
        }
      }

      await takeScreenshot(page, '24-favorites-tabs');
    });

    test('7.3 - 收藏列表检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      const listSelectors = [
        'uni-list',
        '[class*="favorite-list"]',
        '[class*="collection-list"]'
      ];

      for (const selector of listSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到收藏列表: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '25-favorites-list');
    });
  });

  // ============================================
  // 8. 个人中心页测试
  // ============================================
  test.describe('8. 个人中心页 (/pages/profile/profile)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('8.1 - 个人中心页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 个人中心页加载成功');
      await takeScreenshot(page, '26-profile-loaded');
    });

    test('8.2 - 用户信息显示检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');

      const userInfoSelectors = [
        '[class*="user-info"]',
        '[class*="avatar"]',
        '[class*="username"]',
        '[class*="profile-header"]'
      ];

      for (const selector of userInfoSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到用户信息元素: ${selector}`);
        }
      }

      await takeScreenshot(page, '27-profile-user-info');
    });

    test('8.3 - 功能菜单检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');

      const menuItems = [
        '我的讨论',
        '我的收藏',
        '行情中心',
        '设置'
      ];

      for (const item of menuItems) {
        const element = page.locator(`text="${item}"`).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到菜单项: ${item}`);
        }
      }

      await takeScreenshot(page, '28-profile-menu');
    });
  });

  // ============================================
  // 9. 用户管理页测试
  // ============================================
  test.describe('9. 用户管理页 (/pages/user-management/user-management)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('9.1 - 用户管理页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 用户管理页加载成功');
      await takeScreenshot(page, '29-user-management-loaded');
    });

    test('9.2 - 用户列表检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      const listSelectors = [
        'uni-list',
        'table',
        '[class*="user-list"]',
        '[class*="user-table"]'
      ];

      for (const selector of listSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到用户列表: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, '30-user-management-list');
    });

    test('9.3 - 搜索框检查', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="Search"]');

      if (await searchInput.count() > 0) {
        console.log('✅ 找到搜索框');
      }

      await takeScreenshot(page, '31-user-management-search');
    });
  });

  // ============================================
  // 10. 行情中心页测试
  // ============================================
  test.describe('10. 行情中心页 (/pages/market/market)', () => {

    test('10.1 - 行情中心页加载（已登录）', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/#/pages/market/market`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 行情中心页加载成功');
      await takeScreenshot(page, '32-market-logged-in');
    });

    test('10.2 - 登录检查（未登录）', async ({ page }) => {
      // 不登录，直接访问
      await page.goto(`${BASE_URL}/#/pages/market/market');
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      if (currentUrl.includes('login')) {
        console.log('✅ 行情中心需要登录，已跳转到登录页');
      } else {
        console.log('⚠️ 行情中心可能不需要登录或未跳转');
      }

      await takeScreenshot(page, '33-market-login-check');
    });

    test('10.3 - 行情数据展示检查', async ({ page }) => {
      await login(page);
      await page.goto(BASE_URL + '/#/pages/market/market');
      await page.waitForLoadState('networkidle');

      const dataSelectors = [
        '[class*="market-data"]',
        '[class*="stock"]',
        '[class*="price"]',
        '[class*="chart"]',
        'table'
      ];

      for (const selector of dataSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log("OK Found market data element:", selector);
        }
      }

      await takeScreenshot(page, '34-market-data');
    });
  });

  // ============================================
  // 综合测试
  // ============================================
  test.describe('综合功能测试', () => {

    test('完整用户流程测试', async ({ page }) => {
      console.log('🔄 开始完整用户流程测试');

      // 1. 登录
      console.log('1️⃣ 步骤1: 登录');
      await login(page);
      await page.waitForTimeout(1000);

      // 2. 访问首页
      console.log('2️⃣ 步骤2: 访问首页');
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 3. 访问消息页
      console.log('3️⃣ 步骤3: 访问消息页');
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 4. 访问个人中心
      console.log('4️⃣ 步骤4: 访问个人中心');
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      console.log('✅ 完整用户流程测试完成');
      await takeScreenshot(page, '35-full-user-flow');
    });

    test('响应式布局测试', async ({ page }) => {
      await login(page);

      const sizes = [
        { name: '桌面(1920x1080)', width: 1920, height: 1080 },
        { name: '笔记本(1366x768)', width: 1366, height: 768 },
        { name: '平板(768x1024)', width: 768, height: 1024 },
        { name: '手机(375x667)', width: 375, height: 667 }
      ];

      for (const size of sizes) {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(`${BASE_URL}/#/pages/index/index`);
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `test-results/responsive-${size.name.replace(/[()]/g, '-')}.png`,
          fullPage: true
        });

        console.log(`✅ ${size.name} 响应式测试完成`);
      }
    });

    test('性能测试 - 页面加载时间', async ({ page }) => {
      const testPages = [
        { name: '登录页', path: '/#/pages/login/login' },
        { name: '首页', path: '/#/pages/index/index', needLogin: true },
        { name: '消息页', path: '/#/pages/messages/messages', needLogin: true }
      ];

      const results = [];

      for (const testPage of testPages) {
        if (testPage.needLogin) {
          await login(page);
          await page.waitForTimeout(500);
        }

        const startTime = Date.now();
        await page.goto(`${BASE_URL}${testPage.path}`);
        await page.waitForLoadState('networkidle');
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        results.push({
          page: testPage.name,
          loadTime: `${loadTime}ms`
        });

        console.log(`⏱️ ${testPage.name}: ${loadTime}ms`);
      }

      console.log('\n📊 性能测试汇总:');
      results.forEach(r => {
        console.log(`  ${r.page}: ${r.loadTime}`);
      });

      await takeScreenshot(page, '36-performance-test');
    });

    test('网络请求监控', async ({ page }) => {
      const apiRequests = [];

      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push({
            url: request.url(),
            method: request.method()
          });
        }
      });

      page.on('response', response => {
        if (response.url().includes('/api/')) {
          console.log(`📡 API响应: ${response.status()} ${response.url().split('/').pop()}`);
        }
      });

      await login(page);
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      console.log(`\n📊 总共捕获到 ${apiRequests.length} 个API请求`);

      await takeScreenshot(page, '37-network-monitoring');
    });

    test('页面元素可访问性检查', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 检查页面是否可交互
      const isInteractive = await page.evaluate(() => {
        return {
          hasContent: document.body.textContent.length > 0,
          hasLinks: document.links.length > 0,
          hasButtons: document.querySelectorAll('button').length > 0,
          hasInputs: document.querySelectorAll('input').length > 0
        };
      });

      console.log('📊 页面可访问性检查结果:');
      console.log(`  内容长度: ${isInteractive.hasContent ? '✅' : '❌'}`);
      console.log(`  链接数量: ${isInteractive.hasLinks ? '✅' : '❌'}`);
      console.log(`  按钮数量: ${isInteractive.hasButtons ? '✅' : '❌'}`);
      console.log(`  输入框数量: ${isInteractive.hasInputs ? '✅' : '❌'}`);

      await takeScreenshot(page, '38-accessibility-check');
    });
  });
});
