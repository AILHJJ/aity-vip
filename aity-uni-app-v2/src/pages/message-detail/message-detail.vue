<template>
	<view class="detail-container">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 消息详情 -->
		<view v-else-if="message" class="detail-content">
			<!-- 消息头部 -->
			<view class="message-header">
				<view class="message-type-badge" :class="'type-' + message.type">
					{{ getMessageTypeLabel(message.type) }}
				</view>
				<text class="message-time">{{ formatTime(message.createdAt) }}</text>
			</view>

			<!-- 消息标题 -->
			<view class="message-title">{{ message.title }}</view>

			<!-- 消息标签 -->
			<view v-if="message.tags && message.tags.length > 0" class="message-tags">
				<text
					v-for="tag in message.tags"
					:key="tag"
					class="message-tag"
				>
					{{ tag }}
				</text>
			</view>

			<!-- 消息内容 -->
			<view class="message-content">
				<text class="content-text">{{ message.content }}</text>
			</view>

			<!-- 消息图片 -->
			<view v-if="message.images && message.images.length > 0" class="message-images">
				<image
					v-for="(img, index) in message.images"
					:key="index"
					:src="img"
					class="message-image"
					mode="widthFix"
					@click="previewImage(index)"
				/>
			</view>

			<!-- 消息统计 -->
			<view class="message-stats">
				<view class="stat-item">
					<text class="stat-icon">👁</text>
					<text class="stat-text">{{ message.readCount || 0 }} 人已读</text>
				</view>
				<view class="stat-item">
					<text class="stat-icon">💬</text>
					<text class="stat-text">{{ message.discussionCount || 0 }} 条讨论</text>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="action-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
					<text class="btn-icon">{{ isFavorited ? '⭐' : '☆' }}</text>
					<text class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
				</button>
				<button class="action-btn" @click="handleShare">
					<text class="btn-icon">📤</text>
					<text class="btn-text">分享</text>
				</button>
				<button class="action-btn primary" @click="goToDiscuss">
					<text class="btn-icon">💬</text>
					<text class="btn-text">发起讨论</text>
				</button>
			</view>

			<!-- 管理员操作按钮 -->
			<view v-if="userStore.isAdmin" class="admin-actions">
				<button class="admin-btn pin" :class="{ pinned: message.isPinned }" @click="handleTogglePin">
					<text class="admin-btn-icon">{{ message.isPinned ? '📌' : '📍' }}</text>
					<text>{{ message.isPinned ? '取消置顶' : '置顶' }}</text>
				</button>
				<button class="admin-btn edit" @click="handleEdit">
					<text class="admin-btn-icon">✏️</text>
					<text>编辑</text>
				</button>
				<button class="admin-btn delete" @click="handleDelete">
					<text class="admin-btn-icon">🗑️</text>
					<text>删除</text>
				</button>
			</view>

			<!-- 相关讨论 -->
			<view v-if="discussions.length > 0" class="discussions-section">
				<view class="section-title">相关讨论</view>
				<view
					v-for="discussion in discussions"
					:key="discussion.id"
					class="discussion-item"
					@click="goToDiscussionDetail(discussion.id)"
				>
					<view class="discussion-header">
						<text class="discussion-user">{{ discussion.userName }}</text>
						<text class="discussion-time">{{ formatFriendlyTime(discussion.createdAt) }}</text>
					</view>
					<view class="discussion-title">{{ discussion.title }}</view>
					<view class="discussion-footer">
						<text class="discussion-status" :class="discussion.status">
							{{ discussion.status === 'replied' ? '已回复' : '待回复' }}
						</text>
						<text class="discussion-replies">{{ discussion.replyCount || 0 }} 条回复</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 错误状态 -->
		<view v-else class="error-state">
			<text class="error-icon">😕</text>
			<text class="error-text">消息不存在或已被删除</text>
			<button class="back-btn" @click="goBack">返回</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getMessageDetailApi, markMessageAsReadApi, favoriteMessageApi, unfavoriteMessageApi, deleteMessageApi, pinMessageApi, unpinMessageApi } from '../../api/message'
import { getDiscussionsApi } from '../../api/discussion'
import { MESSAGE_TYPE_LABELS } from '../../utils/constants'
import { formatTime, formatFriendlyTime } from '../../utils/time'

const userStore = useUserStore()

// 数据
const message = ref(null)
const discussions = ref([])
const loading = ref(true)
const isFavorited = ref(false)
const messageId = ref(0)

// 获取消息类型标签
const getMessageTypeLabel = (type) => {
	return MESSAGE_TYPE_LABELS[type] || type
}

// 加载消息详情
const loadMessageDetail = async () => {
	loading.value = true

	try {
		const res = await getMessageDetailApi(messageId.value)

		// 兼容 success 和 code 两种格式
		if (res.success || res.code === 200) {
			const messageData = res.data

			// 处理附件数据：转换为images格式
			if (messageData.attachments && messageData.attachments.length > 0) {
				messageData.images = messageData.attachments
					.filter(att => att.type === 'image')
					.map(att => {
						// 如果是相对路径，补全服务器地址
						let url = att.url
						if (url.startsWith('/uploads/')) {
							url = 'https://aity88.online:8443' + url
						}
						return url
					})
			}

			message.value = messageData
			isFavorited.value = messageData.isFavorited || false

			// 标记为已读
			markMessageAsReadApi(messageId.value).catch(err => {
				console.warn('标记已读失败:', err)
				// 不影响用户体验，静默失败
			})

			// 加载相关讨论
			loadDiscussions()
		} else {
			throw new Error(res.message || '加载失败')
		}
	} catch (error) {
		console.error('加载消息详情失败:', error)

		// 更友好的错误提示
		uni.showModal({
			title: '加载失败',
			content: error.message || '消息加载失败，请返回重试',
			showCancel: false,
			confirmText: '返回',
			success: () => {
				uni.navigateBack()
			}
		})
	} finally {
		loading.value = false
	}
}

// 加载相关讨论
const loadDiscussions = async () => {
	try {
		const res = await getDiscussionsApi({
			messageId: messageId.value,
			limit: 10
		})

		if (res.success) {
			discussions.value = res.data.discussions || []
		}
	} catch (error) {
		console.error('加载讨论失败:', error)
	}
}

// 切换收藏
const toggleFavorite = async () => {
	// 乐观更新 - 先更新UI，再发送请求
	const oldValue = isFavorited.value
	isFavorited.value = !oldValue

	try {
		let res
		if (isFavorited.value) {
			res = await favoriteMessageApi(messageId.value)
		} else {
			res = await unfavoriteMessageApi(messageId.value)
		}

		// 兼容两种响应格式
		if (res.success || res.code === 200) {
			uni.showToast({
				title: isFavorited.value ? '已收藏' : '已取消收藏',
				icon: 'success',
				duration: 1500
			})
		} else {
			throw new Error(res.message || '操作失败')
		}
	} catch (error) {
		// 失败时回滚UI
		isFavorited.value = oldValue

		console.error('收藏操作失败:', error)
		uni.showToast({
			title: '操作失败，请稍后重试',
			icon: 'none'
		})
	}
}

// 预览图片
const previewImage = (index) => {
	uni.previewImage({
		urls: message.value.images,
		current: index
	})
}

// 分享消息
const handleShare = () => {
	// 复制消息链接和标题到剪贴板
	const shareText = `${message.value.title}\n\n${message.value.content.substring(0, 100)}...`

	uni.setClipboardData({
		data: shareText,
		success: () => {
			uni.showModal({
				title: '分享成功',
				content: '内容已复制到剪贴板，可以粘贴分享给好友',
				showCancel: false
			})
		}
	})
}

// 发起讨论
const goToDiscuss = () => {
	uni.navigateTo({
		url: `/pages/create-discussion/create-discussion?messageId=${messageId.value}`
	})
}

// 查看讨论详情
const goToDiscussionDetail = (id) => {
	uni.navigateTo({
		url: `/pages/discussion-detail/discussion-detail?id=${id}`
	})
}

// 返回
const goBack = () => {
	uni.navigateBack()
}

// 编辑消息
const handleEdit = () => {
	uni.navigateTo({
		url: `/pages/create-message/create-message?id=${messageId.value}&mode=edit`
	})
}

// 删除消息
const handleDelete = () => {
	uni.showModal({
		title: '确认删除',
		content: '删除后无法恢复，是否继续？',
		confirmColor: '#ff5252',
		confirmText: '删除',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				uni.showLoading({ title: '删除中...', mask: true })

				try {
					const result = await deleteMessageApi(messageId.value)

					// 兼容两种响应格式
					if (result.success || result.code === 200) {
						uni.hideLoading()

						// 成功提示
						uni.showToast({
							title: '删除成功',
							icon: 'success',
							duration: 1500
						})

						// 延迟返回，让用户看到成功提示
						setTimeout(() => {
							// 返回上一页并通知刷新
							const pages = getCurrentPages()
							if (pages.length > 1) {
								// 通知列表页刷新
								const prevPage = pages[pages.length - 2]
								if (prevPage.$vm && prevPage.$vm.refreshList) {
									prevPage.$vm.refreshList()
								}
							}
							uni.navigateBack()
						}, 1500)
					} else {
						throw new Error(result.message || '删除失败')
					}
				} catch (error) {
					uni.hideLoading()
					console.error('删除消息失败:', error)

					uni.showToast({
						title: error.message || '删除失败，请稍后重试',
						icon: 'none',
						duration: 2000
					})
				}
			}
		}
	})
}

// 切换置顶
const handleTogglePin = async () => {
	try {
		const api = message.value.isPinned ? unpinMessageApi : pinMessageApi
		const action = message.value.isPinned ? '取消置顶' : '置顶'

		const result = await api(messageId.value)
		if (result.success) {
			// 更新本地状态
			message.value.isPinned = !message.value.isPinned
			uni.showToast({
				title: `${action}成功`,
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: result.message || `${action}失败`,
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('切换置顶失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 页面加载
onMounted(() => {
	// 获取消息ID
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	messageId.value = currentPage.options.id || 0

	if (!messageId.value) {
		uni.showToast({
			title: '消息ID不存在',
			icon: 'none'
		})
		setTimeout(goBack, 1500)
		return
	}

	loadMessageDetail()
})
</script>

<style lang="scss" scoped>
.detail-container {
	min-height: 100vh;
	background: #f5f5f5;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
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

.detail-content {
	background: #ffffff;
	padding: 30rpx;
}

.message-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.message-type-badge {
	padding: 10rpx 24rpx;
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
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	line-height: 1.5;
	margin-bottom: 20rpx;
}

.message-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 30rpx;
}

.message-tag {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	color: #667eea;
	background: #f0f2ff;
	border-radius: 16rpx;
}

.message-content {
	margin-bottom: 30rpx;
}

.content-text {
	font-size: 30rpx;
	color: #333333;
	line-height: 1.8;
	white-space: pre-wrap;
}

.message-images {
	margin-bottom: 30rpx;
}

.message-image {
	width: 100%;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.message-stats {
	display: flex;
	gap: 40rpx;
	padding: 30rpx 0;
	border-top: 1rpx solid #e0e0e0;
	border-bottom: 1rpx solid #e0e0e0;
	margin-bottom: 30rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.stat-icon {
	font-size: 32rpx;
}

.stat-text {
	font-size: 28rpx;
	color: #666666;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
	margin-bottom: 40rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: #f5f5f5;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
}

.action-btn.active {
	background: #fff3e0;
	color: #ff9800;
}

.action-btn.primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.btn-icon {
	font-size: 32rpx;
}

.discussions-section {
	margin-top: 40rpx;
	padding-top: 40rpx;
	border-top: 1rpx solid #e0e0e0;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
}

.discussion-item {
	padding: 30rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.discussion-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15rpx;
}

.discussion-user {
	font-size: 26rpx;
	color: #666666;
}

.discussion-time {
	font-size: 24rpx;
	color: #999999;
}

.discussion-title {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 15rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.discussion-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.discussion-status {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
}

.discussion-status.pending {
	color: #ff9800;
	background: #fff3e0;
}

.discussion-status.replied {
	color: #4caf50;
	background: #e8f5e9;
}

.discussion-replies {
	font-size: 24rpx;
	color: #999999;
}

.admin-actions {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	background: #ffffff;
	margin-top: 20rpx;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.admin-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	border-radius: 12rpx;
	border: none;
	font-size: 28rpx;
	font-weight: 500;

	&.pin {
		background: #fff9e6;
		color: #ff9800;

		&.pinned {
			background: #ffeaa7;
			color: #d63031;
		}
	}

	&.edit {
		background: #f0f2ff;
		color: #667eea;
	}

	&.delete {
		background: #ffeef0;
		color: #ff5252;
	}

	&:active {
		opacity: 0.8;
		transform: scale(0.98);
	}
}

.admin-btn-icon {
	font-size: 32rpx;
}

.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
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

.back-btn {
	width: 200rpx;
	height: 70rpx;
	line-height: 70rpx;
	background: #667eea;
	color: #ffffff;
	font-size: 28rpx;
	border-radius: 35rpx;
	border: none;
}
</style>
