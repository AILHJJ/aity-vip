<template>
  <view class="market-page">
    <!-- Header -->
    <view class="header">
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
      <view class="stat-card stat-up">
        <text class="stat-value up">{{ marketData.upCount }}</text>
        <text class="stat-label">上涨</text>
      </view>
      <view class="stat-card stat-down">
        <text class="stat-value down">{{ marketData.downCount }}</text>
        <text class="stat-label">下跌</text>
      </view>
      <view class="stat-card stat-up">
        <text class="stat-value up">{{ marketData.limitUpCount }}</text>
        <text class="stat-label">涨停</text>
      </view>
      <view class="stat-card stat-down">
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

    <!-- Filter Bar - 只在ladder tab显示 -->
    <scroll-view v-if="activeTab === 'ladder'" class="filter-bar" scroll-x :show-scrollbar="false">
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
              <text v-if="item.netInflowPct !== undefined && item.netInflowPct !== null" class="amount-pct">{{ formatPct(item.netInflowPct) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Distribution Tab - 通达信风格涨跌分布 -->
      <view v-if="activeTab === 'distribution'" class="distribution-section">
        <!-- 骨架屏 -->
        <market-skeleton v-if="loading" :count="1" />
        <!-- 空状态 -->
        <empty-state v-else-if="distributionData.limitDown === 0 && distributionData.up3 === 0 && distributionData.flat === 0" type="market" title="暂无涨跌分布数据" description="暂无市场涨跌分布统计" :showAction="false" />
        <!-- 通达信风格涨跌分布 - 上下两行 -->
        <view v-else class="tdx-distribution">
          <!-- 第一行：涨停 +5% +3% -->
          <view class="dist-row dist-up-row">
            <view class="dist-item">
              <text class="dist-value up">{{ distributionData.limitUp }}</text>
              <text class="dist-label">涨停</text>
            </view>
            <view class="dist-item">
              <text class="dist-value up">{{ distributionData.up5 }}</text>
              <text class="dist-label">+5%</text>
            </view>
            <view class="dist-item">
              <text class="dist-value up">{{ distributionData.up3 }}</text>
              <text class="dist-label">+3%</text>
            </view>
          </view>
          <!-- 第二行：平 -->
          <view class="dist-row dist-flat-row">
            <view class="dist-item dist-flat">
              <text class="dist-value">{{ distributionData.flat }}</text>
              <text class="dist-label">平盘</text>
            </view>
          </view>
          <!-- 第三行：-3% -5% 跌停 -->
          <view class="dist-row dist-down-row">
            <view class="dist-item">
              <text class="dist-value down">{{ distributionData.down3 }}</text>
              <text class="dist-label">-3%</text>
            </view>
            <view class="dist-item">
              <text class="dist-value down">{{ distributionData.down5 }}</text>
              <text class="dist-label">-5%</text>
            </view>
            <view class="dist-item">
              <text class="dist-value down">{{ distributionData.limitDown }}</text>
              <text class="dist-label">跌停</text>
            </view>
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
/* 行情中心页面 - 金融科技风格全新设计 */
.market-page {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Header - 科技感导航栏 */
.header {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  padding: 32rpx 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid rgba(56, 189, 248, 0.2);
  position: relative;
  z-index: 10;

  .header-center {
    flex: 1;
    .header-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #f1f5f9;
      background: linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .header-right {
    .update-info {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .update-time {
        font-size: 22rpx;
        color: #64748b;
        padding: 6rpx 16rpx;
        border-radius: 12rpx;
        background: rgba(30, 41, 59, 0.8);
        border: 1rpx solid rgba(56, 189, 248, 0.1);
      }

      .refresh-btn {
        width: 64rpx;
        height: 64rpx;
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
        border: 1rpx solid rgba(56, 189, 248, 0.2);
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.95) rotate(180deg);
        }

        .refresh-icon {
          display: inline-block;
          font-size: 32rpx;
          color: #38bdf8;
          font-weight: 600;

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
  padding: 24rpx 32rpx;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 1rpx solid rgba(56, 189, 248, 0.1);

  .index-cards {
    display: inline-flex;
    gap: 16rpx;
  }

  .index-card {
    display: inline-flex;
    flex-direction: column;
    min-width: 170rpx;
    padding: 20rpx;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    border-radius: 16rpx;
    border: 1rpx solid rgba(56, 189, 248, 0.15);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3rpx;
      background: #64748b;
    }

    &.up {
      border-color: rgba(248, 113, 113, 0.3);
      background: linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%);

      &::before {
        background: linear-gradient(90deg, #f87171, #ef4444);
      }

      .index-value, .index-change {
        color: #f87171;
      }
    }

    &.down {
      border-color: rgba(74, 222, 128, 0.3);
      background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%);

      &::before {
        background: linear-gradient(90deg, #4ade80, #22c55e);
      }

      .index-value, .index-change {
        color: #4ade80;
      }
    }

    .index-name {
      font-size: 22rpx;
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 8rpx;
    }

    .index-value {
      font-size: 34rpx;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 4rpx;
    }

    .index-change {
      font-size: 22rpx;
      font-weight: 600;
      color: #64748b;
    }
  }
}

/* Stats Grid - 市场概览数据卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  padding: 24rpx 32rpx;
  background: #0f172a;

  .stat-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
    border-radius: 16rpx;
    padding: 20rpx 16rpx;
    text-align: center;
    border: 1rpx solid rgba(56, 189, 248, 0.1);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    &.stat-up {
      border-color: rgba(248, 113, 113, 0.2);
      background: linear-gradient(135deg, rgba(248, 113, 113, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%);
    }

    &.stat-down {
      border-color: rgba(74, 222, 128, 0.2);
      background: linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%);
    }

    .stat-value {
      font-size: 36rpx;
      font-weight: 700;
      line-height: 1.2;
      color: #e2e8f0;

      &.up {
        color: #f87171;
        text-shadow: 0 0 10rpx rgba(248, 113, 113, 0.3);
      }

      &.down {
        color: #4ade80;
        text-shadow: 0 0 10rpx rgba(74, 222, 128, 0.3);
      }
    }

    .stat-label {
      font-size: 22rpx;
      color: #64748b;
      margin-top: 8rpx;
      font-weight: 500;
    }
  }
}

/* Sentiment Section - 市场情绪 */
.sentiment-section {
  padding: 0 32rpx 24rpx;

  .sentiment-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1rpx solid rgba(56, 189, 248, 0.2);
    border-radius: 20rpx;
    padding: 28rpx;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2rpx;
      background: linear-gradient(90deg, transparent, #38bdf8, #a78bfa, transparent);
    }

    .sentiment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
    }

    .sentiment-title {
      font-size: 26rpx;
      color: #e2e8f0;
      font-weight: 600;
    }

    .sentiment-score {
      font-size: 36rpx;
      font-weight: 700;
      padding: 8rpx 20rpx;
      border-radius: 12rpx;
      background: rgba(56, 189, 248, 0.1);
      border: 1rpx solid rgba(56, 189, 248, 0.2);
      color: #38bdf8;

      &.up {
        background: rgba(248, 113, 113, 0.1);
        border-color: rgba(248, 113, 113, 0.2);
        color: #f87171;
      }

      &.down {
        background: rgba(74, 222, 128, 0.1);
        border-color: rgba(74, 222, 128, 0.2);
        color: #4ade80;
      }
    }

    .sentiment-bar {
      height: 12rpx;
      background: rgba(30, 41, 59, 0.8);
      border-radius: 6rpx;
      overflow: hidden;
      margin-bottom: 12rpx;

      .sentiment-fill {
        height: 100%;
        border-radius: 6rpx;
        background: linear-gradient(90deg, #4ade80 0%, #64748b 50%, #f87171 100%);
        transition: width 0.5s ease;
        box-shadow: 0 0 10rpx rgba(56, 189, 248, 0.3);
      }
    }

    .sentiment-labels {
      display: flex;
      justify-content: space-between;
      font-size: 20rpx;
      color: #64748b;
      font-weight: 500;
    }
  }
}

/* Tabs - 标签切换 */
.tabs {
  display: flex;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 1rpx solid rgba(56, 189, 248, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;

  .tab {
    flex: 1;
    text-align: center;
    padding: 28rpx;
    font-size: 28rpx;
    color: #64748b;
    background: transparent;
    position: relative;
    transition: all 0.3s ease;
    font-weight: 500;

    &.active {
      color: #38bdf8;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: linear-gradient(90deg, #38bdf8, #a78bfa);
        border-radius: 2rpx;
        box-shadow: 0 0 10rpx rgba(56, 189, 248, 0.5);
      }
    }

    &:not(.active) {
      &:active {
        background: rgba(56, 189, 248, 0.05);
      }
    }
  }
}

/* Filter Bar - 筛选标签 */
.filter-bar {
  white-space: nowrap;
  padding: 20rpx 32rpx;
  background: #0f172a;

  .filter-chip {
    display: inline-block;
    padding: 12rpx 24rpx;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 24rpx;
    font-size: 24rpx;
    color: #94a3b8;
    margin-right: 12rpx;
    transition: all 0.3s ease;
    border: 1rpx solid rgba(56, 189, 248, 0.1);
    font-weight: 500;

    &:active {
      transform: scale(0.95);
    }

    &.active {
      background: linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 4rpx 12rpx rgba(56, 189, 248, 0.3);
      font-weight: 600;
    }
  }
}

/* Tab Content */
.tab-content {
  padding: 20rpx 32rpx;
  padding-bottom: 120rpx;
  background: #0f172a;
}

/* Ladder Section - 连板天梯 */
.ladder-section {
  .ladder-level {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    border: 1rpx solid rgba(56, 189, 248, 0.1);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.99);
      border-color: rgba(56, 189, 248, 0.2);
    }

    .level-header {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: rgba(30, 41, 59, 0.4);
      border-bottom: 1rpx solid rgba(56, 189, 248, 0.05);
    }

    .level-badge {
      width: 72rpx;
      height: 72rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      font-weight: 700;
      margin-right: 20rpx;

      &.high {
        background: linear-gradient(135deg, #f87171, #ef4444);
        box-shadow: 0 4rpx 12rpx rgba(248, 113, 113, 0.3);
      }

      &.mid {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        box-shadow: 0 4rpx 12rpx rgba(251, 191, 36, 0.3);
      }

      &.low {
        background: linear-gradient(135deg, #4ade80, #22c55e);
        box-shadow: 0 4rpx 12rpx rgba(74, 222, 128, 0.3);
      }
    }

    .level-info {
      flex: 1;
    }

    .level-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #e2e8f0;
    }

    .level-subtitle {
      font-size: 22rpx;
      color: #64748b;
      margin-top: 4rpx;
    }

    .level-arrow {
      font-size: 22rpx;
      color: #475569;
      transition: transform 0.3s ease;
    }

    .stock-list {
      background: rgba(15, 23, 42, 0.6);

      .stock-item {
        display: flex;
        align-items: center;
        padding: 20rpx 24rpx;
        border-bottom: 1rpx solid rgba(56, 189, 248, 0.05);

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background: rgba(56, 189, 248, 0.05);
        }

        .stock-rank {
          width: 40rpx;
          font-size: 22rpx;
          font-weight: 600;
          color: #475569;
        }

        .stock-info {
          flex: 1;
        }

        .stock-name {
          font-size: 26rpx;
          font-weight: 600;
          color: #f1f5f9;
        }

        .stock-meta {
          display: flex;
          align-items: center;
          gap: 12rpx;
          margin-top: 6rpx;
        }

        .stock-code {
          font-size: 20rpx;
          color: #64748b;
          font-weight: 500;
        }

        .stock-tag {
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          font-size: 18rpx;
          font-weight: 600;

          &.tag-t {
            background: rgba(251, 191, 36, 0.15);
            color: #fbbf24;
          }

          &.tag-yizi {
            background: rgba(248, 113, 113, 0.15);
            color: #f87171;
          }

          &.tag-huanshou {
            background: rgba(74, 222, 128, 0.15);
            color: #4ade80;
          }

          &.tag-new {
            background: rgba(167, 139, 250, 0.15);
            color: #a78bfa;
          }
        }

        .stock-price {
          text-align: right;
        }

        .stock-value {
          font-size: 26rpx;
          font-weight: 700;
          color: #f1f5f9;

          &.up {
            color: #f87171;
          }

          &.down {
            color: #4ade80;
          }
        }

        .stock-change {
          font-size: 22rpx;
          color: #f87171;
          margin-top: 4rpx;
          font-weight: 600;
        }
      }
    }
  }
}

/* Fund Flow Section - 资金流向 */
.fundflow-section {
  .flow-tabs {
    display: flex;
    gap: 24rpx;
    margin-bottom: 20rpx;

    .flow-tab {
      padding: 14rpx 28rpx;
      border-radius: 24rpx;
      font-size: 26rpx;
      background: rgba(30, 41, 59, 0.6);
      color: #94a3b8;
      transition: all 0.3s ease;
      border: 1rpx solid rgba(56, 189, 248, 0.1);
      font-weight: 500;

      &:active {
        transform: scale(0.95);
      }

      &.active {
        background: linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(248, 113, 113, 0.1) 100%);
        color: #f87171;
        border-color: rgba(248, 113, 113, 0.3);
      }
    }
  }

  .flow-list {
    .flow-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 20rpx;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
      border-radius: 16rpx;
      margin-bottom: 12rpx;
      border: 1rpx solid rgba(56, 189, 248, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        border-color: rgba(56, 189, 248, 0.2);
      }

      .flow-rank {
        width: 52rpx;
        height: 52rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        font-weight: 700;
        flex-shrink: 0;

        &.gold {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 4rpx 10rpx rgba(251, 191, 36, 0.3);
        }

        &.silver {
          background: linear-gradient(135deg, #94a3b8, #64748b);
        }

        &.bronze {
          background: linear-gradient(135deg, #fb923c, #ea580c);
        }

        &.normal {
          background: rgba(30, 41, 59, 0.8);
          color: #64748b;
        }
      }

      .flow-info {
        flex: 1;

        .flow-name {
          font-size: 26rpx;
          font-weight: 600;
          color: #e2e8f0;
        }

        .flow-stats {
          font-size: 20rpx;
          color: #64748b;
          margin-top: 4rpx;
        }
      }

      .flow-amount {
        text-align: right;

        .amount-value {
          font-size: 26rpx;
          font-weight: 700;
          color: #e2e8f0;
        }

        .amount-pct {
          font-size: 20rpx;
          margin-top: 4rpx;
          font-weight: 600;
          color: #64748b;
        }

        &.inflow .amount-value,
        &.inflow .amount-pct {
          color: #f87171;
        }

        &.outflow .amount-value,
        &.outflow .amount-pct {
          color: #4ade80;
        }
      }
    }
  }
}

/* Distribution Section - 涨跌分布 通达信风格 */
.distribution-section {
  .tdx-distribution {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
    border-radius: 20rpx;
    border: 1rpx solid rgba(56, 189, 248, 0.1);
    overflow: hidden;

    .dist-row {
      display: flex;
      padding: 20rpx 32rpx;
      border-bottom: 1rpx solid rgba(56, 189, 248, 0.05);

      &:last-child {
        border-bottom: none;
      }

      &.dist-up-row {
        background: linear-gradient(90deg, rgba(248, 113, 113, 0.08) 0%, transparent 100%);
      }

      &.dist-flat-row {
        background: rgba(30, 41, 59, 0.4);
        justify-content: center;
      }

      &.dist-down-row {
        background: linear-gradient(90deg, rgba(74, 222, 128, 0.08) 0%, transparent 100%);
      }
    }

    .dist-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12rpx 0;

      &.dist-flat {
        max-width: 200rpx;
      }

      .dist-value {
        font-size: 40rpx;
        font-weight: 700;
        color: #e2e8f0;
        line-height: 1.2;

        &.up {
          color: #f87171;
          text-shadow: 0 0 10rpx rgba(248, 113, 113, 0.3);
        }

        &.down {
          color: #4ade80;
          text-shadow: 0 0 10rpx rgba(74, 222, 128, 0.3);
        }
      }

      .dist-label {
        font-size: 22rpx;
        color: #64748b;
        margin-top: 8rpx;
        font-weight: 500;
      }
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-radius: 32rpx 32rpx 0 0;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  border-top: 1rpx solid rgba(56, 189, 248, 0.2);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid rgba(56, 189, 248, 0.1);

  .modal-title {
    .stock-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #f1f5f9;
    }

    .stock-code-small {
      font-size: 24rpx;
      color: #64748b;
    }
  }

  .modal-close {
    width: 60rpx;
    height: 60rpx;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44rpx;
    color: #94a3b8;
    border: 1rpx solid rgba(56, 189, 248, 0.1);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }
  }
}

.modal-body {
  padding: 28rpx 32rpx;
  max-height: 60vh;
}

/* Detail Card - 详情数据卡片 */
.detail-card {
  background: rgba(30, 41, 59, 0.4);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(56, 189, 248, 0.1);
}

.detail-card-title {
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  color: #94a3b8;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid rgba(56, 189, 248, 0.05);

  &:last-child {
    border-bottom: none;
  }

  .detail-label {
    font-size: 24rpx;
    color: #94a3b8;
  }

  .detail-value {
    font-size: 24rpx;
    font-weight: 600;
    color: #e2e8f0;

    &.up { color: #f87171; }
    &.down { color: #4ade80; }
    &.tag-t { color: #fbbf24; }
    &.tag-yizi { color: #f87171; }
    &.tag-huanshou { color: #4ade80; }
  }
}

/* Reason Card - 涨停原因 */
.reason-card {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(56, 189, 248, 0.15);
}

.reason-title {
  font-size: 22rpx;
  color: #94a3b8;
  margin-bottom: 12rpx;
  font-weight: 600;
}

.reason-content {
  font-size: 26rpx;
  line-height: 1.6;
  color: #e2e8f0;
}

.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.reason-tag {
  background: rgba(30, 41, 59, 0.6);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #94a3b8;
  border: 1rpx solid rgba(56, 189, 248, 0.1);
  font-weight: 500;
}

/* Fund Grid - 资金数据网格 */
.fund-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.fund-item {
  background: rgba(30, 41, 59, 0.4);
  border-radius: 14rpx;
  padding: 18rpx;
  text-align: center;
  border: 1rpx solid rgba(56, 189, 248, 0.1);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.fund-label {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 500;
}

.fund-value {
  font-size: 26rpx;
  font-weight: 700;
  margin-top: 8rpx;
  color: #e2e8f0;

  &.up { color: #f87171; }
  &.down { color: #4ade80; }
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 4rpx solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #94a3b8;
  font-weight: 500;
}
</style>
