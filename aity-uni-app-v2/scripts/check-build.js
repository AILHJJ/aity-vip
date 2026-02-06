#!/usr/bin/env node

/**
 * 编译校验脚本
 * 用于检查是否存在编译产物，如果不存在则给出提醒
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkBuildExists() {
  const h5BuildPath = path.join(__dirname, '../dist/build/h5/index.html');
  const mpBuildPath = path.join(__dirname, '../dist/build/mp-weixin/app.js');

  const h5Exists = fs.existsSync(h5BuildPath);
  const mpExists = fs.existsSync(mpBuildPath);

  return { h5Exists, mpExists, h5BuildPath, mpBuildPath };
}

function warnAndSuggest() {
  log('\n⚠️  警告：未发现编译产物！', 'yellow');
  log('\n当前检查结果：', 'blue');
  log('  - H5编译产物: ❌ 不存在', 'red');
  log('  - 小程序编译产物: ❌ 不存在', 'red');

  log('\n📝 建议执行以下命令：', 'green');
  log('  npm run build:h5          # 编译H5生产版本', 'blue');
  log('  npm run build:mp-weixin   # 编译小程序生产版本', 'blue');
  log('  npm run build:h5 && npm run build:mp-weixin  # 同时编译', 'blue');

  log('\n💡 或者如果您想直接启动开发服务器（无需编译）：', 'green');
  log('  npm run dev:h5            # 启动H5开发服务器', 'blue');
  log('  npm run dev:mp-weixin     # 启动小程序开发', 'blue');

  log('\n📖 更多信息请参考：', 'green');
  log('  docs/AI编码交互规范与最佳实践.md', 'blue');
  console.log();
}

function main() {
  const args = process.argv.slice(2);
  const checkType = args[0] || 'all'; // 'h5', 'mp', or 'all'

  if (checkType === 'dev:h5') {
    // 开发模式启动，不需要检查编译产物
    log('🚀 启动H5开发服务器...', 'green');
    process.exit(0);
  }

  const { h5Exists, mpExists } = checkBuildExists();

  if (checkType === 'h5') {
    if (!h5Exists) {
      log('\n⚠️  警告：H5编译产物不存在！', 'yellow');
      log('  建议执行: npm run build:h5', 'blue');
      log('  或者直接开发: npm run dev:h5', 'blue');
      console.log();
    }
    process.exit(h5Exists ? 0 : 1);
  }

  if (checkType === 'mp') {
    if (!mpExists) {
      log('\n⚠️  警告：小程序编译产物不存在！', 'yellow');
      log('  建议执行: npm run build:mp-weixin', 'blue');
      console.log();
    }
    process.exit(mpExists ? 0 : 1);
  }

  // 默认检查所有
  if (!h5Exists && !mpExists) {
    warnAndSuggest();
    process.exit(1);
  } else if (!h5Exists) {
    log('\n⚠️  H5编译产物不存在，但小程序编译产物存在', 'yellow');
    log('  建议执行: npm run build:h5', 'blue');
    console.log();
    process.exit(1);
  } else if (!mpExists) {
    log('\n⚠️  小程序编译产物不存在，但H5编译产物存在', 'yellow');
    log('  建议执行: npm run build:mp-weixin', 'blue');
    console.log();
    process.exit(1);
  } else {
    log('\n✅ 所有编译产物检查通过', 'green');
    log('  - H5编译产物: ✅ 存在', 'green');
    log('  - 小程序编译产物: ✅ 存在', 'green');
    console.log();
    process.exit(0);
  }
}

main();
