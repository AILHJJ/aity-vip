# 问题追踪清单 (ISSUES.md)

> 已知问题、根因分析、解决方案和实施计划

## 🚨 P0 - 紧急问题（阻塞性）

### Issue #1: 管理员在小程序中看不到发帖按钮 ✅ 已解决

**问题描述**
- 在小程序环境中,管理员登录后无法看到"发布消息"按钮
- H5环境正常显示

**影响范围**
- 所有管理员用户
- 仅影响小程序端

**解决方案**
✅ 已在 `src/pages/messages/messages.vue` 和 `src/pages/discussions/discussions.vue` 中实现:
- 添加 `userInfoLoaded` 状态跟踪用户信息加载
- 在 `onMounted` 中强制刷新用户信息
- 添加 `onShow` 生命周期监听,每次显示页面时刷新
- 管理员按钮同时依赖 `userStore.isAdmin && userInfoLoaded`

**修改文件**:
- ✅ src/pages/messages/messages.vue
- ✅ src/pages/discussions/discussions.vue

---

### Issue #2: 消息列表显示为空 ✅ 已解决

**问题描述**
- 用户登录后点击"消息"Tab,列表为空白
- 后端数据库有数据,但前端不显示

**解决方案**
✅ 已通过修复 Issue #1 解决:
- 用户信息加载完成后才显示消息列表
- 添加调试日志便于排查问题
- 优化错误提示,更友好的错误信息

**修改文件**:
- ✅ src/utils/request.js (优化错误提示)

---

## ⚠️ P1 - 重要问题（影响体验）

### Issue #3: 错误提示不友好 ✅ 已解决

**问题描述**
- 网络错误、权限错误等提示过于技术化
- 用户不知道如何解决问题

**解决方案**
✅ 已在 `src/utils/request.js` 中实现:
- 添加 `ERROR_MESSAGES` 映射表
- 实现友好的错误提示转换
- 增加开发环境调试日志
- 优化超时和网络错误提示

**修改文件**:
- ✅ src/utils/request.js

---

### Issue #4: 缺少消息管理功能 ✅ 已解决

**问题描述**
- 管理员发布消息后无法编辑或删除
- 发布错误无法撤回

**解决方案**
✅ 已在 `src/pages/message-detail/message-detail.vue` 中实现:
- 添加管理员操作按钮(编辑/删除)
- 编辑功能复用 create-message 页面
- 删除前二次确认
- 编辑模式支持加载现有数据

**修改文件**:
- ✅ src/pages/message-detail/message-detail.vue
- ✅ src/pages/create-message/create-message.vue (支持编辑模式)

---

### Issue #5: 缺少草稿保存功能 ✅ 已解决

**问题描述**
- 用户编写消息时如果退出,内容会丢失
- 用户体验差

**解决方案**
✅ 已在 `src/pages/create-message/create-message.vue` 中实现:
- 监听表单变化自动保存草稿
- 每30秒定时保存草稿
- 下次打开提示恢复草稿
- 提交成功后自动清除草稿
- 编辑模式不保存草稿

**修改文件**:
- ✅ src/pages/create-message/create-message.vue
```javascript
// src/pages/messages/messages.vue:4-9
<view v-if="userStore.isAdmin" class="admin-bar">
  <button class="create-btn" @click="goToCreate">
    <text class="create-icon">✏️</text>
    <text class="create-text">发布消息</text>
  </button>
</view>
```

可能原因:
1. **时序问题**: 页面 `onMounted` 时 userStore.userInfo 未加载完成
2. **权限判断失败**: `isAdmin` getter 依赖 userInfo.role,后端返回格式可能不一致
3. **Store初始化问题**: 小程序环境 Pinia store 初始化时机晚于页面渲染

**解决方案**

```javascript
// 方案1: 添加加载状态,确保用户信息已加载
const userInfoLoaded = ref(false)

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }

  // 强制刷新用户信息
  await userStore.fetchUserInfo()

  // 添加调试日志
  console.log('用户信息:', userStore.userInfo)
  console.log('用户角色:', userStore.userRole)
  console.log('是否管理员:', userStore.isAdmin)

  userInfoLoaded.value = true
  loadMessages(true)
})

onShow(() => {
  // 页面显示时重新检查
  if (userInfoLoaded.value) {
    userStore.fetchUserInfo()
  }
})
```

```vue
<!-- 模板修改 -->
<template>
  <!-- 添加userInfoLoaded判断 -->
  <view v-if="userStore.isAdmin && userInfoLoaded" class="admin-bar">
    <button class="create-btn" @click="goToCreate">发布消息</button>
  </view>

  <!-- 调试:显示当前状态 -->
  <view v-if="isDev" class="debug-info">
    <text>isAdmin: {{ userStore.isAdmin }}</text>
    <text>userRole: {{ userStore.userRole }}</text>
    <text>userInfoLoaded: {{ userInfoLoaded }}</text>
  </view>
</template>
```

**文件修改**
- [ ] `src/pages/messages/messages.vue`
- [ ] `src/pages/discussions/discussions.vue` (同样问题)
- [ ] `src/store/user.js` (优化fetchUserInfo)

**测试验证**
```bash
# 1. 使用管理员账号登录
admin@example.com / 123456

# 2. 控制台执行
console.log(uni.getStorageSync('userInfo'))
console.log('isAdmin:', userStore.isAdmin)

# 3. 检查后端返回
# 后端 /api/auth/me 接口返回的用户角色字段是否正确
```

**预计工作量**: 2小时

---

### Issue #2: 消息列表显示为空

**问题描述**
- 用户登录后点击"消息"Tab,列表为空白
- 后端数据库有数据,但前端不显示

**影响范围**
- 所有用户
- 所有平台

**根因分析**

可能原因:
1. **后端服务未启动** - API请求失败
2. **数据库未初始化** - 表中没有数据
3. **权限过滤问题** - VIP用户权限过滤掉所有消息
4. **网络请求失败** - 小程序本地IP无法访问
5. **数据格式不匹配** - 后端返回格式与前端期望不一致

**排查步骤**

```bash
# 1. 检查后端服务
cd backend
npm start
# 应该看到: Server running on port 3001

# 2. 检查数据库
node -e "
const sequelize = require('./src/config/db');
const Message = require('./src/models/Message');

sequelize.authenticate().then(async () => {
  const count = await Message.count();
  console.log('消息总数:', count);

  const messages = await Message.findAll({ limit: 3 });
  console.log('示例消息:', JSON.stringify(messages, null, 2));

  process.exit(0);
}).catch(err => {
  console.error('数据库连接失败:', err);
  process.exit(1);
});
"

# 3. 初始化测试数据(如果数据库为空)
node init-complete-test-data.js

# 4. 检查API接口
curl http://192.168.2.140:3001/api/messages?page=1&limit=20
```

```javascript
// 5. 前端调试
// src/pages/messages/messages.vue:237
const res = await getMessagesApi(params)

console.log('API请求参数:', params)
console.log('API返回结果:', res)
console.log('消息列表:', res.data)
console.log('过滤后消息:', filteredMessages.value)
```

**解决方案**

根据排查结果采取不同方案:

**方案A: 后端服务未启动**
```bash
cd backend
npm install  # 安装依赖
npm start    # 启动服务
```

**方案B: 数据库未初始化**
```bash
cd backend
node init-complete-test-data.js
```

**方案C: 网络配置问题**
```javascript
// src/utils/request.js
// 小程序开发环境配置
const BASE_URL = 'http://192.168.2.140:3001/api'

// 检查手机和电脑是否在同一局域网
// 微信开发者工具勾选"不校验合法域名"
```

**方案D: 权限过滤问题**
```javascript
// 检查消息标签
// VIP中线用户只能看到 tags 包含 'mid_term' 或 'all_users' 的消息
// 如果测试数据没有正确的标签,会被过滤掉

// 临时测试: 使用管理员账号(可看所有消息)
admin@example.com / 123456
```

**文件修改**
- [ ] 确认后端服务状态
- [ ] 初始化测试数据
- [ ] 检查网络配置
- [ ] 添加调试日志

**预计工作量**: 1-3小时(根据具体原因)

---

## ⚠️ P1 - 重要问题（影响体验）

### Issue #3: 错误提示不友好

**问题描述**
- 网络错误、权限错误等提示过于技术化
- 用户不知道如何解决问题

**示例**
```
当前: "Network Error"
优化: "网络连接失败,请检查网络设置"

当前: "401 Unauthorized"
优化: "登录已过期,请重新登录"
```

**解决方案**

```javascript
// src/utils/request.js: 优化错误处理
const errorMessages = {
  'Network Error': '网络连接失败,请检查网络设置',
  'timeout': '请求超时,请稍后重试',
  '401': '登录已过期,请重新登录',
  '403': '您没有权限执行此操作',
  '404': '请求的内容不存在',
  '500': '服务器出错了,请稍后重试',
  '503': '服务暂时不可用,请稍后重试'
}

const getErrorMessage = (error) => {
  if (error.response) {
    const { status, data } = error.response
    return data?.message || errorMessages[status] || '请求失败,请稍后重试'
  }
  return errorMessages[error.message] || '操作失败,请稍后重试'
}

// 使用示例
uni.showToast({
  title: getErrorMessage(error),
  icon: 'none'
})
```

**预计工作量**: 1小时

---

### Issue #4: 缺少消息管理功能

**问题描述**
- 管理员发布消息后无法编辑或删除
- 发布错误无法撤回

**解决方案**

创建编辑消息页面:

```vue
<!-- src/pages/edit-message/edit-message.vue -->
<template>
  <view class="edit-message-container">
    <!-- 复用 create-message 的表单 -->
    <!-- 预填充现有消息数据 -->
  </view>
</template>

<script setup>
import { getMessageDetailApi, updateMessageApi } from '../../api/message'

const messageId = ref(0)
const formData = ref({
  title: '',
  type: '',
  tags: [],
  content: ''
})

onMounted(async () => {
  // 获取消息详情
  const res = await getMessageDetailApi(messageId.value)
  if (res.success) {
    formData.value = res.data
  }
})

const handleSubmit = async () => {
  const res = await updateMessageApi(messageId.value, formData.value)
  if (res.success) {
    uni.showToast({ title: '更新成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
}
</script>
```

在消息详情页添加管理员操作:

```vue
<!-- src/pages/message-detail/message-detail.vue -->
<template>
  <view v-if="userStore.isAdmin" class="admin-actions">
    <button class="admin-btn edit" @click="handleEdit">编辑</button>
    <button class="admin-btn delete" @click="handleDelete">删除</button>
  </view>
</template>
```

**预计工作量**: 4小时

---

### Issue #5: 缺少草稿保存功能

**问题描述**
- 用户编写消息时如果退出,内容会丢失
- 用户体验差

**解决方案**

```javascript
// src/pages/create-message/create-message.vue
import { onBeforeUnmount, watch } from 'vue'

const DRAFT_KEY = 'message_draft'

// 自动保存草稿(每30秒)
const draftTimer = setInterval(() => {
  if (formData.value.title || formData.value.content) {
    uni.setStorageSync(DRAFT_KEY, JSON.stringify(formData.value))
    uni.showToast({ title: '草稿已保存', icon: 'success', duration: 1000 })
  }
}, 30000)

// 监听表单变化
watch(formData, (newVal) => {
  uni.setStorageSync(DRAFT_KEY, JSON.stringify(newVal))
}, { deep: true })

// 恢复草稿
onMounted(() => {
  const draft = uni.getStorageSync(DRAFT_KEY)
  if (draft) {
    uni.showModal({
      title: '发现草稿',
      content: '是否恢复上次编辑的内容?',
      success: (res) => {
        if (res.confirm) {
          formData.value = JSON.parse(draft)
        } else {
          uni.removeStorageSync(DRAFT_KEY)
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  clearInterval(draftTimer)
})

// 提交成功后清除草稿
const handleSubmit = async () => {
  const res = await createMessageApi(formData.value)
  if (res.success) {
    uni.removeStorageSync(DRAFT_KEY)
    // ...
  }
}
```

**预计工作量**: 2小时

---

## 💡 P2 - 体验优化（长期改进）

### Issue #6: 加载动画简陋

**问题描述**
- Loading状态只有简单的转圈动画
- 缺少骨架屏

**解决方案**

创建骨架屏组件:

```vue
<!-- src/components/message-skeleton.vue -->
<template>
  <view class="skeleton-list">
    <view v-for="i in 5" :key="i" class="skeleton-item">
      <view class="skeleton-header">
        <view class="skeleton-badge"></view>
        <view class="skeleton-time"></view>
      </view>
      <view class="skeleton-title"></view>
      <view class="skeleton-content"></view>
      <view class="skeleton-footer">
        <view class="skeleton-tags">
          <view class="skeleton-tag"></view>
          <view class="skeleton-tag"></view>
        </view>
        <view class="skeleton-stats"></view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.skeleton-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.skeleton-badge {
  width: 120rpx;
  height: 40rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 20rpx;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

**预计工作量**: 3小时

---

### Issue #7: emoji图标不一致

**问题描述**
- 使用emoji作为图标,在不同设备显示不一致
- 不够专业

**解决方案**

使用 iconfont 图标库:

```bash
# 1. 引入 uni-icons
npm install @dcloudio/uni-ui

# 2. 或使用自定义图标库
# 访问 https://www.iconfont.cn/
# 下载项目所需的图标
```

```vue
<!-- 替换示例 -->
<text class="menu-icon">⭐</text>
<!-- 改为 -->
<uni-icons type="star" size="20" color="#666"></uni-icons>
```

**预计工作量**: 4小时

---

## 📋 问题统计

| 优先级 | 问题数 | 已解决 | 进行中 | 待解决 |
|--------|--------|--------|--------|--------|
| P0 | 2 | 0 | 0 | 2 |
| P1 | 3 | 0 | 0 | 3 |
| P2 | 2 | 0 | 0 | 2 |
| 总计 | 7 | 0 | 0 | 7 |

## 🔧 调试检查清单

### 小程序环境
- [ ] 微信开发者工具"不校验合法域名"已勾选
- [ ] 本地后端服务正常运行(`npm start`)
- [ ] 确认手机和电脑在同一局域网
- [ ] 控制台无CORS错误
- [ ] 后端日志无报错

### 数据检查
```bash
# 检查数据库连接
cd backend
node test-db-connection.js

# 检查数据是否存在
node -e "
const sequelize = require('./src/config/db');
sequelize.authenticate().then(() => {
  console.log('数据库连接成功');
  process.exit(0);
}).catch(err => {
  console.error('数据库连接失败:', err);
  process.exit(1);
});
"
```

### 权限检查
```javascript
// 在控制台执行
console.log('Token:', uni.getStorageSync('token'))
console.log('UserInfo:', uni.getStorageSync('userInfo'))
console.log('IsAdmin:', userStore.isAdmin)
console.log('UserRole:', userStore.userRole)
```

## 📝 问题提交模板

```markdown
### Issue #X: [简短描述]

**问题描述**
- 详细描述问题现象
- 复现步骤
- 预期行为 vs 实际行为

**影响范围**
- 影响哪些用户/功能
- 严重程度(P0/P1/P2/P3)

**环境信息**
- 平台: H5 / 微信小程序 / 支付宝小程序
- 设备: iOS / Android
- 版本: vX.X.X

**截图/日志**
```
错误日志或截图
```

**建议方案**
- 提出可能的解决方案
```

---

**文档版本**: v1.0.0
**最后更新**: 2024-02-02
**维护人**: 开发团队
