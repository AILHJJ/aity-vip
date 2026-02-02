<template>
  <view class="message-detail-container">
    <view class="header">
      <button class="back-btn" @click="goBack">
        <text>←</text>
      </button>
      <text class="title">消息详情</text>
      <view class="header-right"></view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="!message" class="empty-state">
      <text class="empty-state-icon">📭</text>
      <text class="empty-state-text">消息不存在</text>
    </view>
    
    <view v-else class="message-content">
      <view class="message-header">
        <text class="message-title">{{ message.title }}</text>
        <text class="message-time">{{ formatTime(message.created_at) }}</text>
      </view>
      
      <view class="message-meta">
        <text class="message-sender">发送者：{{ message.sender }}</text>
        <text class="message-group">分组：{{ message.group_name }}</text>
      </view>
      
      <view class="message-tags">
        <view 
          v-for="tag in message.tags" 
          :key="tag"
          class="message-tag"
        >
          {{ tag }}
        </view>
      </view>
      
      <view class="message-body">
        <view v-html="message.content"></view>
      </view>
      
      <view v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
        <text class="attachments-title">附件：</text>
        <view class="attachments-list">
          <view 
            v-for="(attachment, index) in message.attachments" 
            :key="index"
            class="attachment-item"
            @click="downloadAttachment(attachment)"
          >
            <text class="attachment-icon">📎</text>
            <text class="attachment-name">{{ attachment.name }}</text>
          </view>
        </view>
      </view>
      
      <view class="message-stats">
        <text class="read-count">{{ message.read_count }} 人已读</text>
        <text class="total-count">{{ message.total_count }} 人可查看</text>
      </view>
    </view>
    
    <!-- 讨论区域 -->
    <view class="discussion-section">
      <view class="section-header">
        <text class="section-title">讨论 ({{ discussions.length }})</text>
        <button class="create-discussion-btn" @click="createDiscussion">
          <text>发起讨论</text>
        </button>
      </view>
      
      <view v-if="discussions.length === 0" class="empty-discussions">
        <text class="empty-text">暂无讨论，快来发起第一个讨论吧</text>
      </view>
      
      <view v-else class="discussions-list">
        <view 
          v-for="discussion in discussions" 
          :key="discussion.id"
          class="discussion-item"
        >
          <view class="discussion-header">
            <text class="discussion-author">{{ discussion.user_name }}</text>
            <text class="discussion-time">{{ formatTime(discussion.created_at) }}</text>
          </view>
          <view class="discussion-content">
            <text>{{ discussion.content }}</text>
          </view>
          <view class="discussion-replies">
            <view 
              v-for="(reply, index) in discussion.replies" 
              :key="index"
              class="reply-item"
            >
              <text class="reply-author">{{ reply.sender_name }}：</text>
              <text class="reply-content">{{ reply.content }}</text>
            </view>
          </view>
          <view class="discussion-actions">
            <button class="reply-btn" @click="replyDiscussion(discussion.id)">
              <text>回复</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { getMessageDetailApi } from '../../api/message'
import { getDiscussionsApi } from '../../api/discussion'
import { formatTime } from '../../utils/time'
import { navigateTo, navigateBack } from '../../utils/navigation'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const message = ref(null)
const discussions = ref([])

const messageId = route.query.id

const loadMessageDetail = async () => {
  if (!messageId) {
    loading.value = false
    return
  }
  
  loading.value = true
  
  try {
    const response = await getMessageDetailApi(messageId)
    message.value = response.data
    
    await loadDiscussions()
  } catch (error) {
    console.error('Load message detail error:', error)
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '加载消息失败',
        icon: 'none'
      })
    }
  } finally {
    loading.value = false
  }
}

const loadDiscussions = async () => {
  try {
    const response = await getDiscussionsApi({ message_id: messageId })
    discussions.value = response.data
  } catch (error) {
    console.error('Load discussions error:', error)
  }
}

const goBack = () => {
  navigateBack()
}

const createDiscussion = () => {
  navigateTo(`/pages/discussions/create-discussion?message_id=${messageId}`)
}

const replyDiscussion = (discussionId) => {
  navigateTo(`/pages/discussions/reply-discussion?id=${discussionId}`)
}

const downloadAttachment = (attachment) => {
  if (typeof uni !== 'undefined') {
    uni.downloadFile({
      url: attachment.url,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              uni.showToast({
                title: '下载成功',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  }
}

onMounted(() => {
  loadMessageDetail()
})
</script>

<style scoped>
.message-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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

.message-content {
  background-color: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-header {
  margin-bottom: 16px;
}

.message-title {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.message-time {
  font-size: 14px;
  color: #999;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.message-tag {
  padding: 6px 12px;
  font-size: 14px;
  color: #1890ff;
  background-color: #e6f7ff;
  border-radius: 4px;
}

.message-body {
  margin-bottom: 24px;
  line-height: 1.8;
}

.message-body :deep(p) {
  margin-bottom: 12px;
}

.message-body :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 12px 0;
}

.message-attachments {
  margin-bottom: 24px;
}

.attachments-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

.attachment-icon {
  font-size: 16px;
  margin-right: 8px;
}

.attachment-name {
  font-size: 14px;
  color: #666;
}

.message-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.discussion-section {
  background-color: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.create-discussion-btn {
  padding: 6px 12px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
}

.empty-discussions {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.discussions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.discussion-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.discussion-author {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.discussion-time {
  font-size: 12px;
  color: #999;
}

.discussion-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.discussion-replies {
  margin-left: 20px;
  margin-bottom: 12px;
}

.reply-item {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.reply-author {
  font-weight: bold;
  color: #333;
}

.discussion-actions {
  display: flex;
  justify-content: flex-end;
}

.reply-btn {
  padding: 4px 8px;
  font-size: 12px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
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
  
  .message-content {
    margin: 32rpx;
    padding: 48rpx;
  }
  
  .message-title {
    font-size: 40rpx;
    margin-bottom: 16rpx;
  }
  
  .message-time {
    font-size: 28rpx;
  }
  
  .message-meta {
    font-size: 28rpx;
    margin-bottom: 32rpx;
  }
  
  .message-tag {
    padding: 12rpx 24rpx;
    font-size: 28rpx;
  }
  
  .message-body {
    font-size: 28rpx;
    margin-bottom: 48rpx;
  }
  
  .attachments-title {
    font-size: 32rpx;
    margin-bottom: 24rpx;
  }
  
  .attachment-item {
    padding: 24rpx;
  }
  
  .attachment-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
  }
  
  .attachment-name {
    font-size: 28rpx;
  }
  
  .message-stats {
    font-size: 28rpx;
    padding-top: 32rpx;
  }
  
  .discussion-section {
    margin: 32rpx;
    padding: 48rpx;
  }
  
  .section-title {
    font-size: 32rpx;
  }
  
  .create-discussion-btn {
    padding: 12rpx 24rpx;
    font-size: 28rpx;
  }
  
  .empty-discussions {
    padding: 80rpx 40rpx;
    font-size: 28rpx;
  }
  
  .discussion-item {
    padding: 32rpx;
  }
  
  .discussion-author {
    font-size: 28rpx;
  }
  
  .discussion-time {
    font-size: 24rpx;
  }
  
  .discussion-content {
    font-size: 28rpx;
  }
  
  .reply-item {
    font-size: 28rpx;
  }
  
  .reply-btn {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
  }
}
</style>

<style>
/* 全局样式在index.scss中定义 */
</style>