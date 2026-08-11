// 消息控制器
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const Message = require('../models/Message');
const MessageAttachment = require('../models/MessageAttachment');
const UserMessageRead = require('../models/UserMessageRead');
const UserFavorite = require('../models/UserFavorite');
const User = require('../models/User');
const Group = require('../models/Group');
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const { buildVisibleMessageWhere } = require('../utils/messageQueryOptions');
const { normalizeMessageTags } = require('../utils/messageTagRules');
const {
  queueMessageEmailNotifications,
  getEmailNotificationStatus,
  processPendingEmailOutbox,
  processPendingEmailOutboxInBackground
} = require('../services/notificationOutboxService');

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

// 获取消息列表
async function getMessages(req, res) {
  try {
    console.log('=== 获取消息列表请求开始 ===');
    const startTime = Date.now();

    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    // 获取当前用户信息
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json(notFound('User not found'));
    }

    const readRecords = await UserMessageRead.findAll({
      where: { userId },
      attributes: ['messageId']
    });
    const readMessageIds = readRecords.map(record => record.messageId);
    const where = buildVisibleMessageWhere({
      user: currentUser,
      query: req.query,
      readMessageIds,
      sequelize,
      Op
    });

    // 排序：置顶消息优先，然后按创建时间倒序
    const { count, rows } = await Message.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'senderUser',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    const readMessageIdSet = new Set(readMessageIds.map(id => Number(id)));
    const list = rows.map(row => {
      const item = row.toJSON();
      const senderId = item.senderId || item.sender_id;
      item.isRead = String(senderId || '') === String(userId)
        || readMessageIdSet.has(Number(item.id));
      return item;
    });

    console.log('获取消息列表请求处理完成，总耗时:', Date.now() - startTime, 'ms');

    // 统一响应格式: { code, message, data: { list, pagination } }
    res.json(success({
      list,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }));
  } catch (err) {
    console.error('获取消息列表错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 获取消息详情
async function getMessageById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // 获取用户信息
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 获取消息
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }
    
    // 检查用户是否有权限查看该消息
    let hasPermission = true;
    const messageTags = message.tags || []; // 防止 tags 为 null 时 .includes() 崩溃
    
    switch (currentUser.role) {
      case 'super_admin':
      case 'admin':
      case 'trial':
        // 这些角色可以查看所有消息
        break;
      case 'vip_mid':
        // 只能查看中线策略或全部用户的消息
        hasPermission = messageTags.includes('mid_term') || messageTags.includes('all_users');
        break;
      case 'vip_short':
        // 只能查看短线策略或全部用户的消息
        hasPermission = messageTags.includes('short_term') || messageTags.includes('mid_term') || messageTags.includes('all_users');
        break;
      default:
        hasPermission = false;
    }
    
    if (!hasPermission) {
      return res.status(403).json(forbidden('No permission to view this message'));
    }
    
    // 标记消息为已读
    await UserMessageRead.findOrCreate({
      where: { userId, messageId: id }
    });
    
    // 更新消息的已读计数
    const readCount = await UserMessageRead.count({ where: { messageId: id } });
    await message.update({ readCount });
    
    // 获取附件
    const attachments = await MessageAttachment.findAll({
      where: { messageId: id }
    });
    
    // 获取发送者信息
    const sender = await User.findByPk(message.senderId, {
      attributes: ['name', 'avatar']
    });
    
    const messageData = {
      ...message.toJSON(),
      attachments,
      sender_name: sender?.name,
      sender_avatar: sender?.avatar
    };
    
    res.json(success(messageData));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 创建消息
async function createMessage(req, res) {
  try {
    const { title, content, type, groupId, attachments, tags, theme, publishTime, emailNotify, emailNotifyForce } = req.body;
    const userId = req.user.userId;
    const normalizedTags = normalizeMessageTags(tags || []);

    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }

    // 计算接收消息的用户数量
    let totalCount = 0;
    const targetGroupId = groupId || user.groupId || 'all'; // 如果没有指定groupId,使用用户自己的groupId或'all'

    if (targetGroupId === 'all') {
      totalCount = await User.count({ where: { status: 'active' } });
    } else {
      totalCount = await User.count({ where: { groupId: targetGroupId, status: 'active' } });
    }

    // 确定消息状态
    let messageStatus = 'published';
    let messagePublishTime = null;

    if (publishTime) {
      const publishDate = new Date(publishTime);
      const now = new Date();

      if (publishDate > now) {
        // 定时发布
        messageStatus = 'scheduled';
        messagePublishTime = publishDate;
      }
    }

    // 创建消息
    const message = await Message.create({
      title,
      content,
      type,
      sender: user.name || user.username || 'admin',
      senderId: userId,
      groupId: targetGroupId || 'all',
      totalCount,
      tags: normalizedTags.length > 0 ? normalizedTags : null,
      theme: theme || 'default',
      publishTime: messagePublishTime,
      status: messageStatus
    });

    // 处理附件
    if (attachments && attachments.length > 0) {
      // 过滤掉缺少必要字段的附件
      const validAttachments = attachments.filter(attach =>
        attach && attach.url && attach.type
      );
      if (validAttachments.length > 0) {
        const attachmentData = validAttachments.map(attach => ({
          messageId: message.id,
          type: attach.type,
          url: attach.url,
          name: attach.name || 'attachment'
        }));
        await MessageAttachment.bulkCreate(attachmentData);
      }
    }

    let notificationResult = null;
    if (emailNotify === true) {
      try {
        notificationResult = await queueMessageEmailNotifications({
          message,
          tags: normalizedTags,
          senderId: userId,
          force: emailNotifyForce === true
        });
        if (process.env.MAIL_AUTO_PROCESS !== 'false') {
          processPendingEmailOutboxInBackground();
        }
      } catch (notifyError) {
        console.error('[邮件推送] 写入 outbox 失败:', notifyError);
        notificationResult = {
          queued: 0,
          error: notifyError.message
        };
      }
    }

    const messageData = {
      ...message.toJSON(),
      attachments: attachments || [],
      notification: notificationResult
    };

    res.status(201).json(success(messageData, 'Message created successfully'));
  } catch (err) {
    console.error('[创建消息失败]', err.message);
    if (err.name === 'SequelizeValidationError') {
      console.error('验证错误:', JSON.stringify(err.errors));
    } else if (err.name === 'SequelizeDatabaseError') {
      console.error('数据库错误:', err.parent ? err.parent.sqlMessage : err.message);
    } else {
      console.error(err.stack);
    }
    res.status(500).json(error('Server error: ' + err.message));
  }
}

async function processEmailNotifications(req, res) {
  try {
    const requestedLimit = Number(req.body?.limit || req.query?.limit || 20);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 20;
    const results = await processPendingEmailOutbox(limit);
    res.json(success({
      processed: results.length,
      results
    }, 'Email notifications processed'));
  } catch (err) {
    console.error('[邮件推送] 手动处理失败:', err);
    res.status(500).json(error('Server error: ' + err.message));
  }
}

async function getEmailNotificationInfo(req, res) {
  try {
    const status = await getEmailNotificationStatus();
    res.json(success(status));
  } catch (err) {
    console.error('[邮件推送] 获取提醒状态失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 更新消息
async function updateMessage(req, res) {
  try {
    const { id } = req.params;
    const { title, content, type, attachments, tags, theme, publishTime, aiOptimizedContent, originalContent } = req.body;

    // 获取消息
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 准备更新数据
    const updateData = { title, content, type };

    // 处理tags
    if (tags !== undefined) {
      const normalizedTags = normalizeMessageTags(tags);
      updateData.tags = normalizedTags.length > 0 ? normalizedTags : null;
    }

    // 处理theme
    if (theme !== undefined) {
      updateData.theme = theme;
    }

    // 处理AI优化内容
    // 如果传入了aiOptimizedContent，说明进行了AI优化
    if (aiOptimizedContent !== undefined) {
      // 保存原始内容（如果还没有保存过）
      if (!message.originalContent && originalContent) {
        updateData.originalContent = originalContent;
      }
      updateData.aiOptimizedContent = aiOptimizedContent;
      // 更新content为优化后的内容（用于默认显示）
      updateData.content = aiOptimizedContent;
    }

    // 处理publishTime和status
    if (publishTime !== undefined) {
      if (publishTime) {
        const publishDate = new Date(publishTime);
        const now = new Date();

        if (publishDate > now) {
          updateData.publishTime = publishDate;
          updateData.status = 'scheduled';
        } else {
          updateData.publishTime = null;
          updateData.status = 'published';
        }
      } else {
        updateData.publishTime = null;
        updateData.status = 'published';
      }
    }

    // 更新消息
    await message.update(updateData);

    // 更新附件
    if (attachments !== undefined) {
      // 删除现有附件
      await MessageAttachment.destroy({ where: { messageId: id } });

      // 添加新附件
      if (attachments.length > 0) {
        const attachmentData = attachments.map(attach => ({
          messageId: id,
          type: attach.type,
          url: attach.url,
          name: attach.name
        }));
        await MessageAttachment.bulkCreate(attachmentData);
      }
    }

    // 获取最新的附件
    const updatedAttachments = await MessageAttachment.findAll({
      where: { messageId: id }
    });

    const messageData = {
      ...message.toJSON(),
      attachments: updatedAttachments
    };

    res.json(success(messageData, 'Message updated successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 删除消息
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    // 获取消息
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    console.log('开始删除消息:', id);

    // 使用事务确保数据一致性
    const t = await sequelize.transaction();

    try {
      // 1. 删除消息的讨论回复
      const discussions = await Discussion.findAll({ where: { messageId: id } });
      console.log('找到讨论数量:', discussions.length);

      for (const discussion of discussions) {
        await DiscussionReply.destroy({
          where: { discussionId: discussion.id },
          transaction: t
        });
      }

      // 2. 删除讨论
      await Discussion.destroy({ where: { messageId: id }, transaction: t });

      // 3. 删除附件
      await MessageAttachment.destroy({ where: { messageId: id }, transaction: t });

      // 4. 删除用户阅读记录
      await UserMessageRead.destroy({ where: { messageId: id }, transaction: t });

      // 5. 删除消息
      await message.destroy({ transaction: t });

      // 提交事务
      await t.commit();

      console.log('消息删除成功:', id);

      res.json(success(null, 'Message deleted successfully'));
    } catch (error) {
      // 回滚事务
      await t.rollback();
      throw error;
    }
  } catch (err) {
    console.error('删除消息失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 标记消息为已读
async function markMessageAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查消息是否存在
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 创建或更新已读记录
    await UserMessageRead.findOrCreate({
      where: { userId, messageId: id }
    });

    // 更新消息的已读计数
    const readCount = await UserMessageRead.count({ where: { messageId: id } });
    await message.update({ readCount });

    res.json(success({ readCount }, 'Message marked as read'));
  } catch (err) {
    console.error('标记消息已读失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 获取消息阅读详情（管理员专用）
async function getMessageReadDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 验证管理员权限
    const currentUser = await User.findByPk(userId);
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'admin')) {
      return res.status(403).json(forbidden('Admin access is required'));
    }

    // 获取消息
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 根据消息的 groupId + tags 确定目标用户范围
    const userWhere = { status: 'active' };
    const messageTags = message.tags || [];

    // groupId 过滤
    if (message.groupId && message.groupId !== 'all') {
      userWhere.groupId = message.groupId;
    }

    // tags 权限过滤：只统计有权限看这条消息的用户
    if (messageTags.length > 0 && !messageTags.includes('all_users')) {
      const allowedRoles = ['super_admin', 'admin', 'trial'];
      if (messageTags.includes('mid_term')) allowedRoles.push('vip_short', 'vip_mid');
      if (messageTags.includes('short_term')) allowedRoles.push('vip_short');
      userWhere.role = { [Op.in]: allowedRoles };
    }

    // 查询所有目标用户
    const targetUsers = await User.findAll({
      where: userWhere,
      attributes: ['id', 'name', 'avatar', 'role', 'groupId']
    });

    // 查询已读记录
    const readRecords = await UserMessageRead.findAll({
      where: { messageId: id },
      attributes: ['userId', 'readAt']
    });

    // 构建已读用户ID集合
    const readUserMap = new Map();
    readRecords.forEach(record => {
      readUserMap.set(record.userId, record.readAt);
    });

    // 分类：已读 / 未读
    const readUsers = [];
    const unreadUsers = [];

    targetUsers.forEach(user => {
      const readAt = readUserMap.get(user.id);
      if (readAt) {
        readUsers.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          groupId: user.groupId,
          readAt
        });
      } else {
        unreadUsers.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          groupId: user.groupId
        });
      }
    });

    res.json(success({
      readUsers,
      unreadUsers,
      readCount: readUsers.length,
      unreadCount: unreadUsers.length,
      totalCount: targetUsers.length
    }));
  } catch (err) {
    console.error('获取阅读详情失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 获取当前用户未读消息数
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.userId;

    // 获取当前用户信息
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json(notFound('User not found'));
    }

    // 获取用户已读消息ID列表
    const readRecords = await UserMessageRead.findAll({
      where: { userId },
      attributes: ['messageId']
    });
    const readMessageIds = readRecords.map(r => r.messageId);
    const messageWhere = buildVisibleMessageWhere({
      user: currentUser,
      query: { readStatus: 'unread' },
      readMessageIds,
      sequelize,
      Op
    });

    const unreadCount = await Message.count({ where: messageWhere });

    res.json(success({ unreadCount }));
  } catch (err) {
    console.error('获取未读消息数失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 收藏消息
async function favoriteMessage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查消息是否存在
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 检查是否已收藏
    const existingFavorite = await UserFavorite.findOne({
      where: { userId, messageId: id }
    });

    if (existingFavorite) {
      return res.json(success(existingFavorite, 'Already favorited'));
    }

    // 创建收藏记录
    const favorite = await UserFavorite.create({
      userId,
      messageId: id
    });

    res.json(success(favorite, 'Message favorited'));
  } catch (err) {
    console.error('收藏消息失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 取消收藏消息
async function unfavoriteMessage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查消息是否存在
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 查找收藏记录
    const favorite = await UserFavorite.findOne({
      where: { userId, messageId: id }
    });

    if (!favorite) {
      return res.status(404).json(notFound('Favorite not found'));
    }

    // 删除收藏记录
    await favorite.destroy();

    res.json(success({ favorited: false }, 'Message unfavorited'));
  } catch (err) {
    console.error('取消收藏失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 置顶消息
async function pinMessage(req, res) {
  try {
    const { id } = req.params;

    // 检查消息是否存在
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 更新置顶状态
    await message.update({ isPinned: true });

    res.json(success({ pinned: true }, 'Message pinned'));
  } catch (err) {
    console.error('置顶消息失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 取消置顶消息
async function unpinMessage(req, res) {
  try {
    const { id } = req.params;

    // 检查消息是否存在
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 更新置顶状态
    await message.update({ isPinned: false });

    res.json(success({ pinned: false }, 'Message unpinned'));
  } catch (err) {
    console.error('取消置顶失败:', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  getMessageReadDetails,
  getUnreadCount,
  getEmailNotificationInfo,
  processEmailNotifications,
  favoriteMessage,
  unfavoriteMessage,
  pinMessage,
  unpinMessage
};
