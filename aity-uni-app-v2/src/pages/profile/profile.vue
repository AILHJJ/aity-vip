<template>
	<view class="profile-container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-avatar">
				<text class="avatar-text">{{ userInitial }}</text>
			</view>
			<view class="user-info">
				<text class="user-name">{{ userStore.userName }}</text>
				<text class="user-role">{{ getRoleLabel(userStore.userRole) }}</text>
			</view>
			<view class="card-decoration"></view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToMarket">
				<view class="menu-left">
					<text class="menu-icon">📈</text>
					<text class="menu-text">行情中心</text>
					<text class="menu-tag">体验版</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view class="menu-item" @click="goToMessages">
				<view class="menu-left">
					<text class="menu-icon">📨</text>
					<text class="menu-text">消息中心</text>
				</view>
				<view class="menu-right">
					<view v-if="userStore.hasUnread" class="unread-badge">
						<text class="unread-count">{{ userStore.unreadCount > 99 ? '99+' : userStore.unreadCount }}</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view class="menu-item" @click="goToFavorites">
				<view class="menu-left">
					<text class="menu-icon">⭐</text>
					<text class="menu-text">我的收藏</text>
				</view>
				<view class="menu-right">
					<text class="menu-count">{{ favoriteCount }}</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view class="menu-item" @click="goToMyDiscussions">
				<view class="menu-left">
					<text class="menu-icon">💬</text>
					<text class="menu-text">我的讨论</text>
				</view>
				<view class="menu-right">
					<text class="menu-count">{{ discussionCount }}</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item" @click="goToUserManagement">
				<view class="menu-left">
					<text class="menu-icon">👥</text>
					<text class="menu-text">用户管理</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item" @click="goToStats">
				<view class="menu-left">
					<text class="menu-icon">📊</text>
					<text class="menu-text">数据统计</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item" @click="goToAiConfig">
				<view class="menu-left">
					<text class="menu-icon">🤖</text>
					<text class="menu-text">AI管理</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<!-- 系统设置 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToChangePassword">
				<view class="menu-left">
					<text class="menu-icon">🔐</text>
					<text class="menu-text">修改密码</text>
				</view>
				<view class="menu-right">
					<view v-if="userStore.isInitialPassword" class="security-badge">
						<text class="badge-text">初始密码</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<!-- 主题设置 -->
			<view class="menu-item" @click="showThemeSettings">
				<view class="menu-left">
					<text class="menu-icon">🎨</text>
					<text class="menu-text">主题设置</text>
				</view>
				<view class="menu-right">
					<text class="theme-preview" :class="themeStore.isDark ? 'dark-preview' : 'light-preview'">
						{{ themeStore.mode === 'system' ? '跟随系统' : (themeStore.isDark ? '深色' : '浅色') }}
					</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view class="menu-item" @click="showAbout">
				<view class="menu-left">
					<text class="menu-icon">ℹ️</text>
					<text class="menu-text">关于我们</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-section">
			<button class="logout-btn" @click="handleLogout">
				退出登录
			</button>
		</view>

		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">VIP投研分享系统 v1.0.0</text>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { useThemeStore, ThemeMode } from '../../store/theme'
import { USER_ROLE_LABELS } from '../../utils/constants'
import { getDiscussionsApi } from '../../api/discussion'

const userStore = useUserStore()
const themeStore = useThemeStore()

// 主题选择器状态
const showThemePicker = ref(false)
const themeOptions = [
	{ value: ThemeMode.LIGHT, label: '浅色模式', icon: '☀️' },
	{ value: ThemeMode.DARK, label: '深色模式', icon: '🌙' },
	{ value: ThemeMode.SYSTEM, label: '跟随系统', icon: '🔄' }
]

// 统计数据
const favoriteCount = ref(0)
const discussionCount = ref(0)

// 用户名首字母
const userInitial = computed(() => {
	const name = userStore.userName
	return name ? name.charAt(0).toUpperCase() : 'U'
})

// 获取角色标签
const getRoleLabel = (role) => {
	return USER_ROLE_LABELS[role] || role
}

// 加载统计数据
const loadStats = async () => {
	try {
		// TODO: 加载收藏数 - 需要实现favorite API
		favoriteCount.value = 0

		// 加载讨论数
		const discRes = await getDiscussionsApi({ page: 1, limit: 1 })
		if (discRes.success) {
			discussionCount.value = discRes.data.total || 0
		}
	} catch (error) {
		console.error('加载统计数据失败:', error)
	}
}

onMounted(() => {
	loadStats()
})

// 跳转到行情中心
const goToMarket = () => {
	uni.navigateTo({
		url: '/pages/market/market'
	})
}

// 跳转到消息中心
const goToMessages = () => {
	uni.switchTab({
		url: '/pages/messages/messages'
	})
}

// 跳转到收藏页面
const goToFavorites = () => {
	uni.navigateTo({
		url: '/pages/favorites/favorites'
	})
}

// 跳转到我的讨论
const goToMyDiscussions = () => {
	uni.navigateTo({
		url: '/pages/my-discussions/my-discussions'
	})
}

// 跳转到用户管理
const goToUserManagement = () => {
	uni.navigateTo({
		url: '/pages/user-management/user-management'
	})
}

// 跳转到数据统计
const goToStats = () => {
	uni.navigateTo({
		url: '/pages/stats/stats'
	})
}

// 跳转到AI配置管理
const goToAiConfig = () => {
	uni.navigateTo({
		url: '/pages/admin/ai-config'
	})
}

// 跳转到修改密码
const goToChangePassword = () => {
	uni.navigateTo({
		url: '/pages/change-password/change-password'
	})
}

// 显示关于信息
const showAbout = () => {
	uni.showModal({
		title: '关于我们',
		content: 'VIP投研内部分享系统\n\n一个面向内部用户的私密投研分享平台\n\n版本：v1.0.0',
		showCancel: false,
		confirmText: '知道了'
	})
}

// 显示主题设置弹窗
const showThemeSettings = () => {
	const currentMode = themeStore.mode
	const options = themeOptions.map(t => {
		const prefix = t.value === currentMode ? '✓ ' : '   '
		return `${prefix}${t.label}`
	}).join('\n')

	uni.showActionSheet({
		itemList: options.split('\n'),
		success: (res) => {
			const selectedOption = themeOptions[res.tapIndex]
			if (selectedOption) {
				themeStore.setMode(selectedOption.value)
			}
		}
	})
}

// 退出登录
const handleLogout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				userStore.logout()
			}
		}
	})
}
</script>

<style lang="scss" scoped>
.profile-container {
	min-height: 100vh;
	background-color: var(--bg-primary);
	padding-bottom: 40rpx;
}

/* 用户卡片 - 深色模式使用科技渐变 */
.user-card {
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
	padding: 60rpx 40rpx;
	display: flex;
	align-items: center;
	gap: 30rpx;
	position: relative;
	overflow: hidden;
}

.card-decoration {
	position: absolute;
	right: -50rpx;
	top: -50rpx;
	width: 200rpx;
	height: 200rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
	font-size: 48rpx;
	color: #ffffff;
	font-weight: bold;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.user-name {
	font-size: 36rpx;
	color: #ffffff;
	font-weight: bold;
}

.user-role {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.8);
	padding: 6rpx 16rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 12rpx;
	align-self: flex-start;
}

/* 菜单区块 - 玻璃拟态 */
.menu-section {
	background-color: var(--bg-card);
	margin: 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
	border: 1rpx solid var(--border-primary);
	box-shadow: var(--shadow-card);
}

.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid var(--border-secondary);
	transition: all 0.2s ease;
}

.menu-item:active {
	background-color: var(--bg-hover);
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.menu-icon {
	font-size: 40rpx;
}

.menu-text {
	font-size: 30rpx;
	color: var(--text-primary);
}

.menu-tag {
	font-size: 20rpx;
	color: #ffffff;
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	margin-left: 8rpx;
}

.menu-right {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.menu-count {
	font-size: 26rpx;
	color: var(--text-secondary);
	background-color: var(--bg-tertiary);
	padding: 4rpx 16rpx;
	border-radius: 12rpx;
}

.unread-badge {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 8rpx;
	background: var(--color-up);
	border-radius: 18rpx;
	margin-right: 10rpx;
}

.unread-count {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 600;
	line-height: 1;
}

.menu-arrow {
	font-size: 48rpx;
	color: var(--text-tertiary);
	font-weight: 300;
}

.security-badge {
	background: var(--color-accent);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	margin-right: 10rpx;
}

.badge-text {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 500;
}

.logout-section {
	padding: 0 20rpx;
	margin-top: 40rpx;
}

.logout-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background-color: var(--bg-card);
	color: var(--color-up);
	font-size: 32rpx;
	border-radius: 16rpx;
	border: 1rpx solid var(--border-primary);
	text-align: center;
}

.logout-btn:active {
	opacity: 0.8;
	background-color: var(--bg-hover);
}

.version-info {
	text-align: center;
	padding: 40rpx 0;
}

.version-text {
	font-size: 24rpx;
	color: var(--text-tertiary);
}

/* 主题预览样式 */
.theme-preview {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	margin-right: 10rpx;
}

.theme-preview.light-preview {
	background-color: var(--bg-tertiary);
	color: var(--text-secondary);
}

.theme-preview.dark-preview {
	background: rgba(56, 189, 248, 0.15);
	color: var(--color-primary);
}
</style>
