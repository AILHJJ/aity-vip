<template>
  <view class="favorites-container">
    <view class="header">
      <text class="title">我的收藏</text>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="favorites.length === 0" class="empty-state">
      <text class="empty-state-icon">⭐</text>
      <text class="empty-state-text">暂无收藏</text>
    </view>
    
    <view v-else class="favorites-list">
      <view 
        v-for="message in favorites" 
        :key="message.id"
        class="favorite-item"
        @click="viewMessage(message.id)"
      >
        <view class="favorite-header">
          <text class="favorite-title">{{ message.title }}</text>
        </view>
        
        <view class="favorite-meta">
          <view 
            v-for="type in message.types" 
            :key="type"
            class="tag"
            :class="'tag-' + getTypeTagType(type)"
          >
            {{ getTypeLabel(type) }}
          </view>
          <view 
            v-for="tag in message.tags" 
            :key="tag"
            class="tag tag-success"
          >
            {{ getTagLabel(tag) }}
          </view>
          <text class="favorite-time">{{ formatTime(message.created_at) }}</text>
        </view>
        
        <view class="favorite-content">
          <text class="favorite-summary">{{ message.content }}</text>
        </view>
        
        <view class="favorite-footer">
          <view class="favorite-author">
            <text class="author-avatar">{{ message.sender_name?.charAt(0).toUpperCase() }}</text>
            <text class="author-name">{{ message.sender_name }}</text>
          </view>
          
          <button 
            class="btn btn-danger btn-small"
            @click.stop="handleRemoveFavorite(message.id)"
          >
            取消收藏
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
import { getFavorites, removeFavorite } from '../../api/favorite'
import { formatRelativeTime } from '../../utils/time'

const router = useRouter()

const favorites = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)

async function fetchFavorites() {
  try {
    loading.value = true
    const response = await getFavorites({
      page: currentPage.value,
      pageSize: pageSize.value
    })

    favorites.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

function viewMessage(id) {
  router.push(`/message-detail?id=${id}`)
}

async function handleRemoveFavorite(id) {
  try {
    await removeFavorite(id)
    await fetchFavorites()
  } catch (error) {
    console.error('取消收藏失败:', error)
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchFavorites()
  }
}

function nextPage() {
  if (currentPage.value < Math.ceil(total.value / pageSize.value)) {
    currentPage.value++
    fetchFavorites()
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

function getTypeTagType(type) {
  switch (type) {
    case 'system':
      return 'info'
    case 'important':
      return 'warning'
    case 'risk_warning':
      return 'danger'
    default:
      return ''
  }
}

function getTagLabel(tag) {
  const tags = {
    short_term: '短线策略',
    mid_term: '中线策略',
    all: '全部用户'
  }
  return tags[tag] || tag
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
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

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorite-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.favorite-header {
  margin-bottom: 12px;
}

.favorite-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.favorite-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
}

.tag-info {
  background: #e6f7ff;
  color: #1890ff;
}

.tag-warning {
  background: #fff7e6;
  color: #fa8c16;
}

.tag-danger {
  background: #fff1f0;
  color: #f5222d;
}

.tag-success {
  background: #f6ffed;
  color: #52c41a;
}

.favorite-time {
  font-size: 12px;
  color: #999;
}

.favorite-content {
  margin-bottom: 12px;
}

.favorite-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.favorite-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.author-name {
  font-size: 14px;
  color: #666;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #ff4d4f;
  color: #fff;
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
  .favorites-container {
    padding: 20rpx;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .favorite-title {
    font-size: 32rpx;
  }
  
  .tag {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
  }
  
  .favorite-summary {
    font-size: 28rpx;
  }
  
  .btn {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
  }
}
</style>