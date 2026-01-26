// 分组控制器

// 导入模型
const Group = require('../models/Group');
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

// 获取所有分组
async function getGroups(req, res) {
  try {
    // 从数据库获取所有分组
    const groups = await Group.findAll();
    res.json(success(groups));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 获取分组详情
async function getGroupById(req, res) {
  try {
    const { id } = req.params;
    
    // 从数据库获取分组
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json(notFound('Group not found'));
    }
    
    // 获取该分组的用户数
    const userCount = await User.count({ where: { group_id: id } });
    
    const groupData = {
      ...group.toJSON(),
      userCount
    };
    
    res.json(success(groupData));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 创建分组
async function createGroup(req, res) {
  try {
    const { id, name, description } = req.body;
    
    // 检查分组ID是否已存在
    const existingGroup = await Group.findByPk(id);
    if (existingGroup) {
      return res.status(400).json(badRequest('Group ID already exists'));
    }
    
    // 创建分组
    const group = await Group.create({
      id,
      name,
      description
    });
    
    res.status(201).json(success(group, 'Group created successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 更新分组
async function updateGroup(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // 从数据库获取分组
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json(notFound('Group not found'));
    }
    
    // 更新分组信息
    await group.update({
      name,
      description
    });
    
    res.json(success(group, 'Group updated successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

// 删除分组
async function deleteGroup(req, res) {
  try {
    const { id } = req.params;
    
    // 检查分组是否存在
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json(notFound('Group not found'));
    }
    
    // 检查分组是否有用户
    const userCount = await User.count({ where: { group_id: id } });
    if (userCount > 0) {
      return res.status(400).json(badRequest('Cannot delete group with users. Please move users first.'));
    }
    
    // 删除分组
    await group.destroy();
    res.json(success(null, 'Group deleted successfully'));
  } catch (err) {
    console.error(err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
};