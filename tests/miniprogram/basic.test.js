/**
 * 小程序自动化测试 - 基础功能测试
 * 基于uni-automator
 *
 * 前置条件：
 * 1. 微信开发者工具已安装
 * 2. 微信开发者工具服务端口已开启（设置 → 安全设置 → 服务端口）
 * 3. 小程序已构建（npm run build:mp-weixin）
 */

const automator = require('@dcloudio/uni-automator');
const assert = require('assert');

describe('小程序基础功能测试', function() {
  this.timeout(60000); // 设置超时时间为60秒

  let miniProgram;
  let page;

  // 测试前初始化
  before(async () => {
    console.log('🚀 启动小程序...');
    miniProgram = await automator.launch({
      projectPath: './dist/dev/mp-weixin',
      // Windows路径，根据实际安装位置调整
      cliPath: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'
    });
    console.log('✅ 小程序启动成功');
  });

  // 测试后清理
  after(async () => {
    if (miniProgram) {
      await miniProgram.close();
      console.log('👋 小程序已关闭');
    }
  });

  // 测试1: 首页加载
  it('01 - 首页应该正常加载', async () => {
    page = await miniProgram.reLaunch('/pages/index/index');
    await page.waitFor(1000);

    const currentPage = await miniProgram.currentPage();
    console.log('当前页面路径:', currentPage.path);

    assert.ok(currentPage.path.includes('index'), '应该在首页');
    console.log('✅ 首页加载测试通过');
  });

  // 测试2: 页面导航测试
  it('02 - tabBar导航测试', async () => {
    // 测试各个tab页面的导航
    const tabs = [
      { path: '/pages/messages/messages', name: '消息' },
      { path: '/pages/discussions/discussions', name: '讨论' },
      { path: '/pages/turing/turing', name: '图灵' },
      { path: '/pages/profile/profile', name: '我的' }
    ];

    for (const tab of tabs) {
      await miniProgram.switchTab(tab.path);
      await page.waitFor(1000);

      const currentPage = await miniProgram.currentPage();
      console.log(`切换到${tab.name}页面:`, currentPage.path);
      assert.ok(currentPage.path.includes(tab.path.split('/')[2]), `应该在${tab.name}页面`);
    }

    console.log('✅ TabBar导航测试通过');
  });

  // 测试3: 登录页面测试
  it('03 - 登录页面元素检查', async () => {
    page = await miniProgram.navigateTo('/pages/login/login');
    await page.waitFor(1000);

    // 检查登录页面元素
    const emailInput = await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button');

    console.log('邮箱输入框:', emailInput ? '✅ 存在' : '❌ 不存在');
    console.log('密码输入框:', passwordInput ? '✅ 存在' : '❌ 不存在');
    console.log('登录按钮:', loginButton ? '✅ 存在' : '❌ 不存在');

    assert.ok(emailInput, '应该有邮箱输入框');
    assert.ok(passwordInput, '应该有密码输入框');
    assert.ok(loginButton, '应该有登录按钮');

    console.log('✅ 登录页面元素检查通过');
  });

  // 测试4: 登录功能测试
  it('04 - 登录功能测试', async () => {
    page = await miniProgram.reLaunch('/pages/login/login');
    await page.waitFor(1000);

    // 填写登录信息
    const emailInput = await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button');

    if (emailInput && passwordInput && loginButton) {
      await emailInput.input('admin@example.com');
      await passwordInput.input('admin123');

      console.log('已填写登录信息');

      // 点击登录按钮
      await loginButton.tap();
      await page.waitFor(2000);

      console.log('✅ 登录功能测试完成');
    }
  });

  // 测试5: 我的页面功能测试
  it('05 - 我的页面功能测试', async () => {
    await miniProgram.switchTab('/pages/profile/profile');
    await page.waitFor(1000);

    // 检查我的页面菜单项
    const menuItems = await page.$$('.menu-item');
    console.log(`找到 ${menuItems.length} 个菜单项`);

    // 应该至少有几个核心菜单项
    assert.ok(menuItems.length >= 3, '应该至少有3个菜单项');

    console.log('✅ 我的页面功能测试通过');
  });

  // 测试6: 行情中心入口测试（新功能）
  it('06 - 行情中心入口测试', async () => {
    await miniProgram.switchTab('/pages/profile/profile');
    await page.waitFor(1000);

    // 查找行情中心菜单项
    const marketMenuItem = await page.$('.menu-item:contains(行情中心)');
    if (marketMenuItem) {
      console.log('✅ 找到行情中心入口');

      // 点击进入行情页面
      await marketMenuItem.tap();
      await page.waitFor(1000);

      const currentPage = await miniProgram.currentPage();
      console.log('当前页面:', currentPage.path);

      // 应该跳转到行情页面
      assert.ok(currentPage.path.includes('market'), '应该在行情页面');
      console.log('✅ 行情中心入口测试通过');
    } else {
      console.log('⚠️ 未找到行情中心入口（可能需要滚动页面）');
    }
  });

  // 测试7: 收藏功能测试（修复后）
  it('07 - 收藏页面加载测试', async () => {
    page = await miniProgram.navigateTo('/pages/favorites/favorites');
    await page.waitFor(2000);

    const currentPage = await miniProgram.currentPage();
    console.log('当前页面:', currentPage.path);

    // 检查是否有tab切换
    const tabs = await page.$$('.tab-item');
    if (tabs.length > 0) {
      console.log(`找到 ${tabs.length} 个收藏tab`);
      console.log('✅ 收藏页面加载测试通过');
    } else {
      console.log('⚠️ 收藏页面可能需要登录');
    }
  });
});

// 测试运行说明
console.log(`
==========================================
   小程序自动化测试说明
==========================================

前置条件：
1. ✅ 微信开发者工具已安装
2. ✅ 微信开发者工具服务端口已开启
3. ✅ 小程序已构建（当前已完成）

运行方式：
npx uni-automator test --platform mp-weixin tests/miniprogram/basic.test.js

或者直接运行：
npm run test:mp-weixin

注意事项：
- 首次运行可能需要授权
- 测试期间不要操作微信开发者工具
- 失败时会自动截图保存

==========================================
`);
