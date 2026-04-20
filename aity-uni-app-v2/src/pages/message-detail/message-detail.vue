<template>
	<view class="detail-container">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-container">
			<!-- 骨架屏 -->
			<view class="skeleton-screen">
				<view class="skeleton-header">
					<view class="skeleton-badge"></view>
					<view class="skeleton-time"></view>
				</view>
				<view class="skeleton-title"></view>
				<view class="skeleton-tags">
					<view class="skeleton-tag"></view>
					<view class="skeleton-tag"></view>
				</view>
				<view class="skeleton-content">
					<view class="skeleton-line"></view>
					<view class="skeleton-line"></view>
					<view class="skeleton-line"></view>
				</view>
				<view class="skeleton-images">
					<view class="skeleton-image"></view>
					<view class="skeleton-image"></view>
				</view>
				<view class="skeleton-stats">
					<view class="skeleton-stat"></view>
					<view class="skeleton-stat"></view>
				</view>
			</view>
		</view>

		<!-- 消息详情 -->
		<view v-else-if="message" class="detail-content">
			<!-- 消息头部 -->
			<view class="message-header">
				<view class="message-type-badge" :class="'type-' + message.type">
					{{ getMessageTypeLabel(message.type) }}
				</view>
				<text class="message-time">{{ formatTime(message.createdAt) }}</text>
			</view>

			<!-- 消息标题 -->
			<view class="message-title">{{ message.title }}</view>

			<!-- 消息标签 -->
			<view v-if="message.tags && message.tags.length > 0" class="message-tags">
				<text
					v-for="tag in message.tags"
					:key="tag"
					class="message-tag"
				>
					{{ MESSAGE_TAG_LABELS[tag] || tag }}
				</text>
			</view>

			<!-- 风险提示 - 专业金融风格 -->
			<view class="risk-disclaimer">
				<view class="disclaimer-left">
					<text class="disclaimer-icon">⚠</text>
				</view>
				<view class="disclaimer-content">
					<text class="disclaimer-title">风险提示</text>
					<text class="disclaimer-text">本内容仅供参考，不构成投资建议。市场有风险，投资需谨慎。</text>
				</view>
			</view>

			<!-- Markdown主题选择器 - 已移除，主题由发帖者选择 -->

			<!-- 版本切换标签 - 只在有优化版本时显示 -->
			<view v-if="hasOptimizedVersion" class="version-tabs">
				<view
					class="version-tab"
					:class="{ active: currentVersion === 'ai_optimized' }"
					@click="switchVersion('ai_optimized')"
				>
					<text class="tab-icon">🤖</text>
					<text class="tab-text">AI优化版</text>
				</view>
				<view
					class="version-tab"
					:class="{ active: currentVersion === 'original' }"
					@click="switchVersion('original')"
				>
					<text class="tab-icon">📄</text>
					<text class="tab-text">原始版本</text>
				</view>
			</view>

			<!-- 消息内容（Markdown渲染，带主题内联样式） -->
			<view class="message-content" :class="{ 'with-version-switch': hasOptimizedVersion }">
				<rich-text v-if="renderedContent" :nodes="renderedContent"></rich-text>
				<text v-else class="content-text">{{ displayContent }}</text>
			</view>

			<!-- 股票标签卡片 - 金融社区横向滚动风格 -->
			<view v-if="extractedStocks.length > 0" class="stock-cards-section">
				<view class="section-header">
					<text class="section-title">📈 相关股票</text>
					<text class="stock-count">{{ extractedStocks.length }}只</text>
				</view>
				<scroll-view class="stock-scroll-container" scroll-x enable-flex>
					<view
						v-for="(stock, index) in extractedStocks"
						:key="index"
						class="stock-chip"
						@click="openMarketChartForStock(stock.code)"
					>
						<view class="stock-chip-header">
							<text class="stock-chip-code">{{ stock.code }}</text>
							<text class="stock-chip-market">{{ getMarketLabel(stock.code) }}</text>
						</view>
						<text class="stock-chip-name">{{ stock.name }}</text>
						<view class="stock-chip-action">
							<text class="action-icon">📊</text>
							<text class="action-text">查看行情</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 版本标识 - 只在有优化版本时显示 -->
			<view v-if="hasOptimizedVersion" class="version-indicator">
				<text v-if="currentVersion === 'ai_optimized'" class="ai-badge">
					🤖 AI优化版 - 由AI智能优化，结构更清晰，阅读更便捷
				</text>
				<text v-else class="original-badge">
					📄 原始版本 - 作者原文，保留原始风格
				</text>
			</view>

			<!-- 消息图片 -->
			<view v-if="message.images && message.images.length > 0" class="message-images">
				<view
					v-for="(img, index) in message.images"
					:key="index"
					class="image-wrapper"
					@click="previewImage(index)"
				>
					<image
						:src="cleanImageUrl(img)"
						class="message-image"
						mode="widthFix"
						:lazy-load="true"
						@error="handleImageError(index)"
						@load="handleImageLoad(index)"
						:show-loading="true"
						:show-error="true"
					/>
					<view class="image-mask">
						<text class="image-hint">点击预览</text>
					</view>
				</view>
			</view>

			<!-- 消息统计 -->
			<view class="message-stats">
				<view class="stat-item">
					<text class="stat-icon">👁</text>
					<text class="stat-text">{{ message.readCount || 0 }} 人已读</text>
				</view>
				<view class="stat-item">
					<text class="stat-icon">💬</text>
					<text class="stat-text">{{ message.discussionCount || 0 }} 条讨论</text>
				</view>
				<!-- 管理员可查看阅读详情 -->
				<view v-if="userStore.isAdmin" class="stat-item read-detail-toggle" @click="toggleReadDetails">
					<text class="stat-icon">📋</text>
					<text class="stat-text read-detail-text">阅读详情</text>
					<text class="toggle-arrow">{{ showReadDetails ? '▲' : '▼' }}</text>
				</view>
			</view>

			<!-- 管理员阅读详情面板 -->
			<view v-if="userStore.isAdmin && showReadDetails" class="read-details-panel">
				<view v-if="readDetailsLoading" class="read-details-loading">
					<text>加载中...</text>
				</view>
				<template v-else-if="readDetails">
					<!-- 统计概览 -->
					<view class="read-details-summary">
						<view class="summary-item read">
							<text class="summary-count">{{ readDetails.readCount }}</text>
							<text class="summary-label">已读</text>
						</view>
						<view class="summary-item unread">
							<text class="summary-count">{{ readDetails.unreadCount }}</text>
							<text class="summary-label">未读</text>
						</view>
						<view class="summary-item total">
							<text class="summary-count">{{ readDetails.totalCount }}</text>
							<text class="summary-label">应读</text>
						</view>
						<!-- 阅读率进度条 -->
						<view class="read-rate-bar">
							<view class="read-rate-fill" :style="{ width: readRatePercent + '%' }"></view>
							<text class="read-rate-text">{{ readRatePercent }}%</text>
						</view>
					</view>

					<!-- 已读/未读切换 -->
					<view class="read-details-tabs">
						<view
							class="detail-tab"
							:class="{ active: readDetailsTab === 'unread' }"
							@click="readDetailsTab = 'unread'"
						>
							未读 ({{ readDetails.unreadCount }})
						</view>
						<view
							class="detail-tab"
							:class="{ active: readDetailsTab === 'read' }"
							@click="readDetailsTab = 'read'"
						>
							已读 ({{ readDetails.readCount }})
						</view>
					</view>

					<!-- 用户列表 -->
					<view class="read-details-list">
						<view v-if="currentReadList.length === 0" class="read-details-empty">
							<text>{{ readDetailsTab === 'read' ? '暂无已读用户' : '全部已读！' }}</text>
						</view>
						<view
							v-for="user in currentReadList"
							:key="user.id"
							class="read-user-item"
						>
							<image
								v-if="user.avatar && !avatarErrors[user.id]"
								:src="getFullUrl(user.avatar)"
								class="user-avatar"
								mode="aspectFill"
								@error="handleAvatarError(user.id)"
							/>
							<view v-else class="user-avatar-placeholder">
								<text class="avatar-text">{{ (user.name || '?').charAt(0) }}</text>
							</view>
							<view class="user-info">
								<text class="user-name">{{ user.name }}</text>
								<text v-if="readDetailsTab === 'read' && user.readAt" class="read-time">
									{{ formatFriendlyTime(user.readAt) }}
								</text>
							</view>
							<text class="user-role-tag" :class="user.role">{{ getRoleLabel(user.role) }}</text>
						</view>
					</view>
				</template>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button
					class="action-btn"
					:class="{ active: isFavorited, loading: favoriteLoading }"
					:disabled="favoriteLoading"
					@click="toggleFavorite"
				>
					<text v-if="favoriteLoading" class="btn-text">处理中...</text>
					<template v-else>
						<text class="btn-icon">{{ isFavorited ? '⭐' : '☆' }}</text>
						<text class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
					</template>
				</button>
				<button
					class="action-btn"
					:class="{ loading: shareLoading }"
					:disabled="shareLoading"
					@click="handleShare"
				>
					<text v-if="shareLoading" class="btn-text">复制中...</text>
					<template v-else>
						<text class="btn-icon">📤</text>
						<text class="btn-text">分享</text>
					</template>
				</button>
				<!-- 移除查看行情按钮 - 用户可直接点击股票卡片查看行情 -->
				<button class="action-btn primary" @click="goToDiscuss">
					<text class="btn-icon">💬</text>
					<text class="btn-text">发起讨论</text>
				</button>
			</view>

			<!-- 管理员操作按钮 -->
			<view v-if="userStore.isAdmin" class="admin-actions">
				<button
					class="admin-btn pin"
					:class="{ pinned: message.isPinned, loading: pinLoading }"
					:disabled="pinLoading"
					@click="handleTogglePin"
				>
					<text v-if="pinLoading">{{ message.isPinned ? '取消中...' : '置顶中...' }}</text>
					<template v-else>
						<text class="admin-btn-icon">{{ message.isPinned ? '📌' : '📍' }}</text>
						<text>{{ message.isPinned ? '取消置顶' : '置顶' }}</text>
					</template>
				</button>
				<button class="admin-btn edit" @click="handleEdit">
					<text class="admin-btn-icon">✏️</text>
					<text>编辑</text>
				</button>
				<button
					class="admin-btn delete"
					:class="{ loading: deleteLoading }"
					:disabled="deleteLoading"
					@click="handleDelete"
				>
					<text v-if="deleteLoading">删除中...</text>
					<template v-else>
						<text class="admin-btn-icon">🗑️</text>
						<text>删除</text>
					</template>
				</button>
			</view>

			<!-- 相关讨论 -->
			<view v-if="discussions.length > 0" class="discussions-section">
				<view class="section-title">相关讨论</view>
				<view
					v-for="discussion in discussions"
					:key="discussion.id"
					class="discussion-item"
					@click="goToDiscussionDetail(discussion.id)"
				>
					<view class="discussion-header">
						<text class="discussion-user">{{ discussion.userName }}</text>
						<text class="discussion-time">{{ formatFriendlyTime(discussion.createdAt) }}</text>
					</view>
					<view class="discussion-content">{{ discussion.content }}</view>
					<view class="discussion-footer">
						<text class="discussion-status" :class="discussion.status">
							{{ discussion.status === 'replied' ? '已回复' : '待回复' }}
						</text>
						<text class="discussion-replies">{{ discussion.replyCount || 0 }} 条回复</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 错误状态 -->
		<view v-else class="error-state">
			<text class="error-icon">🔍</text>
			<text class="error-title">消息不存在或已被删除</text>
			<text class="error-description">
				很抱歉，您查看的消息可能已经被删除或不存在
			</text>
			<view class="error-actions">
				<button class="action-btn secondary" @click="goBack">
					<text class="btn-icon">🏠</text>
					<text class="btn-text">返回首页</text>
				</button>
				<button class="action-btn primary" @click="retryLoad">
					<text class="btn-icon">🔄</text>
					<text class="btn-text">重新加载</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getMessageDetailApi, markMessageAsReadApi, favoriteMessageApi, unfavoriteMessageApi, deleteMessageApi, pinMessageApi, unpinMessageApi, getMessageReadDetailsApi } from '../../api/message'
import { getDiscussionsApi } from '../../api/discussion'
import { MESSAGE_TYPE_LABELS, MESSAGE_TAG_LABELS } from '../../utils/constants'
import { formatTime, formatFriendlyTime } from '../../utils/time'
import { MarkdownRenderer, ThemeStyles } from '../../utils/markdown-renderer'
import { BASE_URL } from '../../utils/config'

const userStore = useUserStore()

// 数据
const message = ref(null)
const discussions = ref([])
const loading = ref(true)
const isFavorited = ref(false)
const messageId = ref(0)

// 版本切换相关
const currentVersion = ref('ai_optimized')  // 默认显示AI优化版

// 用于跟踪是否需要刷新讨论列表
const needRefreshDiscussions = ref(false)
const currentPage = ref(null)

// 防重复点击loading状态
const favoriteLoading = ref(false)
const shareLoading = ref(false)
const deleteLoading = ref(false)
const pinLoading = ref(false)

// 阅读详情相关
const showReadDetails = ref(false)
const readDetails = ref(null)
const readDetailsLoading = ref(false)
const readDetailsTab = ref('unread')
const avatarErrors = ref({})

// Markdown主题 - 从消息数据读取，默认为default
const markdownTheme = ref('default')

// 渲染后的Markdown内容（带主题内联样式）
const renderedContent = computed(() => {
	if (!message.value || !displayContent.value) return ''
	// 使用消息自带的主题进行渲染，样式内联到HTML中
	return MarkdownRenderer.renderWithTheme(displayContent.value, markdownTheme.value || 'default')
})

// 检查是否有优化版本
const hasOptimizedVersion = computed(() => {
	return message.value?.aiOptimizedContent && message.value.aiOptimizedContent.trim() !== ''
})

// 当前显示的内容
const displayContent = computed(() => {
	if (!message.value) return ''
	if (currentVersion.value === 'ai_optimized' && hasOptimizedVersion.value) {
		return message.value.aiOptimizedContent
	}
	return message.value.originalContent || message.value.content
})

// 切换版本方法
const switchVersion = (version) => {
	currentVersion.value = version
}

// 解析股票标签 - 支持 $股票名称(市场代码)$ 格式
function parseStockTags(text) {
	if (!text) return []
	const stockTagRegex = /\$([^\(]+)\(([A-Z]{2}\d{6})\)\$/g
	const stocks = []
	let match

	while ((match = stockTagRegex.exec(text)) !== null) {
		stocks.push({
			name: match[1].trim(),
			code: match[2],
			fullTag: match[0]
		})
	}

	// 同时保留原有的6位数字股票代码提取（兼容旧格式）
	// 添加验证：只识别有效的股票代码开头
	const isValidStockCodePrefix = (code) => {
		const firstChar = code.charAt(0)
		if (firstChar === '6') return true // 上海
		if (firstChar === '0' || firstChar === '3') return true // 深圳
		if (firstChar === '8') return true // 北京
		if (code.startsWith('92')) return true // 北京
		return false
	}

	const stockCodeRegex = /(?<![A-Z(])([0-9]{6})(?![)0-9])/g
	let codeMatch
	while ((codeMatch = stockCodeRegex.exec(text)) !== null) {
		// 验证股票代码开头是否有效
		if (!isValidStockCodePrefix(codeMatch[1])) {
			continue // 跳过无效代码
		}
		// 避免重复添加
		if (!stocks.find(s => s.code === codeMatch[1]) && isValidStockCodePrefix(codeMatch[1])) {
			stocks.push({
				name: getCodeName(codeMatch[1]),
				code: codeMatch[1],
				fullTag: codeMatch[1]
			})
		}
	}

	// 新增：支持 $个股(代码)$ 格式 - 如 $个股(300162)$
	// 同时验证股票代码开头是否有效
	const stockTagRegex2 = /\$个股\(([0-9]{6})\)\$/g
	let match2
	while ((match2 = stockTagRegex2.exec(text)) !== null) {
		// 避免重复添加，同时验证股票代码开头
		if (!stocks.find(s => s.code === match2[1]) && isValidStockCodePrefix(match2[1])) {
			stocks.push({
				name: getCodeName(match2[1]),
				code: match2[1],
				fullTag: match2[0]
			})
		}
	}

	return stocks
}

// 根据代码推断股票名称（简单实现）
function getCodeName(code) {
	const codeStr = String(code)
	if (codeStr.startsWith('6')) {
		return '沪市股票'
	} else if (codeStr.startsWith('0')) {
		return '深市股票'
	} else if (codeStr.startsWith('3')) {
		return '创业板'
	} else if (codeStr.startsWith('688')) {
		return '科创板'
	}
	return '股票'
}

// 获取市场代码
function getMarketCode(stockCode) {
	const code = String(stockCode)
	if (code.startsWith('6')) {
		return 1 // 上海交易所
	} else if (code.startsWith('0') || code.startsWith('3')) {
		return 0 // 深圳交易所
	} else if (code.startsWith('8') || code.startsWith('92')) {
		return 2 // 北京交易所
	} else {
		return 0 // 默认值
	}
}

// 生成行情图URL
function generateMarketChartUrl(stockCode) {
	const setcode = getMarketCode(stockCode)
	return `https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail?code=${stockCode}&setcode=${setcode}&opentype=native`
}

// 提取消息中的所有股票
const extractedStocks = computed(() => {
	if (!message.value) return []
	const content = displayContent.value
	return parseStockTags(content)
})

// 兼容旧代码的股票代码（第一个股票）
const stockCode = computed(() => {
	return extractedStocks.value.length > 0 ? extractedStocks.value[0].code : null
})

// 行情图URL
const marketChartUrl = computed(() => {
	if (!stockCode.value) return null
	return generateMarketChartUrl(stockCode.value)
})

// 打开行情图
const openMarketChart = () => {
	if (marketChartUrl.value) {
		uni.navigateTo({
			url: `/pages/webview/webview?url=${encodeURIComponent(marketChartUrl.value)}`
		});
	}
}

// 获取市场标签
const getMarketLabel = (stockCode) => {
	const code = String(stockCode)
	if (code.startsWith('6')) {
		return '沪'
	} else if (code.startsWith('0') || code.startsWith('3')) {
		return '深'
	} else if (code.startsWith('8') || code.startsWith('92')) {
		return '京'
	} else {
		return 'A'
	}
}

// 打开指定股票的行情图
const openMarketChartForStock = (stockCode) => {
	const url = generateMarketChartUrl(stockCode)
	uni.navigateTo({
		url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
	})
}

// 主题切换处理（保留接口，但不在详情页显示选择器）
const handleThemeChange = (newTheme) => {
	markdownTheme.value = newTheme
}

// 获取消息类型标签
const getMessageTypeLabel = (type) => {
	return MESSAGE_TYPE_LABELS[type] || type
}

// 清理图片URL（移除微信小程序添加的查询参数）
const cleanImageUrl = (url) => {
	if (!url) return url
	// 移除?后面的所有查询参数
	return url.split('?')[0]
}

// 加载消息详情
const loadMessageDetail = async () => {
	loading.value = true

	try {
		const res = await getMessageDetailApi(messageId.value)

		// 兼容 success 和 code 两种格式
		if (res.success || res.code === 200) {
			const messageData = res.data

			// 处理附件数据：转换为images格式
			if (messageData.attachments && messageData.attachments.length > 0) {
				messageData.images = messageData.attachments
					.filter(att => att.type === 'image')
					.map(att => {
						// 如果是相对路径，补全服务器地址
						let url = att.url
						if (url.startsWith('/uploads/')) {
							url = BASE_URL + url
						}
						// 清理URL中的查询参数
						return cleanImageUrl(url)
					})
			}

			message.value = messageData
			isFavorited.value = messageData.isFavorited || false

			// 从消息数据读取主题，如果没有则使用默认主题
			markdownTheme.value = messageData.theme || 'default'

			// 重置版本状态：如果有AI优化版本，默认显示AI优化版
			if (messageData.aiOptimizedContent && messageData.aiOptimizedContent.trim() !== '') {
				currentVersion.value = 'ai_optimized'
			} else {
				currentVersion.value = 'original'
			}

			// 标记为已读
			markMessageAsReadApi(messageId.value).then(() => {
				// 标记成功后刷新全局未读角标
				userStore.fetchUnreadCount()
			}).catch(err => {
				console.warn('标记已读失败:', err)
				// 不影响用户体验，静默失败
			})

			// 加载相关讨论
			loadDiscussions()
		} else {
			throw new Error(res.message || '加载失败')
		}
	} catch (error) {
		console.error('加载消息详情失败:', error)

		// 更友好的错误提示
		uni.showModal({
			title: '加载失败',
			content: error.message || '消息加载失败，请返回重试',
			showCancel: false,
			confirmText: '返回',
			success: () => {
				uni.navigateBack()
			}
		})
	} finally {
		loading.value = false
	}
}

// 加载相关讨论
const loadDiscussions = async () => {
	try {
		console.log('=== 加载讨论列表，messageId:', messageId.value, '===')
		const res = await getDiscussionsApi({
			messageId: messageId.value,
			limit: 10
		})

		console.log('=== 讨论列表响应 ===', res)

		// 兼容两种响应格式
		if (res.code === 200 || res.success) {
			discussions.value = res.data.discussions || []
			console.log('=== 讨论列表加载成功，共', discussions.value.length, '条 ===')
		} else {
			console.warn('加载讨论失败:', res.message)
		}
	} catch (error) {
		console.error('加载讨论失败:', error)
	}
}

// 切换收藏
const toggleFavorite = async () => {
	// 防止重复点击
	if (favoriteLoading.value) return

	// 添加登录检查
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1500)
		return
	}

	favoriteLoading.value = true
	const oldValue = isFavorited.value
	isFavorited.value = !oldValue

	try {
		let res
		if (isFavorited.value) {
			res = await favoriteMessageApi(messageId.value)
		} else {
			res = await unfavoriteMessageApi(messageId.value)
		}

		// 兼容两种响应格式
		if (res.success || res.code === 200) {
			uni.showToast({
				title: isFavorited.value ? '已收藏' : '已取消收藏',
				icon: 'success',
				duration: 1500
			})
		} else {
			throw new Error(res.message || '操作失败')
		}
	} catch (error) {
		// 失败时回滚UI
		isFavorited.value = oldValue

		console.error('收藏操作失败:', error)
		uni.showToast({
			title: '操作失败，请稍后重试',
			icon: 'none'
		})
	} finally {
		favoriteLoading.value = false
	}
}

// 预览图片
const previewImage = (index) => {
	// 清理所有图片URL后再预览
	const cleanUrls = message.value.images.map(img => cleanImageUrl(img))

	uni.previewImage({
		urls: cleanUrls,
		current: index,
		fail: (err) => {
			console.error('预览图片失败:', err)
			uni.showToast({
				title: '预览失败',
				icon: 'none'
			})
		}
	})
}

// 处理图片加载错误
const handleImageError = (index) => {
	console.error(`图片 ${index} 加载失败`)
	uni.showToast({
		title: '图片加载失败',
		icon: 'none'
	})
}

// 处理图片加载成功
const handleImageLoad = (index) => {
	// 图片加载成功，不需要日志
}

// 分享消息
const handleShare = async () => {
	// 防止重复点击
	if (shareLoading.value) return

	// 添加登录检查
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1500)
		return
	}

	shareLoading.value = true

	try {
		// 复制消息链接和标题到剪贴板
		const shareText = `${message.value.title}\n\n${message.value.content.substring(0, 100)}...`

		uni.setClipboardData({
			data: shareText,
			success: () => {
				uni.showModal({
					title: '分享成功',
					content: '内容已复制到剪贴板，可以粘贴分享给好友',
					showCancel: false
				})
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				})
			}
		})
	} finally {
		// 分享是异步操作，但clipboard操作很快，延迟重置loading
		setTimeout(() => {
			shareLoading.value = false
		}, 500)
	}
}

// 发起讨论
const goToDiscuss = () => {
	// 添加登录检查
	if (!userStore.isLoggedIn) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}, 1500)
		return
	}

	// 标记需要刷新讨论列表
	needRefreshDiscussions.value = true

	uni.navigateTo({
		url: `/pages/create-discussion/create-discussion?messageId=${messageId.value}`
	})
}

// 查看讨论详情
const goToDiscussionDetail = (id) => {
	uni.navigateTo({
		url: `/pages/discussion-detail/discussion-detail?id=${id}`
	})
}

// 返回
const goBack = () => {
	uni.navigateBack()
}

// 重新加载
const retryLoad = () => {
	loadMessageDetail()
}

// 编辑消息
const handleEdit = () => {
	uni.navigateTo({
		url: `/pages/create-message/create-message?id=${messageId.value}&mode=edit`
	})
}

// 删除消息
const handleDelete = () => {
	// 防止重复点击
	if (deleteLoading.value) return

	uni.showModal({
		title: '确认删除',
		content: '删除后无法恢复，是否继续？',
		confirmColor: '#ff5252',
		confirmText: '删除',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				deleteLoading.value = true
				uni.showLoading({ title: '删除中...', mask: true })

				try {
					const result = await deleteMessageApi(messageId.value)

					// 兼容两种响应格式
					if (result.success || result.code === 200) {
						uni.hideLoading()

						// 先显示成功提示
						uni.showToast({
							title: '删除成功',
							icon: 'success',
							duration: 1500
						})

						// 延迟返回，让用户看到提示
						setTimeout(() => {
							uni.navigateBack()
						}, 500)
					} else {
						throw new Error(result.message || '删除失败')
					}
				} catch (error) {
					uni.hideLoading()
					console.error('删除消息失败:', error)

					uni.showToast({
						title: error.message || '删除失败，请稍后重试',
						icon: 'none',
						duration: 2000
					})
				} finally {
					deleteLoading.value = false
				}
			}
		}
	})
}

// 切换置顶
const handleTogglePin = async () => {
	// 防止重复点击
	if (pinLoading.value) return

	pinLoading.value = true

	try {
		const api = message.value.isPinned ? unpinMessageApi : pinMessageApi
		const action = message.value.isPinned ? '取消置顶' : '置顶'

		const result = await api(messageId.value)
		if (result.success) {
			// 更新本地状态
			message.value.isPinned = !message.value.isPinned
			uni.showToast({
				title: `${action}成功`,
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: result.message || `${action}失败`,
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('切换置顶失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	} finally {
		pinLoading.value = false
	}
}

// 阅读详情：计算属性
const readRatePercent = computed(() => {
	if (!readDetails.value || readDetails.value.totalCount === 0) return 0
	return Math.round((readDetails.value.readCount / readDetails.value.totalCount) * 100)
})

const currentReadList = computed(() => {
	if (!readDetails.value) return []
	return readDetailsTab.value === 'read' ? readDetails.value.readUsers : readDetails.value.unreadUsers
})

// 阅读详情：切换面板
const toggleReadDetails = async () => {
	showReadDetails.value = !showReadDetails.value
	if (showReadDetails.value && !readDetails.value) {
		await loadReadDetails()
	}
}

// 阅读详情：加载数据
const loadReadDetails = async () => {
	readDetailsLoading.value = true
	try {
		const res = await getMessageReadDetailsApi(messageId.value)
		if (res.code === 200 || res.success) {
			readDetails.value = res.data
		}
	} catch (error) {
		console.error('加载阅读详情失败:', error)
		uni.showToast({ title: '加载失败', icon: 'none' })
	} finally {
		readDetailsLoading.value = false
	}
}

// 角色标签映射
const getRoleLabel = (role) => {
	const map = {
		super_admin: '超管',
		admin: '管理员',
		vip_mid: '中线',
		vip_short: '短线',
		trial: '试用'
	}
	return map[role] || role
}

// 头像加载失败处理
const handleAvatarError = (userId) => {
	avatarErrors.value[userId] = true
}

// URL 补全：相对路径拼接服务器地址
const getFullUrl = (url) => {
	if (!url) return ''
	if (url.startsWith('http://') || url.startsWith('https://')) return url
	if (url.startsWith('/uploads/')) return BASE_URL + url
	return url
}

// 页面显示时刷新讨论列表（从创建讨论页面返回时会触发）
onShow(() => {
	// 只在需要时刷新讨论列表，避免不必要的请求
	if (needRefreshDiscussions.value) {
		console.log('=== 页面显示，刷新讨论列表 ===')
		loadDiscussions()
		needRefreshDiscussions.value = false
	}
})

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadMessageDetail()
		await loadDiscussions()
		uni.showToast({
			title: '刷新成功',
			icon: 'success',
			duration: 1500
		})
	} catch (error) {
		console.error('刷新失败:', error)
		uni.showToast({
			title: '刷新失败',
			icon: 'none'
		})
	} finally {
		uni.stopPullDownRefresh()
	}
})

// 页面加载
onMounted(() => {
	// 获取消息ID
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	messageId.value = currentPage.options.id || 0

	if (!messageId.value) {
		uni.showToast({
			title: '消息ID不存在',
			icon: 'none'
		})
		setTimeout(goBack, 1500)
		return
	}

	// 主题从消息数据中读取，不再从本地存储读取
	loadMessageDetail()
	loadDiscussions()  // 加载相关讨论
})
</script>

<style lang="scss" scoped>
@import '../../styles/markdown-themes.scss';

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

/* 消息详情页 - 金融科技风格 */
.detail-container {
	min-height: 100vh;
	background: var(--bg-primary);
}

.loading-container {
	background: var(--bg-card);
	padding: 30rpx;
}

.skeleton-screen {
	background: var(--bg-card);
}

.skeleton-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.skeleton-badge {
	width: 120rpx;
	height: 40rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 20rpx;
}

.skeleton-time {
	width: 100rpx;
	height: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 15rpx;
}

.skeleton-title {
	width: 100%;
	height: 50rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}

.skeleton-tags {
	display: flex;
	gap: 12rpx;
	margin-bottom: 30rpx;
}

.skeleton-tag {
	width: 80rpx;
	height: 32rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 16rpx;
}

.skeleton-content {
	margin-bottom: 30rpx;
}

.skeleton-line {
	width: 100%;
	height: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 6rpx;
	margin-bottom: 15rpx;
}

.skeleton-line:last-child {
	width: 70%;
}

.skeleton-images {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.skeleton-image {
	width: 100%;
	height: 200rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 12rpx;
}

.skeleton-stats {
	display: flex;
	gap: 40rpx;
	padding: 30rpx 0;
	border-top: 1rpx solid #f0f0f0;
	border-bottom: 1rpx solid #f0f0f0;
}

.skeleton-stat {
	width: 120rpx;
	height: 30rpx;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 15rpx;
}

@keyframes loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.detail-content {
	background: #ffffff;
	padding: 30rpx;
	animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.message-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.message-type-badge {
	padding: 10rpx 24rpx;
	font-size: 24rpx;
	color: #ffffff;
	border-radius: 20rpx;
	background: #667eea;
}

.message-time {
	font-size: 24rpx;
	color: #999999;
}

.message-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	line-height: 1.5;
	margin-bottom: 20rpx;
}

.message-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 30rpx;
}

.message-tag {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	color: #667eea;
	background: #f0f2ff;
	border-radius: 16rpx;
}

// 风险提示 - 专业金融风格
.risk-disclaimer {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
	padding: 20rpx 24rpx;
	margin-bottom: 30rpx;
	background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
	border: 2rpx solid #f59e0b;
	border-radius: 12rpx;
}

.disclaimer-left {
	flex-shrink: 0;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f59e0b;
	border-radius: 50%;
}

.disclaimer-icon {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: bold;
}

.disclaimer-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.disclaimer-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #92400e;
}

.disclaimer-text {
	font-size: 22rpx;
	color: #a16207;
	line-height: 1.5;
}

.theme-selector-wrapper {
	margin-bottom: 20rpx;
}

.markdown-theme-container {
	margin-bottom: 30rpx;
}

// 版本切换标签
.version-tabs {
	display: flex;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.version-tab {
	flex: 1;
	padding: 20rpx;
	text-align: center;
	border-radius: 12rpx;
	background: #f5f5f5;
	font-size: 28rpx;
	color: #666;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	cursor: pointer;

	&.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-weight: 500;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}

	&:active {
		transform: scale(0.98);
	}
}

.tab-icon {
	font-size: 28rpx;
}

.tab-text {
	font-size: 28rpx;
}

.message-content {
	margin-bottom: 30rpx;

	&.with-version-switch {
		animation: fadeIn 0.3s ease-in-out;
	}
}

// 版本标识
.version-indicator {
	margin-top: 30rpx;
	margin-bottom: 30rpx;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	text-align: center;
	font-size: 24rpx;
	color: #666;
	animation: fadeIn 0.3s ease-in-out;
}

.ai-badge {
	color: #667eea;
	font-weight: 500;
}

.original-badge {
	color: #666;
}

// 股票卡片区域 - 金融社区横向滚动风格
.stock-cards-section {
	margin: 30rpx 0;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 16rpx;
	padding: 28rpx;
	border: 2rpx solid #e2e8f0;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1e293b;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.stock-count {
	font-size: 24rpx;
	color: #94a3b8;
	background: #ffffff;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	border: 1rpx solid #e2e8f0;
}

.stock-scroll-container {
	display: flex;
	flex-wrap: nowrap;
	white-space: nowrap;
	padding-bottom: 12rpx;
}

// 股票芯片卡片样式 - 同花顺风格
.stock-chip {
	flex-shrink: 0;
	width: 220rpx;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	padding: 20rpx;
	margin-right: 16rpx;
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 2rpx solid #3b82f6;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.15);
	transition: all 0.2s;
	cursor: pointer;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.25);
	}
}

.stock-chip-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.stock-chip-code {
	font-size: 32rpx;
	font-weight: 600;
	color: #1e40af;
	font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
	letter-spacing: 1rpx;
}

.stock-chip-market {
	font-size: 20rpx;
	color: #ffffff;
	background: #3b82f6;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
	font-weight: 500;
}

.stock-chip-name {
	font-size: 26rpx;
	color: #64748b;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.stock-chip-action {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	padding: 12rpx 0;
	border-top: 1rpx solid #e2e8f0;
	margin-top: 4rpx;
}

.stock-chip-action .action-icon {
	font-size: 24rpx;
}

.stock-chip-action .action-text {
	font-size: 22rpx;
	color: #3b82f6;
	font-weight: 500;
}

.action-text {
	font-weight: 500;
}

.content-text {
	font-size: 30rpx;
	color: #333333;
	line-height: 1.8;
	white-space: pre-wrap;
}

.message-images {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin: 0;
	display: block;
	padding: 20rpx 0;
}

.image-wrapper {
	position: relative;
	width: 100%;
	border-radius: 12rpx;
	overflow: hidden;
	background: #f5f5f5;
	cursor: pointer;
	transition: transform 0.2s ease;

	&:active {
		transform: scale(0.98);
	}
}

.message-image {
	width: 100%;
	display: block;
	border-radius: 12rpx;
	transition: opacity 0.3s ease;

	&:hover {
		opacity: 0.95;
	}
}

.image-mask {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
	opacity: 0;
	transition: opacity 0.3s ease;
	display: flex;
	align-items: flex-end;
	justify-content: center;

	.image-wrapper:hover &,
	.image-wrapper:active & {
		opacity: 1;
	}
}

.image-hint {
	color: #ffffff;
	font-size: 24rpx;
}

.message-stats {
	display: flex;
	gap: 40rpx;
	padding: 30rpx 0;
	border-top: 1rpx solid #e0e0e0;
	border-bottom: 1rpx solid #e0e0e0;
	margin-bottom: 30rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.stat-icon {
	font-size: 32rpx;
}

.stat-text {
	font-size: 28rpx;
	color: #666666;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
	margin-bottom: 40rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: #f5f5f5;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&.loading {
		animation: pulse 1.5s ease-in-out infinite;
	}
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.7;
	}
}

.action-btn.active {
	background: #fff3e0;
	color: #ff9800;
}

.action-btn.primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.btn-icon {
	font-size: 32rpx;
}

.discussions-section {
	margin-top: 40rpx;
	padding-top: 40rpx;
	border-top: 1rpx solid #e0e0e0;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
}

.discussion-item {
	padding: 30rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.discussion-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15rpx;
}

.discussion-user {
	font-size: 26rpx;
	color: #666666;
}

.discussion-time {
	font-size: 24rpx;
	color: #999999;
}

.discussion-content {
	font-size: 28rpx;
	color: #333333;
	line-height: 1.6;
	margin-bottom: 15rpx;
	word-wrap: break-word;
	overflow-wrap: break-word;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.discussion-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.discussion-status {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
}

.discussion-status.pending {
	color: #ff9800;
	background: #fff3e0;
}

.discussion-status.replied {
	color: #4caf50;
	background: #e8f5e9;
}

.discussion-replies {
	font-size: 24rpx;
	color: #999999;
}

.admin-actions {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	background: #ffffff;
	margin-top: 20rpx;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.admin-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	border-radius: 12rpx;
	border: none;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&.loading {
		animation: pulse 1.5s ease-in-out infinite;
	}

	&.pin {
		background: #fff9e6;
		color: #ff9800;

		&.pinned {
			background: #ffeaa7;
			color: #d63031;
		}
	}

	&.edit {
		background: #f0f2ff;
		color: #667eea;
	}

	&.delete {
		background: #ffeef0;
		color: #ff5252;
	}

	&:active {
		opacity: 0.8;
		transform: scale(0.98);
	}
}

.admin-btn-icon {
	font-size: 32rpx;
}

/* 阅读详情面板 */
.read-detail-toggle {
	cursor: pointer;
	position: relative;
}

.read-detail-text {
	color: #667eea;
}

.toggle-arrow {
	font-size: 20rpx;
	color: #667eea;
	margin-left: 6rpx;
}

.read-details-panel {
	margin-top: 20rpx;
	padding: 24rpx;
	background: #f8f9ff;
	border-radius: 16rpx;
	border: 2rpx solid #e8ecff;
}

.read-details-loading {
	display: flex;
	justify-content: center;
	padding: 40rpx;
	color: #999;
	font-size: 28rpx;
}

.read-details-summary {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 24rpx;
}

.summary-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12rpx 20rpx;
	background: #ffffff;
	border-radius: 12rpx;
	min-width: 100rpx;
}

.summary-item.read {
	border: 2rpx solid #52c41a;
}

.summary-item.unread {
	border: 2rpx solid #ff4d4f;
}

.summary-item.total {
	border: 2rpx solid #667eea;
}

.summary-count {
	font-size: 36rpx;
	font-weight: 700;
	color: #333;
}

.summary-item.read .summary-count {
	color: #52c41a;
}

.summary-item.unread .summary-count {
	color: #ff4d4f;
}

.summary-item.total .summary-count {
	color: #667eea;
}

.summary-label {
	font-size: 22rpx;
	color: #999;
	margin-top: 4rpx;
}

.read-rate-bar {
	flex: 1;
	height: 32rpx;
	background: #e8e8e8;
	border-radius: 16rpx;
	overflow: hidden;
	position: relative;
}

.read-rate-fill {
	height: 100%;
	background: linear-gradient(90deg, #52c41a, #73d13d);
	border-radius: 16rpx;
	transition: width 0.6s ease;
}

.read-rate-text {
	position: absolute;
	right: 12rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 20rpx;
	font-weight: 600;
	color: #333;
}

.read-details-tabs {
	display: flex;
	gap: 0;
	margin-bottom: 16rpx;
	border-radius: 12rpx;
	overflow: hidden;
	border: 2rpx solid #e8ecff;
}

.detail-tab {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	font-size: 26rpx;
	color: #666;
	background: #ffffff;
	transition: all 0.3s ease;

	&.active {
		background: #667eea;
		color: #ffffff;
		font-weight: 600;
	}
}

.read-details-list {
	max-height: 600rpx;
	overflow-y: auto;
}

.read-details-empty {
	display: flex;
	justify-content: center;
	padding: 40rpx;
	color: #999;
	font-size: 26rpx;
}

.read-user-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 16rpx 12rpx;
	background: #ffffff;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
}

.user-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.user-avatar-placeholder {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: #667eea;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avatar-text {
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 600;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.user-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.read-time {
	font-size: 22rpx;
	color: #999;
}

.user-role-tag {
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	flex-shrink: 0;

	&.super_admin {
		background: #fff1f0;
		color: #cf1322;
	}

	&.admin {
		background: #fff7e6;
		color: #d46b08;
	}

	&.vip_mid {
		background: #f0f2ff;
		color: #667eea;
	}

	&.vip_short {
		background: #e6fffb;
		color: #006d75;
	}

	&.trial {
		background: #f5f5f5;
		color: #999;
	}
}

.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 60rpx;
	background: #f8f9fa;
	border-radius: 20rpx;
	margin: 20rpx;
}

.error-icon {
	font-size: 160rpx;
	margin-bottom: 40rpx;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-20rpx);
	}
}

.error-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 20rpx;
	text-align: center;
}

.error-description {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.6;
	text-align: center;
	margin-bottom: 50rpx;
	max-width: 500rpx;
}

.error-actions {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
	max-width: 400rpx;
}

.secondary {
	background: #f5f5f5;
	color: #333333;
}

.secondary::after {
	border: none;
}

</style>
