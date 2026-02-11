<template>
	<view class="theme-selector-container">
		<view class="theme-selector-header" @click="toggleSelector">
			<text class="theme-selector-title">🎨 主题样式</text>
			<text class="theme-selector-arrow" :class="{ expanded: isExpanded }">▼</text>
		</view>

		<view v-if="isExpanded" class="theme-list">
			<view
				v-for="theme in themes"
				:key="theme.value"
				class="theme-item"
				:class="{ active: currentTheme === theme.value }"
				@click="selectTheme(theme.value)"
			>
				<view class="theme-preview" :style="{ background: theme.previewColor }">
					<text v-if="currentTheme === theme.value" class="theme-check">✓</text>
				</view>
				<view class="theme-info">
					<text class="theme-name">{{ theme.name }}</text>
					<text class="theme-desc">{{ theme.description }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
	modelValue: {
		type: String,
		default: 'default'
	}
})

const emit = defineEmits(['update:modelValue', 'change'])

// 可用主题列表
const themes = ref([
	{
		value: 'default',
		name: '简约白',
		description: '简洁清爽，适合日常阅读',
		previewColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
	},
	{
		value: 'github',
		name: 'GitHub',
		description: '开发者熟悉的风格',
		previewColor: 'linear-gradient(135deg, #24292e 0%, #58a6ff 100%)'
	},
	{
		value: 'emerald',
		name: '翡翠绿',
		description: '清新护眼，绿色主题',
		previewColor: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)'
	},
	{
		value: 'ocean',
		name: '蓝色海洋',
		description: '深邃海洋，专业风格',
		previewColor: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)'
	},
	{
		value: 'warm',
		name: '暖阳橙',
		description: '温暖活力，橙色主题',
		previewColor: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)'
	},
	{
		value: 'dark',
		name: '暗夜模式',
		description: '护眼暗色，夜间阅读',
		previewColor: 'linear-gradient(135deg, #18191a 0%, #3a3b3c 100%)'
	}
])

const currentTheme = ref(props.modelValue)
const isExpanded = ref(false)

// 切换选择器展开状态
const toggleSelector = () => {
	isExpanded.value = !isExpanded.value
}

// 选择主题
const selectTheme = (themeValue) => {
	currentTheme.value = themeValue
	emit('update:modelValue', themeValue)
	emit('change', themeValue)

	// 保存到本地存储
	uni.setStorageSync('markdown_theme', themeValue)

	// 显示提示
	const themeName = themes.value.find(t => t.value === themeValue)?.name || themeValue
	uni.showToast({
		title: `已切换到${themeName}主题`,
		icon: 'success',
		duration: 1500
	})

	// 自动收起
	setTimeout(() => {
		isExpanded.value = false
	}, 300)
}

// 初始化主题
onMounted(() => {
	// 从本地存储读取主题
	const savedTheme = uni.getStorageSync('markdown_theme')
	if (savedTheme) {
		currentTheme.value = savedTheme
		emit('update:modelValue', savedTheme)
	}
})
</script>

<style lang="scss" scoped>
.theme-selector-container {
	background: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
	margin-bottom: 20rpx;
}

.theme-selector-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	cursor: pointer;
	transition: opacity 0.2s ease;

	&:active {
		opacity: 0.9;
	}
}

.theme-selector-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #ffffff;
}

.theme-selector-arrow {
	font-size: 24rpx;
	color: #ffffff;
	transition: transform 0.3s ease;

	&.expanded {
		transform: rotate(180deg);
	}
}

.theme-list {
	max-height: 600rpx;
	overflow-y: auto;
}

.theme-item {
	display: flex;
	align-items: center;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background 0.2s ease;
	cursor: pointer;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background: #f5f5f5;
	}

	&.active {
		background: #f0f2ff;
	}
}

.theme-preview {
	width: 80rpx;
	height: 80rpx;
	border-radius: 12rpx;
	margin-right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: inherit;
		border-radius: 12rpx;
	}
}

.theme-check {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: bold;
	text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
	z-index: 1;
}

.theme-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.theme-name {
	font-size: 30rpx;
	font-weight: 500;
	color: #333333;
	margin-bottom: 6rpx;
}

.theme-desc {
	font-size: 24rpx;
	color: #999999;
}
</style>
