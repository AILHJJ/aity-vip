/**
 * 消息类型管理控制器
 */
const MessageType = require('../models/MessageType');
const Message = require('../models/Message');

// 统一响应格式
function success(data, message = 'Success') {
  return {
    code: 200,
    message,
    data
  };
}

function error(msg, code = 500) {
  return { code, message: msg };
}

function unauthorized(msg = 'Unauthorized') {
  return { code: 401, message: msg };
}

function forbidden(msg = 'Forbidden') {
  return { code: 403, message: msg };
}

function notFound(msg = 'Not found') {
  return { code: 404, message: msg };
}

function badRequest(msg = 'Bad request') {
  return { code: 400, message: msg };
}

/**
 * 获取所有消息类型列表
 * GET /api/message-types
 */
async function getMessageTypes(req, res) {
  try {
    const { activeOnly } = req.query;
    
    const where = {};
    if (activeOnly === 'true') {
      where.isActive = true;
    }
    
    const types = await MessageType.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json(success(types));
  } catch (err) {
    console.error('获取消息类型列表失败:', err);
    res.status(500).json(error('Server error'));
  }
}

/**
 * 获取单个消息类型
 * GET /api/message-types/:id
 */
async function getMessageTypeById(req, res) {
  try {
    const { id } = req.params;
    
    const messageType = await MessageType.findByPk(id);
    if (!messageType) {
      return res.status(404).json(notFound('Message type not found'));
    }
    
    res.json(success(messageType));
  } catch (err) {
    console.error('获取消息类型详情失败:', err);
    res.status(500).json(error('Server error'));
  }
}

/**
 * 创建消息类型（仅管理员）
 * POST /api/message-types
 */
async function createMessageType(req, res) {
  try {
    const { type, label, color, icon, sortOrder, description } = req.body;
    
    // 验证必填字段
    if (!type || !label) {
      return res.status(400).json(badRequest('type and label are required'));
    }
    
    // 验证type格式（只能是英文、数字、下划线）
    if (!/^[a-z_][a-z0-9_]*$/i.test(type)) {
      return res.status(400).json(badRequest('type must contain only English letters, numbers and underscores'));
    }
    
    // 检查type是否已存在
    const existing = await MessageType.findOne({ where: { type } });
    if (existing) {
      return res.status(400).json(badRequest('This message type already exists'));
    }
    
    const messageType = await MessageType.create({
      type,
      label,
      color: color || '#667eea',
      icon: icon || '',
      sortOrder: sortOrder || 0,
      isActive: true,
      description: description || ''
    });
    
    res.status(201).json(success(messageType, 'Message type created successfully'));
  } catch (err) {
    console.error('创建消息类型失败:', err);
    res.status(500).json(error('Server error'));
  }
}

/**
 * 更新消息类型（仅管理员）
 * PUT /api/message-types/:id
 */
async function updateMessageType(req, res) {
  try {
    const { id } = req.params;
    const { label, color, icon, sortOrder, isActive, description } = req.body;
    
    const messageType = await MessageType.findByPk(id);
    if (!messageType) {
      return res.status(404).json(notFound('Message type not found'));
    }
    
    // 更新字段
    const updateData = {};
    if (label !== undefined) updateData.label = label;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (description !== undefined) updateData.description = description;
    
    await messageType.update(updateData);
    
    res.json(success(messageType, 'Message type updated successfully'));
  } catch (err) {
    console.error('更新消息类型失败:', err);
    res.status(500).json(error('Server error'));
  }
}

/**
 * 删除消息类型（仅管理员）
 * DELETE /api/message-types/:id
 * Body: { replacementType: "new_type" } 可选，迁移已有消息到新类型
 */
async function deleteMessageType(req, res) {
  try {
    const { id } = req.params;
    const { replacementType } = req.body;

    const messageType = await MessageType.findByPk(id);
    if (!messageType) {
      return res.status(404).json(notFound('Message type not found'));
    }

    // 检查是否有消息使用此类型
    const messageCount = await Message.count({ where: { type: messageType.type } });
    if (messageCount > 0) {
      if (replacementType) {
        // 迁移消息到新类型
        await Message.update(
          { type: replacementType },
          { where: { type: messageType.type } }
        );
      } else {
        return res.status(400).json(
          badRequest(`Cannot delete: ${messageCount} messages are using this type. Please provide a replacementType to migrate them.`)
        );
      }
    }

    await messageType.destroy();

    res.json(success({ migratedCount: messageCount }, 'Message type deleted successfully'));
  } catch (err) {
    console.error('删除消息类型失败:', err);
    res.status(500).json(error('Server error'));
  }
}

/**
 * 初始化默认消息类型
 * POST /api/message-types/init
 */
async function initDefaultTypes(req, res) {
  try {
    await MessageType.initDefaultTypes();
    const types = await MessageType.findAll({ order: [['sortOrder', 'ASC']] });
    res.json(success(types, 'Default types initialized'));
  } catch (err) {
    console.error('初始化默认类型失败:', err);
    res.status(500).json(error('Server error'));
  }
}

module.exports = {
  getMessageTypes,
  getMessageTypeById,
  createMessageType,
  updateMessageType,
  deleteMessageType,
  initDefaultTypes
};
