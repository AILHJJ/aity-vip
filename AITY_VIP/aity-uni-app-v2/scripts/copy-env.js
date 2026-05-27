/**
 * 跨平台环境文件复制脚本
 * 用于在Windows和Unix系统上复制环境配置文件
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('用法: node copy-env.js <env-type>');
  console.error('示例: node copy-env.js local 或 node copy-env.js cloud');
  process.exit(1);
}

const envType = args[0];
const rootDir = path.join(__dirname, '..');

// 根据环境类型确定源文件
let sourceFile;
if (envType === 'local') {
  sourceFile = path.join(rootDir, '.env.development.local');
} else if (envType === 'cloud') {
  sourceFile = path.join(rootDir, '.env.production.cloud');
} else {
  console.error(`错误: 未知的环境类型 "${envType}"`);
  console.error('支持的类型: local, cloud');
  process.exit(1);
}

const targetFile = path.join(rootDir, '.env');

// 检查源文件是否存在
if (!fs.existsSync(sourceFile)) {
  console.error(`错误: 源文件不存在: ${sourceFile}`);
  process.exit(1);
}

// 复制文件
try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ 成功复制环境配置: ${path.basename(sourceFile)} -> .env`);
  console.log(`   API地址: ${envType === 'local' ? 'localhost:3001' : 'aity88.online:8443'}`);
} catch (error) {
  console.error(`错误: 复制文件失败: ${error.message}`);
  process.exit(1);
}
