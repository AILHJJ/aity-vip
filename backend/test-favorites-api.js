// 测试收藏API
const axios = require('axios');

const BASE_URL = 'http://192.168.2.140:3001';

// 测试用户凭证（需要替换为真实的有效token）
let authToken = '';

async function testLogin() {
  try {
    console.log('\n=== 测试登录 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com', // 替换为真实邮箱
      password: '123456' // 替换为真实密码
    });

    if (response.data.code === 200) {
      authToken = response.data.data.token;
      console.log('✓ 登录成功');
      console.log('Token:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('✗ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('✗ 登录错误:', error.response?.data || error.message);
    return false;
  }
}

async function testGetFavoriteMessages() {
  try {
    console.log('\n=== 测试获取收藏消息列表 ===');
    const response = await axios.get(`${BASE_URL}/api/favorites?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ 请求成功');
    console.log('响应码:', response.data.code);
    console.log('消息数:', response.data.data?.list?.length || 0);
    console.log('总数:', response.data.data?.pagination?.total || 0);
    return true;
  } catch (error) {
    console.log('✗ 请求失败:', error.response?.status, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetFavoriteDiscussions() {
  try {
    console.log('\n=== 测试获取收藏讨论列表 ===');
    const response = await axios.get(`${BASE_URL}/api/discussions/favorites?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ 请求成功');
    console.log('响应码:', response.data.code);
    console.log('讨论数:', response.data.data?.list?.length || 0);
    console.log('总数:', response.data.data?.pagination?.total || 0);
    return true;
  } catch (error) {
    console.log('✗ 请求失败:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('验证错误:', error.response.data.errors);
    }
    return false;
  }
}

async function runTests() {
  console.log('========================================');
  console.log('收藏API测试');
  console.log('========================================');

  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n请先修改脚本中的登录凭证，然后重新运行');
    return;
  }

  await testGetFavoriteMessages();
  await testGetFavoriteDiscussions();

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 运行测试
runTests().catch(console.error);
