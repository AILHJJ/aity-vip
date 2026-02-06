<template>
	<view class="message-filter-bar">
		<!-- 基础筛选卡片 -->
		<view class="filter-card">
			<!-- 筛选头部：快捷筛选 + 展开按钮 -->
			<view class="filter-header">
				<text class="header-icon">🔍</text>
				<text class="header-title">消息筛选</text>

				<!-- 当前筛选状态 -->
				<view class="filter-status">
					<text v-if="activeFilterCount > 0" class="status-badge">{{ activeFilterCount }}</text>
					<text v-else class="status-text">全部消息</text>
				</view>

				<!-- 展开/收起按钮 -->
				<view class="toggle-btn" @click="toggleExpand">
					<text class="toggle-text">{{ isExpanded ? '收起' : '展开' }}</text>
					<text class="toggle-icon">{{ isExpanded ? '▲' : '▼' }}</text>
				</view>
			</view>

			<!-- 快捷筛选组合（始终显示） -->
			<view class="quick-filters">
				<scroll-view class="quick-filters-scroll" scroll-x show-scrollbar="false">
					<view class="quick-filter-items">
						<view
							v-for="filter in quickFilters"
							:key="filter.id"
							class="quick-filter-chip"
							:class="{ active: isQuickFilterActive(filter) }"
							@click="applyQuickFilter(filter)"
						>
							<text class="quick-filter-icon">{{ filter.icon }}</text>
							<text class="quick-filter-label">{{ filter.label }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 完整筛选面板（展开时显示） -->
			<view v-if="isExpanded" class="filter-panel">
				<!-- 时间筛选 -->
				<view class="filter-row">
					<view class="filter-label">
						<text class="label-icon">📅</text>
						<text class="label-text">时间</text>
					</view>
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

				<!-- 自定义时间选择器 -->
				<view v-if="filters.timeRange === 'custom'" class="custom-date-picker">
					<view class="date-row">
						<text class="date-label">开始</text>
						<picker
							mode="date"
							:value="filters.customStartDate"
							:end="filters.customEndDate"
							@change="handleStartDateChange"
						>
							<view class="date-picker-btn">
								<text class="date-text">{{ filters.customStartDate || '选择日期' }}</text>
								<text class="date-icon">📅</text>
							</view>
						</picker>
					</view>
					<view class="date-row">
						<text class="date-label">结束</text>
						<picker
							mode="date"
							:value="filters.customEndDate"
							:start="filters.customStartDate"
							:end="today"
							@change="handleEndDateChange"
						>
							<view class="date-picker-btn">
								<text class="date-text">{{ filters.customEndDate || '选择日期' }}</text>
								<text class="date-icon">📅</text>
							</view>
						</picker>
					</view>
				</view>

				<!-- 消息类型筛选 -->
				<view class="filter-row">
					<view class="filter-label">
						<text class="label-icon">📝</text>
						<text class="label-text">类型</text>
					</view>
					<scroll-view class="filter-options-scroll" scroll-x show-scrollbar="false">
						<view class="filter-options">
							<view
								v-for="type in messageTypeOptions"
								:key="type.value"
								class="filter-option-chip"
								:class="{ active: filters.messageType === type.value }"
								@click="selectMessageType(type.value)"
							>
								{{ type.label }}
							</view>
						</view>
					</scroll-view>
				</view>

				<!-- 筛选历史（如果有） -->
				<view v-if="filterHistory.length > 0" class="filter-history-section">
					<view class="history-header">
						<text class="history-title">最近使用</text>
						<text class="history-clear" @click="clearHistory">清空</text>
					</view>
					<scroll-view class="history-scroll" scroll-x show-scrollbar="false">
						<view class="history-items">
							<view
								v-for="(historyItem, index) in filterHistory"
								:key="index"
								class="history-chip"
								@click="applyHistory(historyItem)"
							>
								<text class="history-label">{{ historyItem.label }}</text>
								<text class="history-remove" @click.stop="removeHistory(index)">×</text>
							</view>
						</view>
					</scroll-view>
				</view>

				<!-- 操作按钮 -->
				<view v-if="hasActiveFilters" class="action-buttons">
					<view class="result-info">
						<text class="result-text">找到 {{ filteredCount }} 条消息</text>
					</view>
					<view class="reset-btn" @click="resetFilters">
						<text class="reset-icon">↺</text>
						<text class="reset-text">重置筛选</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MESSAGE_TYPES, MESSAGE_TYPE_LABELS } from '../utils/constants'

const props = defineProps({
	totalCount: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['filter-change'])

// 展开/收起状态
const isExpanded = ref(false)

// 筛选条件
const filters = ref({
	timeRange: 'all',
	customStartDate: null,
	customEndDate: null,
	messageType: 'all'
})

// 今天的日期
const today = ref('')

// 筛选历史
const filterHistory = ref([])

// 时间范围选项
const timeRangeOptions = computed(() => [
	{ label: '全部', value: 'all' },
	{ label: '今天', value: 'today' },
	{ label: '近一周', value: 'week' },
	{ label: '近一月', value: 'month' },
	{ label: '自定义', value: 'custom' }
])

// 消息类型选项（与constants.js保持一致）
const messageTypeOptions = computed(() => [
	{ label: '全部', value: 'all' },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.PRE_MARKET_COMMENT], value: MESSAGE_TYPES.PRE_MARKET_COMMENT },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.MORNING_COMMENT], value: MESSAGE_TYPES.MORNING_COMMENT },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.MORNING_FOCUS], value: MESSAGE_TYPES.MORNING_FOCUS },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.AFTERNOON_COMMENT], value: MESSAGE_TYPES.AFTERNOON_COMMENT },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.AFTERNOON_FOCUS], value: MESSAGE_TYPES.AFTERNOON_FOCUS },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.CLOSE_COMMENT], value: MESSAGE_TYPES.CLOSE_COMMENT },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.RISK_WARNING], value: MESSAGE_TYPES.RISK_WARNING },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.SYSTEM], value: MESSAGE_TYPES.SYSTEM },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.IMPORTANT], value: MESSAGE_TYPES.IMPORTANT },
	{ label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES.DAILY], value: MESSAGE_TYPES.DAILY }
])

// 快捷筛选组合
const quickFilters = computed(() => [
	{
		id: 'all',
		label: '全部消息',
		icon: '📋',
		timeRange: 'all',
		messageType: 'all'
	},
	{
		id: 'today_morning',
		label: '今天早盘',
		icon: '🌅',
		timeRange: 'today',
		messageType: 'morning_focus'
	},
	{
		id: 'today_all',
		label: '今天全部',
		icon: '📅',
		timeRange: 'today',
		messageType: 'all'
	},
	{
		id: 'week_focus',
		label: '本周关注',
		icon: '⭐',
		timeRange: 'week',
		messageType: 'morning_focus'
	},
	{
		id: 'week_stock',
		label: '本周个股',
		icon: '📈',
		timeRange: 'week',
		messageType: 'stock_research'
	}
])

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
	return filters.value.timeRange !== 'all' || filters.value.messageType !== 'all'
})

// 激活的筛选条件数量
const activeFilterCount = computed(() => {
	let count = 0
	if (filters.value.timeRange !== 'all') count++
	if (filters.value.messageType !== 'all') count++
	return count
})

// 筛选后的消息数量
const filteredCount = computed(() => {
	return props.totalCount
})

// 判断快捷筛选是否激活
const isQuickFilterActive = (quickFilter) => {
	return filters.value.timeRange === quickFilter.timeRange &&
		filters.value.messageType === quickFilter.messageType
}

// 应用快捷筛选
const applyQuickFilter = (quickFilter) => {
	filters.value.timeRange = quickFilter.timeRange
	filters.value.messageType = quickFilter.messageType

	// 重置自定义日期
	if (quickFilter.timeRange !== 'custom') {
		filters.value.customStartDate = null
		filters.value.customEndDate = null
	}

	emitFilterChange()
	addToHistory(quickFilter)
}

// 选择时间范围
const selectTimeRange = (value) => {
	filters.value.timeRange = value

	// 重置自定义日期
	if (value !== 'custom') {
		filters.value.customStartDate = null
		filters.value.customEndDate = null
	}

	emitFilterChange()
}

// 选择消息类型
const selectMessageType = (value) => {
	filters.value.messageType = value
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
		timeRange: 'all',
		customStartDate: null,
		customEndDate: null,
		messageType: 'all'
	}
	emitFilterChange()
}

// 发送筛选变化事件
const emitFilterChange = () => {
	emit('filter-change', { ...filters.value })
	saveFilters()
}

// 保存筛选条件到本地存储
const saveFilters = () => {
	try {
		uni.setStorageSync('message_filters', JSON.stringify(filters.value))
	} catch (error) {
		console.error('保存筛选条件失败:', error)
	}
}

// 从本地存储加载筛选条件
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

// 添加到筛选历史
const addToHistory = (quickFilter) => {
	// 检查是否已存在
	const exists = filterHistory.value.some(item => item.id === quickFilter.id)
	if (exists) return

	// 限制历史记录数量为5条
	if (filterHistory.value.length >= 5) {
		filterHistory.value.pop()
	}

	// 添加到开头
	filterHistory.value.unshift({
		id: quickFilter.id,
		label: quickFilter.label,
		timeRange: quickFilter.timeRange,
		messageType: quickFilter.messageType
	})

	saveHistory()
}

// 应用历史记录
const applyHistory = (historyItem) => {
	filters.value.timeRange = historyItem.timeRange
	filters.value.messageType = historyItem.messageType
	emitFilterChange()
}

// 删除历史记录
const removeHistory = (index) => {
	filterHistory.value.splice(index, 1)
	saveHistory()
}

// 清空历史记录
const clearHistory = () => {
	uni.showModal({
		title: '清空筛选历史',
		content: '确定要清空所有筛选历史吗？',
		success: (res) => {
			if (res.confirm) {
				filterHistory.value = []
				saveHistory()
			}
		}
	})
}

// 保存历史记录
const saveHistory = () => {
	try {
		uni.setStorageSync('filter_history', JSON.stringify(filterHistory.value))
	} catch (error) {
		console.error('保存筛选历史失败:', error)
	}
}

// 加载历史记录
const loadHistory = () => {
	try {
		const saved = uni.getStorageSync('filter_history')
		if (saved) {
			filterHistory.value = JSON.parse(saved)
		}
	} catch (error) {
		console.error('加载筛选历史失败:', error)
	}
}

// 切换展开/收起状态
const toggleExpand = () => {
	isExpanded.value = !isExpanded.value
	saveExpandState()
}

// 保存展开状态
const saveExpandState = () => {
	try {
		uni.setStorageSync('filter_bar_expanded', isExpanded.value)
	} catch (error) {
		console.error('保存展开状态失败:', error)
	}
}

// 加载展开状态
const loadExpandState = () => {
	try {
		const saved = uni.getStorageSync('filter_bar_expanded')
		if (saved !== null && saved !== undefined) {
			isExpanded.value = saved
		}
	} catch (error) {
		console.error('加载展开状态失败:', error)
	}
}

// 初始化
onMounted(() => {
	// 设置今天的日期
	const now = new Date()
	today.value = now.toISOString().split('T')[0]

	// 加载保存的状态
	loadFilters()
	loadHistory()
	loadExpandState()

	// 发送初始筛选条件
	emit('filter-change', { ...filters.value })
})

// 暴露方法给父组件
defineExpose({
	resetFilters,
	toggleExpand
})
</script>

<style lang="scss" scoped>
.message-filter-bar {
	background: #ffffff;
	border-bottom: 1rpx solid #e0e0e0;
}

.filter-card {
	background: #ffffff;
}

// 筛选头部
.filter-header {
	display: flex;
	align-items: center;
	padding: 20rpx 24rpx;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	border-bottom: 1rpx solid rgba(102, 126, 234, 0.1);
}

.header-icon {
	font-size: 28rpx;
	margin-right: 8rpx;
}

.header-title {
	flex: 1;
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
}

.filter-status {
	display: flex;
	align-items: center;
	margin-right: 16rpx;
}

.status-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 8rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 18rpx;
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
}

.status-text {
	font-size: 26rpx;
	color: #999999;
}

.toggle-btn {
	display: flex;
	align-items: center;
	padding: 8rpx 16rpx;
	background: rgba(102, 126, 234, 0.1);
	border-radius: 20rpx;
	transition: all 0.3s;

	&:active {
		background: rgba(102, 126, 234, 0.2);
	}
}

.toggle-text {
	font-size: 24rpx;
	color: #667eea;
	margin-right: 6rpx;
}

.toggle-icon {
	font-size: 20rpx;
	color: #667eea;
}

// 快捷筛选区域
.quick-filters {
	padding: 16rpx 0;
	background: #ffffff;
	border-bottom: 1rpx solid #f0f0f0;
}

.quick-filters-scroll {
	white-space: nowrap;
}

.quick-filter-items {
	display: inline-flex;
	padding: 0 24rpx;
}

.quick-filter-chip {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 14rpx 24rpx;
	margin-right: 16rpx;
	background: #f8f9fa;
	border-radius: 30rpx;
	border: 2rpx solid #e9ecef;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;

	&:active {
		transform: scale(0.95);
	}

	&.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

		.quick-filter-icon,
		.quick-filter-label {
			color: #ffffff;
		}
	}
}

.quick-filter-icon {
	font-size: 24rpx;
	color: #667eea;
	transition: color 0.3s;
}

.quick-filter-label {
	font-size: 26rpx;
	color: #495057;
	font-weight: 500;
	transition: color 0.3s;
}

// 完整筛选面板
.filter-panel {
	padding: 20rpx 0;
}

.filter-row {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 0 24rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.filter-label {
	display: flex;
	align-items: center;
	gap: 6rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.label-icon {
	font-size: 24rpx;
}

.label-text {
	font-size: 26rpx;
	color: #666666;
	font-weight: 500;
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
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 2rpx solid transparent;

	&:active {
		transform: scale(0.95);
	}

	&.active {
		color: #ffffff;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: transparent;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
		font-weight: 500;
	}
}

// 自定义日期选择器
.custom-date-picker {
	margin: 16rpx 24rpx;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
	border: 1rpx solid #e9ecef;
}

.date-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.date-label {
	font-size: 26rpx;
	color: #666666;
	width: 80rpx;
	flex-shrink: 0;
	font-weight: 500;
}

.date-picker-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 20rpx;
	background: #ffffff;
	border-radius: 12rpx;
	border: 1rpx solid #dee2e6;
	transition: all 0.3s;

	&:active {
		background: #f8f9fa;
		border-color: #667eea;
	}
}

.date-text {
	font-size: 26rpx;
	color: #333333;
}

.date-icon {
	font-size: 28rpx;
}

// 筛选历史
.filter-history-section {
	margin-top: 20rpx;
	padding: 20rpx 24rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
}

.history-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.history-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #495057;
}

.history-clear {
	font-size: 24rpx;
	color: #667eea;
	padding: 6rpx 12rpx;
}

.history-scroll {
	white-space: nowrap;
}

.history-items {
	display: inline-flex;
}

.history-chip {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 20rpx;
	margin-right: 12rpx;
	background: #ffffff;
	border-radius: 24rpx;
	border: 1rpx solid #dee2e6;
	transition: all 0.3s;

	&:active {
		background: #e9ecef;
	}
}

.history-label {
	font-size: 24rpx;
	color: #495057;
}

.history-remove {
	font-size: 32rpx;
	color: #adb5bd;
	line-height: 1;
	padding: 0 4rpx;

	&:active {
		color: #868e96;
	}
}

// 操作按钮
.action-buttons {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 20rpx;
	padding: 20rpx 24rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
}

.result-info {
	flex: 1;
}

.result-text {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
}

.reset-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 12rpx 24rpx;
	background: rgba(220, 53, 69, 0.1);
	border-radius: 30rpx;
	transition: all 0.3s;

	&:active {
		background: rgba(220, 53, 69, 0.2);
	}
}

.reset-icon {
	font-size: 28rpx;
	color: #dc3545;
}

.reset-text {
	font-size: 26rpx;
	color: #dc3545;
	font-weight: 500;
}
</style>
