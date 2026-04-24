# API文档

## 基础信息

### 基础URL
- 开发环境：http://localhost:3001/api
- 生产环境：https://aity88.online:8443/api

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

## 认证接口

### 登录

**请求**：
- URL: `/auth/login`
- 方法: `POST`
- 参数:
  ```json
  {
    "email": "admin@example.com",
    "password": "123456"
  }
  ```

**响应**：
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

### 获取用户信息

**请求**：
- URL: `/auth/me`
- 方法: `GET`
- 认证: 需要

**响应**：
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

## 消息接口

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

消息标签用于权限控制，支持以下标签：

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

### 获取消息列表

**请求**：
- URL: `/messages`
- 方法: `GET`
- 认证: 需要
- 参数:
  - `page` (可选): 页码，默认1
  - `limit` (可选): 每页数量，默认10
  - `type` (可选): 消息类型（见上方消息类型说明）
  - `groupId` (可选): 分组ID
  - `status` (可选): 消息状态（仅管理员可用）

**响应**：
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

### 获取消息详情

**请求**：
- URL: `/messages/:id`
- 方法: `GET`
- 认证: 需要

**响应**：
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

### 创建消息

**请求**：
- URL: `/messages`
- 方法: `POST`
- 认证: 需要（管理员权限）
- 参数:
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

**参数说明：**
- `title` (必填): 消息标题
- `content` (必填): 消息内容
- `type` (必填): 消息类型（见消息类型说明）
- `groupId` (必填): 分组ID
- `tags` (可选): 消息标签数组
- `publishTime` (可选): 定时发布时间（ISO8601格式），不传或传null表示立即发布
- `attachments` (可选): 附件数组

**响应**：
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

### 更新消息

**请求**：
- URL: `/messages/:id`
- 方法: `PUT`
- 认证: 需要（管理员权限）
- 参数:
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

**参数说明：**
- 所有参数都是可选的
- `publishTime` 传null表示立即发布
- `tags` 传null或空数组表示清除标签

**响应**：
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

### 删除消息

**请求**：
- URL: `/messages/:id`
- 方法: `DELETE`
- 认证: 需要（管理员权限）

**响应**：
```json
{
  "code": 200,
  "message": "Message deleted successfully",
  "data": null
}
```

### 消息增强功能

#### 标记消息已读

**请求**：
- URL: `/messages/:id/read`
- 方法: `POST`
- 认证: 需要

**响应**：
```json
{
  "code": 200,
  "message": "Message marked as read",
  "data": null
}
```

#### 收藏消息

**请求**：
- URL: `/messages/:id/favorite`
- 方法: `POST`
- 认证: 需要

**响应**：
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

#### 取消收藏

**请求**：
- URL: `/messages/:id/favorite`
- 方法: `DELETE`
- 认证: 需要

**响应**：
```json
{
  "code": 200,
  "message": "Message unfavorited successfully",
  "data": null
}
```

#### 获取收藏列表

**请求**：
- URL: `/favorites`
- 方法: `GET`
- 认证: 需要
- 参数:
  - `page` (可选): 页码，默认1
  - `limit` (可选): 每页数量，默认10

**响应**：
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

#### 置顶消息

**请求**：
- URL: `/messages/:id/pin`
- 方法: `POST`
- 认证: 需要（管理员权限）

**响应**：
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

#### 取消置顶

**请求**：
- URL: `/messages/:id/pin`
- 方法: `DELETE`
- 认证: 需要（管理员权限）

**响应**：
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

## 讨论接口

### 获取讨论列表

**请求**：
- URL: `/discussions`
- 方法: `GET`
- 认证: 需要
- 参数:
  - `messageId` (可选): 消息ID
  - `status` (可选): 讨论状态
  - `visibility` (可选): 可见性

**响应**：
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

### 创建讨论

**请求**：
- URL: `/discussions`
- 方法: `POST`
- 认证: 需要
- 参数:
  ```json
  {
    "messageId": 1,
    "content": "这是一条新讨论",
    "visibility": "private"
  }
  ```

**响应**：
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

### 回复讨论

**请求**：
- URL: `/discussions/:id/reply`
- 方法: `POST`
- 认证: 需要
- 参数:
  ```json
  {
    "content": "这是一条回复"
  }
  ```

**响应**：
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

### 讨论增强功能

#### 获取讨论回复列表

**请求**：
- URL: `/discussions/:id/replies`
- 方法: `GET`
- 认证: 需要
- 参数:
  - `page` (可选): 页码，默认1
  - `limit` (可选): 每页数量，默认10

**响应**：
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "discussionId": 1,
      "userId": 1,
      "userName": "管理员",
      "content": "这是一条回复",
      "createdAt": "2026-01-26T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### 更新讨论可见性

**请求**：
- URL: `/discussions/:id/visibility`
- 方法: `PUT`
- 认证: 需要（管理员权限或讨论创建者）
- 参数:
  ```json
  {
    "visibility": "public"
  }
  ```

**参数说明**：
- `visibility` (必填): 可见性
  - `public`: 公开讨论，所有人可见
  - `private`: 私密讨论，仅创建者和管理员可见

**响应**：
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

## 市场数据接口

### 获取市场指数行情

**请求**：
- URL: `/market/ticker`
- 方法: `GET`
- 认证: 需要

**响应**：
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

**字段说明**：
- `code`: 指数代码
- `setcode`: 市场代码 (1=沪市, 0=深市)
- `name`: 指数名称
- `close`: 昨收价
- `now`: 现价
- `vol`: 成交量
- `EXT_ZF`: 涨跌幅(%)

### 获取市场异动数据（规划中）

**接口说明**：
此接口用于获取市场实时异动信息，包括板块异动、题材异动等。功能已规划，待后续开发实现。

**外部API信息**：
- 接口地址：`http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBPzxh`
- 请求方法：`POST`
- Content-Type：`application/json`

**请求参数**：
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

**参数说明**：
- `Head.Target`: 目标值，默认0
- `Type`: 数据类型，"2"表示获取异动数据
- `LastHMS`: 上次查询时间，"0"表示从头开始
- `WantPos`: 期望位置，"0"表示从头获取
- `Date`: 日期，"0"表示当天

**返回数据示例**：
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

**返回字段说明**：
- `Type`: 返回数据类型
- `PzListDate`: 数据日期
- `LastAnsPos`: 最后位置标识，用于分页查询
- `GetNum`: 返回数据条数
- `List`: 异动数据列表
  - `SignalType`: 异动类型代码
  - `SignalTime`: 异动时间（格式：HHMM，如930表示09:30）
  - `Name`: 板块/主题名称
  - `SignalDesc`: 异动原因描述（如：高开、快速上涨等）
  - `Data`: 板块/主题涨跌幅（小数形式）
  - `SetCode1/2/3`: 市场代码（1=沪市，0=深市）
  - `Code1/2/3`: 成分股股票代码
  - `Zaf1/2/3`: 成分股涨跌幅（小数形式）
  - `Name1/2/3`: 成分股名称

**异动类型说明**：
| SignalType | 说明 |
|------------|------|
| 8 | 板块异动 |
| 其他类型 | 待补充 |

**异动原因说明**：
| SignalDesc | 说明 |
|------------|------|
| 高开 | 开盘价高于昨收价 |
| 快速上涨 | 短时间内快速拉升 |
| 其他原因 | 待补充 |

**规划功能**：
1. 实时监控市场异动
2. 异动推送提醒
3. 异动历史查询
4. 板块异动分析
5. 个股异动关联分析

**开发优先级**：中（待核心功能完善后开发）

## 文件上传接口

### 上传图片

**请求**：
- URL: `/upload`
- 方法: `POST`
- 认证: 需要
- Content-Type: `multipart/form-data`
- 参数:
  - `file`: 图片文件

**支持的格式**：
- 图片格式：jpeg, jpg, png, gif, webp
- 文件大小：单个文件不超过10MB

**响应**：
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

## 用户接口

### 获取用户列表

**请求**：
- URL: `/users`
- 方法: `GET`
- 认证: 需要（超级管理员权限）
- 参数:
  - `page` (可选): 页码
  - `pageSize` (可选): 每页数量
  - `role` (可选): 用户角色
  - `status` (可选): 用户状态

**响应**：
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

### 创建用户

**请求**：
- URL: `/users`
- 方法: `POST`
- 认证: 需要（超级管理员权限）
- 参数:
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

**响应**：
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

### 更新用户

**请求**：
- URL: `/users/:id`
- 方法: `PUT`
- 认证: 需要（超级管理员权限）
- 参数:
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

**响应**：
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

### 删除用户

**请求**：
- URL: `/users/:id`
- 方法: `DELETE`
- 认证: 需要（超级管理员权限）

**响应**：
```json
{
  "code": 200,
  "message": "User deleted successfully",
  "data": null
}
```

### 重置用户密码

**请求**：
- URL: `/users/:id/password`
- 方法: `PUT`
- 认证: 需要（超级管理员权限）
- 参数:
  ```json
  {
    "password": "new_password_123"
  }
  ```

**参数说明**：
- `password` (必填): 新密码，长度6-20位

**响应**：
```json
{
  "code": 200,
  "message": "Password reset successfully",
  "data": null
}
```

## 分组接口

### 获取分组列表

**请求**：
- URL: `/groups`
- 方法: `GET`
- 认证: 需要（管理员权限）

**响应**：
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

### 创建分组

**请求**：
- URL: `/groups`
- 方法: `POST`
- 认证: 需要（超级管理员权限）
- 参数:
  ```json
  {
    "id": "new_group",
    "name": "新分组",
    "description": "新分组描述"
  }
  ```

**响应**：
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

### 更新分组

**请求**：
- URL: `/groups/:id`
- 方法: `PUT`
- 认证: 需要（超级管理员权限）
- 参数:
  ```json
  {
    "name": "更新分组",
    "description": "更新分组描述"
  }
  ```

**响应**：
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

### 删除分组

**请求**：
- URL: `/groups/:id`
- 方法: `DELETE`
- 认证: 需要（超级管理员权限）

**响应**：
```json
{
  "code": 200,
  "message": "Group deleted successfully",
  "data": null
}
```

## 统计接口

### 获取个人统计数据

**请求**：
- URL: `/stats/personal`
- 方法: `GET`
- 认证: 需要

**响应**：
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

### 获取消息趋势

**请求**：
- URL: `/stats/message-trend`
- 方法: `GET`
- 认证: 需要（管理员权限）
- 参数:
  - `period` (可选): 时间周期 (today, 7days, 30days, 90days)

**响应**：
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

### 获取消息类型分布

**请求**：
- URL: `/stats/message-type-distribution`
- 方法: `GET`
- 认证: 需要（管理员权限）

**响应**：
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

## 健康检查

### 检查API状态

**请求**：
- URL: `/health`
- 方法: `GET`

**响应**：
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

## 错误处理

### 常见错误响应

**400 Bad Request**
```json
{
  "code": 400,
  "message": "Bad request",
  "data": null
}
```

**401 Unauthorized**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "data": null
}
```

**403 Forbidden**
```json
{
  "code": 403,
  "message": "Forbidden",
  "data": null
}
```

**404 Not Found**
```json
{
  "code": 404,
  "message": "Not found",
  "data": null
}
```

**500 Internal Server Error**
```json
{
  "code": 500,
  "message": "Server error",
  "data": null
}
```

## 版本历史
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.2.0 | 2026-03-03 | 新增市场异动数据接口（规划中）、打板功能API接口索引 |
| v1.1.0 | 2026-02-12 | 新增消息增强功能（收藏、置顶、已读）、讨论增强功能、市场数据接口、文件上传接口、用户密码重置 |
| v1.0.0 | 2026-01-26 | 初始版本 |