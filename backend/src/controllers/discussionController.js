// 讨论控制器
const { Op } = require('sequelize');
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const DiscussionFavorite = require('../models/DiscussionFavorite');
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

        const discussionData = discussion.toJSON();

        return {
          id: discussionData.id,
          title: discussionData.title, // 标题（自动生成的）
          content: discussionData.content, // 完整的回帖内容（用于显示）
          userName: sender?.name || '匿名用户', // 驼峰命名
          userAvatar: sender?.avatar,
          status: discussionData.status,
          visibility: discussionData.visibility,
          replyCount: replies.length, // 驼峰命名
          createdAt: discussionData.createdAt,
          updatedAt: discussionData.updatedAt,
          messageId: discussionData.messageId,
          userId: discussionData.userId,
          replies // 完整的回复列表
        };
      })
    );

    // 返回格式: { code: 200, message: "Success", data: { discussions: [...] } }
    res.json(success({
      discussions: discussionsWithReplies
    }));
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

    // 获取关联的消息信息
    let linkedMessage = null;
    if (discussion.messageId) {
      const message = await Message.findByPk(discussion.messageId, {
        attributes: ['id', 'title', 'type', 'createdAt']
      });
      if (message) {
        linkedMessage = {
          id: message.id,
          title: message.title,
          type: message.type,
          createdAt: message.createdAt
        };
      }
    }

    // 获取回复发送者信息
    const repliesWithSender = await Promise.all(
      replies.map(async (reply) => {
        const replySender = await User.findByPk(reply.senderId, {
          attributes: ['name', 'avatar']
        });
        return {
          ...reply.toJSON(),
          userName: replySender?.name || '匿名用户',
          userAvatar: replySender?.avatar
        };
      })
    );

    const discussionData = {
      id: discussion.id,
      messageId: discussion.messageId,
      linkedMessage: linkedMessage, // 关联的消息信息
      userId: discussion.userId,
      creatorId: discussion.userId,
      creatorName: sender?.name || '匿名用户',
      userName: sender?.name || '匿名用户',
      userAvatar: sender?.avatar,
      title: discussion.title,
      content: discussion.content,
      status: discussion.status,
      visibility: discussion.visibility,
      viewCount: 0, // 如果需要可以添加浏览统计
      replyCount: replies.length,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      replies: repliesWithSender
    };

    res.json(success(discussionData));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 创建讨论
async function createDiscussion(req, res) {
  const startTime = Date.now(); // 记录开始时间

  try {
    const { messageId, content, visibility = 'private' } = req.body;
    const userId = req.user.userId;

    // 自动生成title：使用content的前50个字符
    const title = content ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : '讨论';

    console.log(`[创建讨论] 开始处理 - 用户ID: ${userId}, 消息ID: ${messageId}, 内容长度: ${content?.length || 0}`);

    // 设置请求超时时间（总体90秒）
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 90000);
    });

    // 异步执行数据库操作
    const dbOperation = async () => {
      // 获取用户信息（添加超时）
      const user = await Promise.race([
        User.findByPk(userId, {
          attributes: ['id', 'name', 'avatar', 'role', 'groupId']
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('用户查询超时')), 10000)
        )
      ]);

      if (!user) {
        console.warn(`[创建讨论] 用户不存在 - 用户ID: ${userId}, 耗时: ${Date.now() - startTime}ms`);
        throw new Error('User not found');
      }
      console.log(`[创建讨论] 用户查询完成 - 用户: ${user.name}, 耗时: ${Date.now() - startTime}ms`);

      // 检查消息是否存在（添加超时）
      const message = await Promise.race([
        Message.findByPk(messageId, {
          attributes: ['id', 'title', 'type', 'status']
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('消息查询超时')), 10000)
        )
      ]);

      if (!message) {
        console.warn(`[创建讨论] 消息不存在 - 消息ID: ${messageId}, 耗时: ${Date.now() - startTime}ms`);
        throw new Error('Message not found');
      }
      console.log(`[创建讨论] 消息查询完成 - 消息: ${message.title}, 耗时: ${Date.now() - startTime}ms`);

      // 创建讨论 - 默认可见性为私密，状态为待回复（添加超时）
      const discussion = await Promise.race([
        Discussion.create({
          messageId,
          userId,
          userName: user.name,
          title,
          content,
          visibility,
          status: 'pending' // 默认状态为待回复
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('创建讨论超时')), 10000)
        )
      ]);

      console.log(`[创建讨论] 创建完成 - 讨论ID: ${discussion.id}, 总耗时: ${Date.now() - startTime}ms`);

      return { user, discussion };
    };

    // 执行操作或超时
    const { user, discussion } = await Promise.race([dbOperation(), timeoutPromise]);

    const discussionData = {
      ...discussion.toJSON(),
      replies: [],
      replies_count: 0,
      user_name: user.name,
      user_avatar: user.avatar
    };

    res.status(201).json(success(discussionData, 'Discussion created successfully'));
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`[创建讨论] 错误 - 耗时: ${elapsed}ms`);
    console.error('[创建讨论] 错误详情:', err);
    console.error('[创建讨论] 错误堆栈:', err.stack);

    // 根据错误类型返回不同的响应
    if (err.message === '请求超时' || err.message.includes('超时')) {
      return res.status(504).json(error('操作超时，请稍后重试', 504));
    }

    if (err.message === 'User not found') {
      return res.status(404).json(notFound('User not found'));
    }

    if (err.message === 'Message not found') {
      return res.status(404).json(notFound('Message not found'));
    }

    res.status(500).json(error(err.message || 'Server error'));
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

    console.log(`[获取讨论回复] 开始 - 讨论ID: ${id}`);

    // 检查讨论是否存在
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      console.warn(`[获取讨论回复] 讨论不存在 - 讨论ID: ${id}`);
      return res.status(404).json(notFound('Discussion not found'));
    }

    // 获取回复
    const replies = await DiscussionReply.findAll({
      where: { discussionId: id },
      order: [['createdAt', 'ASC']]
    });

    // 获取每个回复的发送者信息
    const repliesWithSender = await Promise.all(
      replies.map(async (reply) => {
        const sender = await User.findByPk(reply.senderId, {
          attributes: ['name', 'avatar']
        });
        return {
          ...reply.toJSON(),
          userName: sender?.name || '匿名用户',
          userAvatar: sender?.avatar
        };
      })
    );

    console.log(`[获取讨论回复] 成功 - 讨论ID: ${id}, 回复数: ${repliesWithSender.length}`);

    res.json(success(repliesWithSender));
  } catch (err) {
    console.error('[获取讨论回复] 错误:', err);
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

// 获取我的讨论（当前用户发起的讨论）
async function getMyDiscussions(req, res) {
  try {
    const currentUserId = req.user.userId;

    // 获取当前用户发起的讨论
    const discussions = await Discussion.findAll({
      where: { userId: currentUserId },
      order: [['createdAt', 'DESC']]
    });

    // 获取每个讨论的回复
    const discussionsWithReplies = await Promise.all(
      discussions.map(async (discussion) => {
        const replies = await DiscussionReply.findAll({
          where: { discussionId: discussion.id },
          order: [['createdAt', 'ASC']]
        });

        // 获取关联的消息信息
        let linkedMessage = null;
        if (discussion.messageId) {
          const message = await Message.findByPk(discussion.messageId, {
            attributes: ['id', 'title', 'type', 'createdAt']
          });
          if (message) {
            linkedMessage = {
              id: message.id,
              title: message.title,
              type: message.type,
              createdAt: message.createdAt
            };
          }
        }

        return {
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          status: discussion.status,
          visibility: discussion.visibility,
          messageId: discussion.messageId,
          linkedMessage: linkedMessage,
          replyCount: replies.length,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt,
          replies
        };
      })
    );

    res.json(success({
      discussions: discussionsWithReplies
    }));
  } catch (err) {
    console.error('[获取我的讨论] 错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 获取收藏的讨论列表
async function getFavoriteDiscussions(req, res) {
  try {
    console.log('=== 获取收藏讨论列表请求开始 ===');
    const startTime = Date.now();

    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    // 获取收藏的记录总数
    const { count } = await DiscussionFavorite.findAndCountAll({
      where: { userId }
    });

    // 获取收藏的讨论
    const favorites = await DiscussionFavorite.findAll({
      where: { userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Discussion,
        as: 'discussion',
        required: false, // 使用LEFT JOIN，允许讨论为null（已被删除）
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar'],
          required: false
        }]
      }]
    });

    // 提取讨论数据
    const discussions = favorites
      .map(fav => {
        const discussion = fav.discussion;
        if (!discussion) return null;

        const discussionData = discussion.toJSON();

        return {
          id: discussionData.id,
          title: discussionData.title,
          content: discussionData.content,
          status: discussionData.status,
          visibility: discussionData.visibility,
          messageId: discussionData.messageId,
          replyCount: discussionData.replies?.length || 0,
          createdAt: discussionData.createdAt,
          updatedAt: discussionData.updatedAt,
          creatorId: discussionData.userId,
          creatorName: discussionData.userName,
          userName: discussionData.userName,
          userAvatar: discussionData.user?.avatar
        };
      })
      .filter(disc => disc !== null); // 过滤掉已被删除的讨论

    console.log('获取收藏讨论列表请求处理完成，总耗时:', Date.now() - startTime, 'ms');

    // 统一响应格式: { code, message, data: { list, pagination } }
    res.json(success({
      list: discussions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }));
  } catch (err) {
    console.error('获取收藏讨论列表错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 收藏讨论
async function favoriteDiscussion(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查讨论是否存在
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json(notFound('Discussion not found'));
    }

    // 检查是否已收藏
    const existingFavorite = await DiscussionFavorite.findOne({
      where: { userId, discussionId: id }
    });

    if (existingFavorite) {
      return res.json(success(existingFavorite, 'Already favorited'));
    }

    // 创建收藏记录
    const favorite = await DiscussionFavorite.create({
      userId,
      discussionId: id
    });

    res.status(201).json(success(favorite, 'Discussion favorited successfully'));
  } catch (err) {
    console.error('收藏讨论失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 取消收藏讨论
async function unfavoriteDiscussion(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 查找收藏记录
    const favorite = await DiscussionFavorite.findOne({
      where: { discussionId: id, userId }
    });

    if (!favorite) {
      return res.status(404).json(notFound('Favorite not found'));
    }

    // 删除收藏记录
    await favorite.destroy();

    res.json(success(null, 'Discussion unfavorited successfully'));
  } catch (err) {
    console.error('取消收藏讨论失败:', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  addDiscussionReply,
  getDiscussionReplies,
  updateDiscussionVisibility,
  getMyDiscussions,
  getFavoriteDiscussions,
  favoriteDiscussion,
  unfavoriteDiscussion
};