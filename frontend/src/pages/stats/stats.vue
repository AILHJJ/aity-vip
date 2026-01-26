<template>
  <view class="stats-container">
    <view class="header">
      <text class="title">统计分析</text>
    </view>
    
    <view class="time-range">
      <view 
        v-for="range in timeRanges" 
        :key="range.value"
        :class="{ active: timeRange === range.value }"
        class="range-item"
        @click="selectTimeRange(range.value)"
      >
        {{ range.label }}
      </view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else class="stats-content">
      <view class="stat-cards">
        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(24, 144, 255, 0.1)">
            <text class="icon">📄</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.messageCount || 0 }}</text>
            <text class="stat-label">消息总数</text>
          </view>
        </view>
        
        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(82, 196, 26, 0.1)">
            <text class="icon">👁️</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.readCount || 0 }}</text>
            <text class="stat-label">阅读总数</text>
          </view>
        </view>
        
        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(250, 173, 20, 0.1)">
            <text class="icon">💬</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.discussionCount || 0 }}</text>
            <text class="stat-label">讨论总数</text>
          </view>
        </view>
        
        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(255, 77, 79, 0.1)">
            <text class="icon">👤</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.userCount || 0 }}</text>
            <text class="stat-label">用户总数</text>
          </view>
        </view>
      </view>
      
      <view class="chart-section">
        <view class="chart-card">
          <view class="chart-header">
            <text class="chart-title">消息数量趋势</text>
          </view>
          <view class="chart-content">
            <view 
              v-for="(item, index) in messageTrend" 
              :key="index"
              class="trend-item"
            >
              <text class="trend-date">{{ item.date }}</text>
              <view class="trend-bar-container">
                <view 
                  class="trend-bar"
                  :style="{ width: (item.count / maxTrendCount * 100) + '%' }"
                ></view>
              </view>
              <text class="trend-count">{{ item.count }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="chart-section">
        <view class="chart-card">
          <view class="chart-header">
            <text class="chart-title">消息类型分布</text>
          </view>
          <view class="chart-content">
            <view 
              v-for="(value, key) in messageTypeDistribution" 
              :key="key"
              class="distribution-item"
            >
              <text class="distribution-label">{{ key }}</text>
              <view class="distribution-bar-container">
                <view 
                  class="distribution-bar"
                  :style="{ width: (value / maxDistributionCount * 100) + '%' }"
                ></view>
              </view>
              <text class="distribution-count">{{ value }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="chart-section">
        <view class="chart-card">
          <view class="chart-header">
            <text class="chart-title">用户活跃度</text>
          </view>
          <view class="chart-content">
            <view 
              v-for="(item, index) in userActivity" 
              :key="index"
              class="activity-item"
            >
              <text class="activity-date">{{ item.date }}</text>
              <view class="activity-bar-container">
                <view 
                  class="activity-bar"
                  :style="{ width: (item.count / maxActivityCount * 100) + '%' }"
                ></view>
              </view>
              <text class="activity-count">{{ item.count }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStats } from '../../api/stats'

const timeRange = ref('today')
const timeRanges = [
  { label: '今天', value: 'today' },
  { label: '最近7天', value: '7days' },
  { label: '最近30天', value: '30days' },
  { label: '最近90天', value: '90days' }
]

const stats = ref({})
const messageTrend = ref([])
const messageTypeDistribution = ref({})
const userActivity = ref([])
const loading = ref(false)

const maxTrendCount = computed(() => {
  return Math.max(...messageTrend.value.map(item => item.count), 1)
})

const maxDistributionCount = computed(() => {
  return Math.max(...Object.values(messageTypeDistribution.value), 1)
})

const maxActivityCount = computed(() => {
  return Math.max(...userActivity.value.map(item => item.count), 1)
})

async function fetchStats() {
  try {
    loading.value = true
    const response = await getStats({
      timeRange: timeRange.value
    })

    stats.value = response.data
    messageTrend.value = response.data.messageTrend || []
    messageTypeDistribution.value = response.data.messageTypeDistribution || {}
    userActivity.value = response.data.userActivity || []
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

function selectTimeRange(range) {
  timeRange.value = range
  fetchStats()
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.stats-container {
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

.time-range {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.range-item {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  color: #666;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
}

.range-item.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
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

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 28px;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.chart-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-item,
.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trend-date,
.activity-date {
  width: 80px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.trend-bar-container,
.activity-bar-container {
  flex: 1;
  height: 24px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.trend-bar,
.activity-bar {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.trend-count,
.activity-count {
  width: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: right;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.distribution-label {
  width: 120px;
  font-size: 14px;
  color: #666;
}

.distribution-bar-container {
  flex: 1;
  height: 24px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.distribution-bar {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.distribution-count {
  width: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: right;
}

@media screen and (max-width: 750rpx) {
  .stats-container {
    padding: 20rpx;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .range-item {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
  }
  
  .stat-card {
    padding: 40rpx;
  }
  
  .stat-value {
    font-size: 56rpx;
  }
  
  .stat-label {
    font-size: 28rpx;
  }
}
</style>