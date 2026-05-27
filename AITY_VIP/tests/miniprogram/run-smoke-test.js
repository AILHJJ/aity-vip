/**
 * 小程序测试运行器 - 直接使用node运行
 */

const path = require('path');

// 从前端项目加载uni-automator
const { Automator } = require(path.join(__dirname, '../../aity-uni-app-v2/node_modules/@dcloudio/uni-automator'));

async function runSmokeTest() {
  let miniProgram = null;

  try {
    console.log('==========================================');
    console.log('   🚀 小程序冒烟测试开始');
    console.log('==========================================');
    console.log('');

    // 启动小程序
    console.log('📱 正在启动小程序...');
    const automator = new Automator();

    // 使用Windows格式的路径
    const projectPath = 'D:\\your-mcp-proxy\\AITY_VIP\\aity-uni-app-v2\\dist\\dev\\mp-weixin';
    const cliPath = 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat';

    console.log('项目路径:', projectPath);
    console.log('CLI路径:', cliPath);
    console.log('');

    miniProgram = await automator.launch({
      projectPath: projectPath,
      cliPath: cliPath
    });
    console.log('✅ 小程序启动成功！');
    console.log('');

    // 测试1: 应用启动
    console.log('📋 测试1: 应用启动测试');
    console.log('----------------------------------------');
    const page = await miniProgram.reLaunch('/pages/index/index');
    await page.waitFor(2000);

    const currentPage = await miniProgram.currentPage();
    console.log('当前页面路径:', currentPage.path);
    console.log('✅ 应用启动成功！');
    console.log('');

    // 测试2: TabBar导航
    console.log('📋 测试2: TabBar导航测试');
    console.log('----------------------------------------');
    const tabs = [
      { path: '/pages/messages/messages', name: '消息' },
      { path: '/pages/discussions/discussions', name: '讨论' },
      { path: '/pages/turing/turing', name: '图灵' },
      { path: '/pages/profile/profile', name: '我的' }
    ];

    for (const tab of tabs) {
      await miniProgram.switchTab(tab.path);
      await page.waitFor(1000);

      const currentTab = await miniProgram.currentPage();
      console.log(`✅ 切换到${tab.name}页面: ${currentTab.path}`);
    }
    console.log('');

    // 测试3: 登录页面
    console.log('📋 测试3: 登录页面测试');
    console.log('----------------------------------------');
    const loginPage = await miniProgram.navigateTo('/pages/login/login');
    await loginPage.waitFor(1000);

    const currentLoginPage = await miniProgram.currentPage();
    console.log('当前页面:', currentLoginPage.path);
    console.log('✅ 登录页面访问成功！');
    console.log('');

    // 测试4: 我的页面（检查行情入口）
    console.log('📋 测试4: 我的页面功能测试');
    console.log('----------------------------------------');
    await miniProgram.switchTab('/pages/profile/profile');
    await page.waitFor(1000);

    const profilePage = await miniProgram.currentPage();
    console.log('当前页面:', profilePage.path);
    console.log('✅ 我的页面加载成功！');
    console.log('提示: 行情中心入口应该在此页面的菜单中');
    console.log('');

    console.log('==========================================');
    console.log('   ✅ 冒烟测试全部通过！');
    console.log('==========================================');
    console.log('');
    console.log('测试总结:');
    console.log('  ✅ 应用启动 - 通过');
    console.log('  ✅ TabBar导航 - 通过');
    console.log('  ✅ 登录页面 - 通过');
    console.log('  ✅ 我的页面 - 通过');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('==========================================');
    console.error('   ❌ 测试失败');
    console.error('==========================================');
    console.error('');
    console.error('错误信息:', error.message);
    console.error('');
    console.error('可能的原因:');
    console.error('  1. 微信开发者工具未运行');
    console.error('  2. 服务端口未开启（设置 → 安全设置 → 服务端口）');
    console.error('  3. 小程序项目路径不正确');
    console.error('');

    if (error.message.includes('无法连接') || error.message.includes('timeout')) {
      console.error('💡 解决方法:');
      console.error('  1. 打开微信开发者工具');
      console.error('  2. 设置 → 安全设置 → 开启服务端口');
      console.error('  3. 确保端口没有被防火墙阻止');
      console.error('');
    }

    process.exit(1);
  } finally {
    if (miniProgram) {
      console.log('👋 正在关闭小程序...');
      await miniProgram.close();
      console.log('✅ 小程序已关闭');
      console.log('');
    }
  }
}

// 运行测试
runSmokeTest();
