# 前后端API格式统一 - 修复检查清单

**创建日期**: 2026-02-11
**状态**: 进行中

---

## 📋 修复清单

### ✅ 已完成

- [x] **讨论列表接口** (`GET /api/discussions`)
  - 问题: 返回数组而非 `{ discussions: [] }`
  - 修复: `discussionController.js:112-114`
  - 状态: ✅ 已修复
  - 测试: 待验证

---

### 🔴 高优先级 - 待修复

#### 1. 消息列表接口响应格式
**接口**: `GET /api/messages`
**文件**: `backend/src/controllers/messageController.js`

**当前状态**:
```javascript
// 第143-152行
res.json({
  success: true,
  data: rows,
  pagination: {...}
});
```

**问题分析**:
- ❌ 使用 `success: true` 而非 `code: 200`
- ❌ 直接返回 `data: rows` 而非 `data: { list: rows }`
- ⚠️ 前端可能需要兼容处理

**期望格式**:
```javascript
res.json(success({
  list: rows,
  pagination: {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  }
}));
```

**影响的前端文件**:
- `aity-uni-app-v2/src/pages/messages/messages.vue`
- `aity-uni-app-v2/src/components/message-filter-bar.vue`
- `aity-uni-app-v2/src/api/message.js`

**修复步骤**:
1. [ ] 修改 `messageController.js` 的 `getMessages` 函数
2. [ ] 搜索前端所有 `res.data` 的使用
3. [ ] 更新为 `res.data.list`
4. [ ] 测试消息列表功能
5. [ ] 测试分页功能
6. [ ] 测试筛选功能

**预计工作量**: 1-2小时

---

### 🟡 中优先级 - 需审查

#### 2. 用户列表接口
**接口**: `GET /api/users`
**文件**: `backend/src/controllers/userController.js`

**检查项**:
- [ ] 确认当前返回格式
- [ ] 确认前端如何解析响应
- [ ] 如果不匹配,按照标准格式修复

**期望格式**:
```javascript
{
  code: 200,
  message: "Success",
  data: {
    list: [...],
    pagination: {...} // 如果有分页
  }
}
```

---

#### 3. 收藏列表接口
**接口**: `GET /api/favorites`
**文件**: `backend/src/controllers/messageController.js` 或相关文件

**当前问题**:
前端使用了多重兼容 (`favorites.vue:176`):
```javascript
const newData = res.data.list || res.data.messages || res.data.discussions || []
```

**检查项**:
- [ ] 确认后端实际返回哪种格式
- [ ] 统一为单一字段名
- [ ] 移除前端兼容代码

**期望格式**:
```javascript
{
  code: 200,
  message: "Success",
  data: {
    list: [...]  // 统一使用 list 字段
  }
}
```

---

#### 4. 统计类接口
**接口**: `GET /api/stats/*`
**文件**: `backend/src/controllers/statsController.js`

**检查项**:
- [ ] 确认所有统计接口的返回格式
- [ ] 统一包装格式
- [ ] 确保前端正确解析

**期望格式**:
```javascript
// 单一统计数据
{
  code: 200,
  message: "Success",
  data: {
    totalMessages: 100,
    totalDiscussions: 50
    // ...其他统计
  }
}

// 多项统计数据
{
  code: 200,
  message: "Success",
  data: {
    stats: [...],
    summary: {...}
  }
}
```

---

### 🟢 低优先级 - 可选优化

#### 5. 其他列表类接口
- [ ] 群组列表
- [ ] 通知列表
- [ ] 其他可能存在的列表接口

---

## 🛠️ 统一响应格式标准

### 成功响应
```javascript
{
  code: 200,
  message: "Success",
  data: {
    // 根据接口类型填充
  }
}
```

### 列表接口
```javascript
{
  code: 200,
  message: "Success",
  data: {
    list: [...],
    pagination: {  // 可选
      total: 100,
      page: 1,
      limit: 10,
      pages: 10
    }
  }
}
```

### 详情接口
```javascript
{
  code: 200,
  message: "Success",
  data: {
    id: 1,
    // ...其他字段
  }
}
```

### 创建/更新接口
```javascript
{
  code: 201,  // 或 200
  message: "Created successfully",
  data: {
    id: 123,
    // ...创建的对象
  }
}
```

### 错误响应
```javascript
{
  code: 400/401/403/404/500,
  message: "Error description"
  // data 字段可选,用于附加错误信息
}
```

---

## 📝 前端统一处理规范

### 判断成功
```javascript
// 统一使用
if (res.code === 200) {
  // 处理成功
}

// 移除
if (res.code === 200 || res.success) {  // ❌ 不再需要
```

### 获取列表数据
```javascript
// 统一使用
const list = res.data.list || []

// 移除多重兼容
const list = res.data.list || res.data.messages || res.data.discussions || []  // ❌
```

### 获取分页信息
```javascript
// 统一使用
const pagination = res.data.pagination
const total = pagination?.total || 0
```

---

## 🧪 测试检查清单

### 修复后必须测试的功能

#### 消息列表
- [ ] 列表正常加载
- [ ] 分页功能正常
- [ ] 筛选功能正常
- [ ] 搜索功能正常
- [ ] 下拉刷新正常
- [ ] 上拉加载更多正常

#### 讨论列表
- [ ] 创建讨论后列表刷新
- [ ] 讨论列表正常显示
- [ ] 讨论详情可访问

#### 收藏列表
- [ ] 收藏列表正常加载
- [ ] 取消收藏后列表更新
- [ ] 收藏数量显示正确

#### 其他功能
- [ ] 统计数据显示正常
- [ ] 用户列表显示正常
- [ ] 所有使用相关接口的页面正常

---

## 📊 进度追踪

| 接口 | 优先级 | 状态 | 完成日期 |
|------|--------|------|----------|
| 讨论列表 | 高 | ✅ 已修复 | 2026-02-11 |
| 消息列表 | 高 | 🔴 待修复 | - |
| 用户列表 | 中 | 🟡 待审查 | - |
| 收藏列表 | 中 | 🟡 待审查 | - |
| 统计接口 | 低 | 🟢 待优化 | - |

---

## 🎯 下一步行动

1. **立即执行** (今天)
   - [ ] 修复消息列表接口格式
   - [ ] 测试消息列表所有功能
   - [ ] 提交代码

2. **本周完成** (2-3天)
   - [ ] 审查并修复用户列表接口
   - [ ] 审查并修复收藏列表接口
   - [ ] 清理前端兼容代码
   - [ ] 全面回归测试

3. **持续优化** (未来)
   - [ ] 制定API开发规范文档
   - [ ] 添加接口响应格式测试
   - [ ] 定期审计API格式

---

**最后更新**: 2026-02-11
**负责人**: 开发团队
**审核人**: 技术主管
