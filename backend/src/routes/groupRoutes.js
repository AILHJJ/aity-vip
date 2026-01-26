// 分组路由
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken, checkAdmin } = require('../utils/jwtUtils');
const { validateCreateGroup, validateUpdateGroup, validateIdParam } = require('../middleware/validation');

router.get('/', authenticateToken, groupController.getGroups);
router.get('/:id', authenticateToken, validateIdParam, groupController.getGroupById);
router.post('/', authenticateToken, checkAdmin, validateCreateGroup, groupController.createGroup);
router.put('/:id', authenticateToken, checkAdmin, validateUpdateGroup, groupController.updateGroup);
router.delete('/:id', authenticateToken, checkAdmin, validateIdParam, groupController.deleteGroup);

module.exports = router;