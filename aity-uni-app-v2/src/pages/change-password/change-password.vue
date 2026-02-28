<template>
	<view class="change-password-container">
		<view class="form-card">
			<view class="card-header">
				<text class="card-title">修改密码</text>
				<text class="card-subtitle">为了账户安全，请定期修改密码</text>
			</view>

			<view class="form-section">
				<!-- 当前密码 -->
				<view class="input-wrapper">
					<text class="input-label">当前密码</text>
					<input
						v-model="formData.currentPassword"
						type="password"
						placeholder="请输入当前密码"
						placeholder-style="color: #999999"
						class="form-input"
					/>
				</view>

				<!-- 新密码 -->
				<view class="input-wrapper">
					<text class="input-label">新密码</text>
					<input
						v-model="formData.newPassword"
						type="password"
						placeholder="请输入新密码（至少6位）"
						placeholder-style="color: #999999"
						class="form-input"
					/>
				</view>

				<!-- 确认新密码 -->
				<view class="input-wrapper">
					<text class="input-label">确认新密码</text>
					<input
						v-model="formData.confirmPassword"
						type="password"
						placeholder="请再次输入新密码"
						placeholder-style="color: #999999"
						class="form-input"
					/>
				</view>

				<!-- 提交按钮 -->
				<button class="submit-btn" :disabled="loading" @click="handleSubmit">
					{{ loading ? '提交中...' : '确认修改' }}
				</button>
			</view>

			<!-- 安全提示 -->
			<view class="security-tips">
				<text class="tips-title">安全提示</text>
				<text class="tips-item">1. 密码长度至少6位</text>
				<text class="tips-item">2. 建议使用字母、数字、符号组合</text>
				<text class="tips-item">3. 请勿使用与其他平台相同的密码</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const formData = ref({
	currentPassword: '',
	newPassword: '',
	confirmPassword: ''
})

const loading = ref(false)

const handleSubmit = async () => {
	// 验证表单
	if (!formData.value.currentPassword) {
		uni.showToast({
			title: '请输入当前密码',
			icon: 'none'
		})
		return
	}

	if (!formData.value.newPassword) {
		uni.showToast({
			title: '请输入新密码',
			icon: 'none'
		})
		return
	}

	if (formData.value.newPassword.length < 6) {
		uni.showToast({
			title: '新密码长度至少6位',
			icon: 'none'
		})
		return
	}

	if (formData.value.newPassword !== formData.value.confirmPassword) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		})
		return
	}

	if (formData.value.currentPassword === formData.value.newPassword) {
		uni.showToast({
			title: '新密码不能与当前密码相同',
			icon: 'none'
		})
		return
	}

	loading.value = true

	try {
		const result = await userStore.changePassword({
			currentPassword: formData.value.currentPassword,
			newPassword: formData.value.newPassword
		})

		if (result.success) {
			uni.showToast({
				title: '密码修改成功',
				icon: 'success'
			})

			// 清空表单
			formData.value = {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			}

			// 返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} else {
			uni.showToast({
				title: result.message || '密码修改失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('修改密码失败:', error)
		uni.showToast({
			title: error.message || '密码修改失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}
</script>

<style lang="scss" scoped>
.change-password-container {
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
	margin-bottom: 40rpx;
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
	transition: all 0.3s;

	&:focus {
		background-color: #ffffff;
		border-color: #667eea;
	}
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
	border: none;
	text-align: center;
	margin-top: 20rpx;
}

.submit-btn[disabled] {
	opacity: 0.6;
}

.security-tips {
	background: #fff9e6;
	border-radius: 8rpx;
	padding: 20rpx;
	border-left: 4rpx solid #ffc107;
}

.tips-title {
	display: block;
	font-size: 26rpx;
	font-weight: bold;
	color: #856404;
	margin-bottom: 10rpx;
}

.tips-item {
	display: block;
	font-size: 24rpx;
	color: #856404;
	line-height: 1.8;
}
</style>
