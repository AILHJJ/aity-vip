// 消息控制器
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const Message = require('../models/Message');
const MessageAttachment = require('../models/MessageAttachment');
const UserMessageRead = require('../models/UserMessageRead');
const User = require('../models/User');
const Group = require('../models/Group');
const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');

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

    const { page = 1, limit = 10, type, groupId, status } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;
    const where = {};

    // 获取当前用户信息
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json(notFound('User not found'));
    }

    // 构建复杂的查询条件
    const andConditions = [];

    // 状态过滤（仅管理员可用）
    if (status && (currentUser.role === 'super_admin' || currentUser.role === 'admin')) {
      // 管理员可以看到所有状态的消息
      where.status = status;
    } else {
      // 普通用户只能看到已发布的消息，或者定时发布时间已到的消息
      // 向后兼容：status为null的旧消息也应该显示
      andConditions.push({
        [Op.or]: [
          { status: 'published' },
          { status: { [Op.is]: null } }, // 向后兼容旧数据
          {
            status: 'scheduled',
            publishTime: { [Op.lte]: new Date() }
          }
        ]
      });
    }

    // 类型过滤
    if (type) where.type = type;

    // 分组过滤
    if (groupId) where.groupId = groupId;

    // 标签权限过滤（trial用户和管理员不受限制）
    if (currentUser.role !== 'trial' && currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      // vip_mid 只能看到包含"mid_term"或"all_users"标签的消息
      // vip_short 只能看到包含"short_term"或"all_users"标签的消息
      const allowedTags = currentUser.role === 'vip_mid'
        ? ['mid_term', 'all_users']
        : ['short_term', 'all_users'];

      andConditions.push({
        [Op.or]: [
          { tags: null }, // 没有标签的消息所有人可见（向后兼容）
          sequelize.where(
            sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTags[0])),
            1
          ),
          sequelize.where(
            sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTags[1])),
            1
          )
        ]
      });
    }

    // 合并所有条件
    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const { count, rows } = await Message.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'senderUser',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    console.log('获取消息列表请求处理完成，总耗时:', Date.now() - startTime, 'ms');

    // 统一响应格式: { code, message, data: { list, pagination } }
    res.json(success({
      list: rows,
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
    
    switch (currentUser.role) {
      case 'super_admin':
      case 'admin':
      case 'trial':
        // 这些角色可以查看所有消息
        break;
      case 'vip_mid':
        // 只能查看中线策略或全部用户的消息
        hasPermission = message.tags.includes('mid_term') || message.tags.includes('all_users');
        break;
      case 'vip_short':
        // 只能查看短线策略或全部用户的消息
        hasPermission = message.tags.includes('short_term') || message.tags.includes('all_users');
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
    const sender = await User.findByPk(message.sender_id, {
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
    const { title, content, type, groupId, attachments, tags, theme, publishTime } = req.body;
    const userId = req.user.userId;

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
      sender: user.name,
      senderId: userId,
      groupId: targetGroupId,
      totalCount,
      tags: tags || null,
      theme: theme || 'default',
      publishTime: messagePublishTime,
      status: messageStatus
    });

    // 处理附件
    if (attachments && attachments.length > 0) {
      const attachmentData = attachments.map(attach => ({
        messageId: message.id,
        type: attach.type,
        url: attach.url,
        name: attach.name
      }));
      await MessageAttachment.bulkCreate(attachmentData);
    }

    const messageData = {
      ...message.toJSON(),
      attachments: attachments || []
    };

    res.status(201).json(success(messageData, 'Message created successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 更新消息
async function updateMessage(req, res) {
  try {
    const { id } = req.params;
    const { title, content, type, attachments, tags, theme, publishTime } = req.body;

    // 获取消息
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 准备更新数据
    const updateData = { title, content, type };

    // 处理tags
    if (tags !== undefined) {
      updateData.tags = tags;
    }

    // 处理theme
    if (theme !== undefined) {
      updateData.theme = theme;
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

    // 这里需要创建一个收藏表或者使用现有的方式
    // 暂时返回成功，实际项目中应该有 favorites 表
    // TODO: 实现 favorites 功能

    res.json(success({ favorited: true }, 'Message favorited'));
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

    // TODO: 实现 unfavorite 功能

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
  favoriteMessage,
  unfavoriteMessage,
  pinMessage,
  unpinMessage
};