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

// 用户登录
async function login(req, res) {
  try {
    console.log('=== 登录请求开始 ===');
    const startTime = Date.now();

    const { email, username, password } = req.body;

    // 调试日志
    console.log('Login request received:', req.body);
    console.log('Email:', email, 'Username:', username, 'Password:', password);

    // 验证必填字段
    if (!password || (!email && !username)) {
      return res.status(400).json(badRequest('Email/Username and password are required'));
    }

    try {
      // 尝试从数据库查找用户
      let user;
      if (email) {
        user = await User.findOne({ where: { email } });
      } else if (username) {
        user = await User.findOne({ where: { name: username } });
      }

      // 如果找到用户，验证密码
      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json(unauthorized('Invalid credentials'));
        }

        // 检查用户状态
        if (user.status !== 'active') {
          return res.status(403).json(forbidden('Account is not active'));
        }

        // 生成真实的JWT Token
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        console.log('Token生成完成，耗时:', Date.now() - startTime, 'ms');

        console.log('登录请求处理完成，总耗时:', Date.now() - startTime, 'ms');

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
        }, 'Login successful'));
      }

      // 用户不存在，返回错误
      return res.status(401).json(unauthorized('Invalid credentials'));

    } catch (dbError) {
      // 数据库连接失败，使用模拟数据（仅用于开发环境）
      console.warn('Database query failed:', dbError.message);

      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for login');

        // 模拟用户数据
        const mockUser = {
          id: 1,
          name: username || email || 'admin',
          email: email || 'admin@example.com',
          role: 'admin',
          group_id: 'all',
          avatar: '',
          status: 'active'
        };

        // 生成模拟Token
        const token = 'mock-token-' + Date.now();
        console.log('Token生成完成，耗时:', Date.now() - startTime, 'ms');

        console.log('登录请求处理完成，总耗时:', Date.now() - startTime, 'ms');

        return res.json(success({
          token,
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            groupId: mockUser.group_id,
            avatar: mockUser.avatar,
            status: mockUser.status
          }
        }, 'Login successful'));
      }

      // 测试环境或生产环境下，数据库错误应该返回服务器错误
      return res.status(500).json(serverError('Database connection failed'));
    }
    return res.status(401).json(unauthorized('Invalid credentials'));
  } catch (err) {
    console.error('登录请求错误:', err);
    res.status(500).json(error('Server error'));
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

module.exports = {
  login,
  getCurrentUser,
  getUsers,
  updateUser
};