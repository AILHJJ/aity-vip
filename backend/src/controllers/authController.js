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
    const { email, username, password } = req.body;
    
    // 确定登录方式
    let userIdentifier;
    let user;
    
    // 调试日志
    console.log('Login request received:', req.body);
    console.log('Email:', email, 'Username:', username);
    
    if (email) {
      userIdentifier = email;
      user = await User.findOne({ where: { email: email } });
      console.log('Looking by email:', email, 'Found user:', user ? user.name : 'not found');
    } else if (username) {
      userIdentifier = username;
      user = await User.findOne({ where: { name: username } });
      console.log('Looking by username:', username, 'Found user:', user ? user.name : 'not found');
    } else {
      console.log('No email or username provided');
      return res.status(400).json(badRequest('Email or username is required'));
    }
    
    if (!user) {
      console.log('User not found for:', userIdentifier);
      return res.status(401).json(unauthorized('Invalid email or password'));
    }
    console.log('Found user:', user);
    
    // 验证密码
    // 暂时添加日志以便调试
    console.log('Password verification:', password, user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json(unauthorized('Invalid email or password'));
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json(forbidden('Account is inactive'));
    }
    
    // 检查用户是否已过期
    if (user.expire_date && new Date(user.expire_date) < new Date()) {
      return res.status(403).json(forbidden('Account has expired'));
    }
    
    // 生成Token
    const token = generateToken(user);
    
    res.json(success({
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
  } catch (err) {
    console.error(err);
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