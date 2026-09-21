<template>
	<view class="my-discussions-container">
		<!-- 内容区域 -->
		<scroll-view
			class="content-scroll"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 筛选栏 -->
			<view class="filter-bar">
				<view class="filter-tab" :class="{ active: !showUnreadOnly }" @click="showUnreadOnly && toggleUnreadFilter()">
					<text>全部</text>
				</view>
				<view class="filter-tab" :class="{ active: showUnreadOnly }" @click="!showUnreadOnly && toggleUnreadFilter()">
					<text>只看新回复</text>
				</view>
			</view>

			<!-- 加载中 -->
			<view v-if="loading && discussions.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="discussions.length === 0" class="empty-state">
				<text class="empty-icon">💬</text>
				<text class="empty-text">{{ showUnreadOnly ? '没有新回复' : '暂无讨论' }}</text>
				<text class="empty-hint">{{ showUnreadOnly ? '你的帖子暂时没有新回复' : '快去发起一个讨论吧' }}</text>
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
							<view v-if="discussion.unreadCount > 0" class="unread-badge">
								{{ discussion.unreadCount }} 条新回复
							</view>
						</view>
						<text class="discussion-time">{{ formatFriendlyTime(discussion.lastReplyAt || discussion.createdAt) }}</text>
					</view>

					<view class="discussion-title">{{ discussion.title }}</view>

					<view class="discussion-content">{{ discussion.content }}</view>

					<!-- 最新回复摘要 -->
					<view v-if="discussion.lastReplyContent" class="reply-summary">
						<text class="summary-tag" :class="discussion.lastReplyIsAdmin ? 'admin' : ''">
							{{ discussion.lastReplyIsAdmin ? '官方回复' : '回复' }}
						</text>
						<text class="summary-text">{{ discussion.lastReplyUserName }}：{{ discussion.lastReplyContent }}</text>
					</view>

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

		</scroll-view>

		<!-- 创建按钮 -->
		<view class="fab-button" @click="goToCreate">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getMyDiscussionsApi, deleteDiscussionApi, markRepliesSeenApi } from '../../api/discussion'
import { formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 进入"我的讨论"页 = 已查看回复提醒 → 标记已读 + 清交流 tab 角标
onShow(() => {
	markRepliesSeenApi().catch(() => {})
	uni.removeTabBarBadge({ index: 1, fail: () => {} })
})

// 数据
const discussions = ref([])
const loading = ref(false)
const refreshing = ref(false)
const showUnreadOnly = ref(false)

// 加载讨论列表（后端全量返回，带可选"只看新回复"筛选）
const loadDiscussions = async (isRefresh = false) => {
	if (loading.value) return
	loading.value = true

	try {
		const params = {}
		if (showUnreadOnly.value) params.filter = 'unread'

		const res = await getMyDiscussionsApi(params)

		if (res.success || res.code === 200) {
			discussions.value = res.data.discussions || res.data.list || []
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

// 切换筛选
const toggleUnreadFilter = () => {
	showUnreadOnly.value = !showUnreadOnly.value
	loadDiscussions()
}

// 下拉刷新
const onRefresh = () => {
	refreshing.value = true
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
					// 显示 loading
					uni.showLoading({
						title: '删除中...',
						mask: true
					})

					try {
						const result = await deleteDiscussionApi(id)

						if (result.success || result.code === 200) {
							uni.hideLoading()
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})

							// 刷新列表以确保数据一致性
							await loadDiscussions(true)
						} else {
							throw new Error(result.message || '删除失败')
						}
					} catch (error) {
						uni.hideLoading()
						console.error('删除讨论失败:', error)
						uni.showToast({
							title: error.message || '删除失败',
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

/* 筛选栏 */
.filter-bar {
	display: flex;
	gap: 16rpx;
	padding: 20rpx;
	background: #ffffff;
	border-bottom: 2rpx solid #f0f0f0;
}

.filter-tab {
	padding: 10rpx 28rpx;
	border-radius: 999rpx;
	background: #f1f5f9;
	font-size: 24rpx;
	color: #64748b;
}

.filter-tab.active {
	background: #667eea;
	color: #ffffff;
	font-weight: 600;
}

/* 未读角标 */
.unread-badge {
	padding: 6rpx 14rpx;
	font-size: 22rpx;
	border-radius: 12rpx;
	color: #ffffff;
	background: #f5222d;
	font-weight: 600;
}

/* 最新回复摘要 */
.reply-summary {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	margin-bottom: 20rpx;
	padding: 16rpx 20rpx;
	background: #f8f9ff;
	border-radius: 12rpx;
	border-left: 6rpx solid #667eea;
}

.summary-tag {
	flex-shrink: 0;
	padding: 2rpx 12rpx;
	font-size: 20rpx;
	border-radius: 8rpx;
	color: #667eea;
	background: #eef0ff;
}

.summary-tag.admin {
	color: #b45309;
	background: #fef3c7;
}

.summary-text {
	font-size: 24rpx;
	color: #666666;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
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

/* #ifdef H5 */
@media (min-width: 769px) {
	.my-discussions-container {
		max-width: 1000px;
		margin: 0 auto;
	}
}
/* #endif */


/* #ifdef H5 */
@media (min-width: 769px) {
	.fab-button {
		/* 宽屏对齐 1280px 内容区右边缘；窄窗口（如通达信嵌入）退回贴边 20px，保证始终可见 */
		right: max(20px, calc((100vw - 1280px) / 2 + 30px)) !important;
		font-size: 48rpx !important;
		width: 96rpx !important;
		height: 96rpx !important;
	}

	.fab-icon {
		font-size: 56rpx !important;
	}
}
/* #endif */
</style>
