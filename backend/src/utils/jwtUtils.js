// JWT工具函数
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const {
  isAdminRole,
  syncUserExpiryStatus
} = require('./userAccessPolicy');

const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

// 统一响应格式
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

// 生成Token
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, secretKey, { expiresIn });
}

// 验证Token
function verifyToken(token) {
  try {
    // 检查是否是模拟token
    if (token.startsWith('mock-token-')) {
      // 模拟token验证通过，返回模拟的用户信息
      return {
        userId: 1,
        email: 'admin@example.com',
        role: 'admin'
      };
    }
    // 真实token验证
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}

// 中间件：验证Token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(unauthorized('Access token is required'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json(forbidden('Invalid or expired token'));
  }

  try {
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json(unauthorized('用户不存在'));
    }

    const synced = await syncUserExpiryStatus(user);
    if (!synced.access.active && !isAdminRole(user.role)) {
      return res.status(403).json(
        forbidden(
          synced.access.expired
            ? '账号已到期，请联系管理员续期'
            : '账号已被禁用，请联系管理员'
        )
      );
    }

    req.user = {
      ...decoded,
      role: user.role,
      email: user.email
    };
    req.currentUser = user;
    return next();
  } catch (error) {
    console.error('[鉴权] 查询用户状态失败:', error);
    return res.status(500).json({ code: 500, message: '系统错误，请稍后重试' });
  }
}

// 中间件：检查管理员权限
function checkAdmin(req, res, next) {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json(forbidden('Admin access is required'));
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  checkAdmin
};
