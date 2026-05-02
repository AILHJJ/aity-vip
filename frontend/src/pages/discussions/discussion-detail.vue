<template>
  <view class="discussion-detail-container">
    <view class="header">
      <button class="back-btn" @click="goBack">
        <text>←</text>
      </button>
      <text class="title">讨论详情</text>
      <view class="header-right"></view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="!discussion" class="empty-state">
      <text class="empty-state-icon">💬</text>
      <text class="empty-state-text">讨论不存在</text>
    </view>
    
    <view v-else class="discussion-content">
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
      
      <view class="discussion-body">
        <text class="discussion-text">{{ discussion.content }}</text>
      </view>
      
      <view v-if="discussion.message_title" class="message-info">
        <text class="message-info-label">关联消息：</text>
        <text 
          class="message-info-title"
          @click="goToMessageDetail(discussion.message_id)"
        >
          {{ discussion.message_title }}
        </text>
      </view>
      
      <view class="replies-section">
        <text class="replies-title">回复 ({{ replies.length }})</text>
        
        <view v-if="replies.length === 0" class="empty-replies">
          <text class="empty-replies-text">暂无回复，快来发表你的看法吧</text>
        </view>
        
        <view v-else class="replies-list">
          <view 
            v-for="(reply, index) in replies" 
            :key="index"
            class="reply-item"
          >
            <view class="reply-header">
              <text class="reply-author">{{ reply.sender_name }}</text>
              <text class="reply-time">{{ formatTime(reply.created_at) }}</text>
            </view>
            <view class="reply-body">
              <text class="reply-content">{{ reply.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 回复输入区域 -->
    <view class="reply-input-container">
      <input 
        v-model="replyContent" 
        type="text" 
        placeholder="请输入你的回复..."
        class="reply-input"
      />
      <button class="send-btn" @click="sendReply">
        <text>发送</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../store/user'
import { getDiscussionDetailApi, replyDiscussionApi } from '../../api/discussion'
import { formatTime } from '../../utils/time'
import { navigateTo, navigateBack } from '../../utils/navigation'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(true)
const discussion = ref(null)
const replies = ref([])
const replyContent = ref('')

const discussionId = route.query.id

const getStatusLabel = (status) => {
  const statusMap = {
    pending: '待回复',
    replied: '已回复'
  }
  return statusMap[status] || status
}

const loadDiscussionDetail = async () => {
  if (!discussionId) {
    loading.value = false
    return
  }
  
  loading.value = true
  
  try {
    const response = await getDiscussionDetailApi(discussionId)
    discussion.value = response.data
    replies.value = response.data.replies || []
  } catch (error) {
    console.error('Load discussion detail error:', error)
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '加载讨论失败',
        icon: 'none'
      })
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  navigateBack()
}

const goToMessageDetail = (messageId) => {
  navigateTo(`/pages/message-detail/message-detail?id=${messageId}`)
}

const sendReply = async () => {
  if (!replyContent.value.trim()) {
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '请输入回复内容',
        icon: 'none'
      })
    }
    return
  }
  
  try {
    const response = await replyDiscussionApi(discussionId, {
      content: replyContent.value
    })
    
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '回复成功',
        icon: 'success'
      })
    }
    
    await loadDiscussionDetail()
    replyContent.value = ''
  } catch (error) {
    console.error('Send reply error:', error)
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '回复失败',
        icon: 'none'
      })
    }
  }
}

onMounted(() => {
  loadDiscussionDetail()
})
</script>

<style scoped>
.discussion-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: transparent;
  border: none;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-right {
  width: 32px;
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

.discussion-content {
  background-color: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.discussion-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 10px;
}

.discussion-status {
  padding: 6px 12px;
  font-size: 14px;
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
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.discussion-author {
  font-weight: bold;
}

.discussion-body {
  margin-bottom: 24px;
  line-height: 1.8;
}

.discussion-text {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
}

.message-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.message-info-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.message-info-title {
  font-size: 14px;
  color: #1890ff;
  text-decoration: underline;
  cursor: pointer;
}

.replies-section {
  margin-top: 24px;
}

.replies-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: block;
}

.empty-replies {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fafafa;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.reply-author {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-body {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.reply-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.reply-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  font-size: 14px;
  margin-right: 10px;
  height: 40px;
}

.send-btn {
  padding: 0 20px;
  height: 40px;
  font-size: 14px;
  color: #fff;
  background-color: #1890ff;
  border: none;
  border-radius: 20px;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .header {
    padding: 40rpx;
  }
  
  .back-btn {
    width: 64rpx;
    height: 64rpx;
    font-size: 40rpx;
  }
  
  .title {
    font-size: 36rpx;
  }
  
  .header-right {
    width: 64rpx;
  }
  
  .discussion-content {
    margin: 32rpx;
    padding: 48rpx;
  }
  
  .discussion-title {
    font-size: 40rpx;
  }
  
  .discussion-status {
    padding: 12rpx 24rpx;
    font-size: 28rpx;
  }
  
  .discussion-meta {
    font-size: 28rpx;
  }
  
  .discussion-text {
    font-size: 32rpx;
  }
  
  .message-info {
    padding: 32rpx;
  }
  
  .message-info-label {
    font-size: 28rpx;
  }
  
  .message-info-title {
    font-size: 28rpx;
  }
  
  .replies-title {
    font-size: 36rpx;
  }
  
  .empty-replies {
    padding: 80rpx 40rpx;
    font-size: 28rpx;
  }
  
  .reply-item {
    padding: 32rpx;
  }
  
  .reply-author {
    font-size: 28rpx;
  }
  
  .reply-time {
    font-size: 24rpx;
  }
  
  .reply-content {
    font-size: 28rpx;
  }
  
  .reply-input-container {
    padding: 24rpx 32rpx;
  }
  
  .reply-input {
    padding: 20rpx 32rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
    height: 80rpx;
  }
  
  .send-btn {
    padding: 0 40rpx;
    height: 80rpx;
    font-size: 28rpx;
  }
}
</style>

<style>
/* 全局样式在index.scss中定义 */
</style>