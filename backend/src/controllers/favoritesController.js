// 收藏控制器
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const UserFavorite = require('../models/UserFavorite');
const Message = require('../models/Message');
const MessageAttachment = require('../models/MessageAttachment');
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

// 获取收藏列表
async function getFavorites(req, res) {
  try {
    console.log('=== 获取收藏列表请求开始 ===');
    const startTime = Date.now();

    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    // 获取当前用户信息
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json(notFound('User not found'));
    }

    // 获取收藏的记录总数
    const { count } = await UserFavorite.findAndCountAll({
      where: { userId }
    });

    // 获取收藏的消息
    const favorites = await UserFavorite.findAll({
      where: { userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Message,
        as: 'message',
        include: [{
          model: MessageAttachment,
          as: 'attachments'
        }, {
          model: User,
          as: 'senderUser',
          attributes: ['id', 'name', 'email', 'role']
        }]
      }]
    });

    // 提取消息数据
    const messages = favorites
      .map(fav => fav.message)
      .filter(msg => msg !== null); // 过滤掉已被删除的消息

    console.log('获取收藏列表请求处理完成，总耗时:', Date.now() - startTime, 'ms');

    // 统一响应格式: { code, message, data: { list, pagination } }
    res.json(success({
      list: messages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }));
  } catch (err) {
    console.error('获取收藏列表错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 添加收藏
async function addFavorite(req, res) {
  try {
    const { messageId } = req.body;
    const userId = req.user.userId;

    // 验证参数
    if (!messageId) {
      return res.status(400).json(badRequest('Message ID is required'));
    }

    // 检查消息是否存在
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 检查是否已收藏
    const existingFavorite = await UserFavorite.findOne({
      where: { userId, messageId }
    });

    if (existingFavorite) {
      return res.json(success(existingFavorite, 'Already favorited'));
    }

    // 创建收藏记录
    const favorite = await UserFavorite.create({
      userId,
      messageId
    });

    res.status(201).json(success(favorite, 'Message favorited successfully'));
  } catch (err) {
    console.error('添加收藏失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 取消收藏
async function removeFavorite(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 查找收藏记录
    const favorite = await UserFavorite.findOne({
      where: { id, userId }
    });

    if (!favorite) {
      return res.status(404).json(notFound('Favorite not found'));
    }

    // 删除收藏记录
    await favorite.destroy();

    res.json(success(null, 'Message unfavorited successfully'));
  } catch (err) {
    console.error('取消收藏失败:', err);
    res.status(500).json(error('Server error'));
  }
}

// 检查消息是否已收藏
async function checkFavorite(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const favorite = await UserFavorite.findOne({
      where: { userId, messageId }
    });

    res.json(success({
      isFavorited: !!favorite,
      favoriteId: favorite ? favorite.id : null
    }));
  } catch (err) {
    console.error('检查收藏状态失败:', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};
