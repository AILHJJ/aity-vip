<template>
  <view class="simple-filter-bar">
    <!-- 快速筛选按钮 -->
    <view class="quick-filters">
      <view
        v-for="filter in quickFilters"
        :key="filter.value"
        class="quick-filter-btn"
        :class="{ active: activeQuickFilter === filter.value }"
        @tap="applyQuickFilter(filter)"
      >
        {{ filter.label }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = {
  modelValue: {
    type: String,
    default: 'all'
  }
}

const emit = defineEmits(['update:modelValue', 'change'])

const activeQuickFilter = ref(props.modelValue)

// 快速筛选选项 - 完全独立
const quickFilters = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '早盘', value: 'morning' },
  { label: '关注', value: 'focus' },
  { label: '风险', value: 'risk' }
]

const applyQuickFilter = (filter) => {
  activeQuickFilter.value = filter.value
  emit('update:modelValue', filter.value)
  emit('change', filter.value)
}
</script>

<style lang="scss" scoped>
.simple-filter-bar {
  padding: 16rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.quick-filters {
  display: flex;
  gap: 16rpx;
  overflow-x: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
}

.quick-filter-btn {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}
</style>
