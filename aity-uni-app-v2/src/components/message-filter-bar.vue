<template>
	<view class="message-filter-bar">
		<view class="filter-summary-row">
			<view class="quick-status-tabs">
				<view
					class="quick-status-tab"
					:class="{ active: !unreadActive }"
					@click="selectUnreadFilter(false)"
				>
					<text>全部</text>
				</view>
				<view
					class="quick-status-tab unread-quick-tab"
					:class="{ active: unreadActive }"
					@click="selectUnreadFilter(true)"
				>
					<text>未读{{ unreadCount > 0 ? ` ${unreadCount}` : '' }}</text>
				</view>
			</view>
			<view class="filter-summary-trigger" @click="toggleExpanded">
				<text class="filter-summary-text">{{ filterSummary }}</text>
				<text v-if="activeFilterCount > 0" class="filter-count">{{ activeFilterCount }}</text>
				<text class="filter-chevron">{{ expanded ? '⌃' : '⌄' }}</text>
			</view>
		</view>

		<view v-if="expanded" class="filter-card">
			<view class="filter-card-header">
				<text class="filter-card-title">筛选条件</text>
				<view class="filter-card-actions">
					<text class="filter-reset" @click="resetFilters">重置</text>
					<text class="filter-done" @click="toggleExpanded">完成</text>
				</view>
			</view>
			<!-- 第一行：消息类型筛选（同行显示标签+tab） -->
			<view class="filter-panel">
				<view class="filter-row">
					<text class="group-label">消息类型</text>
					<scroll-view class="filter-scroll" scroll-x show-scrollbar="false">
						<view class="filter-tabs">
							<view
								v-for="filter in messageTypeFilters"
								:key="filter.value"
								class="filter-tab"
								:class="{ active: filters.messageType === filter.value }"
								@click="selectMessageTypeFilter(filter.value)"
							>
								<text class="tab-text">{{ filter.label }}</text>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 第二行：推送范围筛选 -->
			<view class="filter-panel push-scope-panel">
				<view class="filter-row">
					<text class="group-label">推送范围</text>
					<scroll-view class="filter-scroll" scroll-x show-scrollbar="false">
						<view class="filter-tabs push-tabs">
							<view
								v-for="filter in pushScopeFilters"
								:key="filter.value"
								class="filter-tab push-tab"
								:class="{ active: filters.pushScope === filter.value }"
								@click="selectPushScopeFilter(filter.value)"
							>
								<text class="tab-text">{{ filter.label }}</text>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 第三行：阅读状态筛选 -->
			<view class="filter-panel status-panel">
				<view class="filter-row">
					<text class="group-label">阅读状态</text>
					<view class="filter-tabs status-tabs">
						<view
							class="filter-tab status-tab"
							:class="{ active: !unreadActive }"
							@click="selectUnreadFilter(false)"
						>
							<text class="tab-text">全部</text>
						</view>
						<view
							class="filter-tab status-tab unread-status-tab"
							:class="{ active: unreadActive }"
							@click="selectUnreadFilter(true)"
						>
							<text class="tab-text">未读{{ unreadCount > 0 ? ' ' + unreadCount : '' }}</text>
						</view>
						<text class="status-help" @click="showUnreadHelp">?</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MESSAGE_TYPES, MESSAGE_TAGS } from '../utils/constants'

const props = defineProps({
	totalCount: {
		type: Number,
		default: 0
	},
	unreadCount: {
		type: Number,
		default: 0
	},
	unreadActive: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['filter-change', 'unread-change'])

const expanded = ref(false)

// 筛选条件：消息类型 + 推送用户
const filters = ref({
	messageType: 'all', // 'all' = 全部, 'morning_focus' = 盘中, 'position_handle' = 持仓, 'risk_warning' = 风险, 'morning_comment' = 点评, 'system' = 系统
	pushScope: '' // '' = 全部, 'short_term' = 短线VIP, 'mid_term' = 中线VIP
})

// 消息类型筛选选项：全部、盘中、持仓、风险、点评、系统
const messageTypeFilters = [
	{ label: '全部', value: 'all' },
	{ label: '盘中', value: MESSAGE_TYPES.MORNING_FOCUS },
	{ label: '持仓', value: MESSAGE_TYPES.POSITION_HANDLE },
	{ label: '风险', value: MESSAGE_TYPES.RISK_WARNING },
	{ label: '点评', value: MESSAGE_TYPES.MORNING_COMMENT },
	{ label: '系统', value: MESSAGE_TYPES.SYSTEM }
]

// 推送用户筛选选项：全部、短线策略、中线策略
const pushScopeFilters = [
	{ label: '全部', value: '' },
	{ label: '短线策略', value: MESSAGE_TAGS.SHORT_TERM },
	{ label: '中线策略', value: MESSAGE_TAGS.MID_TERM }
]

const activeFilterCount = computed(() => {
	return (filters.value.messageType !== 'all' ? 1 : 0) + (filters.value.pushScope ? 1 : 0)
})

const filterSummary = computed(() => {
	const type = messageTypeFilters.find(item => item.value === filters.value.messageType)?.label
	const scope = pushScopeFilters.find(item => item.value === filters.value.pushScope)?.label
	const values = []
	if (type && type !== '全部') values.push(type)
	if (scope && scope !== '全部') values.push(scope)
	return values.length > 0 ? values.join(' · ') : '筛选'
})

const toggleExpanded = () => {
	expanded.value = !expanded.value
}

// 选择消息类型筛选
const selectMessageTypeFilter = (value) => {
	filters.value.messageType = value
	emitFilterChange()
}

// 选择推送用户筛选
const selectPushScopeFilter = (value) => {
	filters.value.pushScope = value
	emitFilterChange()
}

// 选择阅读状态筛选
const selectUnreadFilter = (unreadOnly) => {
	emit('unread-change', unreadOnly)
}

const showUnreadHelp = () => {
	uni.showModal({
		title: '未读说明',
		content: '未读筛选会从服务端加载当前筛选范围内尚未阅读的消息。自己发布的消息不会计入未读。',
		showCancel: false,
		confirmText: '知道了'
	})
}

// 发送筛选变化事件
const emitFilterChange = () => {
	emit('filter-change', {
		messageType: filters.value.messageType || 'all',
		pushScope: filters.value.pushScope,
		tags: filters.value.pushScope ? [filters.value.pushScope] : []
	})
}

// 初始化
onMounted(() => {
	emitFilterChange()
})

// 暴露方法给父组件
	defineExpose({
	resetFilters: () => {
		filters.value.messageType = 'all'
		filters.value.pushScope = ''
		expanded.value = false
		emitFilterChange()
	}
})

const resetFilters = () => {
	filters.value.messageType = 'all'
	filters.value.pushScope = ''
	emitFilterChange()
}
</script>

<style lang="scss" scoped>
.message-filter-bar {
	background: #ffffff;
	border-bottom: 1rpx solid #e5e7eb;
}

.filter-summary-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	min-height: 76rpx;
	padding: 10rpx 20rpx;
	box-sizing: border-box;
}

.quick-status-tabs,
.filter-summary-trigger,
.filter-card-actions {
	display: flex;
	align-items: center;
}

.quick-status-tabs {
	gap: 10rpx;
	flex-shrink: 0;
}

.quick-status-tab {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 86rpx;
	height: 52rpx;
	padding: 0 18rpx;
	box-sizing: border-box;
	border-radius: 26rpx;
	background: #f1f5f9;
	color: #64748b;
	font-size: 24rpx;
}

.quick-status-tab.active {
	background: #2563eb;
	color: #ffffff;
	font-weight: 600;
}

.unread-quick-tab.active {
	background: #dc2626;
}

.filter-summary-trigger {
	min-height: 60rpx;
	padding: 0 4rpx 0 18rpx;
	gap: 8rpx;
	color: #334155;
	border-left: 1rpx solid #e5e7eb;
}

.filter-summary-text {
	max-width: 260rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 24rpx;
}

.filter-count {
	min-width: 30rpx;
	height: 30rpx;
	padding: 0 8rpx;
	border-radius: 15rpx;
	background: #eff6ff;
	color: #2563eb;
	font-size: 20rpx;
	line-height: 30rpx;
	text-align: center;
}

.filter-chevron {
	width: 40rpx;
	height: 40rpx;
	font-size: 30rpx;
	line-height: 36rpx;
	text-align: center;
	color: #64748b;
}

.filter-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12rpx 20rpx 4rpx;
}

.filter-card-title {
	font-size: 24rpx;
	font-weight: 600;
	color: #334155;
}

.filter-card-actions {
	gap: 28rpx;
	font-size: 24rpx;
}

.filter-reset { color: #64748b; }
.filter-done { color: #2563eb; font-weight: 600; }

.filter-card {
	background: #ffffff;
}

// 筛选面板
.filter-panel {
	padding: 10rpx 16rpx;
}

// 标签和tab同行布局
.filter-row {
	display: flex;
	align-items: center;
	gap: 14rpx;
}

// 分组标签
.group-label {
	font-size: 24rpx;
	color: #999;
	font-weight: 500;
	flex-shrink: 0;
	white-space: nowrap;
}

.filter-scroll {
	flex: 1;
	overflow: hidden;
	white-space: nowrap;

	&::-webkit-scrollbar {
		display: none;
	}
}

.filter-tabs {
	display: inline-flex;
	gap: 14rpx;
	align-items: center;
}

// 推送范围tab - 只有3个，间距稍大
.push-tabs {
	gap: 18rpx;
}

.filter-tab {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	min-width: 72rpx;
	padding: 0 16rpx;
	background: #f0f0f0;
	border-radius: 26rpx;
	transition: all 0.15s;
	flex-shrink: 0;

	&:active {
		transform: scale(0.94);
		opacity: 0.85;
	}

	&.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);

		.tab-text {
			color: #ffffff;
			font-weight: 600;
		}
	}
}

// 推送范围tab - 橙色主题
.push-tab.active {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.25);
}

.status-panel {
	padding-top: 4rpx;
	padding-bottom: 12rpx;
}

.status-tabs {
	display: flex;
	gap: 14rpx;
	align-items: center;
}

.status-tab {
	min-width: 96rpx;
}

.unread-status-tab.active {
	background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
	box-shadow: 0 2rpx 8rpx rgba(249, 115, 22, 0.25);
}

.status-help {
	width: 36rpx;
	height: 36rpx;
	line-height: 36rpx;
	text-align: center;
	font-size: 22rpx;
	color: #999;
	background: #f4f4f5;
	border-radius: 50%;
}

.tab-text {
	font-size: 26rpx;
	color: #666;
	font-weight: 400;
	transition: all 0.15s;

	&.active {
		font-size: 28rpx;
		font-weight: 600;
	}
}
</style>
