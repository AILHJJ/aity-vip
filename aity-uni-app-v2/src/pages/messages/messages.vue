<template>
	<view class="messages-container">
		<!-- 管理员操作栏 - 已移除，仅保留右下角悬浮按钮 -->

		<!-- 搜索栏 - 优化版 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<text class="search-icon">🔍</text>
				<input
					class="search-input"
					v-model="searchKeyword"
					type="text"
					placeholder="搜索消息标题或内容"
					placeholder-style="color: #999999"
					@input="handleSearchInput"
					@confirm="handleSearch"
					@focus="showSearchHistory = true"
				/>
				<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
			</view>
		</view>

		<!-- 搜索历史弹窗 -->
		<view v-if="showSearchHistory && searchHistory.length > 0" class="search-history-panel">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text class="history-clear" @click="handleClearHistory">清空</text>
			</view>
			<view class="history-list">
				<view
					v-for="(item, index) in searchHistory"
					:key="index"
					class="history-item"
					@click="handleSelectHistory(item)"
				>
					<text class="history-text">{{ item }}</text>
					<text class="history-remove" @click.stop="handleRemoveHistory(item)">×</text>
				</view>
			</view>
		</view>

		<!-- 筛选栏 -->
		<message-filter-bar
			:total-count="filteredMessages.length"
			@filter-change="handleMessageFilterChange"
		/>

		<view v-if="serverUnreadCount > 0 || loadedUnreadCount > 0" class="unread-panel">
			<view class="unread-panel-main">
				<view class="unread-copy">
					<text class="unread-title">未读消息</text>
					<text class="unread-desc">
						角标显示 {{ serverUnreadCount }} 条，当前列表可定位 {{ loadedUnreadCount }} 条
					</text>
				</view>
				<button class="unread-filter-btn" :class="{ active: showUnreadOnly }" @click="toggleUnreadOnly">
					{{ showUnreadOnly ? '查看全部' : '只看未读' }}
				</button>
			</view>
			<text v-if="unloadedUnreadCount > 0" class="unread-note">
				还有 {{ unloadedUnreadCount }} 条未读可能在未加载消息中，可继续下拉刷新或加载更多。
			</text>
		</view>

		<!-- 消息列表 -->
		<scroll-view
				class="messages-scroll"
				scroll-y
				@scrolltolower="loadMore"
				:refresher-enabled="true"
				:refresher-triggered="refreshing"
				@refresherrefresh="onRefresh"
				refresher-background="#f5f5f5"
		>
			<!-- 下拉刷新提示 -->
			<view v-if="refreshing" class="refresh-tip">
				<view class="refresh-loading"></view>
				<text class="refresh-text">正在刷新...</text>
			</view>

			<!-- 骨架屏加载 -->
			<message-skeleton v-if="loading && messages.length === 0" :count="5" />

			<!-- 加载中 -->
			<view v-else-if="loading && messages.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<empty-state v-else-if="messages.length === 0" type="message" />

			<!-- 搜索无结果 -->
			<empty-state v-else-if="filteredMessages.length === 0 && searchKeyword" type="no-result" />

			<view v-else-if="displayedMessages.length === 0 && showUnreadOnly" class="unread-empty">
				<text class="unread-empty-title">当前列表没有未读消息</text>
				<text class="unread-empty-desc">如果底部角标仍有数量，说明未读消息可能在未加载分页中。</text>
			</view>

			<!-- 置顶消息区域 -->
			<view v-if="pinnedMessages.length > 0" class="pinned-section">
				<!-- 置顶消息头部 -->
				<view class="pinned-header" @click="togglePinnedSection">
					<view class="pinned-title">
						<text class="pinned-icon">📌</text>
						<text class="pinned-text">置顶消息 ({{ pinnedMessages.length }})</text>
					</view>
					<text class="pinned-toggle">{{ isPinnedSectionExpanded ? '收起' : '展开' }}</text>
				</view>

				<!-- 置顶消息列表（可折叠） -->
				<view v-if="isPinnedSectionExpanded" class="pinned-list">
					<view
						v-for="message in pinnedMessages"
						:key="'pinned-' + message.id"
						class="message-item pinned"
						:class="{ unread: isMessageUnread(message) }"
						@click="goToDetail(message.id)"
					>
						<!-- 第一行：类型标签 + 日期 -->
						<view class="message-header-row">
							<view class="message-type-badge" :class="'type-' + message.type">
								{{ getMessageTypeLabel(message.type) }}
							</view>
							<view class="message-time-wrapper">
								<text v-if="isMessageUnread(message)" class="unread-pill">未读</text>
								<text class="message-time">{{ formatFriendlyTime(message.createdAt) }}</text>
							</view>
						</view>

						<!-- 第二行：标题 -->
						<view class="message-title">{{ message.title }}</view>

						<!-- 第三行：内容 -->
						<view class="message-content">
							<rich-text :nodes="renderContent(message)"></rich-text>
						</view>

						<!-- 第四行：标签 + 阅读数 -->
						<view class="message-footer-row">
							<view class="message-tags-left">
								<!-- 中线VIP用户标签 -->
								<view v-if="getPushScopeLabel(message.tags)" class="push-scope-tag">
									<text class="scope-text">{{ getPushScopeLabel(message.tags) }}</text>
								</view>
								<!-- 策略类型标签 -->
								<view v-if="getStrategyTag(message.tags)" class="strategy-tag">
									<text class="strategy-text">{{ getStrategyTag(message.tags) }}</text>
								</view>
							</view>
							<view class="message-stats">
								<text class="stat-item">👁 {{ message.readCount || 0 }}</text>
								<text class="stat-item">💬 {{ message.discussionCount || 0 }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view v-if="pinnedMessages.length > 0 && normalMessages.length > 0" class="divider">
				<view class="divider-line"></view>
				<text class="divider-text">全部消息</text>
				<view class="divider-line"></view>
			</view>

<!-- 普通消息列表 -->
		<view v-if="normalMessages.length > 0" class="messages-list">
			<view
				v-for="message in normalMessages"
				:key="message.id"
				class="message-item"
				:class="{ unread: isMessageUnread(message) }"
				@click="goToDetail(message.id)"
			>
				<!-- 第一行：类型标签 + 日期 -->
				<view class="message-header-row">
					<view class="message-type-badge" :class="'type-' + message.type">
						{{ getMessageTypeLabel(message.type) }}
					</view>
					<view class="message-time-wrapper">
						<text v-if="isMessageUnread(message)" class="unread-pill">未读</text>
						<text class="message-time">{{ formatFriendlyTime(message.createdAt) }}</text>
					</view>
				</view>

				<!-- 第二行：标题 -->
				<view class="message-title">{{ message.title }}</view>

				<!-- 第三行：内容 -->
				<view class="message-content">
					<rich-text :nodes="renderContent(message)"></rich-text>
				</view>

				<!-- 第四行：标签 + 阅读数 -->
				<view class="message-footer-row">
					<view class="message-tags-left">
						<!-- 中线VIP用户标签 -->
						<view v-if="getPushScopeLabel(message.tags)" class="push-scope-tag">
							<text class="scope-text">{{ getPushScopeLabel(message.tags) }}</text>
						</view>
						<!-- 策略类型标签 -->
						<view v-if="getStrategyTag(message.tags)" class="strategy-tag">
							<text class="strategy-text">{{ getStrategyTag(message.tags) }}</text>
						</view>
					</view>
					<view class="message-stats">
						<text class="stat-item">👁 {{ message.readCount || 0 }}</text>
						<text class="stat-item">💬 {{ message.discussionCount || 0 }}</text>
					</view>
				</view>
			</view>
		</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && !loading" class="load-more">
				<text class="load-more-text">加载更多...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && messages.length > 0" class="no-more">
				<text class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>

		<!-- 管理员发布按钮 - 可拖动 -->
		<view
			v-if="userStore.isAdmin && userInfoLoaded"
			class="fab-button"
			:style="{ transform: 'translate(' + fabX + 'px, ' + fabY + 'px)' }"
			@touchstart="onFabTouchStart"
			@touchmove="onFabTouchMove"
			@touchend="onFabTouchEnd"
		>
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getMessagesApi } from '../../api/message'
import { getMessageTypesApi } from '../../api/messageType'
import { MESSAGE_TYPE_LABELS, MESSAGE_TAGS, MESSAGE_TAG_LABELS } from '../../utils/constants'
import { formatFriendlyTime } from '../../utils/time'
import { getSearchHistory, addSearchHistory, clearSearchHistory, removeSearchHistory } from '../../utils/search-history'
import { isMessageRead, markAsRead } from '../../utils/read-status'
import { markMessageAsReadApi } from '../../api/message'
import dayjs from 'dayjs'
import MessageSkeleton from '@/components/message-skeleton.vue'
import EmptyState from '@/components/empty-state.vue'
import MessageFilterBar from '@/components/message-filter-bar.vue'
import { MarkdownRenderer } from '../../utils/markdown-renderer'

const userStore = useUserStore()

// 数据
const messages = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)
const activeTag = ref('')
const searchKeyword = ref('')
const userInfoLoaded = ref(false) // 用户信息加载状态
const showSearchHistory = ref(false) // 显示搜索历史
const searchHistory = ref([]) // 搜索历史列表
const today = ref('') // 今天的日期
const isPinnedSectionExpanded = ref(true) // 置顶消息区域是否展开
const messageTypeLabelMap = ref({ ...MESSAGE_TYPE_LABELS }) // 动态消息类型标签映射
const showUnreadOnly = ref(false)
const readStatusVersion = ref(0)

// 可拖动FAB按钮状态
const fabX = ref(0)
const fabY = ref(0)
let fabDragStartX = 0
let fabDragStartY = 0
let fabIsDragging = false

const onFabTouchStart = (e) => {
	fabIsDragging = false
	fabDragStartX = e.touches[0].clientX
	fabDragStartY = e.touches[0].clientY
}

const onFabTouchMove = (e) => {
	fabIsDragging = true
	const dx = e.touches[0].clientX - fabDragStartX
	const dy = e.touches[0].clientY - fabDragStartY
	fabX.value += dx
	fabY.value += dy
	fabDragStartX = e.touches[0].clientX
	fabDragStartY = e.touches[0].clientY
}

const onFabTouchEnd = () => {
	if (!fabIsDragging) {
		goToCreate()
	}
}

// 切换置顶消息区域的展开/收起状态
const togglePinnedSection = () => {
	isPinnedSectionExpanded.value = !isPinnedSectionExpanded.value
}

// 置顶消息列表（最多显示3条，按置顶时间倒序）
const pinnedMessages = computed(() => {
	return displayedMessages.value
		.filter(msg => msg.isPinned)
		.sort((a, b) => {
			// 按置顶时间倒序（最新置顶的在最上面）
			const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : new Date(a.updatedAt).getTime()
			const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : new Date(b.updatedAt).getTime()
			return bTime - aTime
		})
		.slice(0, 3) // 最多显示3条
})

// 普通消息列表（不包含置顶消息）
const normalMessages = computed(() => {
	return displayedMessages.value.filter(msg => !msg.isPinned)
})

// 基础筛选条件（所有用户） - 从 MessageFilterBar 组件接收
const basicFilters = ref({
	timeRange: 'all', // all, today, week, month, custom
	customStartDate: null,
	customEndDate: null,
	messageType: 'all', // 消息类型
	quickType: 'all' // 快捷筛选类型: all, today_opportunity, morning_focus, afternoon_focus, morning_comment, afternoon_comment
})

// 高级筛选条件（已合并到 message-filter-bar）

// 根据用户角色和搜索关键词过滤消息
const filteredMessages = computed(() => {
	let filtered = messages.value

	// 权限过滤：根据用户角色过滤消息
	const userRole = userStore.userRole
	if (userRole === 'vip_mid') {
		// VIP中线用户：只显示包含"中线策略"或"全部用户"标签的消息
		filtered = filtered.filter(msg => {
			return msg.tags && (
				msg.tags.includes(MESSAGE_TAGS.MID_TERM) ||
				msg.tags.includes(MESSAGE_TAGS.ALL_USERS)
			)
		})
	} else if (userRole === 'vip_short') {
		// VIP短线用户：只显示包含"短线策略"或"全部用户"标签的消息
		filtered = filtered.filter(msg => {
			return msg.tags && (
				msg.tags.includes(MESSAGE_TAGS.SHORT_TERM) ||
				msg.tags.includes(MESSAGE_TAGS.ALL_USERS)
			)
		})
	}
	// trial、admin、super_admin 显示所有消息，不需要过滤

	// ========== 快捷筛选（完全独立） ==========
	if (basicFilters.value.quickType !== 'all') {
		const now = dayjs()
		const todayStart = now.startOf('day')

		if (basicFilters.value.quickType === 'today_opportunity') {
			// 今日机会：今天的盘中关注
			filtered = filtered.filter(msg => {
				const msgDate = dayjs(msg.createdAt)
				const isToday = msgDate.isAfter(todayStart)
				const isOpportunity = msg.type === 'morning_focus'
				return isToday && isOpportunity
			})
		} else if (basicFilters.value.quickType === 'morning_focus') {
			// 盘中关注
			filtered = filtered.filter(msg => {
				return msg.type === 'morning_focus'
			})
		} else if (basicFilters.value.quickType === 'position_handle') {
			// 持仓处理
			filtered = filtered.filter(msg => {
				return msg.type === 'position_handle'
			})
		} else if (basicFilters.value.quickType === 'risk_warning') {
			// 风险提示
			filtered = filtered.filter(msg => {
				return msg.type === 'risk_warning'
			})
		} else if (basicFilters.value.quickType === 'morning_comment') {
			// 盘面点评
			filtered = filtered.filter(msg => {
				return msg.type === 'morning_comment'
			})
		}
	}

	// 推送范围筛选（来自 message-filter-bar 的推送范围筛选）
	if (basicFilters.value.pushScope) {
		filtered = filtered.filter(msg => {
			return msg.tags && msg.tags.includes(basicFilters.value.pushScope)
		})
	}

	// 基础筛选：消息类型筛选
	if (basicFilters.value.messageType !== 'all') {
		filtered = filtered.filter(msg => {
			return msg.type === basicFilters.value.messageType
		})
	}

	// 基础时间筛选（所有用户）
	if (basicFilters.value.timeRange !== 'all') {
		const now = dayjs()
		let startDate = null

		if (basicFilters.value.timeRange === 'today') {
			startDate = now.startOf('day')
		} else if (basicFilters.value.timeRange === 'week') {
			startDate = now.subtract(7, 'day').startOf('day')
		} else if (basicFilters.value.timeRange === 'month') {
			startDate = now.subtract(30, 'day').startOf('day')
		} else if (basicFilters.value.timeRange === 'custom') {
			if (basicFilters.value.customStartDate) {
				startDate = dayjs(basicFilters.value.customStartDate).startOf('day')
			}
		}

		if (startDate) {
			filtered = filtered.filter(msg => {
				const msgDate = dayjs(msg.createdAt)
				// 如果有自定义结束日期，使用它；否则使用当前时间
				const endDate = basicFilters.value.customEndDate
					? dayjs(basicFilters.value.customEndDate).endOf('day')
					: now
				return msgDate.isAfter(startDate) && msgDate.isBefore(endDate.add(1, 'day'))
			})
		}
	}

	// 搜索过滤：根据关键词过滤标题和内容
	if (searchKeyword.value.trim()) {
		const keyword = searchKeyword.value.trim().toLowerCase()
		filtered = filtered.filter(msg => {
			const title = (msg.title || '').toLowerCase()
			const content = (msg.content || '').toLowerCase()
			return title.includes(keyword) || content.includes(keyword)
		})
	}

	return filtered
})

const unreadMessagesInFiltered = computed(() => {
	return filteredMessages.value.filter(msg => isMessageUnread(msg))
})

const displayedMessages = computed(() => {
	return showUnreadOnly.value ? unreadMessagesInFiltered.value : filteredMessages.value
})

const loadedUnreadCount = computed(() => unreadMessagesInFiltered.value.length)
const serverUnreadCount = computed(() => Number(userStore.unreadCount || 0))
const unloadedUnreadCount = computed(() => Math.max(serverUnreadCount.value - loadedUnreadCount.value, 0))

// 加载动态消息类型标签，默认类型仍使用本地2字标签，自定义类型使用后台名称
const loadMessageTypeLabels = async () => {
	try {
		const res = await getMessageTypesApi()
		if (res.code === 200 || res.success) {
			const types = Array.isArray(res.data) ? res.data : (res.data?.list || [])
			const nextMap = { ...MESSAGE_TYPE_LABELS }
			types.forEach(typeItem => {
				if (!typeItem || !typeItem.type) return
				nextMap[typeItem.type] = MESSAGE_TYPE_LABELS[typeItem.type] || typeItem.label || typeItem.type
			})
			messageTypeLabelMap.value = nextMap
		}
	} catch (error) {
		console.error('加载消息类型标签失败:', error)
		messageTypeLabelMap.value = { ...MESSAGE_TYPE_LABELS }
	}
}

// 获取消息类型标签
const getMessageTypeLabel = (type) => {
	return messageTypeLabelMap.value[type] || MESSAGE_TYPE_LABELS[type] || type
}

// 渲染消息内容（使用完整的Markdown渲染，带主题内联样式）
const renderContent = (message) => {
	if (!message || !message.content) return ''

	// 使用消息自带的主题进行渲染，如果没有则使用默认主题
	const theme = message.theme || 'default'
	return MarkdownRenderer.renderWithTheme(message.content, theme)
}

// 获取显示的标签列表（根据用户权限和业务规则）
const getDisplayTags = (tags) => {
	if (!tags || !Array.isArray(tags)) {
		return []
	}

	const displayTags = []
	const hasShortTerm = tags.includes(MESSAGE_TAGS.SHORT_TERM)
	const hasMidTerm = tags.includes(MESSAGE_TAGS.MID_TERM)

	// VIP用户：只显示策略标签（短线/中线），不显示推送对象标签
	if (!userStore.isAdmin) {
		// 如果同时有短线和中线标签，显示为"短线+中线"
		if (hasShortTerm && hasMidTerm) {
			displayTags.push({
				key: 'combined',
				label: '短线+中线',
				icon: '⚡📈',
				class: 'tag-short-term tag-mid-term tag-combined'
			})
		} else if (hasShortTerm) {
			displayTags.push({
				key: MESSAGE_TAGS.SHORT_TERM,
				label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM],
				icon: '⚡',
				class: 'tag-short-term'
			})
		} else if (hasMidTerm) {
			displayTags.push({
				key: MESSAGE_TAGS.MID_TERM,
				label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM],
				icon: '📈',
				class: 'tag-mid-term'
			})
		}
	} else {
		// 管理员：显示所有标签（除了all_users）
		// 使用 Set 避免重复标签
		const uniqueTags = [...new Set(tags)]

		for (const tag of uniqueTags) {
			// 跳过 all_users 标签
			if (tag === MESSAGE_TAGS.ALL_USERS) {
				continue
			}

			// 处理策略标签
			if (tag === MESSAGE_TAGS.SHORT_TERM) {
				displayTags.push({
					key: MESSAGE_TAGS.SHORT_TERM,
					label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM],
					icon: '⚡',
					class: 'tag-short-term'
				})
			} else if (tag === MESSAGE_TAGS.MID_TERM) {
				displayTags.push({
					key: MESSAGE_TAGS.MID_TERM,
					label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM],
					icon: '📈',
					class: 'tag-mid-term'
				})
			}
		}
	}

	return displayTags
}

// 获取推送范围标签（显示为：短线VIP、中线VIP）
const getPushScopeLabel = (tags) => {
	if (!tags || tags.length === 0) return ''

	const hasShortTerm = tags.includes(MESSAGE_TAGS.SHORT_TERM)
	const hasMidTerm = tags.includes(MESSAGE_TAGS.MID_TERM)

	if (hasMidTerm) return '中线VIP'
	if (hasShortTerm) return '短线VIP'

	return ''
}

// 获取策略类型标签（显示为：短线策略、中线策略）
const getStrategyTag = (tags) => {
	if (!tags || tags.length === 0) return ''

	const hasShortTerm = tags.includes(MESSAGE_TAGS.SHORT_TERM)
	const hasMidTerm = tags.includes(MESSAGE_TAGS.MID_TERM)

	if (hasShortTerm) return '短线策略'
	if (hasMidTerm) return '中线策略'

	return ''
}

// 加载消息列表
const loadMessages = async (isRefresh = false) => {
	if (loading.value) return

	if (isRefresh) {
		page.value = 1
		hasMore.value = true
	}

	loading.value = true

	try {
		const params = {
			page: page.value,
			limit: limit.value
		}

		if (activeTag.value) {
			params.tag = activeTag.value
		}

		const res = await getMessagesApi(params)

		// 修复: 后端返回格式是 { code: 200, message: "Success", data: { list: [...], pagination: {...} } }
		// 需要检查 res.code === 200 而不是 res.success
		if (res.code === 200) {
			// 后端返回格式: { code: 200, message: "Success", data: { list: [...], pagination: {...} } }
			const messageList = res.data.list || []
			const total = res.data.pagination?.total || 0

			if (isRefresh) {
				messages.value = messageList
			} else {
				messages.value = [...messages.value, ...messageList]
			}

			// 更新未读消息数
			updateUnreadCount()

			// 判断是否还有更多
			hasMore.value = messages.value.length < total
		} else {
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载消息失败:', error)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
		refreshing.value = false
	}
}

// 更新未读消息数
const updateUnreadCount = () => {
	userStore.fetchUnreadCount()
}

// ========== 页面生命周期 ==========

// 页面加载时初始化
onMounted(async () => {
	// 检查登录状态
	if (!userStore.isLoggedIn) {
		uni.reLaunch({
			url: '/pages/login/login'
		})
		return
	}

	// 设置今天的日期
	const now = new Date()
	today.value = now.toISOString().split('T')[0]

	// 加载动态消息类型标签和消息列表
	await loadMessageTypeLabels()
	await loadMessages()

	// 恢复搜索历史
	searchHistory.value = getSearchHistory()

	// 注意: 筛选条件现在通过 filter-bar 和 message-filter-bar 组件内部处理

	// 标记页面加载完成
	userInfoLoaded.value = true
})

// 检查消息是否未读
const isMessageUnread = (messageOrId) => {
	readStatusVersion.value
	const message = typeof messageOrId === 'object' && messageOrId !== null ? messageOrId : null
	const messageId = message ? message.id : messageOrId
	if (message && typeof message.isRead === 'boolean') return !message.isRead
	return !isMessageRead(messageId)
}

const toggleUnreadOnly = () => {
	showUnreadOnly.value = !showUnreadOnly.value
}

// 下拉刷新
const onRefresh = () => {
	refreshing.value = true
	loadMessages(true)
}

// 加载更多
const loadMore = () => {
	if (!hasMore.value || loading.value) return
	page.value++
	loadMessages()
}

// 搜索输入时实时搜索
const handleSearchInput = () => {
	// 实时搜索，不需要额外处理，computed属性会自动过滤
}

// 搜索（点击按钮或回车）
const handleSearch = () => {
	if (searchKeyword.value.trim()) {
		addSearchHistory(searchKeyword.value.trim())
		searchHistory.value = getSearchHistory()
	}
	showSearchHistory.value = false
}

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = ''
	// 触发重新渲染
	filteredMessages.value // 引用一下确保响应式
}

// 选择搜索历史
const handleSelectHistory = (keyword) => {
	searchKeyword.value = keyword
	showSearchHistory.value = false
	handleSearch()
}

// 清除搜索历史
const handleClearHistory = () => {
	uni.showModal({
		title: '清空搜索历史',
		content: '确定要清空所有搜索历史吗？',
		success: (res) => {
			if (res.confirm) {
				clearSearchHistory()
				searchHistory.value = []
			}
		}
	})
}

// 删除单条搜索历史
const handleRemoveHistory = (keyword) => {
	removeSearchHistory(keyword)
	searchHistory.value = getSearchHistory()
}

// 处理消息筛选变化（从 MessageFilterBar 组件接收）
const handleMessageFilterChange = (newFilters) => {
	basicFilters.value = { ...basicFilters.value, ...newFilters }
}

// 跳转到详情
const goToDetail = (id) => {
	// 本地标记已读
	markAsRead(id)
	const target = messages.value.find(msg => msg.id === id)
	if (target) target.isRead = true
	readStatusVersion.value++
	updateUnreadCount()

	// 同步到服务端（不阻塞UI）
	markMessageAsReadApi(id).catch(e => {
		console.error('服务端标记已读失败:', e)
	})

	uni.navigateTo({
		url: `/pages/message-detail/message-detail?id=${id}`
	})
}

// 跳转到创建页面
const goToCreate = () => {
	uni.navigateTo({
		url: '/pages/create-message/create-message'
	})
}

// 标记是否已初始化（用于区分首次加载和返回刷新）
const isInitialized = ref(false)

// 页面加载
onMounted(async () => {
	// 检查登录状态
	if (!userStore.isLoggedIn) {
		uni.reLaunch({
			url: '/pages/login/login'
		})
		return
	}

	// 设置今天的日期
	const now = new Date()
	today.value = now.toISOString().split('T')[0]

	// 加载搜索历史
	searchHistory.value = getSearchHistory()

	// 强制刷新用户信息，确保权限正确
	try {
		await userStore.fetchUserInfo()

		// 开发环境调试日志
		if (process.env.NODE_ENV === 'development') {
			console.log('=== 用户信息加载完成 ===')
			console.log('用户名:', userStore.userName)
			console.log('用户角色:', userStore.userRole)
			console.log('是否管理员:', userStore.isAdmin)
		}

		userInfoLoaded.value = true
	} catch (error) {
		console.error('获取用户信息失败:', error)
		uni.showToast({
			title: '获取用户信息失败',
			icon: 'none'
		})
		return
	}

	await loadMessageTypeLabels()
	loadMessages(true)
	isInitialized.value = true
})

// 页面显示时刷新（从详情页返回时）
onShow(() => {
	// 只有初始化完成后才刷新（避免首次加载重复刷新）
	if (isInitialized.value && userInfoLoaded.value) {
		console.log('[消息列表] 页面返回，刷新列表')
		loadMessageTypeLabels()
		loadMessages(true)
	}
	// 同步未读消息角标
	userStore.fetchUnreadCount()
})
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

/* 消息列表页面 - 金融科技风格 */
.messages-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: var(--bg-primary);
}

/* 管理员操作栏 */
.admin-bar {
	padding: 20rpx;
	background: var(--bg-card);
	border-bottom: 1rpx solid var(--border-primary);
}

.create-btn {
	width: 100%;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 40rpx;
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s ease;
}

.create-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
}

.create-icon {
	font-size: 32rpx;
}

.create-text {
	font-size: 30rpx;
}

/* 搜索栏 - 玻璃拟态风格 */
.search-bar {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 20rpx;
	background: var(--bg-card);
	border-bottom: 1rpx solid var(--border-primary);
}

.search-input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	height: 70rpx;
	padding: 0 20rpx;
	background: var(--bg-tertiary);
	border-radius: 35rpx;
	border: 1rpx solid var(--border-secondary);
	transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2rpx rgba(56, 189, 248, 0.1);
}

.search-icon {
	font-size: 32rpx;
	margin-right: 10rpx;
	opacity: 0.6;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: var(--text-primary);
	background: transparent;
}

.search-input::placeholder {
	color: var(--text-placeholder);
}

.clear-icon {
	font-size: 40rpx;
	color: var(--text-tertiary);
	margin-left: 10rpx;
	line-height: 1;
	transition: all 0.2s ease;
}

.clear-icon:active {
	opacity: 0.6;
}

.search-btn {
	width: 120rpx;
	height: 70rpx;
	line-height: 70rpx;
	padding: 0;
	margin: 0;
	font-size: 28rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 35rpx;
	text-align: center;
	transition: all 0.3s ease;
}

.search-btn:active {
	transform: scale(0.95);
}

/* 筛选栏 */
.filter-bar {
	background: var(--bg-card);
	padding: 20rpx 0;
	border-bottom: 1rpx solid var(--border-primary);
}

.filter-scroll {
	white-space: nowrap;
}

.filter-items {
	display: inline-flex;
	padding: 0 20rpx;
}

.filter-item {
	display: inline-block;
	padding: 12rpx 30rpx;
	margin-right: 20rpx;
	font-size: 28rpx;
	color: var(--text-secondary);
	background: var(--bg-tertiary);
	border-radius: 30rpx;
	transition: all 0.3s;
	border: 1rpx solid transparent;
}

.filter-item.active {
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

/* 消息滚动区域 */
.messages-scroll {
	flex: 1;
	overflow-y: auto;
}

.unread-panel {
	margin: 16rpx 20rpx 0;
	padding: 20rpx;
	background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%);
	border: 1rpx solid #fed7aa;
	border-radius: 16rpx;
}

.unread-panel-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
}

.unread-copy {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.unread-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #9a3412;
}

.unread-desc,
.unread-note {
	font-size: 24rpx;
	color: #b45309;
	line-height: 1.5;
}

.unread-note {
	display: block;
	margin-top: 12rpx;
}

.unread-filter-btn {
	flex-shrink: 0;
	min-width: 150rpx;
	height: 58rpx;
	line-height: 58rpx;
	padding: 0 22rpx;
	font-size: 24rpx;
	color: #ea580c;
	background: #ffffff;
	border: 1rpx solid #fdba74;
	border-radius: 29rpx;
}

.unread-filter-btn.active {
	color: #ffffff;
	background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
	border-color: transparent;
}

.unread-empty {
	margin: 60rpx 40rpx;
	padding: 48rpx 30rpx;
	background: var(--bg-card);
	border: 1rpx dashed var(--border-secondary);
	border-radius: 18rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.unread-empty-title {
	font-size: 30rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.unread-empty-desc {
	font-size: 24rpx;
	color: var(--text-tertiary);
	text-align: center;
	line-height: 1.5;
}

/* 刷新提示 */
.refresh-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
	background: var(--bg-primary);
}

.refresh-loading {
	width: 40rpx;
	height: 40rpx;
	border: 3rpx solid var(--border-primary);
	border-top-color: var(--color-primary);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.refresh-text {
	margin-top: 15rpx;
	font-size: 24rpx;
	color: var(--text-tertiary);
}

/* 加载状态 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid var(--border-primary);
	border-top-color: var(--color-primary);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	margin-top: 20rpx;
	font-size: 28rpx;
	color: var(--text-tertiary);
	animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 0.6; }
	50% { opacity: 1; }
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 150rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 28rpx;
	color: var(--text-tertiary);
}

/* 消息列表 */
.messages-list {
	padding: 20rpx;
}

/* 消息卡片 - 数据卡片风格 */
.message-item {
	background: var(--bg-card);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: var(--shadow-card);
	border: 1rpx solid var(--border-primary);
	border-left: 4rpx solid transparent;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	will-change: transform, box-shadow, border-left-color;
	position: relative;
	overflow: hidden;

	// 深色模式发光效果
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	&:active {
		transform: scale(0.98);
		border-left-color: var(--color-primary);
		box-shadow: var(--shadow-md);

		&::before {
			opacity: 1;
		}
	}

	// 未读状态 - 金融科技风格高亮
	&.unread {
		background: linear-gradient(135deg, var(--bg-card) 0%, rgba(56, 189, 248, 0.08) 100%);
		border-left-color: var(--color-primary);

		&::before {
			opacity: 0.5;
		}
	}
}

.message-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
	position: relative;
	z-index: 1;
}

.message-meta {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

/* 未读红点 - 脉冲动画 */
.unread-dot {
	width: 16rpx;
	height: 16rpx;
	background: var(--color-up);
	border-radius: 50%;
	animation: unread-pulse 2s ease-in-out infinite;
	box-shadow: 0 0 8rpx rgba(239, 68, 68, 0.5);
}

/* 已读标签 */
.read-tag {
	padding: 4rpx 12rpx;
	background: var(--bg-tertiary);
	border-radius: 8rpx;
}

.read-tag-text {
	font-size: 20rpx;
	color: var(--text-tertiary);
}

@keyframes unread-pulse {
	0%, 100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.6;
		transform: scale(1.2);
	}
}

/* 消息类型标签 - 渐变风格（精简版本） */
.message-type-badge {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	color: #ffffff;
	border-radius: 20rpx;
	font-weight: 500;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);

	&.type-morning_focus {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
		box-shadow: 0 2rpx 8rpx rgba(67, 233, 123, 0.3);
	}

	&.type-position_handle {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
	}

	&.type-risk_warning {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		box-shadow: 0 2rpx 8rpx rgba(240, 147, 251, 0.3);
	}

	&.type-morning_comment {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		box-shadow: 0 2rpx 8rpx rgba(79, 172, 254, 0.3);
	}

	&.type-system {
		background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
		box-shadow: 0 2rpx 8rpx rgba(149, 165, 166, 0.3);
	}
}

.message-time {
	font-size: 24rpx;
	color: var(--text-tertiary);
}

.message-title {
	font-size: 32rpx;
	font-weight: bold;
	color: var(--text-primary);
	margin-bottom: 15rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	position: relative;
	z-index: 1;
}

.message-content {
	font-size: 28rpx;
	color: var(--text-secondary);
	line-height: 1.6;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	margin-bottom: 20rpx;
	word-wrap: break-word;
	word-break: break-word;
	position: relative;
	z-index: 1;

	// 优化Markdown元素在列表中的显示
	::v-deep h1,
	::v-deep h2,
	::v-deep h3,
	::v-deep h4,
	::v-deep h5,
	::v-deep h6 {
		font-size: 28rpx !important;
		font-weight: 600 !important;
		margin: 0 !important;
		padding: 0 !important;
		border: none !important;
		display: inline;
	}

	::v-deep ul,
	::v-deep ol {
		margin: 0 !important;
		padding: 0 !important;
		display: inline;
	}

	::v-deep li {
		display: inline;
		margin: 0 !important;
		padding: 0 !important;
	}

	::v-deep p {
		margin: 0 !important;
		padding: 0 !important;
		display: inline;
	}

	::v-deep br {
		content: '';
		display: inline-block;
		width: 0.5em;
	}

	::v-deep pre {
		white-space: pre-wrap;
		font-size: 26rpx !important;
		padding: 8rpx !important;
		margin: 0 !important;
		display: inline;
	}

	::v-deep code {
		font-size: 26rpx !important;
		padding: 2rpx 6rpx !important;
	}

	::v-deep blockquote {
		margin: 0 !important;
		padding: 0 !important;
		display: inline;
	}
}

.message-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.message-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.message-tag {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 10rpx 20rpx;
	border-radius: 16rpx;
	font-size: 22rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	white-space: nowrap;

	// 默认标签
	&.tag-default {
		background: #f5f5f5;
		color: #999999;
	}

	// 全部用户 - 紫色
	&.tag-all-users {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
		color: #667eea;
		border: 1rpx solid rgba(102, 126, 234, 0.25);
	}

	// 中线策略 - 蓝色
	&.tag-mid-term {
		background: linear-gradient(135deg, rgba(79, 172, 254, 0.12) 0%, rgba(0, 242, 254, 0.12) 100%);
		color: #4facfe;
		border: 1rpx solid rgba(79, 172, 254, 0.25);
	}

	// 短线策略 - 绿色
	&.tag-short-term {
		background: linear-gradient(135deg, rgba(67, 233, 123, 0.12) 0%, rgba(56, 249, 215, 0.12) 100%);
		color: #43e97b;
		border: 1rpx solid rgba(67, 233, 123, 0.25);
	}

	// 组合标签 - 短线+中线
	&.tag-combined {
		background: linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(79, 172, 254, 0.15) 100%);
		color: #43e97b;
		border: 1rpx solid rgba(67, 233, 123, 0.3);
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 50%;
			background: linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(56, 249, 215, 0.2) 100%);
			border-radius: 16rpx 0 0 16rpx;
			z-index: 0;
		}

		.tag-icon,
		.tag-text {
			position: relative;
			z-index: 1;
		}
	}
}

.tag-icon {
	font-size: 20rpx;
	line-height: 1;
}

.tag-text {
	display: block;
	line-height: 1;
}

.message-stats {
	display: flex;
	gap: 20rpx;
}

.stat-item {
	font-size: 24rpx;
	color: #999999;
}

.load-more,
.no-more {
	text-align: center;
	padding: 30rpx 0;
}

.load-more-text,
.no-more-text {
	font-size: 26rpx;
	color: #999999;
}

.fab-button {
	position: fixed;
	right: 40rpx;
	bottom: 120rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
	z-index: 999;
	touch-action: none;
	user-select: none;
}

.fab-icon {
	font-size: 60rpx;
	color: #ffffff;
	font-weight: 300;
	pointer-events: none;
}

// 搜索历史面板
.search-history-panel {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: var(--bg-card);
	border-radius: 0 0 16rpx 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
	padding: 20rpx;
	max-height: 600rpx;
	overflow-y: auto;
}

.history-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	padding-bottom: 15rpx;
	border-bottom: 1rpx solid var(--border-secondary);
}

.history-title {
	font-size: 28rpx;
	font-weight: bold;
	color: var(--text-primary);
}

.history-clear {
	font-size: 26rpx;
	color: #667eea;
	padding: 8rpx 16rpx;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.history-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 20rpx;
	background: var(--bg-tertiary);
	border-radius: 8rpx;
	transition: all 0.3s;

	&:active {
		background: var(--bg-hover);
	}
}

.history-text {
	flex: 1;
	font-size: 28rpx;
	color: var(--text-primary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.history-remove {
	font-size: 36rpx;
	color: var(--text-tertiary);
	padding: 0 10rpx;
	line-height: 1;
}

/* 置顶消息区域 */
.pinned-section {
	background: #fff8e1;
	border-bottom: 2rpx solid #ffd54f;
}

.pinned-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background: linear-gradient(135deg, rgba(255, 213, 79, 0.1) 0%, rgba(255, 183, 77, 0.1) 100%);
	border-bottom: 1rpx solid rgba(255, 213, 79, 0.3);
}

.pinned-title {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.pinned-icon {
	font-size: 32rpx;
}

.pinned-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #f57c00;
}

.pinned-toggle {
	font-size: 24rpx;
	color: #1976d2;
	padding: 8rpx 20rpx;
	background: rgba(25, 118, 210, 0.1);
	border-radius: 20rpx;
}

.pinned-list {
	padding: 20rpx;
}

/* 置顶消息的样式 */
.message-item.pinned {
	background: #ffffff;
	border-left: 6rpx solid #ffd54f;
	box-shadow: 0 4rpx 16rpx rgba(255, 213, 79, 0.2);
}

.pinned-badge {
	display: inline-flex;
	align-items: center;
	padding: 6rpx 16rpx;
	font-size: 22rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
	border-radius: 16rpx;
	font-weight: 500;
}

/* 分隔线 */
.divider {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #f5f5f5;
}

.divider-line {
	flex: 1;
	height: 1rpx;
	background: #e0e0e0;
}

.divider-text {
	padding: 0 20rpx;
	font-size: 24rpx;
	color: #999999;
}

/* 推送范围标签 */
.message-tags-wrapper {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-wrap: wrap;
}

.push-scope-tag {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 16rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.scope-icon {
	font-size: 24rpx;
}

.scope-text {
	font-size: 22rpx;
}

/* 策略类型标签 */
.strategy-tag {
	display: inline-flex;
	align-items: center;
	padding: 8rpx 16rpx;
	background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
	border-radius: 20rpx;
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
	box-shadow: 0 2rpx 8rpx rgba(243, 156, 18, 0.3);
}

.strategy-text {
	font-size: 22rpx;
}

/* 新布局：时间和标签在同一行 */
.message-meta-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
	gap: 16rpx;
}

.message-meta-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-shrink: 0;
}

.message-tags-inline {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-wrap: wrap;
	justify-content: flex-end;
	flex: 1;
}

/* 新布局样式：第一行类型+日期，第二行标签在左下角 */
.message-header-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.message-time-wrapper {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.unread-pill {
	padding: 4rpx 12rpx;
	font-size: 20rpx;
	font-weight: 600;
	color: #ffffff;
	background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
	border-radius: 999rpx;
	box-shadow: 0 2rpx 8rpx rgba(239, 68, 68, 0.25);
}

.message-footer-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 12rpx;
	padding-top: 12rpx;
	border-top: 1rpx solid #f0f0f0;
}

.message-tags-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-wrap: wrap;
	flex: 1;
}
</style>
