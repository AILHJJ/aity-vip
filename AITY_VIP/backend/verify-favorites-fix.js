// 快速验证收藏功能修复
const axios = require('axios');

const BASE_URL = 'http://192.168.2.140:3001';
let authToken = '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkApiHealth() {
  try {
    log(colors.blue, '\n=== 1. 检查API健康状态 ===');
    const response = await axios.get(`${BASE_URL}/api/health`);
    log(colors.green, '✓ API服务运行正常');
    return true;
  } catch (error) {
    log(colors.red, '✗ API服务未运行');
    return false;
  }
}

async function testLogin() {
  try {
    log(colors.blue, '\n=== 2. 测试登录 ===');

    // 尝试使用测试账号
    const testAccounts = [
      { email: 'test@example.com', password: '123456' },
      { email: 'admin@example.com', password: '123456' }
    ];

    for (const account of testAccounts) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, account);
        if (response.data.code === 200) {
          authToken = response.data.data.token;
          log(colors.green, `✓ 登录成功: ${account.email}`);
          return true;
        }
      } catch (e) {
        // 继续尝试下一个账号
      }
    }

    log(colors.yellow, '⚠ 需要手动登录测试');
    log(colors.yellow, '请修改脚本中的登录凭证或使用前端界面登录');
    return false;
  } catch (error) {
    log(colors.red, '✗ 登录失败');
    return false;
  }
}

async function testFavoriteMessagesEndpoint() {
  try {
    log(colors.blue, '\n=== 3. 测试消息收藏列表端点 ===');
    log(colors.yellow, '请求: GET /api/favorites?page=1&limit=20');

    const response = await axios.get(`${BASE_URL}/api/favorites?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const list = response.data.data?.list || [];
      const pagination = response.data.data?.pagination || {};

      log(colors.green, '✓ 请求成功');
      log(colors.green, `  - 响应码: ${response.data.code}`);
      log(colors.green, `  - 消息数量: ${list.length}`);
      log(colors.green, `  - 总数: ${pagination.total || 0}`);
      log(colors.green, `  - 页码: ${pagination.page || 1}/${pagination.pages || 1}`);

      return true;
    } else {
      log(colors.red, `✗ 响应错误: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 500) {
      log(colors.red, '✗ 500错误 - 服务器内部错误');
      log(colors.red, `  错误信息: ${message}`);
    } else if (status === 401) {
      log(colors.yellow, '⚠ 401错误 - 未授权（可能token过期）');
    } else {
      log(colors.red, `✗ ${status}错误 - ${message}`);
    }
    return false;
  }
}

async function testFavoriteDiscussionsEndpoint() {
  try {
    log(colors.blue, '\n=== 4. 测试讨论收藏列表端点 ===');
    log(colors.yellow, '请求: GET /api/discussions/favorites?page=1&limit=20');

    const response = await axios.get(`${BASE_URL}/api/discussions/favorites?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const list = response.data.data?.list || [];
      const pagination = response.data.data?.pagination || {};

      log(colors.green, '✓ 请求成功');
      log(colors.green, `  - 响应码: ${response.data.code}`);
      log(colors.green, `  - 讨论数量: ${list.length}`);
      log(colors.green, `  - 总数: ${pagination.total || 0}`);
      log(colors.green, `  - 页码: ${pagination.page || 1}/${pagination.pages || 1}`);

      return true;
    } else {
      log(colors.red, `✗ 响应错误: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const errors = error.response?.data?.errors;

    if (status === 400) {
      log(colors.red, '✗ 400错误 - 验证失败');
      log(colors.red, `  错误信息: ${message}`);
      if (errors) {
        log(colors.red, '  验证错误详情:');
        errors.forEach(err => {
          log(colors.red, `    - ${err.param}: ${err.msg}`);
        });
      }
    } else if (status === 401) {
      log(colors.yellow, '⚠ 401错误 - 未授权（可能token过期）');
    } else if (status === 404) {
      log(colors.red, '✗ 404错误 - 端点不存在');
      log(colors.red, '  这意味着 /api/discussions/favorites 路由未正确配置');
    } else {
      log(colors.red, `✗ ${status}错误 - ${message}`);
    }
    return false;
  }
}

async function checkDatabaseTables() {
  log(colors.blue, '\n=== 5. 数据库表检查建议 ===');
  log(colors.yellow, '请在数据库中执行以下验证：');
  console.log(`
-- 验证 discussion_favorites 表是否存在
SHOW TABLES LIKE 'discussion_favorites';

-- 查看 discussion_favorites 表结构
DESCRIBE discussion_favorites;

-- 查看 user_favorites 表结构
DESCRIBE user_favorites;
  `);
}

async function printSummary() {
  log(colors.blue, '\n========================================');
  log(colors.blue, '修复验证总结');
  log(colors.blue, '========================================');

  log(colors.yellow, '\n修复内容：');
  log(colors.green, '1. ✓ 修复了 GET /api/favorites 的500错误');
  log(colors.green, '   - 添加了 required: false 使用LEFT JOIN');
  log(colors.green, '   - 允许关联的消息为null（已删除的消息）');

  log(colors.green, '2. ✓ 创建了讨论收藏功能');
  log(colors.green, '   - 创建了 DiscussionFavorite 模型');
  log(colors.green, '   - 创建了 discussion_favorites 数据库表');
  log(colors.green, '   - 添加了 GET /api/discussions/favorites 端点');
  log(colors.green, '   - 添加了 POST /api/discussions/:id/favorite 端点');
  log(colors.green, '   - 添加了 DELETE /api/discussions/:id/favorite 端点');

  log(colors.yellow, '\n下一步：');
  log(colors.blue, '1. 在前端界面测试收藏页面功能');
  log(colors.blue, '2. 验证消息收藏和讨论收藏都能正常加载');
  log(colors.blue, '3. 测试收藏/取消收藏功能');
  log(colors.blue, '4. 验证分页和下拉刷新');

  log(colors.yellow, '\n文档位置：');
  console.log('   - 修复总结: D:\\your-mcp-proxy\\AITY_VIP\\docs\\fix-favorites-page-summary.md');
  console.log('   - 测试指南: D:\\your-mcp-proxy\\AITY_VIP\\docs\\test-favorites-guide.md');

  log(colors.blue, '\n========================================\n');
}

async function runVerification() {
  console.log('\n========================================');
  log(colors.cyan, '收藏功能修复验证');
  log(colors.cyan, '========================================');

  const healthOk = await checkApiHealth();
  if (!healthOk) {
    log(colors.red, '\n请先启动后端服务：');
    console.log('  cd D:\\your-mcp-proxy\\AITY_VIP\\backend');
    console.log('  npm start');
    return;
  }

  const loginOk = await testLogin();

  if (loginOk) {
    await testFavoriteMessagesEndpoint();
    await testFavoriteDiscussionsEndpoint();
  } else {
    log(colors.yellow, '\n由于未登录，跳过API测试');
    log(colors.yellow, '建议：');
    log(colors.blue, '1. 修改脚本中的登录凭证');
    log(colors.blue, '2. 或使用前端界面进行手动测试');
  }

  await checkDatabaseTables();
  await printSummary();
}

// 运行验证
runVerification().catch(console.error);
