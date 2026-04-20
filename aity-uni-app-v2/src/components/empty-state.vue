<template>
	<view class="empty-state-container">
		<view class="empty-state">
			<text class="empty-icon">{{ computedIcon }}</text>
			<text class="empty-title">{{ computedTitle }}</text>
			<text v-if="computedDescription" class="empty-description">{{ computedDescription }}</text>
			<button
				v-if="showAction && computedActionText"
				:class="['empty-action', 'action-' + actionType]"
				@click="handleAction"
			>
				{{ computedActionText }}
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
		validator: (value) => ['default', 'message', 'discussion', 'favorite', 'network-error', 'no-result', 'image', 'discussions', 'profile', 'market'].includes(value)
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
	},
	icon: {
		type: String,
		default: ''
	},
	actionType: {
		type: String,
		default: 'primary',
		validator: (value) => ['primary', 'secondary', 'text'].includes(value)
	},
	showAction: {
		type: Boolean,
		default: true
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
		description: '还没有人发起讨论，来做第一个吧',
		actionText: '发起讨论'
	},
	'discussions': {
		icon: '💬',
		title: '暂无讨论',
		description: '该消息还没有相关讨论，快来发起第一个讨论吧',
		actionText: '发起讨论'
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
	},
	'image': {
		icon: '🖼️',
		title: '暂无图片',
		description: '该消息没有图片附件'
	},
	'market': {
		icon: '📊',
		title: '暂无行情数据',
		description: '当前暂无行情数据，请稍后再试'
	},
	'profile': {
		icon: '👤',
		title: '暂无个人资料',
		description: '请完善个人信息'
	}
}

// 计算显示的图标
const computedIcon = computed(() => {
	return props.icon || (props.type && typeConfig[props.type]?.icon) || typeConfig['default'].icon
})

// 计算显示的标题
const computedTitle = computed(() => {
	return props.title || (props.type && typeConfig[props.type]?.title) || typeConfig['default'].title
})

// 计算显示的描述
const computedDescription = computed(() => {
	return props.description || (props.type && typeConfig[props.type]?.description) || ''
})

// 计算显示的操作按钮文本
const computedActionText = computed(() => {
	return props.actionText || (props.type && typeConfig[props.type]?.actionText) || ''
})

const handleAction = () => {
	emit('action')
}
</script>

<style lang="scss" scoped>
/* 微信小程序 button 组件默认样式重置 */
button {
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	line-height: normal;
	font-size: inherit;
}
button::after {
	border: none;
}

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
	color: var(--text-primary);
	margin-bottom: 20rpx;
}

.empty-description {
	font-size: 28rpx;
	color: var(--text-tertiary);
	line-height: 1.6;
	max-width: 500rpx;
	margin-bottom: 40rpx;
}

.empty-action {
	padding: 20rpx 60rpx;
	font-size: 28rpx;
	border: none;
	border-radius: 50rpx;
	box-shadow: var(--shadow-card);
	transition: all 0.3s;
	font-weight: 500;

	&:active {
		transform: scale(0.95);
	}

	&::after {
		border: none;
	}
}

.action-primary {
	color: var(--btn-primary-text);
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
	box-shadow: var(--shadow-primary);

	&:active {
		box-shadow: var(--shadow-sm);
	}
}

.action-secondary {
	color: var(--btn-secondary-text);
	background: var(--btn-secondary-bg);

	&:active {
		background: var(--bg-hover);
	}
}

.action-text {
	color: var(--text-link);
	background: transparent;

	&:active {
		background: var(--bg-hover);
	}
}
</style>
