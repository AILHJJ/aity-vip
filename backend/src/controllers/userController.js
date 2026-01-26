// 用户管理控制器
const bcrypt = require('bcryptjs');

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

// 获取所有用户
async function getAllUsers(req, res) {
  try {
    const users = await User.findAll();
    res.json(success(users));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 根据ID获取用户
async function getUserById(req, res) {
  try {
    const user = await User.findByPk(parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    res.json(success(user));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 创建用户
async function createUser(req, res) {
  try {
    const { name, email, password, role, groupId, avatar, status, expireDate } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(badRequest('Email already in use'));
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      group_id: groupId,
      avatar,
      status: status || 'active',
      expire_date: expireDate
    });
    
    res.status(201).json(success(user, 'User created successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 更新用户
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, role, groupId, avatar, status, expireDate } = req.body;
    
    // 查找用户
    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 准备更新数据
    const updateData = {
      name,
      email,
      role,
      group_id: groupId,
      avatar,
      status,
      expire_date: expireDate
    };
    
    // 如果更新了密码，需要重新加密
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // 更新用户信息
    await user.update(updateData);
    
    res.json(success(user, 'User updated successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 删除用户
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // 查找用户
    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 删除用户
    await user.destroy();
    
    res.json(success(null, 'User deleted successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};