<template>
	<view class="profile-container">
		<!-- #ifdef H5 -->
		<pc-top-nav active="profile" />
		<!-- #endif -->

		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-avatar" :style="{ background: avatarGradient }" @click="showAvatarPicker = true">
				<text class="avatar-text">{{ userInitial || 'U' }}</text>
				<text class="avatar-edit-hint">换</text>
			</view>
			<view class="user-info">
				<text class="user-name">{{ userStore.userName || '用户' }}</text>
				<text class="user-role">{{ getRoleLabel(userStore.userRole) }}</text>
				<text class="user-email">{{ userEmailText }}</text>
			</view>
			<view class="card-decoration"></view>
		</view>

		<!-- 头像选择弹层 -->
		<view v-if="showAvatarPicker" class="avatar-picker-mask" @click="showAvatarPicker = false">
			<view class="avatar-picker" @click.stop>
				<text class="picker-title">选择默认头像</text>
				<text class="picker-hint">点击色块即可更换，自动保存</text>
				<view class="avatar-grid">
					<view
						v-for="(p, i) in AVATAR_PRESETS"
						:key="i"
						class="avatar-option"
						:class="{ selected: selectedAvatarIndex === i }"
						:style="{ background: p }"
						@click="chooseAvatar(i)"
					>
						<text class="avatar-option-text">{{ userInitial || 'U' }}</text>
						<text v-if="selectedAvatarIndex === i" class="avatar-check">✓</text>
					</view>
				</view>
				<button class="picker-done" @click="showAvatarPicker = false">完成</button>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToFavorites">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="star-filled" size="22" color="#f59e0b"></uni-icons>
					<text class="menu-text">我的收藏</text>
				</view>
				<view class="menu-right">
					<text class="menu-count">{{ favoriteCount }}</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view class="menu-item" @click="goToMyDiscussions">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="chat-filled" size="22" color="#3b82f6"></uni-icons>
					<text class="menu-text">我的讨论</text>
				</view>
				<view class="menu-right">
					<text v-if="unreadReplyCount > 0" class="reply-unread-badge">{{ unreadReplyCount > 99 ? '99+' : unreadReplyCount }}</text>
					<text class="menu-count">{{ discussionCount }}</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item admin-only-mobile" @click="goToUserManagement">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="staff-filled" size="22" color="#10b981"></uni-icons>
					<text class="menu-text">用户管理</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item admin-only-mobile" @click="goToStats">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="bars" size="22" color="#6366f1"></uni-icons>
					<text class="menu-text">数据统计</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item admin-only-mobile" @click="goToAiConfig">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="gear-filled" size="22" color="#8b5cf6"></uni-icons>
					<text class="menu-text">AI管理</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<!-- 系统设置 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToChangePassword">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="locked-filled" size="22" color="#ef4444"></uni-icons>
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
			<view class="menu-item" @click="goToChangeEmail">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="email-filled" size="22" color="#0ea5e9"></uni-icons>
					<text class="menu-text">修改邮箱</text>
				</view>
				<view class="menu-right">
					<text class="email-preview">{{ userEmailPreview }}</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item admin-only-mobile" @click="goToAgentConfig">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="headphones" size="22" color="#8b5cf6"></uni-icons>
					<text class="menu-text">Agent 管理</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view v-if="userStore.isAdmin" class="menu-item admin-only-mobile" @click="goToBotConfig">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="link" size="22" color="#10b981"></uni-icons>
					<text class="menu-text">渠道配置</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view class="menu-item" @click="showThemeSettings">
				<view class="menu-left">
					<uni-icons class="menu-icon" type="color-filled" size="22" color="#f43f5e"></uni-icons>
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
					<uni-icons class="menu-icon" type="info-filled" size="22" color="#94a3b8"></uni-icons>
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
			<text class="version-text">VIP投研分享系统 v1.6.0</text>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { useThemeStore, ThemeMode } from '../../store/theme'
import { USER_ROLE_LABELS } from '../../utils/constants'
import { getDiscussionsApi, getUnreadReplyCountApi } from '../../api/discussion'
import { getFavoriteMessagesApi } from '../../api/message'
import PcTopNav from '@/components/pc-top-nav.vue'

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

// ===== 预设头像（8 款：渐变 + 高光光斑双层背景，无后端依赖，本地保存选择） =====
// 高光层：左上 radial 光斑 + 右下反光弧，提升质感
const hl = 'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 42%)'
const AVATAR_PRESETS = [
	`radial-gradient(circle at 72% 78%, rgba(103,126,234,0.55) 0%, rgba(103,126,234,0) 55%), ${hl}, linear-gradient(135deg, #667eea 0%, #764ba2 100%)`, // 极光紫
	`radial-gradient(circle at 72% 78%, rgba(245,87,108,0.5) 0%, rgba(245,87,108,0) 55%), ${hl}, linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`,   // 樱花粉
	`radial-gradient(circle at 72% 78%, rgba(0,242,254,0.5) 0%, rgba(0,242,254,0) 55%), ${hl}, linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`,     // 海洋蓝
	`radial-gradient(circle at 72% 78%, rgba(56,249,215,0.5) 0%, rgba(56,249,215,0) 55%), ${hl}, linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)`,   // 翡翠绿
	`radial-gradient(circle at 30% 80%, rgba(255,225,64,0.5) 0%, rgba(255,225,64,0) 50%), ${hl}, linear-gradient(135deg, #fa709a 0%, #fee140 100%)`,   // 落日晚霞
	`radial-gradient(circle at 72% 78%, rgba(48,207,208,0.55) 0%, rgba(48,207,208,0) 55%), ${hl}, linear-gradient(135deg, #30cfd0 0%, #330867 100%)`,  // 深海蓝
	`radial-gradient(circle at 72% 78%, rgba(255,210,0,0.5) 0%, rgba(255,210,0,0) 55%), ${hl}, linear-gradient(135deg, #f7971e 0%, #ffd200 100%)`,     // 琥珀金
	`radial-gradient(circle at 72% 78%, rgba(254,214,227,0.7) 0%, rgba(254,214,227,0) 55%), ${hl}, linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)` // 薄荷粉
]
const showAvatarPicker = ref(false)

// 初始头像：用户手选优先；否则按 userId 哈希确定性选一款（不同用户进来自动不同）
function initAvatarIndex() {
	const saved = uni.getStorageSync('preferredAvatar')
	if (saved !== '' && saved !== null && AVATAR_PRESETS[saved] !== undefined) return saved
	const idStr = String(userStore.userId || 'u')
	let h = 0
	for (let i = 0; i < idStr.length; i++) h = (h * 31 + idStr.charCodeAt(i)) >>> 0
	return h % AVATAR_PRESETS.length
}
const selectedAvatarIndex = ref(initAvatarIndex())
const avatarGradient = computed(() => AVATAR_PRESETS[selectedAvatarIndex.value])

function chooseAvatar(i) {
	selectedAvatarIndex.value = i
	uni.setStorageSync('preferredAvatar', i)
}

// 用户名首字母（优化：确保总是有值）
const userInitial = computed(() => {
	const name = userStore.userName
	if (!name || name.trim() === '') {
		return 'U' // 默认显示U
	}
	// 处理中文名，取第一个字符
	return name.charAt(0).toUpperCase()
})

const isPlaceholderEmail = computed(() => {
	return String(userStore.userEmail || '').toLowerCase().endsWith('@users.aity.vip')
})

const userEmailText = computed(() => {
	if (!userStore.userEmail || isPlaceholderEmail.value) {
		return '未设置有效邮箱'
	}
	return userStore.userEmail
})

const userEmailPreview = computed(() => {
	if (!userStore.userEmail || isPlaceholderEmail.value) {
		return '待完善'
	}
	return userStore.userEmail.length > 18
		? `${userStore.userEmail.slice(0, 15)}...`
		: userStore.userEmail
})

// 获取角色标签
const getRoleLabel = (role) => {
	return USER_ROLE_LABELS[role] || role
}

// 加载统计数据
const loadStats = async () => {
	try {
		// 加载收藏数
		try {
			const favRes = await getFavoriteMessagesApi({ page: 1, limit: 1 })
			if (favRes.code === 200 && favRes.data) {
				favoriteCount.value = favRes.data.pagination?.total || favRes.data.total || 0
			}
		} catch (e) {
			console.error('加载收藏数失败:', e)
		}

		// 加载讨论数
		try {
			const discRes = await getDiscussionsApi({ page: 1, limit: 1 })
			if (discRes.code === 200 && discRes.data) {
				discussionCount.value = discRes.data.pagination?.total || discRes.data.total || 0
			} else if (discRes.success && discRes.data) {
				discussionCount.value = discRes.data.total || 0
			}
		} catch (e) {
			console.error('加载讨论数失败:', e)
		}
	} catch (error) {
		console.error('加载统计数据失败:', error)
	}
}

onMounted(() => {
	loadStats()
})

onShow(() => {
	// 刷新 tabBar 未读角标
	userStore.updateTabBarBadge()
	// 刷新"我的帖子被回复"未读数
	fetchUnreadReplyCount()
})

// 未读回复数（我的帖子被别人回复且未查看）
const unreadReplyCount = ref(0)
const fetchUnreadReplyCount = async () => {
	try {
		if (!userStore.isLoggedIn) return
		const res = await getUnreadReplyCountApi()
		if (res.code === 200 && res.data) {
			unreadReplyCount.value = res.data.unreadReplyCount || 0
		}
	} catch (e) {
		console.error('获取未读回复数失败:', e)
	}
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

const goToAgentConfig = () => {
	uni.navigateTo({ url: '/pages/admin/agent-config' })
}

const goToBotConfig = () => {
	uni.navigateTo({ url: '/pages/admin/bot-config' })
}

// 跳转到修改密码
const goToChangePassword = () => {
	uni.navigateTo({
		url: '/pages/change-password/change-password'
	})
}

// 跳转到修改邮箱
const goToChangeEmail = () => {
	uni.navigateTo({
		url: '/pages/change-email/change-email'
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
/* 微信小程序 button 组件样式重置 */
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

.profile-container {
	min-height: 100vh;
	background-color: var(--bg-primary);
	padding-bottom: 40rpx;
}

/* 用户卡片 - 深色模式使用科技渐变 */
.user-card {
	background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
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
	position: relative;
	cursor: pointer;
}

.avatar-text {
	font-size: 46rpx;
	color: rgba(255, 255, 255, 0.95);
	font-weight: 600;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.18);
	letter-spacing: 2rpx;
}

.avatar-edit-hint {
	position: absolute;
	right: -6rpx;
	bottom: -6rpx;
	width: 40rpx;
	height: 40rpx;
	line-height: 40rpx;
	text-align: center;
	font-size: 20rpx;
	color: #ffffff;
	background: rgba(0, 0, 0, 0.35);
	border-radius: 50%;
}

.reply-unread-badge {
	min-width: 32rpx;
	height: 32rpx;
	line-height: 32rpx;
	padding: 0 8rpx;
	text-align: center;
	font-size: 20rpx;
	color: #ffffff;
	background: #f5576c;
	border-radius: 999rpx;
	margin-right: 8rpx;
}

/* 头像选择弹层 */
.avatar-picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-picker {
	width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx 32rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.picker-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.picker-hint {
	font-size: 22rpx;
	color: #999999;
	margin: 12rpx 0 32rpx;
}

.avatar-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 28rpx;
	justify-content: center;
}

.avatar-option {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	border: 4rpx solid transparent;
	box-sizing: border-box;
}

.avatar-option.selected {
	border-color: #667eea;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.avatar-option-text {
	font-size: 40rpx;
	color: #ffffff;
	font-weight: bold;
}

.avatar-check {
	position: absolute;
	right: -4rpx;
	bottom: -4rpx;
	width: 36rpx;
	height: 36rpx;
	line-height: 36rpx;
	text-align: center;
	font-size: 20rpx;
	color: #ffffff;
	background: #667eea;
	border-radius: 50%;
}

.picker-done {
	margin-top: 40rpx;
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12rpx;
	border: none;
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

.user-email {
	max-width: 460rpx;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.72);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
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

.email-preview {
	max-width: 260rpx;
	font-size: 24rpx;
	color: var(--text-secondary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
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
	border: none;
	text-align: center;
}

button.logout-btn::after {
	border: none;
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

/* #ifdef H5 */
@media (min-width: 769px) {
	.profile-container {
		max-width: 720px;
		margin: 0 auto;
	}
}
/* #endif */</style>
