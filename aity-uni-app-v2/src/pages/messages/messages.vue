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
					@focus="showSearchHistory = true"
				/>
				<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
			</view>
			<button class="search-btn" @click="handleSearch">搜索</button>
		</view>

		<!-- 搜索历史弹窗 -->
		<view v-if="showSearchHistory && searchHistory.length > 0" class="search-history-panel">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text class="history-clear" @click="handleClearHistory">清空</text>
			</view>
			<view class="history-list">
				<view
					v-for="(item, index) in searchHistory"
					:key="index"
					class="history-item"
					@click="handleSelectHistory(item)"
				>
					<text class="history-text">{{ item }}</text>
					<text class="history-remove" @click.stop="handleRemoveHistory(item)">×</text>
				</view>
			</view>
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
			refresher-background="#f5f5f5"
		>
			<!-- 下拉刷新提示 -->
			<view v-if="refreshing" class="refresh-tip">
				<view class="refresh-loading"></view>
				<text class="refresh-text">正在刷新...</text>
			</view>

			<!-- 骨架屏加载 -->
			<message-skeleton v-if="loading && messages.length === 0" :count="5" />

			<!-- 加载中 -->
			<view v-else-if="loading && messages.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<empty-state v-else-if="messages.length === 0" type="message" />

			<!-- 搜索无结果 -->
			<empty-state v-else-if="filteredMessages.length === 0 && searchKeyword" type="no-result" />

			<!-- 消息列表 -->
			<view v-else class="messages-list">
				<view
					v-for="message in filteredMessages"
					:key="message.id"
					class="message-item"
					:class="{ unread: isMessageUnread(message.id) }"
					@click="goToDetail(message.id)"
				>
					<view class="message-header">
						<view class="message-type-badge" :class="'type-' + message.type">
							{{ getMessageTypeLabel(message.type) }}
						</view>
						<view class="header-right">
							<view v-if="isMessageUnread(message.id)" class="unread-dot"></view>
							<text class="message-time">{{ formatFriendlyTime(message.createdAt) }}</text>
						</view>
					</view>

					<view class="message-title">{{ message.title }}</view>

					<view class="message-content">{{ message.content }}</view>

					<view class="message-footer">
						<view class="message-tags">
							<view
								v-for="tag in message.tags"
								:key="tag"
								class="message-tag"
								:class="getTagClass(tag)"
							>
								<text class="tag-icon">{{ getTagIcon(tag) }}</text>
								<text class="tag-text">{{ getTagLabel(tag) }}</text>
							</view>
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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getMessagesApi } from '../../api/message'
import { MESSAGE_TYPE_LABELS, MESSAGE_TAGS, MESSAGE_TAG_LABELS } from '../../utils/constants'
import { formatFriendlyTime } from '../../utils/time'
import { getSearchHistory, addSearchHistory, clearSearchHistory, removeSearchHistory } from '../../utils/search-history'
import { isMessageRead, markAsRead, getUnreadCount } from '../../utils/read-status'
import MessageSkeleton from '@/components/message-skeleton.vue'
import EmptyState from '@/components/empty-state.vue'

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
const showSearchHistory = ref(false) // 显示搜索历史
const searchHistory = ref([]) // 搜索历史列表

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

// 获取标签样式类名
const getTagClass = (tag) => {
	// 处理不同的tag值格式
	const tagMap = {
		'short_term': 'tag-short-term',
		'mid_term': 'tag-mid-term',
		'all_users': 'tag-all-users',
		// 兼容旧格式
		[MESSAGE_TAGS.SHORT_TERM]: 'tag-short-term',
		[MESSAGE_TAGS.MID_TERM]: 'tag-mid-term',
		[MESSAGE_TAGS.ALL_USERS]: 'tag-all-users'
	}
	return tagMap[tag] || 'tag-default'
}

// 获取标签图标
const getTagIcon = (tag) => {
	const iconMap = {
		'short_term': '⚡',
		'mid_term': '📈',
		'all_users': '👥'
	}
	return iconMap[tag] || ''
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

			// 更新未读消息数
			updateUnreadCount()

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

// 更新未读消息数
const updateUnreadCount = () => {
	const allMessageIds = messages.value.map(msg => msg.id)
	const unreadCount = getUnreadCount(allMessageIds)
	userStore.setUnreadCount(unreadCount)
}

// 检查消息是否未读
const isMessageUnread = (messageId) => {
	return !isMessageRead(messageId)
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
	if (searchKeyword.value.trim()) {
		addSearchHistory(searchKeyword.value.trim())
		searchHistory.value = getSearchHistory()
	}
	showSearchHistory.value = false
	// 搜索在客户端进行过滤，不需要重新加载
}

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = ''
}

// 选择搜索历史
const handleSelectHistory = (keyword) => {
	searchKeyword.value = keyword
	showSearchHistory.value = false
	handleSearch()
}

// 清除搜索历史
const handleClearHistory = () => {
	uni.showModal({
		title: '清空搜索历史',
		content: '确定要清空所有搜索历史吗？',
		success: (res) => {
			if (res.confirm) {
				clearSearchHistory()
				searchHistory.value = []
			}
		}
	})
}

// 删除单条搜索历史
const handleRemoveHistory = (keyword) => {
	removeSearchHistory(keyword)
	searchHistory.value = getSearchHistory()
}

// 跳转到详情
const goToDetail = (id) => {
	// 标记为已读
	markAsRead(id)
	updateUnreadCount()

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

	// 加载搜索历史
	searchHistory.value = getSearchHistory()

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

.messages-list {
	padding: 20rpx;
}

.message-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	border-left: 4rpx solid transparent;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	&:active {
		transform: scale(0.98);
		border-left-color: #667eea;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	}

	// 未读状态
	&.unread {
		background: linear-gradient(to right, #f8f9ff, #ffffff);
		border-left-color: #667eea;
	}
}

.message-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.unread-dot {
	width: 16rpx;
	height: 16rpx;
	background: #ff5252;
	border-radius: 50%;
	animation: unread-pulse 2s ease-in-out infinite;
}

@keyframes unread-pulse {
	0%, 100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.6;
		transform: scale(1.1);
	}
}

.message-type-badge {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	color: #ffffff;
	border-radius: 20rpx;
	font-weight: 500;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);

	// 为不同类型设置不同的渐变色
	&.type-pre_market_comment {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
	}

	&.type-morning_comment {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		box-shadow: 0 2rpx 8rpx rgba(79, 172, 254, 0.3);
	}

	&.type-morning_focus {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
		box-shadow: 0 2rpx 8rpx rgba(67, 233, 123, 0.3);
	}

	&.type-afternoon_comment {
		background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
		box-shadow: 0 2rpx 8rpx rgba(250, 112, 154, 0.3);
	}

	&.type-afternoon_focus {
		background: linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%);
		box-shadow: 0 2rpx 8rpx rgba(255, 154, 86, 0.3);
	}

	&.type-close_comment {
		background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
		box-shadow: 0 2rpx 8rpx rgba(161, 140, 209, 0.3);
	}

	&.type-risk_warning {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		box-shadow: 0 2rpx 8rpx rgba(240, 147, 251, 0.3);
	}

	&.type-system {
		background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
		box-shadow: 0 2rpx 8rpx rgba(149, 165, 166, 0.3);
	}

	&.type-important {
		background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
		box-shadow: 0 2rpx 8rpx rgba(253, 160, 133, 0.3);
	}

	&.type-daily {
		background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
		box-shadow: 0 2rpx 8rpx rgba(102, 166, 255, 0.3);
	}
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
	gap: 12rpx;
}

.message-tag {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 10rpx 20rpx;
	border-radius: 16rpx;
	font-size: 22rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	white-space: nowrap;

	// 默认标签
	&.tag-default {
		background: #f5f5f5;
		color: #999999;
	}

	// 全部用户 - 紫色
	&.tag-all-users {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
		color: #667eea;
		border: 1rpx solid rgba(102, 126, 234, 0.25);
	}

	// 中线策略 - 蓝色
	&.tag-mid-term {
		background: linear-gradient(135deg, rgba(79, 172, 254, 0.12) 0%, rgba(0, 242, 254, 0.12) 100%);
		color: #4facfe;
		border: 1rpx solid rgba(79, 172, 254, 0.25);
	}

	// 短线策略 - 绿色
	&.tag-short-term {
		background: linear-gradient(135deg, rgba(67, 233, 123, 0.12) 0%, rgba(56, 249, 215, 0.12) 100%);
		color: #43e97b;
		border: 1rpx solid rgba(67, 233, 123, 0.25);
	}
}

.tag-icon {
	font-size: 20rpx;
	line-height: 1;
}

.tag-text {
	display: block;
	line-height: 1;
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

// 搜索历史面板
.search-history-panel {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: #ffffff;
	border-radius: 0 0 16rpx 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
	padding: 20rpx;
	max-height: 600rpx;
	overflow-y: auto;
}

.history-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	padding-bottom: 15rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.history-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333333;
}

.history-clear {
	font-size: 26rpx;
	color: #667eea;
	padding: 8rpx 16rpx;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.history-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 20rpx;
	background: #f5f5f5;
	border-radius: 8rpx;
	transition: all 0.3s;

	&:active {
		background: #e0e0e0;
	}
}

.history-text {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.history-remove {
	font-size: 36rpx;
	color: #999999;
	padding: 0 10rpx;
	line-height: 1;
}
</style>
