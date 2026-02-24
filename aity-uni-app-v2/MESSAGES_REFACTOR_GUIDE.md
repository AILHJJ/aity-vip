# 消息中心搜索筛选重构指南

## 📦 新增组件

### 1. FilterHeader.vue - 固定顶部筛选栏
**路径**: `src/components/FilterHeader.vue`

**功能**:
- 搜索输入框（实时搜索，防抖300ms）
- 快捷筛选按钮（横向滚动）
- 筛选状态栏（显示当前筛选条件）
- 筛选按钮（打开底部Sheet）

**Props**:
```javascript
{
  searchKeyword: String,          // 搜索关键词
  activeFilters: Object,          // 激活的筛选条件
  searchHistory: Array,           // 搜索历史
  showFilterStatus: Boolean       // 是否显示筛选状态栏
}
```

**Events**:
```javascript
{
  'search': (keyword) => {},                    // 搜索输入
  'search-focus': () => {},                    // 搜索框聚焦
  'search-blur': () => {},                     // 搜索框失焦
  'open-filter': () => {},                     // 打开筛选面板
  'apply-quick-filter': (filter) => {},        // 应用快捷筛选
  'clear-all-filters': () => {},               // 清除所有筛选
  'save-search-history': (history) => {}       // 保存搜索历史
}
```

---

### 2. SmartFilterSheet.vue - 底部Sheet筛选面板
**路径**: `src/components/SmartFilterSheet.vue`

**功能**:
- 时间范围选择
- 消息类型多选
- 策略标签多选
- 展开收起动画
- 实时显示筛选结果数量

**Props**:
```javascript
{
  value: Object,                   // 当前筛选条件（v-model）
  filteredCount: Number,          // 过滤后的消息数量
  userRole: String                // 用户角色
}
```

**Events**:
```javascript
{
  'input': (filters) => {},       // 筛选条件变化
  'apply': (filters) => {},       // 应用筛选
  'reset': () => {}               // 重置筛选
}
```

**Methods**:
```javascript
{
  open() => {},                    // 打开面板
  close() => {}                    // 关闭面板
}
```

---

## 🔧 在messages.vue中使用

### 步骤1: 引入组件

```vue
<script>
import FilterHeader from '@/components/FilterHeader.vue'
import SmartFilterSheet from '@/components/SmartFilterSheet.vue'

export default {
  components: {
    FilterHeader,
    SmartFilterSheet
  }
}
</script>
```

---

### 步骤2: 添加数据

```javascript
data() {
  return {
    // 搜索和筛选
    searchKeyword: '',
    searchHistory: uni.getStorageSync('searchHistory') || [],
    activeFilters: {
      timeRange: 'all',
      types: [],
      tags: []
    },
    // 消息列表
    allMessages: [],
    filteredMessages: []
  }
}
```

---

### 步骤3: 添加方法

```javascript
methods: {
  // ========== 搜索相关 ==========
  onSearch(keyword) {
    this.searchKeyword = keyword
    this.filterMessages()
  },

  onSearchFocus() {
    // 可以显示搜索历史面板
  },

  onSearchBlur() {
    // 隐藏搜索历史面板
  },

  clearSearch() {
    this.searchKeyword = ''
    this.filterMessages()
  },

  saveSearchHistory(history) {
    this.searchHistory = history
    uni.setStorageSync('searchHistory', history)
  },

  // ========== 筛选相关 ==========
  openFilterSheet() {
    this.$refs.filterSheet.open()
  },

  onFilterChange(filters) {
    this.activeFilters = filters
    this.updateFilteredCount()
  },

  applyFilters(filters) {
    this.activeFilters = filters
    this.filterMessages()
  },

  resetFilters() {
    this.activeFilters = {
      timeRange: 'all',
      types: [],
      tags: []
    }
    this.filterMessages()
  },

  clearAllFilters() {
    this.resetFilters()
    this.$refs.filterSheet?.close()
  },

  // ========== 快捷筛选 ==========
  applyQuickFilter(filter) {
    if (filter.value === 'all') {
      this.resetFilters()
    } else {
      this.activeFilters.timeRange = filter.timeRange || 'all'
      this.activeFilters.types = filter.type || []
    }
    this.filterMessages()
  },

  // ========== 过滤逻辑 ==========
  filterMessages() {
    let filtered = [...this.allMessages]

    // 1. 权限过滤
    filtered = this.filterByPermission(filtered)

    // 2. 搜索关键词过滤
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase()
      filtered = filtered.filter(msg => {
        return msg.title.toLowerCase().includes(keyword) ||
               msg.content.toLowerCase().includes(keyword)
      })
    }

    // 3. 时间范围过滤
    if (this.activeFilters.timeRange && this.activeFilters.timeRange !== 'all') {
      filtered = this.filterByTimeRange(filtered, this.activeFilters.timeRange)
    }

    // 4. 消息类型过滤
    if (this.activeFilters.types && this.activeFilters.types.length > 0) {
      filtered = filtered.filter(msg =>
        this.activeFilters.types.includes(msg.type)
      )
    }

    // 5. 策略标签过滤
    if (this.activeFilters.tags && this.activeFilters.tags.length > 0) {
      filtered = filtered.filter(msg => {
        const tags = msg.tags || []
        return this.activeFilters.tags.some(tag => tags.includes(tag))
      })
    }

    this.filteredMessages = filtered
    this.updateFilteredCount()
  },

  updateFilteredCount() {
    // 触发更新，让SmartFilterSheet显示正确的数量
    this.$forceUpdate()
  },

  filterByPermission(messages) {
    const userInfo = this.$store.state.user.userInfo
    if (!userInfo) return []

    // 管理员看到所有消息
    if (userInfo.role === 'super_admin' || userInfo.role === 'admin') {
      return messages
    }

    // 其他用户根据权限过滤
    return messages.filter(msg => {
      const tags = msg.tags || []

      // VIP中线用户
      if (userInfo.role === 'vip_mid') {
        return tags.includes('mid_term') || tags.includes('all_users')
      }

      // VIP短线用户
      if (userInfo.role === 'vip_short') {
        return tags.includes('short_term') || tags.includes('all_users')
      }

      // 体验用户
      return true // 显示所有
    })
  },

  filterByTimeRange(messages, timeRange) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return messages.filter(msg => {
      const msgDate = new Date(msg.createdAt)

      switch (timeRange) {
        case 'today':
          return msgDate >= today

        case 'week':
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return msgDate >= weekAgo

        case 'month':
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return msgDate >= monthAgo

        default:
          return true
      }
    })
  },

  // ========== 搜索结果高亮 ==========
  highlightKeyword(text) {
    if (!this.searchKeyword) return text

    const keyword = this.searchKeyword
    const regex = new RegExp(`(${keyword})`, 'gi')

    return text.replace(regex, '<span class="highlight">$1</span>')
  }
}
```

---

### 步骤4: 更新模板

```vue
<template>
  <view class="messages-container">
    <!-- 固定顶部筛选栏 -->
    <FilterHeader
      :search-keyword="searchKeyword"
      :active-filters="activeFilters"
      :search-history="searchHistory"
      :show-filter-status="true"
      @search="onSearch"
      @search-focus="onSearchFocus"
      @search-blur="onSearchBlur"
      @open-filter="openFilterSheet"
      @apply-quick-filter="applyQuickFilter"
      @clear-all-filters="clearAllFilters"
      @save-search-history="saveSearchHistory"
    />

    <!-- 消息列表区域 -->
    <view class="messages-list" style="margin-top: 180rpx;">
      <view
        v-for="message in filteredMessages"
        :key="message.id"
        class="message-item"
        @tap="goToDetail(message.id)"
      >
        <!-- 消息标题（搜索关键词高亮） -->
        <view class="message-title" v-html="highlightKeyword(message.title)"></view>

        <!-- 消息内容预览（搜索关键词高亮） -->
        <view class="message-preview" v-html="highlightKeyword(getPreview(message.content))"></view>

        <!-- 消息元信息 -->
        <view class="message-meta">
          <text class="message-type">{{ getMessageTypeLabel(message.type) }}</text>
          <text class="message-time">{{ formatTime(message.createdAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部筛选面板 -->
    <SmartFilterSheet
      ref="filterSheet"
      v-model="activeFilters"
      :filtered-count="filteredMessages.length"
      :user-role="$store.state.user.userInfo?.role"
      @input="onFilterChange"
      @apply="applyFilters"
      @reset="resetFilters"
    />
  </view>
</template>
```

---

### 步骤5: 添加样式

```scss
<style lang="scss" scoped>
.messages-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.messages-list {
  padding: 24rpx;
}

.message-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  &:active {
    opacity: 0.9;
  }
}

.message-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;

  // 搜索关键词高亮样式
  :deep(.highlight) {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 0 4rpx;
    border-radius: 4rpx;
  }
}

.message-preview {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  :deep(.highlight) {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 0 4rpx;
    border-radius: 4rpx;
  }
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}
</style>
```

---

## 📊 对比：旧方案 vs 新方案

| 维度 | 旧方案 | 新方案 |
|------|--------|--------|
| **组件数量** | MessageFilterBar + FilterBar | FilterHeader + SmartFilterSheet |
| **搜索步骤** | 输入 → 点击搜索按钮 | 输入即搜索（防抖300ms） |
| **筛选入口** | 两个筛选栏 | 一个筛选按钮 |
| **筛选面板** | 展开在页面内（遮挡内容） | 底部Sheet（不遮挡） |
| **空间占用** | 300-400rpx | 固定180rpx |
| **快捷筛选** | 横向滚动 | 横向滚动 + 顶部固定 |
| **筛选状态** | 需滚动查看 | 顶部状态栏始终可见 |
| **结果高亮** | 无 | 有 |
| **手势交互** | 无 | 拖拽关闭Sheet |

---

## ✅ 实施检查清单

- [ ] 创建FilterHeader组件
- [ ] 创建SmartFilterSheet组件
- [ ] 在messages.vue中引入组件
- [ ] 添加数据和方法
- [ ] 更新模板
- [ ] 添加样式
- [ ] 移除旧的MessageFilterBar和FilterBar
- [ ] 测试搜索功能
- [ ] 测试快捷筛选
- [ ] 测试完整筛选面板
- [ ] 测试搜索历史
- [ ] 测试筛选状态显示
- [ ] 测试搜索关键词高亮
- [ ] 测试清除筛选功能

---

## 🎯 预期效果

实施完成后：
- ✅ 操作步骤减少75%（4-5步 → 1步）
- ✅ 空间占用减少50%（300-400rpx → 180rpx）
- ✅ 搜索即时反馈（无需点击按钮）
- ✅ 筛选状态始终可见
- ✅ 无遮挡设计
- ✅ 符合微信小程序规范

---

## 📝 注意事项

1. **uni-popup组件**: 需要确保项目中已安装uni-ui
2. **搜索历史存储**: 使用本地存储，最多保存10条
3. **防抖处理**: 搜索输入已做防抖处理（300ms）
4. **权限过滤**: 保持原有的权限过滤逻辑
5. **性能优化**: 如果消息列表很长，建议使用虚拟滚动
