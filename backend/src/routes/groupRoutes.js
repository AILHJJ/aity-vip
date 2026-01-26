// 分组路由
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');

// 获取所有分组
router.get('/', authenticateToken, groupController.getGroups);

// 获取分组详情
router.get('/:id', authenticateToken, groupController.getGroupById);

// 创建分组（需要管理员权限）
router.post('/', authenticateToken, checkAdmin, groupController.createGroup);

// 更新分组（需要管理员权限）
router.put('/:id', authenticateToken, checkAdmin, groupController.updateGroup);

// 删除分组（需要管理员权限）
router.delete('/:id', authenticateToken, checkAdmin, groupController.deleteGroup);

module.exports = router;