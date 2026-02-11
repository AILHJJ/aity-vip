<template>
	<view class="ai-advisor-container">
		<!-- 极简顶部栏 -->
		<view class="header">
			<view class="header-left">
				<text class="header-title">图灵</text>
				<text class="header-divider">|</text>
				<text class="header-subtitle">智能金融</text>
			</view>
			<view class="header-actions">
				<view class="icon-btn" :class="{ active: thinkMode }" @click="toggleThinkMode">
					<text class="icon-btn-text">∞</text>
				</view>
				<view class="icon-btn" @click="handleNewSession">
					<text class="icon-btn-text">+</text>
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
				<view class="welcome-icon-wrapper">
					<view class="welcome-icon-bg"></view>
					<text class="welcome-icon">✦</text>
				</view>
				<view class="welcome-title">图灵</view>
				<view class="welcome-subtitle">智能金融助手</view>
				<view class="welcome-hint">开始提问，探索AI金融</view>
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
					<view class="message-avatar user-avatar">U</view>
				</view>

				<!-- AI消息 -->
				<view v-else class="ai-message-wrapper">
					<view class="ai-message">
						<view class="message-avatar ai-avatar">AI</view>
						<view class="message-content">
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

					<!-- 风险提示 + 时间戳 + 刷新按钮 -->
					<view class="message-footer" v-if="!message.isStreaming">
						<view class="risk-tip">
							<text class="risk-icon">⚠️</text>
							<text class="risk-text">仅供参考，不构成投资建议</text>
						</view>
					<view class="message-actions">
							<text class="message-time">{{ formatTime(message.timestamp) }}</text>
							<view class="refresh-btn" @click="handleRefreshMessage(index)">
								<text class="refresh-icon">↻</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

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
					<text v-if="!isLoading" class="send-icon">↑</text>
					<view v-else class="loading-spinner"></view>
				</button>
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { sendAIMessage } from '@/api/ai-advisor'
import { getChatHistory, saveChatHistory, saveThreadId, clearChatHistory, getThinkMode, setThinkMode } from '@/utils/ai-advisor-config'
import { MarkdownRenderer, FinancialTableParser } from '@/utils/markdown-renderer'

// 数据
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const scrollIntoView = ref('')
const currentToolCalls = ref([])
const currentReasoning = ref('')
const isFinancialQuery = ref(false)

// 深度思考模式状态
const thinkMode = ref(false)

// 行情数据
const marketData = ref([])
let marketRefreshTimer = null

// 免责声明
const disclaimerAccepted = ref(false)
const showDisclaimerModal = ref(false)

// 切换深度思考模式
function toggleThinkMode() {
	const newMode = !thinkMode.value
	setThinkMode(newMode)
	thinkMode.value = newMode
}

// 新会话功能
function handleNewSession() {
	messages.value = []
	clearChatHistory()
	errorMessage.value = ''
	thinkMode.value = getThinkMode()
}

// 加载行情数据
async function loadMarketData() {
	try {
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

// 渲染Markdown
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
		saveChatHistory(messages.value)
	}
}

// 发送消息
async function handleSend() {
	const content = inputText.value.trim()
	if (!content || isLoading.value) return

	inputText.value = ''
	addUserMessage(content)
	addAIMessagePlaceholder()
	isLoading.value = true
	errorMessage.value = ''

	try {
		sendAIMessage(
			content,
			(data) => {
				const lastMessage = messages.value[messages.value.length - 1]

				if (data.type === 'content') {
					updateAIMessage(data.fullContent)
				} else if (data.type === 'reasoning') {
					currentReasoning.value = data.fullReasoning
					if (lastMessage) {
						lastMessage.reasoning = data.fullReasoning
					}
				} else if (data.type === 'tool_calls') {
					if (data.tool_calls && data.tool_calls.length > 0) {
						currentToolCalls.value.push(...data.tool_calls)
						if (lastMessage) {
							lastMessage.toolCalls = [...currentToolCalls.value]
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
			(error) => {
				console.error('AI请求失败:', error)
				errorMessage.value = '请求失败，请稍后重试'
				completeAIMessage()
				isLoading.value = false
			},
			(result) => {
				console.log('AI回复完成:', result)
				completeAIMessage()
				isLoading.value = false
			}
		)
	} catch (error) {
		console.error('发送消息失败:', error)
		errorMessage.value = '发送失败，请重试'
		isLoading.value = false
	}
}

// 接受免责声明
function handleAcceptDisclaimer() {
	disclaimerAccepted.value = true
	showDisclaimerModal.value = false
	uni.setStorageSync('disclaimer_accepted', true)
}

// 刷新单条消息
function handleRefreshMessage(index) {
	// TODO: 实现重新生成该条消息的功能
	uni.showToast({
		title: '重新生成中...',
		icon: 'none'
	})
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
	const accepted = uni.getStorageSync('disclaimer_accepted')
	if (!accepted) {
		showDisclaimerModal.value = true
	} else {
		disclaimerAccepted.value = true
	}

	loadMarketData()
	marketRefreshTimer = setInterval(loadMarketData, 30000)

	const history = getChatHistory()
	if (history && history.length > 0) {
		messages.value = history
		nextTick(() => {
			scrollToBottom()
		})
	}

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
	background: #fafafa;
}

/* 极简顶部栏 */
.header {
	background: #ffffff;
	padding: 24rpx 32rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f0f0f0;
	position: relative;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.header-title {
	font-size: 40rpx;
	font-weight: bold;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.header-divider {
	font-size: 28rpx;
	color: #e0e0e0;
	font-weight: 300;
}

.header-subtitle {
	font-size: 26rpx;
	color: #999999;
	font-weight: 400;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.icon-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
	border-radius: 16rpx;
	transition: all 0.2s ease;
}

.icon-btn:active {
	transform: scale(0.92);
	background: #f0f2ff;
}

.icon-btn.active {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
	border: 2rpx solid rgba(102, 126, 234, 0.3);
}

.icon-btn-text {
	font-size: 36rpx;
	font-weight: 300;
	letter-spacing: 2rpx;
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

/* 欢迎区域 - 极简设计 */
.welcome-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 40rpx 80rpx;
}

.welcome-icon-wrapper {
	position: relative;
	width: 140rpx;
	height: 140rpx;
	margin-bottom: 48rpx;
}

.welcome-icon-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	opacity: 0.08;
	animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
		opacity: 0.08;
	}
	50% {
		transform: scale(1.08);
		opacity: 0.12;
	}
}

.welcome-icon {
	position: relative;
	font-size: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #667eea;
	animation: float 4s ease-in-out infinite;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-8rpx);
	}
}

.welcome-title {
	font-size: 48rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 12rpx;
	letter-spacing: 2rpx;
}

.welcome-subtitle {
	font-size: 26rpx;
	color: #999999;
	margin-bottom: 60rpx;
	font-weight: 300;
}

.welcome-hint {
	font-size: 24rpx;
	color: #cccccc;
	font-weight: 300;
	letter-spacing: 1rpx;
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
	justify-content: flex-end;
}

.user-message .message-content {
	max-width: 75%;
	padding: 20rpx 28rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 20rpx 20rpx 4rpx 20rpx;
	font-size: 30rpx;
	line-height: 1.6;
	word-wrap: break-word;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.15);
}

.user-message .message-avatar.user-avatar {
	width: 64rpx;
	height: 64rpx;
	margin-left: 16rpx;
	font-size: 28rpx;
	font-weight: bold;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
	border-radius: 50%;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
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

.ai-message .message-avatar.ai-avatar {
	width: 64rpx;
	height: 64rpx;
	margin-right: 16rpx;
	font-size: 22rpx;
	font-weight: bold;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
}

.ai-message .message-content {
	flex: 1;
	max-width: 75%;
	padding: 20rpx 28rpx;
	background: #ffffff;
	border-radius: 20rpx 20rpx 20rpx 4rpx;
	font-size: 30rpx;
	line-height: 1.7;
	word-wrap: break-word;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	border: 1rpx solid #f5f5f5;
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

/* Markdown内容 - ChatGPT风格 */
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
	margin: 32rpx 0 16rpx;
	color: #1a1a1a;
}

.markdown-content ::v-deep h1 {
	font-size: 40rpx;
	border-bottom: 1rpx solid #e5e5e5;
	padding-bottom: 16rpx;
	margin-top: 48rpx;
}

.markdown-content ::v-deep h2 {
	font-size: 36rpx;
	border-bottom: 1rpx solid #f0f0f0;
	padding-bottom: 12rpx;
	margin-top: 40rpx;
}

.markdown-content ::v-deep h3 {
	font-size: 32rpx;
	margin-top: 32rpx;
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

.markdown-content ::v-deep p {
	margin: 16rpx 0;
	line-height: 1.8;
}

.markdown-content ::v-deep table {
	width: 100%;
	border-collapse: collapse;
	margin: 24rpx 0;
	border: 1rpx solid #e5e5e5;
	border-radius: 8rpx;
	overflow: hidden;
}

.markdown-content ::v-deep .markdown-table {
	width: 100%;
	border-collapse: collapse;
	margin: 24rpx 0;
	border: 1rpx solid #e5e5e5;
	border-radius: 8rpx;
	overflow: hidden;
}

.markdown-content ::v-deep td,
.markdown-content ::v-deep th {
	border: 1rpx solid #e5e5e5;
	padding: 12rpx 16rpx;
	text-align: left;
}

.markdown-content ::v-deep th {
	background: #f8f9fa;
	font-weight: 600;
	color: #1a1a1a;
}

.markdown-content ::v-deep tr:nth-child(even) {
	background: #fafbfc;
}

.markdown-content ::v-deep tr:hover {
	background: #f0f7ff;
}

.markdown-content ::v-deep pre {
	background: #1e1e1e;
	padding: 24rpx;
	border-radius: 8rpx;
	overflow-x: auto;
	margin: 20rpx 0;
}

.markdown-content ::v-deep .code-block {
	background: #1e1e1e;
	color: #d4d4d4;
	padding: 24rpx;
	border-radius: 8rpx;
	overflow-x: auto;
	margin: 20rpx 0;
	font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	font-size: 26rpx;
	line-height: 1.6;
}

.markdown-content ::v-deep .inline-code {
	background: #f0f0f0;
	color: #e83e8c;
	padding: 4rpx 10rpx;
	border-radius: 6rpx;
	font-family: 'Consolas', 'Monaco', monospace;
	font-size: 28rpx;
}

.markdown-content ::v-deep code {
	background: #f0f0f0;
	padding: 4rpx 10rpx;
	border-radius: 6rpx;
	font-family: 'Consolas', 'Monaco', monospace;
	font-size: 28rpx;
	color: #e83e8c;
}

.markdown-content ::v-deep strong {
	font-weight: 600;
	color: #1a1a1a;
}

.markdown-content ::v-deep em {
	font-style: italic;
	color: #4a4a4a;
}

.markdown-content ::v-deep del {
	text-decoration: line-through;
	color: #999999;
}

.markdown-content ::v-deep blockquote {
	margin: 20rpx 0;
	padding: 16rpx 20rpx;
	background: #f8f9fa;
	border-left: 4rpx solid #667eea;
	color: #4a4a4a;
}

.markdown-content ::v-deep ul,
.markdown-content ::v-deep ol {
	padding-left: 40rpx;
	margin: 16rpx 0;
}

.markdown-content ::v-deep li {
	margin: 8rpx 0;
	line-height: 1.8;
}

.markdown-content ::v-deep .list-item,
.markdown-content ::v-deep .list-item-ordered {
	margin: 8rpx 0;
	line-height: 1.8;
}

.markdown-content ::v-deep .link {
	color: #667eea;
	text-decoration: none;
	border-bottom: 1rpx solid #667eea;
}

.markdown-content ::v-deep .link:active {
	color: #764ba2;
	border-bottom-color: #764ba2;
}

.markdown-content ::v-deep .markdown-image {
	max-width: 100%;
	height: auto;
	border-radius: 8rpx;
	margin: 16rpx 0;
}

.markdown-content ::v-deep .divider {
	border: none;
	border-top: 1rpx solid #e5e5e5;
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

/* 消息底部 - 风险提示 + 操作 */
.message-footer {
	margin-top: 16rpx;
	margin-left: 80rpx;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.risk-tip {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 16rpx;
	background: #fff9e6;
	border-radius: 8rpx;
	border-left: 3rpx solid #d48806;
}

.risk-icon {
	font-size: 20rpx;
	flex-shrink: 0;
}

.risk-text {
	font-size: 22rpx;
	color: #8c6800;
	line-height: 1.4;
}

.message-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.refresh-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
	border-radius: 12rpx;
	transition: all 0.2s ease;
}

.refresh-btn:active {
	transform: scale(0.92);
	background: #f0f2ff;
}

.refresh-icon {
	font-size: 24rpx;
}

/* 输入区域 - 极简设计 */
.input-container {
	background: #ffffff;
	border-top: 1rpx solid #f0f0f0;
	padding: 0;
}

.error-message {
	padding: 16rpx 24rpx;
	background: #fff1f0;
	color: #ff4d4f;
	border-radius: 8rpx;
	font-size: 26rpx;
	margin: 20rpx;
	text-align: center;
}

.input-wrapper {
	display: flex;
	align-items: flex-end;
	gap: 12rpx;
	padding: 16rpx 24rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.chat-input {
	flex: 1;
	min-height: 72rpx;
	max-height: 200rpx;
	padding: 16rpx 20rpx;
	background: #f8f9fa;
	border-radius: 20rpx;
	font-size: 30rpx;
	line-height: 1.5;
	border: 2rpx solid transparent;
	transition: all 0.2s ease;
}

.chat-input:focus {
	background: #ffffff;
	border-color: #667eea;
	box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.send-button {
	width: 72rpx;
	height: 72rpx;
	padding: 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 20rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.25);
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.send-button:active {
	transform: scale(0.92);
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.send-button[disabled] {
	opacity: 0.4;
	transform: none;
	box-shadow: none;
}

.send-icon {
	font-size: 28rpx;
	font-weight: bold;
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
