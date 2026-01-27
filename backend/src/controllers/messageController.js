// 消息控制器
const { Op } = require('sequelize');
const Message = require('../models/Message');
const MessageAttachment = require('../models/MessageAttachment');
const UserMessageRead = require('../models/UserMessageRead');
const User = require('../models/User');
const Group = require('../models/Group');

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
    
    // 简化获取消息列表逻辑，直接返回模拟的消息数据
    // 暂时跳过数据库查询、用户权限验证等操作
    
    // 模拟消息数据
    const mockMessages = [
      {
        id: 1,
        title: '测试消息 1',
        content: '这是一条测试消息，用于测试消息列表功能。',
        type: 'system',
        tags: ['all'],
        sender: '管理员',
        sender_id: 1,
        created_at: new Date(),
        read_count: 0,
        sender_name: '管理员',
        sender_avatar: ''
      },
      {
        id: 2,
        title: '测试消息 2',
        content: '这是另一条测试消息，用于测试消息列表功能。',
        type: 'important',
        tags: ['all'],
        sender: '管理员',
        sender_id: 1,
        created_at: new Date(),
        read_count: 1,
        sender_name: '管理员',
        sender_avatar: ''
      }
    ];
    
    const result = {
      list: mockMessages,
      total: mockMessages.length,
      page: 1,
      pageSize: 20
    };
    
    console.log('获取消息列表请求处理完成，总耗时:', Date.now() - startTime, 'ms');
    
    res.json(success(result));
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
        hasPermission = message.tags.includes('mid_term') || message.tags.includes('all');
        break;
      case 'vip_short':
        // 只能查看短线策略或全部用户的消息
        hasPermission = message.tags.includes('short_term') || message.tags.includes('all');
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
    const { title, content, type, groupId, attachments } = req.body;
    const userId = req.user.userId;
    
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 计算接收消息的用户数量
    let totalCount = 0;
    if (groupId === 'all') {
      totalCount = await User.count({ where: { status: 'active' } });
    } else {
      totalCount = await User.count({ where: { groupId, status: 'active' } });
    }
    
    // 创建消息
    const message = await Message.create({
      title,
      content,
      type,
      sender: user.name,
      senderId: userId,
      groupId,
      totalCount
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
    const { title, content, type, attachments } = req.body;
    
    // 获取消息
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }
    
    // 更新消息
    await message.update({ title, content, type });
    
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
    
    // 删除附件
    await MessageAttachment.destroy({ where: { messageId: id } });
    
    // 删除消息
    await message.destroy();
    
    res.json(success(null, 'Message deleted successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage
};