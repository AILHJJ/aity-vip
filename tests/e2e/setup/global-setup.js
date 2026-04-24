/**
 * Playwright全局设置
 *
 * 在所有测试运行前执行
 */

async function globalSetup(config) {
  console.log('🚀 开始E2E测试环境设置...');
  console.log(`📋 测试项目: ${config.projects.map(p => p.name).join(', ')}`);
  console.log(`🌐 基础URL: ${process.env.BASE_URL || 'http://localhost:5173'}`);

  // 可以在这里执行一些全局设置任务，例如：
  // 1. 启动后端测试服务器
  // 2. 准备测试数据
  // 3. 清理旧的测试报告

  // 示例：确保测试数据库存在
  // await ensureTestDatabase();

  // 示例：启动后端服务器
  // await startTestBackend();

  console.log('✅ E2E测试环境设置完成');
}

module.exports = globalSetup;
