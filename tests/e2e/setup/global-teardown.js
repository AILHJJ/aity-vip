/**
 * Playwright全局清理
 *
 * 在所有测试运行后执行
 */

async function globalTeardown(config) {
  console.log('🧹 开始E2E测试环境清理...');

  // 可以在这里执行一些全局清理任务，例如：
  // 1. 关闭测试服务器
  // 2. 清理测试数据
  // 3. 生成测试报告摘要

  // 示例：清理测试数据
  // await cleanupTestData();

  // 示例：关闭后端服务器
  // await stopTestBackend();

  // 示例：生成测试摘要报告
  // await generateTestSummary();

  console.log('✅ E2E测试环境清理完成');
  console.log('📊 测试报告: tests/e2e/reports/html/index.html');
}

module.exports = globalTeardown;
