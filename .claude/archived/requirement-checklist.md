# 需求符合性检查清单

> **适用范围**：AITY VIP 项目需求符合性检查
> **需求文档**：docs/需求文档.md
> **检查目的**：确保代码实现符合需求文档要求
> **集成目标**：与字节跳动 Trae 编辑器无缝集成，支持 Skill 功能

---

## 🎯 用户角色和权限

### ✅ 必须实现

- [ ] 用户角色定义正确（super_admin, admin, vip_mid, vip_short, trial）
- [ ] 角色权限矩阵正确实现
- [ ] 用户状态管理（active/inactive）
- [ ] 用户过期日期功能
- [ ] 体验用户到期后账号变为inactive状态

### 🔍 检查要点

**文件位置**：`backend/src/models/User.js`

```javascript
role: {
  type: DataTypes.ENUM('super_admin', 'admin', 'vip_mid', 'vip_short', 'trial'),
  allowNull: false,
  defaultValue: 'trial'
}
```

**验证**：
- 角色枚举值是否完整
- 默认值是否为trial

---

## 🏷️ 消息标签（权限控制）

### ✅ 必须实现

- [ ] 消息标签定义正确（短线策略、中线策略、全部用户）
- [ ] 消息标签可以多选
- [ ] 多选时满足任一标签的用户都能看到
- [ ] trial用户不受消息标签限制
- [ ] vip_mid只能查看中线策略或全部用户的消息
- [ ] vip_short只能查看短线策略或全部用户的消息

### 🔍 检查要点

**文件位置**：`backend/src/models/Message.js`

```javascript
tags: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: null,
  comment: '消息标签数组，如 ["短线策略", "中线策略", "全部用户"]'
}
```

**文件位置**：`backend/src/controllers/messageController.js`

```javascript
// 标签权限过滤（trial用户和管理员不受限制）
if (currentUser.role !== 'trial' && currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
  const allowedTags = currentUser.role === 'vip_mid'
    ? ['中线策略', '全部用户']
    : ['短线策略', '全部用户'];
  
  andConditions.push({
    [Op.or]: [
      { tags: null },
      sequelize.where(
        sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTags[0])),
        1
      ),
      sequelize.where(
        sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(allowedTags[1])),
        1
      )
    ]
  });
}
```

**验证**：
- 标签值是否为中文（不是英文）
- 权限过滤逻辑是否正确
- trial用户是否不受限制

---

## 📰 消息类型（内容分类）

### ✅ 必须实现

- [ ] 消息类型定义完整（10种类型）
- [ ] 消息类型可以多选
- [ ] 消息类型必填，默认选择"日常消息"
- [ ] 消息类型用中文显示

### 🔍 检查要点

**文件位置**：`backend/src/models/Message.js`

```javascript
type: {
  type: DataTypes.ENUM(
    'pre_market_comment',    // 盘前点评
    'morning_comment',       // 早盘点评
    'morning_focus',         // 早盘关注
    'afternoon_comment',     // 尾盘点评
    'afternoon_focus',       // 尾盘关注
    'close_comment',         // 收盘点评
    'risk_warning',          // 风险提示
    'system',                // 系统消息
    'important',             // 重要消息
    'daily'                  // 日常消息
  ),
  allowNull: false,
  defaultValue: 'daily'
}
```

**文件位置**：`aity-uni-app-new/src/utils/constants.js`

```javascript
export const MESSAGE_TYPE_LABELS = {
  [MESSAGE_TYPES.PRE_MARKET_COMMENT]: '盘前点评',
  [MESSAGE_TYPES.MORNING_COMMENT]: '早盘点评',
  [MESSAGE_TYPES.MORNING_FOCUS]: '早盘关注',
  [MESSAGE_TYPES.AFTERNOON_COMMENT]: '尾盘点评',
  [MESSAGE_TYPES.AFTERNOON_FOCUS]: '尾盘关注',
  [MESSAGE_TYPES.CLOSE_COMMENT]: '收盘点评',
  [MESSAGE_TYPES.RISK_WARNING]: '风险提示',
  [MESSAGE_TYPES.SYSTEM]: '系统消息',
  [MESSAGE_TYPES.IMPORTANT]: '重要消息',
  [MESSAGE_TYPES.DAILY]: '日常消息'
}
```

**验证**：
- 消息类型枚举值是否完整（10种）
- 默认值是否为daily
- 前端标签映射是否为中文

---

## 📤 消息发布规则

### ✅ 必须实现

- [ ] 支持实时发布（立即发布）
- [ ] 支持定时发布（设置发布时间）
- [ ] 定时发布精确到分钟
- [ ] 定时发布的消息可以取消
- [ ] 到了可查看时间，有权限的用户就可以查看

### 🔍 检查要点

**文件位置**：`backend/src/models/Message.js`

```javascript
publishTime: {
  type: DataTypes.DATE,
  field: 'publish_time',
  allowNull: true,
  defaultValue: null,
  comment: '定时发布时间，null表示立即发布'
},
status: {
  type: DataTypes.ENUM('draft', 'scheduled', 'published'),
  allowNull: false,
  defaultValue: 'published',
  comment: 'draft:草稿, scheduled:定时发布, published:已发布'
}
```

**文件位置**：`backend/src/controllers/messageController.js`

```javascript
// 确定消息状态
let messageStatus = 'published';
let messagePublishTime = null;

if (publishTime) {
  const publishDate = new Date(publishTime);
  const now = new Date();

  if (publishDate > now) {
    // 定时发布
    messageStatus = 'scheduled';
    messagePublishTime = publishDate;
  }
}
```

**验证**：
- publishTime字段是否支持null
- status字段是否支持三种状态
- 定时发布逻辑是否正确

---

## 💬 讨论功能

### ✅ 必须实现

- [ ] 讨论状态定义（pending, replied）
- [ ] 讨论可见性定义（private, public）
- [ ] 所有登录用户都可以发起讨论
- [ ] 讨论必须关联消息
- [ ] 讨论默认可见性是private
- [ ] 只有管理员和发起讨论的用户能看到私密讨论
- [ ] 管理员可以修改讨论可见性
- [ ] 私密讨论只有管理员可以回复
- [ ] 公开讨论所有登录用户都可以回复
- [ ] 讨论状态自动变化（有人回复后自动变为已回复）
- [ ] 讨论列表按创建时间倒序排序

### 🔍 检查要点

**文件位置**：`backend/src/models/Discussion.js`

```javascript
status: {
  type: DataTypes.ENUM('pending', 'replied'),
  allowNull: false,
  defaultValue: 'pending'
},
visibility: {
  type: DataTypes.ENUM('private', 'public'),
  allowNull: false,
  defaultValue: 'private',
  comment: 'private: 只有管理员和发起者可见, public: 所有人可见'
}
```

**文件位置**：`backend/src/controllers/discussionController.js`

```javascript
// 创建讨论 - 默认可见性为私密，状态为待回复
const discussion = await Discussion.create({
  messageId,
  userId,
  userName: user.name,
  title,
  content,
  visibility,
  status: 'pending'
});

// 更新讨论状态和可见性
const updateData = { status: 'replied' };

if ((senderRole === 'super_admin' || senderRole === 'admin') && visibility) {
  // 只有管理员可以修改可见性
  updateData.visibility = visibility;
}

await discussion.update(updateData);
```

**验证**：
- 默认可见性是否为private
- 默认状态是否为pending
- 权限检查是否正确
- 状态自动变化逻辑是否正确

---

## 📊 统计功能

### ✅ 必须实现

- [ ] 统计功能只对super_admin和admin开放
- [ ] trial用户不能查看统计数据
- [ ] 消息数量趋势统计
- [ ] 消息类型分布统计（所有10种类型）
- [ ] 消息标签分布统计
- [ ] 用户活跃度统计
- [ ] 消息阅读率统计
- [ ] 讨论数量趋势统计
- [ ] 讨论回复率统计
- [ ] 分组用户数统计
- [ ] 用户增长趋势统计
- [ ] 支持多种时间范围（今天、7天、30天、90天、自定义）
- [ ] 统计数据支持导出Excel

### 🔍 检查要点

**文件位置**：`backend/src/routes/statsRoutes.js`

```javascript
// 获取个人统计数据
router.get('/personal', authenticateToken, checkAdmin, statsController.getPersonalStats);

// 获取消息阅读趋势
router.get('/message-trend', authenticateToken, checkAdmin, statsController.getMessageTrend);

// 获取消息类型分布
router.get('/message-type-distribution', authenticateToken, checkAdmin, statsController.getMessageTypeDistribution);
```

**验证**：
- 所有统计接口是否都使用了checkAdmin中间件
- trial用户是否无法访问统计数据
- 统计指标是否完整

---

## 🔐 登录和安全

### ✅ 必须实现

- [ ] 支持使用用户名或邮箱+密码登录
- [ ] 不需要验证码
- [ ] 需要"记住我"功能
- [ ] Token有效期24小时
- [ ] 密码复杂度要求：至少6位
- [ ] 密码永不过期
- [ ] 用户邮箱只有管理员可见
- [ ] 用户手机号只有管理员可见
- [ ] 用户真实姓名只有管理员可见

### 🔍 检查要点

**文件位置**：`backend/src/controllers/authController.js`

```javascript
// 尝试从数据库查找用户
let user;
if (email) {
  user = await User.findOne({ where: { email } });
} else if (username) {
  user = await User.findOne({ where: { name: username } });
}

// 生成真实的JWT Token
const token = generateToken({ id: user.id, email: user.email, role: user.role });
```

**文件位置**：`backend/src/middleware/validation.js`

```javascript
function validateLogin() {
  return [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ];
}
```

**验证**：
- 是否支持用户名或邮箱登录
- 密码最小长度是否为6位
- Token有效期是否为24小时

---

## 🎨 UI/UX细节

### ✅ 必须实现

- [ ] 不支持主题切换，只有深色主题
- [ ] 主色调不可以自定义
- [ ] 响应式设计（PC、笔记本、平板、手机）
- [ ] 消息列表支持无限滚动
- [ ] 消息列表每页显示20条
- [ ] 消息详情页支持返回列表
- [ ] 富文本编辑器支持Markdown语法
- [ ] 图片上传大小限制：10MB
- [ ] 图片上传格式限制：JPG、PNG、GIF

### 🔍 检查要点

**文件位置**：`aity-uni-app-new/src/pages/messages/messages.vue`

```javascript
const { page = 1, limit = 20 } = req.query;
const offset = (page - 1) * limit;
```

**验证**：
- 消息列表每页是否显示20条
- 是否支持无限滚动
- 响应式设计是否完整

---

## 📱 小程序功能

### ✅ 必须实现

- [ ] 小程序需要包含所有Web端功能
- [ ] 小程序需要登录
- [ ] 小程序需要推送通知
- [ ] 小程序需要离线功能，支持离线查看消息
- [ ] 小程序需要分享功能，支持分享到微信

### 🔍 检查要点

**验证**：
- 小程序端是否包含所有功能
- 是否实现了推送通知
- 是否实现了离线功能
- 是否实现了分享功能

---

## 📝 其他补充

### ✅ 必须实现

- [ ] 需要消息通知，新消息时通知
- [ ] 通知方式：浏览器通知
- [ ] 搜索功能（消息标题、内容、标签、讨论内容）
- [ ] 搜索支持模糊匹配
- [ ] 导出功能（消息、讨论、统计数据）
- [ ] 导出格式：Excel
- [ ] 用户查看消息后自动标记为已读
- [ ] 已读状态主要用于统计阅读率
- [ ] 已读状态可以作为筛选条件
- [ ] 每个人只能编辑自己发布的消息
- [ ] 管理员不需要编辑他人的消息，但有删除的权限
- [ ] super_admin可以删除所有消息
- [ ] admin可以删除自己发送的消息

---

## 📋 检查流程

### 1. 代码审查前

- [ ] 阅读需求文档
- [ ] 理解业务规则
- [ ] 确认实现范围

### 2. 代码实现中

- [ ] 遵循开发规范
- [ ] 使用正确的技术栈
- [ ] 实现所有必需功能
- [ ] 确保代码符合Trae编辑器规范

### 3. 代码实现后

- [ ] 自查功能完整性
- [ ] 测试核心功能
- [ ] 验证权限控制
- [ ] 测试多端兼容性

### 4. 提交前

- [ ] 运行lint检查
- [ ] 运行typecheck检查
- [ ] 更新相关文档
- [ ] 确保Skill文档与代码实现一致

## 🚀 Trae 编辑器集成检查

### ✅ 必须实现

- [ ] Skill文档格式符合Trae编辑器要求
- [ ] Skill文档内容与代码实现一致
- [ ] Skill文档包含完整的代码示例
- [ ] Skill文档遵循统一的命名规范
- [ ] Skill文档包含清晰的使用场景说明

### 🔍 检查要点

**文件位置**：`.claude/skills/` 目录下的所有markdown文件

**验证**：
- 文档格式是否清晰，使用了正确的标题层级
- 代码示例是否完整，包含注释说明
- 是否添加了适用场景和技术栈说明
- 是否遵循了Trae编辑器的Skill文档规范

---

**文档维护者**：开发团队
**最后更新**：2026-01-29
**适用范围**：AITY VIP 项目需求符合性检查
