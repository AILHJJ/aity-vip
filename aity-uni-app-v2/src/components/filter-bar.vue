<template>
	<view class="filter-bar-container">
		<!-- 收起状态：简洁的筛选状态条 -->
		<view v-if="!isExpanded" class="filter-summary-bar" @click="toggleExpand">
			<view class="summary-left">
				<text class="summary-icon">📢</text>
				<text class="summary-text">{{ getFilterSummary() }}</text>
				<view v-if="hasActiveFilters" class="active-filter-badge">
					<text class="badge-text">{{ getActiveFilterCount() }}</text>
				</view>
			</view>
			<view class="summary-right">
				<text class="expand-text">展开筛选</text>
				<text class="expand-icon">▼</text>
			</view>
		</view>

		<!-- 展开状态：完整的筛选面板 -->
		<view v-else class="filter-panel">
			<!-- 筛选面板头部 -->
			<view class="filter-panel-header" @click="toggleExpand">
				<text class="header-title">推送范围筛选（管理员）</text>
				<view class="header-right">
					<text class="collapse-text">收起</text>
					<text class="collapse-icon">▲</text>
				</view>
			</view>

			<!-- 推送范围筛选（横向滚动，直接选择） -->
			<view class="filter-section-inline">
				<view class="filter-section-title-inline">推送范围</view>
				<scroll-view class="filter-options-scroll" scroll-x show-scrollbar="false">
					<view class="filter-options">
						<view
							v-for="option in pushScopeOptions"
							:key="option.value"
							class="filter-option-chip"
							:class="{ active: filters.pushScope === option.value }"
							@click="selectPushScope(option.value)"
						>
							{{ option.label }}
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 说明文字 -->
			<view class="filter-description">
				<text class="description-text">💡 提示：这些标签表示消息的推送范围，与消息类型无关</text>
			</view>

			<!-- 操作按钮 -->
			<view v-if="hasActiveFilters" class="action-buttons">
				<view class="result-tip">
					<text class="result-text">找到 {{ filteredCount }} 条消息</text>
				</view>
				<view class="reset-btn-inline" @click.stop="resetFilters">
					<text class="reset-text">重置筛选</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MESSAGE_TAGS, MESSAGE_TAG_LABELS } from '../utils/constants'

const props = defineProps({
	totalCount: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['filter-change'])

// 筛选条件
const filters = ref({
	pushScope: 'all' // 推送范围: all, short_term, mid_term, all_users
})

// 展开/收起状态
const isExpanded = ref(false)

// 推送范围选项
const pushScopeOptions = computed(() => [
	{ label: '全部', value: 'all' },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM], value: MESSAGE_TAGS.SHORT_TERM },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM], value: MESSAGE_TAGS.MID_TERM },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.ALL_USERS], value: MESSAGE_TAGS.ALL_USERS }
])

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
	return filters.value.pushScope !== 'all'
})

// 筛选后的消息数量
const filteredCount = computed(() => {
	return props.totalCount
})

// 选择推送范围
const selectPushScope = (value) => {
	filters.value.pushScope = value
	emitFilterChange()
}

// 重置所有筛选条件
const resetFilters = () => {
	filters.value = {
		pushScope: 'all'
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
		uni.setStorageSync('push_scope_filters', JSON.stringify(filters.value))
	} catch (error) {
		console.error('保存筛选条件失败:', error)
	}
}

// 从 localStorage 加载筛选条件
const loadFilters = () => {
	try {
		const saved = uni.getStorageSync('push_scope_filters')
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
	// 加载保存的筛选条件
	loadFilters()

	// 发送初始筛选条件
	emit('filter-change', { ...filters.value })
})

// 切换展开/收起状态
const toggleExpand = () => {
	isExpanded.value = !isExpanded.value
	saveExpandState()
}

// 获取激活的筛选条件数量
const getActiveFilterCount = () => {
	let count = 0
	if (filters.value.pushScope !== 'all') count++
	return count
}

// 获取筛选摘要文本
const getFilterSummary = () => {
	const parts = []

	if (filters.value.pushScope !== 'all') {
		const option = pushScopeOptions.value.find(opt => opt.value === filters.value.pushScope)
		if (option) {
			parts.push(`推送范围: ${option.label}`)
		}
	}

	if (parts.length === 0) {
		return '点击展开推送范围筛选'
	}

	return parts.join(' · ')
}

// 保存展开状态
const saveExpandState = () => {
	try {
		uni.setStorageSync('push_scope_filter_expanded', isExpanded.value)
	} catch (error) {
		console.error('保存展开状态失败:', error)
	}
}

// 加载展开状态
const loadExpandState = () => {
	try {
		const saved = uni.getStorageSync('push_scope_filter_expanded')
		if (saved !== null && saved !== undefined) {
			isExpanded.value = saved
		}
	} catch (error) {
		console.error('加载展开状态失败:', error)
	}
}

// 在初始化时加载展开状态
onMounted(() => {
	loadExpandState()
})

// 暴露方法给父组件
defineExpose({
	resetFilters,
	toggleExpand
})
</script>

<style lang="scss" scoped>
.filter-bar-container {
	background: #ffffff;
	border-bottom: 1rpx solid #e0e0e0;
}

// 收起状态的简洁筛选条
.filter-summary-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	border-bottom: 1rpx solid rgba(102, 126, 234, 0.2);
	transition: all 0.3s;

	&:active {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
	}
}

.summary-left {
	display: flex;
	align-items: center;
	flex: 1;
	overflow: hidden;
}

.summary-icon {
	font-size: 28rpx;
	margin-right: 12rpx;
	flex-shrink: 0;
	color: #667eea;
}

.summary-text {
	flex: 1;
	font-size: 28rpx;
	color: #666666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.active-filter-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 8rpx;
	margin-left: 12rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 18rpx;
	flex-shrink: 0;
}

.badge-text {
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
}

.summary-right {
	display: flex;
	align-items: center;
	margin-left: 16rpx;
	flex-shrink: 0;
}

.expand-text {
	font-size: 26rpx;
	color: #667eea;
	margin-right: 8rpx;
}

.expand-icon {
	font-size: 20rpx;
	color: #667eea;
}

// 展开状态的筛选面板
.filter-panel {
	padding: 0 0 20rpx 0;
}

.filter-panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: all 0.3s;

	&:active {
		background: #f8f8f8;
	}
}

.header-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
}

.header-right {
	display: flex;
	align-items: center;
}

.collapse-text {
	font-size: 26rpx;
	color: #999999;
	margin-right: 8rpx;
}

.collapse-icon {
	font-size: 20rpx;
	color: #999999;
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

.reset-text {
	font-size: 26rpx;
	color: #667eea;
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

.filter-description {
	padding: 16rpx 20rpx 0;
}

.description-text {
	font-size: 24rpx;
	color: #999999;
	line-height: 1.5;
}
</style>
