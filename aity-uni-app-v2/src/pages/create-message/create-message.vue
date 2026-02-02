<template>
	<view class="create-message-container">
		<scroll-view class="form-scroll" scroll-y>
			<view class="form-container">
				<!-- 标题 -->
				<view class="form-item">
					<text class="form-label">消息标题 *</text>
					<input
						class="form-input"
						v-model="formData.title"
						type="text"
						placeholder="请输入消息标题"
						placeholder-style="color: #999999"
					/>
				</view>

				<!-- 类型 -->
				<view class="form-item">
					<text class="form-label">消息类型 *</text>
					<picker
						mode="selector"
						:range="messageTypes"
						range-key="label"
						@change="handleTypeChange"
					>
						<view class="picker-view">
							<text :class="formData.type ? 'picker-text' : 'picker-placeholder'">
								{{ formData.type ? getTypeLabel(formData.type) : '请选择消息类型' }}
							</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>

				<!-- 标签 -->
				<view class="form-item">
					<text class="form-label">目标用户 *</text>
					<view class="tags-container">
						<view
							v-for="tag in availableTags"
							:key="tag.value"
							class="tag-item"
							:class="{ active: formData.tags.includes(tag.value) }"
							@click="handleTagToggle(tag.value)"
						>
							{{ tag.label }}
						</view>
					</view>
				</view>

				<!-- 内容 -->
				<view class="form-item">
					<text class="form-label">消息内容 *</text>
					<textarea
						class="form-textarea"
						v-model="formData.content"
						placeholder="请输入消息内容"
						placeholder-style="color: #999999"
						:maxlength="5000"
						:show-confirm-bar="false"
					/>
					<text class="char-count">{{ formData.content.length }}/5000</text>
				</view>

				<!-- 附件上传 -->
				<view class="form-item">
					<text class="form-label">附件（可选）</text>
					<view class="upload-container">
						<view
							v-for="(file, index) in formData.attachments"
							:key="index"
							class="file-item"
						>
							<text class="file-name">{{ file.name }}</text>
							<text class="file-remove" @click="handleRemoveFile(index)">×</text>
						</view>
						<view class="upload-btn" @click="handleUpload">
							<text class="upload-icon">+</text>
							<text class="upload-text">上传附件</text>
						</view>
					</view>
					<text class="form-hint">支持 PDF、Word、Excel、图片等格式，单个文件不超过 10MB</text>
				</view>

				<!-- 提交按钮 -->
				<view class="button-group">
					<button class="cancel-btn" @click="handleCancel">取消</button>
					<button class="submit-btn" :disabled="submitting" @click="handleSubmit">
						{{ submitting ? '发布中...' : '发布消息' }}
					</button>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { createMessageApi } from '../../api/message'
import { MESSAGE_TYPES, MESSAGE_TYPE_LABELS, MESSAGE_TAGS, MESSAGE_TAG_LABELS } from '../../utils/constants'

const userStore = useUserStore()

// 表单数据
const formData = ref({
	title: '',
	type: '',
	tags: [],
	content: '',
	attachments: []
})

const submitting = ref(false)

// 消息类型选项
const messageTypes = computed(() => {
	return Object.keys(MESSAGE_TYPES).map(key => ({
		value: MESSAGE_TYPES[key],
		label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES[key]]
	}))
})

// 可用标签
const availableTags = [
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.ALL_USERS], value: MESSAGE_TAGS.ALL_USERS },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM], value: MESSAGE_TAGS.SHORT_TERM },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM], value: MESSAGE_TAGS.MID_TERM }
]

// 获取类型标签
const getTypeLabel = (type) => {
	return MESSAGE_TYPE_LABELS[type] || type
}

// 处理类型选择
const handleTypeChange = (e) => {
	const index = e.detail.value
	formData.value.type = messageTypes.value[index].value
}

// 处理标签切换
const handleTagToggle = (tag) => {
	const index = formData.value.tags.indexOf(tag)
	if (index > -1) {
		formData.value.tags.splice(index, 1)
	} else {
		formData.value.tags.push(tag)
	}
}

// 处理文件上传
const handleUpload = () => {
	uni.chooseFile({
		count: 1,
		extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
		success: (res) => {
			const file = res.tempFiles[0]

			// 检查文件大小
			if (file.size > 10 * 1024 * 1024) {
				uni.showToast({
					title: '文件大小不能超过 10MB',
					icon: 'none'
				})
				return
			}

			formData.value.attachments.push({
				name: file.name,
				path: file.path,
				size: file.size
			})
		},
		fail: (err) => {
			console.error('选择文件失败:', err)
			uni.showToast({
				title: '选择文件失败',
				icon: 'none'
			})
		}
	})
}

// 移除文件
const handleRemoveFile = (index) => {
	formData.value.attachments.splice(index, 1)
}

// 表单验证
const validateForm = () => {
	if (!formData.value.title.trim()) {
		uni.showToast({
			title: '请输入消息标题',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.type) {
		uni.showToast({
			title: '请选择消息类型',
			icon: 'none'
		})
		return false
	}

	if (formData.value.tags.length === 0) {
		uni.showToast({
			title: '请选择目标用户',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.content.trim()) {
		uni.showToast({
			title: '请输入消息内容',
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
			type: formData.value.type,
			tags: formData.value.tags,
			content: formData.value.content.trim(),
			attachments: formData.value.attachments
		}

		const res = await createMessageApi(data)

		if (res.success) {
			uni.showToast({
				title: '发布成功',
				icon: 'success'
			})

			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} else {
			uni.showToast({
				title: res.message || '发布失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('发布消息失败:', error)
		uni.showToast({
			title: '发布失败',
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
	// 检查管理员权限
	if (!userStore.isAdmin) {
		uni.showToast({
			title: '无权限访问',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	}
})
</script>

<style lang="scss" scoped>
.create-message-container {
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
}

.picker-placeholder {
	font-size: 28rpx;
	color: #999999;
}

.picker-arrow {
	font-size: 20rpx;
	color: #999999;
}

.tags-container {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.tag-item {
	padding: 16rpx 32rpx;
	font-size: 28rpx;
	color: #666666;
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	transition: all 0.3s;
}

.tag-item.active {
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-color: transparent;
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

.upload-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.file-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
}

.file-name {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-remove {
	font-size: 40rpx;
	color: #ff4d4f;
	margin-left: 20rpx;
}

.upload-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 160rpx;
	background: #ffffff;
	border: 2rpx dashed #d9d9d9;
	border-radius: 8rpx;
}

.upload-icon {
	font-size: 48rpx;
	color: #999999;
	margin-bottom: 10rpx;
}

.upload-text {
	font-size: 26rpx;
	color: #999999;
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
