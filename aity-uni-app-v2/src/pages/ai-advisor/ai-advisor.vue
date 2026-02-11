<template>
	<view class="ai-advisor-container">
		<!-- 顶部操作栏 -->
		<view class="header">
			<view class="header-title-section">
				<text class="header-title">图灵</text>
				<text class="header-subtitle">深度思考</text>
			</view>
			<view class="header-actions">
				<view class="action-button" @click="handleNewSession">
					<text class="action-icon">🔄</text>
					<text class="action-text">新会话</text>
				</view>
				<view class="action-button think-toggle" :class="{ active: thinkMode }" @click="toggleThinkMode">
					<text class="action-icon">🧠</text>
					<text class="action-text">深度思考</text>
				</view>
				<view v-if="isAdmin" class="admin-toggle" @click="toggleToolVisibility">
					<text class="toggle-text">{{ showTools ? '隐藏工具' : '显示工具' }}</text>
				</view>
			</view>
		</view>

		<!-- 实时行情指数条 -->
		<view class="market-ticker" v-if="marketData.length > 0">
			<scroll-view scroll-x class="ticker-scroll" :show-scrollbar="false">
				<view class="ticker-item" v-for="(item, index) in marketData" :key="index">
					<text class="ticker-name">{{ item.name }}</text>
					<text class="ticker-value" :class="getChangeClass(item.EXT_ZF)">
						{{ item.now }}
					</text>
					<text class="ticker-change" :class="getChangeClass(item.EXT_ZF)">
						{{ formatChange(item.EXT_ZF) }}%
					</text>
				</view>
			</scroll-view>
		</view>

		<!-- 对话消息区域 -->
		<scroll-view
			class="chat-container"
			scroll-y
			:scroll-into-view="scrollIntoView"
			:scroll-with-animation="true"
		>
			<!-- 欢迎消息 -->
			<view v-if="messages.length === 0" class="welcome-container">
				<view class="welcome-icon">🤖</view>
				<view class="welcome-title">我是图灵</view>
				<view class="welcome-subtitle">专注于投资问答的AI助手</view>

				<!-- 功能卡片 -->
				<view class="feature-cards">
					<view class="feature-card" @click="quickAction('diagnose')">
						<text class="feature-icon">📊</text>
						<text class="feature-name">诊股</text>
					</view>
					<view class="feature-card" @click="quickAction('select')">
						<text class="feature-icon">📈</text>
						<text class="feature-name">选股</text>
					</view>
					<view class="feature-card" @click="quickAction('news')">
						<text class="feature-icon">📰</text>
						<text class="feature-name">查资讯</text>
					</view>
				</view>

				<!-- 快捷问题 (横向) -->
				<view class="quick-questions-horizontal">
					<view class="quick-q" @click="sendQuickQuestion('今日市场行情如何?')">
						今日市场行情
					</view>
					<view class="quick-q" @click="sendQuickQuestion('帮我筛选科技板块龙头股')">
						筛选科技股
					</view>
					<view class="quick-q" @click="sendQuickQuestion('分析一下当前市场走势')">
						市场分析
					</view>
				</view>
			</view>

			<!-- 消息列表 -->
			<view
				v-for="(message, index) in messages"
				:key="index"
				:id="'message-' + index"
				class="message-item"
				:class="message.role"
			>
				<!-- 用户消息 -->
				<view v-if="message.role === 'user'" class="user-message">
					<view class="message-content">{{ message.content }}</view>
					<view class="message-avatar">👤</view>
				</view>

				<!-- AI消息 -->
				<view v-else class="ai-message-wrapper">
					<view class="ai-message">
						<view class="message-avatar">🤖</view>
						<view class="message-content">
							<!-- 工具调用展示（管理员可见） -->
							<view v-if="showTools && message.toolCalls && message.toolCalls.length > 0" class="tool-calls">
								<view class="tool-title">🔧 工具调用：</view>
								<view v-for="(tool, idx) in message.toolCalls" :key="idx" class="tool-item">
									<text class="tool-name">{{ tool.function?.name || '未知工具' }}</text>
									<text class="tool-args">{{ tool.function?.arguments || '' }}</text>
								</view>
							</view>

							<!-- 推理过程（深度思考） -->
							<view v-if="message.reasoning" class="reasoning-content">
								<view class="reasoning-title">💭 思考过程：</view>
								<text class="reasoning-text">{{ message.reasoning }}</text>
							</view>

							<!-- Markdown内容渲染 -->
							<view v-if="message.content" class="content-area">
								<!-- 如果是金融选股工具，尝试解析JSON表格 -->
								<view v-if="message.isTable" class="financial-content">
									<rich-text v-if="parseFinancialTable(message.content)" :nodes="renderFinancialTable(parseFinancialTable(message.content))"></rich-text>
									<rich-text v-else :nodes="renderMarkdown(message.content)"></rich-text>
								</view>
								<!-- 否则使用普通Markdown渲染 -->
								<view v-else class="markdown-content">
									<rich-text :nodes="renderMarkdown(message.content)"></rich-text>
								</view>
							</view>

							<!-- AI正在输入 -->
							<view v-if="message.isStreaming" class="typing-indicator">
								<view class="dot"></view>
								<view class="dot"></view>
								<view class="dot"></view>
							</view>
						</view>
					</view>

					<!-- 时间戳 -->
					<view class="message-time">{{ formatTime(message.timestamp) }}</view>
				</view>
			</view>
		</scroll-view>

		<!-- 工具栏 -->
		<view class="toolbar-container">
			<view class="toolbar">
				<view class="tool-item" @click="toggleTool('market')">
					<text class="tool-icon">📊</text>
					<text class="tool-text">行情</text>
				</view>
				<view class="tool-item" @click="toggleTool('stock')">
					<text class="tool-icon">📈</text>
					<text class="tool-text">选股</text>
				</view>
				<view class="tool-item" @click="toggleThinkMode">
					<text class="tool-icon">🧠</text>
					<text class="tool-text" :class="{ active: thinkMode }">深度</text>
				</view>
				<view class="tool-item" @click="handleClearHistory">
					<text class="tool-icon">📋</text>
					<text class="tool-text">历史</text>
				</view>
			</view>
		</view>

		<!-- 输入区域 -->
		<view class="input-container">
			<!-- 错误提示 -->
			<view v-if="errorMessage" class="error-message">
				{{ errorMessage }}
			</view>

			<view class="input-wrapper">
				<textarea
					class="chat-input"
					v-model="inputText"
					placeholder="输入您的问题..."
					:maxlength="500"
					:auto-height="true"
					:show-confirm-bar="false"
					@confirm="handleSend"
				/>
				<button
					class="send-button"
					:disabled="!inputText.trim() || isLoading"
					@click="handleSend"
				>
					<text v-if="!isLoading" class="send-icon">▶</text>
					<view v-else class="loading-spinner"></view>
				</button>
			</view>
		</view>

		<!-- 免责声明 (底部折叠) -->
		<view class="disclaimer-footer" v-if="!disclaimerAccepted">
			<view class="disclaimer-content" @click="showDisclaimerModal = true">
				<text class="disclaimer-icon">⚠️</text>
				<text class="disclaimer-text">本服务仅供参考,不构成投资建议</text>
				<text class="disclaimer-more">查看详情 ></text>
			</view>
		</view>

		<!-- 免责声明弹窗 (首次) -->
		<view v-if="showDisclaimerModal" class="disclaimer-modal" @click.self="handleAcceptDisclaimer">
			<view class="disclaimer-modal-content" @click.stop>
				<view class="disclaimer-modal-header">
					<text class="disclaimer-modal-title">⚠️ 重要提示</text>
				</view>
				<view class="disclaimer-modal-body">
					<view class="disclaimer-item">
						<text class="disclaimer-label">服务性质:</text>
						<text class="disclaimer-value">本服务仅为智能信息查询工具,所提供内容仅供参考</text>
					</view>
					<view class="disclaimer-item">
						<text class="disclaimer-label">风险提示:</text>
						<text class="disclaimer-value">不构成任何投资建议。投资有风险,入市需谨慎</text>
					</view>
					<view class="disclaimer-item">
						<text class="disclaimer-label">免责条款:</text>
						<text class="disclaimer-value">用户应根据自身情况独立判断,使用本服务所产生的的一切后果由用户自行承担</text>
					</view>
				</view>
				<view class="disclaimer-modal-footer">
					<button class="disclaimer-btn" @click="handleAcceptDisclaimer">我已阅读并同意</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { sendAIMessage } from '@/api/ai-advisor'
import { getChatHistory, saveChatHistory, saveThreadId, clearChatHistory, getThinkMode, setThinkMode } from '@/utils/ai-advisor-config'
import { MarkdownRenderer, FinancialTableParser } from '@/utils/markdown-renderer'

// 数据
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const scrollIntoView = ref('')
const abortController = ref(null)
const currentToolCalls = ref([]) // 当前消息的工具调用
const currentReasoning = ref('') // 当前消息的推理过程
const isFinancialQuery = ref(false) // 是否是金融查询工具

// 深度思考模式状态
const thinkMode = ref(false)

// 管理员设置
const showTools = ref(false) // 是否显示工具调用
const isAdmin = computed(() => {
	// 从用户信息中判断是否是管理员
	const userInfo = uni.getStorageSync('userInfo')
	return userInfo && (userInfo.role === 'super_admin' || userInfo.role === 'admin')
})

// 行情数据
const marketData = ref([])
let marketRefreshTimer = null

// 免责声明
const disclaimerAccepted = ref(false)
const showDisclaimerModal = ref(false)

// 切换工具显示
function toggleToolVisibility() {
	showTools.value = !showTools.value
	uni.setStorageSync('ai_show_tools', showTools.value)
}

// 切换深度思考模式
function toggleThinkMode() {
	const newMode = !thinkMode.value
	setThinkMode(newMode)
	thinkMode.value = newMode
}

// 新会话功能
function handleNewSession() {
	uni.showModal({
		title: '确认新会话',
		content: '确定要开始新会话吗？当前对话将被清空。',
		success: (res) => {
			if (res.confirm) {
				messages.value = []
				clearChatHistory()
				errorMessage.value = ''
				thinkMode.value = getThinkMode() // 重置为保存的思考模式
			}
		}
	})
}

// 切换工具栏功能
function toggleTool(type) {
	const prompts = {
		market: '今日大盘行情如何?',
		stock: '帮我筛选市盈率小于20的科技股'
	}
	if (prompts[type]) {
		inputText.value = prompts[type]
		handleSend()
	}
}

// 加载行情数据
async function loadMarketData() {
	try {
		// 调用后端代理接口(避免跨域)
		const res = await uni.request({
			url: 'https://aity88.online:8443/api/market/ticker',
			method: 'GET'
		})

		if (res.data.code === 200) {
			marketData.value = res.data.data
		}
	} catch (error) {
		console.error('加载行情失败:', error)
	}
}

// 格式化涨跌幅
function formatChange(value) {
	if (!value) return '0.00'
	const num = parseFloat(value)
	return (num >= 0 ? '+' : '') + num.toFixed(2)
}

// 获取涨跌样式类
function getChangeClass(value) {
	if (!value) return 'neutral'
	const num = parseFloat(value)
	if (num > 0) return 'up'
	if (num < 0) return 'down'
	return 'neutral'
}

// 渲染Markdown - 使用增强的渲染器
function renderMarkdown(content) {
	return MarkdownRenderer.render(content)
}

// 解析金融选股工具返回的JSON表格数据
function parseFinancialTable(content) {
	return FinancialTableParser.parse(content)
}

// 渲染金融查询表格
function renderFinancialTable(tableData) {
	return FinancialTableParser.render(tableData)
}

// 格式化时间
function formatTime(timestamp) {
	const date = new Date(timestamp)
	const hours = date.getHours().toString().padStart(2, '0')
	const minutes = date.getMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}`
}

// 添加用户消息
function addUserMessage(content) {
	messages.value.push({
		role: 'user',
		content: content,
		timestamp: Date.now()
	})
	scrollToBottom()
}

// 添加AI消息占位
function addAIMessagePlaceholder() {
	currentToolCalls.value = []
	currentReasoning.value = ''
	isFinancialQuery.value = false
	messages.value.push({
		role: 'ai',
		content: '',
		isStreaming: true,
		timestamp: Date.now(),
		toolCalls: [],
		reasoning: '',
		isTable: false
	})
	scrollToBottom()
}

// 更新AI消息
function updateAIMessage(newContent) {
	const lastMessage = messages.value[messages.value.length - 1]
	if (lastMessage && lastMessage.role === 'ai') {
		lastMessage.content = newContent
		scrollToBottom()
	}
}

// 完成AI消息
function completeAIMessage() {
	const lastMessage = messages.value[messages.value.length - 1]
	if (lastMessage && lastMessage.role === 'ai') {
		lastMessage.isStreaming = false
		// 保存threadId（如果有）
		saveChatHistory(messages.value)
	}
}

// 发送消息
async function handleSend() {
	const content = inputText.value.trim()
	if (!content || isLoading.value) return

	// 清空输入
	inputText.value = ''

	// 添加用户消息
	addUserMessage(content)

	// 添加AI占位消息
	addAIMessagePlaceholder()

	// 设置加载状态
	isLoading.value = true
	errorMessage.value = ''

	try {
		// 发送到AI
		const cancel = sendAIMessage(
			content,
			// onMessage - 接收流式数据
			(data) => {
				const lastMessage = messages.value[messages.value.length - 1]

				if (data.type === 'content') {
					// 更新内容
					updateAIMessage(data.fullContent)
				} else if (data.type === 'reasoning') {
					// 更新推理过程
					currentReasoning.value = data.fullReasoning
					if (lastMessage) {
						lastMessage.reasoning = data.fullReasoning
					}
				} else if (data.type === 'tool_calls') {
					// 更新工具调用
					if (data.tool_calls && data.tool_calls.length > 0) {
						currentToolCalls.value.push(...data.tool_calls)
						if (lastMessage) {
							lastMessage.toolCalls = [...currentToolCalls.value]

							// 检查是否是金融选股工具
							const hasFinancialTool = data.tool_calls.some(tool =>
								tool.function?.name === '金融选股'
							)
							if (hasFinancialTool) {
								isFinancialQuery.value = true
								lastMessage.isTable = true
							}
						}
					}
				}
			},
			// onError - 错误处理
			(error) => {
				console.error('AI请求失败:', error)
				errorMessage.value = '请求失败，请稍后重试'
				completeAIMessage()
				isLoading.value = false
			},
			// onComplete - 完成处理
			(result) => {
				console.log('AI回复完成:', result)
				completeAIMessage()
				isLoading.value = false
			}
		)

		// 保存取消函数
		abortController.value = cancel

	} catch (error) {
		console.error('发送消息失败:', error)
		errorMessage.value = '发送失败，请重试'
		isLoading.value = false
	}
}

// 快捷操作
function quickAction(type) {
	const prompts = {
		diagnose: '帮我分析一下贵州茅台的投资价值',
		select: '帮我筛选市盈率小于20的科技股',
		news: '今天有什么重要的财经新闻?'
	}
	inputText.value = prompts[type]
	handleSend()
}

// 发送快捷问题
function sendQuickQuestion(question) {
	inputText.value = question
	handleSend()
}

// 清空对话历史
function handleClearHistory() {
	uni.showModal({
		title: '确认清空',
		content: '确定要清空所有对话记录吗？',
		success: (res) => {
			if (res.confirm) {
				messages.value = []
				clearChatHistory()
				errorMessage.value = ''
			}
		}
	})
}

// 接受免责声明
function handleAcceptDisclaimer() {
	disclaimerAccepted.value = true
	showDisclaimerModal.value = false
	uni.setStorageSync('disclaimer_accepted', true)
}

// 滚动到底部
function scrollToBottom() {
	nextTick(() => {
		if (messages.value.length > 0) {
			scrollIntoView.value = 'message-' + (messages.value.length - 1)
		}
	})
}

// 页面加载
onMounted(() => {
	// 检查是否已接受免责声明
	const accepted = uni.getStorageSync('disclaimer_accepted')
	if (!accepted) {
		showDisclaimerModal.value = true
	} else {
		disclaimerAccepted.value = true
	}

	// 加载行情数据
	loadMarketData()

	// 每30秒刷新行情
	marketRefreshTimer = setInterval(loadMarketData, 30000)

	// 加载历史对话
	const history = getChatHistory()
	if (history && history.length > 0) {
		messages.value = history
		nextTick(() => {
			scrollToBottom()
		})
	}

	// 加载管理员设置
	const savedShowTools = uni.getStorageSync('ai_show_tools')
	if (savedShowTools !== null) {
		showTools.value = savedShowTools
	}

	// 加载深度思考模式状态
	thinkMode.value = getThinkMode()
})

// 页面卸载
onUnmounted(() => {
	if (marketRefreshTimer) {
		clearInterval(marketRefreshTimer)
	}
})
</script>

<style lang="scss" scoped>
.ai-advisor-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f5f5f5;
	padding-bottom: 0;
}

/* 顶部操作栏 */
.header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 30rpx 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-title-section {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.header-title {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 8rpx;
}

.header-subtitle {
	display: block;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.action-button {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 20rpx;
	backdrop-filter: blur(10rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.action-button:active {
	background: rgba(255, 255, 255, 0.25);
	transform: scale(0.95);
}

.action-icon {
	font-size: 24rpx;
}

.action-text {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 500;
}

.think-toggle {
	background: rgba(255, 255, 255, 0.2);
	border-color: rgba(255, 255, 255, 0.3);
}

.think-toggle.active {
	background: rgba(255, 255, 255, 0.3);
	border-color: rgba(255, 255, 255, 0.5);
}

/* 管理员开关 */
.admin-toggle {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 12rpx 20rpx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.toggle-text {
	font-size: 24rpx;
	color: #ffffff;
}

/* 行情指数条 */
.market-ticker {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 16rpx 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
}

.ticker-scroll {
	white-space: nowrap;
}

.ticker-item {
	display: inline-flex;
	align-items: center;
	gap: 12rpx;
	margin-right: 32rpx;
	color: #ffffff;
}

.ticker-name {
	font-size: 24rpx;
	opacity: 0.9;
	font-weight: 500;
}

.ticker-value {
	font-size: 26rpx;
	font-weight: bold;
}

.ticker-value.up { color: #ff4d4f; }
.ticker-value.down { color: #52c41a; }
.ticker-value.neutral { color: #ffffff; }

.ticker-change {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-weight: 600;
}

.ticker-change.up {
	background: rgba(255, 77, 79, 0.2);
	color: #ff4d4f;
}

.ticker-change.down {
	background: rgba(82, 196, 26, 0.2);
	color: #52c41a;
}

.ticker-change.neutral {
	background: rgba(255, 255, 255, 0.2);
	color: #ffffff;
}

/* 对话区域 */
.chat-container {
	flex: 1;
	padding: 20rpx;
	overflow-y: auto;
}

/* 欢迎区域 */
.welcome-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 80rpx 40rpx 60rpx;
}

.welcome-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
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

.welcome-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 16rpx;
}

.welcome-subtitle {
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 60rpx;
}

/* 功能卡片 */
.feature-cards {
	display: flex;
	gap: 20rpx;
	margin-bottom: 50rpx;
	width: 100%;
}

.feature-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	padding: 32rpx 20rpx;
	background: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s;
}

.feature-card:active {
	transform: translateY(-4rpx);
	box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
}

.feature-icon {
	font-size: 48rpx;
}

.feature-name {
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
}

/* 快捷问题(横向) */
.quick-questions-horizontal {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
	justify-content: center;
	width: 100%;
}

.quick-q {
	padding: 16rpx 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 24rpx;
	font-size: 26rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s;
}

.quick-q:active {
	transform: scale(0.95);
}

/* 消息项 */
.message-item {
	margin-bottom: 30rpx;
	animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 用户消息 */
.user-message {
	display: flex;
	flex-direction: row-reverse;
	align-items: flex-start;
}

.user-message .message-content {
	max-width: 70%;
	padding: 24rpx 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 24rpx 24rpx 4rpx 24rpx;
	font-size: 30rpx;
	line-height: 1.6;
	word-wrap: break-word;
}

.user-message .message-avatar {
	width: 72rpx;
	height: 72rpx;
	margin-left: 20rpx;
	font-size: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f0f0f0;
	border-radius: 50%;
	flex-shrink: 0;
}

/* AI消息 */
.ai-message-wrapper {
	display: flex;
	flex-direction: column;
}

.ai-message {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
}

.ai-message .message-avatar {
	width: 72rpx;
	height: 72rpx;
	margin-right: 20rpx;
	font-size: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	flex-shrink: 0;
}

.ai-message .message-content {
	max-width: 70%;
	padding: 24rpx 32rpx;
	background: #ffffff;
	border-radius: 24rpx 24rpx 24rpx 4rpx;
	font-size: 30rpx;
	line-height: 1.6;
	word-wrap: break-word;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 工具调用 */
.tool-calls {
	padding: 16rpx;
	background: #f0f2ff;
	border-radius: 8rpx;
	margin-bottom: 16rpx;
	border: 1rpx solid #d0d7ff;
}

.tool-title {
	font-size: 24rpx;
	font-weight: bold;
	color: #667eea;
	margin-bottom: 12rpx;
}

.tool-item {
	padding: 12rpx;
	background: #ffffff;
	border-radius: 6rpx;
	margin-bottom: 8rpx;
	border-left: 3rpx solid #667eea;
}

.tool-name {
	display: block;
	font-size: 26rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 6rpx;
}

.tool-args {
	display: block;
	font-size: 24rpx;
	color: #666666;
	font-family: monospace;
	word-break: break-all;
}

/* 推理过程 */
.reasoning-content {
	padding: 16rpx;
	background: #fff9e6;
	border-radius: 8rpx;
	margin-bottom: 16rpx;
	border: 1rpx solid #ffe58f;
}

.reasoning-title {
	font-size: 24rpx;
	font-weight: bold;
	color: #d48806;
	margin-bottom: 12rpx;
}

.reasoning-text {
	font-size: 26rpx;
	color: #8c6800;
	line-height: 1.6;
	white-space: pre-wrap;
}

/* Markdown内容 - 增强样式 */
.content-area {
	word-break: break-word;
	line-height: 1.8;
}

.markdown-content ::v-deep h1,
.markdown-content ::v-deep h2,
.markdown-content ::v-deep h3,
.markdown-content ::v-deep h4,
.markdown-content ::v-deep h5,
.markdown-content ::v-deep h6 {
	font-weight: 600;
	line-height: 1.4;
	margin: 24rpx 0 16rpx;
	color: #333333;
}

.markdown-content ::v-deep h1 {
	font-size: 40rpx;
	border-bottom: 2rpx solid #e0e0e0;
	padding-bottom: 12rpx;
}

.markdown-content ::v-deep h2 {
	font-size: 36rpx;
	border-bottom: 1rpx solid #e0e0e0;
	padding-bottom: 8rpx;
}

.markdown-content ::v-deep h3 {
	font-size: 32rpx;
}

.markdown-content ::v-deep h4 {
	font-size: 30rpx;
}

.markdown-content ::v-deep h5 {
	font-size: 28rpx;
}

.markdown-content ::v-deep h6 {
	font-size: 26rpx;
	color: #666666;
}

.markdown-content ::v-deep table {
	width: 100%;
	border-collapse: collapse;
	margin: 24rpx 0;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	overflow: hidden;
}

.markdown-content ::v-deep .markdown-table {
	width: 100%;
	border-collapse: collapse;
	margin: 24rpx 0;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	overflow: hidden;
}

.markdown-content ::v-deep td,
.markdown-content ::v-deep th {
	border: 1rpx solid #e0e0e0;
	padding: 12rpx 16rpx;
	text-align: left;
}

.markdown-content ::v-deep th {
	background: linear-gradient(to bottom, #f8f9fa, #f5f5f5);
	font-weight: 600;
	color: #333333;
}

.markdown-content ::v-deep tr:nth-child(even) {
	background: #fafafa;
}

.markdown-content ::v-deep tr:hover {
	background: #f0f2ff;
}

.markdown-content ::v-deep pre {
	background: #f6f8fa;
	padding: 20rpx;
	border-radius: 8rpx;
	overflow-x: auto;
	margin: 16rpx 0;
	border: 1rpx solid #e1e4e8;
}

.markdown-content ::v-deep .code-block {
	background: #282c34;
	color: #abb2bf;
	padding: 20rpx;
	border-radius: 8rpx;
	overflow-x: auto;
	margin: 16rpx 0;
	font-family: 'Consolas', 'Monaco', monospace;
	font-size: 26rpx;
	line-height: 1.6;
}

.markdown-content ::v-deep .inline-code {
	background: #f6f8fa;
	color: #e83e8c;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	font-family: 'Consolas', 'Monaco', monospace;
	font-size: 28rpx;
	border: 1rpx solid #e1e4e8;
}

.markdown-content ::v-deep code {
	background: #f6f8fa;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	font-family: monospace;
	font-size: 28rpx;
	color: #e83e8c;
}

.markdown-content ::v-deed strong {
	font-weight: 600;
	color: #333333;
}

.markdown-content ::v-deep em {
	font-style: italic;
	color: #555555;
}

.markdown-content ::v-deep del {
	text-decoration: line-through;
	color: #999999;
}

.markdown-content ::v-deep blockquote {
	margin: 16rpx 0;
	padding: 16rpx 20rpx;
	background: #f0f2ff;
	border-left: 4rpx solid #667eea;
	color: #555555;
	font-style: italic;
}

.markdown-content ::v-deep ul,
.markdown-content ::v-deep ol {
	padding-left: 40rpx;
	margin: 16rpx 0;
}

.markdown-content ::v-deep li {
	margin: 8rpx 0;
	line-height: 1.6;
}

.markdown-content ::v-deep .list-item,
.markdown-content ::v-deep .list-item-ordered {
	margin: 8rpx 0;
	line-height: 1.8;
}

.markdown-content ::v-deep .link {
	color: #667eea;
	text-decoration: none;
	border-bottom: 1rpx dashed #667eea;
}

.markdown-content ::v-deep .link:active {
	color: #764ba2;
	border-bottom-style: solid;
}

.markdown-content ::v-deep .markdown-image {
	max-width: 100%;
	height: auto;
	border-radius: 8rpx;
	margin: 16rpx 0;
}

.markdown-content ::v-deep .divider {
	border: none;
	border-top: 2rpx solid #e0e0e0;
	margin: 32rpx 0;
}

/* 金融数据颜色 */
.markdown-content ::v-deep .text-up {
	color: #ff4d4f;
	font-weight: 600;
}

.markdown-content ::v-deep .text-down {
	color: #52c41a;
	font-weight: 600;
}

.markdown-content ::v-deep .text-neutral {
	color: #666666;
}

.markdown-content ::v-deed strong {
	font-weight: bold;
}

/* 金融表格 */
.financial-content {
	margin: 16rpx 0;
}

.financial-table-container {
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	overflow: hidden;
	margin: 16rpx 0;
}

.table-info {
	padding: 16rpx;
	background: #f0f2ff;
	font-size: 26rpx;
	color: #667eea;
	text-align: center;
	border-bottom: 1rpx solid #e0e0e0;
}

.financial-table {
	width: 100%;
	border-collapse: collapse;
}

.financial-table thead {
	background: #f5f5f5;
}

.financial-table th {
	padding: 16rpx;
	text-align: left;
	font-weight: bold;
	font-size: 28rpx;
	color: #333333;
	border-bottom: 1rpx solid #e0e0e0;
}

.financial-table td {
	padding: 16rpx;
	text-align: left;
	font-size: 28rpx;
	color: #666666;
	border-bottom: 1rpx solid #f0f0f0;
}

.financial-table tbody tr:last-child td {
	border-bottom: none;
}

.financial-table tbody tr:hover {
	background: #fafafa;
}

/* 打字机动画 */
.typing-indicator {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	margin-left: 8rpx;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	background: #667eea;
	border-radius: 50%;
	animation: typing 1.4s infinite;
}

.dot:nth-child(2) {
	animation-delay: 0.2s;
}

.dot:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes typing {
	0%, 60%, 100% {
		opacity: 0.3;
		transform: scale(0.8);
	}
	30% {
		opacity: 1;
		transform: scale(1);
	}
}

/* 时间戳 */
.message-time {
	font-size: 22rpx;
	color: #cccccc;
	margin-top: 12rpx;
	text-align: center;
}

/* 工具栏 */
.toolbar-container {
	background: #ffffff;
	border-top: 1rpx solid #e0e0e0;
}

.toolbar {
	display: flex;
	justify-content: space-around;
	padding: 20rpx 0;
}

.tool-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	transition: all 0.3s;
}

.tool-item:active {
	transform: scale(0.9);
}

.tool-icon {
	font-size: 36rpx;
}

.tool-text {
	font-size: 22rpx;
	color: #666666;
}

.tool-text.active {
	color: #667eea;
	font-weight: bold;
}

/* 输入区域 */
.input-container {
	background: #ffffff;
	border-top: 1rpx solid #e0e0e0;
	padding: 20rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.error-message {
	padding: 16rpx 24rpx;
	background: #fff1f0;
	color: #ff4d4f;
	border-radius: 8rpx;
	font-size: 26rpx;
	margin-bottom: 16rpx;
	text-align: center;
}

.input-wrapper {
	display: flex;
	align-items: flex-end;
	gap: 16rpx;
}

.chat-input {
	flex: 1;
	min-height: 80rpx;
	max-height: 200rpx;
	padding: 16rpx 24rpx;
	background: #f5f5f5;
	border-radius: 12rpx;
	font-size: 30rpx;
	line-height: 1.5;
}

.send-button {
	min-width: 80rpx;
	height: 80rpx;
	padding: 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 12rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.send-button[disabled] {
	opacity: 0.5;
}

.send-icon {
	font-size: 24rpx;
}

.loading-spinner {
	width: 32rpx;
	height: 32rpx;
	border: 3rpx solid rgba(255, 255, 255, 0.3);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* 免责声明底部 */
.disclaimer-footer {
	background: #fff9e6;
	border-top: 1rpx solid #ffe58f;
	padding: 16rpx 20rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.disclaimer-content {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.disclaimer-icon {
	font-size: 28rpx;
	flex-shrink: 0;
}

.disclaimer-text {
	flex: 1;
	font-size: 22rpx;
	color: #8c6800;
	line-height: 1.4;
}

.disclaimer-more {
	font-size: 22rpx;
	color: #667eea;
	flex-shrink: 0;
}

/* 免责声明弹窗 */
.disclaimer-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.disclaimer-modal-content {
	width: 600rpx;
	background: #ffffff;
	border-radius: 20rpx;
	overflow: hidden;
}

.disclaimer-modal-header {
	padding: 32rpx;
	background: linear-gradient(135deg, #fff9e6 0%, #ffe7ba 100%);
	text-align: center;
}

.disclaimer-modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #d48806;
}

.disclaimer-modal-body {
	padding: 32rpx;
}

.disclaimer-item {
	margin-bottom: 24rpx;
}

.disclaimer-label {
	display: block;
	font-size: 26rpx;
	font-weight: bold;
	color: #d48806;
	margin-bottom: 12rpx;
}

.disclaimer-value {
	display: block;
	font-size: 24rpx;
	color: #666666;
	line-height: 1.6;
}

.disclaimer-modal-footer {
	padding: 24rpx 32rpx;
	border-top: 1rpx solid #e0e0e0;
}

.disclaimer-btn {
	width: 100%;
	padding: 24rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;
}
</style>
