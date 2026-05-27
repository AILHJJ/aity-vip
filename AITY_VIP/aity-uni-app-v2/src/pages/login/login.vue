<template>
	<view class="login-container">
		<view class="login-box">
			<view class="logo-section">
				<text class="app-title">投研图灵室</text>
				<text class="app-subtitle">金融知识学习平台</text>
			</view>

			<view class="form-section">
				<!-- 用户名输入框 -->
				<view class="input-wrapper">
					<text class="input-label">用户名/邮箱</text>
					<input
						v-model="formData.account"
						type="text"
						placeholder="请输入用户名或邮箱"
						placeholder-style="color: #999999"
						class="form-input"
					/>
				</view>

				<!-- 密码输入框 -->
				<view class="input-wrapper">
					<text class="input-label">密码</text>
					<input
						v-model="formData.password"
						type="password"
						placeholder="请输入密码"
						placeholder-style="color: #999999"
						class="form-input"
						@confirm="handleLogin"
					/>
				</view>

				<!-- 登录按钮 -->
				<button
					class="login-btn"
					:disabled="loading"
					@click="handleLogin"
				>
					{{ loading ? '登录中...' : '登录' }}
				</button>
			</view>

			<view class="footer-section">
				<text class="footer-text">请使用管理员分配的账号登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const formData = ref({
	account: '',
	password: ''
})

const loading = ref(false)

// 处理登录
const handleLogin = async () => {
	// 验证表单
	if (!formData.value.account) {
		uni.showToast({
			title: '请输入用户名或邮箱',
			icon: 'none'
		})
		return
	}

	if (!formData.value.password) {
		uni.showToast({
			title: '请输入密码',
			icon: 'none'
		})
		return
	}

	// 判断是邮箱还是用户名
	const isEmail = formData.value.account.includes('@')
	const loginData = {
		[isEmail ? 'email' : 'username']: formData.value.account,
		password: formData.value.password,
		rememberMe: true  // 默认记住用户
	}

	loading.value = true

	try {
		const result = await userStore.login(loginData)

		if (result.code === 200 && result.data) {
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})

			// 检测是否使用初始密码
			const isInitialPassword = result.data.user?.isInitialPassword
			const lastLoginAt = result.data.user?.lastLoginAt

			// 跳转到消息页面（reLaunch 确保干净的页面栈）
			setTimeout(() => {
				// 如果是初始密码，提示用户修改
				if (isInitialPassword) {
					uni.showModal({
						title: '安全提示',
						content: '检测到您正在使用初始密码，为了账户安全，建议您尽快修改密码。是否现在修改？',
						confirmText: '去修改',
						cancelText: '稍后再说',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/change-password/change-password'
								})
							} else {
								uni.switchTab({
									url: '/pages/messages/messages'
								})
							}
						}
					})
				} else {
					// 显示上次登录时间
					if (lastLoginAt) {
						const loginTime = new Date(lastLoginAt)
						const timeStr = loginTime.toLocaleString('zh-CN', {
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						})
						uni.showToast({
							title: `上次登录: ${timeStr}`,
							icon: 'none',
							duration: 2000
						})
					}

					uni.switchTab({
						url: '/pages/messages/messages'
					})
				}
			}, 1000)
		} else {
			uni.showToast({
				title: result.message || '登录失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('登录失败:', error)
		uni.showToast({
			title: error.message || '登录失败，请重试',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}
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

.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.login-box {
	width: 100%;
	max-width: 600rpx;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* H5端桌面优化 - 使用媒体查询 */
/* #ifdef H5 */
@media screen and (min-width: 768px) {
	.login-box {
		max-width: 480px;
		padding: 45px 40px;
		border-radius: 16px;
	}
}

@media screen and (min-width: 1200px) {
	.login-box {
		max-width: 520px;
		padding: 55px 50px;
	}
}
/* #endif */

.logo-section {
	text-align: center;
	margin-bottom: 60rpx;
}

.app-title {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
}

.app-subtitle {
	display: block;
	font-size: 28rpx;
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

/* H5端输入框优化 */
/* #ifdef H5 */
@media screen and (min-width: 768px) {
	.form-input {
		height: 48px;
		padding: 0 16px;
		font-size: 15px;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
	}
}
/* #endif */

.login-btn {
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
	margin-top: 10rpx;
}

.login-btn[disabled] {
	opacity: 0.6;
}

/* H5端按钮优化 */
/* #ifdef H5 */
@media screen and (min-width: 768px) {
	.login-btn {
		height: 50px;
		line-height: 50px;
		font-size: 17px;
		border-radius: 6px;
		margin-top: 15px;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.login-btn:hover:not([disabled]) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.login-btn:active:not([disabled]) {
		transform: translateY(0);
	}
}
/* #endif */

.footer-section {
	text-align: center;
	margin-top: 40rpx;
}

.footer-text {
	display: block;
	font-size: 24rpx;
	color: #999999;
	margin-top: 10rpx;
}
</style>
