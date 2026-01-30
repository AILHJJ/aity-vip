<template>
	<view class="discussions-container">
		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view
				v-for="filter in filters"
				:key="filter.value"
				class="filter-item"
				:class="{ active: activeFilter === filter.value }"
				@click="handleFilter(filter.value)"
			>
				{{ filter.label }}
			</view>
		</view>

		<!-- 讨论列表 -->
		<scroll-view
			class="discussions-scroll"
			scroll-y
			@scrolltolower="loadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 加载中 -->
			<view v-if="loading && discussions.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="discussions.length === 0" class="empty-state">
				<text class="empty-icon">💬</text>
				<text class="empty-text">暂无讨论</text>
			</view>

			<!-- 讨论列表 -->
			<view v-else class="discussions-list">
				<view
					v-for="discussion in discussions"
					:key="discussion.id"
					class="discussion-item"
					@click="goToDetail(discussion.id)"
				>
					<view class="discussion-header">
						<view class="user-info">
							<text class="user-name">{{ discussion.userName }}</text>
							<text class="discussion-time">{{ formatFriendlyTime(discussion.createdAt) }}</text>
						</view>
						<view class="status-badge" :class="discussion.status">
							{{ discussion.status === 'replied' ? '已回复' : '待回复' }}
						</view>
					</view>

					<view class="discussion-title">{{ discussion.title }}</view>

					<view class="discussion-content">{{ discussion.content }}</view>

					<view class="discussion-footer">
						<text class="message-title">关于：{{ discussion.messageTitle }}</text>
						<view class="discussion-stats">
							<text class="stat-item">💬 {{ discussion.replyCount || 0 }}</text>
							<text v-if="discussion.visibility === 'private'" class="visibility-badge">🔒 私密</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && !loading" class="load-more">
				<text class="load-more-text">加载更多...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && discussions.length > 0" class="no-more">
				<text class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getDiscussionsApi } from '../../api/discussion'
import { formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 数据
const discussions = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)
const activeFilter = ref('')

// 筛选选项
const filters = ref([
	{ label: '全部', value: '' },
	{ label: '待回复', value: 'pending' },
	{ label: '已回复', value: 'replied' }
])

// 加载讨论列表
const loadDiscussions = async (isRefresh = false) => {
	if (loading.value) return

	if (isRefresh) {
		page.value = 1
		hasMore.value = true
	}

	loading.value = true

	try {
		const params = {
			page: page.value,
			limit: limit.value
		}

		if (activeFilter.value) {
			params.status = activeFilter.value
		}

		const res = await getDiscussionsApi(params)

		if (res.success) {
			if (isRefresh) {
				discussions.value = res.data.discussions || []
			} else {
				discussions.value = [...discussions.value, ...(res.data.discussions || [])]
			}

			// 判断是否还有更多
			hasMore.value = discussions.value.length < res.data.total
		} else {
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载讨论失败:', error)
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
	loadDiscussions(true)
}

// 加载更多
const loadMore = () => {
	if (!hasMore.value || loading.value) return
	page.value++
	loadDiscussions()
}

// 筛选
const handleFilter = (value) => {
	activeFilter.value = value
	loadDiscussions(true)
}

// 跳转到详情
const goToDetail = (id) => {
	uni.navigateTo({
		url: `/pages/discussion-detail/discussion-detail?id=${id}`
	})
}

// 页面加载
onMounted(() => {
	// 检查登录状态
	if (!userStore.isLoggedIn) {
		uni.reLaunch({
			url: '/pages/login/login'
		})
		return
	}

	loadDiscussions(true)
})

// 监听页面显示
uni.onShow(() => {
	if (discussions.value.length > 0) {
		loadDiscussions(true)
	}
})
</script>

<style lang="scss" scoped>
.discussions-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.filter-bar {
	display: flex;
	background: #ffffff;
	padding: 20rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.filter-item {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	font-size: 28rpx;
	color: #666666;
	border-radius: 8rpx;
	transition: all 0.3s;
}

.filter-item.active {
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.discussions-scroll {
	flex: 1;
	overflow-y: auto;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
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

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 150rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.discussions-list {
	padding: 20rpx;
}

.discussion-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.discussion-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.user-name {
	font-size: 26rpx;
	color: #666666;
	font-weight: 500;
}

.discussion-time {
	font-size: 24rpx;
	color: #999999;
}

.status-badge {
	padding: 8rpx 20rpx;
	font-size: 22rpx;
	border-radius: 16rpx;
}

.status-badge.pending {
	color: #ff9800;
	background: #fff3e0;
}

.status-badge.replied {
	color: #4caf50;
	background: #e8f5e9;
}

.discussion-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 15rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.discussion-content {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.6;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	margin-bottom: 20rpx;
}

.discussion-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.message-title {
	font-size: 24rpx;
	color: #999999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	margin-right: 20rpx;
}

.discussion-stats {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.stat-item {
	font-size: 24rpx;
	color: #999999;
}

.visibility-badge {
	font-size: 22rpx;
	color: #ff9800;
}

.load-more,
.no-more {
	text-align: center;
	padding: 30rpx 0;
}

.load-more-text,
.no-more-text {
	font-size: 26rpx;
	color: #999999;
}
</style>
