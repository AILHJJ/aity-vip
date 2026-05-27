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
					<!-- 关联消息卡片 -->
					<view v-if="discussion.linkedMessage" class="linked-message-card" @click="goToMessageDetail(discussion.linkedMessage.id)">
						<view class="linked-header">
							<text class="linked-label">基于此消息讨论</text>
							<text class="linked-arrow">→</text>
						</view>
						<view class="linked-title">{{ discussion.linkedMessage.title }}</view>
					</view>

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
							:class="{ 'is-private': reply.isPrivate, 'editing': editingReplyId === reply.id }"
						>
							<view class="reply-header">
								<text class="reply-user">{{ reply.userName }}</text>
								<text class="reply-time">{{ formatFriendlyTime(reply.createdAt) }}</text>
								<text v-if="reply.isPrivate" class="private-badge">🔒 私密</text>
								<!-- 编辑/删除操作按钮（仅本人或管理员可见） -->
								<view v-if="canEditReply(reply)" class="reply-actions">
									<text class="action-link edit-link" @click="startEditReply(reply)">编辑</text>
									<text class="action-link delete-link" @click="handleDeleteReply(reply)">删除</text>
								</view>
							</view>

							<!-- 正常展示模式 -->
							<template v-if="editingReplyId !== reply.id">
								<view class="reply-content">{{ reply.content }}</view>
								<!-- 回复图片展示 -->
								<view v-if="reply.images && reply.images.length > 0" class="reply-images">
									<image
										v-for="(img, imgIdx) in reply.images"
										:key="imgIdx"
										class="reply-image"
										:src="img.url"
										mode="aspectFill"
										@click="previewImage(img.url, reply.images)"
									/>
								</view>
								<text v-if="reply.isPrivate" class="private-hint">仅管理员和发帖人可见</text>
							</template>

							<!-- 编辑模式 -->
							<template v-else>
								<view class="edit-reply-box">
									<textarea
										class="edit-input"
										v-model="editContent"
										placeholder="编辑回复内容..."
										placeholder-style="color: #999999"
										:maxlength="500"
										:auto-height="true"
										:focus="true"
									/>
									<!-- 编辑模式图片预览 -->
									<view v-if="editImages.length > 0" class="edit-images-preview">
										<view v-for="(img, idx) in editImages" :key="idx" class="edit-image-item">
											<image class="edit-image-thumb" :src="img.url || img" mode="aspectFill" />
											<text class="remove-image-btn" @click="removeEditImage(idx)">✕</text>
										</view>
									</view>
									<view class="edit-actions">
										<text class="image-add-btn" @click="chooseEditImage">+ 图片</text>
										<button class="edit-confirm-btn" :disabled="!editContent.trim() || editing" @click="handleUpdateReply(reply)">确认修改</button>
										<text class="cancel-edit-btn" @click="cancelEditReply">取消</text>
									</view>
								</view>
							</template>
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
						:auto-height="true"
					/>
				</view>
				<!-- 已选图片预览 -->
				<view v-if="replyImages.length > 0" class="images-preview">
					<view v-for="(img, idx) in replyImages" :key="idx" class="image-item">
						<image class="image-thumb" :src="img.url" mode="aspectFill" />
						<text class="remove-image-btn" @click="removeReplyImage(idx)">✕</text>
					</view>
				</view>
				<view class="reply-toolbar">
					<text class="image-add-btn" @click="chooseReplyImage">📷 添加图片</text>
					<text v-if="replyImages.length > 0" class="image-count">{{ replyImages.length }}/9</text>
				</view>
				<!-- 管理员：始终显示两个按钮 -->
				<view v-if="userStore.isAdmin" class="reply-buttons">
					<button
						class="reply-btn primary"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleReply(false)"
					>
						{{ submitting ? '发送中...' : '🔓 公开回复' }}
					</button>
					<button
						class="reply-btn secondary"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleReply(true)"
					>
						{{ submitting ? '发送中...' : '🔒 私密回复' }}
					</button>
				</view>
				<!-- 非管理员：显示单个按钮 -->
				<view v-else class="reply-buttons single">
					<button
						class="reply-btn primary full"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleUserReply"
					>
						{{ submitting ? '发送中...' : '发送回复' }}
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
	updateReplyApi,
	deleteReplyApi,
	updateDiscussionVisibilityApi
} from '../../api/discussion'
import { uploadImageApi } from '../../api/upload'
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

// 回复图片
const replyImages = ref([])

// 编辑模式状态
const editingReplyId = ref(null)
const editContent = ref('')
const editImages = ref([])
const editing = ref(false)

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

// 非管理员用户发送公开回复
const handleUserReply = () => {
	handleReply(false)
}

// 发送回复（isPrivate: true=私密回复仅发帖人可见, false=公开回复并公开讨论）
const handleReply = async (isPrivate) => {
	if (!replyContent.value.trim() && replyImages.value.length === 0) return

	submitting.value = true
	const isAdmin = userStore.isAdmin

	try {
		const id = getDiscussionId()

		// 公开回复时，先把讨论从私密改为公开
		if (isAdmin && !isPrivate && discussion.value && discussion.value.visibility === 'private') {
			console.log('[发送回复] 公开回复，同时公开讨论')
			await updateDiscussionVisibilityApi(id, { visibility: 'public' })
			discussion.value.visibility = 'public'
		}

		const data = {
			content: replyContent.value.trim()
		}

		// 如果有图片数据
		if (replyImages.value.length > 0) {
			data.images = replyImages.value
		}

		// 管理员可以设置私密回复
		if (isAdmin) {
			data.isPrivate = isPrivate ? 1 : 0
		}

		const res = await replyDiscussionApi(id, data)

		console.log('[发送回复] API响应:', res)

		if (res.code === 200) {
			uni.showToast({
				title: isPrivate ? '🔒 私密回复已发送' : '🔓 回复成功，讨论已公开',
				icon: 'success',
				duration: 1500
			})

			// 清空输入框和图片
			replyContent.value = ''
			replyImages.value = []

			// 重新加载回复列表
			await loadReplies()

			// 更新讨论数据
			if (discussion.value && res.data?.discussion) {
				discussion.value.replyCount = res.data.discussion.replies_count || res.data.discussion.replyCount || 0
				discussion.value.status = res.data.discussion.status || discussion.value.status
			}

			console.log('[发送回复] 讨论数据已更新，回复数:', discussion.value.replyCount)
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

// ========== 图片相关方法 ==========

// 选择回复图片
const chooseReplyImage = () => {
	const remaining = 9 - replyImages.value.length
	if (remaining <= 0) {
		uni.showToast({ title: '最多上传9张图片', icon: 'none' })
		return
	}
	uni.chooseImage({
		count: remaining,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			for (const filePath of res.tempFilePaths) {
				try {
					uni.showLoading({ title: '上传中...' })
					const uploadRes = await uploadImageApi(filePath)
					replyImages.value.push({ url: uploadRes.url, filename: uploadRes.filename })
				} catch (err) {
					console.error('[上传图片] 失败:', err)
					uni.showToast({ title: '图片上传失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			}
		}
	})
}

// 移除回复图片
const removeReplyImage = (index) => {
	replyImages.value.splice(index, 1)
}

// 预览图片
const previewImage = (currentUrl, images) => {
	const urls = images.map(img => img.url)
	uni.previewImage({ current: currentUrl, urls })
}

// ========== 编辑/删除回复方法 ==========

// 判断是否可编辑该回复（本人或管理员）
const canEditReply = (reply) => {
	if (!userStore.userInfo) return false
	const isAdmin = userStore.isAdmin
	const isOwner = reply.userId === userStore.userInfo.id
	return isAdmin || isOwner
}

// 开始编辑回复
const startEditReply = (reply) => {
	editingReplyId.value = reply.id
	editContent.value = reply.content || ''
	// 深拷贝已有图片数组
	editImages.value = reply.images ? JSON.parse(JSON.stringify(reply.images)) : []
}

// 取消编辑
const cancelEditReply = () => {
	editingReplyId.value = null
	editContent.value = ''
	editImages.value = []
	editing.value = false
}

// 编辑模式下选择图片
const chooseEditImage = () => {
	const remaining = 9 - editImages.value.length
	if (remaining <= 0) {
		uni.showToast({ title: '最多上传9张图片', icon: 'none' })
		return
	}
	uni.chooseImage({
		count: remaining,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			for (const filePath of res.tempFilePaths) {
				try {
					uni.showLoading({ title: '上传中...' })
					const uploadRes = await uploadImageApi(filePath)
					editImages.value.push({ url: uploadRes.url, filename: uploadRes.filename })
				} catch (err) {
					console.error('[编辑模式上传图片] 失败:', err)
					uni.showToast({ title: '图片上传失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			}
		}
	})
}

// 移除编辑模式中的图片
const removeEditImage = (index) => {
	editImages.value.splice(index, 1)
}

// 提交编辑回复
const handleUpdateReply = async (reply) => {
	if (!editContent.value.trim() && editImages.value.length === 0) return

	editing.value = true
	try {
		const id = getDiscussionId()
		const data = { content: editContent.value.trim() }
		if (editImages.value.length > 0) {
			data.images = editImages.value
		}

		const res = await updateReplyApi(id, reply.id, data)
		if (res.code === 200) {
			uni.showToast({ title: '修改成功', icon: 'success' })
			cancelEditReply()
			await loadReplies()
		} else {
			uni.showToast({ title: res.message || '修改失败', icon: 'none' })
		}
	} catch (error) {
		console.error('[编辑回复] 错误:', error)
		uni.showToast({ title: '修改失败', icon: 'none' })
	} finally {
		editing.value = false
	}
}

// 删除回复确认与执行
const handleDeleteReply = (reply) => {
	uni.showModal({
		title: '确认删除',
		content: '删除后无法恢复，确定要删除这条回复吗？',
		confirmColor: '#ff4d4f',
		success: async (modalRes) => {
			if (!modalRes.confirm) return
			try {
				const id = getDiscussionId()
				const res = await deleteReplyApi(id, reply.id)
				if (res.code === 200) {
					uni.showToast({ title: '删除成功', icon: 'success' })
					await loadReplies()
					// 更新回复计数
					if (discussion.value) {
						discussion.value.replyCount = Math.max(0, (discussion.value.replyCount || 1) - 1)
					}
				} else {
					uni.showToast({ title: res.message || '删除失败', icon: 'none' })
				}
			} catch (error) {
				console.error('[删除回复] 错误:', error)
				uni.showToast({ title: '删除失败', icon: 'none' })
			}
		}
	})
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

// 跳转到关联消息详情
const goToMessageDetail = (messageId) => {
	uni.navigateTo({
		url: `/pages/message-detail/message-detail?id=${messageId}`
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
/* 微信小程序 button 组件默认样式重置 */
button {
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	line-height: normal;
	font-size: inherit;
}
button::after {
	border: none;
}

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

// 关联消息卡片
.linked-message-card {
	background: linear-gradient(135deg, #f0f2ff 0%, #f5f3ff 100%);
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	border-left: 4rpx solid #667eea;
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
		opacity: 0.9;
	}
}

.linked-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.linked-label {
	font-size: 24rpx;
	color: #667eea;
	font-weight: 500;
}

.linked-arrow {
	font-size: 28rpx;
	color: #667eea;
}

.linked-title {
	font-size: 28rpx;
	color: #333333;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
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

	&.is-private {
		background: #fff8e1;
		border: 1rpx solid #ffd54f;
	}
}

.private-badge {
	font-size: 20rpx;
	color: #f57c00;
	background: #fff3e0;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	margin-left: 10rpx;
}

.private-hint {
	font-size: 20rpx;
	color: #f57c00;
	margin-top: 10rpx;
	display: block;
	opacity: 0.7;
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
	min-height: 100rpx;
	max-height: 200rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
	color: #333333;
	background: #f5f5f5;
	border-radius: 12rpx;
	line-height: 1.5;
}

.reply-buttons {
	display: flex;
	gap: 20rpx;
	margin-top: 16rpx;
}

.reply-buttons.single {
	justify-content: center;
}

.reply-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 12rpx;
	border: none;
	text-align: center;
	padding: 0;
}

.reply-btn.primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.reply-btn.secondary {
	background: #f5f5f5;
	color: #666666;
	border: 1rpx solid #e0e0e0;
}

.reply-btn.full {
	flex: none;
	width: 100%;
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

/* ========== 回复操作按钮（编辑/删除） ========== */
.reply-actions {
	display: flex;
	gap: 16rpx;
	margin-left: auto;
}

.action-link {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
}

.edit-link {
	color: #1890ff;
	background: #e6f7ff;
}

.delete-link {
	color: #ff4d4f;
	background: #fff1f0;
}

/* ========== 回复图片展示 ========== */
.reply-images {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 16rpx;
}

.reply-image {
	width: 160rpx;
	height: 160rpx;
	border-radius: 8rpx;
}

/* ========== 编辑模式 ========== */
.reply-item.editing {
	background: #f0f2ff;
	border: 2rpx solid #667eea;
}

.edit-reply-box {
	margin-top: 16rpx;
}

.edit-input {
	width: 100%;
	min-height: 120rpx;
	max-height: 300rpx;
	padding: 16rpx;
	font-size: 28rpx;
	color: #333333;
	background: #ffffff;
	border: 1rpx solid #d9d9d9;
	border-radius: 10rpx;
	line-height: 1.6;
	box-sizing: border-box;
}

.edit-images-preview {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 12rpx;
}

.edit-image-item {
	position: relative;
	width: 120rpx;
	height: 120rpx;
}

.edit-image-thumb {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
}

.edit-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-top: 16rpx;
}

.edit-confirm-btn {
	padding: 12rpx 32rpx;
	font-size: 26rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 8rpx;
	border: none;
	line-height: normal;

	&[disabled] {
		opacity: 0.5;
	}
}

.cancel-edit-btn {
	font-size: 26rpx;
	color: #999999;
	padding: 12rpx 20rpx;
}

/* ========== 图片上传工具栏 ========== */
.images-preview {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	padding: 12rpx 0;
}

.image-item {
	position: relative;
	width: 120rpx;
	height: 120rpx;
}

.image-thumb {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
}

.remove-image-btn {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	width: 36rpx;
	height: 36rpx;
	line-height: 36rpx;
	text-align: center;
	background: #ff4d4f;
	color: #ffffff;
	font-size: 20rpx;
	border-radius: 50%;
	z-index: 1;
}

.reply-toolbar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 8rpx 0;
}

.image-add-btn {
	font-size: 24rpx;
	color: #667eea;
	padding: 8rpx 16rpx;
	background: #f0f2ff;
	border-radius: 8rpx;
}

.image-count {
	font-size: 22rpx;
	color: #999999;
}
</style>
