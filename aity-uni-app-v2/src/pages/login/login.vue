<template>
	<view class="login-container">
		<view class="login-box">
			<view class="logo-section">
				<text class="app-title">VIP投研分享系统</text>
				<text class="app-subtitle">内部投研信息分享平台</text>
			</view>

			<view class="form-section">
				<view class="input-group">
					<input
						class="input-field"
						v-model="formData.account"
						placeholder="请输入用户名或邮箱"
						:maxlength="50"
					/>
				</view>

				<view class="input-group">
					<input
						class="input-field"
						v-model="formData.password"
						type="password"
						placeholder="请输入密码"
						:maxlength="50"
						@confirm="handleLogin"
					/>
				</view>

				<view class="remember-section">
					<checkbox-group @change="handleRememberChange">
						<label class="checkbox-label">
							<checkbox :checked="formData.rememberMe" />
							<text class="checkbox-text">记住我</text>
						</label>
					</checkbox-group>
				</view>

				<button
					class="login-btn"
					:class="{ 'loading': loading }"
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
	password: '',
	rememberMe: false
})

const loading = ref(false)

// 处理记住我选择
const handleRememberChange = (e) => {
	formData.value.rememberMe = e.detail.value.length > 0
}

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
		rememberMe: formData.value.rememberMe
	}

	loading.value = true

	try {
		const result = await userStore.login(loginData)

		if (result.success) {
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})

			// 跳转到消息页面
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/messages/messages'
				})
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
			title: '登录失败，请重试',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 页面加载时检查是否已登录
uni.onLoad(() => {
	if (userStore.isLoggedIn) {
		uni.switchTab({
			url: '/pages/messages/messages'
		})
	}
})
</script>

<style lang="scss" scoped>
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

.input-group {
	margin-bottom: 30rpx;
}

.input-field {
	width: 100%;
	height: 90rpx;
	padding: 0 30rpx;
	font-size: 28rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 10rpx;
	background: #f8f8f8;
	box-sizing: border-box;
}

.input-field:focus {
	border-color: #667eea;
	background: #ffffff;
}

.remember-section {
	margin-bottom: 40rpx;
}

.checkbox-label {
	display: flex;
	align-items: center;
}

.checkbox-text {
	margin-left: 10rpx;
	font-size: 28rpx;
	color: #666666;
}

.login-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 10rpx;
	border: none;
	text-align: center;
}

.login-btn.loading {
	opacity: 0.7;
}

.login-btn:active {
	opacity: 0.8;
}

.footer-section {
	text-align: center;
	margin-top: 40rpx;
}

.footer-text {
	font-size: 24rpx;
	color: #999999;
}
</style>
