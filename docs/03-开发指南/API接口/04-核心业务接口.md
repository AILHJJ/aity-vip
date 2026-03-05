# 核心业务接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0.0 |
| **最后更新** | 2026-03-04 |
| **维护人** | 后端开发团队 |
| **接口基础地址** | 开发环境：`http://localhost:3001/api`<br>生产环境：`https://aity88.online:8443/api` |
| **认证方式** | JWT Bearer Token |
| **响应格式** | 统一JSON格式 |

---

## 基础说明

### 响应格式

所有API响应都采用统一格式：

```json
{
  "code": 200,          // 状态码
  "message": "Success", // 消息
  "data": {}           // 数据
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 认证方式

使用 JWT 认证，在请求头中添加：

```
Authorization: Bearer <token>
```

---

## 接口概览

| 模块 | 接口数量 | 说明 |
|------|---------|------|
| 认证接口 | 2 | 登录、获取用户信息 |
| 消息接口 | 11 | 消息CRUD、已读、收藏、置顶 |
| 讨论接口 | 4 | 讨论、回复、可见性管理 |
| 用户接口 | 5 | 用户CRUD、密码重置 |
| 分组接口 | 4 | 分组CRUD |
| 统计接口 | 3 | 个人统计、消息趋势、类型分布 |
| 市场数据接口 | 2 | 指数行情、市场异动（规划中） |
| 文件上传接口 | 1 | 图片上传 |
| 健康检查 | 1 | API状态检查 |
| **总计** | **33** | - |

---

## 接口详情

## 一、认证接口

### 1.1 用户登录

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/auth/login` |
| **请求方法** | POST |
| **Content-Type** | application/json |
| **认证方式** | 无需认证 |
| **接口说明** | 用户登录获取JWT Token |

**请求参数**

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| email | String | 是 | 用户邮箱 | "admin@example.com" |
| password | String | 是 | 用户密码 | "123456" |

**响应示例**

```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "<jwt-token>",
    "user": {
      "id": 1,
      "name": "管理员",
      "email": "admin@example.com",
      "role": "super_admin",
      "groupId": "all"
    }
  }
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| data.token | String | JWT认证令牌 | "eyJhbGciOiJIUzI1NiIs..." |
| data.user.id | Number | 用户ID | 1 |
| data.user.name | String | 用户名 | "管理员" |
| data.user.email | String | 用户邮箱 | "admin@example.com" |
| data.user.role | String | 用户角色 | "super_admin" |
| data.user.groupId | String | 分组ID | "all" |

**调用示例**

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: '123456'
  })
});
const data = await response.json();
// 保存token
localStorage.setItem('token', data.data.token);
```

---

### 1.2 获取当前用户信息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/auth/me` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取当前登录用户的详细信息 |

**请求参数**

无

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "管理员",
    "email": "admin@example.com",
    "role": "super_admin",
    "groupId": "all",
    "status": "active",
    "expireDate": null
  }
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| data.id | Number | 用户ID | 1 |
| data.name | String | 用户名 | "管理员" |
| data.email | String | 用户邮箱 | "admin@example.com" |
| data.role | String | 用户角色 | "super_admin" |
| data.groupId | String | 分组ID | "all" |
| data.status | String | 用户状态 | "active" |
| data.expireDate | String | 过期日期 | null |

**调用示例**

```javascript
const response = await fetch('http://localhost:3001/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.data);
```

---

## 二、消息接口

### 消息类型说明

系统支持以下10种消息类型：

| 类型代码 | 类型名称 | 说明 |
|----------|----------|------|
| `pre_market_comment` | 盘前点评 | 开盘前的市场分析和预测 |
| `morning_comment` | 早盘点评 | 上午开盘后的市场分析 |
| `morning_focus` | 早盘关注 | 上午值得关注的个股或板块 |
| `afternoon_comment` | 尾盘点评 | 下午收盘前的市场分析 |
| `afternoon_focus` | 尾盘关注 | 下午值得关注的个股或板块 |
| `close_comment` | 收盘点评 | 全天市场走势的总结分析 |
| `risk_warning` | 风险提示 | 投资风险的警示信息 |
| `system` | 系统消息 | 系统通知和公告 |
| `important` | 重要消息 | 重要通知 |
| `daily` | 日常消息 | 日常消息（默认值） |

### 消息标签说明

消息标签用于权限控制：

| 标签名称 | 说明 | 可见用户 |
|----------|------|----------|
| `短线策略` | 短线投资策略 | vip_short, trial, admin |
| `中线策略` | 中线投资策略 | vip_mid, trial, admin |
| `全部用户` | 所有人可见 | 所有VIP用户 |

**标签规则：**
- 消息可以有多个标签（JSON数组）
- 没有标签的消息所有人可见
- trial用户不受标签限制，可查看所有消息
- admin和super_admin不受标签限制

### 消息状态说明

| 状态代码 | 状态名称 | 说明 |
|----------|----------|------|
| `draft` | 草稿 | 草稿状态，不可见 |
| `scheduled` | 定时发布 | 等待发布时间到达 |
| `published` | 已发布 | 已发布，用户可见 |

### 2.1 获取消息列表

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取消息列表，支持分页和筛选 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Number | 否 | 页码，默认1 | 1 |
| limit | Number | 否 | 每页数量，默认10 | 10 |
| type | String | 否 | 消息类型 | "daily" |
| groupId | String | 否 | 分组ID | "all" |
| status | String | 否 | 消息状态（仅管理员） | "published" |

**响应示例**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "测试消息",
      "content": "这是一条测试消息",
      "type": "daily",
      "tags": ["全部用户"],
      "groupId": "all",
      "sender": "管理员",
      "senderId": 1,
      "status": "published",
      "publishTime": null,
      "readCount": 0,
      "totalCount": 10,
      "createdAt": "2026-01-29T00:00:00.000Z",
      "senderUser": {
        "id": 1,
        "name": "管理员",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| data[].id | Number | 消息ID | 1 |
| data[].title | String | 消息标题 | "测试消息" |
| data[].content | String | 消息内容 | "这是一条测试消息" |
| data[].type | String | 消息类型 | "daily" |
| data[].tags | Array | 消息标签 | ["全部用户"] |
| data[].status | String | 消息状态 | "published" |
| data[].readCount | Number | 已读人数 | 0 |
| data[].totalCount | Number | 总人数 | 10 |

---

### 2.2 获取消息详情

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取单条消息的详细信息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "测试消息",
    "content": "这是一条测试消息",
    "type": "daily",
    "tag": "all",
    "groupId": "all",
    "authorId": 1,
    "authorName": "管理员",
    "createdAt": "2026-01-26T00:00:00.000Z",
    "updatedAt": "2026-01-26T00:00:00.000Z",
    "read": true,
    "favorited": false,
    "attachments": [],
    "discussions": []
  }
}
```

---

### 2.3 创建消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages` |
| **请求方法** | POST |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 创建新消息，支持定时发布和附件 |

**请求参数**

```json
{
  "title": "新消息",
  "content": "消息内容",
  "type": "daily",
  "groupId": "all",
  "tags": ["全部用户"],
  "publishTime": "2026-01-30T10:00:00.000Z",
  "attachments": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "name": "图片.jpg"
    }
  ]
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| title | String | 是 | 消息标题 | "新消息" |
| content | String | 是 | 消息内容 | "消息内容" |
| type | String | 是 | 消息类型 | "daily" |
| groupId | String | 是 | 分组ID | "all" |
| tags | Array | 否 | 消息标签数组 | ["全部用户"] |
| publishTime | String | 否 | 定时发布时间（ISO8601），不传或null表示立即发布 | "2026-01-30T10:00:00.000Z" |
| attachments | Array | 否 | 附件数组 | [] |

**响应示例**

```json
{
  "code": 200,
  "message": "Message created successfully",
  "data": {
    "id": 2,
    "title": "新消息",
    "content": "消息内容",
    "type": "daily",
    "tags": ["全部用户"],
    "groupId": "all",
    "sender": "管理员",
    "senderId": 1,
    "status": "scheduled",
    "publishTime": "2026-01-30T10:00:00.000Z",
    "readCount": 0,
    "totalCount": 10,
    "createdAt": "2026-01-29T00:00:00.000Z",
    "attachments": [
      {
        "type": "image",
        "url": "https://example.com/image.jpg",
        "name": "图片.jpg"
      }
    ]
  }
}
```

---

### 2.4 更新消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id` |
| **请求方法** | PUT |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 更新消息内容 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**请求参数**

```json
{
  "title": "更新后的消息",
  "content": "更新后的内容",
  "type": "important",
  "tags": ["短线策略", "全部用户"],
  "publishTime": null,
  "attachments": []
}
```

**参数说明**

所有参数都是可选的
- `publishTime` 传null表示立即发布
- `tags` 传null或空数组表示清除标签

**响应示例**

```json
{
  "code": 200,
  "message": "Message updated successfully",
  "data": {
    "id": 1,
    "title": "更新后的消息",
    "content": "更新后的内容",
    "type": "important",
    "tags": ["短线策略", "全部用户"],
    "groupId": "all",
    "sender": "管理员",
    "senderId": 1,
    "status": "published",
    "publishTime": null,
    "createdAt": "2026-01-29T00:00:00.000Z",
    "attachments": []
  }
}
```

---

### 2.5 删除消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id` |
| **请求方法** | DELETE |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 删除消息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Message deleted successfully",
  "data": null
}
```

---

### 2.6 标记消息已读

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id/read` |
| **请求方法** | POST |
| **认证方式** | Bearer Token |
| **接口说明** | 标记消息为已读状态 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Message marked as read",
  "data": null
}
```

---

### 2.7 收藏消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id/favorite` |
| **请求方法** | POST |
| **认证方式** | Bearer Token |
| **接口说明** | 收藏消息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Message favorited successfully",
  "data": {
    "id": 1,
    "messageId": 1,
    "userId": 1,
    "createdAt": "2026-02-12T00:00:00.000Z"
  }
}
```

---

### 2.8 取消收藏消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id/favorite` |
| **请求方法** | DELETE |
| **认证方式** | Bearer Token |
| **接口说明** | 取消收藏消息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Message unfavorited successfully",
  "data": null
}
```

---

### 2.9 获取收藏列表

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/favorites` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取当前用户的收藏列表 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Number | 否 | 页码，默认1 | 1 |
| limit | Number | 否 | 每页数量，默认10 | 10 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "messageId": 1,
      "userId": 1,
      "message": {
        "id": 1,
        "title": "测试消息",
        "content": "这是一条测试消息",
        "type": "daily",
        "createdAt": "2026-01-26T00:00:00.000Z"
      },
      "createdAt": "2026-02-12T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 2.10 置顶消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id/pin` |
| **请求方法** | POST |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 置顶消息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Message pinned successfully",
  "data": {
    "id": 1,
    "pinned": true,
    "pinnedAt": "2026-02-12T00:00:00.000Z"
  }
}
```

---

### 2.11 取消置顶消息

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/messages/:id/pin` |
| **请求方法** | DELETE |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 取消置顶消息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 消息ID | 1 |

**响应示例**

```json
{
  "code": 200,
  "message": "Message unpinned successfully",
  "data": {
    "id": 1,
    "pinned": false,
    "pinnedAt": null
  }
}
```

---

## 三、讨论接口

### 3.1 获取讨论列表

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/discussions` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取讨论列表，支持筛选 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| messageId | Number | 否 | 消息ID | 1 |
| status | String | 否 | 讨论状态 | "replied" |
| visibility | String | 否 | 可见性 | "private" |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "discussions": [
      {
        "id": 1,
        "messageId": 1,
        "messageTitle": "测试消息",
        "userId": 1,
        "userName": "管理员",
        "content": "这是一条讨论",
        "status": "replied",
        "visibility": "private",
        "createdAt": "2026-01-26T00:00:00.000Z",
        "updatedAt": "2026-01-26T00:00:00.000Z",
        "replies": [
          {
            "id": 1,
            "discussionId": 1,
            "userId": 1,
            "userName": "管理员",
            "content": "这是一条回复",
            "createdAt": "2026-01-26T00:00:00.000Z"
          }
        ]
      }
    ],
    "total": 1
  }
}
```

---

### 3.2 创建讨论

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/discussions` |
| **请求方法** | POST |
| **认证方式** | Bearer Token |
| **接口说明** | 创建新讨论 |

**请求参数**

```json
{
  "messageId": 1,
  "content": "这是一条新讨论",
  "visibility": "private"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| messageId | Number | 是 | 消息ID | 1 |
| content | String | 是 | 讨论内容 | "这是一条新讨论" |
| visibility | String | 否 | 可见性（public/private） | "private" |

**响应示例**

```json
{
  "code": 201,
  "message": "Discussion created successfully",
  "data": {
    "id": 2,
    "messageId": 1,
    "userId": 1,
    "content": "这是一条新讨论",
    "status": "pending",
    "visibility": "private",
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 3.3 回复讨论

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/discussions/:id/reply` |
| **请求方法** | POST |
| **认证方式** | Bearer Token |
| **接口说明** | 回复讨论 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 讨论ID | 1 |

**请求参数**

```json
{
  "content": "这是一条回复"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| content | String | 是 | 回复内容 | "这是一条回复" |

**响应示例**

```json
{
  "code": 201,
  "message": "Reply created successfully",
  "data": {
    "id": 2,
    "discussionId": 1,
    "userId": 1,
    "userName": "管理员",
    "content": "这是一条回复",
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 3.4 更新讨论可见性

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/discussions/:id/visibility` |
| **请求方法** | PUT |
| **认证方式** | Bearer Token（管理员权限或讨论创建者） |
| **接口说明** | 更新讨论可见性 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 讨论ID | 1 |

**请求参数**

```json
{
  "visibility": "public"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| visibility | String | 是 | 可见性 | public（公开）、private（私密） |

**响应示例**

```json
{
  "code": 200,
  "message": "Discussion visibility updated successfully",
  "data": {
    "id": 1,
    "visibility": "public",
    "updatedAt": "2026-02-12T00:00:00.000Z"
  }
}
```

---

## 四、用户接口

### 4.1 获取用户列表

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/users` |
| **请求方法** | GET |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 获取用户列表 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Number | 否 | 页码 | 1 |
| pageSize | Number | 否 | 每页数量 | 20 |
| role | String | 否 | 用户角色 | "vip_mid" |
| status | String | 否 | 用户状态 | "active" |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "管理员",
        "email": "admin@example.com",
        "role": "super_admin",
        "groupId": "all",
        "status": "active",
        "expireDate": null,
        "createdAt": "2026-01-26T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 4.2 创建用户

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/users` |
| **请求方法** | POST |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 创建新用户 |

**请求参数**

```json
{
  "name": "新用户",
  "email": "user@example.com",
  "password": "123456",
  "role": "vip_mid",
  "groupId": "mid",
  "status": "active",
  "expireDate": null
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 用户名 | "新用户" |
| email | String | 是 | 用户邮箱 | "user@example.com" |
| password | String | 是 | 密码（6-20位） | "123456" |
| role | String | 是 | 用户角色 | "vip_mid" |
| groupId | String | 是 | 分组ID | "mid" |
| status | String | 是 | 用户状态 | "active" |
| expireDate | String | 否 | 过期日期 | null |

**响应示例**

```json
{
  "code": 201,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "新用户",
    "email": "user@example.com",
    "role": "vip_mid",
    "groupId": "mid",
    "status": "active",
    "expireDate": null,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 4.3 更新用户

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/users/:id` |
| **请求方法** | PUT |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 更新用户信息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 用户ID | 2 |

**请求参数**

```json
{
  "name": "更新用户",
  "email": "user@example.com",
  "role": "vip_short",
  "groupId": "short",
  "status": "active",
  "expireDate": null
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "name": "更新用户",
    "email": "user@example.com",
    "role": "vip_short",
    "groupId": "short",
    "status": "active",
    "expireDate": null,
    "updatedAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 4.4 删除用户

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/users/:id` |
| **请求方法** | DELETE |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 删除用户 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 用户ID | 2 |

**响应示例**

```json
{
  "code": 200,
  "message": "User deleted successfully",
  "data": null
}
```

---

### 4.5 重置用户密码

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/users/:id/password` |
| **请求方法** | PUT |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 重置用户密码 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Number | 是 | 用户ID | 2 |

**请求参数**

```json
{
  "password": "new_password_123"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| password | String | 是 | 新密码（6-20位） | "new_password_123" |

**响应示例**

```json
{
  "code": 200,
  "message": "Password reset successfully",
  "data": null
}
```

---

## 五、分组接口

### 5.1 获取分组列表

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/groups` |
| **请求方法** | GET |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 获取所有分组 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": "all",
      "name": "全部用户",
      "description": "所有用户可见"
    },
    {
      "id": "mid",
      "name": "中线策略",
      "description": "中线策略用户"
    },
    {
      "id": "short",
      "name": "短线策略",
      "description": "短线策略用户"
    }
  ]
}
```

---

### 5.2 创建分组

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/groups` |
| **请求方法** | POST |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 创建新分组 |

**请求参数**

```json
{
  "id": "new_group",
  "name": "新分组",
  "description": "新分组描述"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | String | 是 | 分组ID（唯一标识） | "new_group" |
| name | String | 是 | 分组名称 | "新分组" |
| description | String | 是 | 分组描述 | "新分组描述" |

**响应示例**

```json
{
  "code": 201,
  "message": "Group created successfully",
  "data": {
    "id": "new_group",
    "name": "新分组",
    "description": "新分组描述"
  }
}
```

---

### 5.3 更新分组

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/groups/:id` |
| **请求方法** | PUT |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 更新分组信息 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | String | 是 | 分组ID | "new_group" |

**请求参数**

```json
{
  "name": "更新分组",
  "description": "更新分组描述"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 分组名称 | "更新分组" |
| description | String | 是 | 分组描述 | "更新分组描述" |

**响应示例**

```json
{
  "code": 200,
  "message": "Group updated successfully",
  "data": {
    "id": "new_group",
    "name": "更新分组",
    "description": "更新分组描述"
  }
}
```

---

### 5.4 删除分组

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/groups/:id` |
| **请求方法** | DELETE |
| **认证方式** | Bearer Token（超级管理员权限） |
| **接口说明** | 删除分组 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | String | 是 | 分组ID | "new_group" |

**响应示例**

```json
{
  "code": 200,
  "message": "Group deleted successfully",
  "data": null
}
```

---

## 六、统计接口

### 6.1 获取个人统计数据

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/stats/personal` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取当前用户的个人统计数据 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "totalMessages": 100,
    "readMessages": 80,
    "favoriteMessages": 10,
    "userDiscussions": 5
  }
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| totalMessages | Number | 总消息数 | 100 |
| readMessages | Number | 已读消息数 | 80 |
| favoriteMessages | Number | 收藏消息数 | 10 |
| userDiscussions | Number | 讨论数 | 5 |

---

### 6.2 获取消息趋势

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/stats/message-trend` |
| **请求方法** | GET |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 获取消息发布趋势数据 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| period | String | 否 | 时间周期 | today、7days、30days、90days |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "2026-01-20": 10,
    "2026-01-21": 15,
    "2026-01-22": 8,
    "2026-01-23": 12,
    "2026-01-24": 20,
    "2026-01-25": 18,
    "2026-01-26": 25
  }
}
```

**字段说明**

返回一个对象，key为日期（YYYY-MM-DD），value为该日消息数量。

---

### 6.3 获取消息类型分布

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/stats/message-type-distribution` |
| **请求方法** | GET |
| **认证方式** | Bearer Token（管理员权限） |
| **接口说明** | 获取消息类型分布统计 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "daily": 50,
    "important": 20,
    "system": 10,
    "pre_market_comment": 5,
    "morning_comment": 5,
    "afternoon_comment": 3,
    "close_comment": 7
  }
}
```

**字段说明**

返回一个对象，key为消息类型，value为该类型的消息数量。

---

## 七、市场数据接口

### 7.1 获取市场指数行情

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/market/ticker` |
| **请求方法** | GET |
| **认证方式** | Bearer Token |
| **接口说明** | 获取主要市场指数的实时行情 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "code": "999999",
      "setcode": "1",
      "name": "上证指数",
      "close": 3000.00,
      "now": 3050.00,
      "vol": 100000000,
      "EXT_ZF": "1.67"
    },
    {
      "code": "399001",
      "setcode": "0",
      "name": "深证成指",
      "close": 10000.00,
      "now": 10150.00,
      "vol": 80000000,
      "EXT_ZF": "1.50"
    },
    {
      "code": "399300",
      "setcode": "1",
      "name": "沪深300",
      "close": 3500.00,
      "now": 3535.00,
      "vol": 90000000,
      "EXT_ZF": "1.00"
    }
  ]
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| code | String | 指数代码 | "999999" |
| setcode | String | 市场代码（1=沪市, 0=深市） | "1" |
| name | String | 指数名称 | "上证指数" |
| close | Number | 昨收价 | 3000.00 |
| now | Number | 现价 | 3050.00 |
| vol | Number | 成交量 | 100000000 |
| EXT_ZF | String | 涨跌幅(%) | "1.67" |

---

### 7.2 获取市场异动数据（规划中）

**接口说明**

此接口用于获取市场实时异动信息，包括板块异动、题材异动等。功能已规划，待后续开发实现。

**外部API信息**

| 项目 | 内容 |
|------|------|
| 接口地址 | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBPzxh` |
| 请求方法 | POST |
| Content-Type | application/json |

**请求参数**

```json
{
  "Head": {
    "Target": 0
  },
  "Type": "2",
  "LastHMS": "0",
  "WantPos": "0",
  "Date": "0"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| Head.Target | Number | 是 | 目标值，默认0 | 0 |
| Type | String | 是 | 数据类型，"2"表示获取异动数据 | "2" |
| LastHMS | String | 是 | 上次查询时间，"0"表示从头开始 | "0" |
| WantPos | String | 是 | 期望位置，"0"表示从头获取 | "0" |
| Date | String | 是 | 日期，"0"表示当天 | "0" |

**返回数据示例**

```json
{
  "Type": 1,
  "PzListDate": 20260303,
  "LastAnsPos": 1047,
  "GetNum": 5,
  "List": [
    {
      "SignalType": 8,
      "SignalTime": 930,
      "Name": "精装修",
      "SignalDesc": "高开",
      "Data": 1.51748312,
      "SetCode3": "1",
      "Code1": "002271",
      "Zaf1": 0.0272109229,
      "Name1": "东方雨虹",
      "SetCode2": 1,
      "Code2": "603737",
      "Zaf2": 0.0148340845,
      "Name2": "三棵树",
      "SetCode1": 1,
      "Code3": "002043",
      "Zaf3": 0.0418181866,
      "Name3": "兔 宝 宝"
    }
  ]
}
```

**返回字段说明**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| Type | Number | 返回数据类型 |
| PzListDate | Number | 数据日期 |
| LastAnsPos | Number | 最后位置标识，用于分页查询 |
| GetNum | Number | 返回数据条数 |
| List | Array | 异动数据列表 |
| List[].SignalType | Number | 异动类型代码 |
| List[].SignalTime | Number | 异动时间（格式：HHMM，如930表示09:30） |
| List[].Name | String | 板块/主题名称 |
| List[].SignalDesc | String | 异动原因描述 |
| List[].Data | Number | 板块/主题涨跌幅（小数形式） |
| List[].SetCode1/2/3 | Number | 市场代码（1=沪市，0=深市） |
| List[].Code1/2/3 | String | 成分股股票代码 |
| List[].Zaf1/2/3 | Number | 成分股涨跌幅（小数形式） |
| List[].Name1/2/3 | String | 成分股名称 |

**异动类型说明**

| SignalType | 说明 |
|------------|------|
| 8 | 板块异动 |
| 其他类型 | 待补充 |

**异动原因说明**

| SignalDesc | 说明 |
|------------|------|
| 高开 | 开盘价高于昨收价 |
| 快速上涨 | 短时间内快速拉升 |
| 其他原因 | 待补充 |

**规划功能**

1. 实时监控市场异动
2. 异动推送提醒
3. 异动历史查询
4. 板块异动分析
5. 个股异动关联分析

**开发优先级**: 中（待核心功能完善后开发）

---

## 八、文件上传接口

### 8.1 上传图片

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/upload` |
| **请求方法** | POST |
| **Content-Type** | multipart/form-data |
| **认证方式** | Bearer Token |
| **接口说明** | 上传图片文件 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 图片文件 |

**支持的格式**

- 图片格式：jpeg, jpg, png, gif, webp
- 文件大小：单个文件不超过10MB

**响应示例**

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/images/img-1234567890.jpg",
    "filename": "img-1234567890.jpg",
    "originalname": "test.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| url | String | 文件访问URL | "/uploads/images/img-1234567890.jpg" |
| filename | String | 保存的文件名 | "img-1234567890.jpg" |
| originalname | String | 原始文件名 | "test.jpg" |
| size | Number | 文件大小（字节） | 1024000 |
| mimetype | String | MIME类型 | "image/jpeg" |

**调用示例**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
const data = await response.json();
console.log(data.data.url);
```

---

## 九、健康检查

### 9.1 检查API状态

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口路径** | `/health` |
| **请求方法** | GET |
| **认证方式** | 无需认证 |
| **接口说明** | 检查API服务状态 |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "status": "ok",
    "timestamp": "2026-01-26T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## 错误码说明

### 通用错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 201 | 创建成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权 | 检查认证token是否有效 |
| 403 | 禁止访问 | 检查用户权限 |
| 404 | 资源不存在 | 检查请求路径和资源ID |
| 500 | 服务器内部错误 | 联系后端团队 |

### 业务错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 1001 | 用户不存在 | 检查用户ID |
| 1002 | 密码错误 | 重新输入密码 |
| 1003 | 用户已存在 | 更换邮箱或用户名 |
| 2001 | 消息不存在 | 检查消息ID |
| 2002 | 无权限操作此消息 | 检查用户权限 |
| 3001 | 分组不存在 | 检查分组ID |
| 3002 | 分组ID已存在 | 更换分组ID |
| 4001 | 文件格式不支持 | 检查文件格式 |
| 4002 | 文件大小超限 | 压缩文件或减小文件大小 |

### 错误响应示例

```json
{
  "code": 400,
  "message": "Bad request",
  "data": null
}
```

```json
{
  "code": 401,
  "message": "Unauthorized",
  "data": null
}
```

```json
{
  "code": 404,
  "message": "Not found",
  "data": null
}
```

```json
{
  "code": 500,
  "message": "Server error",
  "data": null
}
```

---

## 变更日志

### v1.0.0 (2026-03-04)
- 🎉 初始版本，整合核心业务接口
- ✅ 认证接口：登录、获取用户信息
- ✅ 消息接口：完整的CRUD和增强功能
- ✅ 讨论接口：讨论、回复、可见性管理
- ✅ 用户接口：用户管理、密码重置
- ✅ 分组接口：分组CRUD
- ✅ 统计接口：个人统计、趋势分析
- ✅ 市场数据接口：指数行情、市场异动（规划中）
- ✅ 文件上传接口：图片上传
- ✅ 健康检查：API状态检查
- 📝 统一响应格式和错误码

---

**相关文档**
- [01-financial-data-api.md](./01-financial-data-api.md) - 金融数据接口
- [02-trading-board-api.md](./02-trading-board-api.md) - 打板功能接口
- [03-ai-assistant-api.md](./03-ai-assistant-api.md) - AI助手接口
- [05-sse-events.md](./05-sse-events.md) - SSE事件说明
