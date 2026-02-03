<template>
	<view class="discussions-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<text class="search-icon">🔍</text>
				<input
					class="search-input"
					v-model="searchKeyword"
					type="text"
					placeholder="搜索讨论标题或内容"
					placeholder-style="color: #999999"
					@confirm="handleSearch"
				/>
				<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
			</view>
			<button class="search-btn" @click="handleSearch">搜索</button>
		</view>

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
			refresher-background="#f5f5f5"
		>
			<!-- 下拉刷新提示 -->
			<view v-if="refreshing" class="refresh-tip">
				<view class="refresh-loading"></view>
				<text class="refresh-text">正在刷新...</text>
			</view>

			<!-- 加载中 -->
			<view v-if="loading && discussions.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<empty-state v-else-if="filteredDiscussions.length === 0" type="discussion" />

			<!-- 搜索无结果 -->
			<empty-state v-else-if="filteredDiscussions.length === 0 && searchKeyword" type="no-result" />

			<!-- 讨论列表 -->
			<view v-else class="discussions-list">
				<view
					v-for="discussion in filteredDiscussions"
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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getDiscussionsApi } from '../../api/discussion'
import { formatFriendlyTime } from '../../utils/time'
import EmptyState from '@/components/empty-state.vue'

const userStore = useUserStore()

// 数据
const discussions = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)
const activeFilter = ref('')
const searchKeyword = ref('')
const userInfoLoaded = ref(false) // 用户信息加载状态

// 筛选选项
const filters = ref([
	{ label: '全部', value: '' },
	{ label: '待回复', value: 'pending' },
	{ label: '已回复', value: 'replied' }
])

// 根据权限和搜索关键词过滤讨论
const filteredDiscussions = computed(() => {
	let filtered = discussions.value

	// 权限过滤：私密讨论只有管理员和发起者可见
	if (!userStore.isAdmin) {
		filtered = filtered.filter(discussion => {
			// 公开讨论所有人可见
			if (discussion.visibility === 'public') {
				return true
			}
			// 私密讨论只有发起者可见
			if (discussion.visibility === 'private') {
				return discussion.creatorId === userStore.userInfo?.id
			}
			return true
		})
	}

	// 搜索过滤：根据关键词过滤标题和内容
	if (searchKeyword.value.trim()) {
		const keyword = searchKeyword.value.trim().toLowerCase()
		filtered = filtered.filter(discussion => {
			const title = (discussion.title || '').toLowerCase()
			const content = (discussion.content || '').toLowerCase()
			return title.includes(keyword) || content.includes(keyword)
		})
	}

	return filtered
})

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

// 搜索
const handleSearch = () => {
	// 搜索在客户端进行过滤，不需要重新加载
}

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = ''
}

// 跳转到详情
const goToDetail = (id) => {
	uni.navigateTo({
		url: `/pages/discussion-detail/discussion-detail?id=${id}`
	})
}

// 页面加载
onMounted(async () => {
	// 检查登录状态
	if (!userStore.isLoggedIn) {
		uni.reLaunch({
			url: '/pages/login/login'
		})
		return
	}

	// 强制刷新用户信息，确保权限正确
	try {
		await userStore.fetchUserInfo()

		// 开发环境调试日志
		if (process.env.NODE_ENV === 'development') {
			console.log('=== 用户信息加载完成 ===')
			console.log('用户名:', userStore.userName)
			console.log('用户角色:', userStore.userRole)
			console.log('是否管理员:', userStore.isAdmin)
		}

		userInfoLoaded.value = true
	} catch (error) {
		console.error('获取用户信息失败:', error)
		uni.showToast({
			title: '获取用户信息失败',
			icon: 'none'
		})
		return
	}

	loadDiscussions(true)
})
</script>

<style lang="scss" scoped>
.discussions-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.search-bar {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 20rpx;
	background: #ffffff;
	border-bottom: 1rpx solid #e0e0e0;
}

.search-input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	height: 70rpx;
	padding: 0 20rpx;
	background: #f5f5f5;
	border-radius: 35rpx;
}

.search-icon {
	font-size: 32rpx;
	margin-right: 10rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	background: transparent;
}

.clear-icon {
	font-size: 40rpx;
	color: #999999;
	margin-left: 10rpx;
	line-height: 1;
}

.search-btn {
	width: 120rpx;
	height: 70rpx;
	line-height: 70rpx;
	padding: 0;
	font-size: 28rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 35rpx;
	text-align: center;
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

.refresh-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
	background: #f5f5f5;
}

.refresh-loading {
	width: 40rpx;
	height: 40rpx;
	border: 3rpx solid #e0e0e0;
	border-top-color: #667eea;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.refresh-text {
	margin-top: 15rpx;
	font-size: 24rpx;
	color: #999999;
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
	animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 0.6; }
	50% { opacity: 1; }
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
