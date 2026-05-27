/**
 * 真实移动设备功能测试脚本（增强版）
 *
 * 测试内容：
 * 1. 设备连接与基础功能
 * 2. 浏览器功能测试
 * 3. 登录流程测试
 * 4. 页面导航测试
 * 5. 触摸交互测试
 * 6. 性能监控
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  adbPath: 'D:\\your-mcp-proxy\\AITY_VIP\\tools\\platform-tools\\adb.exe',
  deviceId: 'WDHNW20825000519',
  baseUrl: 'http://192.168.2.140:5173',
  testResultsDir: 'D:\\your-mcp-proxy\\AITY_VIP\\test-results\\real-device',
  screenshots: {
    login: 'login-page.png',
    home: 'home-page.png',
    messages: 'messages-page.png',
    profile: 'profile-page.png'
  }
};

// 测试结果
const testResults = {
  deviceInfo: {},
  tests: [],
  screenshots: [],
  performance: {}
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 执行 ADB 命令
function adb(cmd, timeout = 30000) {
  try {
    const fullCmd = `"${CONFIG.adbPath}" -s ${CONFIG.deviceId} ${cmd}`;
    const result = execSync(fullCmd, {
      encoding: 'utf-8',
      timeout: timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 记录测试结果
function recordTest(category, name, passed, details = '', error = '') {
  const test = {
    category,
    name,
    passed,
    details,
    error,
    timestamp: new Date().toISOString()
  };
  testResults.tests.push(test);

  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`  ${icon} ${name}`, color);

  if (details && passed) {
    log(`     ${details}`, 'reset');
  }
  if (error && !passed) {
    log(`     错误: ${error}`, 'yellow');
  }
}

// 截图并保存
function takeScreenshot(name, filename) {
  log(`\n  📸 截图: ${name}`, 'cyan');

  const remotePath = `//sdcard//${filename}`;
  const localPath = path.join(CONFIG.testResultsDir, filename);

  // 截图
  const captureResult = adb(`shell screencap -p ${remotePath}`);
  if (!captureResult.success) {
    log(`     截图失败`, 'red');
    return false;
  }

  // 等待文件写入
  sleep(500);

  // 拉取到本地
  const pullResult = adb(`pull ${remotePath} "${localPath}"`);
  if (!pullResult.success) {
    log(`     拉取失败: ${pullResult.error}`, 'red');
    return false;
  }

  // 清理设备上的截图
  adb(`shell rm ${remotePath}`);

  testResults.screenshots.push({
    name,
    filename,
    path: localPath,
    timestamp: new Date().toISOString()
  });

  log(`     已保存: ${localPath}`, 'green');
  return true;
}

// 获取屏幕尺寸
function getScreenSize() {
  const result = adb('shell wm size');
  if (result.success) {
    const match = result.output.match(/Physical size: (\d+)x(\d+)/);
    if (match) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) };
    }
  }
  return { width: 1080, height: 2400 }; // 默认值
}

// 等待函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主测试流程
async function runTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('           📱 AITY VIP 真机功能测试', 'cyan');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  // ========== 1. 设备信息采集 ==========
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  1️⃣  设备信息采集', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const model = adb('shell getprop ro.product.model');
  recordTest('设备信息', '设备型号', model.success, model.output);

  const android = adb('shell getprop ro.build.version.release');
  recordTest('设备信息', 'Android版本', android.success, android.output);

  const brand = adb('shell getprop ro.product.brand');
  recordTest('设备信息', '设备品牌', brand.success, brand.output);

  const screenSize = getScreenSize();
  recordTest('设备信息', '屏幕分辨率', true, `${screenSize.width}x${screenSize.height}`);

  const density = adb('shell wm density');
  if (density.success) {
    const densityMatch = density.output.match(/Physical density: (\d+)/);
    if (densityMatch) {
      recordTest('设备信息', '屏幕密度', true, `${densityMatch[1]} dpi`);
    }
  }

  testResults.deviceInfo = {
    model: model.output,
    android: android.output,
    brand: brand.output,
    screenSize,
    deviceId: CONFIG.deviceId
  };

  // ========== 2. 网络连通性测试 ==========
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  2️⃣  网络连通性测试', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const connectivity = adb('shell ping -c 1 192.168.2.140');
  recordTest('网络', 'Ping H5服务器', connectivity.success);

  const wifi = adb('shell dumpsys connectivity | grep "NetworkInfo"');
  recordTest('网络', 'WiFi连接状态', wifi.success, wifi.output.split('\n')[0] || '已连接');

  // ========== 3. 浏览器功能测试 ==========
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  3️⃣  浏览器功能测试', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 清除所有后台应用
  log('  清理后台应用...', 'yellow');
  adb('shell am kill-all');

  // 打开登录页面
  const loginUrl = `${CONFIG.baseUrl}/#/pages/login/login`;
  log(`  打开登录页面: ${loginUrl}`, 'cyan');

  const openLogin = adb(`shell am start -a android.intent.action.VIEW -d "${loginUrl}"`);
  recordTest('浏览器', '打开登录页面', openLogin.success);

  if (openLogin.success) {
    log('  等待页面加载...', 'yellow');
    await sleep(8000); // 等待页面完全加载

    takeScreenshot('登录页面', CONFIG.screenshots.login);

    // 获取当前Activity
    const activity = adb('shell dumpsys window windows | grep mCurrentFocus');
    if (activity.success) {
      log(`  当前焦点: ${activity.output.split('\n')[0]}`, 'reset');
    }
  }

  // ========== 4. 登录流程测试 ==========
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  4️⃣  登录交互测试', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 获取UI层级
  log('  获取UI层级结构...', 'yellow');
  const uiDump = adb('shell uiautomator dump //sdcard//ui_dump.xml');
  if (uiDump.success) {
    const pullUi = adb('pull //sdcard//ui_dump.xml "test-results/real-device/ui-hierarchy.xml"');
    recordTest('UI分析', '获取UI层级', pullUi.success);
    adb('shell rm //sdcard//ui_dump.xml');
  }

  // 模拟点击操作（根据实际屏幕坐标调整）
  const centerX = Math.floor(screenSize.width / 2);
  const topY = Math.floor(screenSize.height * 0.4);
  const bottomY = Math.floor(screenSize.height * 0.6);

  log(`  屏幕中心坐标: (${centerX}, ${topY})`, 'reset');

  // 点击邮箱输入框（需要根据实际情况调整坐标）
  log('  尝试点击输入框区域...', 'yellow');
  const tapInput = adb(`shell input tap ${centerX} ${topY}`);
  recordTest('触摸操作', '点击输入框', tapInput.success);

  await sleep(1000);

  // 输入测试邮箱
  log('  输入测试邮箱...', 'yellow');
  const inputEmail = adb('shell input text "test@example.com"');
  recordTest('输入操作', '输入邮箱', inputEmail.success);

  await sleep(1000);

  // 点击密码输入框
  const tapPassword = adb(`shell input tap ${centerX} ${topY + 150}`);
  recordTest('触摸操作', '点击密码框', tapPassword.success);

  await sleep(1000);

  // 输入测试密码
  log('  输入测试密码...', 'yellow');
  const inputPassword = adb('shell input text "123456"');
  recordTest('输入操作', '输入密码', inputPassword.success);

  await sleep(1000);

  // 点击登录按钮
  const buttonY = Math.floor(screenSize.height * 0.55);
  const tapLogin = adb(`shell input tap ${centerX} ${buttonY}`);
  recordTest('触摸操作', '点击登录按钮', tapLogin.success);

  if (tapLogin.success) {
    log('  等待登录响应...', 'yellow');
    await sleep(5000);

    takeScreenshot('登录后页面', 'after-login.png');
  }

  // ========== 5. 页面导航测试 ==========
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  5️⃣  页面导航测试', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 打开首页
  const homeUrl = `${CONFIG.baseUrl}/#/pages/index/index`;
  log(`  打开首页: ${homeUrl}`, 'cyan');
  const openHome = adb(`shell am start -a android.intent.action.VIEW -d "${homeUrl}"`);
  recordTest('导航', '打开首页', openHome.success);

  if (openHome.success) {
    await sleep(6000);
    takeScreenshot('首页', CONFIG.screenshots.home);
  }

  // 测试页面滚动
  log('  测试页面滚动...', 'yellow');
  const scrollDown = adb(`shell input swipe ${centerX} ${screenSize.height - 500} ${centerX} 500`);
  recordTest('手势操作', '向下滚动', scrollDown.success);

  await sleep(2000);

  const scrollUp = adb(`shell input swipe ${centerX} 500 ${centerX} ${screenSize.height - 500}`);
  recordTest('手势操作', '向上滚动', scrollUp.success);

  await sleep(2000);

  takeScreenshot('滚动后首页', 'home-after-scroll.png');

  // ========== 6. 性能监控 ==========
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  6️⃣  性能监控', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // CPU使用率
  const cpu = adb('shell top -n 1 | grep -A 5 "PID"');
  if (cpu.success) {
    const lines = cpu.output.split('\n').slice(0, 5);
    log('  CPU使用情况（Top 5）:', 'reset');
    lines.forEach(line => log(`    ${line}`, 'reset'));
    recordTest('性能', 'CPU监控', true);
  }

  // 内存信息
  const mem = adb('shell dumpsys meminfo | grep "Total RAM"');
  if (mem.success) {
    log(`  ${mem.output}`, 'reset');
    recordTest('性能', '内存监控', true, mem.output);
  }

  // 电池信息
  const battery = adb('shell dumpsys battery | grep -E "level|status|health|temperature"');
  if (battery.success) {
    log('  电池状态:', 'reset');
    battery.output.split('\n').forEach(line => {
      if (line.trim()) log(`    ${line}`, 'reset');
    });
    recordTest('性能', '电池监控', true);
  }

  // 进程信息
  const process = adb('shell ps | grep -E "com.android.chrome|browser"');
  if (process.success && process.output) {
    log('  浏览器进程:', 'reset');
    log(`    ${process.output}`, 'reset');
    recordTest('性能', '进程监控', true);
  }

  // 网络流量
  const network = adb('shell cat //proc//net//dev | grep wlan0');
  if (network.success) {
    log('  网络流量统计:', 'reset');
    log(`    ${network.output}`, 'reset');
    recordTest('性能', '网络流量', true);
  }

  // ========== 7. 稳定性测试 ==========
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  7️⃣  稳定性测试', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 连续点击测试
  log('  执行连续点击测试（5次）...', 'yellow');
  let allPassed = true;
  const centerY = Math.floor(screenSize.height / 2);
  for (let i = 0; i < 5; i++) {
    const result = adb(`shell input tap ${centerX} ${centerY}`);
    if (!result.success) {
      allPassed = false;
      break;
    }
    await sleep(200);
  }
  recordTest('稳定性', '连续点击', allPassed);

  // 快速切换页面
  log('  快速切换页面测试...', 'yellow');
  const pages = [
    `${CONFIG.baseUrl}/#/pages/index/index`,
    `${CONFIG.baseUrl}/#/pages/message/message`,
    `${CONFIG.baseUrl}/#/pages/discuss/discuss`,
    `${CONFIG.baseUrl}/#/pages/mine/mine`
  ];

  let switchPassed = true;
  for (const page of pages) {
    const result = adb(`shell am start -a android.intent.action.VIEW -d "${page}"`);
    if (!result.success) {
      switchPassed = false;
      break;
    }
    await sleep(2000);
  }

  recordTest('稳定性', '页面切换', switchPassed, `测试了${pages.length}个页面`);

  await sleep(3000);
  takeScreenshot('稳定性测试后', 'stability-test.png');

  // ========== 测试报告 ==========
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('                     📊 测试报告', 'cyan');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  // 统计结果
  const total = testResults.tests.length;
  const passed = testResults.tests.filter(t => t.passed).length;
  const failed = total - passed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  log(`\n  总测试数: ${total}`, 'reset');
  log(`  通过: ${passed}`, 'green');
  log(`  失败: ${failed}`, 'red');
  log(`  通过率: ${passRate}%\n`, passRate >= 80 ? 'green' : 'yellow');

  // 按分类统计
  const categories = {};
  testResults.tests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { total: 0, passed: 0 };
    }
    categories[test.category].total++;
    if (test.passed) {
      categories[test.category].passed++;
    }
  });

  log('  分类统计:', 'blue');
  Object.keys(categories).forEach(cat => {
    const { total, passed } = categories[cat];
    const rate = ((passed / total) * 100).toFixed(1);
    log(`    ${cat}: ${passed}/${total} (${rate}%)`, 'reset');
  });

  // 截图列表
  log(`\n  截图文件 (${testResults.screenshots.length}张):`, 'blue');
  testResults.screenshots.forEach(ss => {
    log(`    📸 ${ss.name}: ${ss.path}`, 'reset');
  });

  // 失败测试列表
  const failedTests = testResults.tests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    log(`\n  失败测试详情:`, 'red');
    failedTests.forEach(test => {
      log(`    ❌ [${test.category}] ${test.name}`, 'red');
      if (test.error) {
        log(`       ${test.error}`, 'yellow');
      }
    });
  }

  log('\n═══════════════════════════════════════════════════════════════\n', 'cyan');

  // 保存测试报告
  const reportPath = path.join(CONFIG.testResultsDir, `test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`  测试报告已保存: ${reportPath}\n`, 'green');

  return testResults;
}

// 运行测试
runTests().catch(error => {
  log(`\n❌ 测试执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
