<template>
  <view class="market-page">
    <!-- Header -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <view class="header-center">
        <text class="header-title">行情中心</text>
      </view>
      <view class="header-right">
        <view class="update-info">
          <text class="update-time">{{ updateTime }}</text>
          <view class="refresh-btn" :class="{ spinning: isRefreshing }" @click="handleRefresh">
            <text class="refresh-icon">↻</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Index Bar -->
    <scroll-view class="index-bar" scroll-x :show-scrollbar="false">
      <view class="index-cards">
        <view
          v-for="(item, index) in indexData"
          :key="index"
          class="index-card"
          :class="getChangeClass(item.changePct)"
        >
          <text class="index-name">{{ item.name }}</text>
          <text class="index-value">{{ formatPrice(item.price) }}</text>
          <text class="index-change">{{ formatChangePct(item.changePct) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Stats Grid -->
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value up">{{ marketData.upCount }}</text>
        <text class="stat-label">上涨</text>
      </view>
      <view class="stat-card">
        <text class="stat-value down">{{ marketData.downCount }}</text>
        <text class="stat-label">下跌</text>
      </view>
      <view class="stat-card">
        <text class="stat-value up">{{ marketData.limitUpCount }}</text>
        <text class="stat-label">涨停</text>
      </view>
      <view class="stat-card">
        <text class="stat-value down">{{ marketData.limitDownCount }}</text>
        <text class="stat-label">跌停</text>
      </view>
    </view>

    <!-- Sentiment Card -->
    <view class="sentiment-section">
      <view class="sentiment-card">
        <view class="sentiment-header">
          <text class="sentiment-title">市场情绪</text>
          <text class="sentiment-score" :class="sentimentClass">{{ sentimentScore }}</text>
        </view>
        <view class="sentiment-bar">
          <view class="sentiment-fill" :style="{ width: sentimentScore + '%' }"></view>
        </view>
        <view class="sentiment-labels">
          <text>恐慌</text>
          <text>中性</text>
          <text>贪婪</text>
        </view>
      </view>
    </view>

    <!-- Tabs -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>

    <!-- Filter Bar -->
    <scroll-view class="filter-bar" scroll-x :show-scrollbar="false">
      <view
        v-for="filter in filters"
        :key="filter.key"
        class="filter-chip"
        :class="{ active: activeFilter === filter.key }"
        @click="setFilter(filter.key)"
      >
        <text>{{ filter.name }}</text>
      </view>
    </scroll-view>

    <!-- Tab Content -->
    <view class="tab-content">
      <!-- Ladder Tab -->
      <view class="ladder-section">
        <view
          v-for="level in filteredLadderLevels"
          :key="level.days"
          class="ladder-level"
          :class="{ expanded: expandedLevels.includes(level.days) }"
        >
          <view class="level-header" @click="toggleLevel(level.days)">
            <view class="level-badge" :class="getLevelBadgeClass(level.days)">
              <text>{{ level.days }}</text>
            </view>
            <view class="level-info">
              <text class="level-title">{{ level.days }}连板</text>
              <text class="level-subtitle">{{ level.count }}只股票 · 成交额 {{ formatAmount(level.amount) }}</text>
            </view>
            <text class="level-arrow">{{ expandedLevels.includes(level.days) ? '▲' : '▼' }}</text>
          </view>
          <view v-if="expandedLevels.includes(level.days)" class="stock-list">
            <view
              v-for="(stock, idx) in level.stocks"
              :key="stock.code"
              class="stock-item"
              @click="showStockDetail(stock)"
            >
              <text class="stock-rank">{{ idx + 1 }}</text>
              <view class="stock-info">
                <text class="stock-name">{{ stock.name }}</text>
                <view class="stock-meta">
                  <text class="stock-code">{{ stock.code }}</text>
                  <text v-if="stock.limitType" class="stock-tag" :class="getTagClass(stock.limitType)">{{ stock.limitType }}</text>
                  <text v-if="stock.isNew" class="stock-tag tag-new">次新</text>
                </view>
              </view>
              <view class="stock-price">
                <text class="stock-value up">{{ stock.price?.toFixed(2) }}</text>
                <text class="stock-change up">+{{ stock.changePct?.toFixed(2) }}%</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Fund Flow Tab -->
      <view v-if="activeTab === 'fundflow'" class="fundflow-section">
        <view class="flow-tabs">
          <view
            class="flow-tab"
            :class="{ active: fundFlowType === 'inflow' }"
            @click="fundFlowType = 'inflow'"
          >
            <text>流入</text>
          </view>
          <view
            class="flow-tab"
            :class="{ active: fundFlowType === 'outflow' }"
            @click="fundFlowType = 'outflow'"
          >
            <text>流出</text>
          </view>
        </view>
        <view class="flow-list">
          <view
            v-for="(item, index) in fundFlowData"
            :key="item.code"
            class="flow-item"
          >
            <view class="flow-rank" :class="getRankClass(index)">
              <text>{{ index + 1 }}</text>
            </view>
            <view class="flow-info">
              <text class="flow-name">{{ item.name }}</text>
              <text class="flow-stats">涨{{ item.upCount || 0 }} 跌{{ item.downCount || 0 }} 涨停{{ item.limitUpCount || 0 }}</text>
            </view>
            <view class="flow-amount" :class="fundFlowType">
              <text class="amount-value">{{ formatAmount(item.netInflow) }}</text>
              <text class="amount-pct">{{ formatPct(item.netInflowPct) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Distribution Tab -->
      <view v-if="activeTab === 'distribution'" class="distribution-section">
        <view class="chart-container">
          <view class="chart-bar" v-for="(bar, index) in distributionBars" :key="index" :class="bar.type">
            <view class="bar-fill" :style="{ height: bar.height + '%' }">
              <text class="bar-value">{{ bar.count }}</text>
            </view>
            <text class="bar-label">{{ bar.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Stock Detail Modal -->
    <view v-if="showDetailModal" class="modal-overlay" @click="closeStockDetail">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <view class="modal-title">
            <text class="stock-title">{{ selectedStock.name }}</text>
            <text class="stock-code-small">{{ selectedStock.code }} · {{ selectedStock.market }}</text>
          </view>
          <view class="modal-close" @click="closeStockDetail">
            <text>×</text>
          </view>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <!-- Price Info -->
          <view class="detail-card">
            <view class="detail-row">
              <text class="detail-label">最新价</text>
              <text class="detail-value up">{{ selectedStock.price?.toFixed(2) }} (+{{ selectedStock.changePct?.toFixed(2) }}%)</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">连板情况</text>
              <text class="detail-value">{{ selectedStock.boardInfo }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">涨停类型</text>
              <text class="detail-value" :class="getTagClass(selectedStock.limitType)">{{ selectedStock.limitType || '--' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">首次涨停</text>
              <text class="detail-value">{{ selectedStock.firstLimitTime || '--' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">开板次数</text>
              <text class="detail-value">{{ selectedStock.openCount || 0 }}次</text>
            </view>
          </view>

          <!-- Reason -->
          <view v-if="selectedStock.reason" class="reason-card">
            <text class="reason-title">涨停原因 / 题材</text>
            <text class="reason-content">{{ selectedStock.reason }}</text>
            <view v-if="selectedStock.reasonTags" class="reason-tags">
              <text v-for="tag in selectedStock.reasonTags" :key="tag" class="reason-tag">{{ tag }}</text>
            </view>
          </view>

          <!-- Fund Data -->
          <view class="detail-card">
            <text class="detail-card-title">资金数据</text>
            <view class="fund-grid">
              <view class="fund-item">
                <text class="fund-label">封单额</text>
                <text class="fund-value">{{ formatAmount(selectedStock.sealAmount) }}</text>
              </view>
              <view class="fund-item">
                <text class="fund-label">封成比</text>
                <text class="fund-value">{{ selectedStock.sealRatio?.toFixed(2) }}%</text>
              </view>
              <view class="fund-item">
                <text class="fund-label">换手率</text>
                <text class="fund-value">{{ selectedStock.turnoverRate?.toFixed(2) }}%</text>
              </view>
              <view class="fund-item">
                <text class="fund-label">量比</text>
                <text class="fund-value">{{ selectedStock.volumeRatio?.toFixed(2) }}</text>
              </view>
              <view class="fund-item">
                <text class="fund-label">净流入</text>
                <text class="fund-value" :class="selectedStock.netInflow >= 0 ? 'up' : 'down'">{{ formatAmount(selectedStock.netInflow) }}</text>
              </view>
              <view class="fund-item">
                <text class="fund-label">主力流入</text>
                <text class="fund-value" :class="selectedStock.mainInflow >= 0 ? 'up' : 'down'">{{ formatAmount(selectedStock.mainInflow) }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  getMarketOverviewApi,
  getIndexQuoteApi,
  getLimitUpLadderApi,
  getIndustryFundFlowApi
} from '../../api/market.js'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()


const loading = ref(false)
const isRefreshing = ref(false)
const updateTime = ref('')
const activeTab = ref('ladder')
const activeFilter = ref('all')
const fundFlowType = ref('inflow')
// 个股展开状态
const expandedStocks = ref([])

const toggleStockExpand = (code) => {
  const idx = expandedStocks.value.indexOf(code)
  if (idx > -1) {
    expandedStocks.value.splice(idx, 1)
  } else {
    expandedStocks.value.push(code)
  }
}

const expandedLevels = ref([3]) // 默认展开3连板
const showDetailModal = ref(false)
const selectedStock = ref({})


const marketData = ref({
  upCount: 0,
  downCount: 0,
  limitUpCount: 0,
  limitDownCount: 0,
  totalStocks: 0
})

const indexData = ref([])
const ladderData = ref({
  highestDays: 0,
  total: 0,
  levels: []
})
const fundFlowData = ref([])


const distributionData = ref({
  limitDown: 0,
  down5: 0,
  down3: 0,
  flat: 0,
  up3: 0,
  up5: 0,
  limitUp: 0
})


const tabs = [
  { key: 'ladder', name: '连板天梯' },
  { key: 'fundflow', name: '资金流向' },
  { key: 'distribution', name: '涨跌分布' }
]


const filters = [
  { key: 'all', name: '全部' },
  { key: 'main', name: '主板' },
  { key: 'gem', name: '创业板' },
  { key: 'star', name: '科创板' },
  { key: 'bj', name: '北证' }
]


const sentimentScore = computed(() => {
  const upRatio = marketData.value.totalStocks > 0
    ? (marketData.value.upCount / marketData.value.totalStocks) * 100
    : 50
  const limitRatio = marketData.value.totalStocks > 0
    ? (marketData.value.limitUpCount / marketData.value.totalStocks) * 100
    : 0

  let score = Math.round(upRatio * 0.7 + limitRatio * 3)
  score = Math.min(100, Math.max(0, score))
  return score
})

const sentimentClass = computed(() => {
  const score = sentimentScore.value
  if (score >= 70) return 'up'
  if (score >= 40) return ''
  return 'down'
})

const filteredLadderLevels = computed(() => {
  if (activeFilter.value === 'all') {
    return ladderData.value.levels
  }

  // Filter by market/board
  return ladderData.value.levels.map(level => ({
    ...level,
    stocks: level.stocks.filter(stock => {
      if (activeFilter.value === 'main') {
        return stock.code.startsWith('60') || stock.code.startsWith('00')
      }
      if (activeFilter.value === 'gem') {
        return stock.code.startsWith('30')
      }
      if (activeFilter.value === 'star') {
        return stock.code.startsWith('68')
      }
      if (activeFilter.value === 'bj') {
        return stock.code.startsWith('8') || stock.code.startsWith('4')
      }
      return true
    })
  })).filter(level => level.stocks.length > 0)
})
const distributionBars = computed(() => {
  const maxCount = Math.max(
    distributionData.value.limitDown,
    distributionData.value.down5,
    distributionData.value.down3,
    distributionData.value.flat,
    distributionData.value.up3,
    distributionData.value.up5,
    distributionData.value.limitUp,
    1
  )

  return [
    { label: '跌停', count: distributionData.value.limitDown, height: (distributionData.value.limitDown / maxCount) * 100, type: 'down' },
    { label: '-5%', count: distributionData.value.down5, height: (distributionData.value.down5 / maxCount) * 100, type: 'down' },
    { label: '-3%', count: distributionData.value.down3, height: (distributionData.value.down3 / maxCount) * 100, type: 'down' },
    { label: '平', count: distributionData.value.flat, height: (distributionData.value.flat / maxCount) * 100, type: 'flat' },
    { label: '+3%', count: distributionData.value.up3, height: (distributionData.value.up3 / maxCount) * 100, type: 'up' },
    { label: '+5%', count: distributionData.value.up5, height: (distributionData.value.up5 / maxCount) * 100, type: 'up' },
    { label: '涨停', count: distributionData.value.limitUp, height: (distributionData.value.limitUp / maxCount) * 100, type: 'up' }
  ]
})


const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/messages/messages' })
  }
}

const switchTab = (key) => {
  activeTab.value = key
  if (key === 'fundflow') {
    loadFundFlowData()
  }
}
const setFilter = (key) => {
  activeFilter.value = key
}
const toggleLevel = (days) => {
  const index = expandedLevels.value.indexOf(days)
  if (index > -1) {
    expandedLevels.value.splice(index, 1)
  } else {
    expandedLevels.value.push(days)
  }
}
const showStockDetail = (stock) => {
  selectedStock.value = stock
  showDetailModal.value = true
}
const closeStockDetail = () => {
  showDetailModal.value = false
  selectedStock.value = {}
}
const handleRefresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  await refreshData()
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
  updateUpdateTime()
}

const getChangeClass = (pct) => {
  if (!pct) return ''
  const num = parseFloat(pct)
  return num >= 0 ? 'up' : 'down'
}
const getLevelBadgeClass = (days) => {
  if (days >= 4) return 'high'
  if (days >= 2) return 'mid'
  return 'low'
}
const getTagClass = (type) => {
  if (!type) return ''
  const t = type.toLowerCase()
  if (t.includes('t字') || t.includes('t板')) return 'tag-t'
  if (t.includes('一字') || t.includes('一字板')) return 'tag-yizi'
  if (t.includes('换手')) return 'tag-huanshou'
  return ''
}
const getRankClass = (index) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}
const formatPrice = (price) => {
  if (!price) return '--'
  return parseFloat(price).toLocaleString()
}
const formatChangePct = (pct) => {
  if (!pct) return '0.00%'
  const num = parseFloat(pct)
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%'
}
const formatAmount = (amount) => {
  if (!amount) return '0'
  const num = Math.abs(parseFloat(amount))
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toFixed(2)
}
const formatPct = (pct) => {
  if (!pct) return '0%'
  const num = parseFloat(pct)
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%'
}
const updateUpdateTime = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  updateTime.value = `${now.getFullYear()}-${month}-${day} ${hours}:${minutes} 更新`
}

const loadMarketOverview = async () => {
  try {
    const res = await getMarketOverviewApi()
    if (res.code === 200 && res.data) {
      marketData.value = {
        upCount: res.data.upCount || 0,
        downCount: res.data.downCount || 0,
        limitUpCount: res.data.limitUpCount || 0,
        limitDownCount: res.data.limitDownCount || 0,
        totalStocks: res.data.totalStocks || 4000
      }
    }
  } catch (e) {
    console.error('加载市场概览失败:', e)
  }
}
const loadIndexData = async () => {
  try {
    const res = await getIndexQuoteApi()
    if (res.code === 200 && res.data) {
      indexData.value = res.data || []
    }
  } catch (e) {
    console.error('加载指数数据失败:', e)
  }
}
const loadLadderData = async () => {
  try {
    const res = await getLimitUpLadderApi()
    if (res.code === 200 && res.data) {
      ladderData.value = {
        highestDays: res.data.highestDays || 0,
        total: res.data.total || 0,
        levels: res.data.levels || []
      }
      // 计算每层的成交额
      ladderData.value.levels.forEach(level => {
        level.amount = level.stocks?.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
      })
    }
  } catch (e) {
    console.error('加载连板天梯失败:', e)
  }
}
const loadFundFlowData = async () => {
  try {
    const res = await getIndustryFundFlowApi({ type: fundFlowType.value, top: 10 })
    if (res.code === 200 && res.data) {
      fundFlowData.value = res.data.industries || res.data || []
    }
  } catch (e) {
    console.error('加载资金流向失败:', e)
  }
}
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadMarketOverview(),
      loadIndexData(),
      loadLadderData(),
      loadFundFlowData()
    ])
  } finally {
    loading.value = false
  }
}
const checkLogin = () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none', duration: 2000 })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1500)
    return false
  }
  return true
}

let timeTimer = null
onMounted(() => {
  updateUpdateTime()
  timeTimer = setInterval(updateUpdateTime, 60000) // 更新时间每分钟

  if (checkLogin()) {
    refreshData()
  }
})
onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
})
</script>

<style lang="scss" scoped>
$up-color: #ff4757;
$down-color: #2ed573;
$primary-color: #5d9cec;
$bg-dark: #0f1419;
$bg-card: #1e2636;

.market-page {
  min-height: 100vh;
  background: $bg-dark;
  color: #fff;
}


.header {
  background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%);
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);

  .header-left {
    width: 60rpx;
    .back-icon {
      font-size: 48rpx;
      color: #fff;
    }
  }
  .header-center {
    .header-title {
      font-size: 36rpx;
      font-weight: 600;
    }
  }
  .header-right {
    .update-info {
      display: flex;
      align-items: center;
      gap: 16rpx;
      .update-time {
        font-size: 24rpx;
        color: rgba(255,255,255,0.6);
      }
      .refresh-btn {
        padding: 8rpx 16rpx;
        background: rgba(255,255,255,0.1);
        border-radius: 8rpx;
        .refresh-icon {
          display: inline-block;
          &.spinning {
            animation: spin 1s linear infinite;
          }
        }
      }
    }
  }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.index-bar {
  white-space: nowrap;
  padding: 16rpx;
  .index-cards {
    display: inline-flex;
    gap: 16rpx;
  }
  .index-card {
    display: inline-flex;
    flex-direction: column;
    min-width: 160rpx;
    padding: 16rpx;
    background: rgba(255,255,255,0.05);
    border-radius: 12rpx;
    &.up {
      .index-value, .index-change { color: $up-color; }
    }
    &.down {
      .index-value, .index-change { color: $down-color; }
    }
    .index-name {
      font-size: 24rpx;
      color: rgba(255,255,255,0.6);
    }
    .index-value {
      font-size: 32rpx;
      font-weight: 600;
      margin: 8rpx 0;
    }
    .index-change {
      font-size: 24rpx;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding: 0 32rpx;
  .stat-card {
    background: rgba(255,255,255,0.05);
    border-radius: 16rpx;
    padding: 20rpx;
    text-align: center;
    .stat-value {
      font-size: 40rpx;
      font-weight: 700;
      &.up { color: $up-color; }
      &.down { color: $down-color; }
    }
    .stat-label {
      font-size: 24rpx;
      color: rgba(255,255,255,0.6);
      margin-top: 8rpx;
    }
  }
}

.sentiment-section {
  padding: 0 32rpx 32rpx;
  .sentiment-card {
    background: linear-gradient(135deg, #2a3447 0%, #1e2636 100%);
    border-radius: 24rpx;
    padding: 28rpx;
  }
  .sentiment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  .sentiment-title {
    font-size: 28rpx;
    color: rgba(255,255,255,0.8);
  }
  .sentiment-score {
    font-size: 36rpx;
    font-weight: 700;
    &.up { color: $up-color; }
    &.down { color: $down-color; }
  }
  .sentiment-bar {
    height: 12rpx;
    background: #1a2030;
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 12rpx;
  }
  .sentiment-fill {
    height: 100%;
    border-radius: 6rpx;
    background: linear-gradient(90deg, $down-color 0%, #ffa502 50%, $up-color 100%);
    transition: width 0.5s ease;
  }
  .sentiment-labels {
    display: flex;
    justify-content: space-between;
    font-size: 20rpx;
    color: rgba(255,255,255,0.5);
  }
}

.tabs {
  display: flex;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  .tab {
    flex: 1;
    text-align: center;
    padding: 24rpx;
    font-size: 28rpx;
    color: rgba(255,255,255,0.5);
    position: relative;
    &.active {
      color: #fff;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80rpx;
        height: 6rpx;
        background: $primary-color;
        border-radius: 3rpx;
      }
    }
  }
}

.filter-bar {
  white-space: nowrap;
  padding: 24rpx 32rpx;
  background: rgba(0,0,0,0.2);
  .filter-chip {
    display: inline-block;
    padding: 12rpx 24rpx;
    background: rgba(255,255,255,0.1);
    border-radius: 32rpx;
    font-size: 24rpx;
    color: rgba(255,255,255,0.6);
    margin-right: 16rpx;
    &.active {
      background: $primary-color;
      color: #fff;
    }
  }
}

.tab-content {
  padding: 24rpx 32rpx;
  padding-bottom: 120rpx;
}

.ladder-section {
  .ladder-level {
    background: linear-gradient(135deg, #2a3447 0%, #1e2636 100%);
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .level-header {
    display: flex;
    align-items: center;
    padding: 28rpx;
  }
  .level-badge {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    font-weight: 700;
    margin-right: 24rpx;
    &.high { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%); }
    &.mid { background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%); }
    &.low { background: linear-gradient(135deg, #2ed573 0%, #26a65b 100%); }
  }
  .level-info {
    flex: 1;
  }
  .level-title {
    font-size: 30rpx;
    font-weight: 600;
  }
  .level-subtitle {
    font-size: 24rpx;
    color: rgba(255,255,255,0.6);
    margin-top: 4rpx;
  }
  .level-arrow {
    font-size: 24rpx;
    color: rgba(255,255,255,0.5);
    transition: transform 0.3s;
  }
  .ladder-level.expanded .level-arrow {
    transform: rotate(180deg);
  }
  .stock-list {
    border-top: 1px solid rgba(255,255,255,0.05);
    .stock-item {
      display: flex;
      align-items: center;
      padding: 24rpx 28rpx;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      &:last-child {
        border-bottom: none;
      }
    }
    .stock-rank {
      width: 40rpx;
      font-size: 24rpx;
      color: rgba(255,255,255,0.5);
    }
    .stock-info {
      flex: 1;
    }
    .stock-name {
      font-size: 28rpx;
      font-weight: 500;
    }
    .stock-meta {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-top: 6rpx;
    }
    .stock-code {
      font-size: 22rpx;
      color: rgba(255,255,255,0.5);
    }
    .stock-tag {
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      font-size: 20rpx;
      &.tag-t { background: rgba(255, 165, 2, 0.2); color: #ffa502; }
      &.tag-yizi { background: rgba(255, 71, 87, 0.2); color: #ff4757; }
      &.tag-huanshou { background: rgba(46, 213, 115, 0.2); color: #2ed573; }
      &.tag-new { background: rgba(93, 156, 236, 0.2); color: #5d9cec; }
    }
    .stock-price {
      text-align: right;
    }
    .stock-value {
      font-size: 28rpx;
      font-weight: 600;
    }
    .stock-change {
      font-size: 24rpx;
      margin-top: 4rpx;
    }
  }
}

.fundflow-section {
  .flow-tabs {
    display: flex;
    gap: 32rpx;
    margin-bottom: 24rpx;
  }
  .flow-tab {
    padding: 16rpx 32rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.5);
    &.active {
      background: rgba($up-color, 0.2);
      color: $up-color;
    }
  }
  .flow-list {
    .flow-item {
      display: flex;
      align-items: center;
      gap: 24rpx;
      padding: 24rpx;
      background: rgba(255,255,255,0.02);
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .flow-rank {
      width: 56rpx;
      height: 56rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 700;
      &.gold { background: linear-gradient(135deg, #f39c12, #e67e22); color: #fff; }
      &.silver { background: linear-gradient(135deg, #bdc3c7, #95a5a6); color: #fff; }
      &.bronze { background: linear-gradient(135deg, #e17055  #d35400); color: #fff; }
      &.normal { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
    }
    .flow-info {
      flex: 1;
      .flow-name {
        font-size: 28rpx;
        font-weight: 500;
      }
      .flow-stats {
        font-size: 22rpx;
        color: rgba(255,255,255,0.4);
        margin-top: 4rpx;
      }
    }
    .flow-amount {
      text-align: right;
      &.inflow .amount-value, &.inflow .amount-pct { color: $up-color; }
      &.outflow .amount-value, &.outflow .amount-pct { color: $down-color; }
      .amount-value {
        font-size: 28rpx;
        font-weight: 600;
      }
      .amount-pct {
        font-size: 22rpx;
        margin-top: 4rpx;
      }
    }
  }
}

.distribution-section {
  .chart-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 400rpx;
    padding: 40rpx;
    background: rgba(255,255,255,0.03);
    border-radius: 24rpx;
  }
  .chart-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80rpx;
    .bar-fill {
      width: 60rpx;
      min-height: 20rpx;
      border-radius: 8rpx 8rpx 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      transition: height 0.5s ease;
      .bar-value {
        font-size: 20rpx;
        color: #fff;
        margin-bottom: 8rpx;
      }
    }
    .bar-label {
      font-size: 20rpx;
      color: rgba(255,255,255,0.6);
      margin-top: 12rpx;
      white-space: nowrap;
    }
    &.up .bar-fill {
      background: linear-gradient(180deg, $up-color 0%, darken($up-color, 20%) 100%);
    }
    &.down .bar-fill {
      background: linear-gradient(180deg, $down-color 0%, darken($down-color, 20%) 100%);
    }
    &.flat .bar-fill {
      background: linear-gradient(180deg, #636e72 0%, #b2bec3 100%);
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}
.modal-content {
  background: linear-gradient(180deg, #1e2636 0%, #151a24 100%);
  border-radius: 40rpx 40rpx 0 0;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  .modal-title {
    .stock-title {
      font-size: 36rpx;
      font-weight: 600;
    }
    .stock-code-small {
      font-size: 26rpx;
      color: rgba(255,255,255,0.6);
    }
  }
  .modal-close {
    width: 64rpx;
    height: 64rpx;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    color: rgba(255,255,255,0.6);
  }
}
.modal-body {
  padding: 32rpx;
  max-height: 60vh;
}
.detail-card {
  background: rgba(255,255,255,0.05);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.detail-card-title {
  font-size: 26rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
  color: rgba(255,255,255,0.8);
}
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  &:last-child {
    border-bottom: none;
  }
  .detail-label {
    font-size: 26rpx;
    color: rgba(255,255,255,0.6);
  }
  .detail-value {
    font-size: 26rpx;
    font-weight: 500;
    &.up { color: $up-color; }
    &.down { color: $down-color; }
    &.tag-t { color: #ffa502; }
    &.tag-yizi { color: #ff4757; }
    &.tag-huanshou { color: #2ed573; }
  }
}
.reason-card {
  background: linear-gradient(135deg, #2a4a6d 0%, #1e3a5f 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.reason-title {
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12rpx;
}
.reason-content {
  font-size: 28rpx;
  line-height: 1.6;
}
.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.reason-tag {
  background: rgba(255,255,255,0.15);
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}
.fund-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.fund-item {
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
}
.fund-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
}
.fund-value {
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 8rpx;
  &.up { color: $up-color; }
  &.down { color: $down-color; }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($bg-dark,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255,255,255,0.1);
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: rgba(255,255,255,0.8);
}

/* 市场温度计 - 2x2网格布局 */
.thermometer-section {
  margin: 20rpx;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.2);
}
.thermo-header {
  margin-bottom: 16rpx;
}
.thermo-title {
  font-size: 28rpx;
  color: #00ffff;
  font-weight: bold;
}
.thermo-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.thermo-row {
  display: flex;
  gap: 12rpx;
}
.thermo-card {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
}
.thermo-card.up-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
  border: 1rpx solid rgba(34, 197, 94, 0.3);
}
.thermo-card.down-card {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1rpx solid rgba(239, 68, 68, 0.3);
}
.thermo-label {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}
.thermo-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
}
.thermo-value.up {
  color: #22c55e;
}
.thermo-value.down {
  color: #ef4444;
}

/* 情绪条样式调整 */
.sentiment-bar-section {
  margin: 0 20rpx 20rpx;
}
.sentiment-bar-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.1);
}

/* 独立卡片容器 */
.cards-container {
  padding: 0 20rpx;
}
.card-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.2);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}
.card-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}
.card-title {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
}

/* 个股展开功能 */
.stock-item-wrapper {
  margin-bottom: 12rpx;
}
.stock-expand-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8rpx;
  padding: 16rpx;
  margin-top: 8rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.1);
}
.expand-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.expand-label {
  font-size: 22rpx;
  color: #888;
  width: 100rpx;
}
.expand-value {
  font-size: 22rpx;
  color: #fff;
  flex: 1;
}
.expand-btn {
  font-size: 20rpx;
  color: #00ffff;
  padding: 8rpx;
}

</style>
