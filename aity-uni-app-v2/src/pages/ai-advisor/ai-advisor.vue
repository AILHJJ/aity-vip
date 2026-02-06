<template>
	<view class="ai-advisor-container">
		<!-- 顶部标题栏 -->
		<view class="header">
			<text class="header-title">AI投顾助手</text>
			<text class="header-subtitle">专业智能问答</text>
			<!-- 管理员开关：显示工具调用 -->
			<view v-if="isAdmin" class="admin-toggle" @click="toggleToolVisibility">
				<text class="toggle-text">{{ showTools ? '隐藏工具调用' : '显示工具调用' }}</text>
				<view class="toggle-switch" :class="{ active: showTools }">
					<view class="toggle-dot"></view>
				</view>
			</view>
		</view>

		<!-- 对话消息区域 -->
		<scroll-view
			class="chat-container"
			scroll-y
			:scroll-into-view="scrollIntoView"
			:scroll-with-animation="true"
		>
			<!-- 欢迎消息 -->
			<view v-if="messages.length === 0" class="welcome-message">
				<view class="welcome-icon">🤖</view>
				<view class="welcome-text">您好！我是AI投顾助手</view>
				<view class="welcome-hint">有什么可以帮您的吗？</view>
				<view class="quick-questions">
					<view
						class="quick-question"
						v-for="(question, index) in quickQuestions"
						:key="index"
						@click="sendQuickQuestion(question)"
					>
						{{ question }}
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
					{{ isLoading ? '发送中' : '发送' }}
				</button>
			</view>
			<!-- 清空历史按钮 -->
			<view v-if="messages.length > 0" class="clear-history" @click="handleClearHistory">
				<text class="clear-text">清空对话</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { sendAIMessage } from '@/api/ai-advisor'
import { getChatHistory, saveChatHistory, saveThreadId, clearChatHistory } from '@/utils/ai-advisor-config'

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

// 管理员设置
const showTools = ref(false) // 是否显示工具调用
const isAdmin = computed(() => {
	// 从用户信息中判断是否是管理员
	const userInfo = uni.getStorageSync('userInfo')
	return userInfo && (userInfo.role === 'super_admin' || userInfo.role === 'admin')
})

// 快捷问题
const quickQuestions = ref([
	'今天股市行情怎么样？',
	'有什么热门板块？',
	'推荐几只优质股票'
])

// 切换工具显示
function toggleToolVisibility() {
	showTools.value = !showTools.value
	uni.setStorageSync('ai_show_tools', showTools.value)
}

// 渲染Markdown（完整实现，支持表格、代码块等）
function renderMarkdown(content) {
	if (!content) return ''

	// 首先过滤所有 @@替换串@@
	content = content.replace(/@@.+?@@/g, '')

	// 转义HTML（但保留我们需要的标签）
	let html = content
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

	// 处理代码块 ```code```
	html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
		return `<pre><code class="${lang}">${code.trim()}</code></pre>`
	})

	// 处理行内代码 `code`
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

	// 处理粗体 **text**
	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

	// 处理斜体 *text*
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

	// 处理表格 |列1|列2|
	// 先处理分隔行 |---|---|
	const lines = html.split('\n')
	let inTable = false
	let tableRows = []
	const processedLines = []

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()

		// 检测表格行（以|开头和结尾）
		if (line.startsWith('|') && line.endsWith('|')) {
			// 移除首尾的|
			const cells = line.substring(1, line.length - 1).split('|').map(cell => cell.trim())

			// 检查是否是分隔行（全部是---）
			const isSeparator = cells.every(cell => /^-+$/.test(cell))

			if (!isSeparator) {
				if (!inTable) {
					inTable = true
					tableRows = []
				}
				// 判断是否是表头（第一行）
				const isHeader = tableRows.length === 0
				const tag = isHeader ? 'th' : 'td'
				const rowHtml = cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')
				tableRows.push(`<tr>${rowHtml}</tr>`)
			}
			continue
		}

		// 如果在表格中，遇到非表格行，先输出表格
		if (inTable) {
			if (tableRows.length > 0) {
				processedLines.push(`<table>${tableRows.join('')}</table>`)
			}
			inTable = false
			tableRows = []
		}

		processedLines.push(line)
	}

	// 处理最后的表格
	if (inTable && tableRows.length > 0) {
		processedLines.push(`<table>${tableRows.join('')}</table>`)
	}

	html = processedLines.join('\n')

	// 处理无序列表 - item
	html = html.replace(/^[\s]*-[\s]+(.+)$/gm, '<li>$1</li>')
	html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

	// 处理有序列表 1. item
	html = html.replace(/^[\s]*\d+[\s.]+(.+)$/gm, '<li>$1</li>')

	// 处理换行（但不在pre标签中的）
	html = html.replace(/\n/g, '<br>')

	// 修复pre和code标签中的<br>
	html = html.replace(/<pre>(.*?)<\/pre>/gs, (match, content) => {
		return `<pre>${content.replace(/<br>/g, '\n')}</pre>`
	})

	return html
}

// 解析金融选股工具返回的JSON表格数据
function parseFinancialTable(content) {
	try {
		// 尝试解析JSON格式的表格数据
		const data = JSON.parse(content)

		if (!Array.isArray(data) || data.length === 0) {
			return null
		}

		// 根据参考项目的逻辑解析
		// 数据格式：第一行是表头，最后一行第一个元素是总数
		let headers = []
		let rows = []
		let total = 0

		// 找到最后一个元素（总数）
		if (data.length > 1) {
			const lastRow = data[data.length - 1]
			if (Array.isArray(lastRow) && lastRow.length >= 2) {
				total = lastRow[1] // 第二个元素是总数
			}
		}

		// 解析表头和数据行
		const endIndex = data.length > 7 ? 7 : data.length - 1
		const tableData = data.slice(0, endIndex)

		tableData.forEach((row, index) => {
			if (index === 0) {
				// 第一行是表头
				headers = row.map(cell => {
					// 处理特殊列名
					if (typeof cell === 'string') {
						// 移除HTML标签和日期
						return cell.replace(/<br>.*$/, '').trim()
					}
					return String(cell).trim()
				})
			} else {
				// 数据行
				rows.push(row)
			}
		})

		return { headers, rows, total }
	} catch (e) {
		// 不是JSON格式，返回null
		return null
	}
}

// 渲染金融查询表格
function renderFinancialTable(tableData) {
	if (!tableData || !tableData.headers || !tableData.rows) {
		return ''
	}

	const { headers, rows, total } = tableData

	// 构建表格HTML
	let html = '<div class="financial-table-container">'

	// 总数提示
	if (total > 0) {
		html += `<div class="table-info">共找到 ${total} 条结果，显示前 ${rows.length} 条</div>`
	}

	html += '<table class="financial-table">'

	// 表头
	html += '<thead><tr>'
	headers.forEach(header => {
		html += `<th>${header}</th>`
	})
	html += '</tr></thead>'

	// 数据行
	html += '<tbody>'
	rows.forEach(row => {
		html += '<tr>'
		row.forEach(cell => {
			html += `<td>${cell}</td>`
		})
		html += '</tr>'
	})
	html += '</tbody>'

	html += '</table></div>'

	return html
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
})
</script>

<style lang="scss" scoped>
.ai-advisor-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f5f5f5;
}

/* 顶部标题栏 */
.header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
	position: relative;
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

/* 管理员开关 */
.admin-toggle {
	position: absolute;
	top: 30rpx;
	right: 30rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.toggle-text {
	font-size: 24rpx;
	color: #ffffff;
}

.toggle-switch {
	width: 80rpx;
	height: 40rpx;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 20rpx;
	position: relative;
	transition: all 0.3s;
}

.toggle-switch.active {
	background: rgba(255, 255, 255, 0.6);
}

.toggle-dot {
	width: 32rpx;
	height: 32rpx;
	background: #ffffff;
	border-radius: 50%;
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	transition: all 0.3s;
}

.toggle-switch.active .toggle-dot {
	left: 44rpx;
}

/* 对话区域 */
.chat-container {
	flex: 1;
	padding: 20rpx;
	overflow-y: auto;
}

/* 欢迎消息 */
.welcome-message {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
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

.welcome-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 16rpx;
}

.welcome-hint {
	font-size: 28rpx;
	color: #999999;
	margin-bottom: 60rpx;
}

.quick-questions {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
	max-width: 600rpx;
}

.quick-question {
	padding: 24rpx 32rpx;
	background: #ffffff;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #667eea;
	text-align: center;
	border: 2rpx solid #e0e0e0;
	transition: all 0.3s;

	&:active {
		background: #f0f2ff;
		border-color: #667eea;
		transform: scale(0.98);
	}
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

/* Markdown内容 */
.content-area {
	word-break: break-word;
}

.markdown-content ::v-deep table {
	width: 100%;
	border-collapse: collapse;
	margin: 16rpx 0;
}

.markdown-content ::v-deep td {
	border: 1rpx solid #e0e0e0;
	padding: 12rpx;
	text-align: left;
}

.markdown-content ::v-deep th {
	border: 1rpx solid #e0e0e0;
	padding: 12rpx;
	text-align: left;
	background: #f5f5f5;
	font-weight: bold;
}

.markdown-content ::v-deep pre {
	background: #f5f5f5;
	padding: 16rpx;
	border-radius: 8rpx;
	overflow-x: auto;
	margin: 12rpx 0;
}

.markdown-content ::v-deep code {
	background: #f5f5f5;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	font-family: monospace;
}

.markdown-content ::v-deep strong {
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

/* 输入区域 */
.input-container {
	background: #ffffff;
	border-top: 1rpx solid #e0e0e0;
	padding: 20rpx;
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
	min-width: 120rpx;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 12rpx;
	border: none;
	text-align: center;
}

.send-button[disabled] {
	opacity: 0.5;
}

.clear-history {
	text-align: center;
	margin-top: 16rpx;
}

.clear-text {
	font-size: 26rpx;
	color: #999999;
	text-decoration: underline;
}
</style>
