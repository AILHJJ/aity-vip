/**
 * 真实移动设备自动化测试脚本
 *
 * 设备信息：
 * - 型号: MXW-AN00 (华为/荣耀)
 * - Android: 10
 * - 设备ID: WDHNW20825000519
 *
 * 使用方法：
 * 1. 确保手机已连接并开启 USB 调试
 * 2. 确保手机和电脑在同一网络（或使用端口转发）
 * 3. 运行: node tests/mobile/real-device-automated-test.js
 */

const { spawn, execSync } = require('child_process');
const http = require('http');

// 配置
const CONFIG = {
  adbPath: 'D:\\your-mcp-proxy\\AITY_VIP\\tools\\platform-tools\\adb.exe',
  deviceId: 'WDHNW20825000519',
  baseUrl: 'http://192.168.2.140:5173',
  testResultsDir: 'D:\\your-mcp-proxy\\AITY_VIP\\aity-uni-app-v2\\test-results\\real-device',
  timeout: 30000
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 执行 ADB 命令
function adbCommand(cmd, timeout = CONFIG.timeout) {
  try {
    const fullCmd = `"${CONFIG.adbPath}" -s ${CONFIG.deviceId} ${cmd}`;
    const result = execSync(fullCmd, {
      encoding: 'utf-8',
      timeout: timeout
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 测试结果
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 记录测试结果
function recordTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    log(`  ✅ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`  ❌ ${name}`, 'red');
    if (details) log(`     原因: ${details}`, 'yellow');
  }
}

// 主测试函数
async function runRealDeviceTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('           📱 真实移动设备自动化测试', 'cyan');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  // ============== 测试 1: 设备连接检查 ==============
  log('\n📋 测试 1: 设备连接检查', 'blue');

  const deviceCheck = adbCommand('shell getprop ro.product.model');
  if (deviceCheck.success) {
    recordTest('ADB连接正常', true);
    log(`     设备型号: ${deviceCheck.output}`, 'reset');

    const androidVersion = adbCommand('shell getprop ro.build.version.release');
    log(`     Android版本: ${androidVersion.output}`, 'reset');
  } else {
    recordTest('ADB连接正常', false, deviceCheck.error);
    return;
  }

  // ============== 测试 2: 网络连通性检查 ==============
  log('\n📋 测试 2: 网络连通性检查', 'blue');

  // 检查 H5 服务是否可达
  const serverCheck = await new Promise((resolve) => {
    const req = http.get(CONFIG.baseUrl, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });

  recordTest('H5服务器可达', serverCheck, serverCheck ? '' : `无法访问 ${CONFIG.baseUrl}`);

  // ============== 测试 3: 端口转发设置 ==============
  log('\n📋 测试 3: 端口转发设置', 'blue');

  // 清除旧的端口转发
  adbCommand('forward --remove tcp:5173', 5000);

  // 设置端口转发
  const forwardResult = adbCommand('forward tcp:5173 tcp:5173', 5000);
  recordTest('端口转发设置', forwardResult.success, forwardResult.error);

  // ============== 测试 4: 在真机上打开浏览器 ==============
  log('\n📋 测试 4: 在真机上打开浏览器', 'blue');

  // 清除浏览器数据（可选）
  // adbCommand('shell pm clear com.android.chrome');

  // 打开 Chrome 浏览器并访问页面
  const openBrowser = adbCommand(
    `shell am start -a android.intent.action.VIEW -d "${CONFIG.baseUrl}/#/pages/login/login"`
  );
  recordTest('打开浏览器', openBrowser.success, openBrowser.error);

  if (!openBrowser.success) {
    log('\n⚠️ 无法打开浏览器，尝试使用 Intent 方式...', 'yellow');
  }

  // 等待页面加载
  log('\n⏳ 等待页面加载 (5秒)...', 'yellow');
  await sleep(5000);

  // ============== 测试 5: 截图测试 ==============
  log('\n📋 测试 5: 截图测试', 'blue');

  const screenshotPath = '/sdcard/test-screenshot.png';
  const localPath = `${CONFIG.testResultsDir}/real-device-screenshot.png`;

  const screenshotResult = adbCommand(`shell screencap -p ${screenshotPath}`);
  recordTest('截取屏幕', screenshotResult.success, screenshotResult.error);

  if (screenshotResult.success) {
    // 创建目录
    execSync(`mkdir -p "${CONFIG.testResultsDir}"`, { shell: true });

    // 拉取截图到本地
    const pullResult = adbCommand(`pull ${screenshotPath} "${localPath}"`);
    recordTest('截图保存到本地', pullResult.success, pullResult.error);

    if (pullResult.success) {
      log(`     截图已保存: ${localPath}`, 'reset');
    }

    // 清理手机上的截图
    adbCommand(`shell rm ${screenshotPath}`, 5000);
  }

  // ============== 测试 6: 获取当前 Activity ==============
  log('\n📋 测试 6: 获取当前 Activity', 'blue');

  const currentActivity = adbCommand('shell dumpsys activity activities | grep mResumedActivity');
  if (currentActivity.success && currentActivity.output) {
    log(`     当前 Activity: ${currentActivity.output.split('\n')[0]}`, 'reset');
    recordTest('获取当前 Activity', true);
  } else {
    recordTest('获取当前 Activity', false, currentActivity.error);
  }

  // ============== 测试 7: UI 层级分析 ==============
  log('\n📋 测试 7: UI 层级分析', 'blue');

  const uiDumpPath = '/sdcard/window_dump.xml';
  const uiLocalPath = `${CONFIG.testResultsDir}/ui-hierarchy.xml`;

  const uiDumpResult = adbCommand(`shell uiautomator dump ${uiDumpPath}`);
  recordTest('生成 UI 层级文件', uiDumpResult.success, uiDumpResult.error);

  if (uiDumpResult.success) {
    const uiPullResult = adbCommand(`pull ${uiDumpPath} "${uiLocalPath}"`);
    recordTest('UI 层级保存到本地', uiPullResult.success, uiPullResult.error);

    if (uiPullResult.success) {
      log(`     UI 层级文件: ${uiLocalPath}`, 'reset');
    }

    // 清理
    adbCommand(`shell rm ${uiDumpPath}`, 5000);
  }

  // ============== 测试 8: 性能指标采集 ==============
  log('\n📋 测试 8: 性能指标采集', 'blue');

  // CPU 使用率
  const cpuResult = adbCommand('shell dumpsys cpuinfo | grep -A1 "TOTAL:"');
  if (cpuResult.success) {
    log(`     CPU 使用率: ${cpuResult.output.split('\n')[0]}`, 'reset');
    recordTest('CPU 使用率采集', true);
  }

  // 内存使用
  const memResult = adbCommand('shell dumpsys meminfo | grep "Total RAM"');
  if (memResult.success) {
    log(`     内存信息: ${memResult.output.split('\n')[0]}`, 'reset');
    recordTest('内存信息采集', true);
  }

  // 电池信息
  const batteryResult = adbCommand('shell dumpsys battery');
  if (batteryResult.success) {
    const lines = batteryResult.output.split('\n').slice(0, 6);
    lines.forEach(line => log(`     ${line}`, 'reset'));
    recordTest('电池信息采集', true);
  }

  // ============== 测试 9: 模拟触摸操作 ==============
  log('\n📋 测试 9: 模拟触摸操作', 'blue');

  // 获取屏幕分辨率
  const screenSize = adbCommand('shell wm size');
  log(`     屏幕分辨率: ${screenSize.output}`, 'reset');

  // 点击屏幕中心（示例）
  log('\n     模拟点击屏幕中心...', 'reset');
  const tapResult = adbCommand('shell input tap 540 1200');
  recordTest('模拟点击操作', tapResult.success, tapResult.error);

  await sleep(1000);

  // ============== 测试 10: 模拟输入文字 ==============
  log('\n📋 测试 10: 模拟输入文字', 'blue');

  // 注意：需要先聚焦到输入框
  log('     模拟输入邮箱...', 'reset');
  const typeResult = adbCommand('shell input text "admin@example.com"');
  recordTest('模拟输入文字', typeResult.success, typeResult.error);

  // ============== 测试完成 ==============
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('                     📊 测试结果汇总', 'cyan');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  const total = testResults.passed + testResults.failed;
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

  log(`\n  总测试数: ${total}`, 'reset');
  log(`  通过: ${testResults.passed}`, 'green');
  log(`  失败: ${testResults.failed}`, 'red');
  log(`  通过率: ${passRate}%\n`, passRate >= 80 ? 'green' : 'yellow');

  // 详细结果
  log('  详细结果:', 'blue');
  testResults.tests.forEach((test, index) => {
    const status = test.passed ? '✅' : '❌';
    log(`    ${index + 1}. ${status} ${test.name}`, test.passed ? 'green' : 'red');
  });

  log('\n═══════════════════════════════════════════════════════════════\n', 'cyan');

  // 清理端口转发
  adbCommand('forward --remove tcp:5173', 5000);

  return testResults;
}

// 工具函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行测试
runRealDeviceTests().catch(console.error);
