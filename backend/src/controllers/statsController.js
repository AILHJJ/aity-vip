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

// 获取用户增长趋势（管理员视图）
async function getUserGrowth(req, res) {
  try {
    const currentUserRole = req.user.role;
    const days = parseInt(req.query.days) || 30;

    // 检查权限
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      return res.status(403).json(forbidden('Only administrators can access this data'));
    }

    // 生成日期数组
    const growth = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.count({
        where: {
          createdAt: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });

      growth.push({
        date: dateStr,
        count
      });
    }

    res.json(success({ growth }));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取活跃用户列表（管理员视图）
async function getActiveUsers(req, res) {
  try {
    const currentUserRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    // 检查权限
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      return res.status(403).json(forbidden('Only administrators can access this data'));
    }

    // 获取最近活跃的用户（基于最近创建的讨论）
    const recentDiscussions = await Discussion.findAll({
      attributes: ['userId', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: limit * 2 // 多获取一些以防重复用户
    });

    // 提取活跃用户ID（去重）
    const activeUserIds = [...new Set(recentDiscussions.map(d => d.userId))].slice(0, limit);

    // 获取用户信息
    const users = await User.findAll({
      where: { id: { [Op.in]: activeUserIds } },
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit
    });

    // 创建用户最后活跃时间映射
    const lastActiveMap = {};
    recentDiscussions.forEach(d => {
      if (!lastActiveMap[d.userId]) {
        lastActiveMap[d.userId] = d.createdAt;
      }
    });

    const result = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastActive: lastActiveMap[user.id] || user.createdAt
    }));

    res.json(success({ users: result }));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取用户角色分布（管理员视图）
async function getUserRoleDistribution(req, res) {
  try {
    const currentUserRole = req.user.role;

    // 检查权限
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      return res.status(403).json(forbidden('Only administrators can access this data'));
    }

    const distribution = {
      super_admin: 0,
      admin: 0,
      vip_mid: 0,
      vip_short: 0,
      trial: 0
    };

    const users = await User.findAll({
      attributes: ['role']
    });

    users.forEach(user => {
      if (distribution.hasOwnProperty(user.role)) {
        distribution[user.role]++;
      }
    });

    res.json(success({ distribution }));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取全局统计数据（管理员视图）
async function getGlobalStats(req, res) {
  try {
    const currentUserRole = req.user.role;

    // 检查权限：只有管理员可以访问全局统计
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      return res.status(403).json(forbidden('Only administrators can access global stats'));
    }

    // 获取总用户数
    const totalUsers = await User.count();

    // 获取各角色用户数
    const vipShortCount = await User.count({ where: { role: 'vip_short' } });
    const vipMidCount = await User.count({ where: { role: 'vip_mid' } });
    const vipLongCount = await User.count({ where: { role: 'vip_long' } });
    const trialCount = await User.count({ where: { role: 'trial' } });
    const adminCount = await User.count({
      where: {
        role: {
          [Op.in]: ['super_admin', 'admin']
        }
      }
    });

    // 获取消息统计
    const totalMessages = await Message.count();

    // 获取讨论统计
    const totalDiscussions = await Discussion.count();

    // 获取今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    const stats = {
      users: {
        total: totalUsers,
        vip_short: vipShortCount,
        vip_mid: vipMidCount,
        vip_long: vipLongCount,
        trial: trialCount,
        admin: adminCount,
        newToday: newUsersToday
      },
      messages: {
        total: totalMessages
      },
      discussions: {
        total: totalDiscussions
      }
    };

    res.json(success(stats));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getPersonalStats,
  getMessageTrend,
  getMessageTypeDistribution,
  getGlobalStats,
  getUserGrowth,
  getActiveUsers,
  getUserRoleDistribution
};