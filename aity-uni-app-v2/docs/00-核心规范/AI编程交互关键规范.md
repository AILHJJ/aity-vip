# AI编程交互关键规范与总结

**文档目的**: 记录AI编程交互过程中的关键概念、易混淆点和设计决策，避免未来协作中出现偏差。

**最后更新**: 2026-02-06
**版本**: v1.0

---

## 📋 核心概念澄清

### 1. 消息标签 vs 消息类型

**关键区分**：这是最容易混淆的概念！

#### 消息标签（Message Tags）= 推送范围
- **用途**: 控制消息推送给哪些用户
- **使用场景**: 权限管理、用户角色控制
- **代码定义**:
  ```javascript
  MESSAGE_TAGS = {
    SHORT_TERM: 'short_term',      // 短线策略 → VIP短线用户
    MID_TERM: 'mid_term',          // 中线策略 → VIP中线用户
    ALL_USERS: 'all_users'         // 全部用户 → 所有用户
  }
  ```
- **筛选位置**: `filter-bar.vue`（仅管理员可见）
- **业务逻辑**:
  - VIP短线用户只能看到 `short_term` 或 `all_users` 标签的消息
  - VIP中线用户只能看到 `mid_term` 或 `all_users` 标签的消息
  - 管理员可以看到所有消息

#### 消息类型（Message Types）= 内容分类
- **用途**: 对消息内容进行分类
- **使用场景**: 基础筛选、内容检索
- **代码定义**:
  ```javascript
  MESSAGE_TYPES = {
    PRE_MARKET_COMMENT: 'pre_market_comment',    // 盘前点评
    MORNING_COMMENT: 'morning_comment',          // 早盘点评
    MORNING_FOCUS: 'morning_focus',              // 早盘关注
    AFTERNOON_COMMENT: 'afternoon_comment',      // 尾盘点评
    AFTERNOON_FOCUS: 'afternoon_focus',          // 尾盘关注
    CLOSE_COMMENT: 'close_comment',              // 收盘点评
    RISK_WARNING: 'risk_warning',                // 风险提示
    SYSTEM: 'system',                            // 系统消息
    IMPORTANT: 'important',                      // 重要消息
    DAILY: 'daily'                               // 日常消息
  }
  ```
- **筛选位置**: `message-filter-bar.vue`（所有用户可见）
- **业务逻辑**: 按内容类型筛选消息

#### 易混淆点
❌ **错误理解**: "短线策略"类型的消息
✅ **正确理解**: 带有"短线策略"标签的消息（表示推送给VIP短线用户）

❌ **错误理解**: 筛选消息类型时包含"短线VIP"/"中线VIP"
✅ **正确理解**:
- 基础筛选包含: 盘前点评、早盘关注、尾盘关注等（所有用户可见）
- 推送范围筛选包含: 短线VIP、中线VIP、全部用户（仅管理员可见）

---

### 2. 筛选层级架构

```
消息筛选系统
├── 基础筛选（所有用户可见）
│   ├── 时间筛选: message-filter-bar.vue
│   └── 消息类型筛选: message-filter-bar.vue
│
└── 推送范围筛选（仅管理员可见）
    └── 推送对象筛选: filter-bar.vue
```

#### 筛选逻辑顺序
1. **权限过滤**（基于用户角色和消息标签）
2. **时间筛选**（基础筛选）
3. **消息类型筛选**（基础筛选）
4. **推送范围筛选**（仅管理员，可选）
5. **搜索关键词**（客户端）

#### 代码实现示例
```javascript
// messages.vue
const filteredMessages = computed(() => {
  let filtered = messages.value

  // 1. 权限过滤（基于标签）
  if (userRole === 'vip_mid') {
    filtered = filtered.filter(msg =>
      msg.tags && (msg.tags.includes('mid_term') ||
                   msg.tags.includes('all_users'))
    )
  } else if (userRole === 'vip_short') {
    filtered = filtered.filter(msg =>
      msg.tags && (msg.tags.includes('short_term') ||
                   msg.tags.includes('all_users'))
    )
  }

  // 2. 时间筛选（基础筛选）
  if (basicFilters.timeRange !== 'all') {
    filtered = filterByTime(filtered, basicFilters.timeRange)
  }

  // 3. 消息类型筛选（基础筛选）
  if (basicFilters.messageType !== 'all') {
    filtered = filtered.filter(msg =>
      msg.type === basicFilters.messageType
    )
  }

  // 4. 推送范围筛选（仅管理员）
  if (isAdmin && pushScopeFilters.pushScope !== 'all') {
    filtered = filtered.filter(msg =>
      msg.tags && msg.tags.includes(pushScopeFilters.pushScope)
    )
  }

  return filtered
})
```

---

### 3. 组件职责划分

#### message-filter-bar.vue（新增）
- **职责**: 基础筛选（时间 + 消息类型）
- **可见性**: 所有用户
- **核心功能**:
  - 快速筛选组合
  - 自定义日期范围
  - 消息类型筛选
  - 筛选历史记录
- **关键特性**:
  - 渐进式披露设计（默认收起）
  - 节省75%空间
  - 实时反馈

#### filter-bar.vue（修改）
- **职责**: 推送范围筛选
- **可见性**: 仅管理员
- **核心功能**:
  - 筛选推送对象（短线VIP/中线VIP/全部用户）
  - 收起/展开状态管理
- **注意**:
  - 不再包含"策略类型"筛选
  - 只处理推送范围

---

## 🎨 UI/UX设计原则

### 1. 专业性原则
- 采用渐进式披露设计
- 默认收起复杂功能，节省空间
- 提供快捷操作，减少用户点击次数

### 2. 易用性原则
- 快速筛选：常用组合一键应用
- 筛选历史：快速恢复之前的筛选
- 实时反馈：立即显示筛选结果

### 3. 视觉设计
- 渐变色主题（紫色系）
- 图标+文字组合
- 流畅的动画过渡
- 清晰的视觉层级

---

## 🔐 讨论私密性设计

### 默认私密策略
```javascript
// create-discussion.vue
const formData = ref({
  content: '',
  messageId: null,
  visibility: 'private'  // 默认私密
})
```

### 说明文案
```
🔒 私密讨论
为避免不同投资风格的影响，讨论默认私密。优质内容经管理员审核后公开，确保合规性与内容质量。
```

### 设计理由
1. **避免投资风格冲突**: 短线/中线用户风格不同，避免互相影响
2. **质量控制**: 管理员审核确保内容质量
3. **合规性要求**: 符合金融监管要求

---

## 🚀 部署架构

### H5部署
- **环境**: 腾讯云服务器
- **地址**: http://111.48.74.245/h5/
- **部署方式**: Nginx静态文件托管
- **持续运行**: 不能只在本地环境

### 微信小程序
- **平台**: 微信小程序平台
- **AppID**: wxb16a33cdd58f05d3
- **部署**: 微信开发者工具上传

---

## 📝 数据结构规范

### 消息对象
```javascript
{
  id: 1,
  title: '消息标题',
  content: '消息内容',
  type: 'morning_focus',      // 消息类型（MESSAGE_TYPES）
  tags: ['short_term'],       // 推送范围标签（MESSAGE_TAGS）
  status: 'published',        // 消息状态
  createdAt: '2026-02-06'
}
```

### 筛选条件
```javascript
// 基础筛选
{
  timeRange: 'today',           // 时间范围
  customStartDate: '2026-02-01', // 自定义开始日期
  customEndDate: '2026-02-06',   // 自定义结束日期
  messageType: 'morning_focus'  // 消息类型
}

// 推送范围筛选（仅管理员）
{
  pushScope: 'short_term'      // 推送范围
}
```

---

## ⚠️ 常见错误及预防

### 错误1: 混淆消息类型和推送范围
**错误表现**:
```javascript
// ❌ 错误：在消息类型中添加"短线VIP"
const messageTypes = [
  { label: '短线VIP', value: 'short_term' }  // 错误！
]
```

**正确做法**:
```javascript
// ✅ 正确：消息类型和推送范围分开
// 消息类型（内容分类）
const messageTypes = [
  { label: '早盘关注', value: 'morning_focus' }
]

// 推送范围（权限控制）- 仅管理员
const pushScopes = [
  { label: '短线VIP', value: 'short_term' }
]
```

### 错误2: 筛选逻辑错误
**错误表现**:
```javascript
// ❌ 错误：先筛选推送范围，再权限过滤
let filtered = filterByPushScope(messages)  // 错误顺序
if (!isAdmin) {
  filtered = filterByPermission(filtered)
}
```

**正确做法**:
```javascript
// ✅ 正确：先权限过滤，再推送范围筛选
let filtered = messages
if (!isAdmin) {
  filtered = filterByPermission(filtered)  // 先权限
}
if (isAdmin && pushScope !== 'all') {
  filtered = filterByPushScope(filtered)  // 后推送范围
}
```

### 错误3: 组件职责混乱
**错误表现**:
```javascript
// ❌ 错误：在基础筛选中添加推送范围
// message-filter-bar.vue
const filters = ref({
  messageType: 'all',
  pushScope: 'short_term'  // 不应该在这里！
})
```

**正确做法**:
```javascript
// ✅ 正确：基础筛选和推送范围分离
// message-filter-bar.vue（所有用户）
const basicFilters = ref({
  timeRange: 'all',
  messageType: 'all'
})

// filter-bar.vue（仅管理员）
const pushScopeFilters = ref({
  pushScope: 'all'
})
```

---

## 📚 文档维护

### 文档清单
1. `消息筛选栏需求文档.md` - 需求定义
2. `消息筛选栏UI-UX重新设计报告.md` - 设计方案
3. `消息筛选栏使用说明.md` - 用户指南
4. `AI编程交互关键规范.md` - 本文档

### 更新频率
- 每次重大需求变更后更新
- 每次发现新的易混淆点后补充
- 定期审查和优化

---

## ✅ 检查清单

### 开发前检查
- [ ] 明确区分"消息类型"和"推送范围"
- [ ] 确认筛选层级和逻辑顺序
- [ ] 确认组件职责划分
- [ ] 检查数据结构定义

### 代码审查检查
- [ ] 基础筛选和推送范围是否分离
- [ ] 权限过滤逻辑是否正确
- [ ] 组件职责是否清晰
- [ ] 是否符合UI/UX设计原则

### 测试检查
- [ ] VIP短线用户只看到short_term/all_users消息
- [ ] VIP中线用户只看到mid_term/all_users消息
- [ ] 管理员能看到所有消息和推送范围筛选
- [ ] 基础筛选对所有用户可见
- [ ] 推送范围筛选仅管理员可见

---

## 🎯 关键要点记忆

### 记住一句话
**"消息标签表示推送给谁，消息类型表示什么内容"**

### 快速判断方法
- 看到"短线VIP/中线VIP" → 这是推送范围 → `filter-bar.vue` → 仅管理员
- 看到"盘前点评/早盘关注" → 这是消息类型 → `message-filter-bar.vue` → 所有用户

### 代码位置速查
- 常量定义: `src/utils/constants.js`
- 基础筛选: `src/components/message-filter-bar.vue`
- 推送范围筛选: `src/components/filter-bar.vue`
- 消息列表: `src/pages/messages/messages.vue`

---

**文档维护**: 每次AI编程交互前，先阅读本文档；每次发现新问题，及时更新本文档。
**联系方式**: 如有疑问，请参考相关文档或咨询项目负责人。
