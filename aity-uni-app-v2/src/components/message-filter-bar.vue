<template>
	<view class="message-filter-bar">
		<view class="filter-card">
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
	}
})

const emit = defineEmits(['filter-change'])

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
		emitFilterChange()
	}
})
</script>

<style lang="scss" scoped>
.message-filter-bar {
	background: #ffffff;
}

.filter-card {
	background: #ffffff;
}

// 筛选面板
.filter-panel {
	padding: 16rpx 20rpx;
}

// 标签和tab同行布局
.filter-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

// 分组标签
.group-label {
	font-size: 26rpx;
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
	gap: 20rpx;
	align-items: center;
}

// 推送范围tab - 只有3个，间距更大
.push-tabs {
	gap: 24rpx;
}

.filter-tab {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 60rpx;
	min-width: 80rpx;
	padding: 0 20rpx;
	background: #f0f0f0;
	border-radius: 30rpx;
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

.tab-text {
	font-size: 28rpx;
	color: #666;
	font-weight: 400;
	transition: all 0.15s;

	&.active {
		font-size: 30rpx;
		font-weight: 600;
	}
}
</style>
