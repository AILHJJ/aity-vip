/**
 * Dev Browser 测试模板 - 带录屏功能
 * 使用方法: 将此文件复制并修改测试逻辑
 */

import { connect, waitForPageLoad } from "@/client.js";
import * as fs from 'fs';
import * as path from 'path';

// 测试配置
const TEST_NAME = 'test-example'; // 修改为你的测试名称
const VIDEO_DIR = 'D:/your-mcp-proxy/AITY_VIP/test-results/videos';
const SCREENSHOT_DIR = 'D:/your-mcp-proxy/AITY_VIP/test-results/screenshots';

// 确保目录存在
[VIDEO_DIR, SCREENSHOT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * 测试主函数
 */
async function runTest() {
  console.log(`\n========================================`);
  console.log(`测试开始: ${TEST_NAME}`);
  console.log(`时间: ${new Date().toLocaleString()}`);
  console.log(`========================================\n`);

  const client = await connect();
  let testPassed = false;
  let errorMessage = '';

  try {
    // 1. 创建页面 (带录屏配置)
    console.log('📝 步骤 1: 创建浏览器页面...');
    const page = await client.page(TEST_NAME, {
      viewport: { width: 1920, height: 1080 }
    });

    // 2. 打开目标页面
    console.log('🌐 步骤 2: 打开目标页面...');
    const targetUrl = 'http://localhost:5174'; // 修改为你的测试URL
    await page.goto(targetUrl);
    await waitForPageLoad(page);

    // 3. 截图 - 初始状态
    const screenshotPath = path.join(SCREENSHOT_DIR, `${TEST_NAME}-01-initial.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ 初始截图已保存: ${screenshotPath}`);

    // ========================================
    // 在这里添加你的测试逻辑
    // ========================================

    // 示例: 等待某个元素
    // await page.waitForSelector('.my-element');

    // 示例: 填写表单
    // await page.evaluate(() => {
    //   const input = document.querySelector('input[name="username"]') as HTMLInputElement;
    //   if (input) {
    //     input.removeAttribute('readonly');
    //     input.value = 'test-user';
    //     input.dispatchEvent(new Event('input', { bubbles: true }));
    //   }
    // });

    // 示例: 点击按钮
    // await page.click('button[type="submit"]');

    // ========================================
    // 测试逻辑结束
    // ========================================

    // 4. 截图 - 最终状态
    const finalScreenshotPath = path.join(SCREENSHOT_DIR, `${TEST_NAME}-02-final.png`);
    await page.screenshot({ path: finalScreenshotPath, fullPage: true });
    console.log(`✅ 最终截图已保存: ${finalScreenshotPath}`);

    // 5. 等待一段时间,确保录屏完整
    console.log('⏱️  等待 2 秒以保存录屏...');
    await page.waitForTimeout(2000);

    testPassed = true;
    console.log('\n✅ 测试通过!');

  } catch (error: any) {
    errorMessage = error.message;
    console.error('\n❌ 测试失败:', errorMessage);

    // 失败时也截图
    try {
      const page = await client.page(TEST_NAME);
      const errorScreenshotPath = path.join(SCREENSHOT_DIR, `${TEST_NAME}-error.png`);
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 错误截图已保存: ${errorScreenshotPath}`);
    } catch (e) {
      console.error('无法保存错误截图');
    }

  } finally {
    // 6. 断开连接 (这会保存录屏)
    console.log('\n📝 保存录屏并关闭连接...');
    await client.disconnect();

    // 7. 显示测试结果
    console.log(`\n========================================`);
    console.log(`测试结果: ${testPassed ? '✅ 通过' : '❌ 失败'}`);
    if (!testPassed) {
      console.log(`错误信息: ${errorMessage}`);
    }
    console.log(`录屏位置: ${VIDEO_DIR}`);
    console.log(`截图位置: ${SCREENSHOT_DIR}`);
    console.log(`========================================\n`);

    // 8. 生成测试报告
    generateTestReport({
      testName: TEST_NAME,
      passed: testPassed,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      videoDir: VIDEO_DIR,
      screenshotDir: SCREENSHOT_DIR
    });
  }
}

/**
 * 生成测试报告
 */
function generateTestReport(report: any) {
  const reportPath = path.join(
    'D:/your-mcp-proxy/AITY_VIP/test-results',
    `${TEST_NAME}-report.md`
  );

  const content = `# 测试报告 - ${report.testName}

## 基本信息

- **测试名称**: ${report.testName}
- **执行时间**: ${report.timestamp}
- **测试结果**: ${report.passed ? '✅ 通过' : '❌ 失败'}
${report.error ? `- **错误信息**: ${report.error}` : ''}

## 测试资源

### 📹 录屏文件
位置: \`${report.videoDir}\`

### 📸 截图文件
位置: \`${report.screenshotDir}\`

## 测试步骤

1. 创建浏览器页面
2. 打开目标页面
3. 执行测试逻辑
4. 保存截图
5. 保存录屏

## 后续操作

${report.passed ? `
- [ ] 查看录屏验证测试流程
- [ ] 检查截图是否符合预期
- [ ] 归档测试结果
` : `
- [ ] 查看错误截图定位问题
- [ ] 查看录屏分析失败原因
- [ ] 修复问题后重新测试
`}

---
*报告生成时间: ${new Date().toLocaleString()}*
`;

  fs.writeFileSync(reportPath, content, 'utf-8');
  console.log(`📊 测试报告已生成: ${reportPath}`);
}

// 执行测试
runTest().catch(console.error);
