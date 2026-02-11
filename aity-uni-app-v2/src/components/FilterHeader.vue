<template>
  <view class="filter-header">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          :value="searchKeyword"
          placeholder="搜索消息标题、内容..."
          @input="onSearchInput"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
        />
        <text
          v-if="searchKeyword"
          class="clear-icon"
          @tap="clearSearch"
        >✕</text>
      </view>
      <view class="filter-btn" @tap="openFilterSheet">
        <text>筛选</text>
        <text v-if="hasActiveFilters" class="filter-badge">{{ activeFilterCount }}</text>
      </view>
    </view>

    <!-- 快捷筛选 -->
    <scroll-view
      scroll-x
      class="quick-filters"
      :show-scrollbar="false"
    >
      <view
        v-for="filter in quickFilters"
        :key="filter.value"
        class="quick-filter-item"
        :class="{ active: isQuickFilterActive(filter) }"
        @tap="applyQuickFilter(filter)"
      >
        {{ filter.label }}
      </view>
    </scroll-view>

    <!-- 筛选状态栏（有筛选时显示） -->
    <view v-if="hasActiveFilters && showFilterStatus" class="filter-status-bar">
      <view class="filter-status-content">
        <text class="filter-status-label">筛选:</text>
        <text class="filter-status-text">{{ getFilterSummary() }}</text>
        <text class="filter-status-clear" @tap="clearAllFilters">清除 ✕</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FilterHeader',
  props: {
    // 搜索关键词
    searchKeyword: {
      type: String,
      default: ''
    },
    // 激活的筛选条件
    activeFilters: {
      type: Object,
      default: () => ({})
    },
    // 搜索历史
    searchHistory: {
      type: Array,
      default: () => []
    },
    // 是否显示筛选状态栏
    showFilterStatus: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      searchTimer: null,
      // 快捷筛选配置
      quickFilters: [
        { label: '全部消息', value: 'all', type: null, timeRange: null },
        { label: '今天早盘', value: 'today-morning', type: ['morning_comment', 'morning_focus'], timeRange: 'today' },
        { label: '今天全部', value: 'today-all', type: null, timeRange: 'today' },
        { label: '本周关注', value: 'week-focus', type: ['morning_focus', 'afternoon_focus'], timeRange: 'week' },
        { label: '风险提示', value: 'risk', type: ['risk_warning'], timeRange: null }
      ]
    }
  },
  computed: {
    // 是否有激活的筛选
    hasActiveFilters() {
      return this.activeFilterCount > 0
    },
    // 激活的筛选数量
    activeFilterCount() {
      let count = 0
      if (this.activeFilters.timeRange && this.activeFilters.timeRange !== 'all') count++
      if (this.activeFilters.types && this.activeFilters.types.length > 0) count++
      if (this.activeFilters.tags && this.activeFilters.tags.length > 0) count++
      return count
    }
  },
  methods: {
    // 搜索输入（防抖300ms）
    onSearchInput(e) {
      const keyword = e.detail.value

      // 防抖处理
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.$emit('search', keyword)
        this.saveSearchHistory(keyword)
      }, 300)
    },

    // 搜索框聚焦
    onSearchFocus() {
      this.$emit('search-focus')
    },

    // 搜索框失焦
    onSearchBlur() {
      this.$emit('search-blur')
    },

    // 清除搜索
    clearSearch() {
      this.$emit('search', '')
    },

    // 打开筛选面板
    openFilterSheet() {
      this.$emit('open-filter')
    },

    // 应用快捷筛选
    applyQuickFilter(filter) {
      this.$emit('apply-quick-filter', filter)
    },

    // 判断快捷筛选是否激活
    isQuickFilterActive(filter) {
      const { timeRange, types } = this.activeFilters

      // 特殊处理"全部消息"
      if (filter.value === 'all') {
        return !timeRange && (!types || types.length === 0)
      }

      // 检查时间范围
      const timeMatch = filter.timeRange === timeRange

      // 检查类型
      let typeMatch = true
      if (filter.type) {
        typeMatch = types && types.length === filter.type.length &&
          filter.type.every(t => types.includes(t))
      } else {
        typeMatch = !types || types.length === 0
      }

      return timeMatch && typeMatch
    },

    // 获取筛选摘要
    getFilterSummary() {
      const parts = []

      if (this.activeFilters.timeRange && this.activeFilters.timeRange !== 'all') {
        const timeLabels = {
          today: '今天',
          week: '本周',
          month: '本月',
          custom: '自定义'
        }
        parts.push(timeLabels[this.activeFilters.timeRange] || this.activeFilters.timeRange)
      }

      if (this.activeFilters.types && this.activeFilters.types.length > 0) {
        const typeLabels = {
          pre_market_comment: '盘前',
          morning_comment: '早盘点评',
          morning_focus: '早盘关注',
          afternoon_comment: '尾盘点评',
          afternoon_focus: '尾盘关注',
          close_comment: '收盘点评',
          risk_warning: '风险提示',
          system: '系统消息',
          important: '重要消息',
          daily: '日常消息'
        }
        const labels = this.activeFilters.types.map(t => typeLabels[t] || t).join('、')
        parts.push(labels)
      }

      if (this.activeFilters.tags && this.activeFilters.tags.length > 0) {
        const tagLabels = {
          short_term: '短线策略',
          mid_term: '中线策略',
          all_users: '全部用户'
        }
        const labels = this.activeFilters.tags.map(t => tagLabels[t] || t).join('、')
        parts.push(labels)
      }

      return parts.join(' + ') || '无'
    },

    // 清除所有筛选
    clearAllFilters() {
      this.$emit('clear-all-filters')
    },

    // 保存搜索历史
    saveSearchHistory(keyword) {
      if (!keyword || keyword.trim().length === 0) return

      const history = this.searchHistory.filter(k => k !== keyword)
      history.unshift(keyword)

      // 只保留最近10条
      if (history.length > 10) {
        history.pop()
      }

      this.$emit('save-search-history', history)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  /* 固定高度180rpx */
  min-height: 180rpx;
  max-height: 260rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  gap: 16rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 16rpx 24rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;

  &:active {
    color: #666;
  }
}

.filter-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 24rpx;
  background: #667eea;
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
  white-space: nowrap;

  &:active {
    opacity: 0.8;
  }
}

.filter-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: #ff4757;
  border-radius: 16rpx;
  font-size: 20rpx;
  line-height: 32rpx;
  text-align: center;
}

/* 快捷筛选 */
.quick-filters {
  display: flex;
  white-space: nowrap;
  padding: 0 24rpx 16rpx;
}

.quick-filter-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}

/* 筛选状态栏 */
.filter-status-bar {
  padding: 16rpx 24rpx;
  background: #f8f9fa;
  border-top: 1rpx solid #eee;
}

.filter-status-content {
  display: flex;
  align-items: center;
  font-size: 26rpx;
}

.filter-status-label {
  color: #666;
  margin-right: 8rpx;
}

.filter-status-text {
  flex: 1;
  color: #333;
  font-weight: 500;
}

.filter-status-clear {
  color: #667eea;
  margin-left: 16rpx;

  &:active {
    opacity: 0.7;
  }
}
</style>
