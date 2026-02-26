<template>
  <view class="market-page">
    <!-- 顶部Header -->
    <view class="header-bar">
      <text class="header-title">行情中心</text>
      <text class="header-subtitle">实时市场数据</text>
    </view>

    <!-- 指数行情卡片 -->
    <view class="index-section">
      <view class="section-title">
        <text class="title-text">主要指数</text>
        <text class="update-time">{{ updateTime }}</text>
      </view>
      <scroll-view class="index-scroll" scroll-x>
        <view class="index-cards">
          <view
            v-for="(item, index) in indexData"
            :key="index"
            class="index-card"
            :class="getChangeClass(item.changePct)"
          >
            <text class="index-name">{{ item.Name || item.name }}</text>
            <text class="index-price">{{ formatPrice(item.Price || item.Now) }}</text>
            <view class="index-change">
              <text class="change-value">{{ formatChange(item.Change) }}</text>
              <text class="change-pct">{{ formatChangePct(item.ChangePct || item.EXT_ZF) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 连板天梯 -->
    <view class="ladder-section">
      <view class="section-title">
        <text class="title-text">连板天梯</text>
        <text class="total-count">共 {{ ladderTotal }} 只涨停</text>
      </view>
      <scroll-view class="ladder-scroll" scroll-y>
        <view
          v-for="level in ladderData"
          :key="level.days"
          class="ladder-level"
        >
          <view class="level-header">
            <view class="level-badge" :class="getLevelClass(level.days)">
              <text class="badge-text">{{ level.days }}连板</text>
            </view>
            <text class="level-count">{{ level.count }}只</text>
          </view>
          <view class="level-stocks">
            <view
              v-for="stock in level.stocks"
              :key="stock.code"
              class="stock-item"
            >
              <view class="stock-info">
                <text class="stock-name">{{ stock.name }}</text>
                <text class="stock-code">{{ stock.code }}</text>
              </view>
              <view class="stock-price-info">
                <text class="stock-price">{{ formatPrice(stock.price) }}</text>
                <text class="stock-change up">+{{ formatChangePct(stock.changePct) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="ladderData.length === 0 && !loading" class="empty-tip">
          <text>暂无数据</text>
        </view>
      </scroll-view>
    </view>

    <!-- 行业资金流向 -->
    <view class="fund-flow-section">
      <view class="section-title">
        <text class="title-text">行业资金流向</text>
        <view class="flow-tabs">
          <text
            class="tab-item"
            :class="{ active: fundFlowType === 'inflow' }"
            @click="switchFundFlow('inflow')"
          >流入</text>
          <text
            class="tab-item"
            :class="{ active: fundFlowType === 'outflow' }"
            @click="switchFundFlow('outflow')"
          >流出</text>
        </view>
      </view>
      <view class="fund-flow-list">
        <view
          v-for="(item, index) in fundFlowData"
          :key="index"
          class="flow-item"
        >
          <view class="flow-rank">
            <text class="rank-num">{{ index + 1 }}</text>
          </view>
          <view class="flow-info">
            <text class="flow-name">{{ item.name }}</text>
            <view class="flow-stats">
              <text class="stat-item">涨 {{ item.upCount || 0 }}</text>
              <text class="stat-item">跌 {{ item.downCount || 0 }}</text>
              <text class="stat-item">涨停 {{ item.limitUpCount || 0 }}</text>
            </view>
          </view>
          <view class="flow-amount" :class="fundFlowType === 'inflow' ? 'inflow' : 'outflow'">
            <text class="amount-value">{{ formatAmount(item.netInflow) }}</text>
            <text class="amount-pct">{{ item.netInflowPct ? item.netInflowPct.toFixed(2) + '%' : '0%' }}</text>
          </view>
        </view>
        <view v-if="fundFlowData.length === 0 && !loading" class="empty-tip">
          <text>暂无数据</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getIndexQuoteApi, getLimitUpLadderApi, getIndustryFundFlowApi } from '../../api/market.js'

// 数据状态
const loading = ref(false)
const updateTime = ref('')
const indexData = ref([])
const ladderData = ref([])
const ladderTotal = ref(0)
const fundFlowType = ref('inflow')
const fundFlowData = ref([])

// 格式化函数
const formatPrice = (price) => {
  if (!price) return '--'
  return parseFloat(price).toFixed(2)
}

const formatChange = (change) => {
  if (!change) return '0.00'
  const num = parseFloat(change)
  return num >= 0 ? '+' + num.toFixed(2) : num.toFixed(2)
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

const getChangeClass = (pct) => {
  if (!pct) return ''
  const num = parseFloat(pct)
  if (num > 0) return 'up'
  if (num < 0) return 'down'
  return ''
}

const getLevelClass = (days) => {
  if (days >= 5) return 'level-high'
  if (days >= 3) return 'level-mid'
  return 'level-low'
}

// 加载数据
const loadIndexData = async () => {
  try {
    const res = await getIndexQuoteApi()
    if (res.code === 200) {
      indexData.value = res.data || []
    }
  } catch (e) {
    console.error('加载指数数据失败:', e)
  }
}

const loadLadderData = async () => {
  try {
    const res = await getLimitUpLadderApi()
    if (res.code === 200) {
      ladderData.value = res.data?.ladder || []
      ladderTotal.value = res.data?.total || 0
      updateTime.value = res.data?.updateTime || ''
    }
  } catch (e) {
    console.error('加载连板天梯失败:', e)
  }
}

const loadFundFlowData = async () => {
  try {
    const res = await getIndustryFundFlowApi({ type: fundFlowType.value, top: 10 })
    if (res.code === 200) {
      fundFlowData.value = res.data?.industries || []
    }
  } catch (e) {
    console.error('加载资金流向失败:', e)
  }
}

const switchFundFlow = (type) => {
  fundFlowType.value = type
  loadFundFlowData()
}

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadIndexData(),
      loadLadderData(),
      loadFundFlowData()
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
.market-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

// Header
.header-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 28rpx 32rpx;
  padding-top: calc(28rpx + env(safe-area-inset-top));

  .header-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #ffffff;
  }

  .header-subtitle {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 8rpx;
  }
}

// 通用section标题
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx 16rpx;

  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
  }

  .update-time, .total-count {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

// 指数行情
.index-section {
  .index-scroll {
    white-space: nowrap;
  }

  .index-cards {
    display: inline-flex;
    padding: 0 24rpx;
    gap: 20rpx;
  }

  .index-card {
    display: inline-flex;
    flex-direction: column;
    min-width: 200rpx;
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    backdrop-filter: blur(10px);

    &.up {
      background: linear-gradient(135deg, rgba(234, 67, 83, 0.3) 0%, rgba(234, 67, 83, 0.1) 100%);
    }

    &.down {
      background: linear-gradient(135deg, rgba(46, 204, 113, 0.3) 0%, rgba(46, 204, 113, 0.1) 100%);
    }

    .index-name {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 12rpx;
    }

    .index-price {
      font-size: 40rpx;
      font-weight: 600;
      color: #ffffff;
    }

    .index-change {
      display: flex;
      gap: 12rpx;
      margin-top: 8rpx;

      .change-value, .change-pct {
        font-size: 24rpx;
        color: #ea4353;
      }
    }

    &.down .index-change {
      .change-value, .change-pct {
        color: #2ecc71;
      }
    }
  }
}

// 连板天梯
.ladder-section {
  margin-top: 24rpx;

  .ladder-scroll {
    max-height: 600rpx;
    padding: 0 24rpx;
  }

  .ladder-level {
    margin-bottom: 24rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    padding: 20rpx;

    .level-header {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .level-badge {
        padding: 8rpx 20rpx;
        border-radius: 20rpx;

        &.level-high {
          background: linear-gradient(135deg, #ea4353 0%, #ff6b6b 100%);
        }

        &.level-mid {
          background: linear-gradient(135deg, #f39c12 0%, #ffb74d 100%);
        }

        &.level-low {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .badge-text {
          font-size: 24rpx;
          font-weight: 600;
          color: #ffffff;
        }
      }

      .level-count {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .level-stocks {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
    }

    .stock-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12rpx;

      .stock-info {
        display: flex;
        flex-direction: column;

        .stock-name {
          font-size: 28rpx;
          color: #ffffff;
          font-weight: 500;
        }

        .stock-code {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 4rpx;
        }
      }

      .stock-price-info {
        text-align: right;

        .stock-price {
          display: block;
          font-size: 28rpx;
          color: #ffffff;
        }

        .stock-change {
          display: block;
          font-size: 24rpx;
          margin-top: 4rpx;

          &.up {
            color: #ea4353;
          }
        }
      }
    }
  }
}

// 资金流向
.fund-flow-section {
  margin-top: 24rpx;

  .flow-tabs {
    display: flex;
    gap: 24rpx;

    .tab-item {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.6);
      padding: 8rpx 20rpx;
      border-radius: 20rpx;

      &.active {
        color: #ffffff;
        background: rgba(102, 126, 234, 0.5);
      }
    }
  }

  .fund-flow-list {
    padding: 0 24rpx;
  }

  .flow-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12rpx;
    margin-bottom: 16rpx;

    .flow-rank {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8rpx;
      margin-right: 20rpx;

      .rank-num {
        font-size: 28rpx;
        font-weight: 600;
        color: #ffffff;
      }
    }

    .flow-info {
      flex: 1;

      .flow-name {
        display: block;
        font-size: 28rpx;
        color: #ffffff;
        font-weight: 500;
      }

      .flow-stats {
        display: flex;
        gap: 16rpx;
        margin-top: 8rpx;

        .stat-item {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .flow-amount {
      text-align: right;

      &.inflow {
        .amount-value, .amount-pct {
          color: #ea4353;
        }
      }

      &.outflow {
        .amount-value, .amount-pct {
          color: #2ecc71;
        }
      }

      .amount-value {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
      }

      .amount-pct {
        display: block;
        font-size: 22rpx;
        margin-top: 4rpx;
      }
    }
  }
}

// 空状态
.empty-tip {
  text-align: center;
  padding: 40rpx;

  text {
    color: rgba(255, 255, 255, 0.5);
    font-size: 26rpx;
  }
}

// 加载状态
.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16rpx;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
