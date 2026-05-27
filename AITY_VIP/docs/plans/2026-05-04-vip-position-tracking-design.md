# VIP 持仓追踪功能设计文档

> 日期：2026-05-04 | 状态：已批准 | 版本：v1.0

## 一、需求概述

VIP 用户需要能够自主记录持仓情况并提出交易问题，管理员（投顾）可以回复建议，且回复分为公开（所有人可见）和私密（仅发帖人可见）两种。

核心目标：
- VIP 用户可独立发帖（不依赖管理员消息），帖子永久留存不被覆盖
- 管理员回复精确控制隐私级别（公开/仅对发帖人）
- 与现有的「互动交流」讨论系统统一，不拆分新模块

## 二、设计原则

- **同一系统**：持仓帖和普通讨论共用 `discussions` 表，通过 `message_id` 是否为空区分
- **最小改动**：不改 API 路由结构，扩展现有接口
- **体验自然**：用户不需要学习新入口，在「讨论」tab 中通过筛选切换

## 三、数据库变更

### 3.1 discussions 表 — message_id 改为可空

```sql
ALTER TABLE discussions
  MODIFY COLUMN message_id INT NULL
  COMMENT '关联消息ID，NULL表示自主发帖（持仓帖）';
```

### 3.2 discussion_replies 表 — 增加隐私字段

```sql
ALTER TABLE discussion_replies
  ADD COLUMN is_private TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1=私密回复(仅管理员和发帖人可见), 0=公开(所有人可见)';
```

## 四、后端修改

### 4.1 Discussion.js 模型

- `messageId` 的 `allowNull` 从 `false` 改为 `true`

### 4.2 DiscussionReply.js 模型

- 新增 `isPrivate` 字段，类型 `TINYINT(1)`，默认 `0`

### 4.3 discussionController.js

| 接口 | 改动 |
|------|------|
| POST `/discussions` | `messageId` 变为可选参数 |
| POST `/discussions/:id/replies` | 支持 `isPrivate` 参数（仅管理员可传） |
| GET `/discussions/:id/replies` | 按用户角色过滤：非管理员/非发帖人 → 只返回 is_private=0 的回复 |
| GET `/discussions` | 支持 `category` 筛选（如 `position`） |

### 4.4 隐私过滤逻辑

```javascript
// GET /discussions/:id/replies
const replies = await getReplies(discussionId)

// 过滤私密回复
const isAdmin = user.role === 'admin' || user.role === 'super_admin'
const isPoster = discussion.userId === user.id

const filtered = replies.filter(reply => {
  if (reply.isPrivate) {
    return isAdmin || isPoster  // 仅管理员和发帖人可见
  }
  return true  // 公开回复所有人可见
})
```

## 五、前端修改

### 5.1 创建讨论页 (create-discussion.vue)

- 顶部增加「讨论类型」选择：
  - [💬 互动交流]（需选关联消息，行为不变）
  - [📊 持仓帖]（不需选消息，新增股票代码输入）

- 持仓帖模式下：
  - 隐藏「选择关联消息」区域
  - 显示「股票代码输入框」
  - 标题自动生成如「5/4 持仓记录」，用户可修改

### 5.2 讨论详情页 (discussion-detail.vue)

- **管理员回复区**：无论讨论公开还是私密，都显示两个按钮：
  - [🔓 公开回复] — `is_private: false`
  - [🔒 私密回复] — `is_private: true`

- **回复列表显示规则**：
  | 用户角色 | 可见回复 |
  |---------|---------|
  | 管理员（你） | 全部回复，私密回复带 🔒 标记 |
  | 发帖人 | 全部公开回复 + 自己的私密回复 |
  | 其他用户 | 仅公开回复 |

### 5.3 讨论列表页 (discussions.vue)

- 筛选栏增加「持仓帖」选项
- 列表项：持仓帖显示关联股票标签，不显示「关于：XXX消息」
- 排序：待回复的置顶

## 六、数据流

```
用户打开"讨论"tab
  │
  ├── 点击"创建持仓帖"
  │     ├── 输入标题/持仓描述/股票代码
  │     └── POST /discussions (message_id=NULL, category='position')
  │
  └── 进入帖子详情
        ├── 看到公开回复列表
        ├── 发帖人：还能看到自己的私密回复
        └── 管理员回复时：
              [公开回复] → POST /discussions/:id/replies (is_private=false)
              [私密回复] → POST /discussions/:id/replies (is_private=true)
```

## 七、不做的事情

- ❌ 不新建表
- ❌ 不新建页面
- ❌ 不改 tabBar
- ❌ 不改 API 路由结构

## 八、改动清单

| # | 文件 | 改动类型 |
|---|------|---------|
| 1 | `backend/.../models/Discussion.js` | messageId → allowNull |
| 2 | `backend/.../models/DiscussionReply.js` | + isPrivate 字段 |
| 3 | `backend/.../controllers/discussionController.js` | +隐私过滤 + 可选messageId |
| 4 | `aity-uni-app-v2/.../create-discussion.vue` | +持仓帖模式 |
| 5 | `aity-uni-app-v2/.../discussion-detail.vue` | +双按钮 + 隐私显示 |
| 6 | `aity-uni-app-v2/.../discussions.vue` | +持仓帖筛选 |
| 7 | 数据库迁移 SQL | 2条 ALTER TABLE |
