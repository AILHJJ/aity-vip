# 优化方案文档 (OPTIMIZATION.md)

> 从UI设计、产品功能、用户体验三个维度的综合优化方案

## 目录

- [UI设计优化](#ui设计优化)
- [产品功能优化](#产品功能优化)
- [用户体验优化](#用户体验优化)
- [性能优化](#性能优化)
- [安全优化](#安全优化)
- [实施计划](#实施计划)

---

## UI设计优化

### 1. 视觉层次优化

#### 1.1 消息卡片视觉增强

**当前问题**
- 消息类型标签颜色单一,缺乏区分度
- 卡片层次感不足
- 缺少交互反馈

**优化方案**

```scss
// src/pages/messages/messages.vue

.message-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08); // 增强阴影
  border-left: 4rpx solid transparent; // 添加左边框
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.98); // 点击缩放反馈
    border-left-color: #667eea; // 点击时左边框高亮
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
  }

  // 未读状态
  &.unread {
    background: linear-gradient(to right, #f8f9ff, #ffffff);
    border-left-color: #667eea;
  }
}

// 消息类型标签 - 不同类型不同颜色
.message-type-badge {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #ffffff;
  border-radius: 20rpx;
  font-weight: 500;

  // 盘前点评 - 紫色
  &.type-pre_market_comment {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  // 早盘关注 - 蓝色
  &.type-morning_focus {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  // 风险提示 - 红色
  &.type-risk_warning {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  // 重要消息 - 金色
  &.type-important {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  }
}
```

**效果预期**
- ✅ 提升视觉层次感
- ✅ 增强交互反馈
- ✅ 快速识别消息类型

---

#### 1.2 空状态设计优化

**当前问题**
- 空状态过于简单
- 缺少引导操作

**优化方案**

```vue
<!-- src/components/empty-state.vue -->
<template>
  <view class="empty-state">
    <image :src="image" class="empty-image" mode="aspectFit"></image>
    <text class="empty-title">{{ title }}</text>
    <text class="empty-description">{{ description }}</text>
    <button v-if="actionText" class="empty-action" @click="handleAction">
      {{ actionText }}
    </button>
  </view>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'message' // message, discussion, favorite, network-error
  }
})

const stateConfig = {
  message: {
    image: '/static/images/empty-message.png',
    title: '暂无消息',
    description: '管理员发布的消息会显示在这里',
    actionText: '去看看',
    action: () => uni.switchTab({ url: '/pages/discussions/discussions' })
  },
  discussion: {
    image: '/static/images/empty-discussion.png',
    title: '暂无讨论',
    description: '发起第一条讨论吧',
    actionText: '发起讨论',
    action: () => uni.navigateTo({ url: '/pages/create-discussion/create-discussion' })
  },
  'network-error': {
    image: '/static/images/network-error.png',
    title: '网络连接失败',
    description: '请检查网络设置后重试',
    actionText: '重新加载',
    action: () => uni.startPullDownRefresh()
  }
}

const config = computed(() => stateConfig[props.type])
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
}

.empty-image {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 40rpx;
  opacity: 0.8;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-description {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 60rpx;
  text-align: center;
}

.empty-action {
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
}
</style>
```

---

#### 1.3 骨架屏加载

**优化方案**

```vue
<!-- src/components/message-skeleton.vue -->
<template>
  <view class="skeleton-list">
    <view v-for="i in count" :key="i" class="skeleton-item">
      <view class="skeleton-header">
        <view class="skeleton-badge"></view>
        <view class="skeleton-time"></view>
      </view>
      <view class="skeleton-title"></view>
      <view class="skeleton-content"></view>
      <view class="skeleton-content short"></view>
      <view class="skeleton-footer">
        <view class="skeleton-tag"></view>
        <view class="skeleton-tag"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 5
  }
})
</script>

<style lang="scss" scoped>
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.skeleton-badge {
  width: 120rpx;
  height: 40rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 20rpx;
}

.skeleton-time {
  width: 180rpx;
  height: 32rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8rpx;
  margin-left: auto;
}

.skeleton-title {
  width: 70%;
  height: 36rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8rpx;
  margin-top: 20rpx;
}

.skeleton-content {
  width: 100%;
  height: 28rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8rpx;
  margin-top: 16rpx;

  &.short {
    width: 60%;
  }
}

.skeleton-footer {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.skeleton-tag {
  width: 100rpx;
  height: 40rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12rpx;
}
</style>
```

**使用方式**

```vue
<!-- src/pages/messages/messages.vue -->
<template>
  <view class="messages-container">
    <!-- 加载中显示骨架屏 -->
    <message-skeleton v-if="loading && messages.length === 0" :count="5" />

    <!-- 实际内容 -->
    <view v-else class="messages-list">
      <!-- ... -->
    </view>
  </view>
</template>

<script setup>
import MessageSkeleton from '@/components/message-skeleton.vue'
</script>
```

---

### 2. 图标系统优化

#### 2.1 替换emoji为专业图标

**当前问题**
- emoji在不同设备显示不一致
- 不够专业

**优化方案**

```bash
# 安装 uni-icons
npm install @dcloudio/uni-ui
```

```javascript
// src/pages/messages/messages.vue
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
```

```vue
<!-- 替换前 -->
<text class="search-icon">🔍</text>

<!-- 替换后 -->
<uni-icons type="search" size="18" color="#999"></uni-icons>
```

**图标映射表**

| 原emoji | uni-icons type | 说明 |
|---------|---------------|------|
| 🔍 | search | 搜索 |
| ⭐ | star | 收藏 |
| 💬 | chatbubble | 讨论 |
| 👁 | eye | 查看 |
| 👥 | person | 用户 |
| 📊 | chartbar | 统计 |
| ✏️ | compose | 编辑 |
| ❌ | clear | 清除 |
| ✓ | checkmark | 完成 |
| ‹ | left | 返回 |

---

## 产品功能优化

### 1. 管理员发帖功能修复

#### 1.1 确保用户信息加载

**修改文件**: `src/pages/messages/messages.vue`

```vue
<script setup>
import { ref, onMounted, onShow } from 'vue'

const userInfoLoaded = ref(false)

onMounted(async () => {
  // 1. 检查登录状态
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }

  // 2. 强制刷新用户信息
  try {
    await userStore.fetchUserInfo()

    // 3. 调试日志
    console.log('=== 用户信息加载完成 ===')
    console.log('用户名:', userStore.userName)
    console.log('用户角色:', userStore.userRole)
    console.log('是否管理员:', userStore.isAdmin)

    userInfoLoaded.value = true
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  }

  // 4. 加载消息
  loadMessages(true)
})

onShow(() => {
  // 页面显示时重新检查
  if (userInfoLoaded.value) {
    userStore.fetchUserInfo().catch(err => {
      console.error('刷新用户信息失败:', err)
    })
  }
})
</script>

<template>
  <!-- 管理员操作栏 - 添加userInfoLoaded判断 -->
  <view v-if="userStore.isAdmin && userInfoLoaded" class="admin-bar">
    <button class="create-btn" @click="goToCreate">
      <uni-icons type="compose" size="16" color="#fff"></uni-icons>
      <text class="create-text">发布消息</text>
    </button>
  </view>

  <!-- FAB悬浮按钮 - 同样添加判断 -->
  <view v-if="userStore.isAdmin && userInfoLoaded" class="fab-button" @click="goToCreate">
    <uni-icons type="plus" size="24" color="#fff"></uni-icons>
  </view>
</template>
```

#### 1.2 Store优化

**修改文件**: `src/store/user.js`

```javascript
// 添加更详细的调试信息
actions: {
  async fetchUserInfo() {
    if (!this.token) {
      return
    }

    try {
      console.log('开始获取用户信息...')
      const res = await getCurrentUserApi()

      if (res.success && res.data) {
        this.userInfo = res.data
        uni.setStorageSync('userInfo', res.data)

        console.log('用户信息获取成功:', res.data)
        console.log('角色:', res.data.role)
        console.log('是否管理员:', ['super_admin', 'admin'].includes(res.data.role))
      } else {
        throw new Error(res.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('fetchUserInfo失败:', error)
      this.logout()
      throw error
    }
  }
}
```

---

### 2. 消息管理功能增强

#### 2.1 添加消息编辑功能

**新建文件**: `src/pages/edit-message/edit-message.vue`

```vue
<template>
  <view class="edit-message-container">
    <view class="form-container">
      <!-- 复用create-message的表单结构 -->
      <view class="form-item">
        <text class="form-label">消息标题 *</text>
        <input
          class="form-input"
          v-model="formData.title"
          type="text"
          placeholder="请输入消息标题"
        />
      </view>

      <!-- 其他表单字段... -->

      <view class="button-group">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '保存中...' : '保存修改' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getMessageDetailApi, updateMessageApi } from '@/api/message'

const userStore = useUserStore()
const formData = ref({
  title: '',
  type: '',
  tags: [],
  content: ''
})
const submitting = ref(false)
const messageId = ref(0)

onMounted(async () => {
  // 检查权限
  if (!userStore.isAdmin) {
    uni.showToast({ title: '无权限编辑', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  // 获取消息ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  messageId.value = currentPage.options.id || 0

  // 加载消息详情
  try {
    const res = await getMessageDetailApi(messageId.value)
    if (res.success) {
      formData.value = {
        title: res.data.title,
        type: res.data.type,
        tags: res.data.tags || [],
        content: res.data.content
      }
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    const res = await updateMessageApi(messageId.value, formData.value)

    if (res.success) {
      uni.showToast({ title: '修改成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({ title: res.message || '修改失败', icon: 'none' })
    }
  } catch (error) {
    console.error('更新消息失败:', error)
    uni.showToast({ title: '修改失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  uni.navigateBack()
}
</script>
```

#### 2.2 消息详情页添加管理员操作

**修改文件**: `src/pages/message-detail/message-detail.vue`

```vue
<template>
  <view class="detail-container">
    <!-- 现有内容... -->

    <!-- 管理员操作按钮 -->
    <view v-if="userStore.isAdmin" class="admin-actions">
      <button class="admin-btn edit" @click="handleEdit">
        <uni-icons type="compose" size="16" color="#667eea"></uni-icons>
        <text>编辑</text>
      </button>
      <button class="admin-btn delete" @click="handleDelete">
        <uni-icons type="trash" size="16" color="#ff5252"></uni-icons>
        <text>删除</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { deleteMessageApi } from '@/api/message'

const handleEdit = () => {
  uni.navigateTo({
    url: `/pages/edit-message/edit-message?id=${messageId.value}`
  })
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复,是否继续?',
    confirmColor: '#ff5252',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await deleteMessageApi(messageId.value)
          if (res.success) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => uni.navigateBack(), 1500)
          } else {
            uni.showToast({ title: res.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          console.error('删除消息失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.admin-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  background: #ffffff;
  margin-top: 20rpx;
  border-radius: 16rpx;
}

.admin-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;

  &.edit {
    background: #f0f2ff;
    color: #667eea;
  }

  &.delete {
    background: #ffeef0;
    color: #ff5252;
  }
}
</style>
```

---

### 3. 消息通知推送

#### 3.1 微信小程序订阅消息

**新建文件**: `src/utils/subscribe.js`

```javascript
/**
 * 请求消息订阅权限
 */
export function requestMessageSubscribe() {
  return new Promise((resolve, reject) => {
    uni.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'], // 在微信公众平台配置的模板ID
      success: (res) => {
        console.log('订阅结果:', res)

        if (res['YOUR_TEMPLATE_ID'] === 'accept') {
          // 用户同意订阅
          saveSubscribeSettings(true)
          resolve(true)
        } else if (res['YOUR_TEMPLATE_ID'] === 'reject') {
          // 用户拒绝订阅
          resolve(false)
        }
      },
      fail: (err) => {
        console.error('订阅失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 保存订阅设置到服务器
 */
async function saveSubscribeSettings(subscribed) {
  try {
    // 调用后端API保存订阅状态
    await updateSubscribeSettingsApi({ subscribed })
  } catch (error) {
    console.error('保存订阅设置失败:', error)
  }
}

/**
 * 在个人中心添加订阅开关
 */
export function showSubscribeSettings() {
  uni.showModal({
    title: '消息通知',
    content: '是否接收新消息推送?',
    confirmText: '开启',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          await requestMessageSubscribe()
          uni.showToast({ title: '订阅成功', icon: 'success' })
        } catch (error) {
          uni.showToast({ title: '订阅失败', icon: 'none' })
        }
      }
    }
  })
}
```

**在个人中心使用**

```vue
<!-- src/pages/profile/profile.vue -->
<template>
  <view class="profile-container">
    <!-- 现有内容... -->

    <!-- 消息通知设置 -->
    <view class="menu-section">
      <view class="menu-item" @click="handleSubscribe">
        <view class="menu-left">
          <uni-icons type="notification" size="20" color="#666"></uni-icons>
          <text class="menu-text">消息通知</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { showSubscribeSettings } from '@/utils/subscribe'

const handleSubscribe = () => {
  showSubscribeSettings()
}
</script>
```

---

## 用户体验优化

### 1. 首次使用引导

#### 1.1 引导页组件

**新建文件**: `src/components/onboarding.vue`

```vue
<template>
  <view class="onboarding-container" v-if="showOnboarding">
    <swiper
      class="onboarding-swiper"
      :indicator-dots="true"
      :autoplay="false"
      :circular="false"
    >
      <swiper-item v-for="(step, index) in steps" :key="index">
        <view class="step-container">
          <image :src="step.image" class="step-image" mode="aspectFit"></image>
          <text class="step-title">{{ step.title }}</text>
          <text class="step-description">{{ step.description }}</text>
        </view>
      </swiper-item>
    </swiper>

    <button class="start-btn" @click="handleStart">
      {{ currentIndex === steps.length - 1 ? '开始使用' : '下一步' }}
    </button>

    <button class="skip-btn" v-if="currentIndex < steps.length - 1" @click="handleSkip">
      跳过
    </button>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const showOnboarding = ref(!uni.getStorageSync('onboarding_completed'))
const currentIndex = ref(0)

const steps = [
  {
    image: '/static/images/onboarding-1.png',
    title: '专业的投研分享',
    description: '获取专业的市场分析和投资建议'
  },
  {
    image: '/static/images/onboarding-2.png',
    title: '实时互动讨论',
    description: '与投研专家实时交流,解答疑惑'
  },
  {
    image: '/static/images/onboarding-3.png',
    title: '个性化推荐',
    description: '根据您的投资偏好,精准推送内容'
  }
]

const handleStart = () => {
  if (currentIndex.value < steps.length - 1) {
    currentIndex.value++
  } else {
    completeOnboarding()
  }
}

const handleSkip = () => {
  completeOnboarding()
}

const completeOnboarding = () => {
  uni.setStorageSync('onboarding_completed', true)
  showOnboarding.value = false
}
</script>

<style lang="scss" scoped>
.onboarding-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 9999;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 60rpx;
}

.step-image {
  width: 500rpx;
  height: 500rpx;
  margin-bottom: 80rpx;
}

.step-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 30rpx;
}

.step-description {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.6;
}

.start-btn {
  position: absolute;
  bottom: 100rpx;
  left: 60rpx;
  right: 60rpx;
  height: 90rpx;
  line-height: 90rpx;
  background: #ffffff;
  color: #667eea;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  border: none;
}

.skip-btn {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  right: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  border: none;
}
</style>
```

---

### 2. 草稿自动保存

已在 [Issue #5](./ISSUES.md#issue-5-缺少草稿保存功能) 中详细说明

---

### 3. 搜索历史记录

**新建文件**: `src/utils/search-history.js`

```javascript
const MAX_HISTORY = 10
const STORAGE_KEY = 'search_history'

/**
 * 添加搜索历史
 */
export function addSearchHistory(keyword) {
  if (!keyword || !keyword.trim()) {
    return
  }

  let history = getSearchHistory()

  // 去重并添加到开头
  history = history.filter(item => item !== keyword.trim())
  history.unshift(keyword.trim())

  // 限制数量
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY)
  }

  uni.setStorageSync(STORAGE_KEY, history)
}

/**
 * 获取搜索历史
 */
export function getSearchHistory() {
  return uni.getStorageSync(STORAGE_KEY) || []
}

/**
 * 清除搜索历史
 */
export function clearSearchHistory() {
  uni.removeStorageSync(STORAGE_KEY)
}

/**
 * 删除单条历史记录
 */
export function removeSearchHistory(keyword) {
  let history = getSearchHistory()
  history = history.filter(item => item !== keyword)
  uni.setStorageSync(STORAGE_KEY, history)
}
```

**在搜索页面使用**

```vue
<!-- src/pages/messages/messages.vue -->
<template>
  <view class="messages-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input
          class="search-input"
          v-model="searchKeyword"
          type="text"
          placeholder="搜索消息标题或内容"
          @focus="showSearchHistory = true"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
      </view>
    </view>

    <!-- 搜索历史弹窗 -->
    <view v-if="showSearchHistory && searchHistory.length > 0" class="search-history-panel">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="history-clear" @click="handleClearHistory">清空</text>
      </view>
      <view class="history-list">
        <view
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @click="handleSelectHistory(item)"
        >
          <uni-icons type="time" size="14" color="#999"></uni-icons>
          <text class="history-text">{{ item }}</text>
          <uni-icons
            type="close"
            size="14"
            color="#999"
            @click.stop="handleRemoveHistory(item)"
          ></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@/utils/search-history'

const showSearchHistory = ref(false)
const searchHistory = ref(getSearchHistory())

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    addSearchHistory(searchKeyword.value.trim())
    searchHistory.value = getSearchHistory()
  }
  showSearchHistory.value = false
}

const handleSelectHistory = (keyword) => {
  searchKeyword.value = keyword
  showSearchHistory.value = false
  handleSearch()
}

const handleClearHistory = () => {
  uni.showModal({
    title: '清空搜索历史',
    content: '确定要清空所有搜索历史吗?',
    success: (res) => {
      if (res.confirm) {
        clearSearchHistory()
        searchHistory.value = []
      }
    }
  })
}

const handleRemoveHistory = (keyword) => {
  removeSearchHistory(keyword)
  searchHistory.value = getSearchHistory()
}
</script>
```

---

## 实施计划

### 阶段1: 紧急修复 (1-2天)

**优先级**: P0

- [x] 创建文档体系
- [ ] 修复管理员发帖按钮显示问题
- [ ] 确保测试数据正确初始化
- [ ] 优化小程序网络请求配置
- [ ] 添加调试日志

**验收标准**:
- ✅ 管理员可以在小程序中看到并点击"发布消息"按钮
- ✅ 消息列表可以正常显示数据
- ✅ 无网络错误和权限错误

---

### 阶段2: 核心优化 (3-5天)

**优先级**: P1

- [ ] 增强消息管理功能(编辑/删除)
- [ ] 优化空状态和错误提示
- [ ] 实现草稿保存功能
- [ ] 添加消息订阅推送

**验收标准**:
- ✅ 管理员可以编辑和删除已发布的消息
- ✅ 所有错误提示友好易懂
- ✅ 草稿自动保存和恢复
- ✅ 用户可以订阅消息推送

---

### 阶段3: 体验提升 (5-7天)

**优先级**: P2

- [ ] 添加骨架屏和动画优化
- [ ] 实现搜索历史
- [ ] 优化UI视觉层次
- [ ] 添加使用引导

**验收标准**:
- ✅ 加载状态显示骨架屏
- ✅ 搜索历史记录正常工作
- ✅ UI视觉层次分明
- ✅ 新用户有引导流程

---

### 阶段4: 高级功能 (7-10天)

**优先级**: P3

- [ ] 数据统计可视化
- [ ] 支持主题切换
- [ ] 富文本编辑器
- [ ] 离线阅读支持

**验收标准**:
- ✅ 统计图表展示数据趋势
- ✅ 用户可以切换日间/夜间模式
- ✅ 支持富文本消息编辑
- ✅ 离线时可查看已缓存消息

---

## 优先级总结

| 优化项 | 优先级 | 预计工时 | 价值评估 |
|--------|--------|----------|---------|
| 管理员发帖修复 | P0 | 2h | ⭐⭐⭐⭐⭐ |
| 数据显示修复 | P0 | 3h | ⭐⭐⭐⭐⭐ |
| 错误提示优化 | P1 | 1h | ⭐⭐⭐⭐ |
| 消息编辑删除 | P1 | 4h | ⭐⭐⭐⭐ |
| 草稿保存 | P1 | 2h | ⭐⭐⭐⭐ |
| 骨架屏加载 | P2 | 3h | ⭐⭐⭐ |
| 搜索历史 | P2 | 2h | ⭐⭐⭐ |
| 视觉层次优化 | P2 | 4h | ⭐⭐⭐ |
| 消息推送 | P1 | 6h | ⭐⭐⭐⭐ |
| 首次引导 | P2 | 4h | ⭐⭐⭐ |

**总计**: 约36小时

---

**文档版本**: v1.0.0
**最后更新**: 2024-02-02
**维护人**: 产品 & 开发团队
