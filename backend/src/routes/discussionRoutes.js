// 讨论路由
const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { authenticateToken } = require('../utils/jwtUtils');

// 获取讨论列表
router.get('/', authenticateToken, discussionController.getDiscussions);

// 获取讨论详情
router.get('/:id', authenticateToken, discussionController.getDiscussionById);

// 创建讨论
router.post('/', authenticateToken, discussionController.createDiscussion);

// 添加讨论回复
router.post('/:id/replies', authenticateToken, discussionController.addDiscussionReply);

// 获取讨论回复
router.get('/:id/replies', authenticateToken, discussionController.getDiscussionReplies);

module.exports = router;