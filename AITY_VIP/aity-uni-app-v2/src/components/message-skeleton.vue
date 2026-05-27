<template>
	<view class="skeleton-list">
		<view v-for="i in count" :key="i" class="skeleton-item">
			<view class="skeleton-header">
				<view class="skeleton-badge"></view>
				<view class="skeleton-time"></view>
			</view>
			<view class="skeleton-title"></view>
			<view class="skeleton-content"></view>
			<view class="skeleton-content short"></view>
			<view class="skeleton-footer">
				<view class="skeleton-tags">
					<view class="skeleton-tag"></view>
					<view class="skeleton-tag"></view>
				</view>
				<view class="skeleton-stats"></view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	count: {
		type: Number,
		default: 5
	}
})
</script>

<style lang="scss" scoped>
// 骨架屏动画
@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.skeleton-list {
	padding: 20rpx;
}

.skeleton-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.7;
	}
}

.skeleton-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.skeleton-badge {
	width: 120rpx;
	height: 40rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 20rpx;
}

.skeleton-time {
	width: 180rpx;
	height: 32rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 8rpx;
}

.skeleton-title {
	width: 70%;
	height: 36rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 8rpx;
	margin-top: 20rpx;
}

.skeleton-content {
	width: 100%;
	height: 28rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 8rpx;
	margin-top: 16rpx;

	&.short {
		width: 60%;
	}
}

.skeleton-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
}

.skeleton-tags {
	display: flex;
	gap: 16rpx;
}

.skeleton-tag {
	width: 100rpx;
	height: 40rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 12rpx;
}

.skeleton-stats {
	display: flex;
	gap: 20rpx;
}

.skeleton-stats::before,
.skeleton-stats::after {
	content: '';
	width: 80rpx;
	height: 28rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 8rpx;
}
</style>
