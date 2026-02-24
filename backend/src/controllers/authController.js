// 认证控制器
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');

// 导入用户模型
const User = require('../models/User');

// 统一响应格式
function success(data, message = 'Success') {
  return {
    code: 200,
    message,
    data
  };
}

function error(message, code = 500) {
  return {
    code,
    message
  };
}

function unauthorized(message = 'Unauthorized') {
  return {
    code: 401,
    message
  };
}

function forbidden(message = 'Forbidden') {
  return {
    code: 403,
    message
  };
}

function notFound(message = 'Not found') {
  return {
    code: 404,
    message
  };
}

function badRequest(message = 'Bad request') {
  return {
    code: 400,
    message
  };
}

function serverError(message = 'Internal server error') {
  return {
    code: 500,
    message
  };
}

// 用户登录
async function login(req, res) {
  try {
    console.log('=== 登录请求开始 ===');
    const startTime = Date.now();

    const { email, username, password } = req.body;

    // 调试日志
    console.log('Login request received:', { username, email, hasPassword: !!password });

    // 验证必填字段
    if (!password) {
      return res.status(400).json(badRequest('请输入密码'));
    }
    if (!email && !username) {
      return res.status(400).json(badRequest('请输入用户名或邮箱'));
    }

    try {
      // 尝试从数据库查找用户
      let user;
      if (email) {
        user = await User.findOne({ where: { email } });
        console.log(`[登录] 通过邮箱查找用户: ${email}, 结果: ${user ? '找到' : '未找到'}`);
      } else if (username) {
        user = await User.findOne({ where: { name: username } });
        console.log(`[登录] 通过用户名查找用户: ${username}, 结果: ${user ? '找到' : '未找到'}`);
      }

      // 如果用户不存在
      if (!user) {
        console.log(`[登录失败] 用户不存在: ${email || username}`);
        return res.status(401).json(unauthorized('用户名或密码错误'));
      }

      // 验证密码
      console.log(`[登录] 验证密码, 用户: ${user.name}, ID: ${user.id}`);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`[登录] 密码验证结果: ${isPasswordValid ? '成功' : '失败'}`);

      if (!isPasswordValid) {
        console.log(`[登录失败] 密码错误, 用户: ${user.name}`);
        return res.status(401).json(unauthorized('用户名或密码错误'));
      }

      // 检查用户状态
      if (user.status !== 'active') {
        console.log(`[登录失败] 账号未激活, 用户: ${user.name}, 状态: ${user.status}`);
        return res.status(403).json(forbidden('账号已被禁用，请联系管理员'));
      }

      // 生成真实的JWT Token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      console.log('Token生成完成，耗时:', Date.now() - startTime, 'ms');

      console.log(`[登录成功] 用户: ${user.name}, 角色: ${user.role}, 总耗时: ${Date.now() - startTime}ms`);

      return res.json(success({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          groupId: user.group_id,
          avatar: user.avatar,
          status: user.status
        }
      }, '登录成功'));

    } catch (dbError) {
      // 数据库连接失败
      console.error('数据库查询失败:', dbError.message);
      console.error(dbError.stack);

      // 生产环境不使用模拟数据
      return res.status(500).json(error('系统错误，请稍后重试'));
    }
  } catch (err) {
    console.error('登录请求错误:', err);
    res.status(500).json(error('系统错误，请稍后重试'));
  }
}

// 用户注册功能已移除，由管理员统一管理

// 获取当前用户信息
async function getCurrentUser(req, res) {
  try {
    // 在数据库中查找用户
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    res.json(success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      groupId: user.group_id,
      avatar: user.avatar,
      status: user.status
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取所有用户（管理员用）
async function getUsers(req, res) {
  try {
    const users = await User.findAll();
    res.json(success(users));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 更新用户状态
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 在数据库中查找用户
    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }

    // 更新用户状态
    await user.update({ status });

    res.json(success(user));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 用户登出
async function logout(req, res) {
  try {
    // JWT是无状态的，登出只需客户端删除token即可
    // 这里返回成功响应，客户端会清除本地存储的token
    res.json(success(null, 'Logout successful'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  login,
  logout,
  getCurrentUser,
  getUsers,
  updateUser
};