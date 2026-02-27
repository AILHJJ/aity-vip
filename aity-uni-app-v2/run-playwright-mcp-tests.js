#!/usr/bin/env node

/**
 * AITY VIP 系统 - Playwright MCP 测试运行器
 * 自动化测试脚本
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  headless: process.env.HEADLESS !== 'false',
  screenshotDir: './test-results',
  timeout: 30000,
  // 使用系统已安装的 Chrome 浏览器
  chromePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
};

// 确保截图目录存在
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// 测试结果
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📍',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📍';

  console.log(`${prefix} [${timestamp}] ${message}`);
}

// 测试函数
async function runTests() {
  log('🚀 启动 AITY VIP 系统 Playwright MCP 测试', 'info');
  log(`配置: BaseURL=${config.baseUrl}, Headless=${config.headless}`, 'info');

  const browser = await chromium.launch({
    headless: config.headless,
    executablePath: config.chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 测试 1: 首页加载
    await runTest(page, '01-首页加载', async () => {
      await page.goto(config.baseUrl, {
        waitUntil: 'networkidle',
        timeout: config.timeout
      });
      await page.screenshot({
        path: path.join(config.screenshotDir, '01-homepage.png'),
        fullPage: true
      });
    });

    // 测试 2: 登录页面
    await runTest(page, '02-登录页面', async () => {
      await page.goto(`${config.baseUrl}/#/pages/login/login`, {
        waitUntil: 'networkidle',
        timeout: config.timeout
      });
      await page.screenshot({
        path: path.join(config.screenshotDir, '02-login-page.png'),
        fullPage: true
      });
    });

    // 测试 3: 移动端视图
    await runTest(page, '03-移动端视图', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(config.baseUrl, {
        waitUntil: 'networkidle',
        timeout: config.timeout
      });
      await page.screenshot({
        path: path.join(config.screenshotDir, '03-mobile-view.png'),
        fullPage: true
      });
    });

    // 测试 4: API 健康检查
    await runTest(page, '04-API健康检查', async () => {
      const response = await page.request.get(`${config.apiUrl}/api/health`);
      if (!response.ok()) {
        throw new Error(`API 返回状态码: ${response.status()}`);
      }
      const data = await response.json();
      log(`API 响应: ${JSON.stringify(data)}`, 'info');
    });

    // 测试 5: 桌面视图
    await runTest(page, '05-桌面视图', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(config.baseUrl, {
        waitUntil: 'networkidle',
        timeout: config.timeout
      });
      await page.screenshot({
        path: path.join(config.screenshotDir, '05-desktop-view.png'),
        fullPage: true
      });
    });

  } catch (error) {
    log(`测试执行出错: ${error.message}`, 'error');
  } finally {
    await browser.close();
  }

  // 输出测试报告
  printReport();
}

// 运行单个测试
async function runTest(page, testName, testFn) {
  results.total++;
  const startTime = Date.now();

  try {
    log(`开始测试: ${testName}`, 'info');
    await testFn();
    const duration = Date.now() - startTime;

    results.passed++;
    results.tests.push({
      name: testName,
      status: 'passed',
      duration
    });

    log(`测试通过: ${testName} (${duration}ms)`, 'success');

  } catch (error) {
    const duration = Date.now() - startTime;

    results.failed++;
    results.tests.push({
      name: testName,
      status: 'failed',
      duration,
      error: error.message
    });

    log(`测试失败: ${testName} - ${error.message}`, 'error');

    // 失败时截图
    try {
      await page.screenshot({
        path: path.join(config.screenshotDir, `failed-${testName.replace(/\s+/g, '-')}.png`),
        fullPage: true
      });
    } catch (screenshotError) {
      log(`截图失败: ${screenshotError.message}`, 'warning');
    }
  }
}

// 打印测试报告
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  console.log(`总计: ${results.total} 个测试`);
  console.log(`✅ 通过: ${results.passed} 个`);
  console.log(`❌ 失败: ${results.failed} 个`);
  console.log(`成功率: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));

  console.log('\n详细结果:');
  results.tests.forEach((test, index) => {
    const status = test.status === 'passed' ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${test.name} (${test.duration}ms)`);
    if (test.error) {
      console.log(`   错误: ${test.error}`);
    }
  });

  console.log('='.repeat(60));
  console.log(`📁 截图保存在: ${path.resolve(config.screenshotDir)}`);
  console.log('='.repeat(60));

  // 保存 JSON 报告
  const reportPath = path.join(config.screenshotDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 测试报告已保存: ${reportPath}`);
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
