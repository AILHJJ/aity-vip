/**
 * 真实移动设备测试 - 微信小程序
 *
 * 使用方法：
 * 1. 手机连接电脑（USB）
 * 2. 手机开启开发者模式和USB调试
 * 3. 微信开发者工具开启真机调试
 * 4. 运行此脚本
 */

const { Automator } = require('@dcloudio/uni-automator');

async function runRealDeviceTest() {
  console.log('📱 开始真实设备测试...\n');

  let miniProgram;

  try {
    // 连接到真机
    console.log('1️⃣ 连接微信开发者工具...');
    miniProgram = await Automator.launch({
      projectPath: './dist/dev/mp-weixin',
      cliPath: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'
    });

    // 获取设备信息
    console.log('2️⃣ 获取设备信息...');
    const systemInfo = await miniProgram.evaluate(() => {
      return wx.getSystemInfoSync();
    });
    console.log('📱 设备信息:', JSON.stringify(systemInfo, null, 2));

    // 测试1: 登录页面
    console.log('\n3️⃣ 测试登录页面...');
    const loginPage = await miniProgram.reLaunch('/pages/login/login');
    await loginPage.waitFor(2000);

    // 在真机上截图
    await loginPage.screenshot({
      path: 'test-results/mobile-real-device-login.png'
    });
    console.log('✅ 登录页截图已保存');

    // 测试2: 触摸操作（真机特有）
    console.log('\n4️⃣ 测试触摸操作...');

    // 输入账号
    const emailInput = await loginPage.$('input[type="text"]');
    if (emailInput) {
      await emailInput.inputValue('admin@example.com');
      console.log('✅ 输入账号成功');
    }

    // 输入密码
    const passwordInput = await loginPage.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.inputValue('admin123');
      console.log('✅ 输入密码成功');
    }

    // 点击登录按钮（模拟触摸）
    const loginButton = await loginPage.$('button');
    if (loginButton) {
      await loginButton.tap(); // 真机使用 tap 而不是 click
      console.log('✅ 点击登录按钮');
    }

    // 等待跳转
    await loginPage.waitFor(3000);

    // 测试3: 测试震动反馈（真机特有）
    console.log('\n5️⃣ 测试震动反馈...');
    await miniProgram.evaluate(() => {
      wx.vibrateShort({
        type: 'medium'
      });
    });
    console.log('✅ 触发震动反馈');

    // 测试4: 测试扫码功能（真机特有）
    console.log('\n6️⃣ 测试扫码功能（仅提示）...');
    // 扫码需要在真机上手动确认
    console.log('⚠️ 扫码功能需要手动测试');

    console.log('\n🎉 真机测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (miniProgram) {
      await miniProgram.close();
    }
  }
}

// 运行测试
runRealDeviceTest();
