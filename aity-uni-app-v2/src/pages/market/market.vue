<template>
  <view class="market-page">
    <!-- Header - 集成居中Tab -->
    <view class="header">
      <view class="header-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="header-tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <text>{{ tab.name }}</text>
        </view>
      </view>
    </view>

    <!-- 可拖动悬浮刷新按钮 -->
    <view
      class="fab-refresh"
      :class="{ spinning: isRefreshing }"
      :style="{ transform: 'translate(' + fabRefreshX + 'px, ' + fabRefreshY + 'px)' }"
      @touchstart="onRefreshTouchStart"
      @touchmove="onRefreshTouchMove"
      @touchend="onRefreshTouchEnd"
    >
      <text class="fab-refresh-icon">↻</text>
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

// 可拖动刷新按钮状态
const fabRefreshX = ref(0)
const fabRefreshY = ref(0)
let refreshDragStartX = 0
let refreshDragStartY = 0
let refreshIsDragging = false

const onRefreshTouchStart = (e) => {
  refreshIsDragging = false
  refreshDragStartX = e.touches[0].clientX
  refreshDragStartY = e.touches[0].clientY
}

const onRefreshTouchMove = (e) => {
  refreshIsDragging = true
  const dx = e.touches[0].clientX - refreshDragStartX
  const dy = e.touches[0].clientY - refreshDragStartY
  fabRefreshX.value += dx
  fabRefreshY.value += dy
  refreshDragStartX = e.touches[0].clientX
  refreshDragStartY = e.touches[0].clientY
}

const onRefreshTouchEnd = (e) => {
  if (!refreshIsDragging) {
    handleRefresh()
  }
}

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
/* 行情中心页面 - 浅色专业交易终端风格 */
.market-page {
  min-height: 100vh;
  background: #eef2f7;
  color: #172033;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  padding: 20rpx 32rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  border-bottom: 1rpx solid #d8e0ec;
  box-shadow: 0 4rpx 18rpx rgba(21, 35, 64, 0.06);
  position: relative;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    left: 32rpx;
    right: 32rpx;
    bottom: 0;
    height: 3rpx;
    background: linear-gradient(90deg, #1d4ed8 0%, #0ea5e9 42%, #ef4444 72%, #22c55e 100%);
    border-radius: 3rpx;
  }
}

// 头部居中Tab
.header-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
}

.header-tab {
  text-align: center;
  padding: 16rpx 32rpx;
  color: #4b5563;
  font-size: 27rpx;
  font-weight: 700;
  background: #e5ebf3;
  border-radius: 28rpx;
  transition: all 0.3s;
  min-width: 120rpx;

  &:active {
    transform: scale(0.94);
    opacity: 0.85;
  }

  &.active {
    color: #ffffff;
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
  }
}

.fab-refresh {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 78rpx;
  height: 78rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  border: 2rpx solid #bfdbfe;
  box-shadow: 0 12rpx 26rpx rgba(37, 99, 235, 0.18);
  z-index: 999;
  touch-action: none;
  user-select: none;

  &:active {
    transform: scale(0.96);
    background: #eff6ff;
  }

  &.spinning .fab-refresh-icon {
    animation: spin 1s linear infinite;
  }

  .fab-refresh-icon {
    font-size: 36rpx;
    color: #2563eb;
    font-weight: 700;
    pointer-events: none;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.index-bar {
  white-space: nowrap;
  padding: 24rpx 32rpx 18rpx;
  background: #f7faff;
  border-bottom: 1rpx solid #dde6f2;

  .index-cards {
    display: inline-flex;
    gap: 16rpx;
  }

  .index-card {
    display: inline-flex;
    flex-direction: column;
    min-width: 178rpx;
    padding: 20rpx;
    background: #ffffff;
    border: 1rpx solid #cfd8e6;
    border-radius: 12rpx;
    box-shadow: 0 6rpx 16rpx rgba(25, 42, 70, 0.07);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4rpx;
      background: #94a3b8;
    }

    &.up {
      border-color: rgba(220, 38, 38, 0.26);
      background: linear-gradient(180deg, #fff7f7 0%, #ffffff 58%);

      &::before { background: #dc2626; }
      .index-value,
      .index-change { color: #dc2626; }
    }

    &.down {
      border-color: rgba(22, 163, 74, 0.28);
      background: linear-gradient(180deg, #f4fbf6 0%, #ffffff 58%);

      &::before { background: #16a34a; }
      .index-value,
      .index-change { color: #16a34a; }
    }

    .index-name {
      font-size: 22rpx;
      color: #5b6678;
      font-weight: 600;
      margin-bottom: 8rpx;
    }

    .index-value {
      font-size: 34rpx;
      line-height: 1.18;
      font-weight: 800;
      color: #172033;
    }

    .index-change {
      margin-top: 4rpx;
      font-size: 22rpx;
      font-weight: 700;
      color: #64748b;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  padding: 22rpx 32rpx;
  background: #eef2f7;

  .stat-card {
    padding: 20rpx 12rpx 18rpx;
    text-align: center;
    background: #ffffff;
    border: 1rpx solid #cfd8e6;
    border-radius: 12rpx;
    box-shadow: 0 5rpx 14rpx rgba(25, 42, 70, 0.06);

    &:active { transform: scale(0.985); }

    &.stat-up {
      background: linear-gradient(180deg, #fff6f6 0%, #ffffff 70%);
      border-color: rgba(220, 38, 38, 0.22);
    }

    &.stat-down {
      background: linear-gradient(180deg, #f5fbf7 0%, #ffffff 70%);
      border-color: rgba(22, 163, 74, 0.22);
    }

    .stat-value {
      font-size: 38rpx;
      line-height: 1.16;
      font-weight: 800;
      color: #172033;

      &.up { color: #dc2626; }
      &.down { color: #16a34a; }
    }

    .stat-label {
      display: block;
      margin-top: 8rpx;
      font-size: 22rpx;
      color: #5b6678;
      font-weight: 600;
    }
  }
}

.sentiment-section {
  padding: 0 32rpx 24rpx;

  .sentiment-card {
    padding: 28rpx;
    background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
    border: 1rpx solid #c8d7ee;
    border-radius: 14rpx;
    box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.08);
  }

  .sentiment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18rpx;
  }

  .sentiment-title {
    font-size: 27rpx;
    color: #172033;
    font-weight: 700;
  }

  .sentiment-score {
    min-width: 76rpx;
    padding: 8rpx 18rpx;
    border-radius: 10rpx;
    text-align: center;
    font-size: 34rpx;
    font-weight: 800;
    color: #2563eb;
    background: #eff6ff;
    border: 1rpx solid #bfdbfe;

    &.up {
      color: #dc2626;
      background: #fef2f2;
      border-color: #fecaca;
    }

    &.down {
      color: #16a34a;
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
  }

  .sentiment-bar {
    height: 14rpx;
    border-radius: 7rpx;
    background: #dbe3ee;
    overflow: hidden;

    .sentiment-fill {
      height: 100%;
      border-radius: 7rpx;
      background: linear-gradient(90deg, #16a34a 0%, #0ea5e9 50%, #dc2626 100%);
      transition: width 0.5s ease;
    }
  }

  .sentiment-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 12rpx;
    font-size: 20rpx;
    color: #6b7280;
    font-weight: 600;
  }
}


.filter-bar {
  white-space: nowrap;
  padding: 18rpx 32rpx 6rpx;
  background: #eef2f7;

  .filter-chip {
    display: inline-block;
    margin-right: 12rpx;
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: #425066;
    background: #ffffff;
    border: 1rpx solid #cbd5e1;

    &:active { transform: scale(0.97); }

    &.active {
      color: #ffffff;
      background: #2563eb;
      border-color: #2563eb;
      box-shadow: 0 6rpx 14rpx rgba(37, 99, 235, 0.2);
    }
  }
}

.tab-content {
  padding: 18rpx 32rpx 120rpx;
  background: #eef2f7;
}

.ladder-section {
  .ladder-level {
    margin-bottom: 18rpx;
    overflow: hidden;
    background: #ffffff;
    border: 1rpx solid #cfd8e6;
    border-radius: 14rpx;
    box-shadow: 0 8rpx 20rpx rgba(25, 42, 70, 0.07);

    &:active {
      transform: scale(0.994);
      border-color: #b7c8e2;
    }
  }

  .level-header {
    display: flex;
    align-items: center;
    padding: 22rpx 24rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%);
    border-bottom: 1rpx solid #e2e8f0;
  }

  .level-badge {
    width: 72rpx;
    height: 72rpx;
    margin-right: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 800;

    &.high {
      background: #dc2626;
      box-shadow: 0 6rpx 14rpx rgba(220, 38, 38, 0.24);
    }

    &.mid {
      background: #f59e0b;
      box-shadow: 0 6rpx 14rpx rgba(245, 158, 11, 0.22);
    }

    &.low {
      background: #2563eb;
      box-shadow: 0 6rpx 14rpx rgba(37, 99, 235, 0.2);
    }
  }

  .level-info {
    flex: 1;
    min-width: 0;
  }

  .level-title {
    font-size: 28rpx;
    font-weight: 800;
    color: #111827;
  }

  .level-subtitle {
    margin-top: 4rpx;
    font-size: 22rpx;
    color: #667085;
  }

  .level-arrow {
    font-size: 22rpx;
    color: #64748b;
  }

  .stock-list {
    background: #ffffff;
  }

  .stock-item {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #edf1f7;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f8fbff;
    }
  }

  .stock-rank {
    width: 42rpx;
    color: #94a3b8;
    font-size: 22rpx;
    font-weight: 700;
  }

  .stock-info {
    flex: 1;
    min-width: 0;
  }

  .stock-name {
    color: #111827;
    font-size: 27rpx;
    font-weight: 800;
  }

  .stock-meta {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 6rpx;
  }

  .stock-code {
    font-size: 20rpx;
    color: #6b7280;
    font-weight: 600;
  }

  .stock-tag {
    padding: 4rpx 10rpx;
    border-radius: 6rpx;
    font-size: 18rpx;
    font-weight: 700;
    background: #f1f5f9;
    color: #475569;

    &.tag-t {
      background: #fffbeb;
      color: #b45309;
    }

    &.tag-yizi {
      background: #fef2f2;
      color: #dc2626;
    }

    &.tag-huanshou {
      background: #f0fdf4;
      color: #16a34a;
    }

    &.tag-new {
      background: #eef2ff;
      color: #4338ca;
    }
  }

  .stock-price {
    text-align: right;
    min-width: 130rpx;
  }

  .stock-value {
    font-size: 27rpx;
    font-weight: 800;
    color: #172033;

    &.up { color: #dc2626; }
    &.down { color: #16a34a; }
  }

  .stock-change {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    font-weight: 800;
    color: #dc2626;
  }
}

.fundflow-section {
  .flow-tabs {
    display: flex;
    gap: 14rpx;
    margin-bottom: 18rpx;
  }

  .flow-tab {
    padding: 14rpx 30rpx;
    border-radius: 8rpx;
    color: #425066;
    font-size: 25rpx;
    font-weight: 800;
    background: #ffffff;
    border: 1rpx solid #cbd5e1;

    &:active { transform: scale(0.97); }

    &.active {
      color: #dc2626;
      background: #fff5f5;
      border-color: #fecaca;
    }
  }

  .flow-item {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 20rpx;
    margin-bottom: 12rpx;
    background: #ffffff;
    border: 1rpx solid #d3dce9;
    border-radius: 12rpx;
    box-shadow: 0 5rpx 14rpx rgba(25, 42, 70, 0.06);

    &:active {
      transform: scale(0.99);
      background: #f8fbff;
    }
  }

  .flow-rank {
    width: 52rpx;
    height: 52rpx;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: #64748b;
    font-size: 25rpx;
    font-weight: 800;
    flex-shrink: 0;

    &.gold { background: #d97706; }
    &.silver { background: #64748b; }
    &.bronze { background: #c2410c; }
  }

  .flow-info {
    flex: 1;
    min-width: 0;
  }

  .flow-name {
    color: #111827;
    font-size: 27rpx;
    font-weight: 800;
  }

  .flow-stats {
    margin-top: 4rpx;
    color: #6b7280;
    font-size: 20rpx;
  }

  .flow-amount {
    min-width: 150rpx;
    text-align: right;

    .amount-value {
      font-size: 26rpx;
      font-weight: 800;
      color: #172033;
    }

    .amount-pct {
      display: block;
      margin-top: 4rpx;
      font-size: 20rpx;
      font-weight: 700;
      color: #667085;
    }

    &.inflow .amount-value,
    &.inflow .amount-pct {
      color: #dc2626;
    }

    &.outflow .amount-value,
    &.outflow .amount-pct {
      color: #16a34a;
    }
  }
}

.distribution-section {
  .tdx-distribution {
    overflow: hidden;
    background: #ffffff;
    border: 1rpx solid #cfd8e6;
    border-radius: 14rpx;
    box-shadow: 0 8rpx 20rpx rgba(25, 42, 70, 0.07);
  }

  .dist-row {
    display: flex;
    padding: 22rpx 30rpx;
    border-bottom: 1rpx solid #e5eaf2;

    &:last-child { border-bottom: none; }

    &.dist-up-row { background: linear-gradient(90deg, #fff2f2 0%, #ffffff 100%); }
    &.dist-flat-row {
      justify-content: center;
      background: #f8fafc;
    }
    &.dist-down-row { background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%); }
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
  }

  .dist-value {
    font-size: 42rpx;
    line-height: 1.15;
    font-weight: 800;
    color: #172033;

    &.up { color: #dc2626; }
    &.down { color: #16a34a; }
  }

  .dist-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #5b6678;
    font-weight: 700;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  background: #f6f8fb;
  border-radius: 28rpx 28rpx 0 0;
  border-top: 1rpx solid #c8d7ee;
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
  padding: 28rpx 32rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #dde6f2;

  .stock-title {
    font-size: 32rpx;
    font-weight: 800;
    color: #111827;
  }

  .stock-code-small {
    font-size: 24rpx;
    color: #667085;
  }

  .modal-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f1f5f9;
    border: 1rpx solid #d5deeb;
    color: #475569;
    font-size: 44rpx;

    &:active {
      transform: scale(0.95);
    }
  }
}

.modal-body {
  padding: 28rpx 32rpx;
  max-height: 60vh;
}

.detail-card,
.reason-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  background: #ffffff;
  border: 1rpx solid #d3dce9;
  border-radius: 14rpx;
  box-shadow: 0 5rpx 14rpx rgba(25, 42, 70, 0.05);
}

.detail-card-title,
.reason-title {
  margin-bottom: 14rpx;
  color: #475569;
  font-size: 23rpx;
  font-weight: 800;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #edf1f7;

  &:last-child { border-bottom: none; }

  .detail-label {
    color: #667085;
    font-size: 24rpx;
  }

  .detail-value {
    color: #172033;
    font-size: 24rpx;
    font-weight: 800;

    &.up,
    &.tag-yizi { color: #dc2626; }
    &.down,
    &.tag-huanshou { color: #16a34a; }
    &.tag-t { color: #b45309; }
  }
}

.reason-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
  border-color: #c8d7ee;
}

.reason-content {
  color: #172033;
  font-size: 26rpx;
  line-height: 1.6;
}

.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.reason-tag {
  padding: 8rpx 14rpx;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.fund-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.fund-item {
  padding: 18rpx 10rpx;
  text-align: center;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 10rpx;
}

.fund-label {
  color: #667085;
  font-size: 20rpx;
  font-weight: 600;
}

.fund-value {
  margin-top: 8rpx;
  color: #172033;
  font-size: 25rpx;
  font-weight: 800;

  &.up { color: #dc2626; }
  &.down { color: #16a34a; }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.86);
  z-index: 1000;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 4rpx solid #bfdbfe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 24rpx;
  color: #475569;
  font-size: 26rpx;
  font-weight: 700;
}
</style>
