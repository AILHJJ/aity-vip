# API开发规范文档

## 1. 统一响应格式标准

所有API接口必须使用统一的响应格式,确保前端解析的一致性。

### 1.1 成功响应格式

```javascript
{
  "code": 200,
  "message": "Success",
  "data": {
    // 具体数据内容
  }
}
```

### 1.2 错误响应格式

```javascript
{
  "code": 400, // 或其他错误码
  "message": "错误描述信息"
}
```

### 1.3 HTTP状态码说明

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误

---

## 2. 列表类接口格式

返回列表数据的接口,必须使用以下格式:

```javascript
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      // 数组项1
      // 数组项2
      // ...
    ],
    "pagination": {
      "total": 100,      // 总记录数
      "page": 1,         // 当前页码
      "limit": 20,       // 每页条数
      "pages": 5         // 总页数
    }
  }
}
```

### 2.1 示例代码

```javascript
// 控制器示例
async function getMessages(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // 统一响应格式
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
    res.status(500).json(error('Server error'));
  }
}
```

### 2.2 前端调用示例

```javascript
const res = await getMessagesApi({ page: 1, limit: 20 });

if (res.code === 200) {
  const messageList = res.data.list || [];
  const pagination = res.data.pagination;
  const total = pagination?.total || 0;

  // 处理数据...
}
```

---

## 3. 详情类接口格式

返回单个对象详情的接口,使用以下格式:

```javascript
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "标题",
    "content": "内容",
    // 其他字段...
  }
}
```

### 3.1 示例代码

```javascript
async function getMessageById(req, res) {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    res.json(success(message.toJSON()));
  } catch (err) {
    res.status(500).json(error('Server error'));
  }
}
```

### 3.2 前端调用示例

```javascript
const res = await getMessageDetailApi(messageId);

if (res.code === 200) {
  const message = res.data;
  // 处理详情数据...
}
```

---

## 4. 分页参数规范

### 4.1 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 10 | 每页条数 |

### 4.2 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| total | number | 总记录数 |
| page | number | 当前页码 |
| limit | number | 每页条数 |
| pages | number | 总页数 |

---

## 5. 错误处理规范

### 5.1 使用统一的错误响应函数

```javascript
// 在控制器顶部定义响应格式函数
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
```

### 5.2 错误处理示例

```javascript
async function updateMessage(req, res) {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    // 更新逻辑...
    await message.update(updateData);

    res.json(success(message, 'Message updated successfully'));
  } catch (err) {
    console.error('Update message error:', err);
    res.status(500).json(error('Server error'));
  }
}
```

---

## 6. 命名规范

### 6.1 接口命名

- 使用小写字母和下划线
- 使用复数形式表示资源
- 示例:
  - `GET /api/messages` - 获取消息列表
  - `GET /api/messages/:id` - 获取消息详情
  - `POST /api/messages` - 创建消息
  - `PUT /api/messages/:id` - 更新消息
  - `DELETE /api/messages/:id` - 删除消息

### 6.2 变量命名

- 驼峰命名法(camelCase)
- 示例:
  - `messageTitle`
  - `createdAt`
  - `userId`

### 6.3 数据库字段命名

- 使用蛇形命名法(snake_case)
- 示例:
  - `message_title`
  - `created_at`
  - `user_id`

---

## 7. 数据验证规范

### 7.1 使用验证中间件

```javascript
const { body, param, query } = require('express-validator');

// 创建消息验证
const createMessageValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['morning_focus', 'afternoon_focus', 'system']).withMessage('Invalid type')
];

// 使用验证
router.post('/messages', createMessageValidation, createMessage);
```

---

## 8. 完整示例

### 8.1 控制器完整示例

```javascript
// messageController.js

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

// 获取消息列表
async function getMessages(req, res) {
  try {
    console.log('=== 获取消息列表请求开始 ===');
    const startTime = Date.now();

    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    // 类型过滤
    if (type) where.type = type;

    const { count, rows } = await Message.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    console.log('获取消息列表请求处理完成,总耗时:', Date.now() - startTime, 'ms');

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

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    res.json(success(message.toJSON()));
  } catch (err) {
    console.error('获取消息详情错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 创建消息
async function createMessage(req, res) {
  try {
    const { title, content, type } = req.body;

    const message = await Message.create({
      title,
      content,
      type
    });

    res.status(201).json(success(message.toJSON(), 'Message created successfully'));
  } catch (err) {
    console.error('创建消息错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 更新消息
async function updateMessage(req, res) {
  try {
    const { id } = req.params;
    const { title, content, type } = req.body;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    await message.update({ title, content, type });

    res.json(success(message.toJSON(), 'Message updated successfully'));
  } catch (err) {
    console.error('更新消息错误:', err);
    res.status(500).json(error('Server error'));
  }
}

// 删除消息
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json(notFound('Message not found'));
    }

    await message.destroy();

    res.json(success(null, 'Message deleted successfully'));
  } catch (err) {
    console.error('删除消息错误:', err);
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
```

### 8.2 前端API调用示例

```javascript
// api/message.js

import request from './request';

// 获取消息列表
export async function getMessagesApi(params) {
  return await request.get('/api/messages', { params });
}

// 获取消息详情
export async function getMessageDetailApi(id) {
  return await request.get(`/api/messages/${id}`);
}

// 创建消息
export async function createMessageApi(data) {
  return await request.post('/api/messages', data);
}

// 更新消息
export async function updateMessageApi(id, data) {
  return await request.put(`/api/messages/${id}`, data);
}

// 删除消息
export async function deleteMessageApi(id) {
  return await request.delete(`/api/messages/${id}`);
}
```

### 8.3 前端页面使用示例

```javascript
// 获取消息列表
const loadMessages = async () => {
  try {
    const res = await getMessagesApi({ page: 1, limit: 20 });

    if (res.code === 200) {
      const messageList = res.data.list || [];
      const pagination = res.data.pagination;
      const total = pagination?.total || 0;

      messages.value = messageList;
      hasMore.value = messages.value.length < total;
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载消息失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
};

// 获取消息详情
const loadMessageDetail = async (id) => {
  try {
    const res = await getMessageDetailApi(id);

    if (res.code === 200) {
      message.value = res.data;
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载消息详情失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
};
```

---

## 9. 注意事项

1. **响应格式一致性**: 所有接口必须严格遵循统一的响应格式,不得随意修改
2. **错误处理**: 所有异步操作必须使用try-catch包裹
3. **参数验证**: 对输入参数进行验证,防止无效数据
4. **日志记录**: 关键操作添加日志,便于问题排查
5. **注释说明**: 复杂逻辑必须添加注释说明
6. **数据格式**: 日期统一使用ISO格式,数字类型不要返回字符串
7. **安全性**: 敏感数据不要在响应中暴露
8. **性能优化**: 列表接口限制每页最大返回数量,建议不超过100条

---

## 10. 版本记录

- **v1.0** (2024-02-11): 初始版本,定义统一的API响应格式规范
