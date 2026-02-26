<template>
	<view class="stats-container">
		<scroll-view
			class="stats-scroll"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 加载中 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 统计内容 -->
			<view v-else class="stats-content">
				<!-- 统计卡片 -->
				<view class="stats-cards">
					<view class="stat-card">
						<text class="stat-icon">👥</text>
						<text class="stat-value">{{ stats.users?.total || 0 }}</text>
						<text class="stat-label">总用户数</text>
					</view>

					<view class="stat-card">
						<text class="stat-icon">✨</text>
						<text class="stat-value">{{ stats.users?.newToday || 0 }}</text>
						<text class="stat-label">今日新增</text>
					</view>

					<view class="stat-card">
						<text class="stat-icon">📨</text>
						<text class="stat-value">{{ stats.messages?.total || 0 }}</text>
						<text class="stat-label">消息总数</text>
					</view>

					<view class="stat-card">
						<text class="stat-icon">💬</text>
						<text class="stat-value">{{ stats.discussions?.total || 0 }}</text>
						<text class="stat-label">讨论总数</text>
					</view>
				</view>

				<!-- 用户增长趋势 -->
				<view class="chart-section">
					<view class="section-header">
						<text class="section-title">用户增长趋势</text>
						<text class="section-subtitle">最近30天</text>
					</view>
					<view class="chart-placeholder">
						<view class="chart-bars">
							<view
								v-for="(item, index) in userGrowthData"
								:key="index"
								class="chart-bar-wrapper"
							>
								<view
									class="chart-bar"
									:style="{ height: getBarHeight(item.count, maxUserGrowth) }"
								></view>
								<text class="chart-label">{{ formatChartDate(item.date) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 消息发布趋势 -->
				<view class="chart-section">
					<view class="section-header">
						<text class="section-title">消息发布趋势</text>
						<text class="section-subtitle">最近30天</text>
					</view>
					<view class="chart-placeholder">
						<view class="chart-bars">
							<view
								v-for="(item, index) in messageTrendData"
								:key="index"
								class="chart-bar-wrapper"
							>
								<view
									class="chart-bar message-bar"
									:style="{ height: getBarHeight(item.count, maxMessageTrend) }"
								></view>
								<text class="chart-label">{{ formatChartDate(item.date) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 用户角色分布 -->
				<view class="chart-section">
					<view class="section-header">
						<text class="section-title">用户角色分布</text>
						<text class="section-subtitle">总用户: {{ stats.totalUsers || 0 }}</text>
					</view>

					<view v-if="userRoleDistributionArray.length === 0" class="empty-state">
						<text class="empty-text">暂无数据</text>
					</view>

					<view v-else class="pie-chart-container">
						<view
							class="role-pie-chart"
							:style="{
								background: userRoleDistributionArray.map(item =>
									`${item.color.start} ${item.startPercent.toFixed(1)}% ${item.endPercent.toFixed(1)}%`
								).join(', ')
							}"
						></view>
						<view class="pie-legend">
							<view
								v-for="item in userRoleDistributionArray"
								:key="item.role"
								class="legend-item"
							>
								<view
									class="legend-color"
									:style="{
										background: `linear-gradient(135deg, ${item.color.start} 0%, ${item.color.end} 100%)`
									}"
								></view>
								<text class="legend-label">{{ item.label }}</text>
								<text class="legend-value">{{ item.count }} ({{ item.percent.toFixed(1) }}%)</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 消息类型分布 -->
				<view class="chart-section">
					<view class="section-header">
						<text class="section-title">消息类型分布</text>
						<text class="section-subtitle">总消息: {{ stats.totalMessages || 0 }}</text>
					</view>

					<view v-if="messageTypeDistributionArray.length === 0" class="empty-state">
						<text class="empty-text">暂无数据</text>
					</view>

					<view v-else class="message-type-distribution">
						<view
							v-for="(item, index) in messageTypeDistributionArray"
							:key="item.type"
							class="type-bar-item"
						>
							<view class="type-bar-header">
								<text class="type-label">{{ item.label }}</text>
								<view class="type-value">
									<text class="type-count">{{ item.count }}</text>
									<text class="type-percent">{{ item.percent }}%</text>
								</view>
							</view>
							<view class="type-bar-bg">
								<view
									class="type-bar-fill"
									:style="{
										width: `${item.barWidth}%`,
										background: getMessageTypeColor(item.type)
									}"
								></view>
							</view>
						</view>
					</view>
				</view>

				<!-- 最近活跃用户 -->
				<view class="active-users-section">
					<view class="section-header">
						<text class="section-title">最近活跃用户</text>
						<text class="section-subtitle">Top 10</text>
					</view>

					<view v-if="activeUsers.length === 0" class="empty-state">
						<text class="empty-text">暂无数据</text>
					</view>

					<view v-else class="active-users-list">
						<view
							v-for="(user, index) in activeUsers"
							:key="user.id"
							class="active-user-item"
						>
							<view class="user-rank">{{ index + 1 }}</view>
							<view class="user-info">
								<text class="user-name">{{ user.username }}</text>
								<text class="user-email">{{ user.email }}</text>
							</view>
							<view class="user-activity">
								<text class="activity-count">{{ user.activityCount || 0 }}</text>
								<text class="activity-label">次活动</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getStatsApi, getUserGrowthApi, getMessageTrendApi, getActiveUsersApi, getUserRoleDistributionApi, getMessageTypeDistributionApi } from '../../api/stats'
import { USER_ROLE_LABELS, MESSAGE_TYPE_LABELS } from '../../utils/constants'

const userStore = useUserStore()

// 数据
const stats = ref({
	totalUsers: 0,
	activeUsers: 0,
	totalMessages: 0,
	totalDiscussions: 0
})
const userGrowthData = ref([])
const messageTrendData = ref([])
const activeUsers = ref([])
const userRoleDistribution = ref({})
const messageTypeDistribution = ref({})
const loading = ref(false)
const refreshing = ref(false)

// 计算最大值用于柱状图高度
const maxUserGrowth = computed(() => {
	if (userGrowthData.value.length === 0) return 1
	return Math.max(...userGrowthData.value.map(item => item.count))
})

const maxMessageTrend = computed(() => {
	if (messageTrendData.value.length === 0) return 1
	return Math.max(...messageTrendData.value.map(item => item.count))
})

// 用户角色分布计算
const userRoleDistributionArray = computed(() => {
	const distribution = []
	const total = Object.values(userRoleDistribution.value).reduce((sum, val) => sum + val, 0) || 1

	const roleColors = {
		super_admin: { start: '#667eea', end: '#764ba2' },
		admin: { start: '#4facfe', end: '#00f2fe' },
		vip_mid: { start: '#43e97b', end: '#38f9d7' },
		vip_short: { start: '#ff9a56', end: '#ff6a88' },
		trial: { start: '#bdc3c7', end: '#95a5a6' }
	}

	let currentPercent = 0
	Object.entries(userRoleDistribution.value).forEach(([role, count]) => {
		const percent = (count / total) * 100
		distribution.push({
			role,
			label: USER_ROLE_LABELS[role] || role,
			count,
			percent,
			startPercent: currentPercent,
			endPercent: currentPercent + percent,
			color: roleColors[role] || { start: '#cccccc', end: '#cccccc' }
		})
		currentPercent += percent
	})

	return distribution
})

// 消息类型分布计算
const messageTypeDistributionArray = computed(() => {
	const distribution = []
	const total = Object.values(messageTypeDistribution.value).reduce((sum, val) => sum + val, 0) || 1
	const maxCount = Math.max(...Object.values(messageTypeDistribution.value), 1)

	Object.entries(messageTypeDistribution.value).forEach(([type, count]) => {
		distribution.push({
			type,
			label: MESSAGE_TYPE_LABELS[type] || type,
			count,
			percent: ((count / total) * 100).toFixed(1),
			barWidth: (count / maxCount) * 100
		})
	})

	// 按数量排序
	return distribution.sort((a, b) => b.count - a.count)
})

// 获取柱状图高度
const getBarHeight = (value, max) => {
	if (max === 0) return '0rpx'
	const percentage = (value / max) * 100
	return `${Math.max(percentage, 5)}%`
}

// 格式化图表日期
const formatChartDate = (date) => {
	if (!date) return ''
	const d = new Date(date)
	return `${d.getMonth() + 1}/${d.getDate()}`
}

// 获取消息类型颜色
const getMessageTypeColor = (type) => {
	const colors = {
		pre_market_comment: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		morning_comment: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		morning_focus: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		afternoon_comment: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
		afternoon_focus: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
		close_comment: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
		risk_warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		system: 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
		important: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
		daily: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
	}
	return colors[type] || 'linear-gradient(135deg, #cccccc 0%, #cccccc 100%)'
}

// 加载统计数据
const loadStats = async () => {
	loading.value = true

	try {
		// 加载基础统计
		const statsRes = await getStatsApi()
		if (statsRes.success) {
			stats.value = statsRes.data
		}

		// 加载用户增长趋势
		const userGrowthRes = await getUserGrowthApi({ days: 30 })
		if (userGrowthRes.success) {
			userGrowthData.value = userGrowthRes.data.growth || []
		}

		// 加载消息发布趋势
		const messageTrendRes = await getMessageTrendApi({ days: 30 })
		if (messageTrendRes.success) {
			messageTrendData.value = messageTrendRes.data.trend || []
		}

		// 加载活跃用户
		const activeUsersRes = await getActiveUsersApi({ limit: 10 })
		if (activeUsersRes.success) {
			activeUsers.value = activeUsersRes.data.users || []
		}

		// 加载用户角色分布
		const roleDistRes = await getUserRoleDistributionApi()
		if (roleDistRes.success) {
			userRoleDistribution.value = roleDistRes.data.distribution || {}
		}

		// 加载消息类型分布
		const msgTypeDistRes = await getMessageTypeDistributionApi()
		if (msgTypeDistRes.success) {
			messageTypeDistribution.value = msgTypeDistRes.data.distribution || {}
		}
	} catch (error) {
		console.error('加载统计数据失败:', error)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
		refreshing.value = false
	}
}

// 下拉刷新
const onRefresh = () => {
	refreshing.value = true
	loadStats()
}

// 页面加载
onMounted(() => {
	// 检查管理员权限
	if (!userStore.isAdmin) {
		uni.showToast({
			title: '无权限访问',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
		return
	}

	loadStats()
})
</script>

<style lang="scss" scoped>
.stats-container {
	height: 100vh;
	background: #f5f5f5;
}

.stats-scroll {
	height: 100%;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 150rpx 0;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #e0e0e0;
	border-top-color: #667eea;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	margin-top: 20rpx;
	font-size: 28rpx;
	color: #999999;
}

.stats-content {
	padding: 30rpx;
}

.stats-cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.stat-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16rpx;
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.stat-icon {
	font-size: 60rpx;
	margin-bottom: 15rpx;
}

.stat-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 10rpx;
}

.stat-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
}

.chart-section,
.active-users-section {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.section-subtitle {
	font-size: 24rpx;
	color: #999999;
}

.chart-placeholder {
	height: 400rpx;
	display: flex;
	align-items: flex-end;
	padding: 20rpx 0;
}

.chart-bars {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	width: 100%;
	height: 100%;
	gap: 8rpx;
}

.chart-bar-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100%;
}

.chart-bar {
	width: 100%;
	background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
	border-radius: 4rpx 4rpx 0 0;
	min-height: 10rpx;
	transition: height 0.3s;
}

.message-bar {
	background: linear-gradient(180deg, #52c41a 0%, #389e0d 100%);
}

.chart-label {
	margin-top: 10rpx;
	font-size: 20rpx;
	color: #999999;
	transform: rotate(-45deg);
	transform-origin: center;
	white-space: nowrap;
}

.empty-state {
	text-align: center;
	padding: 80rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.active-users-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.active-user-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
}

.user-rank {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 50%;
	margin-right: 20rpx;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.user-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.user-email {
	font-size: 24rpx;
	color: #999999;
}

.user-activity {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.activity-count {
	font-size: 32rpx;
	font-weight: bold;
	color: #667eea;
	margin-bottom: 4rpx;
}

.activity-label {
	font-size: 22rpx;
	color: #999999;
}

// ========== 饼图样式 ==========

.pie-chart-container {
	padding: 20rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.role-pie-chart {
	width: 400rpx;
	height: 400rpx;
	border-radius: 50%;
	margin: 0 auto 40rpx;
	position: relative;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

	// 中心圆，创建环形效果
	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 200rpx;
		height: 200rpx;
		background: #ffffff;
		border-radius: 50%;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}
}

.pie-legend {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.legend-item {
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
		background: #f0f0f0;
	}
}

.legend-color {
	width: 40rpx;
	height: 40rpx;
	border-radius: 8rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.legend-label {
	flex: 1;
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
}

.legend-value {
	font-size: 24rpx;
	color: #667eea;
	font-weight: 600;
}

// ========== 消息类型分布样式 ==========

.message-type-distribution {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	padding: 10rpx 0;
}

.type-bar-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.type-bar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.type-label {
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
	flex: 1;
}

.type-value {
	display: flex;
	align-items: baseline;
	gap: 8rpx;
}

.type-count {
	font-size: 28rpx;
	color: #667eea;
	font-weight: 600;
}

.type-percent {
	font-size: 22rpx;
	color: #999999;
}

.type-bar-bg {
	width: 100%;
	height: 16rpx;
	background: #f0f0f0;
	border-radius: 8rpx;
	overflow: hidden;
}

.type-bar-fill {
	height: 100%;
	border-radius: 8rpx;
	transition: width 0.6s ease-out;
	min-width: 4rpx;
}
</style>
