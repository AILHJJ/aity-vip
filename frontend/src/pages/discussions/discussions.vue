<template>
  <view class="discussions-container">
    <view class="header">
      <text class="title">讨论中心</text>
      <button class="refresh-btn" @click="refreshDiscussions">
        <text>刷新</text>
      </button>
    </view>
    
    <view class="filter-bar">
      <view class="filter-item" 
        v-for="status in discussionStatuses" 
        :key="status.value"
        :class="{ active: activeStatus === status.value }"
        @click="filterByStatus(status.value)"
      >
        {{ status.label }}
      </view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="discussions.length === 0" class="empty-state">
      <text class="empty-state-icon">💬</text>
      <text class="empty-state-text">暂无讨论</text>
    </view>
    
    <view v-else class="discussions-list">
      <view 
        v-for="discussion in discussions" 
        :key="discussion.id"
        class="discussion-item"
        @click="goToDiscussionDetail(discussion.id)"
      >
        <view class="discussion-header">
          <text class="discussion-title">{{ discussion.title }}</text>
          <text 
            class="discussion-status"
            :class="discussion.status"
          >
            {{ getStatusLabel(discussion.status) }}
          </text>
        </view>
        
        <view class="discussion-meta">
          <text class="discussion-author">{{ discussion.user_name }}</text>
          <text class="discussion-time">{{ formatTime(discussion.created_at) }}</text>
        </view>
        
        <view class="discussion-content">
          <text class="discussion-text">{{ discussion.content }}</text>
        </view>
        
        <view class="discussion-footer">
          <text class="message-title">关联消息：{{ discussion.message_title }}</text>
          <text class="reply-count">{{ discussion.reply_count }} 条回复</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getDiscussionsApi } from '../../api/discussion'
import { formatTime } from '../../utils/time'
import { getDiscussionStatusLabel } from '../../utils/constants'
import { navigateTo } from '../../utils/navigation'

const userStore = useUserStore()
const loading = ref(true)
const discussions = ref([])
const activeStatus = ref('all')

const discussionStatuses = [
  { label: '全部', value: 'all' },
  { label: '待回复', value: 'pending' },
  { label: '已回复', value: 'replied' }
]

const getStatusLabel = (status) => {
  return getDiscussionStatusLabel(status)
}

const loadDiscussions = async () => {
  loading.value = true
  
  try {
    const response = await getDiscussionsApi({ status: activeStatus.value })
    discussions.value = response.data
  } catch (error) {
    console.error('Load discussions error:', error)
    uni.showToast({
      title: '加载讨论失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const refreshDiscussions = () => {
  loadDiscussions()
}

const filterByStatus = (status) => {
  activeStatus.value = status
  loadDiscussions()
}

const goToDiscussionDetail = (discussionId) => {
  navigateTo(`/pages/discussions/discussion-detail?id=${discussionId}`)
}

onMounted(() => {
  loadDiscussions()
})
</script>

<style scoped>
.discussions-container {
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

.discussions-list {
  padding: 20px;
}

.discussion-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.discussion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.discussion-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 10px;
}

.discussion-status {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
}

.discussion-status.pending {
  color: #faad14;
  background-color: #fff7e6;
}

.discussion-status.replied {
  color: #52c41a;
  background-color: #f6ffed;
}

.discussion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.discussion-author {
  font-weight: bold;
}

.discussion-content {
  margin-bottom: 12px;
}

.discussion-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discussion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
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
  
  .discussions-list {
    padding: 40rpx;
  }
  
  .discussion-item {
    padding: 40rpx;
    margin-bottom: 32rpx;
  }
  
  .discussion-title {
    font-size: 32rpx;
  }
  
  .discussion-status {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
  }
  
  .discussion-meta {
    font-size: 28rpx;
  }
  
  .discussion-text {
    font-size: 28rpx;
  }
  
  .discussion-footer {
    font-size: 24rpx;
  }
}
</style>

<style>
/* 全局样式在index.scss中定义 */
</style>