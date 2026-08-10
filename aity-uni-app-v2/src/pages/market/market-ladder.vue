<template>
  <view class="ladder-page">
    <app-nav-bar title="连板天梯" theme="dark" show-back />

    <!-- Summary Bar -->
    <view class="summary-bar">
      <view class="summary-item">
        <text class="summary-value high">{{ highestDays }}板</text>
        <text class="summary-label">最高</text>
      </view>
      <view class="summary-item">
        <text class="summary-value mid">{{ medianDays }}板</text>
        <text class="summary-label">中位</text>
      </view>
      <view class="summary-item">
        <text class="summary-value low">{{ lowestDays }}板</text>
        <text class="summary-label">最低</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">{{ formatAmount(totalAmount) }}</text>
        <text class="summary-label">成交额</text>
      </view>
    </view>

    <!-- Ladder Content -->
    <scroll-view class="ladder-scroll" scroll-y>
      <view
        v-for="level in ladderLevels"
        :key="level.days"
        class="ladder-level"
      >
        <view class="level-header">
          <view class="level-badge" :class="getLevelClass(level.days)">
            <text class="badge-icon">{{ getLevelIcon(level.days) }}</text>
            <text class="badge-text">{{ level.days }}连板</text>
          </view>
          <text class="level-count">{{ level.stocks.length }}只</text>
        </view>
        <view class="stock-list">
          <view
            v-for="stock in level.stocks"
            :key="stock.code"
            class="stock-card"
            :class="{ dragon: stock.isDragon }"
          >
            <view class="stock-main">
              <view class="stock-info">
                <view class="stock-name-row">
                  <text class="stock-name">{{ stock.name }}</text>
                  <text v-if="stock.isDragon" class="dragon-tag">龙头</text>
                </view>
                <text class="stock-code">{{ stock.code }}</text>
              </view>
              <view class="stock-price">
                <text class="price-value">{{ stock.price }}</text>
                <text class="price-change">+10.00%</text>
              </view>
            </view>
            <view class="stock-details">
              <view class="detail-item">
                <text class="detail-value red">{{ formatAmount(stock.sealAmount) }}</text>
                <text class="detail-label">封单额</text>
              </view>
              <view class="detail-item">
                <text class="detail-value yellow">{{ stock.sealRatio }}%</text>
                <text class="detail-label">封成比</text>
              </view>
              <view class="detail-item">
                <text class="detail-value blue">{{ stock.turnoverRate }}%</text>
                <text class="detail-label">换手率</text>
              </view>
              <view class="detail-item">
                <text class="detail-value green">{{ stock.volumeRatio }}</text>
                <text class="detail-label">量比</text>
              </view>
            </view>
            <view class="stock-reason">
              <text class="reason-icon">💡</text>
              <text class="reason-text">{{ stock.reason }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Footer -->
      <view class="footer">
        <text>数据更新时间: {{ updateTime }}</text>
      </view>
    </scroll-view>

    <!-- Loading -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLimitUpLadderApi } from '../../api/market.js'
import AppNavBar from '@/components/app-nav-bar.vue'

// 状态
const loading = ref(false)
const totalCount = ref(0)
const totalAmount = ref(0)
const updateTime = ref('')
const ladderLevels = ref([])

// 计算属性
const highestDays = computed(() => {
  if (ladderLevels.value.length === 0) return 0
  return Math.max(...ladderLevels.value.map(l => l.days))
})

const lowestDays = computed(() => {
  if (ladderLevels.value.length === 0) return 0
  return Math.min(...ladderLevels.value.map(l => l.days))
})

const medianDays = computed(() => {
  if (ladderLevels.value.length === 0) return 0
  const days = ladderLevels.value.map(l => l.days).sort((a, b) => a - b)
  return days[Math.floor(days.length / 2)]
})

// 方法
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

const getLevelClass = (days) => {
  if (days >= 6) return 'high'
  if (days >= 4) return 'mid'
  return 'low'
}

const getLevelIcon = (days) => {
  if (days >= 8) return '🔥'
  if (days >= 6) return '⚡'
  if (days >= 4) return '🔸'
  return '🔹'
}

// 数据加载
const loadData = async () => {
  loading.value = true
  try {
    const res = await getLimitUpLadderApi()
    if (res.code === 200 && res.data) {
      totalCount.value = res.data.total || 0
      totalAmount.value = res.data.amount || 0
      updateTime.value = res.data.updateTime || ''
      ladderLevels.value = res.data.levels || []
    }
  } catch (e) {
    console.error('加载连板天梯失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
$neon-blue: #00d4ff;
$neon-purple: #a855f7;
$neon-red: #ff4757;
$neon-green: #2ed573;
$neon-gold: #fdcb6e;
$bg-dark: #0a0a1a;
$bg-mid: #1a1a3e;

.ladder-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-dark 0%, $bg-mid 50%, darken($bg-mid, 5%) 100%);
  position: relative;

  // 添加网格背景纹理
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.02) 1rpx, transparent 1rpx),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1rpx, transparent 1rpx);
    background-size: 40rpx 40rpx;
    pointer-events: none;
    z-index: 0;
  }
}

// Header - 优化版本
.header-bar {
  background: linear-gradient(135deg, rgba($neon-red, 0.15) 0%, rgba($neon-purple, 0.12) 100%);
  padding: 50px 32rpx 24rpx;
  border-bottom: 2rpx solid rgba($neon-red, 0.3);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);

  .header-left {
    width: 72rpx;
    height: 72rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.1);
    }

    .back-icon {
      font-size: 40rpx;
      color: #ffffff;
      font-weight: 300;
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .header-title {
      font-size: 36rpx;
      font-weight: 600;
      background: linear-gradient(90deg, $neon-red, $neon-purple);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2rpx 8rpx rgba($neon-red, 0.3);
    }

    .header-count {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 4rpx;
      font-weight: 500;
    }
  }

  .header-right {
    width: 72rpx;
    display: flex;
    justify-content: center;

    .glow-dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      background: $neon-red;
      box-shadow: 0 0 10rpx $neon-red, 0 0 20rpx $neon-red;
      animation: glowPulse 2s ease-in-out infinite;
    }
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    box-shadow: 0 0 10rpx $neon-red;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 20rpx $neon-red, 0 0 30rpx rgba($neon-red, 0.5);
  }
}

// Summary Bar - 优化版本
.summary-bar {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;

  .summary-item {
    text-align: center;
    padding: 16rpx;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.06);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 0.05);
    }

    .summary-value {
      display: block;
      font-size: 36rpx;
      font-weight: 700;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);

      &.high {
        color: $neon-red;
        text-shadow: 0 2rpx 8rpx rgba($neon-red, 0.4);
      }
      &.mid {
        color: $neon-gold;
        text-shadow: 0 2rpx 8rpx rgba($neon-gold, 0.4);
      }
      &.low {
        color: $neon-blue;
        text-shadow: 0 2rpx 8rpx rgba($neon-blue, 0.4);
      }
    }

    .summary-label {
      display: block;
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 6rpx;
      font-weight: 500;
    }
  }
}

// Ladder Scroll
.ladder-scroll {
  height: calc(100vh - 200rpx);
  padding: 24rpx 32rpx;
  position: relative;
  z-index: 1;
}

// Ladder Level - 优化版本
.ladder-level {
  margin-bottom: 32rpx;

  .level-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;
    padding: 20rpx;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 20rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.06);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.99);
      background: rgba(255, 255, 255, 0.05);
    }

    .level-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 28rpx;
      border-radius: 32rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);

      .badge-icon {
        font-size: 24rpx;
      }

      .badge-text {
        font-size: 28rpx;
        font-weight: 700;
      }

      &.high {
        background: linear-gradient(135deg, rgba($neon-red, 0.3), rgba($neon-red, 0.2));
        border: 2rpx solid rgba($neon-red, 0.5);
        box-shadow: 0 4rpx 20rpx rgba($neon-red, 0.3);
        .badge-text {
          color: lighten($neon-red, 10%);
          text-shadow: 0 2rpx 4rpx rgba($neon-red, 0.3);
        }
      }

      &.mid {
        background: linear-gradient(135deg, rgba($neon-gold, 0.3), rgba($neon-gold, 0.2));
        border: 2rpx solid rgba($neon-gold, 0.5);
        box-shadow: 0 4rpx 20rpx rgba($neon-gold, 0.3);
        .badge-text {
          color: $neon-gold;
          text-shadow: 0 2rpx 4rpx rgba($neon-gold, 0.3);
        }
      }

      &.low {
        background: linear-gradient(135deg, rgba($neon-blue, 0.3), rgba($neon-purple, 0.2));
        border: 2rpx solid rgba($neon-blue, 0.5);
        box-shadow: 0 4rpx 20rpx rgba($neon-blue, 0.3);
        .badge-text {
          color: $neon-blue;
          text-shadow: 0 2rpx 4rpx rgba($neon-blue, 0.3);
        }
      }
    }

    .level-count {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }
  }
}

// Stock Card - 优化版本
.stock-card {
  background: rgba(255, 255, 255, 0.04);
  border: 2rpx solid rgba($neon-red, 0.2);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6rpx;
    height: 100%;
    background: linear-gradient(180deg, $neon-red, lighten($neon-red, 15%));
    box-shadow: 2rpx 0 8rpx rgba($neon-red, 0.4);
  }

  &.dragon::before {
    background: linear-gradient(180deg, $neon-gold, $neon-red);
    box-shadow: 2rpx 0 12rpx rgba($neon-gold, 0.5);
  }

  .stock-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;

    .stock-info {
      .stock-name-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 6rpx;

        .stock-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #ffffff;
          text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
        }

        .dragon-tag {
          font-size: 18rpx;
          padding: 6rpx 16rpx;
          background: linear-gradient(135deg, $neon-gold, $neon-red);
          border-radius: 8rpx;
          color: #000;
          font-weight: 700;
          box-shadow: 0 2rpx 8rpx rgba($neon-gold, 0.3);
        }
      }

      .stock-code {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 500;
      }
    }

    .stock-price {
      text-align: right;

      .price-value {
        display: block;
        font-size: 36rpx;
        font-weight: 700;
        color: $neon-red;
        text-shadow: 0 2rpx 8rpx rgba($neon-red, 0.4);
      }

      .price-change {
        font-size: 24rpx;
        color: lighten($neon-red, 10%);
        font-weight: 600;
      }
    }
  }

  .stock-details {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12rpx;
    padding: 16rpx;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.05);

    .detail-item {
      text-align: center;

      .detail-value {
        display: block;
        font-size: 24rpx;
        font-weight: 600;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);

        &.red {
          color: $neon-red;
          text-shadow: 0 2rpx 6rpx rgba($neon-red, 0.3);
        }
        &.green {
          color: $neon-green;
          text-shadow: 0 2rpx 6rpx rgba($neon-green, 0.3);
        }
        &.blue {
          color: $neon-blue;
          text-shadow: 0 2rpx 6rpx rgba($neon-blue, 0.3);
        }
        &.yellow {
          color: $neon-gold;
          text-shadow: 0 2rpx 6rpx rgba($neon-gold, 0.3);
        }
      }

      .detail-label {
        display: block;
        font-size: 18rpx;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 4rpx;
        font-weight: 500;
      }
    }
  }

  .stock-reason {
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
    padding: 12rpx 16rpx;
    background: rgba($neon-purple, 0.12);
    border-radius: 10rpx;
    border-left: 4rpx solid $neon-purple;
    box-shadow: 0 2rpx 8rpx rgba($neon-purple, 0.2);

    .reason-icon {
      font-size: 24rpx;
    }

    .reason-text {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
      font-weight: 500;
    }
  }
}

// Footer - 优化版本
.footer {
  text-align: center;
  padding: 32rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

// Loading - 优化版本
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($bg-dark, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid rgba(255, 255, 255, 0.15);
    border-top-color: $neon-red;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 20rpx rgba($neon-red, 0.3);
  }

  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
