<template>
  <view class="create-message-container">
    <view class="header">
      <button class="back-btn" @click="goBack">
        <text>←</text>
      </button>
      <text class="title">发布消息</text>
      <button class="submit-btn" @click="submitMessage">
        <text>发布</text>
      </button>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <text class="form-label">标题</text>
        <input 
          v-model="messageForm.title" 
          type="text" 
          placeholder="请输入消息标题"
          class="form-input"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">内容</text>
        <textarea
          v-model="messageForm.content"
          placeholder="请输入消息内容，支持 Ctrl+V 粘贴图片"
          class="form-textarea"
          rows="6"
          @paste="handlePaste"
        ></textarea>
      </view>
      
      <view class="form-item">
        <text class="form-label">分组</text>
        <view class="group-selector">
          <view 
            v-for="group in groups" 
            :key="group.id"
            :class="{ active: messageForm.group_id === group.id }"
            class="group-item"
            @click="selectGroup(group.id)"
          >
            {{ group.name }}
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">标签</text>
        <view class="tags-container">
          <view 
            v-for="tag in messageForm.tags" 
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
      
      <view class="form-item">
        <text class="form-label">附件</text>
        <button class="upload-btn" @click="uploadAttachment">
          <text>📎 上传附件（支持 Ctrl+V 粘贴图片）</text>
        </button>
        <view v-if="messageForm.attachments.length > 0" class="attachments-list">
          <view 
            v-for="(attachment, index) in messageForm.attachments" 
            :key="index"
            class="attachment-item"
          >
            <text class="attachment-name">{{ attachment.name }}</text>
            <button class="attachment-remove" @click="removeAttachment(index)">
              <text>×</text>
            </button>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">可见范围</text>
        <view class="visibility-selector">
          <label class="radio-label">
            <input 
              v-model="messageForm.visibility" 
              type="radio" 
              value="all"
            />
            <text class="radio-text">全部成员</text>
          </label>
          <label class="radio-label">
            <input 
              v-model="messageForm.visibility" 
              type="radio" 
              value="group"
            />
            <text class="radio-text">仅分组成员</text>
          </label>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { createMessageApi } from '../../api/message'
import { navigateTo, navigateBack } from '../../utils/navigation'

const router = useRouter()
const userStore = useUserStore()
const messageForm = reactive({
  title: '',
  content: '',
  group_id: '',
  tags: [],
  attachments: [],
  visibility: 'all'
})
const newTag = ref('')
const groups = ref([])

const selectGroup = (group_id) => {
  messageForm.group_id = group_id
}

const addTag = () => {
  if (newTag.value.trim() && !messageForm.tags.includes(newTag.value.trim())) {
    messageForm.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = messageForm.tags.indexOf(tag)
  if (index > -1) {
    messageForm.tags.splice(index, 1)
  }
}

const uploadAttachment = () => {
  if (typeof uni !== 'undefined') {
    uni.chooseImage({
      count: 5,
      success: (res) => {
        res.tempFilePaths.forEach((path, index) => {
          const fileName = path.split('/').pop()
          messageForm.attachments.push({
            name: fileName,
            path: path
          })
        })
      }
    })
  }
}

// 处理粘贴事件
const handlePaste = (e) => {
  // 浏览器环境支持粘贴图片
  if (e.clipboardData && e.clipboardData.items && e.clipboardData.items.length > 0) {
    const items = e.clipboardData.items
    let hasImage = false

    // 遍历剪贴板项
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      // 检查是否是图片类型
      if (item.type && item.type.indexOf('image') !== -1) {
        e.preventDefault() // 阻止默认粘贴行为
        hasImage = true

        // 获取图片文件
        const file = item.getAsFile()

        if (!file) continue

        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) {
          alert('图片大小不能超过 10MB')
          continue
        }

        // 检查图片数量限制
        if (messageForm.attachments.length >= 9) {
          alert('最多只能上传9张图片')
          continue
        }

        // 创建临时URL
        const tempUrl = URL.createObjectURL(file)

        // 添加到附件列表
        messageForm.attachments.push({
          name: `粘贴图片_${messageForm.attachments.length + 1}.jpg`,
          path: tempUrl,
          size: file.size
        })

        // 显示成功提示
        if (typeof uni !== 'undefined') {
          uni.showToast({
            title: '图片已添加',
            icon: 'success',
            duration: 1500
          })
        } else {
          alert('图片已添加')
        }

        console.log('粘贴图片成功:', file.name, '大小:', file.size)
      }
    }
  }

  // 对于普通文本粘贴，不阻止默认行为
  return true
}

const removeAttachment = (index) => {
  messageForm.attachments.splice(index, 1)
}

const submitMessage = async () => {
  if (!messageForm.title.trim()) {
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '请输入消息标题',
        icon: 'none'
      })
    }
    return
  }
  
  if (!messageForm.content.trim()) {
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '请输入消息内容',
        icon: 'none'
      })
    }
    return
  }
  
  if (!messageForm.group_id) {
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '请选择分组',
        icon: 'none'
      })
    }
    return
  }
  
  try {
    const response = await createMessageApi(messageForm)
    
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })
    }
    
    navigateTo('/pages/messages/messages')
  } catch (error) {
    console.error('Create message error:', error)
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

const loadGroups = async () => {
  groups.value = [
    { id: 1, name: '技术部' },
    { id: 2, name: '产品部' },
    { id: 3, name: '设计部' }
  ]
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.create-message-container {
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

.group-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.group-item {
  padding: 10px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.group-item.active {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #e6f7ff;
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

.upload-btn {
  padding: 12px 24px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px dashed #1890ff;
  border-radius: 4px;
  margin-bottom: 16px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.attachment-name {
  font-size: 14px;
  color: #666;
  flex: 1;
}

.attachment-remove {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background-color: transparent;
  border: none;
  color: #999;
  cursor: pointer;
}

.visibility-selector {
  display: flex;
  gap: 32px;
}

.radio-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  margin-right: 8px;
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
  
  .group-item {
    padding: 20rpx 40rpx;
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
  
  .upload-btn {
    padding: 24rpx 48rpx;
    font-size: 28rpx;
  }
  
  .attachment-item {
    padding: 24rpx;
  }
  
  .attachment-name {
    font-size: 28rpx;
  }
  
  .attachment-remove {
    width: 48rpx;
    height: 48rpx;
    font-size: 32rpx;
  }
  
  .radio-label {
    font-size: 28rpx;
  }
}
</style>

<style>
/* 全局样式在index.scss中定义 */
</style>