<template>
	<view class="my-discussions-container">
		<!-- 内容区域 -->
		<scroll-view
			class="content-scroll"
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
				<text class="empty-hint">快去发起一个讨论吧</text>
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
						<view class="header-left">
							<view class="visibility-badge" :class="'visibility-' + discussion.visibility">
								{{ discussion.visibility === 'public' ? '公开' : '私密' }}
							</view>
							<view class="status-badge" :class="'status-' + discussion.status">
								{{ discussion.status === 'replied' ? '已回复' : '待回复' }}
							</view>
						</view>
						<text class="discussion-time">{{ formatFriendlyTime(discussion.createdAt) }}</text>
					</view>

					<view class="discussion-title">{{ discussion.title }}</view>

					<view class="discussion-content">{{ discussion.content }}</view>

					<view class="discussion-footer">
						<view class="discussion-stats">
							<text class="stat-item">💬 {{ discussion.replyCount || 0 }} 回复</text>
							<text class="stat-item">👁 {{ discussion.viewCount || 0 }} 查看</text>
						</view>
						<view class="action-btn" @click.stop="handleDelete(discussion.id)">
							<text class="action-icon">🗑</text>
							<text class="action-text">删除</text>
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

		<!-- 创建按钮 -->
		<view class="fab-button" @click="goToCreate">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getMyDiscussionsApi, deleteDiscussionApi } from '../../api/discussion'
import { formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 数据
const discussions = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

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

		const res = await getMyDiscussionsApi(params)

		if (res.success) {
			const newData = res.data.discussions || res.data.list || []

			if (isRefresh) {
				discussions.value = newData
			} else {
				discussions.value = [...discussions.value, ...newData]
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
		console.error('加载讨论列表失败:', error)
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

// 删除讨论
const handleDelete = async (id) => {
	try {
		uni.showModal({
			title: '提示',
			content: '确定要删除这个讨论吗？删除后无法恢复。',
			success: async (res) => {
				if (res.confirm) {
					const result = await deleteDiscussionApi(id)

					if (result.success) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 从列表中移除
						discussions.value = discussions.value.filter(item => item.id !== id)
					} else {
						uni.showToast({
							title: result.message || '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} catch (error) {
		console.error('删除讨论失败:', error)
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		})
	}
}

// 跳转到详情
const goToDetail = (id) => {
	uni.navigateTo({
		url: `/pages/discussion-detail/discussion-detail?id=${id}`
	})
}

// 跳转到创建页面
const goToCreate = () => {
	uni.navigateTo({
		url: '/pages/create-discussion/create-discussion'
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
</script>

<style lang="scss" scoped>
.my-discussions-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.content-scroll {
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
	margin-bottom: 10rpx;
}

.empty-hint {
	font-size: 24rpx;
	color: #cccccc;
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

.header-left {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.visibility-badge,
.status-badge {
	padding: 6rpx 16rpx;
	font-size: 22rpx;
	border-radius: 12rpx;
}

.visibility-public {
	color: #52c41a;
	background: #f6ffed;
}

.visibility-private {
	color: #faad14;
	background: #fffbe6;
}

.status-replied {
	color: #1890ff;
	background: #e6f7ff;
}

.status-pending {
	color: #ff4d4f;
	background: #fff1f0;
}

.discussion-time {
	font-size: 24rpx;
	color: #999999;
}

.discussion-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 15rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.discussion-content {
	font-size: 28rpx;
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
}

.discussion-stats {
	display: flex;
	gap: 20rpx;
}

.stat-item {
	font-size: 24rpx;
	color: #999999;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 20rpx;
	background: #fff1f0;
	border-radius: 20rpx;
}

.action-icon {
	font-size: 24rpx;
}

.action-text {
	font-size: 24rpx;
	color: #ff4d4f;
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

.fab-button {
	position: fixed;
	right: 40rpx;
	bottom: 120rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
	z-index: 999;
}

.fab-icon {
	font-size: 60rpx;
	color: #ffffff;
	font-weight: 300;
}
</style>
