# 日期范围选择器 - 快速启动指南

## 30秒快速上手

### 1. 复制组件（已完成 ✅）

组件已创建在：
```
src/components/date-range-picker.vue
```

### 2. 在页面中使用

```vue
<template>
  <view>
    <!-- 打开按钮 -->
    <button @click="showPicker = true">📅 选择日期范围</button>

    <!-- 日期选择器 -->
    <date-range-picker
      :visible="showPicker"
      :start-date="startDate"
      :end-date="endDate"
      @confirm="handleConfirm"
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
  console.log('选择了：', range.startDate, '至', range.endDate)
}
</script>
```

### 3. 完成！运行测试

```bash
# H5平台
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

## 在消息列表中集成（3步）

### 第1步：添加状态

在 `src/pages/messages/messages.vue` 的 `<script setup>` 中添加：

```javascript
// 新增状态
const showDatePicker = ref(false)
const dateRange = ref({
  startDate: '',
  endDate: ''
})
```

### 第2步：添加筛选按钮

在筛选栏中添加自定义日期按钮：

```vue
<view class="filter-item" @click="showDatePicker = true">
  📅 自定义
</view>
```

### 第3步：添加组件和处理函数

```vue
<!-- 在模板末尾添加组件 -->
<date-range-picker
  :visible="showDatePicker"
  :start-date="dateRange.startDate"
  :end-date="dateRange.endDate"
  @confirm="handleDateConfirm"
  @update:visible="showDatePicker = $event"
/>

<script setup>
// 添加处理函数
const handleDateConfirm = (range) => {
  dateRange.value = range
  console.log('筛选日期范围：', range)

  // TODO: 调用API获取该日期范围的消息
  // await loadMessagesByDateRange(range)
}
</script>
```

### 完成！

现在用户可以：
1. 点击"📅 自定义"按钮
2. 选择开始和结束日期
3. 点击确定
4. 获取筛选后的消息列表

## 常用代码片段

### 1. 设置默认日期（最近7天）

```javascript
const setDefaultRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  dateRange.value = {
    startDate: formatDate(start),
    endDate: formatDate(end)
  }
}
```

### 2. 清除日期筛选

```javascript
const clearDateRange = () => {
  dateRange.value = {
    startDate: '',
    endDate: ''
  }
  // 重新加载所有消息
  loadMessages()
}
```

### 3. 检查是否使用了日期筛选

```javascript
const isDateFilterActive = computed(() => {
  return dateRange.value.startDate && dateRange.value.endDate
})
```

### 4. 格式化显示日期范围

```vue
<view v-if="isDateFilterActive" class="date-filter-display">
  📅 {{ dateRange.startDate }} ~ {{ dateRange.endDate }}
  <text @click="clearDateRange">×</text>
</view>
```

## API请求示例

### 前端发送请求

```javascript
// src/api/message.js
export const getMessagesByDateRange = (params) => {
  return request({
    url: '/api/messages',
    method: 'GET',
    params: {
      startDate: params.startDate, // '2026-02-01'
      endDate: params.endDate,     // '2026-02-06'
      page: params.page || 1,
      limit: params.limit || 20
    }
  })
}
```

### 在组件中调用

```javascript
const loadMessagesByDateRange = async (range) => {
  loading.value = true

  try {
    const res = await getMessagesByDateRange({
      startDate: range.startDate,
      endDate: range.endDate,
      page: 1,
      limit: 20
    })

    if (res.success) {
      messages.value = res.data
      // 显示成功提示
      uni.showToast({
        title: `已筛选 ${range.startDate} 至 ${range.endDate} 的消息`,
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}
```

## 后端实现示例

### Express + MongoDB

```javascript
// backend/routes/messages.js
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

  try {
    const messages = await Message.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await Message.countDocuments(query)

    res.json({
      success: true,
      data: messages,
      pagination: { total, page, limit }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '加载失败'
    })
  }
})
```

## UI美化建议

### 1. 添加日期显示标签

```vue
<view v-if="isDateFilterActive" class="active-filter-tag">
  <text class="tag-icon">📅</text>
  <text class="tag-text">{{ dateRange.startDate }} ~ {{ dateRange.endDate }}</text>
  <text class="tag-close" @click.stop="clearDateRange">×</text>
</view>

<style lang="scss" scoped>
.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
  border: 1rpx solid rgba(102, 126, 234, 0.25);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #667eea;
}

.tag-close {
  font-size: 32rpx;
  margin-left: 5rpx;
  padding: 0 5rpx;
}
</style>
```

### 2. 添加加载状态

```javascript
const isLoadingByDate = ref(false)

const handleDateConfirm = async (range) => {
  isLoadingByDate.value = true

  try {
    await loadMessagesByDateRange(range)
    dateRange.value = range
  } finally {
    isLoadingByDate.value = false
  }
}
```

```vue
<view class="filter-item" @click="showDatePicker = true">
  <text v-if="isLoadingByDate">加载中...</text>
  <text v-else>📅 自定义</text>
</view>
```

## 故障排查

### 问题1：弹窗不显示

**原因**：visible 没有绑定或值不对

**解决**：
```javascript
// 检查状态
console.log('showPicker:', showPicker.value) // 应该是 true

// 确保使用 v-model 或 :visible + @update:visible
<date-range-picker
  :visible="showPicker"
  @update:visible="showPicker = $event"
/>
```

### 问题2：选择日期后没有反应

**原因**：没有监听 confirm 事件

**解决**：
```javascript
// 添加 @confirm 处理
<date-range-picker
  @confirm="(range) => {
    console.log('选择的日期：', range)
    startDate.value = range.startDate
    endDate.value = range.endDate
  }"
/>
```

### 问题3：日期验证不通过

**原因**：日期格式不对或逻辑错误

**解决**：
- 确保日期格式是 YYYY-MM-DD
- 确保结束日期 >= 开始日期
- 确保日期范围不超过1年

## 下一步

1. ✅ 基础集成完成
2. 📖 阅读完整文档：`docs/date-range-picker-integration.md`
3. 🧪 运行测试：`docs/date-range-picker-test.md`
4. 🎨 自定义样式（可选）
5. 🚀 部署到生产环境

## 获取帮助

- 查看完整文档：`docs/date-range-picker-summary.md`
- 查看集成指南：`docs/date-range-picker-integration.md`
- 查看测试方案：`docs/date-range-picker-test.md`
- 查看示例代码：`src/components/date-range-picker-example.vue`

## 总结

**你现在拥有**：

✅ 完整的日期范围选择器组件
✅ 开箱即用的API
✅ 详细的集成指南
✅ 完整的测试方案
✅ 丰富的代码示例

**开始使用**：
1. 复制上面的代码到你的页面
2. 运行项目
3. 点击按钮测试

**就这么简单！** 🎉
