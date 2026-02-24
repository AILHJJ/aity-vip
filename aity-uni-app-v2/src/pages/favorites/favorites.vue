<template>
	<view class="favorites-container">
		<!-- 标签切换 -->
		<view class="tabs-bar">
			<view
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: activeTab === tab.value }"
				@click="handleTabChange(tab.value)"
			>
				{{ tab.label }}
			</view>
		</view>

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
			<view v-if="loading && list.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="list.length === 0" class="empty-state">
				<text class="empty-icon">⭐</text>
				<text class="empty-text">暂无收藏</text>
			</view>

			<!-- 消息收藏列表 -->
			<view v-else-if="activeTab === 'message'" class="list-container">
				<view
					v-for="item in list"
					:key="item.id"
					class="message-item"
					@click="goToMessageDetail(item.id)"
				>
					<view class="message-header">
						<view class="message-type-badge" :class="'type-' + item.type">
							{{ getMessageTypeLabel(item.type) }}
						</view>
						<text class="message-time">{{ formatFriendlyTime(item.createdAt) }}</text>
					</view>

					<view class="message-title">{{ item.title }}</view>

					<view class="message-content">{{ item.content }}</view>

					<view class="message-footer">
						<view v-if="item.tags && item.tags.length > 0" class="message-tags">
							<text
								v-for="tag in item.tags"
								:key="tag"
								class="message-tag"
							>
								{{ MESSAGE_TAG_LABELS[tag] || tag }}
							</text>
						</view>
						<view class="action-btn" @click.stop="handleUnfavorite(item.id, 'message')">
							<text class="action-icon">⭐</text>
							<text class="action-text">取消收藏</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 讨论收藏列表 -->
			<view v-else class="list-container">
				<view
					v-for="item in list"
					:key="item.id"
					class="discussion-item"
					@click="goToDiscussionDetail(item.id)"
				>
					<view class="discussion-header">
						<view class="user-info">
							<text class="user-name">{{ item.creatorName }}</text>
							<text class="discussion-time">{{ formatFriendlyTime(item.createdAt) }}</text>
						</view>
						<view class="visibility-badge" :class="'visibility-' + item.visibility">
							{{ item.visibility === 'public' ? '公开' : '私密' }}
						</view>
					</view>

					<view class="discussion-title">{{ item.title }}</view>

					<view class="discussion-content">{{ item.content }}</view>

					<view class="discussion-footer">
						<view class="discussion-stats">
							<text class="stat-item">💬 {{ item.replyCount || 0 }} 回复</text>
						</view>
						<view class="action-btn" @click.stop="handleUnfavorite(item.id, 'discussion')">
							<text class="action-icon">⭐</text>
							<text class="action-text">取消收藏</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && !loading" class="load-more">
				<text class="load-more-text">加载更多...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && list.length > 0" class="no-more">
				<text class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getFavoriteMessagesApi, unfavoriteMessageApi } from '../../api/message'
import { getFavoriteDiscussionsApi, unfavoriteDiscussionApi } from '../../api/discussion'
import { MESSAGE_TYPE_LABELS, MESSAGE_TAG_LABELS } from '../../utils/constants'
import { formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 标签
const tabs = [
	{ label: '消息收藏', value: 'message' },
	{ label: '讨论收藏', value: 'discussion' }
]

// 数据
const activeTab = ref('message')
const list = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

// 获取消息类型标签
const getMessageTypeLabel = (type) => {
	return MESSAGE_TYPE_LABELS[type] || type
}

// 加载列表
const loadList = async (isRefresh = false) => {
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

		let res
		if (activeTab.value === 'message') {
			res = await getFavoriteMessagesApi(params)
		} else {
			res = await getFavoriteDiscussionsApi(params)
		}

		if (res.success) {
			// 统一使用 data.list 格式
			const newData = res.data.list || []

			if (isRefresh) {
				list.value = newData
			} else {
				list.value = [...list.value, ...newData]
			}

			// 判断是否还有更多
			hasMore.value = list.value.length < res.data.total
		} else {
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载收藏列表失败:', error)
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
	loadList(true)
}

// 加载更多
const loadMore = () => {
	if (!hasMore.value || loading.value) return
	page.value++
	loadList()
}

// 切换标签
const handleTabChange = (tab) => {
	if (activeTab.value === tab) return
	activeTab.value = tab
	loadList(true)
}

// 取消收藏
const handleUnfavorite = async (id, type) => {
	try {
		uni.showModal({
			title: '提示',
			content: '确定要取消收藏吗？',
			success: async (res) => {
				if (res.confirm) {
					let result
					if (type === 'message') {
						result = await unfavoriteMessageApi(id)
					} else {
						result = await unfavoriteDiscussionApi(id)
					}

					if (result.success) {
						uni.showToast({
							title: '已取消收藏',
							icon: 'success'
						})
						// 从列表中移除
						list.value = list.value.filter(item => item.id !== id)
					} else {
						uni.showToast({
							title: result.message || '操作失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} catch (error) {
		console.error('取消收藏失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 跳转到消息详情
const goToMessageDetail = (id) => {
	uni.navigateTo({
		url: `/pages/message-detail/message-detail?id=${id}`
	})
}

// 跳转到讨论详情
const goToDiscussionDetail = (id) => {
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

	loadList(true)
})
</script>

<style lang="scss" scoped>
.favorites-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.tabs-bar {
	display: flex;
	background: #ffffff;
	border-bottom: 1rpx solid #e0e0e0;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 30rpx 0;
	font-size: 30rpx;
	color: #666666;
	position: relative;
	transition: all 0.3s;
}

.tab-item.active {
	color: #667eea;
	font-weight: bold;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 4rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 2rpx;
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
}

.list-container {
	padding: 20rpx;
}

.message-item,
.discussion-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.message-header,
.discussion-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.message-type-badge {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	color: #ffffff;
	border-radius: 20rpx;
	background: #667eea;
}

.message-time,
.discussion-time {
	font-size: 24rpx;
	color: #999999;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.user-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.visibility-badge {
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

.message-title,
.discussion-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 15rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-content,
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

.message-footer,
.discussion-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.message-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.message-tag {
	padding: 6rpx 16rpx;
	font-size: 22rpx;
	color: #667eea;
	background: #f0f2ff;
	border-radius: 12rpx;
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
	background: #fff7e6;
	border-radius: 20rpx;
}

.action-icon {
	font-size: 24rpx;
}

.action-text {
	font-size: 24rpx;
	color: #faad14;
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
