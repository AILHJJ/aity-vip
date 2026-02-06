<template>
	<view class="filter-bar-container">
		<!-- 筛选面板（始终展开，直接选择） -->
		<view class="filter-panel">
			<!-- 策略筛选（横向滚动，直接选择） -->
			<view class="filter-section-inline">
				<view class="filter-section-title-inline">策略</view>
				<scroll-view class="filter-options-scroll" scroll-x show-scrollbar="false">
					<view class="filter-options">
						<view
							v-for="option in strategyOptions"
							:key="option.value"
							class="filter-option-chip"
							:class="{ active: filters.strategy === option.value }"
							@click="selectStrategy(option.value)"
						>
							{{ option.label }}
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 类型筛选（横向滚动，直接选择） -->
			<view class="filter-section-inline">
				<view class="filter-section-title-inline">类型</view>
				<scroll-view class="filter-options-scroll" scroll-x show-scrollbar="false">
					<view class="filter-options">
						<view
							v-for="option in typeOptions"
							:key="option.value"
							class="filter-option-chip"
							:class="{ active: filters.type === option.value }"
							@click="selectType(option.value)"
						>
							{{ option.label }}
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 时间筛选（横向滚动，直接选择） -->
			<view class="filter-section-inline">
				<view class="filter-section-title-inline">时间</view>
				<scroll-view class="filter-options-scroll" scroll-x show-scrollbar="false">
					<view class="filter-options">
						<view
							v-for="option in timeRangeOptions"
							:key="option.value"
							class="filter-option-chip"
							:class="{ active: filters.timeRange === option.value }"
							@click="selectTimeRange(option.value)"
						>
							{{ option.label }}
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 自定义时间范围（仅在选择了自定义时显示） -->
			<view v-if="filters.timeRange === 'custom'" class="custom-date-range">
				<view class="date-input-wrapper">
					<text class="date-label">开始日期</text>
					<picker
						mode="date"
						:value="filters.customStartDate"
						:end="filters.customEndDate"
						@change="handleStartDateChange"
					>
						<view class="date-picker">
							<text class="date-text">{{ filters.customStartDate || '选择日期' }}</text>
							<text class="picker-icon">📅</text>
						</view>
					</picker>
				</view>
				<view class="date-input-wrapper">
					<text class="date-label">结束日期</text>
					<picker
						mode="date"
						:value="filters.customEndDate"
						:start="filters.customStartDate"
						:end="today"
						@change="handleEndDateChange"
					>
						<view class="date-picker">
							<text class="date-text">{{ filters.customEndDate || '选择日期' }}</text>
							<text class="picker-icon">📅</text>
						</view>
					</picker>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view v-if="hasActiveFilters" class="action-buttons">
				<view class="result-tip">
					<text class="result-text">找到 {{ filteredCount }} 条消息</text>
				</view>
				<view class="reset-btn-inline" @click="resetFilters">
					<text class="reset-text">重置筛选</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MESSAGE_TAGS, MESSAGE_TAG_LABELS, MESSAGE_TYPE_LABELS } from '../utils/constants'

const props = defineProps({
	totalCount: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['filter-change'])

// 筛选条件
const filters = ref({
	strategy: 'all',
	type: 'all',
	timeRange: 'all',
	customStartDate: null,
	customEndDate: null
})

const today = ref('')

// 策略选项
const strategyOptions = computed(() => [
	{ label: '全部', value: 'all' },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM], value: MESSAGE_TAGS.SHORT_TERM },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM], value: MESSAGE_TAGS.MID_TERM }
])

// 类型选项
const typeOptions = computed(() => [
	{ label: '全部', value: 'all' },
	{ label: '盘前点评', value: 'pre_market_comment' },
	{ label: '早盘关注', value: 'morning_focus' },
	{ label: '午盘点评', value: 'afternoon_comment' },
	{ label: '尾盘关注', value: 'afternoon_focus' },
	{ label: '涨停分析', value: 'limit_up_analysis' },
	{ label: '龙虎榜分析', value: 'dragon_tiger_analysis' },
	{ label: '个股研究', value: 'stock_research' },
	{ label: '行业分析', value: 'industry_analysis' },
	{ label: '宏观经济', value: 'macro_economy' },
	{ label: '其他', value: 'other' }
])

// 时间范围选项
const timeRangeOptions = computed(() => [
	{ label: '全部', value: 'all' },
	{ label: '今天', value: 'today' },
	{ label: '最近3天', value: '3days' },
	{ label: '最近7天', value: '7days' },
	{ label: '最近30天', value: '30days' },
	{ label: '自定义', value: 'custom' }
])

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
	return filters.value.strategy !== 'all' ||
	       filters.value.type !== 'all' ||
	       filters.value.timeRange !== 'all'
})

// 筛选后的消息数量
const filteredCount = computed(() => {
	return props.totalCount
})

// 选择策略
const selectStrategy = (value) => {
	filters.value.strategy = value
	emitFilterChange()
}

// 选择类型
const selectType = (value) => {
	filters.value.type = value
	emitFilterChange()
}

// 选择时间范围
const selectTimeRange = (value) => {
	filters.value.timeRange = value
	if (value !== 'custom') {
		filters.value.customStartDate = null
		filters.value.customEndDate = null
	}
	emitFilterChange()
}

// 处理开始日期变化
const handleStartDateChange = (e) => {
	filters.value.customStartDate = e.detail.value
	emitFilterChange()
}

// 处理结束日期变化
const handleEndDateChange = (e) => {
	filters.value.customEndDate = e.detail.value
	emitFilterChange()
}

// 重置所有筛选条件
const resetFilters = () => {
	filters.value = {
		strategy: 'all',
		type: 'all',
		timeRange: 'all',
		customStartDate: null,
		customEndDate: null
	}
	emitFilterChange()
}

// 发送筛选变化事件
const emitFilterChange = () => {
	emit('filter-change', { ...filters.value })
	saveFilters()
}

// 保存筛选条件到 localStorage
const saveFilters = () => {
	try {
		uni.setStorageSync('message_filters', JSON.stringify(filters.value))
	} catch (error) {
		console.error('保存筛选条件失败:', error)
	}
}

// 从 localStorage 加载筛选条件
const loadFilters = () => {
	try {
		const saved = uni.getStorageSync('message_filters')
		if (saved) {
			const savedFilters = JSON.parse(saved)
			filters.value = { ...filters.value, ...savedFilters }
		}
	} catch (error) {
		console.error('加载筛选条件失败:', error)
	}
}

// 初始化
onMounted(() => {
	// 设置今天的日期
	const now = new Date()
	today.value = now.toISOString().split('T')[0]

	// 加载保存的筛选条件
	loadFilters()

	// 发送初始筛选条件
	emit('filter-change', { ...filters.value })
})

// 暴露方法给父组件
defineExpose({
	resetFilters
})
</script>

<style lang="scss" scoped>
.filter-bar-container {
	background: #ffffff;
	border-bottom: 1rpx solid #e0e0e0;
}

.filter-panel {
	padding: 20rpx 0;
}

.filter-section-inline {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 0 20rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.filter-section-title-inline {
	font-size: 26rpx;
	color: #666666;
	margin-right: 16rpx;
	white-space: nowrap;
	flex-shrink: 0;
}

.filter-options-scroll {
	flex: 1;
	white-space: nowrap;
}

.filter-options {
	display: inline-flex;
}

.filter-option-chip {
	display: inline-block;
	padding: 12rpx 24rpx;
	margin-right: 16rpx;
	font-size: 26rpx;
	color: #666666;
	background: #f5f5f5;
	border-radius: 30rpx;
	white-space: nowrap;
	transition: all 0.3s;

	&:active {
		transform: scale(0.95);
	}

	&.active {
		color: #ffffff;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}
}

.custom-date-range {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 20rpx;
	background: #fafafa;
	border-radius: 12rpx;
	margin-top: 10rpx;
	margin-left: 20rpx;
	margin-right: 20rpx;
}

.date-input-wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.date-label {
	font-size: 26rpx;
	color: #666666;
}

.date-picker {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background: #ffffff;
	border-radius: 12rpx;
	margin-left: 20rpx;
	transition: all 0.3s;

	&:active {
		background: #f5f5f5;
	}
}

.date-text {
	font-size: 28rpx;
	color: #333333;
}

.picker-icon {
	font-size: 32rpx;
}

.action-buttons {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	margin-top: 10rpx;
}

.result-tip {
	flex: 1;
}

.result-text {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
}

.reset-btn-inline {
	padding: 12rpx 24rpx;
	background: rgba(102, 126, 234, 0.1);
	border-radius: 30rpx;
	transition: all 0.3s;

	&:active {
		background: rgba(102, 126, 234, 0.2);
	}
}

.reset-text {
	font-size: 26rpx;
	color: #667eea;
}
</style>
