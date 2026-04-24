const ci = require('miniprogram-ci');
const path = require('path');

const project = new ci.Project({
  appid: 'wxb16a33cdd58f05d3',
  type: 'miniProgram',
  projectPath: path.join(__dirname, 'dist/build/mp-weixin'),
  privateKeyPath: path.join(__dirname, 'private.wxb16a33cdd58f05d3.key'),
  ignores: ['node_modules/**/*']
});

const version = process.env.VERSION || '1.7.0';
const desc = process.env.DESC || '策略推送合并，消息类型精简为5个，已读标识和时间分开显示';

ci.upload({
  project,
  version: version,
  desc: desc,
  setting: { es6: true, es7: true, minify: true, codeProtect: false, minifyJS: true, minifyWXML: true, minifyWXSS: true, autoPrefixWXSS: true }
}).then(r => {
  console.log('上传成功:', JSON.stringify(r, null, 2));
}).catch(e => {
  console.error('上传失败:', e.message);
  if (e.message && e.message.includes('ENONET')) {
    console.error('错误: 找不到私钥文件。请确保私钥文件存在于:', path.join(__dirname, 'private.wxb16a33cdd58f05d3.key'));
  }
});
