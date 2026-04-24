#!/usr/bin/env node
/**
 * 图灵Token更新工具
 *
 * 使用方法:
 *   node scripts/update-tdx-token.js <新的token>
 *   node scripts/update-tdx-token.js 33e3f141aae0432f9ff91e61b1102252_1_JX_2
 *
 * 或者直接运行，按提示输入:
 *   node scripts/update-tdx-token.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 配置文件路径
const TOKEN_FILE = path.join(__dirname, '..', 'data', 'tdx-token.json');
const CONTROLLER_FILE = path.join(__dirname, '..', 'src', 'controllers', 'aiAdvisorController.js');

// 创建命令行交互
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 保存token到文件
 */
function saveTokenToFile(token) {
  const dataDir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12小时后过期
  const data = {
    token,
    expiresAt,
    lastRefresh: Date.now(),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
  console.log('✅ Token已保存到文件:', TOKEN_FILE);
  return data;
}

/**
 * 更新控制器文件中的备用token
 */
function updateFallbackToken(token) {
  try {
    let content = fs.readFileSync(CONTROLLER_FILE, 'utf8');

    // 查找并更新fallbackTokens数组中的第一个token
    const regex = /const fallbackTokens = \[\s*\/\/ 最新获取的token\s*'([^']+)'/;
    const match = content.match(regex);

    if (match) {
      content = content.replace(
        regex,
        `const fallbackTokens = [
    // 最新获取的token - 更新于 ${new Date().toLocaleDateString('zh-CN')}
    '${token}'`
      );
      fs.writeFileSync(CONTROLLER_FILE, content);
      console.log('✅ 备用Token已更新到控制器文件');
    } else {
      console.log('⚠️  未找到备用token配置位置');
    }
  } catch (error) {
    console.log('⚠️  更新控制器文件失败:', error.message);
  }
}

/**
 * 测试token是否有效
 */
async function testToken(token) {
  const https = require('https');

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'www.tdx.com.cn',
      port: 443,
      path: '/wenda/api/user/info',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'tdx-auth': token
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 200 || json.code === 0) {
            resolve({ valid: true, message: 'Token有效' });
          } else if (json.code === 401) {
            resolve({ valid: false, message: 'Token已过期或无效' });
          } else {
            resolve({ valid: false, message: `未知响应: ${json.msg || json.code}` });
          }
        } catch (e) {
          resolve({ valid: false, message: '响应解析失败' });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ valid: false, message: `请求失败: ${e.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ valid: false, message: '请求超时' });
    });

    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('\n========================================');
  console.log('  图灵AI Token 更新工具');
  console.log('========================================\n');

  // 从命令行参数或用户输入获取token
  let token = process.argv[2];

  if (!token) {
    console.log('请按以下步骤获取Token:');
    console.log('1. 打开浏览器访问 https://pul.tdx.com.cn 登录通达信');
    console.log('2. 登录后访问问小达页面');
    console.log('3. 打开开发者工具 (F12) -> 网络标签');
    console.log('4. 发送一条消息，在请求头中找到 tdx-auth');
    console.log('5. 复制tdx-auth的值\n');

    token = await new Promise((resolve) => {
      rl.question('请输入新的Token: ', (answer) => {
        resolve(answer.trim());
      });
    });
  }

  if (!token) {
    console.log('❌ Token不能为空');
    rl.close();
    process.exit(1);
  }

  console.log('\n正在验证Token...');
  const testResult = await testToken(token);
  console.log(`验证结果: ${testResult.message}\n`);

  if (!testResult.valid) {
    const confirm = await new Promise((resolve) => {
      rl.question('Token验证失败，是否仍要保存? (y/N): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });

    if (!confirm) {
      console.log('已取消');
      rl.close();
      process.exit(1);
    }
  }

  // 保存到文件
  const savedData = saveTokenToFile(token);

  // 更新控制器中的备用token
  updateFallbackToken(token);

  console.log('\n========================================');
  console.log('  Token更新完成!');
  console.log('========================================');
  console.log(`Token: ${token.substring(0, 20)}...`);
  console.log(`过期时间: ${new Date(savedData.expiresAt).toLocaleString('zh-CN')}`);
  console.log('\n请重启后端服务使更改生效:');
  console.log('  pm2 restart aity-backend');
  console.log('  或');
  console.log('  npm run start\n');

  rl.close();
}

main().catch(console.error);
