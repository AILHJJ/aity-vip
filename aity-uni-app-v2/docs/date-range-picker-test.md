# 日期范围选择器 - 测试指南

## 创建测试页面

### 1. 创建测试页面文件

在 `src/pages/` 目录下创建测试页面：

```
src/pages/test-date-picker/test-date-picker.vue
```

### 2. 完整测试代码

```vue
<template>
	<view class="test-container">
		<view class="test-section">
			<text class="test-title">日期范围选择器测试</text>

			<!-- 测试1: 显示当前选择的日期 -->
			<view class="test-block">
				<text class="block-title">当前选择的日期范围</text>
				<view v-if="dateRange.startDate || dateRange.endDate" class="date-display">
					<view class="date-row">
						<text class="date-label">开始：</text>
						<text class="date-value">{{ dateRange.startDate || '未选择' }}</text>
					</view>
					<view class="date-row">
						<text class="date-label">结束：</text>
						<text class="date-value">{{ dateRange.endDate || '未选择' }}</text>
					</view>
				</view>
				<text v-else class="empty-hint">暂未选择日期范围</text>
			</view>

			<!-- 测试2: 打开按钮 -->
			<view class="test-block">
				<text class="block-title">操作按钮</text>
				<button class="test-btn open-btn" @click="openPicker">
					<text class="btn-icon">📅</text>
					<text>打开日期选择器</text>
				</button>
				<button
					v-if="dateRange.startDate || dateRange.endDate"
					class="test-btn clear-btn"
					@click="clearDateRange"
				>
					<text>清除选择</text>
				</button>
			</view>

			<!-- 测试3: 使用方法控制 -->
			<view class="test-block">
				<text class="block-title">通过 ref 方法控制</text>
				<button class="test-btn open-btn" @click="openByRef">
					<text class="btn-icon">🔧</text>
					<text>使用 ref.open() 打开</text>
				</button>
			</view>

			<!-- 测试4: 带默认值 -->
			<view class="test-block">
				<text class="block-title">设置默认日期范围</text>
				<button class="test-btn open-btn" @click="setDefaultDate">
					<text class="btn-icon">📆</text>
					<text>设置最近7天为默认</text>
				</button>
			</view>

			<!-- 测试5: 事件日志 -->
			<view class="test-block">
				<text class="block-title">事件日志</text>
				<view class="log-container">
					<scroll-view class="log-scroll" scroll-y>
						<view
							v-for="(log, index) in eventLogs"
							:key="index"
							class="log-item"
						>
							<text class="log-time">{{ log.time }}</text>
							<text class="log-event">{{ log.event }}</text>
							<text class="log-data">{{ log.data }}</text>
						</view>
						<view v-if="eventLogs.length === 0" class="log-empty">
							<text>暂无事件日志</text>
						</view>
					</scroll-view>
					<button class="test-btn clear-log-btn" @click="clearLogs">
						<text>清空日志</text>
					</button>
				</view>
			</view>
		</view>

		<!-- 日期范围选择器 -->
		<date-range-picker
			ref="datePickerRef"
			:visible="showPicker"
			:start-date="dateRange.startDate"
			:end-date="dateRange.endDate"
			@confirm="handleConfirm"
			@cancel="handleCancel"
			@update:visible="showPicker = $event"
		/>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import DateRangePicker from '@/components/date-range-picker.vue'

// 状态管理
const showPicker = ref(false)
const datePickerRef = ref(null)
const dateRange = ref({
	startDate: '',
	endDate: ''
})

// 事件日志
const eventLogs = ref([])

// 添加日志
const addLog = (event, data = '') => {
	const now = new Date()
	const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

	eventLogs.value.unshift({
		time,
		event,
		data
	})

	// 最多保留20条日志
	if (eventLogs.value.length > 20) {
		eventLogs.value = eventLogs.value.slice(0, 20)
	}
}

// 打开选择器
const openPicker = () => {
	showPicker.value = true
	addLog('open', 'visible = true')
}

// 通过 ref 打开
const openByRef = () => {
	datePickerRef.value?.open()
	addLog('ref.open()', '通过 ref 调用 open 方法')
}

// 设置默认日期（最近7天）
const setDefaultDate = () => {
	const end = new Date()
	const start = new Date()
	start.setDate(end.getDate() - 6)

	const formatDate = (date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	dateRange.value = {
		startDate: formatDate(start),
		endDate: formatDate(end)
	}

	addLog('setDefaultDate', `设置 ${dateRange.value.startDate} 至 ${dateRange.value.endDate}`)

	uni.showToast({
		title: '已设置默认日期',
		icon: 'success'
	})
}

// 清除日期范围
const clearDateRange = () => {
	dateRange.value = {
		startDate: '',
		endDate: ''
	}
	addLog('clear', '清除日期选择')

	uni.showToast({
		title: '已清除',
		icon: 'success'
	})
}

// 处理确认
const handleConfirm = (range) => {
	dateRange.value = {
		startDate: range.startDate,
		endDate: range.endDate
	}
	addLog('confirm', `${range.startDate} ~ ${range.endDate}`)

	uni.showToast({
		title: '已选择日期范围',
		icon: 'success'
	})
}

// 处理取消
const handleCancel = () => {
	addLog('cancel', '用户取消操作')

	uni.showToast({
		title: '已取消',
		icon: 'none'
	})
}

// 清空日志
const clearLogs = () => {
	eventLogs.value = []
	uni.showToast({
		title: '日志已清空',
		icon: 'success'
	})
}
</script>

<style lang="scss" scoped>
.test-container {
	min-height: 100vh;
	padding: 40rpx;
	background: #f5f5f5;
}

.test-section {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
}

.test-title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 40rpx;
	text-align: center;
}

.test-block {
	margin-bottom: 40rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.block-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #666666;
	margin-bottom: 20rpx;
	padding-left: 10rpx;
	border-left: 4rpx solid #667eea;
}

.date-display {
	background: #f5f5f5;
	border-radius: 12rpx;
	padding: 25rpx;
}

.date-row {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.date-label {
	font-size: 26rpx;
	color: #999999;
	margin-right: 10rpx;
}

.date-value {
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
}

.empty-hint {
	font-size: 26rpx;
	color: #999999;
	text-align: center;
	padding: 25rpx 0;
}

.test-btn {
	width: 100%;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	font-size: 28rpx;
	border: none;
	border-radius: 12rpx;
	font-weight: 500;
	transition: all 0.3s;
	margin-bottom: 20rpx;

	&:last-child {
		margin-bottom: 0;
	}

	&::after {
		border: none;
	}

	&:active {
		transform: scale(0.98);
	}
}

.open-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

	&:active {
		opacity: 0.9;
	}
}

.clear-btn {
	background: #f5f5f5;
	color: #666666;

	&:active {
		background: #e0e0e0;
	}
}

.btn-icon {
	font-size: 30rpx;
}

.log-container {
	background: #f5f5f5;
	border-radius: 12rpx;
	overflow: hidden;
}

.log-scroll {
	height: 400rpx;
}

.log-item {
	padding: 15rpx 20rpx;
	border-bottom: 1rpx solid #e0e0e0;
	background: #ffffff;

	&:last-child {
		border-bottom: none;
	}
}

.log-time {
	font-size: 22rpx;
	color: #999999;
	display: block;
	margin-bottom: 5rpx;
}

.log-event {
	font-size: 24rpx;
	color: #667eea;
	font-weight: 500;
	display: block;
	margin-bottom: 5rpx;
}

.log-data {
	font-size: 24rpx;
	color: #666666;
	display: block;
	word-break: break-all;
}

.log-empty {
	padding: 80rpx 0;
	text-align: center;
	font-size: 26rpx;
	color: #999999;
}

.clear-log-btn {
	width: 100%;
	height: 60rpx;
	background: #ffffff;
	color: #666666;
	font-size: 26rpx;
	border: none;
	border-radius: 0;

	&:active {
		background: #f0f0f0;
	}

	&::after {
		border: none;
	}
}
</style>
```

### 3. 配置路由

在 `src/pages.json` 中添加测试页面路由：

```json
{
  "pages": [
    // ... 其他页面
    {
      "path": "pages/test-date-picker/test-date-picker",
      "style": {
        "navigationBarTitleText": "日期选择器测试"
      }
    }
  ]
}
```

## 测试步骤

### 1. 基础功能测试

1. **打开选择器**
   - 点击"打开日期选择器"按钮
   - 验证弹窗从底部滑入
   - 验证遮罩层显示

2. **选择日期**
   - 点击"开始日期"选择器
   - 选择一个日期
   - 验证日期显示在输入框中
   - 验证输入框样式变为选中状态

3. **日期验证**
   - 选择结束日期早于开始日期
   - 验证显示错误提示："结束日期不能早于开始日期"
   - 修改结束日期为有效日期
   - 验证错误提示消失

4. **确认选择**
   - 选择有效的日期范围
   - 点击"确定"按钮
   - 验证弹窗关闭
   - 验证日期范围显示在页面上
   - 验证事件日志记录

5. **取消操作**
   - 打开选择器
   - 点击"取消"按钮
   - 验证弹窗关闭
   - 验证日期范围未改变
   - 验证事件日志记录

6. **遮罩点击**
   - 打开选择器
   - 点击遮罩层
   - 验证弹窗关闭
   - 验证触发取消事件

### 2. 高级功能测试

1. **方法调用**
   - 点击"使用 ref.open() 打开"按钮
   - 验证选择器打开
   - 验证日志记录

2. **默认值设置**
   - 点击"设置最近7天为默认"按钮
   - 再次打开选择器
   - 验证显示默认日期范围

3. **清除选择**
   - 选择日期范围
   - 点击"清除选择"按钮
   - 验证日期范围清空

### 3. 边界情况测试

1. **未完成选择**
   - 只选择开始日期
   - 点击"确定"
   - 验证提示："请选择完整的日期范围"

2. **日期范围超限**
   - 选择超过1年的日期范围
   - 验证提示："日期范围不能超过一年"

3. **最大日期限制**
   - 尝试选择未来的日期
   - 验证不能选择超过今天的日期

### 4. UI测试

1. **动画效果**
   - 验证弹窗滑入动画流畅
   - 验证遮罩淡入动画
   - 验证按钮点击反馈

2. **样式检查**
   - 验证选中状态颜色
   - 验证错误提示样式
   - 验证按钮渐变效果
   - 验证圆角和阴影

3. **响应式**
   - 验证在不同屏幕尺寸下显示正常
   - 验证安全区域适配

### 5. 事件测试

查看"事件日志"部分，验证：

1. ✅ open 事件触发
2. ✅ confirm 事件触发并返回正确数据
3. ✅ cancel 事件触发
4. ✅ ref.open() 方法调用
5. ✅ setDefaultDate 操作
6. ✅ clear 操作

### 6. 平台测试

1. **H5测试**
   ```bash
   npm run dev:h5
   ```
   在浏览器中测试所有功能

2. **微信小程序测试**
   ```bash
   npm run dev:mp-weixin
   ```
   在微信开发者工具中测试所有功能

## 测试结果记录

### 测试通过标准

- [ ] 所有基础功能测试通过
- [ ] 所有高级功能测试通过
- [ ] 所有边界情况正确处理
- [ ] UI动画流畅
- [ ] 事件正确触发
- [ ] H5平台测试通过
- [ ] 微信小程序平台测试通过

### 已知问题

记录测试过程中发现的问题：

1.
2.
3.

### 测试结论

- [ ] 测试通过，可以投入使用
- [ ] 需要修复问题：_______

## 快速访问测试页面

开发环境运行后，访问：

- **H5**: http://localhost:5173/pages/test-date-picker/test-date-picker
- **小程序**: 在微信开发者工具中导航到测试页面
