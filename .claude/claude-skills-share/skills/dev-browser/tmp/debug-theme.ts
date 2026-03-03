import { connect, waitForPageLoad } from "@/client.js";

async function debugPage() {
  const client = await connect();
  const page = await client.page('debug-test', { viewport: { width: 1280, height: 900 } });

  // 直接导航到create-message页面
  await page.goto('http://localhost:5174/#/pages/create-message/create-message');
  await waitForPageLoad(page);
  await page.waitForTimeout(3000);

  // 获取页面HTML结构
  const html = await page.content();
  console.log('页面包含theme-ai-row:', html.includes('theme-ai-row'));
  console.log('页面包含theme-picker:', html.includes('theme-picker'));
  console.log('页面包含AI优化:', html.includes('AI优化'));
  console.log('页面包含主题:', html.includes('主题'));

  // 查找所有包含theme的类
  const themeClasses = await page.evaluate(() => {
    const elements = document.querySelectorAll('[class*="theme"]');
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      class: el.className,
      text: el.textContent?.substring(0, 50)
    }));
  });

  console.log('\n包含theme的元素数量:', themeClasses.length);
  if (themeClasses.length > 0) {
    console.log('元素列表:');
    themeClasses.forEach((el, i) => {
      console.log(`  ${i + 1}. <${el.tag}> class="${el.class}" text="${el.text}"`);
    });
  }

  await page.screenshot({ path: 'tmp/debug-create-message.png', fullPage: true });
  console.log('\n截图已保存: tmp/debug-create-message.png');

  await client.disconnect();
}

debugPage().catch(console.error);
