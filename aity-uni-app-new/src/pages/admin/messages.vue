<template>
  <view class="admin-messages-container">
    <view class="header">
      <text class="title">消息管理</text>
      <button class="btn btn-primary" @click="goToCreateMessage">
        发布消息
      </button>
    </view>
    
    <view class="filter-bar">
      <input 
        v-model="searchKeyword" 
        class="search-input"
        placeholder="搜索消息标题或内容"
        @input="handleSearch"
      />
      
      <view class="filter-select">
        <picker 
          :value="typeIndex" 
          :range="typeOptions" 
          range-key="label"
          @change="handleTypeChange"
        >
          <view class="picker">
            {{ typeIndex === -1 ? '消息类型' : typeOptions[typeIndex].label }}
          </view>
        </picker>
      </view>
      
      <view class="filter-select">
        <picker 
          :value="groupIndex" 
          :range="groupOptions" 
          range-key="label"
          @change="handleGroupChange"
        >
          <view class="picker">
            {{ groupIndex === -1 ? '分组' : groupOptions[groupIndex].label }}
          </view>
        </picker>
      </view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="messages.length === 0" class="empty-state">
      <text class="empty-state-icon">📄</text>
      <text class="empty-state-text">暂无消息</text>
    </view>
    
    <view v-else class="messages-list">
      <view 
        v-for="message in messages" 
        :key="message.id"
        class="message-item"
        @click="viewMessage(message.id)"
      >
        <view class="message-header">
          <text class="message-title">{{ message.title }}</text>
          <view class="message-type" :class="'type-' + message.type">
            {{ getTypeLabel(message.type) }}
          </view>
        </view>
        
        <view class="message-meta">
          <text class="meta-item">发送者：{{ message.sender_name }}</text>
          <text class="meta-item">分组：{{ message.group_name }}</text>
          <text class="meta-item">时间：{{ formatTime(message.created_at) }}</text>
        </view>
        
        <view class="message-tags">
          <view 
            v-for="tag in message.tags" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </view>
        </view>
        
        <view class="message-stats">
          <text class="stat-item">阅读：{{ message.read_count || 0 }}</text>
          <text class="stat-item">收藏：{{ message.favorite_count || 0 }}</text>
          <text class="stat-item">讨论：{{ message.discussion_count || 0 }}</text>
        </view>
        
        <view class="message-actions">
          <button 
            class="btn btn-small btn-primary"
            @click.stop="editMessage(message)"
          >
            编辑
          </button>
          <button 
            class="btn btn-small btn-danger"
            @click.stop="deleteMessage(message)"
          >
            删除
          </button>
        </view>
      </view>
    </view>
    
    <view v-if="total > pageSize" class="pagination">
      <button 
        class="btn btn-small" 
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        上一页
      </button>
      <text class="page-info">{{ currentPage }} / {{ Math.ceil(total / pageSize) }}</text>
      <button 
        class="btn btn-small" 
        :disabled="currentPage >= Math.ceil(total / pageSize)"
        @click="nextPage"
      >
        下一页
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMessages, deleteMessage as deleteMessageApi } from '../../api/message'
import { getGroups } from '../../api/group'
import { formatRelativeTime } from '../../utils/time'

const router = useRouter()

const messages = ref([])
const groups = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const typeIndex = ref(-1)
const groupIndex = ref(-1)
const loading = ref(false)

const typeOptions = [
  { label: '盘前点评', value: 'pre_market_comment' },
  { label: '早盘点评', value: 'morning_comment' },
  { label: '早盘关注', value: 'morning_focus' },
  { label: '尾盘点评', value: 'afternoon_comment' },
  { label: '尾盘关注', value: 'afternoon_focus' },
  { label: '收盘点评', value: 'close_comment' },
  { label: '风险提示', value: 'risk_warning' },
  { label: '系统消息', value: 'system' },
  { label: '重要消息', value: 'important' },
  { label: '日常消息', value: 'daily' }
]

const groupOptions = ref([
  { label: '全部分组', value: '' }
])

async function fetchMessages() {
  try {
    loading.value = true
    const response = await getMessages({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      type: typeIndex.value >= 0 ? typeOptions[typeIndex.value].value : '',
      group_id: groupIndex.value >= 0 ? groupOptions.value[groupIndex.value].value : ''
    })

    messages.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error('获取消息列表失败:', error)
  } finally {
    loading.value = false
  }
}

async function fetchGroups() {
  try {
    const response = await getGroups()
    const groupList = response.data.list || response.data || []
    groupOptions.value = [
      { label: '全部分组', value: '' },
      ...groupList.map(g => ({ label: g.name, value: g.id }))
    ]
  } catch (error) {
    console.error('获取分组列表失败:', error)
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchMessages()
}

function handleTypeChange(e) {
  typeIndex.value = e.detail.value
  fetchMessages()
}

function handleGroupChange(e) {
  groupIndex.value = e.detail.value
  fetchMessages()
}

function viewMessage(id) {
  router.push(`/message-detail?id=${id}`)
}

function goToCreateMessage() {
  router.push('/create-message')
}

function editMessage(message) {
  router.push(`/create-message?id=${message.id}`)
}

async function deleteMessage(message) {
  try {
    await deleteMessageApi(message.id)
    await fetchMessages()
  } catch (error) {
    console.error('删除消息失败:', error)
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchMessages()
  }
}

function nextPage() {
  if (currentPage.value < Math.ceil(total.value / pageSize.value)) {
    currentPage.value++
    fetchMessages()
  }
}

function formatTime(time) {
  return formatRelativeTime(time)
}

function getTypeLabel(type) {
  const types = {
    pre_market_comment: '盘前点评',
    morning_comment: '早盘点评',
    morning_focus: '早盘关注',
    afternoon_comment: '尾盘点评',
    afternoon_focus: '尾盘关注',
    close_comment: '收盘点评',
    risk_warning: '风险提示',
    system: '系统消息',
    important: '重要消息',
    daily: '日常消息'
  }
  return types[type] || type
}

onMounted(() => {
  fetchGroups()
  fetchMessages()
})
</script>

<style scoped>
.admin-messages-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.filter-select {
  min-width: 120px;
}

.picker {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.message-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.message-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
}

.type-system {
  background: #e6f7ff;
  color: #1890ff;
}

.type-important {
  background: #fff7e6;
  color: #fa8c16;
}

.type-risk_warning {
  background: #fff1f0;
  color: #f5222d;
}

.message-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 14px;
  color: #666;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f6ffed;
  color: #52c41a;
}

.message-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.stat-item {
  font-size: 14px;
  color: #666;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
}

.btn-danger:hover {
  background-color: #ff7875;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.page-info {
  font-size: 14px;
  color: #666;
}

@media screen and (max-width: 750rpx) {
  .admin-messages-container {
    padding: 20rpx;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .search-input {
    padding: 20rpx 32rpx;
    font-size: 28rpx;
  }
  
  .btn {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
  }
}
</style>