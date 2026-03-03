import { connect, waitForPageLoad } from "@/client.js";

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>) {
  const startTime = Date.now();
  try {
    await testFn();
    results.push({
      name,
      status: 'passed',
      message: '测试通过',
      duration: Date.now() - startTime
    });
    console.log(`✅ ${name} - 通过 (${Date.now() - startTime}ms)`);
  } catch (error) {
    results.push({
      name,
      status: 'failed',
      message: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime
    });
    console.log(`❌ ${name} - 失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const client = await connect();
const page = await client.page("aity-comprehensive", { viewport: { width: 1920, height: 1080 } });

console.log("========================================");
console.log("   AITY VIP 系统 - Dev Browser 测试报告");
console.log("========================================\n");

// 测试1: 首页加载
await runTest("首页加载测试", async () => {
  await page.goto("http://localhost:5173");
  await waitForPageLoad(page);
  await page.waitForTimeout(2000);
  const title = await page.title();
  if (!title) throw new Error("页面标题为空");
  await page.screenshot({ path: "tmp/test-01-homepage.png" });
});

// 测试2: 页面结构验证
await runTest("登录页面结构验证", async () => {
  const snapshot = await client.getAISnapshot("aity-comprehensive");
  if (!snapshot.includes("投研图灵室")) throw new Error("未找到应用标题");
  if (!snapshot.includes("用户名")) throw new Error("未找到用户名输入框");
  if (!snapshot.includes("密码")) throw new Error("未找到密码输入框");
  if (!snapshot.includes("登录")) throw new Error("未找到登录按钮");
});

// 测试3: 表单交互测试
await runTest("登录表单填写测试", async () => {
  const snapshot = await client.getAISnapshot("aity-comprehensive");

  // 查找用户名输入框
  const usernameMatch = snapshot.match(/textbox \[ref=(e\d+)\]/);
  if (!usernameMatch) throw new Error("未找到用户名输入框");
  const usernameInput = await client.selectSnapshotRef("aity-comprehensive", usernameMatch[1]);
  await usernameInput.fill("test@example.com");

  // 查找密码输入框
  const passwordMatch = snapshot.match(/textbox \[ref=(e\d+)\][\s\S]*?textbox \[ref=(e\d+)\]/);
  if (!passwordMatch) throw new Error("未找到密码输入框");
  const passwordInput = await client.selectSnapshotRef("aity-comprehensive", passwordMatch[2]);
  await passwordInput.fill("testpassword");

  await page.screenshot({ path: "tmp/test-02-form-filled.png" });
});

// 测试4: API 连接测试
await runTest("后端API连接测试", async () => {
  const response = await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/health');
      return { status: res.status, ok: res.ok };
    } catch (e) {
      return { error: String(e) };
    }
  });
  if (!response.ok) throw new Error(`API健康检查失败: ${JSON.stringify(response)}`);
});

// 测试5: 响应式设计测试
await runTest("移动端视图测试", async () => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/test-03-mobile-view.png" });
  await page.setViewportSize({ width: 1920, height: 1080 });
});

// 测试6: 页面性能测试
await runTest("页面加载性能测试", async () => {
  const startTime = Date.now();
  await page.reload();
  await waitForPageLoad(page);
  const loadTime = Date.now() - startTime;
  if (loadTime > 10000) throw new Error(`页面加载时间过长: ${loadTime}ms`);
});

// 生成测试报告
console.log("\n========================================");
console.log("   测试结果汇总");
console.log("========================================\n");

const passed = results.filter(r => r.status === 'passed').length;
const failed = results.filter(r => r.status === 'failed').length;
const skipped = results.filter(r => r.status === 'skipped').length;

console.log(`总计: ${results.length} 个测试`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`⏭️  跳过: ${skipped}`);
console.log(`\n通过率: ${((passed / results.length) * 100).toFixed(1)}%`);

console.log("\n----------------------------------------");
console.log("   详细测试结果");
console.log("----------------------------------------\n");

results.forEach((result, index) => {
  const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
  console.log(`${icon} [${index + 1}] ${result.name}`);
  console.log(`   状态: ${result.status}`);
  console.log(`   耗时: ${result.duration}ms`);
  if (result.message) {
    console.log(`   信息: ${result.message}`);
  }
  console.log("");
});

// 保存截图列表
console.log("\n----------------------------------------");
console.log("   生成的截图文件");
console.log("----------------------------------------\n");
console.log("📄 tmp/test-01-homepage.png - 首页截图");
console.log("📄 tmp/test-02-form-filled.png - 表单填写截图");
console.log("📄 tmp/test-03-mobile-view.png - 移动端视图截图");

await client.disconnect();

// 输出JSON格式报告
console.log("\n========================================");
console.log("   JSON 测试报告");
console.log("========================================\n");
console.log(JSON.stringify({
  summary: {
    total: results.length,
    passed,
    failed,
    skipped,
    passRate: ((passed / results.length) * 100).toFixed(1) + '%'
  },
  results,
  timestamp: new Date().toISOString(),
  browser: 'Chrome (Custom)',
  viewport: { width: 1920, height: 1080 }
}, null, 2));
