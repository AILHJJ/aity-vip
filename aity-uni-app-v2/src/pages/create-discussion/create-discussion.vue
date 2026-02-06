<template>
	<view class="create-discussion-container">
		<scroll-view class="form-scroll" scroll-y>
			<view class="form-container">
				<!-- 关联消息（放在最前面） -->
				<!-- 如果从消息详情页跳转过来，显示已关联的消息 -->
				<view v-if="!showMessagePicker && linkedMessage" class="form-item">
					<text class="form-label">关联消息</text>
					<view class="linked-message-card">
						<view class="linked-message-header">
							<text class="linked-message-badge">已关联</text>
							<text class="linked-message-type">{{ linkedMessage.type }}</text>
						</view>
						<text class="linked-message-title">{{ linkedMessage.title }}</text>
						<text class="linked-message-content">{{ linkedMessage.content }}</text>
						<text class="linked-message-hint">💬 基于此消息发起讨论</text>
					</view>
				</view>

				<!-- 否则显示消息选择器 -->
				<view v-else class="form-item">
					<text class="form-label">关联消息 *</text>
					<picker
						mode="selector"
						:range="messages"
						range-key="title"
						@change="handleMessageChange"
					>
						<view class="picker-view">
							<text :class="formData.messageId ? 'picker-text' : 'picker-placeholder'">
								{{ formData.messageId ? getMessageTitle(formData.messageId) : '请选择要关联的消息' }}
							</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
					<text class="form-hint">💡 讨论基于消息内容，选择消息后可参考该内容发表观点</text>
				</view>

				<!-- 内容 -->
				<view class="form-item">
					<text class="form-label">讨论内容 *</text>
					<textarea
						class="form-textarea"
						v-model="formData.content"
						placeholder="请输入您的观点和分析..."
						placeholder-style="color: #999999"
						:maxlength="2000"
						:show-confirm-bar="false"
					/>
					<view class="char-count-wrapper">
						<text class="char-count">{{ formData.content.length }}/2000</text>
					</view>
				</view>

				<!-- 可见性说明 -->
				<view class="form-item">
					<view class="visibility-notice">
						<view class="notice-header">
							<text class="notice-icon">🔒</text>
							<text class="notice-title">私密讨论</text>
						</view>
						<view class="notice-content">
							<text class="notice-text">为避免不同投资风格的影响，讨论默认私密。优质内容经管理员审核后公开，确保合规性与内容质量。</text>
						</view>
					</view>
				</view>

				<!-- 提交按钮 -->
				<view class="button-group">
					<button class="cancel-btn" :disabled="submitting" @click="handleCancel">
						{{ submitting ? '提交中...' : '取消' }}
					</button>
					<button class="submit-btn" :disabled="submitting" @click="handleSubmit">
						<text v-if="!submitting">创建讨论</text>
						<view v-else class="submitting-content">
							<view class="submitting-spinner"></view>
							<text class="submitting-text">创建中{{ submitTimeout ? '，请稍候...' : '...' }}</text>
						</view>
					</button>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { createDiscussionApi } from '../../api/discussion'
import { getMessagesApi, getMessageDetailApi } from '../../api/message'

const userStore = useUserStore()

// 表单数据
const formData = ref({
	content: '',
	messageId: null
})

const submitting = ref(false)
const submitTimeout = ref(false) // 是否超时
const messages = ref([])
const linkedMessage = ref(null) // 存储关联的消息详情
const showMessagePicker = ref(true) // 是否显示消息选择器

// 获取消息标题
const getMessageTitle = (id) => {
	const message = messages.value.find(m => m.id === id)
	return message ? message.title : ''
}

// 处理消息选择
const handleMessageChange = (e) => {
	const index = e.detail.value
	formData.value.messageId = messages.value[index].id
}

// 加载消息列表
const loadMessages = async () => {
	try {
		const res = await getMessagesApi({ page: 1, limit: 100 })
		if (res.success) {
			messages.value = res.data.messages || []
		}
	} catch (error) {
		console.error('加载消息列表失败:', error)
	}
}

// 表单验证
const validateForm = () => {
	if (!formData.value.messageId) {
		uni.showToast({
			title: '请选择关联消息',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.content.trim()) {
		uni.showToast({
			title: '请输入讨论内容',
			icon: 'none'
		})
		return false
	}

	return true
}

// 提交表单
const handleSubmit = async () => {
	if (!validateForm()) return

	submitting.value = true
	submitTimeout.value = false

	// 设置超时提示定时器（45秒后显示提示）
	const timeoutTimer = setTimeout(() => {
		if (submitting.value) {
			submitTimeout.value = true
			uni.showLoading({
				title: '服务器响应较慢，请耐心等待...',
				mask: true
			})
		}
	}, 45000)

	try {
		// 获取关联消息的标题作为讨论标题
		let discussionTitle = '讨论'
		if (linkedMessage.value && linkedMessage.value.title) {
			discussionTitle = linkedMessage.value.title
		} else if (formData.value.messageId) {
			// 如果没有加载到关联消息，从消息列表中查找
			const message = messages.value.find(m => m.id === formData.value.messageId)
			if (message && message.title) {
				discussionTitle = message.title
			}
		}

		const data = {
			title: discussionTitle,
			content: formData.value.content.trim(),
			visibility: 'private' // 默认私密
		}

		// 关联消息ID
		if (formData.value.messageId) {
			data.messageId = formData.value.messageId
		}

		const res = await createDiscussionApi(data)

		// 清除超时定时器
		clearTimeout(timeoutTimer)

		// 隐藏loading（如果显示了）
		if (submitTimeout.value) {
			uni.hideLoading()
		}

		if (res.success) {
			uni.showToast({
				title: '创建成功',
				icon: 'success',
				duration: 2000
			})

			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} else {
			uni.showToast({
				title: res.message || '创建失败',
				icon: 'none',
				duration: 3000
			})
		}
	} catch (error) {
		// 清除超时定时器
		clearTimeout(timeoutTimer)

		// 隐藏loading（如果显示了）
		if (submitTimeout.value) {
			uni.hideLoading()
		}

		console.error('创建讨论失败:', error)

		// 判断错误类型
		let errorMsg = '创建失败，请重试'
		if (error.message && error.message.includes('timeout')) {
			errorMsg = '请求超时，请检查网络连接后重试'
		} else if (error.message && error.message.includes('Network')) {
			errorMsg = '网络连接失败，请检查网络设置'
		}

		uni.showToast({
			title: errorMsg,
			icon: 'none',
			duration: 3000
		})
	} finally {
		submitting.value = false
		submitTimeout.value = false
	}
}

// 取消
const handleCancel = () => {
	uni.showModal({
		title: '提示',
		content: '确定要取消吗？未保存的内容将丢失。',
		confirmText: '确定取消',
		cancelText: '继续编辑',
		success: (res) => {
			if (res.confirm) {
				uni.navigateBack()
			}
		}
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

	// 获取URL参数中的messageId（从消息详情页跳转过来）
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const messageId = currentPage.options.messageId

	if (messageId) {
		formData.value.messageId = parseInt(messageId)
		showMessagePicker.value = false // 隐藏选择器

		// 加载关联的消息详情
		loadLinkedMessage(parseInt(messageId))
	} else {
		// 如果没有消息ID，加载消息列表供选择
		loadMessages()
	}
})

// 加载关联的消息详情
const loadLinkedMessage = async (id) => {
	try {
		const res = await getMessageDetailApi(id)

		if (res.code === 200 || res.success) {
			linkedMessage.value = res.data
		} else {
			console.warn('加载关联消息失败:', res.message)
			uni.showToast({
				title: '加载消息失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载关联消息失败:', error)
	}
}
</script>

<style lang="scss" scoped>
.create-discussion-container {
	height: 100vh;
	background: #f5f5f5;
}

.form-scroll {
	height: 100%;
}

.form-container {
	padding: 30rpx;
}

.form-item {
	margin-bottom: 40rpx;
}

.form-label {
	display: block;
	font-size: 30rpx;
	color: #333333;
	margin-bottom: 20rpx;
	font-weight: 600;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 30rpx;
	color: #333333;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	box-sizing: border-box;
	transition: border-color 0.3s;

	&:focus {
		border-color: #667eea;
	}
}

.form-textarea {
	width: 100%;
	min-height: 300rpx;
	padding: 24rpx;
	font-size: 30rpx;
	color: #333333;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	box-sizing: border-box;
	line-height: 1.6;
	transition: border-color 0.3s;

	&:focus {
		border-color: #667eea;
	}
}

.char-count-wrapper {
	display: flex;
	justify-content: flex-end;
	margin-top: 10rpx;
}

.char-count {
	font-size: 24rpx;
	color: #999999;
}

.picker-view {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 24rpx;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	transition: border-color 0.3s;

	&:active {
		border-color: #667eea;
	}
}

.picker-text {
	font-size: 30rpx;
	color: #333333;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.picker-placeholder {
	font-size: 30rpx;
	color: #999999;
}

.picker-arrow {
	font-size: 20rpx;
	color: #999999;
	margin-left: 20rpx;
}

.form-hint {
	display: block;
	margin-top: 12rpx;
	font-size: 26rpx;
	color: #667eea;
	line-height: 1.6;
}

// 关联消息卡片
.linked-message-card {
	padding: 24rpx;
	background: linear-gradient(135deg, #f0f2ff 0%, #f5f3ff 100%);
	border-radius: 16rpx;
	border-left: 4rpx solid #667eea;
}

.linked-message-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.linked-message-badge {
	display: inline-block;
	padding: 6rpx 16rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 22rpx;
	border-radius: 20rpx;
	font-weight: 500;
}

.linked-message-type {
	display: inline-block;
	padding: 6rpx 16rpx;
	background: rgba(102, 126, 234, 0.1);
	color: #667eea;
	font-size: 22rpx;
	border-radius: 20rpx;
	font-weight: 500;
}

.linked-message-title {
	display: block;
	font-size: 30rpx;
	color: #333333;
	font-weight: 600;
	margin-bottom: 12rpx;
	line-height: 1.5;
}

.linked-message-content {
	display: block;
	font-size: 26rpx;
	color: #666666;
	line-height: 1.6;
	margin-bottom: 12rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.linked-message-hint {
	display: block;
	font-size: 24rpx;
	color: #667eea;
	font-weight: 500;
}

// 可见性说明
.visibility-notice {
	padding: 24rpx;
	background: #fff9e6;
	border-radius: 16rpx;
	border: 2rpx solid #ffe7ba;
}

.notice-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.notice-icon {
	font-size: 32rpx;
}

.notice-title {
	font-size: 28rpx;
	color: #d48806;
	font-weight: 600;
}

.notice-content {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.notice-text {
	display: block;
	font-size: 26rpx;
	color: #666666;
	line-height: 1.6;
	padding-left: 10rpx;

	&.highlight {
		color: #667eea;
		font-weight: 500;
		margin-top: 8rpx;
	}
}

.button-group {
	display: flex;
	gap: 20rpx;
	margin-top: 60rpx;
	padding-bottom: 40rpx;
}

.cancel-btn,
.submit-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 32rpx;
	border-radius: 12rpx;
	border: none;
	text-align: center;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cancel-btn[disabled] {
	opacity: 0.5;
}

.cancel-btn {
	background: #ffffff;
	color: #666666;
	border: 2rpx solid #e0e0e0;
}

.submit-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-weight: 600;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.submit-btn[disabled] {
	opacity: 0.6;
}

// 提交中动画
.submitting-content {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.submitting-spinner {
	width: 32rpx;
	height: 32rpx;
	border: 3rpx solid rgba(255, 255, 255, 0.3);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.submitting-text {
	font-size: 32rpx;
}
</style>
