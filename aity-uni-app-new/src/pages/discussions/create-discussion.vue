<template>
  <view class="create-discussion-container">
    <view class="header">
      <button class="back-btn" @click="goBack">
        <text>←</text>
      </button>
      <text class="title">发起讨论</text>
      <button class="submit-btn" @click="submitDiscussion">
        <text>发布</text>
      </button>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <text class="form-label">标题</text>
        <input 
          v-model="discussionForm.title" 
          type="text" 
          placeholder="请输入讨论标题"
          class="form-input"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">内容</text>
        <textarea 
          v-model="discussionForm.content" 
          placeholder="请输入讨论内容"
          class="form-textarea"
          rows="6"
        ></textarea>
      </view>
      
      <view v-if="messageId" class="form-item">
        <text class="form-label">关联消息</text>
        <view class="message-info">
          <text class="message-info-text">{{ messageTitle || '加载中...' }}</text>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">标签</text>
        <view class="tags-container">
          <view 
            v-for="tag in discussionForm.tags" 
            :key="tag"
            class="tag-item"
          >
            <text class="tag-text">{{ tag }}</text>
            <button class="tag-remove" @click="removeTag(tag)">
              <text>×</text>
            </button>
          </view>
          <input 
            v-model="newTag"
            type="text" 
            placeholder="输入标签后按回车"
            class="tag-input"
            @keyup.enter="addTag"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../store/user'
import { createDiscussionApi } from '../../api/discussion'
import { navigateTo, navigateBack } from '../../utils/navigation'

const route = useRoute()
const userStore = useUserStore()
const messageId = route.query.message_id
const messageTitle = ref('')

const discussionForm = reactive({
  title: '',
  content: '',
  message_id: messageId || '',
  tags: []
})

const newTag = ref('')

const addTag = () => {
  if (newTag.value.trim() && !discussionForm.tags.includes(newTag.value.trim())) {
    discussionForm.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = discussionForm.tags.indexOf(tag)
  if (index > -1) {
    discussionForm.tags.splice(index, 1)
  }
}

const submitDiscussion = async () => {
  if (!discussionForm.title.trim()) {
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '请输入讨论标题',
        icon: 'none'
      })
    }
    return
  }
  
  if (!discussionForm.content.trim()) {
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '请输入讨论内容',
        icon: 'none'
      })
    }
    return
  }
  
  try {
    const response = await createDiscussionApi(discussionForm)
    
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })
    }
    
    navigateTo('/pages/discussions/discussions')
  } catch (error) {
    console.error('Create discussion error:', error)
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '发布失败',
        icon: 'none'
      })
    }
  }
}

const goBack = () => {
  navigateBack()
}

const loadMessageTitle = async () => {
  if (messageId) {
    messageTitle.value = '示例消息标题'
  }
}

onMounted(() => {
  loadMessageTitle()
})
</script>

<style scoped>
.create-discussion-container {
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

.submit-btn {
  padding: 6px 16px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
}

.form-container {
  background-color: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  min-height: 120px;
  resize: none;
}

.message-info {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.message-info-text {
  font-size: 14px;
  color: #666;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #e6f7ff;
  border-radius: 16px;
  font-size: 14px;
  color: #1890ff;
}

.tag-text {
  margin-right: 8px;
}

.tag-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background-color: transparent;
  border: none;
  color: #1890ff;
  cursor: pointer;
}

.tag-input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  font-size: 14px;
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
  
  .submit-btn {
    padding: 12rpx 32rpx;
    font-size: 28rpx;
  }
  
  .form-container {
    margin: 32rpx;
    padding: 48rpx;
  }
  
  .form-label {
    font-size: 32rpx;
    margin-bottom: 24rpx;
  }
  
  .form-input {
    padding: 24rpx 32rpx;
    font-size: 28rpx;
  }
  
  .form-textarea {
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    min-height: 240rpx;
  }
  
  .message-info {
    padding: 32rpx;
  }
  
  .message-info-text {
    font-size: 28rpx;
  }
  
  .tag-item {
    padding: 12rpx 24rpx;
    font-size: 28rpx;
  }
  
  .tag-remove {
    width: 40rpx;
    height: 40rpx;
    font-size: 32rpx;
  }
  
  .tag-input {
    padding: 16rpx 24rpx;
    font-size: 28rpx;
  }
}
</style>

<style>
/* 全局样式在index.scss中定义 */
</style>