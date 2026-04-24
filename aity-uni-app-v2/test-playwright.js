const { chromium } = require('playwright');

async function testPlaywright() {
  console.log('开始测试Playwright...');
  
  try {
    // 启动系统Chrome浏览器
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('浏览器启动成功');
    
    // 创建新页面
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('页面创建成功');
    
    // 访问本地开发服务器
    await page.goto('http://localhost:5173');
    console.log('访问本地服务器成功');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 截图
    await page.screenshot({ path: 'playwright-test.png', fullPage: true });
    console.log('截图成功');
    
    // 关闭浏览器
    await browser.close();
    console.log('测试完成，浏览器已关闭');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testPlaywright();
