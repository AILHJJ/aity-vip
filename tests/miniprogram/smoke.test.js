/**
 * 小程序冒烟测试 - 快速验证核心功能
 */

const automator = require('@dcloudio/uni-automator');

describe('冒烟测试', function() {
  this.timeout(30000);

  let miniProgram;

  before(async () => {
    miniProgram = await automator.launch({
      projectPath: './dist/dev/mp-weixin',
      cliPath: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'
    });
  });

  after(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  it('应用启动测试', async () => {
    const page = await miniProgram.reLaunch('/pages/index/index');
    await page.waitFor(1000);

    const currentPage = await miniProgram.currentPage();
    console.log('✅ 应用启动成功，当前页面:', currentPage.path);
  });
});
