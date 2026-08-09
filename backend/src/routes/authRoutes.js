/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-27 09:14:29
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-27 16:26:02
 * @FilePath: \your-mcp-proxy\AITY_VIP\backend\src\routes\authRoutes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 认证路由
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../utils/jwtUtils');

// 登录
router.post('/login',
  authController.login
);

// 登出
router.post('/logout',
  authController.logout
);

// 获取当前用户信息
router.get('/me',
  authenticateToken,
  authController.getCurrentUser
);

// 修改密码
router.post('/change-password',
  authenticateToken,
  authController.changePassword
);

// 修改当前用户邮箱
router.post('/change-email',
  authenticateToken,
  authController.changeEmail
);

module.exports = router;
