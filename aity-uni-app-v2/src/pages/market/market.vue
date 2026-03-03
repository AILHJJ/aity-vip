<template>
  <view class="market-page">
    <!-- 装饰背景 -->
    <view class="decoration decoration-1"></view>
    <view class="decoration decoration-2"></view>

    <!-- 顶部Header -->
    <view class="header-bar">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-center">
        <view class="header-title">
          <view class="header-icon">📊</view>
          <text class="title-text">行情中心</text>
        </view>
      </view>
      <view class="header-right">
        <view class="update-indicator">
          <view class="glow-dot"></view>
          <text class="time-text">{{ currentTime }}</text>
          <view class="refresh-icon" :class="{ spinning: isRefreshing }" @click="handleRefresh"></view>
        </view>
      </view>
    </view>

    <!-- 市场温度计 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">
          <text class="section-icon">🌡️</text>
          <text class="title-text">市场温度计</text>
        </view>
      </view>
      <view class="card thermometer-card">
        <view class="thermometer-content">
          <!-- 仪表盘 -->
          <view class="gauge-container">
            <view class="gauge-ring">
              <svg viewBox="0 0 100 100" class="gauge-svg">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00d4ff"/>
                    <stop offset="50%" style="stop-color:#a855f7"/>
                    <stop offset="100%" style="stop-color:#ff4757"/>
                  </linearGradient>
                </defs>
                <circle class="gauge-bg" cx="50" cy="50" r="42" />
                <circle
                  class="gauge-fill"
                  cx="50"
                  cy="50"
                  r="42"
                  :style="{ strokeDashoffset: gaugeOffset }"
                />
              </svg>
              <view class="gauge-value">
                <text class="gauge-number">{{ marketSentiment.score }}</text>
                <text class="gauge-label">情绪分</text>
              </view>
            </view>
          </view>
          <!-- 统计信息 -->
          <view class="gauge-info">
            <view class="sentiment-status" :class="sentimentClass">
              <text class="status-icon">{{ sentimentIcon }}</text>
              <text class="status-text">{{ marketSentiment.status }}</text>
            </view>
            <view class="stats-grid">
              <view class="stat-item">
                <view class="stat-icon up">📈</view>
                <text class="stat-value up">{{ marketData.upCount }}</text>
              </view>
              <view class="stat-item">
                <view class="stat-icon down">📉</view>
                <text class="stat-value down">{{ marketData.downCount }}</text>
              </view>
              <view class="stat-item">
                <view class="stat-icon limit-up">🔥</view>
                <text class="stat-value limit-up">{{ marketData.limitUpCount }}</text>
              </view>
              <view class="stat-item">
                <view class="stat-icon limit-down">❄️</view>
                <text class="stat-value limit-down">{{ marketData.limitDownCount }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 涨跌分布条 -->
        <view class="distribution-bar">
          <text class="bar-label">涨跌分布</text>
          <view class="bar-container">
            <view class="bar-segment limit-down" :style="{ width: distribution.limitDown + '%' }">
              <text v-if="distribution.limitDown > 5">{{ marketData.limitDownCount }}</text>
            </view>
            <view class="bar-segment down" :style="{ width: distribution.down + '%' }">
              <text v-if="distribution.down > 8">-5~0</text>
            </view>
            <view class="bar-segment flat" :style="{ width: distribution.flat + '%' }">
              <text v-if="distribution.flat > 8">0~3</text>
            </view>
            <view class="bar-segment up" :style="{ width: distribution.up + '%' }">
              <text v-if="distribution.up > 8">3~10</text>
            </view>
            <view class="bar-segment limit-up" :style="{ width: distribution.limitUp + '%' }">
              <text v-if="distribution.limitUp > 5">{{ marketData.limitUpCount }}</text>
            </view>
          </view>
        </view>
        <view class="expand-btn" @click="toggleThermometer">
          <text>查看详细分布</text>
          <text class="expand-icon">{{ thermometerExpanded ? '▲' : '▼' }}</text>
        </view>
      </view>
    </view>

    <!-- 指数行情 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">
          <text class="section-icon">📰</text>
          <text class="title-text">指数行情</text>
        </view>
      </view>
      <scroll-view class="index-scroll" scroll-x :show-scrollbar="false">
        <view class="index-cards">
          <view
            v-for="(item, index) in indexData"
            :key="index"
            class="index-card"
            :class="getChangeClass(item.changePct)"
          >
            <text class="index-name">{{ item.name }}</text>
            <text class="index-price">{{ formatPrice(item.price) }}</text>
            <text class="index-change">{{ formatChangePct(item.changePct) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 连板天梯 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">
          <text class="section-icon">🪜</text>
          <text class="title-text">连板天梯</text>
        </view>
        <view class="section-action" @click="goToLadderDetail">
          <text>查看全部</text>
          <text class="action-icon">→</text>
        </view>
      </view>
      <view class="card ladder-card">
        <view class="ladder-summary">
          <view class="ladder-high">
            <text class="crown-icon">👑</text>
            <view class="ladder-high-info">
              <text class="ladder-high-days">{{ ladderData.highestDays }}连板</text>
              <text class="ladder-high-label">最高连板</text>
            </view>
          </view>
          <view class="ladder-total">
            <text>共 {{ ladderData.totalCount }} 只涨停</text>
          </view>
        </view>
        <view class="ladder-levels">
          <view
            v-for="level in ladderData.levels"
            :key="level.days"
            class="level-tag"
            :class="getLevelClass(level.days)"
          >
            <text>{{ level.days }}板</text>
            <text class="level-count">×{{ level.count }}</text>
          </view>
        </view>
        <view class="expand-btn" @click="goToLadderDetail">
          <text>查看完整天梯</text>
          <text class="expand-icon">▼</text>
        </view>
      </view>
    </view>

    <!-- 资金流向 -->
    <view class="section" style="padding-bottom: 120rpx;">
      <view class="section-header">
        <view class="section-title">
          <text class="section-icon">💰</text>
          <text class="title-text">资金流向</text>
        </view>
      </view>
      <view class="card fund-card">
        <view class="flow-tabs">
          <view
            class="flow-tab"
            :class="{ active: fundFlowType === 'inflow' }"
            @click="switchFundFlow('inflow')"
          >
            <text>🔥 流入</text>
          </view>
          <view
            class="flow-tab"
            :class="{ active: fundFlowType === 'outflow' }"
            @click="switchFundFlow('outflow')"
          >
            <text>❄️ 流出</text>
          </view>
        </view>
        <view class="flow-list">
          <view
            v-for="(item, index) in fundFlowData"
            :key="index"
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
        <view class="expand-btn" @click="toggleFundFlow">
          <text>查看更多行业</text>
          <text class="expand-icon">▼</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
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

// 状态
const loading = ref(false)
const isRefreshing = ref(false)
const currentTime = ref('')
const thermometerExpanded = ref(false)
const fundFlowType = ref('inflow')

// 数据
const marketData = ref({
  upCount: 0,
  downCount: 0,
  limitUpCount: 0,
  limitDownCount: 0,
  totalStocks: 0,
  amount: 0
})

const indexData = ref([])
const ladderData = ref({
  highestDays: 0,
  totalCount: 0,
  levels: []
})
const fundFlowData = ref([])

// 计算属性
const marketSentiment = computed(() => {
  const upRatio = marketData.value.totalStocks > 0
    ? (marketData.value.upCount / marketData.value.totalStocks) * 100
    : 50
  const limitRatio = marketData.value.totalStocks > 0
    ? (marketData.value.limitUpCount / marketData.value.totalStocks) * 100
    : 0

  let score = Math.round(upRatio * 0.7 + limitRatio * 3)
  score = Math.min(100, Math.max(0, score))

  let status = '中性'
  if (score >= 70) status = '偏热'
  else if (score >= 50) status = '温和'
  else if (score >= 30) status = '偏冷'
  else status = '冰点'

  return { score, status }
})

const gaugeOffset = computed(() => {
  const circumference = 2 * Math.PI * 42
  const progress = marketSentiment.value.score / 100
  return circumference * (1 - progress)
})

const sentimentClass = computed(() => {
  const score = marketSentiment.value.score
  if (score >= 70) return 'hot'
  if (score >= 50) return 'warm'
  if (score >= 30) return 'cool'
  return 'cold'
})

const sentimentIcon = computed(() => {
  const score = marketSentiment.value.score
  if (score >= 70) return '🔥'
  if (score >= 50) return '☀️'
  if (score >= 30) return '🌤️'
  return '❄️'
})

const distribution = computed(() => {
  const total = marketData.value.totalStocks || 1
  return {
    limitDown: (marketData.value.limitDownCount / total) * 100,
    down: 20,
    flat: 15,
    up: 45,
    limitUp: (marketData.value.limitUpCount / total) * 100
  }
})

// 方法
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toTimeString().slice(0, 8)
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/messages/messages' })
  }
}

const goToLadderDetail = () => {
  uni.navigateTo({ url: '/pages/market/market-ladder' })
}

const toggleThermometer = () => {
  thermometerExpanded.value = !thermometerExpanded.value
}

const toggleFundFlow = () => {
  // 可以跳转到详情页或展开更多
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const switchFundFlow = (type) => {
  fundFlowType.value = type
  loadFundFlowData()
}

const handleRefresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  await refreshData()
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

// 格式化方法
const formatPrice = (price) => {
  if (!price) return '--'
  return parseFloat(price).toFixed(2)
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

const getChangeClass = (pct) => {
  if (!pct) return ''
  const num = parseFloat(pct)
  return num >= 0 ? 'up' : 'down'
}

const getLevelClass = (days) => {
  if (days >= 6) return 'high'
  if (days >= 4) return 'mid'
  return 'low'
}

const getRankClass = (index) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return 'normal'
}

// 数据加载
const loadMarketOverview = async () => {
  try {
    const res = await getMarketOverviewApi()
    if (res.code === 200 && res.data) {
      marketData.value = {
        upCount: res.data.upCount || 0,
        downCount: res.data.downCount || 0,
        limitUpCount: res.data.limitUpCount || 0,
        limitDownCount: res.data.limitDownCount || 0,
        totalStocks: res.data.totalStocks || 4000,
        amount: res.data.amount || 0
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
        totalCount: res.data.total || 0,
        levels: res.data.levels || []
      }
    }
  } catch (e) {
    console.error('加载连板天梯失败:', e)
  }
}

const loadFundFlowData = async () => {
  try {
    const res = await getIndustryFundFlowApi({ type: fundFlowType.value, top: 5 })
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

// 检查登录
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

// 生命周期
let timeTimer = null

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)

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
// 基础变量
$neon-blue: #00d4ff;
$neon-purple: #a855f7;
$neon-red: #ff4757;
$neon-green: #2ed573;
$neon-gold: #fdcb6e;
$bg-dark: #0a0a1a;
$bg-mid: #1a1a3e;

.market-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-dark 0%, $bg-mid 50%, darken($bg-mid, 5%) 100%);
  position: relative;
  overflow-x: hidden;
}

// 装饰元素
.decoration {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;

  &.decoration-1 {
    top: 15%;
    right: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba($neon-purple, 0.15) 0%, transparent 70%);
  }

  &.decoration-2 {
    bottom: 25%;
    left: -40px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba($neon-blue, 0.12) 0%, transparent 70%);
  }
}

// Header
.header-bar {
  background: linear-gradient(135deg, rgba($neon-blue, 0.12) 0%, rgba($neon-purple, 0.12) 100%);
  padding: 28rpx 32rpx;
  padding-top: calc(28rpx + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba($neon-blue, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($neon-blue, 0.5), transparent);
  }

  .header-left {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .back-icon {
      font-size: 48rpx;
      color: #ffffff;
      font-weight: 300;
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .header-icon {
        width: 44rpx;
        height: 44rpx;
        background: linear-gradient(135deg, $neon-blue, $neon-purple);
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
      }

      .title-text {
        font-size: 36rpx;
        font-weight: 600;
        background: linear-gradient(90deg, $neon-blue, $neon-purple);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  .header-right {
    width: 160rpx;
    display: flex;
    justify-content: flex-end;

    .update-indicator {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 8rpx 16rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20rpx;

      .glow-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background: $neon-blue;
        box-shadow: 0 0 10rpx $neon-blue, 0 0 20rpx rgba($neon-blue, 0.5);
        animation: glowPulse 2s ease-in-out infinite;
      }

      .time-text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);
        font-family: 'SF Mono', 'Consolas', monospace;
      }

      .refresh-icon {
        width: 28rpx;
        height: 28rpx;
        border: 3rpx solid rgba($neon-blue, 0.6);
        border-top-color: transparent;
        border-radius: 50%;

        &.spinning {
          animation: spin 1s linear infinite;
        }
      }
    }
  }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 通用Section
.section {
  padding: 24rpx 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .section-icon {
        font-size: 32rpx;
      }

      .title-text {
        font-size: 30rpx;
        font-weight: 600;
        color: #ffffff;
      }
    }

    .section-action {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 24rpx;
      color: $neon-blue;

      .action-icon {
        font-size: 24rpx;
      }
    }
  }
}

// 卡片基础样式
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba($neon-blue, 0.15);
  border-radius: 24rpx;
  padding: 24rpx;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($neon-blue, 0.5), transparent);
  }
}

// 市场温度计
.thermometer-card {
  .thermometer-content {
    display: flex;
    align-items: center;
    gap: 32rpx;
    margin-bottom: 24rpx;
  }

  .gauge-container {
    flex-shrink: 0;

    .gauge-ring {
      width: 140rpx;
      height: 140rpx;
      position: relative;

      .gauge-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);

        .gauge-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 8;
        }

        .gauge-fill {
          fill: none;
          stroke: url(#gaugeGradient);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 264;
          filter: drop-shadow(0 0 8rpx rgba($neon-blue, 0.5));
          transition: stroke-dashoffset 1s ease-out;
        }
      }

      .gauge-value {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        .gauge-number {
          display: block;
          font-size: 44rpx;
          font-weight: 700;
          background: linear-gradient(135deg, $neon-blue, $neon-purple);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gauge-label {
          display: block;
          font-size: 18rpx;
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }

  .gauge-info {
    flex: 1;

    .sentiment-status {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 20rpx;
      padding: 12rpx 20rpx;
      border-radius: 20rpx;
      width: fit-content;

      &.hot {
        background: rgba($neon-red, 0.2);
        .status-text { color: $neon-red; }
      }

      &.warm {
        background: rgba($neon-gold, 0.2);
        .status-text { color: $neon-gold; }
      }

      &.cool {
        background: rgba($neon-blue, 0.2);
        .status-text { color: $neon-blue; }
      }

      &.cold {
        background: rgba(#74b9ff, 0.2);
        .status-text { color: #74b9ff; }
      }

      .status-icon {
        font-size: 28rpx;
      }

      .status-text {
        font-size: 26rpx;
        font-weight: 600;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16rpx;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .stat-icon {
          width: 44rpx;
          height: 44rpx;
          border-radius: 10rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20rpx;

          &.up { background: rgba($neon-red, 0.15); }
          &.down { background: rgba($neon-green, 0.15); }
          &.limit-up { background: rgba($neon-red, 0.25); }
          &.limit-down { background: rgba(#74b9ff, 0.2); }
        }

        .stat-value {
          font-size: 30rpx;
          font-weight: 600;

          &.up { color: $neon-red; }
          &.down { color: $neon-green; }
          &.limit-up { color: lighten($neon-red, 10%); }
          &.limit-down { color: #74b9ff; }
        }
      }
    }
  }

  .distribution-bar {
    margin-bottom: 20rpx;

    .bar-label {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12rpx;
      display: block;
    }

    .bar-container {
      display: flex;
      height: 44rpx;
      border-radius: 22rpx;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);

      .bar-segment {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18rpx;
        font-weight: 600;
        color: #fff;
        transition: width 0.5s ease;

        &.limit-down { background: linear-gradient(135deg, #74b9ff, #0984e3); }
        &.down { background: linear-gradient(135deg, $neon-green, #26de81); }
        &.flat { background: linear-gradient(135deg, #636e72, #b2bec3); }
        &.up { background: linear-gradient(135deg, lighten($neon-red, 15%), $neon-red); }
        &.limit-up { background: linear-gradient(135deg, $neon-red, darken($neon-red, 10%)); }
      }
    }
  }
}

// 展开按钮
.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx;
  background: rgba($neon-blue, 0.1);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: $neon-blue;
  margin-top: 16rpx;

  .expand-icon {
    font-size: 20rpx;
    transition: transform 0.3s ease;
  }
}

// 指数行情
.index-scroll {
  white-space: nowrap;
  margin: 0 -32rpx;
  padding: 0 32rpx;

  .index-cards {
    display: inline-flex;
    gap: 20rpx;
    padding: 8rpx 0;
  }

  .index-card {
    display: inline-flex;
    flex-direction: column;
    min-width: 200rpx;
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba($neon-blue, 0.1);
    border-radius: 16rpx;
    position: relative;
    overflow: hidden;

    &.up {
      border-color: rgba($neon-red, 0.3);
      background: linear-gradient(135deg, rgba($neon-red, 0.08) 0%, rgba($neon-red, 0.02) 100%);
    }

    &.down {
      border-color: rgba($neon-green, 0.3);
      background: linear-gradient(135deg, rgba($neon-green, 0.08) 0%, rgba($neon-green, 0.02) 100%);
    }

    .index-name {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 12rpx;
    }

    .index-price {
      font-size: 40rpx;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8rpx;
    }

    .index-change {
      font-size: 26rpx;
      font-weight: 600;
    }

    &.up .index-price,
    &.up .index-change {
      color: $neon-red;
    }

    &.down .index-price,
    &.down .index-change {
      color: $neon-green;
    }
  }
}

// 连板天梯
.ladder-card {
  .ladder-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .ladder-high {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .crown-icon {
        font-size: 40rpx;
      }

      .ladder-high-info {
        display: flex;
        flex-direction: column;

        .ladder-high-days {
          font-size: 36rpx;
          font-weight: 700;
          background: linear-gradient(135deg, lighten($neon-red, 10%), $neon-red);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ladder-high-label {
          font-size: 20rpx;
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .ladder-total {
      padding: 12rpx 24rpx;
      background: rgba($neon-purple, 0.2);
      border-radius: 24rpx;
      font-size: 26rpx;
      color: $neon-purple;
      font-weight: 500;
    }
  }

  .ladder-levels {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 8rpx;

    .level-tag {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 20rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      font-weight: 500;

      .level-count {
        opacity: 0.8;
      }

      &.high {
        background: linear-gradient(135deg, rgba($neon-red, 0.25), rgba($neon-red, 0.15));
        color: lighten($neon-red, 10%);
        border: 1px solid rgba($neon-red, 0.3);
      }

      &.mid {
        background: linear-gradient(135deg, rgba($neon-gold, 0.25), rgba($neon-gold, 0.15));
        color: $neon-gold;
        border: 1px solid rgba($neon-gold, 0.3);
      }

      &.low {
        background: linear-gradient(135deg, rgba($neon-blue, 0.25), rgba($neon-purple, 0.15));
        color: $neon-blue;
        border: 1px solid rgba($neon-blue, 0.3);
      }
    }
  }
}

// 资金流向
.fund-card {
  .flow-tabs {
    display: flex;
    gap: 16rpx;
    margin-bottom: 20rpx;

    .flow-tab {
      padding: 12rpx 28rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;

      &.active {
        background: linear-gradient(135deg, rgba($neon-red, 0.25), rgba($neon-red, 0.15));
        color: $neon-red;
      }
    }
  }

  .flow-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .flow-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 20rpx;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .flow-rank {
      width: 48rpx;
      height: 48rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      font-weight: 700;

      &.gold {
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: #fff;
      }

      &.silver {
        background: linear-gradient(135deg, #bdc3c7, #95a5a6);
        color: #fff;
      }

      &.bronze {
        background: linear-gradient(135deg, #e17055, #d35400);
        color: #fff;
      }

      &.normal {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .flow-info {
      flex: 1;

      .flow-name {
        display: block;
        font-size: 28rpx;
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 6rpx;
      }

      .flow-stats {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .flow-amount {
      text-align: right;

      .amount-value {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
      }

      .amount-pct {
        display: block;
        font-size: 20rpx;
        margin-top: 4rpx;
      }

      &.inflow {
        .amount-value, .amount-pct { color: $neon-red; }
      }

      &.outflow {
        .amount-value, .amount-pct { color: $neon-green; }
      }
    }
  }
}

// 加载状态
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($bg-dark, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid rgba(255, 255, 255, 0.1);
    border-top-color: $neon-blue;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
