// quick-test.js
const { chromium } = require('playwright');

async function quickTest() {
  console.log('开始快速测试...');
  
  try {
    const browser = await chromium.launch({
      headless: false,
      executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe'
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    
    console.log('✅ 成功访问本地服务器');
    
    const title = await page.title();
    console.log('✅ 页面标题:', title);
    
    await browser.close();
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

quickTest();
