// 统计控制器
const Message = require('../models/Message');
const Discussion = require('../models/Discussion');
const UserMessageRead = require('../models/UserMessageRead');
const UserFavorite = require('../models/UserFavorite');
const User = require('../models/User');
const { Op } = require('sequelize');

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

// 获取个人统计数据
async function getPersonalStats(req, res) {
  try {
    const userId = req.user.userId;
    
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 获取用户组的消息
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { groupId: user.groupId },
          { groupId: 'all' }
        ]
      }
    });
    
    const totalMessages = messages.length;
    
    // 获取已读消息数
    const readCount = await UserMessageRead.count({
      where: {
        userId,
        messageId: {
          [Op.in]: messages.map(msg => msg.id)
        }
      }
    });
    
    // 获取收藏消息数
    const favoriteCount = await UserFavorite.count({
      where: {
        userId,
        messageId: {
          [Op.in]: messages.map(msg => msg.id)
        }
      }
    });
    
    // 获取用户发起的讨论数
    const discussionCount = await Discussion.count({
      where: { userId }
    });
    
    const stats = {
      totalMessages,
      readMessages: readCount,
      favoriteMessages: favoriteCount,
      userDiscussions: discussionCount
    };
    
    res.json(success(stats));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取消息阅读趋势
async function getMessageTrend(req, res) {
  try {
    const userId = req.user.userId;
    
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 获取最近6个月的数据
    const trend = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('zh-CN', { month: 'short' });
      trend[month] = 0;
    }
    
    // 获取消息
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { groupId: user.groupId },
          { groupId: 'all' }
        ]
      },
      attributes: ['createdAt']
    });
    
    // 统计每个月的消息数
    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt);
      const month = msgDate.toLocaleString('zh-CN', { month: 'short' });
      if (trend.hasOwnProperty(month)) {
        trend[month]++;
      }
    });
    
    res.json(success(trend));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取消息类型分布
async function getMessageTypeDistribution(req, res) {
  try {
    const userId = req.user.userId;
    
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json(notFound('User not found'));
    }
    
    // 统计消息类型分布
    const distribution = {
      system: 0,
      important: 0,
      daily: 0
    };
    
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { groupId: user.groupId },
          { groupId: 'all' }
        ]
      },
      attributes: ['type']
    });
    
    messages.forEach(msg => {
      if (distribution.hasOwnProperty(msg.type)) {
        distribution[msg.type]++;
      }
    });
    
    res.json(success(distribution));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getPersonalStats,
  getMessageTrend,
  getMessageTypeDistribution
};