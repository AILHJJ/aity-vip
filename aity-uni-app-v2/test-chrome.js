const { chromium } = require('playwright');

async function testChrome() {
  console.log('测试系统Chrome浏览器...');
  
  try {
    // 直接指定系统Chrome的路径
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('浏览器启动成功');
    
    // 测试访问百度
    await page.goto('https://www.baidu.com');
    console.log('访问百度成功');
    
    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 截图
    await page.screenshot({ path: 'test-chrome.png' });
    console.log('截图成功');
    
    // 关闭浏览器
    await browser.close();
    console.log('测试完成');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testChrome();
