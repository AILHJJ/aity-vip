<template>
  <view class="messages-container">
    <view class="header">
      <text class="title">消息中心</text>
      <view class="header-actions">
        <button class="refresh-btn" @click="refreshMessages" :class="{ 'loading': refreshing }">
          <text>{{ refreshing ? '刷新中...' : '刷新' }}</text>
        </button>
      </view>
    </view>
    
    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
        <view class="filter-items">
          <view class="filter-item" 
            v-for="tag in messageTags" 
            :key="tag.value"
            :class="{ active: activeTag === tag.value }"
            @click="filterByTag(tag.value)"
          >
            {{ tag.label }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="messages.length === 0" class="empty-state">
      <view class="empty-icon-container">
        <text class="empty-state-icon">📭</text>
      </view>
      <text class="empty-state-title">暂无消息</text>
      <text class="empty-state-subtitle">您可以稍后再来查看，或刷新页面重试</text>
      <button class="empty-refresh-btn" @click="refreshMessages">
        <text>刷新</text>
      </button>
    </view>
    
    <view v-else class="messages-list">
      <view 
        v-for="message in messages" 
        :key="message.id"
        class="message-item"
        :class="{ 'unread': !message.isRead }"
        @click="goToMessageDetail(message.id)"
      >
        <view class="message-header">
          <view class="message-title-container">
            <text class="message-title">{{ message.title }}</text>
            <view v-if="!message.isRead" class="unread-indicator"></view>
          </view>
          <text class="message-time">{{ formatTime(message.created_at) }}</text>
        </view>
        <view class="message-meta">
          <text class="message-sender">{{ message.sender_name || '管理员' }}</text>
          <text class="message-type">{{ getMessageTypeLabel(message.type) }}</text>
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
              {{ getMessageTagLabel(tag) }}
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
      <button class="create-message-btn" @click="createMessage">
        <text class="btn-icon">+</text>
        <text class="btn-text">发布消息</text>
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
const refreshing = ref(false)
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
    // 模拟添加已读状态，实际应该从API获取
    messages.value = response.data.map(msg => ({
      ...msg,
      isRead: msg.read_count > 0
    }))
  } catch (error) {
    console.error('Load messages error:', error)
    uni.showToast({
      title: '加载消息失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const refreshMessages = () => {
  refreshing.value = true
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
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background-color: #e6f7ff;
}

.refresh-btn.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-bar {
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 72px;
  z-index: 90;
}

.filter-scroll {
  white-space: nowrap;
  padding: 12px 20px;
}

.filter-items {
  display: inline-flex;
  gap: 12px;
}

.filter-item {
  padding: 8px 18px;
  font-size: 14px;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.filter-item:hover {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.filter-item.active {
  color: #fff;
  background-color: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 400px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(24, 144, 255, 0.2);
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  min-height: 400px;
}

.empty-icon-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

.empty-state-icon {
  font-size: 48px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.empty-state-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
  line-height: 1.5;
  max-width: 300px;
}

.empty-refresh-btn {
  padding: 10px 24px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-refresh-btn:hover {
  background-color: #1890ff;
  color: #fff;
}

.messages-list {
  padding: 20px;
}

.message-item {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.message-item.unread {
  border-left: 4px solid #1890ff;
  background-color: #f6f9ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.message-title-container {
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 12px;
}

.message-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 8px;
  line-height: 1.4;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff4d4f;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.message-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}

.message-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
}

.message-sender {
  font-weight: 500;
}

.message-type {
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.message-content {
  margin-bottom: 14px;
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
  flex-wrap: wrap;
  gap: 10px;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.message-tag {
  padding: 4px 10px;
  font-size: 12px;
  color: #1890ff;
  background-color: #e6f7ff;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.message-tag:hover {
  background-color: #91d5ff;
  color: #096dd9;
}

.message-stats {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.admin-actions {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.create-message-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border: none;
  border-radius: 50px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-message-btn:hover {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.5);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
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
    padding: 16rpx 32rpx;
    font-size: 28rpx;
  }
  
  .filter-scroll {
    padding: 24rpx 40rpx;
  }
  
  .filter-item {
    padding: 12rpx 36rpx;
    font-size: 28rpx;
    border-radius: 40rpx;
  }
  
  .messages-list {
    padding: 40rpx;
  }
  
  .message-item {
    padding: 40rpx;
    margin-bottom: 32rpx;
    border-radius: 20rpx;
  }
  
  .message-title {
    font-size: 32rpx;
  }
  
  .message-time {
    font-size: 24rpx;
  }
  
  .message-meta {
    font-size: 24rpx;
    gap: 24rpx;
  }
  
  .message-text {
    font-size: 28rpx;
  }
  
  .message-tag {
    padding: 8rpx 20rpx;
    font-size: 24rpx;
  }
  
  .message-stats {
    font-size: 24rpx;
  }
  
  .admin-actions {
    bottom: 48rpx;
    right: 48rpx;
  }
  
  .create-message-btn {
    padding: 28rpx 48rpx;
    font-size: 28rpx;
    border-radius: 100rpx;
  }
  
  .btn-icon {
    font-size: 36rpx;
  }
  
  .empty-icon-container {
    width: 200rpx;
    height: 200rpx;
  }
  
  .empty-state-icon {
    font-size: 96rpx;
  }
  
  .empty-state-title {
    font-size: 36rpx;
  }
  
  .empty-state-subtitle {
    font-size: 28rpx;
  }
  
  .empty-refresh-btn {
    padding: 20rpx 48rpx;
    font-size: 28rpx;
  }
}
</style>