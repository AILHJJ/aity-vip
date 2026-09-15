<template>
	<view class="pc-top-nav">
		<view class="pc-nav-inner">
			<!-- Logo -->
			<view class="pc-nav-logo" @click="goHome">
				<text class="pc-nav-logo-mark">◆</text>
				<text class="pc-nav-logo-text">投研图灵室</text>
			</view>

			<!-- 导航链接 -->
			<view class="pc-nav-links">
				<view
					v-for="item in navItems"
					:key="item.key"
					class="pc-nav-link"
					:class="{ active: active === item.key }"
					@click="onNavClick(item)"
				>
					<text class="pc-nav-link-text">{{ item.label }}</text>
					<view v-if="item.key === 'messages' && unreadCount > 0" class="pc-nav-badge">
						<text>{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
					</view>
				</view>

				<!-- 管理下拉（仅管理员） -->
				<view
					v-if="isAdmin"
					class="pc-nav-link pc-nav-link-dropdown"
					@click="toggleAdminMenu"
				>
					<text class="pc-nav-link-text">管理</text>
					<text class="pc-nav-caret">▾</text>
					<view v-if="showAdminMenu" class="pc-nav-dropdown" @click.stop>
						<view
							v-for="item in adminItems"
							:key="item.path"
							class="pc-nav-dropdown-item"
							@click="goAdmin(item.path)"
						>
							<text>{{ item.label }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '../store/user'

const props = defineProps({
	active: {
		type: String,
		default: ''
	}
})

const userStore = useUserStore()
const showAdminMenu = ref(false)

const navItems = [
	{ key: 'messages', label: '消息', path: '/pages/messages/messages' },
	{ key: 'discussions', label: '交流', path: '/pages/discussions/discussions' },
	{ key: 'market', label: '行情', path: '/pages/market/market' },
	{ key: 'profile', label: '我的', path: '/pages/profile/profile' }
]

const adminItems = [
	{ label: '用户管理', path: '/pages/user-management/user-management' },
	{ label: '数据统计', path: '/pages/stats/stats' },
	{ label: 'AI 管理', path: '/pages/admin/ai-config' },
	{ label: 'Agent 管理', path: '/pages/admin/agent-config' },
	{ label: '渠道配置', path: '/pages/admin/bot-config' }
]

const isAdmin = computed(() => userStore.isAdmin)
const unreadCount = computed(() => userStore.unreadCount)

const goHome = () => {
	uni.switchTab({ url: '/pages/messages/messages' })
}

const onNavClick = (item) => {
	if (item.key === props.active) return
	uni.switchTab({ url: item.path })
}

const toggleAdminMenu = () => {
	showAdminMenu.value = !showAdminMenu.value
}

const goAdmin = (path) => {
	showAdminMenu.value = false
	uni.navigateTo({ url: path })
}

// 点击外部关闭下拉（H5 端，网页版交互习惯）
const handleDocClick = (e) => {
	if (!e.target.closest('.pc-nav-link-dropdown')) {
		showAdminMenu.value = false
	}
}

onMounted(() => {
	// #ifdef H5
	document.addEventListener('click', handleDocClick)
	// #endif
})

onBeforeUnmount(() => {
	// #ifdef H5
	document.removeEventListener('click', handleDocClick)
	// #endif
})
</script>

<style lang="scss" scoped>
/* 仅 PC 大屏显示（默认隐藏，@media 大屏显示），小程序端不引入此组件 */
.pc-top-nav {
	display: none;
}

@media (min-width: 769px) {
	.pc-top-nav {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		height: 44px;
		background: var(--nav-bg);
		border-bottom: 1px solid var(--border-primary);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.pc-nav-inner {
		max-width: 1280px;
		margin: 0 auto;
		height: 100%;
		display: flex;
		align-items: center;
		padding: 0 24px;
		gap: 40px;
	}

	.pc-nav-logo {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		flex-shrink: 0;
	}

	.pc-nav-logo-mark {
		font-size: 20px;
		color: var(--color-primary);
	}

	.pc-nav-logo-text {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: 0.5px;
	}

	.pc-nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.pc-nav-link {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6px;
		height: 100%;
		padding: 0 16px;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.pc-nav-link:hover {
		background: var(--bg-hover);
	}

	/* 网页版习惯：当前页用底部下划线高亮（紧贴导航条下边框） */
	.pc-nav-link.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 14px;
		right: 14px;
		height: 2px;
		background: var(--color-primary);
		border-radius: 1px;
	}

	.pc-nav-link.active .pc-nav-link-text {
		color: var(--color-primary);
		font-weight: 600;
	}

	.pc-nav-link-text {
		font-size: 15px;
		color: var(--text-secondary);
	}

	.pc-nav-caret {
		font-size: 12px;
		color: var(--text-tertiary);
	}

	.pc-nav-badge {
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		background: #ef4444;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pc-nav-badge text {
		font-size: 11px;
		color: #ffffff;
		line-height: 1;
	}

	.pc-nav-dropdown {
		position: absolute;
		top: 44px;
		left: 0;
		min-width: 160px;
		background: var(--bg-card);
		border: 1px solid var(--border-primary);
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		padding: 6px;
		z-index: 1001;
	}

	.pc-nav-dropdown-item {
		padding: 10px 14px;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.pc-nav-dropdown-item:hover {
		background: var(--bg-hover);
	}

	.pc-nav-dropdown-item text {
		font-size: 14px;
		color: var(--text-primary);
	}
}
</style>
