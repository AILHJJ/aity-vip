<template>
	<view class="change-email-container">
		<view class="form-card">
			<view class="card-header">
				<text class="card-title">修改邮箱</text>
				<text class="card-subtitle">邮件提醒会发送到这里，请填写可正常接收的邮箱</text>
			</view>

			<view class="current-email">
				<text class="current-label">当前邮箱</text>
				<text class="current-value">{{ currentEmailText }}</text>
			</view>

			<view class="form-section">
				<view class="input-wrapper">
					<text class="input-label">新邮箱</text>
					<input
						v-model="formData.email"
						type="text"
						placeholder="请输入新邮箱"
						placeholder-style="color: #999999"
						class="form-input"
						confirm-type="done"
						@confirm="handleSubmit"
					/>
				</view>

				<button class="submit-btn" :disabled="loading" @click="handleSubmit">
					{{ loading ? '提交中...' : '确认修改' }}
				</button>
			</view>

			<view class="email-tips">
				<text class="tips-title">说明</text>
				<text class="tips-item">1. 请填写真实可用邮箱，否则无法收到消息提醒</text>
				<text class="tips-item">2. 系统占位邮箱不能用于邮件提醒</text>
				<text class="tips-item">3. 邮箱仅用于投研消息提醒和账户识别</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const formData = ref({
	email: userStore.userEmail || ''
})
const loading = ref(false)

const currentEmailText = computed(() => {
	return userStore.userEmail || '暂未设置'
})

const normalizeEmail = (email) => {
	return String(email || '').trim().toLowerCase()
}

const validateEmail = (email) => {
	const normalizedEmail = normalizeEmail(email)

	if (!normalizedEmail) {
		return '请输入邮箱'
	}

	if (normalizedEmail.endsWith('@users.aity.vip')) {
		return '请填写真实可接收邮件的邮箱'
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return '邮箱格式不正确'
	}

	return ''
}

const handleSubmit = async () => {
	const email = normalizeEmail(formData.value.email)
	const validationMessage = validateEmail(email)

	if (validationMessage) {
		uni.showToast({
			title: validationMessage,
			icon: 'none'
		})
		return
	}

	loading.value = true

	try {
		const result = await userStore.changeEmail({ email })

		if (result.success) {
			uni.showToast({
				title: '邮箱修改成功',
				icon: 'success'
			})

			setTimeout(() => {
				uni.navigateBack()
			}, 1200)
		} else {
			uni.showToast({
				title: result.message || '邮箱修改失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('修改邮箱失败:', error)
		uni.showToast({
			title: error.message || '邮箱修改失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}
</script>

<style lang="scss" scoped>
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

.change-email-container {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 20rpx;
}

.form-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
}

.card-header {
	text-align: center;
	margin-bottom: 36rpx;
}

.card-title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.card-subtitle {
	display: block;
	font-size: 26rpx;
	color: #999999;
	line-height: 1.5;
}

.current-email {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 22rpx 24rpx;
	margin-bottom: 34rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	border: 1rpx solid #e5e7eb;
}

.current-label {
	font-size: 26rpx;
	color: #666666;
	flex-shrink: 0;
}

.current-value {
	font-size: 26rpx;
	color: #333333;
	word-break: break-all;
	text-align: right;
}

.form-section {
	margin-bottom: 40rpx;
}

.input-wrapper {
	margin-bottom: 30rpx;
}

.input-label {
	display: block;
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 12rpx;
	font-weight: 500;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #f5f5f5;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 8rpx;
	text-align: center;
	margin-top: 20rpx;
}

.submit-btn[disabled] {
	opacity: 0.6;
}

.email-tips {
	background: #eff6ff;
	border-radius: 8rpx;
	padding: 20rpx;
	border-left: 4rpx solid #3b82f6;
}

.tips-title {
	display: block;
	font-size: 26rpx;
	font-weight: bold;
	color: #1d4ed8;
	margin-bottom: 10rpx;
}

.tips-item {
	display: block;
	font-size: 24rpx;
	color: #1e40af;
	line-height: 1.8;
}
</style>
