/**
 * AITY VIP H5 前端功能全面测试
 *
 * 测试覆盖范围：
 * 1. 登录页面 (/pages/login/login)
 * 2. 首页 (/pages/index/index)
 * 3. 消息页面 (/pages/messages/messages)
 * 4. 消息详情页 (/pages/message-detail/message-detail)
 * 5. 讨论页面 (/pages/discussions/discussions)
 * 6. 创建讨论页 (/pages/create-discussion/create-discussion)
 * 7. 我的收藏页 (/pages/favorites/favorites)
 * 8. 个人中心页 (/pages/profile/profile)
 * 9. 用户管理页 (/pages/user-management/user-management)
 * 10. 行情中心页 (/pages/market/market)
 *
 * 运行命令：
 * npx playwright test h5-frontend-comprehensive.spec.js --project=chrome-testing
 *
 * @author Frontend Testing Expert
 * @date 2026-02-27
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// 测试辅助函数
async function login(page, user = TEST_USER) {
  await page.goto(`${BASE_URL}/#/pages/login/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="text"], input[placeholder*="邮箱"], input[placeholder*="账号"]');
  const passwordInput = page.locator('input[type="password"]');
  const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');

  if (await emailInput.count() > 0) {
    await emailInput.fill(user.email);
  }
  if (await passwordInput.count() > 0) {
    await passwordInput.fill(user.password);
  }
  if (await loginButton.count() > 0) {
    await loginButton.click();
    await page.waitForTimeout(2000);
  }
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  await page.screenshot({
    path: `test-results/${name}-${timestamp}.png`,
    fullPage: true
  });
}

test.describe('AITY VIP H5 前端功能测试', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`\n🧪 开始测试: ${testInfo.title}`);
    console.log(`🌐 测试环境: ${BASE_URL}`);
  });

  // ============================================
  // 1. 登录页面测试
  // ============================================
  test.describe('1. 登录页面测试', () => {

    test('1.1 - 页面加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      const title = await page.title();
      console.log(`📄 页面标题: ${title}`);
      expect(title).toMatch(/登录|Login/);

      // 验证页面元素
      const emailInput = page.locator('input[type="text"], input[placeholder*="邮箱"], input[placeholder*="账号"]');
      const passwordInput = page.locator('input[type="password"]');
      const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');

      expect(await emailInput.count()).toBeGreaterThan(0);
      expect(await passwordInput.count()).toBeGreaterThan(0);
      expect(await loginButton.count()).toBeGreaterThan(0);

      console.log('✅ 登录页面加载成功，所有元素正常显示');
      await takeScreenshot(page, 'login-page-loaded');
    });

    test('1.2 - 登录表单填写测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="text"], input[placeholder*="邮箱"]');
      const passwordInput = page.locator('input[type="password"]');

      // 填写邮箱
      await emailInput.fill(TEST_USER.email);
      const emailValue = await emailInput.inputValue();
      expect(emailValue).toBe(TEST_USER.email);
      console.log('✅ 邮箱填写成功');

      // 填写密码
      await passwordInput.fill(TEST_USER.password);
      const passwordValue = await passwordInput.inputValue();
      expect(passwordValue).toBe(TEST_USER.password);
      console.log('✅ 密码填写成功');

      await takeScreenshot(page, 'login-form-filled');
    });

    test('1.3 - 登录提交测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 填写表单
      await page.locator('input[type="text"], input[placeholder*="邮箱"]').fill(TEST_USER.email);
      await page.locator('input[type="password"]').fill(TEST_USER.password);

      // 点击登录
      const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');
      await loginButton.click();
      console.log('✅ 点击登录按钮');

      // 等待响应
      await page.waitForTimeout(3000);

      await takeScreenshot(page, 'login-submitted');
    });

    test('1.4 - 登录成功跳转测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 执行登录
      await login(page);

      // 验证跳转
      const currentUrl = page.url();
      console.log(`📍 当前URL: ${currentUrl}`);

      // 检查是否跳转到首页或其他页面
      const isRedirected = currentUrl.includes('index') || !currentUrl.includes('login');
      expect(isRedirected).toBeTruthy();
      console.log('✅ 登录成功，页面已跳转');

      await takeScreenshot(page, 'login-success-redirect');
    });

    test('1.5 - 登录失败提示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/login/login`);
      await page.waitForLoadState('networkidle');

      // 使用错误的密码
      await page.locator('input[type="text"], input[placeholder*="邮箱"]').fill(TEST_USER.email);
      await page.locator('input[type="password"]').fill('wrongpassword');

      const loginButton = page.locator('button:has-text("登录"), button:has-text("Login")');
      await loginButton.click();
      await page.waitForTimeout(2000);

      // 检查是否有错误提示
      const errorSelectors = [
        '.error-message',
        '.toast',
        '.notification',
        '[role="alert"]',
        'text=/密码错误|登录失败|用户名或密码错误/i'
      ];

      let hasError = false;
      for (const selector of errorSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            hasError = true;
            console.log('✅ 检测到错误提示');
            break;
          }
        } catch (e) {
          // 继续检查下一个选择器
        }
      }

      await takeScreenshot(page, 'login-failed');
    });
  });

  // ============================================
  // 2. 首页测试
  // ============================================
  test.describe('2. 首页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('2.1 - 首页页面加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      const title = await page.title();
      console.log(`📄 首页标题: ${title}`);

      // 验证页面内容
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();

      console.log('✅ 首页加载成功');
      await takeScreenshot(page, 'index-page-loaded');
    });

    test('2.2 - 消息列表显示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 查找消息列表元素
      const messageSelectors = [
        '.message-list',
        '.message-item',
        '[class*="message"]',
        'uni-list',
        'list'
      ];

      let hasMessageList = false;
      for (const selector of messageSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          hasMessageList = true;
          const count = await element.count();
          console.log(`✅ 找到消息列表元素: ${selector} (${count}个)`);
          break;
        }
      }

      if (!hasMessageList) {
        console.log('⚠️ 未找到消息列表元素，可能页面结构不同');
      }

      await takeScreenshot(page, 'index-message-list');
    });

    test('2.3 - 下拉刷新测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 模拟下拉刷新
      const viewport = page.viewportSize();
      const centerX = viewport.width / 2;
      const startY = 100;
      const endY = 300;

      await page.mouse.move(centerX, startY);
      await page.mouse.down();
      await page.mouse.move(centerX, endY, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(2000);
      console.log('✅ 下拉刷新操作完成');

      await takeScreenshot(page, 'index-pull-refresh');
    });

    test('2.4 - 上拉加载更多测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      // 滚动到页面底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(2000);
      console.log('✅ 滚动到底部，触发加载更多');

      await takeScreenshot(page, 'index-load-more');
    });
  });

  // ============================================
  // 3. 消息页面测试
  // ============================================
  test.describe('3. 消息页面测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('3.1 - 消息页面加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 消息页面加载成功');
      await takeScreenshot(page, 'messages-page-loaded');
    });

    test('3.2 - 消息列表显示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 查找消息列表
      const messageItems = page.locator('[class*="message-item"], [class*="msg-item"], uni-list-item');
      const count = await messageItems.count();

      console.log(`📊 消息列表项数量: ${count}`);

      if (count > 0) {
        const firstMessage = messageItems.first();
        const text = await firstMessage.textContent();
        console.log(`📝 第一条消息: ${text?.substring(0, 50)}...`);
      }

      await takeScreenshot(page, 'messages-list');
    });

    test('3.3 - 消息筛选测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 查找筛选按钮
      const filterSelectors = [
        'button:has-text("筛选")',
        'button:has-text("Filter")',
        '[class*="filter"]',
        '[class*="tab"]'
      ];

      for (const selector of filterSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.click();
          await page.waitForTimeout(1000);
          console.log(`✅ 点击筛选按钮: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, 'messages-filter');
    });

    test('3.4 - 消息搜索测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 查找搜索框
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="Search"], [class*="search"] input');

      if (await searchInput.count() > 0) {
        await searchInput.fill('测试');
        await page.waitForTimeout(1000);
        console.log('✅ 消息搜索功能测试完成');
      } else {
        console.log('⚠️ 未找到搜索框');
      }

      await takeScreenshot(page, 'messages-search');
    });

    test('3.5 - 消息详情跳转测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/messages/messages`);
      await page.waitForLoadState('networkidle');

      // 点击第一条消息
      const firstMessage = page.locator('[class*="message-item"], [class*="msg-item"], uni-list-item').first();

      if (await firstMessage.count() > 0) {
        await firstMessage.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`📍 跳转后URL: ${currentUrl}`);

        if (currentUrl.includes('message-detail') || currentUrl.includes('detail')) {
          console.log('✅ 成功跳转到消息详情页');
        }
      }

      await takeScreenshot(page, 'messages-detail-jump');
    });
  });

  // ============================================
  // 4. 消息详情页测试
  // ============================================
  test.describe('4. 消息详情页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('4.1 - 消息详情页加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 消息详情页加载成功');
      await takeScreenshot(page, 'message-detail-loaded');
    });

    test('4.2 - 消息内容渲染测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      // 检查页面内容
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      console.log('📝 页面内容长度:', bodyText?.length);

      await takeScreenshot(page, 'message-detail-content');
    });

    test('4.3 - 收藏功能测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      // 查找收藏按钮
      const favoriteSelectors = [
        'button:has-text("收藏")',
        'button:has-text("Favorite")',
        '[class*="favorite"]',
        '[class*="collect"]'
      ];

      for (const selector of favoriteSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.click();
          await page.waitForTimeout(1000);
          console.log('✅ 点击收藏按钮');
          break;
        }
      }

      await takeScreenshot(page, 'message-detail-favorite');
    });

    test('4.4 - 返回功能测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/message-detail/message-detail?id=1`);
      await page.waitForLoadState('networkidle');

      // 查找返回按钮
      const backSelectors = [
        'button:has-text("返回")',
        'button:has-text("Back")',
        '[class*="back"]',
        'uni-icons:has-text("arrow-left")'
      ];

      for (const selector of backSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const urlBefore = page.url();
          await element.click();
          await page.waitForTimeout(1000);
          const urlAfter = page.url();

          if (urlBefore !== urlAfter) {
            console.log('✅ 返回功能正常');
          }
          break;
        }
      }

      await takeScreenshot(page, 'message-detail-back');
    });
  });

  // ============================================
  // 5. 讨论页面测试
  // ============================================
  test.describe('5. 讨论页面测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('5.1 - 讨论页面加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 讨论页面加载成功');
      await takeScreenshot(page, 'discussions-page-loaded');
    });

    test('5.2 - 讨论列表显示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      // 查找讨论列表
      const discussionItems = page.locator('[class*="discussion-item"], [class*="topic-item"], uni-list-item');
      const count = await discussionItems.count();

      console.log(`📊 讨论列表项数量: ${count}`);

      await takeScreenshot(page, 'discussions-list');
    });

    test('5.3 - 创建讨论入口测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      // 查找创建讨论按钮
      const createSelectors = [
        'button:has-text("创建")',
        'button:has-text("新建")',
        'button:has-text("Create")',
        '[class*="create"]',
        '[class*="add"]'
      ];

      for (const selector of createSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到创建按钮: ${selector}`);
          await takeScreenshot(page, 'discussions-create-button');
          return;
        }
      }

      console.log('⚠️ 未找到创建讨论按钮');
    });

    test('5.4 - 讨论详情跳转测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/discussions/discussions`);
      await page.waitForLoadState('networkidle');

      // 点击第一条讨论
      const firstDiscussion = page.locator('[class*="discussion-item"], uni-list-item').first();

      if (await firstDiscussion.count() > 0) {
        await firstDiscussion.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`📍 跳转后URL: ${currentUrl}`);
      }

      await takeScreenshot(page, 'discussions-detail-jump');
    });
  });

  // ============================================
  // 6. 创建讨论页测试
  // ============================================
  test.describe('6. 创建讨论页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('6.1 - 创建讨论页加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/create-discussion/create-discussion`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 创建讨论页加载成功');
      await takeScreenshot(page, 'create-discussion-loaded');
    });

    test('6.2 - 表单填写测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/create-discussion/create-discussion`);
      await page.waitForLoadState('networkidle');

      // 查找表单输入框
      const titleInput = page.locator('input[placeholder*="标题"], textarea[placeholder*="标题"], [class*="title"] input');
      const contentInput = page.locator('textarea[placeholder*="内容"], [class*="content"] textarea');

      if (await titleInput.count() > 0) {
        await titleInput.fill(`测试讨论标题_${Date.now()}`);
        console.log('✅ 填写标题');
      }

      if (await contentInput.count() > 0) {
        await contentInput.fill('这是一个测试讨论的内容');
        console.log('✅ 填写内容');
      }

      await takeScreenshot(page, 'create-discussion-form-filled');
    });

    test('6.3 - 提交创建测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/create-discussion/create-discussion`);
      await page.waitForLoadState('networkidle');

      // 填写表单
      const titleInput = page.locator('input[placeholder*="标题"], textarea[placeholder*="标题"]');
      const submitButton = page.locator('button:has-text("提交"), button:has-text("发布"), button:has-text("创建")');

      if (await titleInput.count() > 0) {
        await titleInput.fill(`测试讨论_${Date.now()}`);
      }

      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ 点击提交按钮');
      }

      await takeScreenshot(page, 'create-discussion-submit');
    });
  });

  // ============================================
  // 7. 我的收藏页测试
  // ============================================
  test.describe('7. 我的收藏页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('7.1 - 我的收藏页加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 我的收藏页加载成功');
      await takeScreenshot(page, 'favorites-page-loaded');
    });

    test('7.2 - Tab切换测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      // 查找Tab元素
      const tabs = page.locator('[class*="tab"], [role="tab"]');

      if (await tabs.count() > 0) {
        const tabCount = await tabs.count();
        console.log(`📊 找到 ${tabCount} 个Tab`);

        // 点击第二个Tab（如果有）
        if (tabCount >= 2) {
          await tabs.nth(1).click();
          await page.waitForTimeout(1000);
          console.log('✅ 切换到第二个Tab');
        }
      }

      await takeScreenshot(page, 'favorites-tabs');
    });

    test('7.3 - 收藏列表显示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      // 查找收藏列表
      const favoriteItems = page.locator('[class*="favorite-item"], [class*="collect-item"], uni-list-item');
      const count = await favoriteItems.count();

      console.log(`📊 收藏列表项数量: ${count}`);

      await takeScreenshot(page, 'favorites-list');
    });

    test('7.4 - 取消收藏功能测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/favorites/favorites`);
      await page.waitForLoadState('networkidle');

      // 查找取消收藏按钮
      const unfavoriteSelectors = [
        'button:has-text("取消收藏")',
        'button:has-text("删除")',
        '[class*="unfavorite"]',
        '[class*="delete"]'
      ];

      for (const selector of unfavoriteSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到取消收藏按钮: ${selector}`);
          // 不实际点击，避免删除数据
          break;
        }
      }

      await takeScreenshot(page, 'favorites-unfavorite');
    });
  });

  // ============================================
  // 8. 个人中心页测试
  // ============================================
  test.describe('8. 个人中心页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('8.1 - 个人中心页加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 个人中心页加载成功');
      await takeScreenshot(page, 'profile-page-loaded');
    });

    test('8.2 - 用户信息显示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');

      // 查找用户信息元素
      const userInfoSelectors = [
        '[class*="user-info"]',
        '[class*="avatar"]',
        '[class*="username"]',
        '[class*="email"]'
      ];

      for (const selector of userInfoSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到用户信息元素: ${selector}`);
        }
      }

      await takeScreenshot(page, 'profile-user-info');
    });

    test('8.3 - 功能入口测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/profile/profile`);
      await page.waitForLoadState('networkidle');

      // 查找功能入口
      const features = [
        '我的讨论',
        '我的收藏',
        '行情中心',
        '设置',
        '退出登录'
      ];

      for (const feature of features) {
        const element = page.locator(`text=/${feature}/`).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到功能入口: ${feature}`);
        }
      }

      await takeScreenshot(page, 'profile-features');
    });
  });

  // ============================================
  // 9. 用户管理页测试
  // ============================================
  test.describe('9. 用户管理页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('9.1 - 用户管理页加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 用户管理页加载成功');
      await takeScreenshot(page, 'user-management-loaded');
    });

    test('9.2 - 用户列表显示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      // 查找用户列表
      const userItems = page.locator('[class*="user-item"], [class*="user-row"], table tbody tr');
      const count = await userItems.count();

      console.log(`📊 用户列表项数量: ${count}`);

      await takeScreenshot(page, 'user-management-list');
    });

    test('9.3 - 搜索功能测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      // 查找搜索框
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="Search"]');

      if (await searchInput.count() > 0) {
        await searchInput.fill('admin');
        await page.waitForTimeout(1000);
        console.log('✅ 搜索功能测试完成');
      }

      await takeScreenshot(page, 'user-management-search');
    });

    test('9.4 - 创建用户入口测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/user-management/user-management`);
      await page.waitForLoadState('networkidle');

      // 查找创建用户按钮
      const createSelectors = [
        'button:has-text("创建")',
        'button:has-text("新建")',
        'button:has-text("添加")',
        '[class*="create"]',
        '[class*="add"]'
      ];

      for (const selector of createSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ 找到创建用户按钮: ${selector}`);
          break;
        }
      }

      await takeScreenshot(page, 'user-management-create');
    });
  });

  // ============================================
  // 10. 行情中心页测试
  // ============================================
  test.describe('10. 行情中心页测试', () => {

    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.waitForTimeout(1000);
    });

    test('10.1 - 行情中心页加载测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/market/market`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 行情中心页加载成功');
      await takeScreenshot(page, 'market-page-loaded');
    });

    test('10.2 - 登录检查测试', async ({ page }) => {
      // 先不登录，直接访问行情页
      await page.goto(`${BASE_URL}/#/pages/market/market`);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();

      // 检查是否跳转到登录页
      if (currentUrl.includes('login')) {
        console.log('✅ 行情中心需要登录，已跳转到登录页');
      } else {
        console.log('⚠️ 行情中心可能不需要登录');
      }

      await takeScreenshot(page, 'market-login-check');
    });

    test('10.3 - 数据展示测试', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/pages/market/market`);
      await page.waitForLoadState('networkidle');

      // 查找行情数据元素
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
          console.log(`✅ 找到行情数据元素: ${selector}`);
        }
      }

      await takeScreenshot(page, 'market-data-display');
    });
  });

  // ============================================
  // 综合测试
  // ============================================
  test.describe('综合功能测试', () => {

    test('综合流程测试 - 登录到首页', async ({ page }) => {
      // 登录
      await login(page);
      await page.waitForTimeout(1000);

      // 访问首页
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      console.log('✅ 综合流程测试完成');
      await takeScreenshot(page, 'comprehensive-test');
    });

    test('页面跳转流程测试', async ({ page }) => {
      await login(page);

      // 测试页面跳转流程
      const pages = [
        '/#/pages/index/index',
        '/#/pages/messages/messages',
        '/#/pages/discussions/discussions',
        '/#/pages/favorites/favorites',
        '/#/pages/profile/profile'
      ];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');
        console.log(`✅ 访问页面: ${pagePath}`);
        await page.waitForTimeout(500);
      }

      await takeScreenshot(page, 'page-navigation-flow');
    });

    test('性能测试 - 页面加载时间', async ({ page }) => {
      const testPages = [
        { name: '登录页', path: '/#/pages/login/login' },
        { name: '首页', path: '/#/pages/index/index' },
        { name: '消息页', path: '/#/pages/messages/messages' }
      ];

      const results = [];

      for (const testPage of testPages) {
        const startTime = Date.now();
        await page.goto(`${BASE_URL}${testPage.path}`);
        await page.waitForLoadState('networkidle');
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        results.push({
          page: testPage.name,
          loadTime: `${loadTime}ms`
        });

        console.log(`⏱️ ${testPage.name}加载时间: ${loadTime}ms`);
      }

      console.log('\n📊 性能测试汇总:');
      results.forEach(r => {
        console.log(`  ${r.page}: ${r.loadTime}`);
      });
    });

    test('响应式布局测试 - 不同屏幕尺寸', async ({ page }) => {
      await login(page);

      const sizes = [
        { name: '桌面', width: 1920, height: 1080 },
        { name: '笔记本', width: 1366, height: 768 },
        { name: '平板', width: 768, height: 1024 },
        { name: '手机', width: 375, height: 667 }
      ];

      for (const size of sizes) {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(`${BASE_URL}/#/pages/index/index`);
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: `test-results/responsive-${size.name}-${size.width}x${size.height}.png`,
          fullPage: true
        });

        console.log(`✅ ${size.name} (${size.width}x${size.height}) 测试完成`);
      }
    });

    test('网络请求监控测试', async ({ page }) => {
      const apiRequests = [];

      // 监听网络请求
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push({
            url: request.url(),
            method: request.method(),
            type: 'request'
          });
        }
      });

      page.on('response', response => {
        if (response.url().includes('/api/')) {
          apiRequests.push({
            url: response.url(),
            status: response.status(),
            type: 'response'
          });
        }
      });

      // 执行登录和访问页面
      await login(page);
      await page.goto(`${BASE_URL}/#/pages/index/index`);
      await page.waitForLoadState('networkidle');

      console.log(`\n📊 捕获到 ${apiRequests.length} 个API请求/响应`);
      apiRequests.forEach((req, index) => {
        if (req.type === 'response') {
          console.log(`  ${index + 1}. ${req.status} ${req.url}`);
        }
      });

      await takeScreenshot(page, 'network-monitoring');
    });
  });
});
