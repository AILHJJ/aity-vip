// 用户管理控制器
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

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

// 获取所有用户
async function getAllUsers(req, res) {
  try {
    let { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const whereClause = {};

    // 支持数组形式的 role 参数
    if (role) {
      // 如果是字符串形式的数组（如 "[vip_mid,vip_short]"），需要解析
      if (typeof role === 'string' && role.startsWith('[')) {
        try {
          role = JSON.parse(role);
        } catch (e) {
          // 解析失败，保持原值
        }
      }
      // 如果是逗号分隔的字符串（如 "vip_mid,vip_short"），拆分为数组
      if (typeof role === 'string' && role.includes(',')) {
        role = role.split(',').map(r => r.trim());
      }
      // 如果是数组，使用 Op.in
      if (Array.isArray(role)) {
        whereClause.role = { [Op.in]: role };
      } else {
        whereClause.role = role;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    return res.json(success({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }));
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json(serverError('获取用户列表失败'));
  }
}

// 获取单个用户
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json(notFound('用户不存在'));
    }

    return res.json(success(user));
  } catch (err) {
    console.error('Get user by id error:', err);
    return res.status(500).json(serverError('获取用户信息失败'));
  }
}

// 创建用户
async function createUser(req, res) {
  try {
    const { name, email, password, role, groupId, status, expireDate } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { name } });
    if (existingUser) {
      return res.status(400).json(badRequest('用户名已存在'));
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json(badRequest('邮箱已被使用'));
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email || null,
      password: hashedPassword,
      role: role || 'trial',
      groupId: groupId || null,
      status: status || 'active',
      expireDate: expireDate || null
    });

    // 返回用户信息（不包含密码）
    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(201).json(success(userResponse, '用户创建成功'));
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json(serverError('创建用户失败'));
  }
}

// 更新用户
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, groupId, status, expireDate } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(notFound('用户不存在'));
    }

    // 检查用户名是否被其他用户使用
    if (name && name !== user.name) {
      const existingUser = await User.findOne({ where: { name } });
      if (existingUser) {
        return res.status(400).json(badRequest('用户名已存在'));
      }
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json(badRequest('邮箱已被使用'));
      }
    }

    await user.update({
      name: name || user.name,
      email: email !== undefined ? email : user.email,
      role: role || user.role,
      groupId: groupId !== undefined ? groupId : user.groupId,
      status: status || user.status,
      expireDate: expireDate !== undefined ? expireDate : user.expireDate
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.json(success(userResponse, '用户更新成功'));
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json(serverError('更新用户失败'));
  }
}

// 删除用户
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(notFound('用户不存在'));
    }

    await user.destroy();

    return res.json(success(null, '用户删除成功'));
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json(serverError('删除用户失败'));
  }
}

// 重置用户密码
async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(notFound('用户不存在'));
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return res.json(success(null, '密码重置成功'));
  } catch (err) {
    console.error('Reset user password error:', err);
    return res.status(500).json(serverError('重置密码失败'));
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
