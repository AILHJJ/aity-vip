/**
 * 小程序自动化测试 - 使用微信开发者工具CLI
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLI_PATH = 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat';
const PROJECT_PATH = path.join(__dirname, '../../aity-uni-app-v2/dist/dev/mp-weixin');

// 测试结果记录
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// 执行CLI命令
function executeCLI(command) {
  return new Promise((resolve, reject) => {
    console.log(`执行命令: ${command}`);
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error && !stdout.includes('✔')) {
        reject({ error, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

// 测试用例
async function runTests() {
  console.log('==========================================');
  console.log('   🚀 小程序自动化测试开始');
  console.log('==========================================');
  console.log('');

  try {
    // 测试1: 检查CLI可用性
    console.log('📋 测试1: 检查微信开发者工具CLI');
    console.log('----------------------------------------');
    testResults.total++;

    try {
      const loginStatus = await executeCLI(`"${CLI_PATH}" islogin`);
      console.log('✅ CLI可用，登录状态:', loginStatus.includes('true') ? '已登录' : '未登录');
      testResults.passed++;
      testResults.tests.push({ name: 'CLI可用性', status: 'passed' });
    } catch (e) {
      console.log('❌ CLI不可用');
      testResults.failed++;
      testResults.tests.push({ name: 'CLI可用性', status: 'failed', error: e.stderr });
    }
    console.log('');

    // 测试2: 检查项目路径
    console.log('📋 测试2: 检查小程序项目');
    console.log('----------------------------------------');
    testResults.total++;

    if (fs.existsSync(PROJECT_PATH)) {
      console.log('✅ 项目路径存在:', PROJECT_PATH);
      const appJson = path.join(PROJECT_PATH, 'app.json');
      if (fs.existsSync(appJson)) {
        console.log('✅ app.json 配置文件存在');
        testResults.passed++;
        testResults.tests.push({ name: '项目完整性', status: 'passed' });
      } else {
        console.log('❌ app.json 配置文件不存在');
        testResults.failed++;
        testResults.tests.push({ name: '项目完整性', status: 'failed' });
      }
    } else {
      console.log('❌ 项目路径不存在');
      testResults.failed++;
      testResults.tests.push({ name: '项目完整性', status: 'failed' });
    }
    console.log('');

    // 测试3: 检查页面文件
    console.log('📋 测试3: 检查核心页面文件');
    console.log('----------------------------------------');
    testResults.total++;

    const requiredPages = [
      'pages/login/login',
      'pages/messages/messages',
      'pages/discussions/discussions',
      'pages/profile/profile',
      'pages/market/market'
    ];

    let pagesExist = 0;
    for (const page of requiredPages) {
      const pagePath = path.join(PROJECT_PATH, page + '.js');
      if (fs.existsSync(pagePath)) {
        console.log(`  ✅ ${page}`);
        pagesExist++;
      } else {
        console.log(`  ❌ ${page} 不存在`);
      }
    }

    if (pagesExist === requiredPages.length) {
      console.log('✅ 所有核心页面文件完整');
      testResults.passed++;
      testResults.tests.push({ name: '页面文件完整性', status: 'passed', details: `${pagesExist}/${requiredPages.length}` });
    } else {
      console.log(`⚠️  部分页面文件缺失: ${pagesExist}/${requiredPages.length}`);
      testResults.failed++;
      testResults.tests.push({ name: '页面文件完整性', status: 'failed', details: `${pagesExist}/${requiredPages.length}` });
    }
    console.log('');

    // 测试4: 检查pages.json配置
    console.log('📋 测试4: 检查pages.json配置');
    console.log('----------------------------------------');
    testResults.total++;

    try {
      const pagesJsonPath = path.join(PROJECT_PATH, 'app.json');
      const pagesJson = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'));

      // 检查登录页是否是首页（修复后应该是）
      const firstPage = pagesJson.pages[0];
      if (firstPage.path === 'pages/login/login') {
        console.log('✅ 登录页正确设置为首页');
        testResults.passed++;
        testResults.tests.push({ name: '首页配置', status: 'passed' });
      } else {
        console.log(`❌ 首页配置错误: ${firstPage.path}（应该是 pages/login/login）`);
        testResults.failed++;
        testResults.tests.push({ name: '首页配置', status: 'failed', error: `当前首页: ${firstPage.path}` });
      }

      // 检查tabBar配置（不应该包含行情）
      const tabBarPages = pagesJson.tabBar?.list?.map(item => item.pagePath) || [];
      console.log('TabBar页面:', tabBarPages.join(', '));
      if (!tabBarPages.includes('pages/market/market')) {
        console.log('✅ 行情页面已从TabBar移除');
      } else {
        console.log('⚠️  行情页面仍在TabBar中');
      }
    } catch (e) {
      console.log('❌ 无法读取app.json:', e.message);
      testResults.failed++;
      testResults.tests.push({ name: '配置文件读取', status: 'failed', error: e.message });
    }
    console.log('');

    // 测试5: 编译状态检查
    console.log('📋 测试5: 小程序编译状态');
    console.log('----------------------------------------');
    testResults.total++;

    const buildTime = fs.statSync(path.join(PROJECT_PATH, 'app.js')).mtime;
    const now = new Date();
    const minutesAgo = (now - buildTime) / 1000 / 60;

    console.log(`最后编译时间: ${buildTime.toLocaleString()}`);
    console.log(`距离现在: ${Math.round(minutesAgo)} 分钟`);

    if (minutesAgo < 60) {
      console.log('✅ 小程序编译状态良好（1小时内）');
      testResults.passed++;
      testResults.tests.push({ name: '编译状态', status: 'passed' });
    } else {
      console.log('⚠️  小程序可能需要重新编译');
      testResults.passed++; // 不算失败，只是提示
      testResults.tests.push({ name: '编译状态', status: 'warning', details: `${Math.round(minutesAgo)}分钟前` });
    }
    console.log('');

  } catch (error) {
    console.error('测试执行出错:', error);
  }

  // 输出测试报告
  console.log('==========================================');
  console.log('   📊 测试报告');
  console.log('==========================================');
  console.log('');
  console.log(`总测试数: ${testResults.total}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log('');
  console.log('详细结果:');
  testResults.tests.forEach((test, index) => {
    const status = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
    console.log(`  ${index + 1}. ${status} ${test.name}`);
    if (test.details) console.log(`     详情: ${test.details}`);
    if (test.error) console.log(`     错误: ${test.error}`);
  });
  console.log('');

  // 保存测试报告
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`📄 测试报告已保存: ${reportPath}`);
  console.log('');

  return testResults;
}

// 运行测试
runTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
