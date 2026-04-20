<template>
  <uni-popup ref="filterPopup" type="bottom">
    <view class="filter-popup">
      <!-- 拖拽指示器 -->
      <view class="drag-indicator"></view>

      <!-- 标题 -->
      <view class="popup-title">消息筛选</view>

      <!-- 筛选内容 -->
      <scroll-view scroll-y class="filter-content">
        <!-- 时间范围 -->
        <view class="filter-section">
          <view class="section-title">时间范围</view>
          <view class="option-grid">
            <view
              v-for="option in timeOptions"
              :key="option.value"
              class="option-item"
              :class="{ active: filters.timeRange === option.value }"
              @tap="selectTimeRange(option.value)"
            >
              {{ option.label }}
            </view>
          </view>
        </view>

        <!-- 消息类型 -->
        <view class="filter-section">
          <view class="section-title">消息类型</view>
          <view class="option-grid">
            <view
              v-for="type in messageTypes"
              :key="type.value"
              class="option-item"
              :class="{ active: filters.messageType === type.value }"
              @tap="selectMessageType(type.value)"
            >
              {{ type.label }}
            </view>
          </view>
        </view>

        <!-- 高级筛选（管理员） -->
        <view v-if="isAdmin" class="filter-section">
          <view class="section-title">策略标签</view>
          <view class="option-grid">
            <view
              v-for="tag in strategyTags"
              :key="tag.value"
              class="option-item"
              :class="{ active: filters.strategyTag === tag.value }"
              @tap="selectStrategyTag(tag.value)"
            >
              {{ tag.label }}
            </view>
          </view>
        </view>

        <view v-if="isAdmin" class="filter-section">
          <view class="section-title">推送范围</view>
          <view class="option-grid">
            <view
              v-for="scope in pushScopes"
              :key="scope.value"
              class="option-item"
              :class="{ active: filters.pushScope === scope.value }"
              @tap="selectPushScope(scope.value)"
            >
              {{ scope.label }}
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 操作按钮 -->
      <view class="popup-actions">
        <button class="reset-btn" @tap="resetFilters">重置</button>
        <button class="confirm-btn" @tap="applyFilters">确定</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = {
  modelValue: {
    type: Object,
    default: () => ({
      timeRange: 'all',
      messageType: 'all',
      strategyTag: 'all',
      pushScope: 'all'
    })
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

const filters = ref({ ...props.modelValue })

const popup = ref(null)

// 时间选项
const timeOptions = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

// 消息类型
const messageTypes = [
  { label: '全部', value: 'all' },
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

// 策略标签（管理员）
const strategyTags = [
  { label: '全部', value: 'all' },
  { label: '短线策略', value: 'short_term' },
  { label: '中线策略', value: 'mid_term' }
]

// 推送范围（管理员）
const pushScopes = [
  { label: '全部用户', value: 'all_users' },
  { label: '短线策略', value: 'short_term' },
  { label: '中线策略', value: 'mid_term' }
]

// 打开面板
const open = () => {
  popup.value?.open()
}

// 选择时间
const selectTimeRange = (value) => {
  filters.value.timeRange = value
}

// 选择类型
const selectMessageType = (value) => {
  filters.value.messageType = value
}

// 选择策略标签
const selectStrategyTag = (value) => {
  filters.value.strategyTag = value
}

// 选择推送范围
const selectPushScope = (value) => {
  filters.value.pushScope = value
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    timeRange: 'all',
    messageType: 'all',
    strategyTag: 'all',
    pushScope: 'all'
  }
  emit('update:modelValue', filters.value)
  emit('reset')
  close()
}

// 应用筛选
const applyFilters = () => {
  emit('update:modelValue', filters.value)
  emit('apply', filters.value)
  close()
}

// 关闭面板
const close = () => {
  popup.value?.close()
}

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  filters.value = { ...newVal }
}, { deep: true })

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
/* 微信小程序 button 组件默认样式重置 */
button {
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	line-height: normal;
	font-size: inherit;
}
button::after {
	border: none;
}

.filter-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.drag-indicator {
  width: 80rpx;
  height: 8rpx;
  background: #ddd;
  border-radius: 4rpx;
  margin: 16rpx auto;
}

.popup-title {
  padding: 24rpx 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 0;
}

.filter-section {
  padding: 0 32rpx 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.option-item {
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}

.popup-actions {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.reset-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  text-align: center;
  border: none;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
