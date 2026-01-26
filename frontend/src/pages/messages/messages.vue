<template>
  <view class="messages-container">
    <view class="header">
      <text class="title">消息中心</text>
      <button class="refresh-btn" @click="refreshMessages">
        <text>刷新</text>
      </button>
    </view>
    
    <view class="filter-bar">
      <view class="filter-item" 
        v-for="tag in messageTags" 
        :key="tag.value"
        :class="{ active: activeTag === tag.value }"
        @click="filterByTag(tag.value)"
      >
        {{ tag.label }}
      </view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="messages.length === 0" class="empty-state">
      <text class="empty-state-icon">📭</text>
      <text class="empty-state-text">暂无消息</text>
    </view>
    
    <view v-else class="messages-list">
      <view 
        v-for="message in messages" 
        :key="message.id"
        class="message-item"
        @click="goToMessageDetail(message.id)"
      >
        <view class="message-header">
          <text class="message-title">{{ message.title }}</text>
          <text class="message-time">{{ formatTime(message.created_at) }}</text>
        </view>
        <view class="message-content">
          <text class="message-text">{{ message.content }}</text>
        </view>
        <view class="message-footer">
          <view class="message-tags">
            <view 
              v-for="tag in message.tags" 
              :key="tag"
              class="message-tag"
            >
              {{ tag }}
            </view>
          </view>
          <view class="message-stats">
            <text class="message-read-count">{{ message.read_count }} 已读</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 管理员操作按钮 -->
    <view v-if="userStore.isAdmin" class="admin-actions">
      <button class="btn btn-primary" @click="createMessage">
        <text>发布消息</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { getMessagesApi } from '../../api/message'
import { formatTime } from '../../utils/time'
import { MESSAGE_TYPE_LABELS, MESSAGE_TAG_LABELS, MESSAGE_TYPES, MESSAGE_TAGS } from '../../utils/constants'
import { navigateTo } from '../../utils/navigation'

const userStore = useUserStore()
const loading = ref(true)
const messages = ref([])
const activeTag = ref('all')

const messageTags = [
  { label: '全部', value: 'all' },
  { label: '盘前点评', value: MESSAGE_TYPES.PRE_MARKET_COMMENT },
  { label: '早盘点评', value: MESSAGE_TYPES.MORNING_COMMENT },
  { label: '早盘关注', value: MESSAGE_TYPES.MORNING_FOCUS },
  { label: '尾盘点评', value: MESSAGE_TYPES.AFTERNOON_COMMENT },
  { label: '尾盘关注', value: MESSAGE_TYPES.AFTERNOON_FOCUS },
  { label: '收盘点评', value: MESSAGE_TYPES.CLOSE_COMMENT },
  { label: '风险提示', value: MESSAGE_TYPES.RISK_WARNING },
  { label: '系统消息', value: MESSAGE_TYPES.SYSTEM },
  { label: '重要消息', value: MESSAGE_TYPES.IMPORTANT },
  { label: '日常消息', value: MESSAGE_TYPES.DAILY }
]

const loadMessages = async () => {
  loading.value = true
  
  try {
    const response = await getMessagesApi({ type: activeTag.value })
    messages.value = response.data
  } catch (error) {
    console.error('Load messages error:', error)
    uni.showToast({
      title: '加载消息失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const refreshMessages = () => {
  loadMessages()
}

const filterByTag = (tag) => {
  activeTag.value = tag
  loadMessages()
}

const goToMessageDetail = (messageId) => {
  navigateTo(`/pages/message-detail/message-detail?id=${messageId}`)
}

const createMessage = () => {
  navigateTo('/pages/admin/messages/create-message')
}

const getMessageTypeLabel = (type) => {
  return MESSAGE_TYPE_LABELS[type] || type
}

const getMessageTagLabel = (tag) => {
  return MESSAGE_TAG_LABELS[tag] || tag
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.messages-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.refresh-btn {
  padding: 6px 12px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
}

.filter-bar {
  display: flex;
  overflow-x: auto;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.filter-item {
  padding: 8px 16px;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 16px;
  white-space: nowrap;
  cursor: pointer;
}

.filter-item.active {
  color: #fff;
  background-color: #1890ff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-text {
  font-size: 16px;
  color: #999;
}

.messages-list {
  padding: 20px;
}

.message-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.message-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 10px;
}

.message-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.message-content {
  margin-bottom: 12px;
}

.message-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-tag {
  padding: 4px 8px;
  font-size: 12px;
  color: #1890ff;
  background-color: #e6f7ff;
  border-radius: 4px;
}

.message-stats {
  font-size: 12px;
  color: #999;
}

.admin-actions {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .header {
    padding: 40rpx;
  }
  
  .title {
    font-size: 36rpx;
  }
  
  .refresh-btn {
    padding: 12rpx 24rpx;
    font-size: 28rpx;
  }
  
  .filter-bar {
    padding: 20rpx 40rpx;
  }
  
  .filter-item {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
  }
  
  .messages-list {
    padding: 40rpx;
  }
  
  .message-item {
    padding: 40rpx;
    margin-bottom: 32rpx;
  }
  
  .message-title {
    font-size: 32rpx;
  }
  
  .message-time {
    font-size: 24rpx;
  }
  
  .message-text {
    font-size: 28rpx;
  }
  
  .message-tag {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
  }
  
  .message-stats {
    font-size: 24rpx;
  }
  
  .admin-actions {
    bottom: 40rpx;
    right: 40rpx;
  }
  
  .btn {
    padding: 24rpx 48rpx;
    font-size: 32rpx;
  }
}
</style>