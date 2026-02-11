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

    // 如果未提供邮箱，生成默认邮箱
    const userEmail = email || `${name}@localhost`;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email: userEmail } });
    if (existingUser) {
      return res.status(400).json(badRequest('Email already in use'));
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      name,
      email: userEmail,
      password: hashedPassword,
      role: role || 'trial',
      group_id: groupId,
      avatar,
      status: status || 'active',
      expire_date: expireDate
    });

    res.status(201).json(success(user, 'User created successfully'));
  } catch (err) {
    console.error('创建用户失败:', err);
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

// 重置用户密码
async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword, adminPassword } = req.body;
    const adminUser = req.user;

    // 查找目标用户
    const targetUser = await User.findByPk(parseInt(id));
    if (!targetUser) {
      return res.status(404).json(notFound('User not found'));
    }

    // 验证管理员密码（可选，增加安全性）
    if (adminPassword) {
      // 获取管理员用户信息来验证密码
      const admin = await User.findByPk(adminUser.userId);
      if (!admin) {
        return res.status(403).json(forbidden('Admin user not found'));
      }

      // 验证管理员密码
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
      if (!isPasswordValid) {
        return res.status(403).json(forbidden('Invalid admin password'));
      }
    }

    // 加密新密码
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await targetUser.update({ password: hashedPassword });

    // 记录操作日志
    console.log(`[Password Reset] Admin ${adminUser.email} reset password for user ${targetUser.email} (ID: ${targetUser.id})`);

    res.json(success(null, 'Password reset successfully'));
  } catch (err) {
    console.error('[Password Reset Error]', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
};