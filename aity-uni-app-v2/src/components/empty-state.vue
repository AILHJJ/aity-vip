<template>
	<view class="empty-state-container">
		<view class="empty-state">
			<text class="empty-icon">{{ icon }}</text>
			<text class="empty-title">{{ title }}</text>
			<text v-if="description" class="empty-description">{{ description }}</text>
			<button v-if="actionText" class="empty-action" @click="handleAction">
				{{ actionText }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	type: {
		type: String,
		default: 'default',
		validator: (value) => ['default', 'message', 'discussion', 'favorite', 'network-error', 'no-result'].includes(value)
	},
	title: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	actionText: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['action'])

// 预设类型配置
const typeConfig = {
	'default': {
		icon: '📭',
		title: '暂无内容',
		description: '这里还没有任何内容'
	},
	'message': {
		icon: '💬',
		title: '暂无消息',
		description: '还没有发布任何消息，请稍后再来'
	},
	'discussion': {
		icon: '💭',
		title: '暂无讨论',
		description: '还没有人发起讨论，来做第一个吧'
	},
	'favorite': {
		icon: '⭐',
		title: '暂无收藏',
		description: '还没有收藏任何内容，快去添加吧'
	},
	'network-error': {
		icon: '🔌',
		title: '网络连接失败',
		description: '请检查网络设置后重试'
	},
	'no-result': {
		icon: '🔍',
		title: '未找到相关内容',
		description: '换一个关键词试试吧'
	}
}

// 计算显示的图标
const icon = computed(() => {
	if (props.type && typeConfig[props.type]) {
		return typeConfig[props.type].icon
	}
	return typeConfig['default'].icon
})

// 计算显示的标题
const displayTitle = computed(() => {
	return props.title || (props.type && typeConfig[props.type]?.title) || typeConfig['default'].title
})

// 计算显示的描述
const displayDescription = computed(() => {
	return props.description || (props.type && typeConfig[props.type]?.description) || ''
})

const handleAction = () => {
	emit('action')
}
</script>

<style lang="scss" scoped>
.empty-state-container {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 150rpx 60rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}

.empty-icon {
	font-size: 160rpx;
	margin-bottom: 40rpx;
	opacity: 0.8;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-20rpx);
	}
}

.empty-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 20rpx;
}

.empty-description {
	font-size: 28rpx;
	color: #999999;
	line-height: 1.6;
	max-width: 500rpx;
	margin-bottom: 40rpx;
}

.empty-action {
	padding: 20rpx 60rpx;
	font-size: 28rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 50rpx;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}
}

.empty-action::after {
	border: none;
}
</style>
