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

				<!-- 记住我和忘记密码 -->
				<view class="form-actions">
					<checkbox-group @change="handleRememberChange">
						<label class="checkbox-label">
							<checkbox :checked="formData.rememberMe" color="#667eea" />
							<text class="checkbox-text">记住我</text>
						</label>
					</checkbox-group>
					<!-- 预留忘记密码链接 -->
					<text class="forgot-password">忘记密码？</text>
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

		if (result.code === 200 && result.data) {
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
			title: error.message || '登录失败，请重试',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}
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

.form-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	min-height: 40rpx;
}

.checkbox-label {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.checkbox-text {
	margin-left: 10rpx;
	font-size: 26rpx;
	color: #666666;
}

.forgot-password {
	font-size: 26rpx;
	color: #667eea;
	text-decoration: none;
	opacity: 0.6;
	cursor: not-allowed;
}

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
