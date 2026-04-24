/**
 * API测试脚本
 */
const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function test() {
  console.log('🔍 API测试工具\n');
  console.log('='.repeat(50));
  
  // 1. 健康检查
  console.log('\n1️⃣ 健康检查...');
  const health = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  });
  console.log('   状态:', health.status);
  console.log('   响应:', JSON.stringify(health.data));
  
  // 2. 登录获取token
  console.log('\n2️⃣ 管理员登录...');
  const loginData = JSON.stringify({ username: 'admin', password: '123456' });
  const login = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, loginData);
  console.log('   状态:', login.status);
  
  if (login.data.success || login.data.code === 200) {
    const token = login.data.data?.token;
    console.log('   ✅ 登录成功, Token:', token?.substring(0, 30) + '...');
    
    // 3. 获取消息类型
    console.log('\n3️⃣ 获取消息类型列表...');
    const types = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/message-types',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('   状态:', types.status);
    if (types.data.success || types.data.code === 200) {
      console.log('   ✅ 消息类型:');
      types.data.data?.forEach(t => {
        console.log(`      ${t.icon || '•'} ${t.label} [${t.type}]`);
      });
    } else {
      console.log('   响应:', JSON.stringify(types.data));
    }
    
    // 4. 获取消息列表
    console.log('\n4️⃣ 获取消息列表...');
    const messages = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/messages?page=1&limit=3',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('   状态:', messages.status);
    if (messages.data.success || messages.data.code === 200) {
      console.log('   ✅ 消息数量:', messages.data.data?.length || 0);
    }
    
  } else {
    console.log('   ❌ 登录失败:', JSON.stringify(login.data));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('测试完成\n');
}

test().catch(console.error);
