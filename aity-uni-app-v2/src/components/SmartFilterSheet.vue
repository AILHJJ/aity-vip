<template>
  <uni-popup ref="filterSheet" type="bottom" :safe-area="false">
    <view class="smart-filter-sheet">
      <!-- 拖拽指示器 -->
      <view class="drag-indicator"></view>

      <!-- 标题栏 -->
      <view class="sheet-header">
        <text class="sheet-title">消息筛选</text>
        <text class="sheet-close" @tap="closeSheet">完成</text>
      </view>

      <!-- 筛选内容区 -->
      <scroll-view scroll-y class="filter-content">
        <!-- 时间范围 -->
        <view class="filter-section">
          <view class="section-header" @tap="toggleSection('time')">
            <text class="section-title">时间范围</text>
            <text class="section-arrow">{{ expandedSections.time ? '▼' : '▶' }}</text>
          </view>
          <view v-show="expandedSections.time" class="filter-options">
            <view
              v-for="option in timeOptions"
              :key="option.value"
              class="filter-option"
              :class="{ active: filters.timeRange === option.value }"
              @tap="selectTimeRange(option.value)"
            >
              {{ option.label }}
            </view>
          </view>
        </view>

        <!-- 消息类型 -->
        <view class="filter-section">
          <view class="section-header" @tap="toggleSection('type')">
            <text class="section-title">消息类型</text>
            <text class="section-arrow">{{ expandedSections.type ? '▼' : '▶' }}</text>
          </view>
          <view v-show="expandedSections.type" class="filter-options">
            <view
              v-for="type in messageTypeOptions"
              :key="type.value"
              class="filter-option"
              :class="{ active: filters.types.includes(type.value) }"
              @tap="toggleMessageType(type.value)"
            >
              {{ type.label }}
            </view>
          </view>
        </view>

        <!-- 策略标签 -->
        <view class="filter-section">
          <view class="section-header" @tap="toggleSection('tag')">
            <text class="section-title">策略标签</text>
            <text class="section-arrow">{{ expandedSections.tag ? '▼' : '▶' }}</text>
          </view>
          <view v-show="expandedSections.tag" class="filter-options">
            <view
              v-for="tag in tagOptions"
              :key="tag.value"
              class="filter-option"
              :class="{ active: filters.tags.includes(tag.value) }"
              @tap="toggleTag(tag.value)"
            >
              {{ tag.label }}
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作栏 -->
      <view class="sheet-footer">
        <view class="footer-info">
          <text class="result-count">找到 {{ filteredCount }} 条消息</text>
        </view>
        <view class="footer-actions">
          <button class="reset-btn" @tap="resetFilters">重置筛选</button>
          <button class="apply-btn" type="primary" @tap="applyFilters">确定</button>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'SmartFilterSheet',
  props: {
    // 当前筛选条件
    value: {
      type: Object,
      default: () => ({
        timeRange: 'all',
        types: [],
        tags: []
      })
    },
    // 过滤后的消息数量
    filteredCount: {
      type: Number,
      default: 0
    },
    // 用户角色（用于决定显示哪些选项）
    userRole: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      filters: {
        timeRange: 'all',
        types: [],
        tags: []
      },
      expandedSections: {
        time: true,
        type: true,
        tag: true
      },
      // 时间范围选项
      timeOptions: [
        { label: '全部时间', value: 'all' },
        { label: '今天', value: 'today' },
        { label: '本周', value: 'week' },
        { label: '本月', value: 'month' }
      ],
      // 消息类型选项
      messageTypeOptions: [
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
      ],
      // 策略标签选项
      tagOptions: [
        { label: '全部用户', value: 'all_users' },
        { label: '短线策略', value: 'short_term' },
        { label: '中线策略', value: 'mid_term' }
      ]
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.filters = { ...newVal }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 打开面板
    open() {
      this.$refs.filterSheet.open()
    },

    // 关闭面板
    closeSheet() {
      this.$refs.filterSheet.close()
    },

    // 切换展开/收起
    toggleSection(section) {
      this.expandedSections[section] = !this.expandedSections[section]
    },

    // 选择时间范围
    selectTimeRange(value) {
      this.filters.timeRange = value
      this.$emit('input', { ...this.filters })
    },

    // 切换消息类型（多选）
    toggleMessageType(type) {
      const index = this.filters.types.indexOf(type)
      if (index > -1) {
        this.filters.types.splice(index, 1)
      } else {
        this.filters.types.push(type)
      }
      this.$emit('input', { ...this.filters })
    },

    // 切换策略标签（多选）
    toggleTag(tag) {
      const index = this.filters.tags.indexOf(tag)
      if (index > -1) {
        this.filters.tags.splice(index, 1)
      } else {
        this.filters.tags.push(tag)
      }
      this.$emit('input', { ...this.filters })
    },

    // 重置筛选
    resetFilters() {
      this.filters = {
        timeRange: 'all',
        types: [],
        tags: []
      }
      this.$emit('input', { ...this.filters })
      this.$emit('reset')

      // 震动反馈
      uni.vibrateShort({
        type: 'light'
      })
    },

    // 应用筛选
    applyFilters() {
      this.$emit('apply', { ...this.filters })
      this.closeSheet()

      // 震动反馈
      uni.vibrateShort({
        type: 'light'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.smart-filter-sheet {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* 拖拽指示器 */
.drag-indicator {
  width: 80rpx;
  height: 8rpx;
  background: #ddd;
  border-radius: 4rpx;
  margin: 16rpx auto;
}

/* 标题栏 */
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.sheet-close {
  font-size: 28rpx;
  color: #667eea;
}

/* 筛选内容区 */
.filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 32rpx;
}

/* 筛选区块 */
.filter-section {
  border-bottom: 1rpx solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;

  &:active {
    background: #f8f9fa;
  }
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.section-arrow {
  font-size: 24rpx;
  color: #999;
}

/* 筛选选项 */
.filter-options {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx 32rpx;
  gap: 16rpx;
}

.filter-option {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
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

/* 底部操作栏 */
.sheet-footer {
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.footer-info {
  text-align: center;
  margin-bottom: 24rpx;
}

.result-count {
  font-size: 26rpx;
  color: #666;
}

.footer-actions {
  display: flex;
  gap: 16rpx;
}

.reset-btn,
.apply-btn {
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

  &:active {
    background: #e8e8e8;
  }
}

.apply-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  &:active {
    opacity: 0.9;
  }
}
</style>
