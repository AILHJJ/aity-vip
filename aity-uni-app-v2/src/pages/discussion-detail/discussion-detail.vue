<template>
	<view class="discussion-detail-container">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 内容区域 -->
		<view v-else-if="discussion" class="content-wrapper">
			<scroll-view
				class="content-scroll"
				scroll-y
				:refresher-enabled="true"
				:refresher-triggered="refreshing"
				@refresherrefresh="onRefresh"
			>
				<!-- 讨论主体 -->
				<view class="discussion-main">
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
						<view class="user-info">
							<text class="user-name">{{ discussion.creatorName }}</text>
						</view>
						<view class="discussion-stats">
							<text class="stat-item">💬 {{ discussion.replyCount || 0 }}</text>
							<text class="stat-item">👁 {{ discussion.viewCount || 0 }}</text>
						</view>
					</view>

					<!-- 管理员操作 -->
					<view v-if="userStore.isAdmin" class="admin-actions">
						<picker
							mode="selector"
							:range="visibilityOptions"
							range-key="label"
							@change="handleVisibilityChange"
						>
							<view class="action-btn">
								<text class="action-text">修改可见性</text>
							</view>
						</picker>
					</view>
				</view>

				<!-- 回复列表 -->
				<view class="replies-section">
					<view class="section-title">
						<text class="title-text">全部回复 ({{ replies.length }})</text>
					</view>

					<!-- 空状态 -->
					<view v-if="replies.length === 0" class="empty-replies">
						<empty-state
							type="discussion"
							action-text="发起回复"
							@action="focusReplyInput"
						/>
					</view>

					<!-- 回复列表 -->
					<view v-else class="replies-list">
						<view
							v-for="reply in replies"
							:key="reply.id"
							class="reply-item"
						>
							<view class="reply-header">
								<text class="reply-user">{{ reply.userName }}</text>
								<text class="reply-time">{{ formatFriendlyTime(reply.createdAt) }}</text>
							</view>
							<view class="reply-content">{{ reply.content }}</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 回复输入框 -->
			<view class="reply-input-wrapper">
				<view class="reply-input-container">
					<textarea
						class="reply-input"
						v-model="replyContent"
						placeholder="输入你的回复..."
						placeholder-style="color: #999999"
						:maxlength="500"
						:show-confirm-bar="false"
					/>
					<button
						class="reply-btn"
						:disabled="!replyContent.trim() || submitting"
						@click="handleReply"
					>
						{{ submitting ? '发送中...' : '发送' }}
					</button>
				</view>
			</view>
		</view>

		<!-- 错误状态 -->
		<view v-else class="error-state">
			<text class="error-icon">❌</text>
			<text class="error-text">加载失败</text>
			<button class="retry-btn" @click="loadDiscussion">重试</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import EmptyState from '../../components/empty-state.vue'
import {
	getDiscussionDetailApi,
	getDiscussionRepliesApi,
	replyDiscussionApi,
	updateDiscussionVisibilityApi
} from '../../api/discussion'
import { formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 数据
const discussion = ref(null)
const replies = ref([])
const replyContent = ref('')
const loading = ref(false)
const refreshing = ref(false)
const submitting = ref(false)

// 用于跟踪是否需要刷新回复列表
const needRefreshReplies = ref(false)

// 可见性选项
const visibilityOptions = [
	{ label: '公开', value: 'public' },
	{ label: '私密', value: 'private' }
]

// 获取讨论ID
const getDiscussionId = () => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	return currentPage.options.id
}

// 加载讨论详情
const loadDiscussion = async () => {
	loading.value = true

	try {
		const id = getDiscussionId()
		const res = await getDiscussionDetailApi(id)

		console.log('[讨论详情] API响应:', res)

		if (res.code === 200 && res.data) {
			discussion.value = res.data

			// 权限检查：私密讨论只有管理员和发起者可见
			if (discussion.value.visibility === 'private') {
				const isCreator = discussion.value.creatorId === userStore.userInfo?.id
				if (!userStore.isAdmin && !isCreator) {
					uni.showToast({
						title: '无权限查看此讨论',
						icon: 'none',
						duration: 2000
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 2000)
					return
				}
			}

			loadReplies()
		} else {
			console.error('[讨论详情] 加载失败 - 响应:', res)
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('[讨论详情] 加载讨论详情失败:', error)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 加载回复列表
const loadReplies = async () => {
	try {
		const id = getDiscussionId()
		const res = await getDiscussionRepliesApi(id)

		console.log('[讨论回复] API响应:', res)

		if (res.code === 200) {
			// 后端返回的数据格式: { code: 200, message: "Success", data: [...] }
			// 后端已经提供了 userName 字段
			replies.value = res.data || []

			console.log('[讨论回复] 加载成功，回复数:', replies.value.length)
		} else {
			console.error('[讨论回复] 加载失败 - 响应:', res)
		}
	} catch (error) {
		console.error('[讨论回复] 加载回复列表失败:', error)
	}
}

// 下拉刷新
const onRefresh = async () => {
	refreshing.value = true
	await loadDiscussion()
	refreshing.value = false
}

// 发送回复
const handleReply = async () => {
	if (!replyContent.value.trim()) return

	submitting.value = true

	try {
		const id = getDiscussionId()
		const res = await replyDiscussionApi(id, {
			content: replyContent.value.trim()
		})

		console.log('[发送回复] API响应:', res)

		if (res.code === 200) {
			uni.showToast({
				title: '回复成功',
				icon: 'success',
				duration: 1500
			})

			// 清空输入框
			replyContent.value = ''

			// 重新加载回复列表
			await loadReplies()

			// 更新回复数
			if (discussion.value) {
				discussion.value.replyCount = (discussion.value.replyCount || 0) + 1
			}
		} else {
			console.error('[发送回复] 失败 - 响应:', res)
			uni.showToast({
				title: res.message || '回复失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('[发送回复] 错误:', error)
		uni.showToast({
			title: '回复失败',
			icon: 'none'
		})
	} finally {
		submitting.value = false
	}
}

// 聚焦回复输入框
const focusReplyInput = () => {
	uni.showToast({
		title: '请在下方输入回复内容',
		icon: 'none',
		duration: 1500
	})
	// 滚动到输入框位置
	setTimeout(() => {
		uni.pageScrollTo({
			scrollTop: 1000,
			duration: 300
		})
	}, 500)
}

// 修改可见性
const handleVisibilityChange = async (e) => {
	const index = e.detail.value
	const newVisibility = visibilityOptions[index].value

	if (newVisibility === discussion.value.visibility) return

	try {
		const id = getDiscussionId()
		const res = await updateDiscussionVisibilityApi(id, {
			visibility: newVisibility
		})

		console.log('[修改可见性] API响应:', res)

		if (res.code === 200) {
			uni.showToast({
				title: '修改成功',
				icon: 'success'
			})
			discussion.value.visibility = newVisibility
		} else {
			console.error('[修改可见性] 失败 - 响应:', res)
			uni.showToast({
				title: res.message || '修改失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('[修改可见性] 错误:', error)
		uni.showToast({
			title: '修改失败',
			icon: 'none'
		})
	}
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

	loadDiscussion()
})

// 页面显示时刷新回复列表（如果需要）
onShow(() => {
	// 只在需要时刷新回复列表
	if (needRefreshReplies.value) {
		console.log('[讨论详情] 页面显示，刷新回复列表')
		loadReplies()
		needRefreshReplies.value = false
	}
})
</script>

<style lang="scss" scoped>
.discussion-detail-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
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

.content-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.content-scroll {
	flex: 1;
	overflow-y: auto;
}

.discussion-main {
	background: #ffffff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
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
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
	line-height: 1.4;
}

.discussion-content {
	font-size: 30rpx;
	color: #666666;
	line-height: 1.8;
	margin-bottom: 30rpx;
	white-space: pre-wrap;
}

.discussion-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.user-info {
	display: flex;
	align-items: center;
}

.user-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.discussion-stats {
	display: flex;
	gap: 20rpx;
}

.stat-item {
	font-size: 24rpx;
	color: #999999;
}

.admin-actions {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.action-btn {
	display: inline-block;
	padding: 12rpx 30rpx;
	background: #f0f2ff;
	color: #667eea;
	font-size: 26rpx;
	border-radius: 20rpx;
}

.action-text {
	color: #667eea;
}

.replies-section {
	background: #ffffff;
	padding: 30rpx;
}

.section-title {
	margin-bottom: 30rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.empty-replies {
	text-align: center;
	padding: 80rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.replies-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.reply-item {
	padding: 24rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
}

.reply-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15rpx;
}

.reply-user {
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
}

.reply-time {
	font-size: 22rpx;
	color: #999999;
}

.reply-content {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.6;
	white-space: pre-wrap;
}

.reply-input-wrapper {
	background: #ffffff;
	border-top: 1rpx solid #e0e0e0;
	padding: 20rpx;
}

.reply-input-container {
	display: flex;
	align-items: flex-end;
	gap: 20rpx;
}

.reply-input {
	flex: 1;
	min-height: 80rpx;
	max-height: 200rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
	color: #333333;
	background: #f5f5f5;
	border-radius: 8rpx;
	line-height: 1.5;
}

.reply-btn {
	width: 120rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 8rpx;
	border: none;
	text-align: center;
	padding: 0;
}

.reply-btn[disabled] {
	opacity: 0.6;
}

.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.error-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.error-text {
	font-size: 28rpx;
	color: #999999;
	margin-bottom: 40rpx;
}

.retry-btn {
	padding: 16rpx 60rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	border-radius: 8rpx;
	border: none;
}
</style>
