<template>
	<view class="webview-container">
		<app-nav-bar :title="title" show-back />
		
		<!-- WebView -->
		<view class="webview-wrapper">
			<web-view :src="url" @message="handleMessage"></web-view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppNavBar from '@/components/app-nav-bar.vue'

// 页面参数
const url = ref('')
const title = ref('行情图')

// 页面加载时获取参数
onLoad((options) => {
	if (options.url) {
		url.value = decodeURIComponent(options.url)
	}
	if (options.title) {
		title.value = options.title
	}
})

// 处理WebView消息
const handleMessage = (e) => {
	console.log('WebView message:', e)
}
</script>

<style scoped>
.webview-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}

.nav-bar {
	height: 44px;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #e5e5e5;
	position: sticky;
	top: 0;
	z-index: 100;
}

.nav-left {
	display: flex;
	align-items: center;
	gap: 4px;
}

.back-icon {
	font-size: 20px;
	font-weight: bold;
}

.nav-title {
	font-size: 14px;
	color: #333333;
}

.nav-center {
	font-size: 16px;
	font-weight: 500;
	color: #333333;
}

.nav-right {
	width: 60px;
}

.webview-wrapper {
	flex: 1;
	overflow: hidden;
}

web-view {
	width: 100%;
	height: 100%;
}
</style>
