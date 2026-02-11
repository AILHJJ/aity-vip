const http = require('http');

// 测试登录
function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      username: 'admin',
      password: '123456'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.data.token);
        } catch(e) {
          reject(new Error(`Login failed: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 测试创建讨论
function createDiscussion(token) {
  return new Promise((resolve, reject) => {
    // 使用英文避免编码问题
    const data = JSON.stringify({
      messageId: 93,
      title: 'test discussion',
      content: 'test content',
      visibility: 'private'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/discussions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data) // 修复：使用Buffer.byteLength
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应: ${body}`);
        if (res.statusCode !== 201) {
          reject(new Error(`Failed with status ${res.statusCode}: ${body}`));
        } else {
          resolve();
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function test() {
  try {
    console.log('1. 登录中...');
    const token = await login();
    console.log(`✅ Token: ${token.substring(0, 30)}...`);

    console.log('\n2. 创建讨论...');
    await createDiscussion(token);
    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  }
}

test();
