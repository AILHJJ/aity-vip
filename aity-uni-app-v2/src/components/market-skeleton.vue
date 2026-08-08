<template>
	<view class="market-skeleton">
		<!-- 指数卡片骨架 -->
		<view class="skeleton-index-bar">
			<view v-for="i in 4" :key="i" class="skeleton-index-card">
				<view class="skeleton-name"></view>
				<view class="skeleton-value"></view>
				<view class="skeleton-change"></view>
			</view>
		</view>

		<!-- 统计卡片骨架 -->
		<view class="skeleton-stats-grid">
			<view v-for="i in 4" :key="i" class="skeleton-stat-card">
				<view class="skeleton-stat-value"></view>
				<view class="skeleton-stat-label"></view>
			</view>
		</view>

		<!-- 情绪卡片骨架 -->
		<view class="skeleton-sentiment">
			<view class="skeleton-sentiment-header">
				<view class="skeleton-title"></view>
				<view class="skeleton-score"></view>
			</view>
			<view class="skeleton-sentiment-bar"></view>
		</view>

		<!-- Tab骨架 -->
		<view class="skeleton-tabs">
			<view v-for="i in 3" :key="i" class="skeleton-tab"></view>
		</view>

		<!-- 列表骨架 -->
		<view class="skeleton-list">
			<view v-for="i in count" :key="i" class="skeleton-item">
				<view class="skeleton-item-header">
					<view class="skeleton-badge"></view>
					<view class="skeleton-item-info">
						<view class="skeleton-item-title"></view>
						<view class="skeleton-item-subtitle"></view>
					</view>
				</view>
				<view v-if="i <= 2 && showDetail" class="skeleton-detail">
					<view class="skeleton-detail-row">
						<view class="skeleton-detail-label"></view>
						<view class="skeleton-detail-value"></view>
					</view>
					<view class="skeleton-detail-row">
						<view class="skeleton-detail-label"></view>
						<view class="skeleton-detail-value"></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	count: {
		type: Number,
		default: 3
	},
	showDetail: {
		type: Boolean,
		default: false
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

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
}

.skeleton-base {
	background: linear-gradient(90deg, var(--bg-tertiary, #f0f0f0) 25%, var(--bg-secondary, #e8e8e8) 50%, var(--bg-tertiary, #f0f0f0) 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}

.skeleton-index-bar {
	display: flex;
	gap: 16rpx;
	padding: 16rpx;
	overflow: hidden;
}

.skeleton-index-card {
	flex-shrink: 0;
	width: 160rpx;
	padding: 16rpx;
	background: var(--bg-card, #fff);
	border-radius: 16rpx;
	border: 1rpx solid var(--border-primary, #e5e7eb);

	.skeleton-name {
		width: 80rpx;
		height: 24rpx;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 8rpx;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-value {
		width: 100rpx;
		height: 32rpx;
		margin-top: 12rpx;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 8rpx;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-change {
		width: 60rpx;
		height: 24rpx;
		margin-top: 8rpx;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 8rpx;
		animation: pulse 1.5s ease-in-out infinite;
	}
}

.skeleton-stats-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16rpx;
	padding: 0 32rpx;
}

.skeleton-stat-card {
	background: var(--bg-card, #fff);
	border-radius: 16rpx;
	padding: 20rpx;
	text-align: center;
	border: 1rpx solid var(--border-primary, #e5e7eb);

	.skeleton-stat-value {
		width: 80rpx;
		height: 40rpx;
		margin: 0 auto;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 8rpx;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-stat-label {
		width: 40rpx;
		height: 24rpx;
		margin: 8rpx auto 0;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 8rpx;
		animation: pulse 1.5s ease-in-out infinite;
	}
}

.skeleton-sentiment {
	margin: 0 32rpx 24rpx;
	background: var(--bg-card, #fff);
	border-radius: 24rpx;
	padding: 28rpx;
	border: 1rpx solid var(--border-primary, #e5e7eb);

	.skeleton-sentiment-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16rpx;

		.skeleton-title {
			width: 120rpx;
			height: 28rpx;
			background: var(--bg-tertiary, #f0f0f0);
			border-radius: 8rpx;
			animation: pulse 1.5s ease-in-out infinite;
		}

		.skeleton-score {
			width: 80rpx;
			height: 36rpx;
			background: var(--bg-tertiary, #f0f0f0);
			border-radius: 8rpx;
			animation: pulse 1.5s ease-in-out infinite;
		}
	}

	.skeleton-sentiment-bar {
		height: 12rpx;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 6rpx;
		animation: pulse 1.5s ease-in-out infinite;
	}
}

.skeleton-tabs {
	display: flex;
	background: var(--bg-secondary, #f5f5f5);
	border-bottom: 1rpx solid var(--border-primary, #e5e7eb);

	.skeleton-tab {
		flex: 1;
		height: 80rpx;
		background: var(--bg-tertiary, #f0f0f0);
		margin: 0 2rpx;
		animation: pulse 1.5s ease-in-out infinite;

		&:first-child {
			margin-left: 0;
		}
		&:last-child {
			margin-right: 0;
		}
	}
}

.skeleton-list {
	padding: 24rpx 32rpx;
}

.skeleton-item {
	background: var(--bg-card, #fff);
	border-radius: 24rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	border: 1rpx solid var(--border-primary, #e5e7eb);
	animation: pulse 1.5s ease-in-out infinite;

	.skeleton-item-header {
		display: flex;
		align-items: center;
		padding: 28rpx;
	}

	.skeleton-badge {
		width: 80rpx;
		height: 80rpx;
		background: var(--bg-tertiary, #f0f0f0);
		border-radius: 20rpx;
		flex-shrink: 0;
	}

	.skeleton-item-info {
		margin-left: 24rpx;
		flex: 1;

		.skeleton-item-title {
			width: 120rpx;
			height: 30rpx;
			background: var(--bg-tertiary, #f0f0f0);
			border-radius: 8rpx;
		}

		.skeleton-item-subtitle {
			width: 180rpx;
			height: 24rpx;
			margin-top: 8rpx;
			background: var(--bg-tertiary, #f0f0f0);
			border-radius: 8rpx;
		}
	}

	.skeleton-detail {
		padding: 0 28rpx 28rpx;
		border-top: 1rpx solid var(--border-secondary, #f0f0f0);

		.skeleton-detail-row {
			display: flex;
			justify-content: space-between;
			margin-top: 16rpx;

			.skeleton-detail-label {
				width: 100rpx;
				height: 26rpx;
				background: var(--bg-tertiary, #f0f0f0);
				border-radius: 8rpx;
			}

			.skeleton-detail-value {
				width: 150rpx;
				height: 26rpx;
				background: var(--bg-tertiary, #f0f0f0);
				border-radius: 8rpx;
			}
		}
	}
}
</style>
