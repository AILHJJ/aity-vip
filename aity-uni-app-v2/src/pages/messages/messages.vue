<template>
	<view class="messages-container">
		<!-- 管理员操作栏 -->
		<view v-if="userStore.isAdmin && userInfoLoaded" class="admin-bar">
			<button class="create-btn" @click="goToCreate">
				<text class="create-icon">✏️</text>
				<text class="create-text">发布消息</text>
			</button>
		</view>

		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<text class="search-icon">🔍</text>
				<input
					class="search-input"
					v-model="searchKeyword"
					type="text"
					placeholder="搜索消息标题或内容"
					placeholder-style="color: #999999"
					@confirm="handleSearch"
				/>
				<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
			</view>
			<button class="search-btn" @click="handleSearch">搜索</button>
		</view>

		<!-- 筛选栏 -->
		<view class="filter-bar">
			<scroll-view class="filter-scroll" scroll-x show-scrollbar="false">
				<view class="filter-items">
					<view
						v-for="tag in filterTags"
						:key="tag.value"
						class="filter-item"
						:class="{ active: activeTag === tag.value }"
						@click="handleTagFilter(tag.value)"
					>
						{{ tag.label }}
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 消息列表 -->
		<scroll-view
			class="messages-scroll"
			scroll-y
			@scrolltolower="loadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 加载中 -->
			<view v-if="loading && messages.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="messages.length === 0" class="empty-state">
				<text class="empty-icon">📭</text>
				<text class="empty-text">暂无消息</text>
			</view>

			<!-- 消息列表 -->
			<view v-else class="messages-list">
				<view
					v-for="message in filteredMessages"
					:key="message.id"
					class="message-item"
					@click="goToDetail(message.id)"
				>
					<view class="message-header">
						<view class="message-type-badge" :class="'type-' + message.type">
							{{ getMessageTypeLabel(message.type) }}
						</view>
						<text class="message-time">{{ formatFriendlyTime(message.createdAt) }}</text>
					</view>

					<view class="message-title">{{ message.title }}</view>

					<view class="message-content">{{ message.content }}</view>

					<view class="message-footer">
						<view class="message-tags">
							<text
								v-for="tag in message.tags"
								:key="tag"
								class="message-tag"
							>
								{{ getTagLabel(tag) }}
							</text>
						</view>
						<view class="message-stats">
							<text class="stat-item">👁 {{ message.readCount || 0 }}</text>
							<text class="stat-item">💬 {{ message.discussionCount || 0 }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && !loading" class="load-more">
				<text class="load-more-text">加载更多...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && messages.length > 0" class="no-more">
				<text class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>

		<!-- 管理员发布按钮 -->
		<view v-if="userStore.isAdmin && userInfoLoaded" class="fab-button" @click="goToCreate">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onShow } from 'vue'
import { useUserStore } from '../../store/user'
import { getMessagesApi } from '../../api/message'
import { MESSAGE_TYPE_LABELS, MESSAGE_TAGS, MESSAGE_TAG_LABELS } from '../../utils/constants'
import { formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 数据
const messages = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)
const activeTag = ref('')
const searchKeyword = ref('')
const userInfoLoaded = ref(false) // 用户信息加载状态

// 筛选标签
const filterTags = computed(() => {
	const tags = [
		{ label: '全部', value: '' }
	]

	// 根据用户角色显示不同的标签
	if (userStore.isAdmin) {
		tags.push(
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM], value: MESSAGE_TAGS.SHORT_TERM },
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM], value: MESSAGE_TAGS.MID_TERM },
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.ALL_USERS], value: MESSAGE_TAGS.ALL_USERS }
		)
	} else if (userStore.userRole === 'vip_short') {
		tags.push(
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM], value: MESSAGE_TAGS.SHORT_TERM },
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.ALL_USERS], value: MESSAGE_TAGS.ALL_USERS }
		)
	} else if (userStore.userRole === 'vip_mid') {
		tags.push(
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM], value: MESSAGE_TAGS.MID_TERM },
			{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.ALL_USERS], value: MESSAGE_TAGS.ALL_USERS }
		)
	}

	return tags
})

// 根据用户角色和搜索关键词过滤消息
const filteredMessages = computed(() => {
	let filtered = messages.value

	// 权限过滤：根据用户角色过滤消息
	const userRole = userStore.userRole
	if (userRole === 'vip_mid') {
		// VIP中线用户：只显示包含"中线策略"或"全部用户"标签的消息
		filtered = filtered.filter(msg => {
			return msg.tags && (
				msg.tags.includes(MESSAGE_TAGS.MID_TERM) ||
				msg.tags.includes(MESSAGE_TAGS.ALL_USERS)
			)
		})
	} else if (userRole === 'vip_short') {
		// VIP短线用户：只显示包含"短线策略"或"全部用户"标签的消息
		filtered = filtered.filter(msg => {
			return msg.tags && (
				msg.tags.includes(MESSAGE_TAGS.SHORT_TERM) ||
				msg.tags.includes(MESSAGE_TAGS.ALL_USERS)
			)
		})
	}
	// trial、admin、super_admin 显示所有消息，不需要过滤

	// 搜索过滤：根据关键词过滤标题和内容
	if (searchKeyword.value.trim()) {
		const keyword = searchKeyword.value.trim().toLowerCase()
		filtered = filtered.filter(msg => {
			const title = (msg.title || '').toLowerCase()
			const content = (msg.content || '').toLowerCase()
			return title.includes(keyword) || content.includes(keyword)
		})
	}

	return filtered
})

// 获取消息类型标签
const getMessageTypeLabel = (type) => {
	return MESSAGE_TYPE_LABELS[type] || type
}

// 获取标签标签
const getTagLabel = (tag) => {
	return MESSAGE_TAG_LABELS[tag] || tag
}

// 加载消息列表
const loadMessages = async (isRefresh = false) => {
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

		if (activeTag.value) {
			params.tag = activeTag.value
		}

		const res = await getMessagesApi(params)

		if (res.success) {
			// 后端返回格式: { success: true, data: [...], pagination: { total, page, limit, pages } }
			const messageList = res.data || []
			const total = res.pagination?.total || 0

			if (isRefresh) {
				messages.value = messageList
			} else {
				messages.value = [...messages.value, ...messageList]
			}

			// 判断是否还有更多
			hasMore.value = messages.value.length < total
		} else {
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载消息失败:', error)
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
	loadMessages(true)
}

// 加载更多
const loadMore = () => {
	if (!hasMore.value || loading.value) return
	page.value++
	loadMessages()
}

// 标签筛选
const handleTagFilter = (tag) => {
	activeTag.value = tag
	loadMessages(true)
}

// 搜索
const handleSearch = () => {
	// 搜索在客户端进行过滤，不需要重新加载
	// 如果需要服务端搜索，可以在这里调用 loadMessages(true)
}

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = ''
}

// 跳转到详情
const goToDetail = (id) => {
	uni.navigateTo({
		url: `/pages/message-detail/message-detail?id=${id}`
	})
}

// 跳转到创建页面
const goToCreate = () => {
	uni.navigateTo({
		url: '/pages/create-message/create-message'
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

	loadMessages(true)
})

// 监听页面显示（从详情页返回时刷新）
onShow(() => {
	// 每次显示页面时刷新用户信息和消息列表
	if (userInfoLoaded.value) {
		userStore.fetchUserInfo().catch(err => {
			console.error('刷新用户信息失败:', err)
		})

		if (messages.value.length > 0) {
			loadMessages(true)
		}
	}
})
</script>

<style lang="scss" scoped>
.messages-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.admin-bar {
	padding: 20rpx;
	background: #ffffff;
	border-bottom: 1rpx solid #e0e0e0;
}

.create-btn {
	width: 100%;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 40rpx;
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.create-icon {
	font-size: 32rpx;
}

.create-text {
	font-size: 30rpx;
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
	background: #ffffff;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #e0e0e0;
}

.filter-scroll {
	white-space: nowrap;
}

.filter-items {
	display: inline-flex;
	padding: 0 20rpx;
}

.filter-item {
	display: inline-block;
	padding: 12rpx 30rpx;
	margin-right: 20rpx;
	font-size: 28rpx;
	color: #666666;
	background: #f5f5f5;
	border-radius: 30rpx;
	transition: all 0.3s;
}

.filter-item.active {
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.messages-scroll {
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

.messages-list {
	padding: 20rpx;
}

.message-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.message-header {
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

.message-time {
	font-size: 24rpx;
	color: #999999;
}

.message-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 15rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-content {
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

.message-footer {
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

.message-stats {
	display: flex;
	gap: 20rpx;
}

.stat-item {
	font-size: 24rpx;
	color: #999999;
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
