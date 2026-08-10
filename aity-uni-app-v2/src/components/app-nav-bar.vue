<template>
	<view class="app-nav-bar" :class="{ dark: theme === 'dark' }" :style="{ paddingTop: `${statusBarHeight}px` }">
		<view
			class="app-nav-content"
			:style="{
				height: `${navHeight}px`,
				paddingLeft: `${menuRightSpace}px`,
				paddingRight: `${menuRightSpace}px`
			}"
		>
			<view v-if="showBack" class="app-nav-back" @click="goBack" aria-label="返回">
				<text class="app-nav-back-icon">‹</text>
			</view>
			<text class="app-nav-title">{{ title }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
	title: {
		type: String,
		default: ''
	},
	showBack: {
		type: Boolean,
		default: false
	},
	theme: {
		type: String,
		default: 'light'
	}
})

const statusBarHeight = ref(20)
const navHeight = ref(44)
const menuRightSpace = ref(96)

onMounted(() => {
	try {
		const windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
		statusBarHeight.value = windowInfo.statusBarHeight || 20

		const menuButton = uni.getMenuButtonBoundingClientRect?.()
		if (menuButton) {
			navHeight.value = Math.max(44, menuButton.height + (menuButton.top - statusBarHeight.value) * 2)
			menuRightSpace.value = Math.max(88, windowInfo.windowWidth - menuButton.left + 12)
		}
	} catch (error) {
		console.warn('读取小程序导航栏尺寸失败，使用默认值', error)
	}
})

const goBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.app-nav-bar {
	background: #ffffff;
	color: #172033;
	box-sizing: border-box;
	position: sticky;
	top: 0;
	z-index: 20;
}

.app-nav-content {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	position: relative;
	border-bottom: 1rpx solid #e5e7eb;
}

.app-nav-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #172033;
	line-height: 1;
}

.app-nav-back {
	position: absolute;
	left: 24rpx;
	top: 50%;
	width: 72rpx;
	height: 72rpx;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.app-nav-back-icon {
	font-size: 64rpx;
	font-weight: 300;
	line-height: 56rpx;
	color: #334155;
}

.app-nav-bar.dark {
	background: #0f172a;
	color: #ffffff;
}

.app-nav-bar.dark .app-nav-content {
	border-bottom-color: rgba(255, 255, 255, 0.1);
}

.app-nav-bar.dark .app-nav-title,
.app-nav-bar.dark .app-nav-back-icon {
	color: #ffffff;
}
</style>
