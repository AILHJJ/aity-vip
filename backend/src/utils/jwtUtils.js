// JWT工具函数
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}

// 中间件：验证Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(unauthorized('Access token is required'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json(forbidden('Invalid or expired token'));
  }

  req.user = decoded;
  next();
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