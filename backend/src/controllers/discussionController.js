// 讨论控制器
const { Op } = require('sequelize');
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const Message = require('../models/Message');
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

// 获取讨论列表
async function getDiscussions(req, res) {
  try {
    const { messageId, status } = req.query;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;
    
    const where = {};
    
    if (messageId) {
      where.messageId = messageId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // 根据用户角色和可见性过滤讨论
    const visibilityCondition = [];
    
    if (currentUserRole === 'super_admin' || currentUserRole === 'admin') {
      // 管理员可以查看所有讨论
    } else {
      // 普通用户只能查看公开讨论或自己发起的讨论
      visibilityCondition.push(
        { visibility: 'public' },
        { userId: currentUserId }
      );
      where[Op.or] = visibilityCondition;
    }
    
    const discussions = await Discussion.findAll({
      where,
      order: [['createdAt', 'DESC']] // 按创建时间倒序排序
    });
    
    // 获取每个讨论的回复
    const discussionsWithReplies = await Promise.all(
      discussions.map(async (discussion) => {
        const replies = await DiscussionReply.findAll({
          where: { discussionId: discussion.id },
          order: [['createdAt', 'ASC']]
        });
        
        // 获取发送者信息
        const sender = await User.findByPk(discussion.userId, {
          attributes: ['name', 'avatar']
        });
        
        return {
          ...discussion.toJSON(),
          replies,
          replies_count: replies.length,
          user_name: sender?.name,
          user_avatar: sender?.avatar
        };
      })
    );
    
    res.json(success(discussionsWithReplies));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取讨论详情
async function getDiscussionById(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;
    
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json(notFound('Discussion not found'));
    }
    
    // 检查用户是否有权限查看该讨论
    let hasPermission = false;
    
    if (currentUserRole === 'super_admin' || currentUserRole === 'admin') {
      // 管理员可以查看所有讨论
      hasPermission = true;
    } else if (discussion.visibility === 'public') {
      // 公开讨论所有人可见
      hasPermission = true;
    } else if (discussion.userId === currentUserId) {
      // 私密讨论只有发起者和管理员可见
      hasPermission = true;
    }
    
    if (!hasPermission) {
      return res.status(403).json(forbidden('No permission to view this discussion'));
    }
    
    // 获取回复
    const replies = await DiscussionReply.findAll({
      where: { discussionId: id },
      order: [['createdAt', 'ASC']]
    });
    
    // 获取发送者信息
    const sender = await User.findByPk(discussion.userId, {
      attributes: ['name', 'avatar']
    });
    
    // 获取回复发送者信息
    const repliesWithSender = await Promise.all(
      replies.map(async (reply) => {
        const replySender = await User.findByPk(reply.senderId, {
          attributes: ['name', 'avatar']
        });
        return {
          ...reply.toJSON(),
          user_name: replySender?.name,
          user_avatar: replySender?.avatar
        };
      })
    );
    
    const discussionData = {
      ...discussion.toJSON(),
      replies: repliesWithSender,
      user_name: sender?.name,
      user_avatar: sender?.avatar
    };
    
    res.json(success(discussionData));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 创建讨论
async function createDiscussion(req, res) {
  try {
    const { messageId, title, content, visibility = 'private' } = req.body;
    const userId = req.user.userId;
    
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 检查消息是否存在
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }
    
    // 创建讨论 - 默认可见性为私密，状态为待回复
    const discussion = await Discussion.create({
      messageId,
      userId,
      userName: user.name,
      title,
      content,
      visibility,
      status: 'pending' // 默认状态为待回复
    });
    
    const discussionData = {
      ...discussion.toJSON(),
      replies: [],
      replies_count: 0,
      user_name: user.name,
      user_avatar: user.avatar
    };
    
    res.status(201).json(success(discussionData, 'Discussion created successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 添加讨论回复
async function addDiscussionReply(req, res) {
  try {
    const { id } = req.params;
    const { content, visibility } = req.body;
    const senderId = req.user.userId;
    const senderRole = req.user.role;
    
    // 获取讨论
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json(notFound('Discussion not found'));
    }
    
    // 检查用户是否有权限回复该讨论
    let canReply = false;
    
    if (senderRole === 'super_admin' || senderRole === 'admin') {
      // 管理员可以回复所有讨论
      canReply = true;
    } else if (discussion.visibility === 'public') {
      // 公开讨论所有人可以回复
      canReply = true;
    } else if (discussion.userId === senderId) {
      // 发起者可以回复自己的讨论
      canReply = true;
    }
    
    if (!canReply) {
      return res.status(403).json(forbidden('No permission to reply to this discussion'));
    }
    
    // 获取用户信息
    const user = await User.findByPk(senderId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 创建回复
    const reply = await DiscussionReply.create({
      discussionId: id,
      senderId,
      senderName: user.name,
      content
    });
    
    // 更新讨论状态和可见性
    const updateData = { status: 'replied' }; // 回复后自动变为已回复状态
    
    if ((senderRole === 'super_admin' || senderRole === 'admin') && visibility) {
      // 只有管理员可以修改可见性
      updateData.visibility = visibility;
    }
    
    await discussion.update(updateData);
    
    // 获取更新后的讨论
    const updatedDiscussion = await Discussion.findByPk(id);
    
    const replyData = {
      reply: {
        ...reply.toJSON(),
        user_name: user.name,
        user_avatar: user.avatar
      },
      discussion: {
        ...updatedDiscussion.toJSON(),
        replies_count: (updatedDiscussion.replies_count || 0) + 1
      }
    };
    
    res.status(201).json(success(replyData, 'Reply added successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取讨论回复
async function getDiscussionReplies(req, res) {
  try {
    const { id } = req.params;

    // 检查讨论是否存在
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json(notFound('Discussion not found'));
    }

    // 获取回复
    const replies = await DiscussionReply.findAll({
      where: { discussionId: id },
      order: [['createdAt', 'ASC']]
    });

    res.json(success(replies));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 更新讨论可见性
async function updateDiscussionVisibility(req, res) {
  try {
    const { id } = req.params;
    const { visibility } = req.body;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;

    // 验证可见性值
    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json(badRequest('Invalid visibility value'));
    }

    // 只有管理员可以修改可见性
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      return res.status(403).json(forbidden('Only administrators can change visibility'));
    }

    // 获取讨论
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json(notFound('Discussion not found'));
    }

    // 更新可见性
    await discussion.update({ visibility });

    res.json(success({
      id: discussion.id,
      visibility: discussion.visibility
    }, 'Visibility updated successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  addDiscussionReply,
  getDiscussionReplies,
  updateDiscussionVisibility
};