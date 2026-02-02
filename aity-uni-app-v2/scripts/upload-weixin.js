/**
 * 微信小程序自动上传脚本
 * 使用 miniprogram-ci 工具自动上传小程序代码到微信平台
 */

const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

// 配置信息
const config = {
  appid: 'wxb16a33cdd58f05d3',
  privateKeyPath: path.join(__dirname, '../../private.wxb16a33cdd58f05d3.key'),
  projectPath: path.join(__dirname, '../dist/build/mp-weixin'),
  type: 'miniProgram',
  ignores: ['node_modules/**/*']
};

// 版本信息
const version = process.env.VERSION || '1.0.0';
const desc = process.env.DESC || '首次发布版本';

async function upload() {
  try {
    console.log('========================================');
    console.log('开始上传小程序代码...');
    console.log('========================================');
    console.log(`AppID: ${config.appid}`);
    console.log(`版本号: ${version}`);
    console.log(`版本描述: ${desc}`);
    console.log(`项目路径: ${config.projectPath}`);
    console.log(`密钥路径: ${config.privateKeyPath}`);
    console.log('========================================\n');

    // 检查密钥文件是否存在
    if (!fs.existsSync(config.privateKeyPath)) {
      throw new Error(`密钥文件不存在: ${config.privateKeyPath}`);
    }

    // 检查项目目录是否存在
    if (!fs.existsSync(config.projectPath)) {
      throw new Error(`项目目录不存在: ${config.projectPath}\n请先运行: npm run build:mp-weixin`);
    }

    // 创建项目实例
    const project = new ci.Project({
      appid: config.appid,
      type: config.type,
      projectPath: config.projectPath,
      privateKeyPath: config.privateKeyPath,
      ignores: config.ignores
    });

    console.log('正在上传代码，请稍候...\n');

    // 上传代码
    const uploadResult = await ci.upload({
      project,
      version,
      desc,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        codeProtect: false,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        autoPrefixWXSS: true
      },
      onProgressUpdate: (progress) => {
        console.log(`上传进度: ${progress}%`);
      }
    });

    console.log('\n========================================');
    console.log('✅ 上传成功！');
    console.log('========================================');
    console.log('上传结果:', JSON.stringify(uploadResult, null, 2));
    console.log('\n下一步操作:');
    console.log('1. 登录微信公众平台: https://mp.weixin.qq.com/');
    console.log('2. 进入 开发管理 → 版本管理');
    console.log('3. 在 开发版本 中找到刚上传的版本');
    console.log('4. 点击 提交审核');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ 上传失败！');
    console.error('========================================');
    console.error('错误信息:', error.message);

    if (error.message.includes('密钥文件不存在')) {
      console.error('\n解决方案:');
      console.error('1. 确认密钥文件路径正确');
      console.error('2. 密钥文件应该在项目根目录: D:\\your-mcp-proxy\\AITY_VIP\\private.wxb16a33cdd58f05d3.key');
    } else if (error.message.includes('项目目录不存在')) {
      console.error('\n解决方案:');
      console.error('1. 先构建生产版本: npm run build:mp-weixin');
      console.error('2. 确认构建成功后再运行上传脚本');
    } else if (error.message.includes('appid')) {
      console.error('\n解决方案:');
      console.error('1. 检查 AppID 是否正确');
      console.error('2. 检查密钥文件是否与 AppID 匹配');
    }

    console.error('========================================\n');
    process.exit(1);
  }
}

// 执行上传
upload();
