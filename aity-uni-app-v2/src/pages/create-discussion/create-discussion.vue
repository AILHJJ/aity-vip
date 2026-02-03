<template>
	<view class="create-discussion-container">
		<scroll-view class="form-scroll" scroll-y>
			<view class="form-container">
				<!-- 标题 -->
				<view class="form-item">
					<Input
						v-model="formData.title"
						label="讨论标题"
						placeholder="请输入讨论标题"
						maxlength="100"
					/>
				</view>

				<!-- 内容 -->
				<view class="form-item">
					<text class="form-label">讨论内容 *</text>
					<textarea
						class="form-textarea"
						v-model="formData.content"
						placeholder="请输入讨论内容"
						placeholder-style="color: #999999"
						:maxlength="2000"
						:show-confirm-bar="false"
					/>
					<text class="char-count">{{ formData.content.length }}/2000</text>
				</view>

				<!-- 可见性 -->
				<view class="form-item">
					<text class="form-label">可见性 *</text>
					<view class="visibility-container">
						<view
							v-for="option in visibilityOptions"
							:key="option.value"
							class="visibility-item"
							:class="{ active: formData.visibility === option.value }"
							@click="formData.visibility = option.value"
						>
							<text class="visibility-icon">{{ option.icon }}</text>
							<view class="visibility-info">
								<text class="visibility-label">{{ option.label }}</text>
								<text class="visibility-desc">{{ option.desc }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 关联消息（可选） -->
				<view class="form-item">
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
					<text class="form-hint">必须关联一条消息，讨论将显示在该消息的讨论区</text>
				</view>

				<!-- 提交按钮 -->
				<view class="button-group">
					<button class="cancel-btn" @click="handleCancel">取消</button>
					<button class="submit-btn" :disabled="submitting" @click="handleSubmit">
						{{ submitting ? '创建中...' : '创建讨论' }}
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
import { getMessagesApi } from '../../api/message'
import { Input } from '@/components/common'

const userStore = useUserStore()

// 表单数据
const formData = ref({
	title: '',
	content: '',
	visibility: 'public',
	messageId: null
})

const submitting = ref(false)
const messages = ref([])

// 可见性选项
const visibilityOptions = [
	{
		value: 'public',
		label: '公开',
		desc: '所有用户可见',
		icon: '🌐'
	},
	{
		value: 'private',
		label: '私密',
		desc: '仅管理员可见',
		icon: '🔒'
	}
]

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
	if (!formData.value.title.trim()) {
		uni.showToast({
			title: '请输入讨论标题',
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

	if (!formData.value.messageId) {
		uni.showToast({
			title: '请选择关联消息',
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

	try {
		const data = {
			title: formData.value.title.trim(),
			content: formData.value.content.trim(),
			visibility: formData.value.visibility
		}

		// 如果选择了关联消息
		if (formData.value.messageId) {
			data.messageId = formData.value.messageId
		}

		const res = await createDiscussionApi(data)

		if (res.success) {
			uni.showToast({
				title: '创建成功',
				icon: 'success'
			})

			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} else {
			uni.showToast({
				title: res.message || '创建失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('创建讨论失败:', error)
		uni.showToast({
			title: '创建失败',
			icon: 'none'
		})
	} finally {
		submitting.value = false
	}
}

// 取消
const handleCancel = () => {
	uni.showModal({
		title: '提示',
		content: '确定要取消吗？未保存的内容将丢失。',
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
	}

	loadMessages()
})
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
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 20rpx;
	font-weight: 500;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.form-textarea {
	width: 100%;
	min-height: 300rpx;
	padding: 24rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
	line-height: 1.6;
}

.char-count {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #999999;
	text-align: right;
}

.visibility-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.visibility-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	transition: all 0.3s;
}

.visibility-item.active {
	border-color: #667eea;
	background: #f0f2ff;
}

.visibility-icon {
	font-size: 48rpx;
	margin-right: 20rpx;
}

.visibility-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.visibility-label {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.visibility-desc {
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
	border-radius: 8rpx;
}

.picker-text {
	font-size: 28rpx;
	color: #333333;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.picker-placeholder {
	font-size: 28rpx;
	color: #999999;
}

.picker-arrow {
	font-size: 20rpx;
	color: #999999;
	margin-left: 20rpx;
}

.form-hint {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #999999;
	line-height: 1.5;
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
	border-radius: 8rpx;
	border: none;
	text-align: center;
}

.cancel-btn {
	background: #ffffff;
	color: #666666;
	border: 2rpx solid #e0e0e0;
}

.submit-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-weight: bold;
}

.submit-btn[disabled] {
	opacity: 0.6;
}
</style>
