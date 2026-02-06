<template>
	<view class="detail-container">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-container">
			<!-- 骨架屏 -->
			<view class="skeleton-screen">
				<view class="skeleton-header">
					<view class="skeleton-badge"></view>
					<view class="skeleton-time"></view>
				</view>
				<view class="skeleton-title"></view>
				<view class="skeleton-tags">
					<view class="skeleton-tag"></view>
					<view class="skeleton-tag"></view>
				</view>
				<view class="skeleton-content">
					<view class="skeleton-line"></view>
					<view class="skeleton-line"></view>
					<view class="skeleton-line"></view>
				</view>
				<view class="skeleton-images">
					<view class="skeleton-image"></view>
					<view class="skeleton-image"></view>
				</view>
				<view class="skeleton-stats">
					<view class="skeleton-stat"></view>
					<view class="skeleton-stat"></view>
				</view>
			</view>
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
				<view
					v-for="(img, index) in message.images"
					:key="index"
					class="image-wrapper"
					@click="previewImage(index)"
				>
					<image
						:src="img"
						class="message-image"
						mode="widthFix"
						:lazy-load="true"
						@error="handleImageError(index)"
						@load="handleImageLoad(index)"
						:show-loading="true"
						:show-error="true"
					/>
					<view class="image-mask">
						<text class="image-hint">点击预览</text>
					</view>
				</view>
			</view>

			<!-- 图片空状态 -->
			<view v-else-if="message && !message.images" class="image-empty-state">
				<text class="image-empty-icon">🖼️</text>
				<text class="image-empty-title">暂无图片</text>
				<text class="image-empty-description">该消息没有图片附件</text>
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
				<button
					class="action-btn"
					:class="{ active: isFavorited, loading: favoriteLoading }"
					:disabled="favoriteLoading"
					@click="toggleFavorite"
				>
					<text v-if="favoriteLoading" class="btn-text">处理中...</text>
					<template v-else>
						<text class="btn-icon">{{ isFavorited ? '⭐' : '☆' }}</text>
						<text class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
					</template>
				</button>
				<button
					class="action-btn"
					:class="{ loading: shareLoading }"
					:disabled="shareLoading"
					@click="handleShare"
				>
					<text v-if="shareLoading" class="btn-text">复制中...</text>
					<template v-else>
						<text class="btn-icon">📤</text>
						<text class="btn-text">分享</text>
					</template>
				</button>
				<button class="action-btn primary" @click="goToDiscuss">
					<text class="btn-icon">💬</text>
					<text class="btn-text">发起讨论</text>
				</button>
			</view>

			<!-- 管理员操作按钮 -->
			<view v-if="userStore.isAdmin" class="admin-actions">
				<button
					class="admin-btn pin"
					:class="{ pinned: message.isPinned, loading: pinLoading }"
					:disabled="pinLoading"
					@click="handleTogglePin"
				>
					<text v-if="pinLoading">{{ message.isPinned ? '取消中...' : '置顶中...' }}</text>
					<template v-else>
						<text class="admin-btn-icon">{{ message.isPinned ? '📌' : '📍' }}</text>
						<text>{{ message.isPinned ? '取消置顶' : '置顶' }}</text>
					</template>
				</button>
				<button class="admin-btn edit" @click="handleEdit">
					<text class="admin-btn-icon">✏️</text>
					<text>编辑</text>
				</button>
				<button
					class="admin-btn delete"
					:class="{ loading: deleteLoading }"
					:disabled="deleteLoading"
					@click="handleDelete"
				>
					<text v-if="deleteLoading">删除中...</text>
					<template v-else>
						<text class="admin-btn-icon">🗑️</text>
						<text>删除</text>
					</template>
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
			<text class="error-icon">🔍</text>
			<text class="error-title">消息不存在或已被删除</text>
			<text class="error-description">
				很抱歉，您查看的消息可能已经被删除或不存在
			</text>
			<view class="error-actions">
				<button class="action-btn secondary" @click="goBack">
					<text class="btn-icon">🏠</text>
					<text class="btn-text">返回首页</text>
				</button>
				<button class="action-btn primary" @click="retryLoad">
					<text class="btn-icon">🔄</text>
					<text class="btn-text">重新加载</text>
				</button>
			</view>
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

// 防重复点击loading状态
const favoriteLoading = ref(false)
const shareLoading = ref(false)
const deleteLoading = ref(false)
const pinLoading = ref(false)

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
	// 防止重复点击
	if (favoriteLoading.value) return

	// 添加登录检查
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1500)
		return
	}

	favoriteLoading.value = true
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
	} finally {
		favoriteLoading.value = false
	}
}

// 预览图片
const previewImage = (index) => {
	uni.previewImage({
		urls: message.value.images,
		current: index,
		fail: (err) => {
			console.error('预览图片失败:', err)
			uni.showToast({
				title: '预览失败',
				icon: 'none'
			})
		}
	})
}

// 处理图片加载错误
const handleImageError = (index) => {
	console.error(`图片 ${index} 加载失败`)
	uni.showToast({
		title: '图片加载失败',
		icon: 'none'
	})
}

// 处理图片加载成功
const handleImageLoad = (index) => {
	// 图片加载成功，不需要日志
}

// 分享消息
const handleShare = async () => {
	// 防止重复点击
	if (shareLoading.value) return

	// 添加登录检查
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1500)
		return
	}

	shareLoading.value = true

	try {
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
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				})
			}
		})
	} finally {
		// 分享是异步操作，但clipboard操作很快，延迟重置loading
		setTimeout(() => {
			shareLoading.value = false
		}, 500)
	}
}

// 发起讨论
const goToDiscuss = () => {
	// 添加登录检查
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1500)
		return
	}

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

// 重新加载
const retryLoad = () => {
	loadMessageDetail()
}

// 编辑消息
const handleEdit = () => {
	uni.navigateTo({
		url: `/pages/create-message/create-message?id=${messageId.value}&mode=edit`
	})
}

// 删除消息
const handleDelete = () => {
	// 防止重复点击
	if (deleteLoading.value) return

	uni.showModal({
		title: '确认删除',
		content: '删除后无法恢复，是否继续？',
		confirmColor: '#ff5252',
		confirmText: '删除',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				deleteLoading.value = true
				uni.showLoading({ title: '删除中...', mask: true })

				try {
					const result = await deleteMessageApi(messageId.value)

					// 兼容两种响应格式
					if (result.success || result.code === 200) {
						uni.hideLoading()

						// 立即返回上一页，避免用户在等待时点击其他操作
						const pages = getCurrentPages()
						if (pages.length > 1) {
							// 通知列表页刷新
							const prevPage = pages[pages.length - 2]
							if (prevPage.$vm && prevPage.$vm.refreshList) {
								prevPage.$vm.refreshList()
							}
						}

						// 立即返回,不等待
						uni.navigateBack()

						// 返回后显示成功提示
						setTimeout(() => {
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 1500
							})
						}, 100)
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
				} finally {
					deleteLoading.value = false
				}
			}
		}
	})
}

// 切换置顶
const handleTogglePin = async () => {
	// 防止重复点击
	if (pinLoading.value) return

	pinLoading.value = true

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
	} finally {
		pinLoading.value = false
	}
}

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadMessageDetail()
		await loadDiscussions()
		uni.showToast({
			title: '刷新成功',
			icon: 'success',
			duration: 1500
		})
	} catch (error) {
		console.error('刷新失败:', error)
		uni.showToast({
			title: '刷新失败',
			icon: 'none'
		})
	} finally {
		uni.stopPullDownRefresh()
	}
})

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
	background: #ffffff;
	padding: 30rpx;
}

.skeleton-screen {
	background: #ffffff;
}

.skeleton-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.skeleton-badge {
	width: 120rpx;
	height: 40rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 20rpx;
}

.skeleton-time {
	width: 100rpx;
	height: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 15rpx;
}

.skeleton-title {
	width: 100%;
	height: 50rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}

.skeleton-tags {
	display: flex;
	gap: 12rpx;
	margin-bottom: 30rpx;
}

.skeleton-tag {
	width: 80rpx;
	height: 32rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 16rpx;
}

.skeleton-content {
	margin-bottom: 30rpx;
}

.skeleton-line {
	width: 100%;
	height: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 6rpx;
	margin-bottom: 15rpx;
}

.skeleton-line:last-child {
	width: 70%;
}

.skeleton-images {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.skeleton-image {
	width: 100%;
	height: 200rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 12rpx;
}

.skeleton-stats {
	display: flex;
	gap: 40rpx;
	padding: 30rpx 0;
	border-top: 1rpx solid #f0f0f0;
	border-bottom: 1rpx solid #f0f0f0;
}

.skeleton-stat {
	width: 120rpx;
	height: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 15rpx;
}

@keyframes loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
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
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.image-wrapper {
	position: relative;
	width: 100%;
	border-radius: 12rpx;
	overflow: hidden;
	background: #f5f5f5;
	cursor: pointer;
	transition: transform 0.2s ease;

	&:active {
		transform: scale(0.98);
	}
}

.message-image {
	width: 100%;
	display: block;
	border-radius: 12rpx;
	transition: opacity 0.3s ease;

	&:hover {
		opacity: 0.95;
	}
}

.image-mask {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
	opacity: 0;
	transition: opacity 0.3s ease;
	display: flex;
	align-items: flex-end;
	justify-content: center;

	.image-wrapper:hover &,
	.image-wrapper:active & {
		opacity: 1;
	}
}

.image-hint {
	color: #ffffff;
	font-size: 24rpx;
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
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&.loading {
		animation: pulse 1.5s ease-in-out infinite;
	}
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.7;
	}
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
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&.loading {
		animation: pulse 1.5s ease-in-out infinite;
	}

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
	padding: 200rpx 60rpx;
	background: #f8f9fa;
	border-radius: 20rpx;
	margin: 20rpx;
}

.error-icon {
	font-size: 160rpx;
	margin-bottom: 40rpx;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-20rpx);
	}
}

.error-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 20rpx;
	text-align: center;
}

.error-description {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.6;
	text-align: center;
	margin-bottom: 50rpx;
	max-width: 500rpx;
}

.error-actions {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
	max-width: 400rpx;
}

.secondary {
	background: #f5f5f5;
	color: #333333;
}

.secondary::after {
	border: none;
}

.image-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
	margin: 20rpx 0;
	min-height: 200rpx;
}

.image-empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
	opacity: 0.7;
}

.image-empty-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 15rpx;
}

.image-empty-description {
	font-size: 26rpx;
	color: #999999;
	line-height: 1.5;
	text-align: center;
}
</style>
