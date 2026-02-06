# 日期范围选择器组件 - 集成指南

## 组件概述

`date-range-picker.vue` 是一个功能完整的日期范围选择器组件，用于在应用中实现自定义时间筛选功能。

### 功能特性

- ✅ 分别选择开始日期和结束日期
- ✅ 自动验证结束日期 >= 开始日期
- ✅ 日期格式：YYYY-MM-DD
- ✅ 提供"确定"和"取消"按钮
- ✅ 支持H5和微信小程序平台
- ✅ 平滑的弹窗动画效果
- ✅ 完善的错误提示
- ✅ 日期范围限制（最多1年）

## 组件位置

```
src/components/date-range-picker.vue
```

## API 文档

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示日期选择器弹窗 |
| startDate | String | '' | 开始日期，格式：'YYYY-MM-DD' |
| endDate | String | '' | 结束日期，格式：'YYYY-MM-DD' |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| confirm | { startDate, endDate } | 点击确定按钮时触发，返回选中的日期范围 |
| cancel | - | 点击取消按钮或遮罩时触发 |
| update:visible | Boolean | visible状态改变时触发，用于双向绑定 |

### Methods (通过 ref 调用)

| 方法名 | 参数 | 说明 |
|--------|------|------|
| open | - | 打开日期选择器 |
| close | - | 关闭日期选择器 |

## 基础使用示例

### 1. 简单使用

```vue
<template>
  <view>
    <button @click="showPicker = true">选择日期范围</button>

    <date-range-picker
      :visible="showPicker"
      :start-date="startDate"
      :end-date="endDate"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @update:visible="showPicker = $event"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import DateRangePicker from '@/components/date-range-picker.vue'

const showPicker = ref(false)
const startDate = ref('')
const endDate = ref('')

const handleConfirm = (range) => {
  startDate.value = range.startDate
  endDate.value = range.endDate
  console.log('选择的日期范围：', range)
}

const handleCancel = () => {
  console.log('取消选择')
}
</script>
```

### 2. 使用 ref 调用方法

```vue
<template>
  <view>
    <button @click="openPicker">选择日期范围</button>

    <date-range-picker
      ref="datePickerRef"
      :visible="showPicker"
      @confirm="handleConfirm"
      @update:visible="showPicker = $event"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import DateRangePicker from '@/components/date-range-picker.vue'

const showPicker = ref(false)
const datePickerRef = ref(null)

const openPicker = () => {
  // 通过 ref 调用打开方法
  datePickerRef.value?.open()
}

const handleConfirm = (range) => {
  console.log('选择的日期范围：', range)
}
</script>
```

## 在消息筛选系统中集成

### 方案一：作为筛选栏的快捷选项

在 `src/pages/messages/messages.vue` 中添加自定义日期筛选：

```vue
<template>
  <view class="messages-container">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x show-scrollbar="false">
        <view class="filter-items">
          <view
            v-for="tag in filterTags"
            :key="tag.value"
            class="filter-item"
            :class="{ active: activeTag === tag.value }"
            @click="handleTagFilter(tag.value)"
          >
            {{ tag.label }}
          </view>

          <!-- 新增：自定义日期筛选按钮 -->
          <view
            class="filter-item"
            :class="{ active: isCustomDateRange }"
            @click="openDateRangePicker"
          >
            📅 自定义
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 日期范围选择器 -->
    <date-range-picker
      :visible="showDatePicker"
      :start-date="dateRange.startDate"
      :end-date="dateRange.endDate"
      @confirm="handleDateConfirm"
      @cancel="handleDateCancel"
      @update:visible="showDatePicker = $event"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import DateRangePicker from '@/components/date-range-picker.vue'

// 新增状态
const showDatePicker = ref(false)
const dateRange = ref({
  startDate: '',
  endDate: ''
})

// 判断是否为自定义日期范围
const isCustomDateRange = computed(() => {
  return dateRange.value.startDate && dateRange.value.endDate
})

// 打开日期选择器
const openDateRangePicker = () => {
  showDatePicker.value = true
}

// 处理日期确认
const handleDateConfirm = (range) => {
  dateRange.value = {
    startDate: range.startDate,
    endDate: range.endDate
  }

  // 清除标签筛选
  activeTag.value = ''

  // 加载指定日期范围的消息
  loadMessagesByDateRange(range)
}

// 处理日期取消
const handleDateCancel = () => {
  // 如果已有日期范围，恢复之前的筛选
  if (!isCustomDateRange.value) {
    // 可以恢复到默认筛选
  }
}

// 根据日期范围加载消息
const loadMessagesByDateRange = async (range) => {
  loading.value = true

  try {
    const params = {
      page: 1,
      limit: limit.value,
      startDate: range.startDate,
      endDate: range.endDate
    }

    const res = await getMessagesApi(params)

    if (res.success) {
      messages.value = res.data || []
      page.value = 1
      hasMore.value = messages.value.length < (res.pagination?.total || 0)
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>
```

### 方案二：作为独立筛选入口

在搜索栏下方添加日期筛选按钮：

```vue
<template>
  <view class="search-bar">
    <view class="search-input-wrapper">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        v-model="searchKeyword"
        type="text"
        placeholder="搜索消息标题或内容"
        @confirm="handleSearch"
      />
    </view>

    <!-- 日期筛选按钮 -->
    <button
      class="date-filter-btn"
      :class="{ active: isCustomDateRange }"
      @click="openDateRangePicker"
    >
      <text class="btn-icon">📅</text>
    </button>
  </view>

  <!-- 日期范围选择器 -->
  <date-range-picker
    :visible="showDatePicker"
    :start-date="dateRange.startDate"
    :end-date="dateRange.endDate"
    @confirm="handleDateConfirm"
    @update:visible="showDatePicker = $event"
  />
</template>

<script setup>
// ... 同上
</script>

<style lang="scss" scoped>
.date-filter-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 35rpx;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

    .btn-icon {
      filter: brightness(0) invert(1);
    }
  }

  &:active {
    transform: scale(0.95);
  }

  &::after {
    border: none;
  }
}

.btn-icon {
  font-size: 32rpx;
}
</style>
```

## 后端 API 配合

如果需要后端支持日期范围筛选，需要在 API 请求中添加参数：

```javascript
// src/api/message.js
export const getMessagesApi = (params) => {
  return request({
    url: '/api/messages',
    method: 'GET',
    params: {
      ...params,
      // 添加日期范围参数
      startDate: params.startDate, // '2026-02-01'
      endDate: params.endDate      // '2026-02-06'
    }
  })
}
```

后端需要支持这些查询参数：

```javascript
// 后端示例（Express）
router.get('/api/messages', async (req, res) => {
  const { startDate, endDate, page, limit } = req.query

  let query = {}

  // 添加日期范围筛选
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate + 'T23:59:59')
    }
  }

  const messages = await Message.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    data: messages,
    pagination: {
      total: await Message.countDocuments(query),
      page,
      limit
    }
  })
})
```

## 样式自定义

组件使用了SCSS，可以通过修改CSS变量来自定义样式：

```scss
// 修改主题色
.date-range-picker {
  // 修改确定按钮颜色
  .btn-confirm {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
  }

  // 修改选中状态颜色
  .date-value.has-value {
    background: #your-background;
    border-color: #your-border;
  }
}
```

## 注意事项

1. **日期格式**：确保使用 `YYYY-MM-DD` 格式
2. **日期验证**：组件会自动验证结束日期 >= 开始日期
3. **范围限制**：日期范围不能超过1年
4. **平台兼容**：组件在H5和微信小程序上都经过测试
5. **安全区域**：组件自动适配底部安全区域

## 测试方法

1. 在页面中引入组件
2. 点击打开按钮，查看弹窗动画
3. 分别选择开始和结束日期
4. 测试验证逻辑（结束日期 < 开始日期）
5. 点击确定，检查事件返回值
6. 点击取消或遮罩，检查弹窗关闭

## 完整示例文件

查看 `src/components/date-range-picker-example.vue` 获取完整的使用示例。

## 常见问题

### Q: 如何设置默认日期范围？

A: 在组件上设置 `startDate` 和 `endDate` props：

```vue
<date-range-picker
  :visible="showPicker"
  start-date="2026-02-01"
  end-date="2026-02-06"
  @confirm="handleConfirm"
  @update:visible="showPicker = $event"
/>
```

### Q: 如何清除日期范围？

A: 将 `startDate` 和 `endDate` 设置为空字符串：

```javascript
const clearDateRange = () => {
  dateRange.value = {
    startDate: '',
    endDate: ''
  }
  // 重新加载数据
  loadMessages()
}
```

### Q: 如何禁用某些日期？

A: 可以通过修改 picker 的 `start` 和 `end` 属性来限制可选范围：

```vue
<picker
  mode="date"
  :value="tempStartDate"
  :start="minDate"      <!-- 最小可选日期 -->
  :end="maxDate"        <!-- 最大可选日期 -->
  @change="handleStartDateChange"
>
```

## 版本历史

- v1.0.0 (2026-02-06)
  - 初始版本
  - 支持日期范围选择
  - 支持日期验证
  - 支持H5和微信小程序
