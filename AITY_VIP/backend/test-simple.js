const axios = require('axios');

async function test() {
  try {
    // 登录
    console.log('1. 登录中...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    const token = loginResponse.data.data.token;
    console.log(`✅ Token: ${token.substring(0, 30)}...`);

    // 创建讨论
    console.log('\n2. 创建讨论...');
    console.log('发送数据:', {
      messageId: 93,
      title: 'test discussion',
      content: 'test content',
      visibility: 'private'
    });

    const createResponse = await axios.post(
      'http://localhost:3001/api/discussions',
      {
        messageId: 93,
        title: 'test discussion',
        content: 'test content',
        visibility: 'private'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log(`✅ 成功!`);
    console.log('状态码:', createResponse.status);
    console.log('响应数据:', JSON.stringify(createResponse.data, null, 2));
  } catch (error) {
    console.error('\n❌ 错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求超时:', error.message);
    } else {
      console.error('错误:', error.message);
    }
  }
}

test();
