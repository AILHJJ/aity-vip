<template>
	<view class="example-container">
		<view class="example-section">
			<text class="example-title">日期范围选择器使用示例</text>

			<!-- 显示当前选择的日期范围 -->
			<view v-if="dateRange.startDate || dateRange.endDate" class="date-range-display">
				<view class="range-item">
					<text class="range-label">开始日期：</text>
					<text class="range-value">{{ dateRange.startDate || '未选择' }}</text>
				</view>
				<view class="range-item">
					<text class="range-label">结束日期：</text>
					<text class="range-value">{{ dateRange.endDate || '未选择' }}</text>
				</view>
			</view>

			<!-- 打开日期选择器按钮 -->
			<button class="open-picker-btn" @click="openDateRangePicker">
				<text class="btn-icon">📅</text>
				<text>选择日期范围</text>
			</button>

			<!-- 清除按钮 -->
			<button v-if="dateRange.startDate || dateRange.endDate" class="clear-btn" @click="clearDateRange">
				<text>清除选择</text>
			</button>
		</view>

		<!-- 日期范围选择器组件 -->
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
import { ref } from 'vue'
import DateRangePicker from '@/components/date-range-picker.vue'

// 是否显示日期选择器
const showDatePicker = ref(false)

// 选中的日期范围
const dateRange = ref({
	startDate: '',
	endDate: ''
})

// 打开日期范围选择器
const openDateRangePicker = () => {
	showDatePicker.value = true
}

// 处理日期确认
const handleDateConfirm = (range) => {
	console.log('选择的日期范围：', range)
	dateRange.value = {
		startDate: range.startDate,
		endDate: range.endDate
	}

	// 在这里可以进行实际的数据筛选
	// 例如：调用API获取指定日期范围的消息
	filterMessagesByDateRange(range)

	uni.showToast({
		title: `已选择 ${range.startDate} 至 ${range.endDate}`,
		icon: 'success',
		duration: 2000
	})
}

// 处理日期取消
const handleDateCancel = () => {
	console.log('取消选择日期')
}

// 清除日期范围
const clearDateRange = () => {
	dateRange.value = {
		startDate: '',
		endDate: ''
	}

	// 在这里可以重新加载所有数据
	reloadAllMessages()

	uni.showToast({
		title: '已清除日期筛选',
		icon: 'success',
		duration: 1500
	})
}

// 示例：根据日期范围筛选消息
const filterMessagesByDateRange = (range) => {
	// TODO: 实现实际的筛选逻辑
	// 例如：
	// const params = {
	//   startDate: range.startDate,
	//   endDate: range.endDate,
	//   page: 1,
	//   limit: 20
	// }
	// const res = await getMessagesApi(params)

	console.log('筛选消息：', range)
}

// 示例：重新加载所有消息
const reloadAllMessages = () => {
	// TODO: 实现实际的重新加载逻辑
	console.log('重新加载所有消息')
}
</script>

<style lang="scss" scoped>
.example-container {
	min-height: 100vh;
	padding: 40rpx;
	background: #f5f5f5;
}

.example-section {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
}

.example-title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 40rpx;
	text-align: center;
}

.date-range-display {
	background: #f5f5f5;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.range-item {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.range-label {
	font-size: 28rpx;
	color: #666666;
	margin-right: 10rpx;
}

.range-value {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.open-picker-btn,
.clear-btn {
	width: 100%;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	font-size: 30rpx;
	border: none;
	border-radius: 12rpx;
	font-weight: 500;
	transition: all 0.3s;

	&::after {
		border: none;
	}
}

.open-picker-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	margin-bottom: 20rpx;

	&:active {
		opacity: 0.9;
		transform: scale(0.98);
	}
}

.btn-icon {
	font-size: 32rpx;
}

.clear-btn {
	background: #f5f5f5;
	color: #666666;

	&:active {
		background: #e0e0e0;
	}
}
</style>
