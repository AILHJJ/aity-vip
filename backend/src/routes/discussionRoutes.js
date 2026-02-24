// 讨论路由
const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { authenticateToken } = require('../utils/jwtUtils');
const { validateCreateDiscussion, validateAddReply, validateIdParam } = require('../middleware/validation');

router.get('/', authenticateToken, discussionController.getDiscussions);
router.get('/:id', authenticateToken, ...validateIdParam(), discussionController.getDiscussionById);
router.post('/', authenticateToken, ...validateCreateDiscussion(), discussionController.createDiscussion);
router.post('/:id/replies', authenticateToken, ...validateAddReply(), discussionController.addDiscussionReply);
router.get('/:id/replies', authenticateToken, ...validateIdParam(), discussionController.getDiscussionReplies);
router.put('/:id/visibility', authenticateToken, ...validateIdParam(), discussionController.updateDiscussionVisibility);

module.exports = router;