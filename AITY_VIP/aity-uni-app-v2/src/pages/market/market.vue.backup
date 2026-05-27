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
      <view v-if="activeTab === 'ladder'" class="ladder-section">
        <!-- 骨架屏 -->
        <market-skeleton v-if="loading && ladderData.levels.length === 0" :count="3" :showDetail="true" />
        <!-- 空状态 -->
        <empty-state v-else-if="filteredLadderLevels.length === 0" type="market" title="暂无连板天梯数据" description="今日暂无涨停连板股票" :showAction="false" />
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
            @click="fundFlowType = 'inflow'; loadFundFlowData()"
          >
            <text>流入</text>
          </view>
          <view
            class="flow-tab"
            :class="{ active: fundFlowType === 'outflow' }"
            @click="fundFlowType = 'outflow'; loadFundFlowData()"
          >
            <text>流出</text>
          </view>
        </view>
        <!-- 骨架屏 -->
        <market-skeleton v-if="loading && fundFlowData.length === 0" :count="5" />
        <!-- 空状态 -->
        <empty-state v-else-if="fundFlowData.length === 0" type="market" title="暂无资金流向数据" description="今日暂无行业资金流向记录" :showAction="false" />
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
        <!-- 骨架屏 -->
        <market-skeleton v-if="loading" :count="1" />
        <!-- 空状态 -->
        <empty-state v-else-if="distributionData.limitDown === 0 && distributionData.up3 === 0 && distributionData.flat === 0" type="market" title="暂无涨跌分布数据" description="暂无市场涨跌分布统计" :showAction="false" />
        <view v-else class="chart-container">
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

    <!-- Loading Overlay - 仅首次加载时显示 -->
    <view v-if="loading && !hasInitialized" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载行情数据...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getMarketOverviewApi,
  getIndexQuoteApi,
  getLimitUpLadderApi,
  getIndustryFundFlowApi
} from '../../api/market.js'
import { useUserStore } from '../../store/user'
import MarketSkeleton from '@/components/market-skeleton.vue'
import EmptyState from '@/components/empty-state.vue'

const userStore = useUserStore()


const loading = ref(false)
const hasInitialized = ref(false)
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
      // 从概览数据推算涨跌分布（后端未提供细分数据，按比例估算）
      const up = res.data.upCount || 0
      const down = res.data.downCount || 0
      const limitUp = res.data.limitUpCount || 0
      const limitDown = res.data.limitDownCount || 0
      const total = res.data.totalStocks || (up + down)
      const flat = Math.max(0, total - up - down)
      // 按比例拆分上涨/下跌到各区间
      const upNonLimit = up - limitUp
      const downNonLimit = down - limitDown
      distributionData.value = {
        limitDown: limitDown,
        down5: Math.round(downNonLimit * 0.3),
        down3: Math.round(downNonLimit * 0.5),
        flat: flat,
        up3: Math.round(upNonLimit * 0.45),
        up5: Math.round(upNonLimit * 0.3),
        limitUp: limitUp
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
    hasInitialized.value = true
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

onShow(() => {
  // 刷新 tabBar 未读角标
  userStore.updateTabBarBadge()
})
</script>

<style lang="scss" scoped>
/* 行情中心页面 - 使用统一CSS变量系统 */
.market-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Header - 统一导航栏风格 */
.header {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid var(--border-primary);

  .header-left {
    width: 60rpx;
    .back-icon {
      font-size: 48rpx;
      color: var(--text-primary);
    }
  }
  .header-center {
    .header-title {
      font-size: 36rpx;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  .header-right {
    .update-info {
      display: flex;
      align-items: center;
      gap: 16rpx;
      .update-time {
        font-size: 24rpx;
        color: var(--text-tertiary);
      }
      .refresh-btn {
        padding: 8rpx 16rpx;
        background: var(--bg-tertiary);
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

/* Index Bar - 指数行情横向滚动 */
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
    background: var(--bg-card);
    border-radius: 16rpx;
    border: 1rpx solid var(--border-primary);
    box-shadow: var(--shadow-card);
    &.up {
      .index-value, .index-change { color: var(--color-up); }
    }
    &.down {
      .index-value, .index-change { color: var(--color-down); }
    }
    .index-name {
      font-size: 24rpx;
      color: var(--text-tertiary);
    }
    .index-value {
      font-size: 32rpx;
      font-weight: 600;
      margin: 8rpx 0;
      color: var(--text-primary);
    }
    .index-change {
      font-size: 24rpx;
    }
  }
}

/* Stats Grid - 市场概览数据卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding: 0 32rpx;
  .stat-card {
    background: var(--bg-card);
    border-radius: 16rpx;
    padding: 20rpx;
    text-align: center;
    border: 1rpx solid var(--border-primary);
    box-shadow: var(--shadow-card);
    .stat-value {
      font-size: 40rpx;
      font-weight: 700;
      &.up { color: var(--color-up); }
      &.down { color: var(--color-down); }
    }
    .stat-label {
      font-size: 24rpx;
      color: var(--text-tertiary);
      margin-top: 8rpx;
    }
  }
}

/* Sentiment Section - 市场情绪 */
.sentiment-section {
  padding: 0 32rpx 32rpx;
  .sentiment-card {
    background: var(--bg-card);
    border-radius: 24rpx;
    padding: 28rpx;
    border: 1rpx solid var(--border-primary);
    box-shadow: var(--shadow-card);
  }
  .sentiment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  .sentiment-title {
    font-size: 28rpx;
    color: var(--text-secondary);
  }
  .sentiment-score {
    font-size: 36rpx;
    font-weight: 700;
    &.up { color: var(--color-up); }
    &.down { color: var(--color-down); }
  }
  .sentiment-bar {
    height: 12rpx;
    background: var(--bg-tertiary);
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 12rpx;
  }
  .sentiment-fill {
    height: 100%;
    border-radius: 6rpx;
    background: linear-gradient(90deg, var(--color-down) 0%, var(--color-accent) 50%, var(--color-up) 100%);
    transition: width 0.5s ease;
  }
  .sentiment-labels {
    display: flex;
    justify-content: space-between;
    font-size: 20rpx;
    color: var(--text-tertiary);
  }
}

/* Tabs - 标签切换 */
.tabs {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1rpx solid var(--border-primary);
  .tab {
    flex: 1;
    text-align: center;
    padding: 24rpx;
    font-size: 28rpx;
    color: var(--text-tertiary);
    position: relative;
    transition: all 0.3s ease;
    &.active {
      color: var(--color-primary);
      font-weight: 600;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80rpx;
        height: 6rpx;
        background: var(--color-primary);
        border-radius: 3rpx;
      }
    }
  }
}

/* Filter Bar - 筛选标签 */
.filter-bar {
  white-space: nowrap;
  padding: 24rpx 32rpx;
  background: var(--bg-secondary);
  .filter-chip {
    display: inline-block;
    padding: 12rpx 24rpx;
    background: var(--bg-tertiary);
    border-radius: 32rpx;
    font-size: 24rpx;
    color: var(--text-secondary);
    margin-right: 16rpx;
    transition: all 0.3s ease;
    border: 1rpx solid transparent;
    &.active {
      background: var(--color-primary);
      color: #fff;
      box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.3);
    }
  }
}

/* Tab Content */
.tab-content {
  padding: 24rpx 32rpx;
  padding-bottom: 120rpx;
}

/* Empty Tip */
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
}
.empty-tip-text {
  font-size: 28rpx;
  color: var(--text-tertiary);
}

/* Ladder Section - 连板天梯 */
.ladder-section {
  .ladder-level {
    background: var(--bg-card);
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    border: 1rpx solid var(--border-primary);
    box-shadow: var(--shadow-card);
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
    &.high { background: linear-gradient(135deg, var(--color-up) 0%, #dc2626 100%); color: #fff; }
    &.mid { background: linear-gradient(135deg, var(--color-accent) 0%, #ea580c 100%); color: #fff; }
    &.low { background: linear-gradient(135deg, var(--color-down) 0%, #16a34a 100%); color: #fff; }
  }
  .level-info {
    flex: 1;
  }
  .level-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--text-primary);
  }
  .level-subtitle {
    font-size: 24rpx;
    color: var(--text-tertiary);
    margin-top: 4rpx;
  }
  .level-arrow {
    font-size: 24rpx;
    color: var(--text-tertiary);
    transition: transform 0.3s;
  }
  .ladder-level.expanded .level-arrow {
    transform: rotate(180deg);
  }
  .stock-list {
    border-top: 1rpx solid var(--border-primary);
    .stock-item {
      display: flex;
      align-items: center;
      padding: 24rpx 28rpx;
      border-bottom: 1rpx solid var(--border-secondary);
      transition: background 0.2s ease;
      &:last-child {
        border-bottom: none;
      }
      &:active {
        background: var(--bg-hover);
      }
    }
    .stock-rank {
      width: 40rpx;
      font-size: 24rpx;
      color: var(--text-tertiary);
    }
    .stock-info {
      flex: 1;
    }
    .stock-name {
      font-size: 28rpx;
      font-weight: 500;
      color: var(--text-primary);
    }
    .stock-meta {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-top: 6rpx;
    }
    .stock-code {
      font-size: 22rpx;
      color: var(--text-tertiary);
    }
    .stock-tag {
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      font-size: 20rpx;
      &.tag-t { background: rgba(245, 158, 11, 0.1); color: var(--color-accent); }
      &.tag-yizi { background: var(--color-up-bg); color: var(--color-up); }
      &.tag-huanshou { background: var(--color-down-bg); color: var(--color-down); }
      &.tag-new { background: rgba(139, 92, 246, 0.1); color: var(--color-secondary); }
    }
    .stock-price {
      text-align: right;
    }
    .stock-value {
      font-size: 28rpx;
      font-weight: 600;
      &.up { color: var(--color-up); }
      &.down { color: var(--color-down); }
    }
    .stock-change {
      font-size: 24rpx;
      color: var(--color-up);
      margin-top: 4rpx;
    }
  }
}

/* Fund Flow Section - 资金流向 */
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
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    transition: all 0.3s ease;
    &.active {
      background: var(--color-up-bg);
      color: var(--color-up);
      font-weight: 500;
    }
  }
  .flow-list {
    .flow-item {
      display: flex;
      align-items: center;
      gap: 24rpx;
      padding: 24rpx;
      background: var(--bg-card);
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      border: 1rpx solid var(--border-primary);
      box-shadow: var(--shadow-card);
      transition: all 0.3s ease;
      &:active {
        transform: scale(0.98);
        box-shadow: var(--shadow-md);
      }
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
      &.gold { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
      &.silver { background: linear-gradient(135deg, #9ca3af, #6b7280); color: #fff; }
      &.bronze { background: linear-gradient(135deg, #ea580c, #c2410c); color: #fff; }
      &.normal { background: var(--bg-tertiary); color: var(--text-tertiary); }
    }
    .flow-info {
      flex: 1;
      .flow-name {
        font-size: 28rpx;
        font-weight: 500;
        color: var(--text-primary);
      }
      .flow-stats {
        font-size: 22rpx;
        color: var(--text-tertiary);
        margin-top: 4rpx;
      }
    }
    .flow-amount {
      text-align: right;
      &.inflow .amount-value, &.inflow .amount-pct { color: var(--color-up); }
      &.outflow .amount-value, &.outflow .amount-pct { color: var(--color-down); }
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

/* Distribution Section - 涨跌分布 */
.distribution-section {
  .chart-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 400rpx;
    padding: 40rpx;
    background: var(--bg-card);
    border-radius: 24rpx;
    border: 1rpx solid var(--border-primary);
    box-shadow: var(--shadow-card);
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
        color: var(--text-inverse, #fff);
        margin-bottom: 8rpx;
      }
    }
    .bar-label {
      font-size: 20rpx;
      color: var(--text-tertiary);
      margin-top: 12rpx;
      white-space: nowrap;
    }
    &.up .bar-fill {
      background: linear-gradient(180deg, var(--color-up) 0%, rgba(239, 68, 68, 0.7) 100%);
    }
    &.down .bar-fill {
      background: linear-gradient(180deg, var(--color-down) 0%, rgba(34, 197, 94, 0.7) 100%);
    }
    &.flat .bar-fill {
      background: linear-gradient(180deg, #6b7280 0%, #9ca3af 100%);
    }
  }
}

/* Modal - 股票详情弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}
.modal-content {
  background: var(--bg-card);
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
  border-bottom: 1rpx solid var(--border-primary);
  .modal-title {
    .stock-title {
      font-size: 36rpx;
      font-weight: 600;
      color: var(--text-primary);
    }
    .stock-code-small {
      font-size: 26rpx;
      color: var(--text-tertiary);
    }
  }
  .modal-close {
    width: 64rpx;
    height: 64rpx;
    background: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    color: var(--text-secondary);
  }
}
.modal-body {
  padding: 32rpx;
  max-height: 60vh;
}

/* Detail Card - 详情数据卡片 */
.detail-card {
  background: var(--bg-tertiary);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid var(--border-secondary);
}
.detail-card-title {
  font-size: 26rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
  color: var(--text-secondary);
}
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border-secondary);
  &:last-child {
    border-bottom: none;
  }
  .detail-label {
    font-size: 26rpx;
    color: var(--text-tertiary);
  }
  .detail-value {
    font-size: 26rpx;
    font-weight: 500;
    color: var(--text-primary);
    &.up { color: var(--color-up); }
    &.down { color: var(--color-down); }
    &.tag-t { color: var(--color-accent); }
    &.tag-yizi { color: var(--color-up); }
    &.tag-huanshou { color: var(--color-down); }
  }
}

/* Reason Card - 涨停原因 */
.reason-card {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(56, 189, 248, 0.2);
}
.reason-title {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}
.reason-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text-primary);
}
.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.reason-tag {
  background: var(--bg-tertiary);
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  border: 1rpx solid var(--border-primary);
}

/* Fund Grid - 资金数据网格 */
.fund-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.fund-item {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
  border: 1rpx solid var(--border-secondary);
}
.fund-label {
  font-size: 22rpx;
  color: var(--text-tertiary);
}
.fund-value {
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 8rpx;
  color: var(--text-primary);
  &.up { color: var(--color-up); }
  &.down { color: var(--color-down); }
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid var(--border-primary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: var(--text-secondary);
}

/* Market Thermometer - 市场温度计（保留功能样式） */
.thermometer-section {
  margin: 20rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid var(--border-primary);
}
.thermo-header {
  margin-bottom: 16rpx;
}
.thermo-title {
  font-size: 28rpx;
  color: var(--color-primary);
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
  background: var(--color-down-bg);
  border: 1rpx solid rgba(34, 197, 94, 0.3);
}
.thermo-card.down-card {
  background: var(--color-up-bg);
  border: 1rpx solid rgba(239, 68, 68, 0.3);
}
.thermo-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-tertiary);
  margin-bottom: 8rpx;
}
.thermo-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
}
.thermo-value.up {
  color: var(--color-down);
}
.thermo-value.down {
  color: var(--color-up);
}

/* Cards Container */
.cards-container {
  padding: 0 20rpx;
}
.card-section {
  background: var(--bg-card);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  border: 1rpx solid var(--border-primary);
  box-shadow: var(--shadow-card);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid var(--border-primary);
}
.card-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}
.card-title {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: bold;
}

/* Stock Expand Content */
.stock-item-wrapper {
  margin-bottom: 12rpx;
}
.stock-expand-content {
  background: var(--bg-tertiary);
  border-radius: 8rpx;
  padding: 16rpx;
  margin-top: 8rpx;
  border: 1rpx solid var(--border-primary);
}
.expand-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.expand-label {
  font-size: 22rpx;
  color: var(--text-tertiary);
  width: 100rpx;
}
.expand-value {
  font-size: 22rpx;
  color: var(--text-primary);
  flex: 1;
}
.expand-btn {
  font-size: 20rpx;
  color: var(--color-primary);
  padding: 8rpx;
}
</style>
