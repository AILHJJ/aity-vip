<template>
	<view class="discussion-detail-container">
		<!-- #ifdef H5 -->
		<pc-detail-header title="讨论详情" fallback-url="/pages/discussions/discussions" />
		<!-- #endif -->

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
				:scroll-into-view="scrollIntoViewId"
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
						<view class="linked-meta">
							<text v-if="discussion.linkedMessage.type">
								{{ getMessageTypeDisplayLabel(discussion.linkedMessage.type, discussion.linkedMessage.typeLabel) }}
							</text>
							<text v-if="discussion.linkedMessage.createdAt">{{ formatFriendlyTime(discussion.linkedMessage.createdAt) }}</text>
						</view>
						<view v-if="linkedMessageRenderedContent" class="linked-content markdown-rendered">
							<rich-text :nodes="linkedMessageRenderedContent"></rich-text>
						</view>
						<text v-else-if="discussion.linkedMessage.content" class="linked-content-text">
							{{ discussion.linkedMessage.content }}
						</text>
						<text class="linked-hint">点击查看原文</text>
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

					<!-- 持仓帖标的徽标 -->
					<view v-if="discussion.category === 'position' && discussion.stockCodes" class="stock-codes-bar">
						<text
							v-for="(code, idx) in discussion.stockCodes.split(',')"
							:key="idx"
							class="stock-chip"
						>📈 {{ code.trim() }}</text>
					</view>

					<view class="discussion-content">{{ discussion.content }}</view>

					<view class="discussion-footer">
						<view class="user-info">
							<text class="user-name">{{ discussion.creatorName }}</text>
						</view>
						<view class="discussion-stats">
							<text class="stat-item">回复 {{ discussion.replyCount || 0 }}</text>
							<text class="stat-item">浏览 {{ discussion.viewCount || 0 }}</text>
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
							:id="'reply-' + reply.id"
							class="reply-item"
							:class="{ 'is-private': reply.isPrivate, 'editing': editingReplyId === reply.id, 'is-new': reply.isNew, 'is-admin-reply': reply.isAdminReply }"
						>
							<view class="reply-header">
								<text class="reply-user">{{ reply.userName }}</text>
								<text v-if="reply.isAdminReply" class="official-badge">官方回复</text>
								<text v-if="reply.isNew" class="new-badge">新</text>
								<text class="reply-time">{{ formatFriendlyTime(reply.createdAt) }}</text>
								<text v-if="reply.isPrivate" class="private-badge">私密</text>
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
										:src="fullUrl(img.url)"
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
										:adjust-position="true"
										:cursor-spacing="20"
										@keyboardheightchange="onKeyboardHeightChange"
									/>
									<!-- 编辑模式图片预览 -->
									<view v-if="editImages.length > 0" class="edit-images-preview">
										<view v-for="(img, idx) in editImages" :key="idx" class="edit-image-item">
											<image class="edit-image-thumb" :src="fullUrl(img.url || img)" mode="aspectFill" />
											<text class="remove-image-btn" @click="removeEditImage(idx)">✕</text>
										</view>
									</view>
									<view class="edit-actions">
										<text class="image-add-btn" @click="chooseEditImage">+ 图片</text>
										<button class="edit-confirm-btn" :disabled="!editContent.trim() && editImages.length === 0 || editing" @click="handleUpdateReply(reply)">确认修改</button>
										<text class="cancel-edit-btn" @click="cancelEditReply">取消</text>
									</view>
								</view>
							</template>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 回复输入框 -->
			<view class="reply-input-wrapper" :style="{ paddingBottom: keyboardHeight + 'px' }">
				<view class="reply-input-container">
					<textarea
						class="reply-input"
						v-model="replyContent"
						placeholder="输入你的回复..."
						placeholder-style="color: #999999"
						:maxlength="500"
						:show-confirm-bar="false"
						:auto-height="true"
						:adjust-position="true"
						:cursor-spacing="20"
						@keyboardheightchange="onKeyboardHeightChange"
					/>
				</view>
				<!-- 已选图片预览 -->
				<view v-if="replyImages.length > 0" class="images-preview">
					<view v-for="(img, idx) in replyImages" :key="idx" class="image-item">
						<image class="image-thumb" :src="fullUrl(img.url)" mode="aspectFill" />
						<text class="remove-image-btn" @click="removeReplyImage(idx)">✕</text>
					</view>
				</view>
				<view class="reply-toolbar">
					<text class="image-add-btn" @click="chooseReplyImage">添加图片</text>
					<text v-if="replyImages.length > 0" class="image-count">{{ replyImages.length }}/9</text>
				</view>
				<!-- 管理员：始终显示两个按钮 -->
				<view v-if="userStore.isAdmin" class="reply-buttons">
					<button
						class="reply-btn primary"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleReply(false)"
					>
						{{ submitting ? '发送中...' : '公开回复' }}
					</button>
					<button
						class="reply-btn secondary"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleReply(true)"
					>
						{{ submitting ? '发送中...' : '私密回复' }}
					</button>
				</view>
				<!-- 非管理员：公开帖可公开/私密回复；私密帖（持仓帖）仅私密回复 -->
				<view v-else class="reply-buttons" :class="{ single: discussion.visibility !== 'public' }">
					<button
						v-if="discussion.visibility === 'public'"
						class="reply-btn primary"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleReply(false)"
					>
						{{ submitting ? '发送中...' : '公开回复' }}
					</button>
					<button
						class="reply-btn"
						:class="discussion.visibility === 'public' ? 'secondary' : 'primary full'"
						:disabled="!replyContent.trim() && replyImages.length === 0 || submitting"
						@click="handleReply(true)"
					>
						{{ submitting ? '发送中...' : (discussion.visibility === 'public' ? '私密回复' : '发送私密回复') }}
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
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import EmptyState from '../../components/empty-state.vue'
import {
	getDiscussionDetailApi,
	getDiscussionRepliesApi,
	replyDiscussionApi,
	updateReplyApi,
	deleteReplyApi,
	updateDiscussionVisibilityApi,
	markDiscussionReadApi
} from '../../api/discussion'
import { getMessageDetailApi } from '../../api/message'
import { uploadImageApi } from '../../api/upload'
// #ifdef H5
import { setupPasteUpload } from '../../utils/pasteImage'
let removePasteListener = null
// #endif
import { formatFriendlyTime } from '../../utils/time'
import { BASE_URL } from '../../utils/config'
import { MarkdownRenderer } from '../../utils/markdown-renderer'
import { getMessageTypeDisplayLabel } from '../../utils/message-labels.mjs'
import { normalizeMessageId } from '../../utils/discussion-link.mjs'
import PcDetailHeader from '@/components/pc-detail-header.vue'

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

// 滚动定位到第一条新回复
const scrollIntoViewId = ref('')

// 回复图片
const replyImages = ref([])

// 键盘高度（用于输入框避让弹起的键盘，防止遮挡编辑内容）
const keyboardHeight = ref(0)
const onKeyboardHeightChange = (e) => {
	keyboardHeight.value = e.detail.height || 0
}

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

const linkedMessageTheme = computed(() => discussion.value?.linkedMessage?.theme || 'default')
const linkedMessageRenderedContent = computed(() => {
	const content = discussion.value?.linkedMessage?.content
	if (!content) return ''
	return MarkdownRenderer.renderWithTheme(content, linkedMessageTheme.value)
})

// 获取讨论ID
const getDiscussionId = () => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	return currentPage.options.id
}

// 兼容旧后端或旧数据：详情未展开关联消息时，按 messageId 补查消息内容
const loadLinkedMessageFallback = async () => {
	if (!discussion.value) return

	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const fallbackId = discussion.value.linkedMessage?.id
		|| discussion.value.messageId
		|| currentPage.options.fallbackMessageId
	const messageId = normalizeMessageId(fallbackId)

	if (!messageId) return
	if (discussion.value.linkedMessage?.content && discussion.value.linkedMessage?.theme) return

	try {
		const res = await getMessageDetailApi(messageId)
		if (res.code === 200 && res.data) {
			discussion.value.messageId = messageId
			discussion.value.linkedMessage = {
				...discussion.value.linkedMessage,
				...res.data,
				id: messageId
			}
		}
	} catch (error) {
		// 关联消息无权限或已删除时，保留已有标题，不阻断讨论查看
		console.warn('[讨论详情] 补充关联消息内容失败:', error)
	}
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
			await loadLinkedMessageFallback()

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
		// 3 秒后自动跳转到讨论区（直接打开链接时 history 没有上一页）
		uni.showModal({
			title: '加载失败',
			content: `${error.message || '讨论加载失败'}\n\n3 秒后自动返回讨论区`,
			showCancel: false,
			confirmText: '知道了',
			success: () => {
				uni.reLaunch({ url: '/pages/discussions/discussions' })
			}
		})
		setTimeout(() => {
			uni.reLaunch({ url: '/pages/discussions/discussions' })
		}, 3000)
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
			// 后端已经提供了 userName / isNew / isAdminReply 字段
			replies.value = res.data || []

			console.log('[讨论回复] 加载成功，回复数:', replies.value.length)

			// 标记已读（在拿到 isNew 数据后标记，不影响当前"新回复"高亮展示）
			markDiscussionReadApi(id).catch(() => {})

			// 自动滚动到第一条新回复
			const firstNew = replies.value.find(r => r.isNew)
			if (firstNew) {
				nextTick(() => {
					setTimeout(() => {
						scrollIntoViewId.value = 'reply-' + firstNew.id
					}, 300)
				})
			}
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

// 非管理员用户默认发送私密回复
const handleUserReply = () => {
	handleReply(true)
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
			const successTitle = isPrivate ? '私密回复已发送' : '公开回复已发送'
			uni.showToast({
				title: successTitle,
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
	const urls = images.map(img => fullUrl(img.url))
	uni.previewImage({ current: fullUrl(currentUrl), urls })
}

// 将后端返回的相对路径（如 /uploads/...）转为完整 URL，避免 H5 uni-image
// 在 hash 路由下对根路径 src 错误拼接 base 导致图片无法显示
const fullUrl = (url) => {
	if (!url) return ''
	if (typeof url !== 'string') return ''
	if (url.startsWith('http://') || url.startsWith('https://')) return url
	return `${BASE_URL}${url}`
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

	// #ifdef H5
	// 支持剪贴板图片粘贴上传（回帖图片，PC 端效率）
	removePasteListener = setupPasteUpload(async (files) => {
		for (const file of files) {
			if (file.size > 10 * 1024 * 1024) {
				uni.showToast({ title: '图片大小不能超过 10MB', icon: 'none' })
				continue
			}
			try {
				const blobUrl = URL.createObjectURL(file)
				const res = await uploadImageApi(blobUrl)
				URL.revokeObjectURL(blobUrl)
				replyImages.value.push({ url: res.url, filename: res.filename })
			} catch (err) {
				console.error('[粘贴上传] 失败:', err)
				uni.showToast({ title: '图片上传失败', icon: 'none' })
			}
		}
		uni.showToast({ title: `已粘贴 ${files.length} 张图片`, icon: 'none' })
	})
	// #endif
})

// #ifdef H5
onBeforeUnmount(() => {
	if (removePasteListener) removePasteListener()
})
// #endif

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

.linked-meta {
	display: flex;
	margin-top: 10rpx;
	font-size: 22rpx;
	color: #777777;

	text {
		margin-right: 16rpx;
	}
}

.linked-content {
	margin-top: 14rpx;
	overflow: hidden;
	max-height: 320rpx;
}

.markdown-rendered {
	font-size: 26rpx;
	color: #555555;
	line-height: 1.6;
}

.linked-content-text {
	display: block;
	font-size: 26rpx;
	color: #555555;
	line-height: 1.6;
	margin-top: 14rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
}

.linked-hint {
	display: block;
	margin-top: 14rpx;
	font-size: 24rpx;
	color: #667eea;
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

/* 持仓帖标的徽标 */
.stock-codes-bar {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.stock-chip {
	font-size: 24rpx;
	color: #9b59b6;
	background: rgba(155, 89, 182, 0.08);
	border: 1rpx solid rgba(155, 89, 182, 0.25);
	padding: 6rpx 18rpx;
	border-radius: 999rpx;
	font-weight: 500;
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

	// 新回复高亮
	&.is-new {
		background: #f0f4ff;
		border: 1rpx solid #91a7ff;
	}

	// 管理员回复视觉区分
	&.is-admin-reply {
		border-left: 6rpx solid #667eea;
		background: #f5f7ff;
	}
}

.official-badge {
	font-size: 20rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	margin-left: 10rpx;
	font-weight: 600;
}

.new-badge {
	font-size: 20rpx;
	color: #ffffff;
	background: #f5222d;
	padding: 2rpx 10rpx;
	border-radius: 8rpx;
	margin-left: 10rpx;
	font-weight: 600;
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


/* #ifdef H5 */
@media (min-width: 769px) {
	.discussion-detail-container {
		max-width: 1000px;
		margin: 0 auto;
		padding-top: 44px; // 避让 pc-detail-header（H5 大屏下显示）
	}
}
/* #endif */
</style>
