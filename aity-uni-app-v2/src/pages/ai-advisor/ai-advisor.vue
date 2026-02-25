<template>
	<view class="ai-advisor-container">
		<!-- 极简顶部栏 -->
		<view class="header">
			<view class="header-left">
				<text class="header-title">图灵</text>
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
			:scroll-top="scrollTop"
			:scroll-with-animation="scrollWithAnimation"
			@click="handleScrollAreaClick"
		@touchstart="handleScrollAreaTouch"
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
							<!-- 推理过程 -->
							<view v-if="message.reasoning" class="reasoning-content">
								<view class="reasoning-title">💭 思考过程：</view>
								<text class="reasoning-text">{{ message.reasoning }}</text>
							</view>

							<!-- 工具调用提示 -->
							<view v-if="message.toolCalls && message.toolCalls.length > 0" class="tool-calls-info">
								<text class="tool-icon">🔧</text>
								<text class="tool-text">正在调用工具：{{ message.toolCalls[0].function?.name || '未知工具' }}</text>
							</view>

							<!-- 工具响应结果表格（优先显示） -->
							<view v-if="message.toolResult" class="tool-result-content">
								<view class="tool-result-header">
									<text class="tool-result-title">📊 工具返回结果</text>
								</view>
								<view class="financial-table-wrapper">
									<view v-html="renderToolResultTable(message.toolResult)" class="financial-table"></view>
								</view>
							</view>

							<!-- Markdown内容渲染 -->
							<view v-if="message.content" class="content-area">
								<!-- 如果是金融选股工具，尝试解析JSON表格 -->
								<view v-if="message.isTable && !message.toolResult" class="financial-content">
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
				<view class="action-btn new-chat-action" @click="handleNewSession">
					<text class="action-icon">⟳</text>
				</view>
				<textarea
					class="chat-input"
					v-model="inputText"
					placeholder="请输入金融相关问题..."
					:maxlength="500"
					:auto-height="true"
					:show-confirm-bar="false"
					:adjust-position="true"
					@confirm="handleSend"
					@keyboardheightchange="onKeyboardHeightChange"
					@focus="onInputFocus"
					@blur="onInputBlur"
				/>
				<button
					class="send-button"
					:disabled="!inputText.trim() || isLoading"
					@click="handleSend"
				>
					<text v-if="!isLoading" class="send-icon">→</text>
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
import { getChatHistory, saveChatHistory, saveThreadId, clearChatHistory, getThreadId } from '@/utils/ai-advisor-config'
import { MarkdownRenderer, FinancialTableParser } from '@/utils/markdown-renderer'
import { API_BASE_URL } from '@/utils/config'

// 数据
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const scrollIntoView = ref('')
const scrollTop = ref(0)
const scrollWithAnimation = ref(true)
const currentToolCalls = ref([])
const currentReasoning = ref('')
const isFinancialQuery = ref(false)

// 键盘高度管理
const keyboardHeight = ref(0)
const isKeyboardVisible = ref(false)

// 行情数据
const marketData = ref([])
let marketRefreshTimer = null

// 免责声明
const disclaimerAccepted = ref(false)
const showDisclaimerModal = ref(false)

// 新会话功能
function handleNewSession() {
	messages.value = []
	clearChatHistory()
	errorMessage.value = ''
	// 收起键盘
	uni.hideKeyboard()

	// 新会话：清空threadId，下次请求将传递空字符串，后台会创建新会话
	// 后台创建的新threadId会从metadata事件中返回，自动保存
	console.log('开启新会话：清空threadId')
}

// 加载行情数据
async function loadMarketData() {
	try {
		const res = await uni.request({
			url: API_BASE_URL + '/market/ticker',
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

	// 收起键盘
	uni.hideKeyboard()

	try {
		sendAIMessage(
			content,
			(data) => {
				const lastMessage = messages.value[messages.value.length - 1]

				if (data.type === 'content') {
					updateAIMessage(data.fullContent)
					// 流式输出时自动滚动到底部（不使用动画，避免卡顿）
					scrollToBottom(false)
				} else if (data.type === 'reasoning') {
					currentReasoning.value = data.fullReasoning
					if (lastMessage) {
						lastMessage.reasoning = data.fullReasoning
						scrollToBottom(false)
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
						scrollToBottom(false)
					}
				} else if (data.type === 'tool_result') {
					// 工具响应结果（原始JSON数据）
					console.log('工具响应结果:', data.tool_name, data.tool_result)

					if (lastMessage) {
						// 如果是金融选股工具，保存工具响应的原始数据
						if (data.tool_name === '金融选股') {
							lastMessage.toolResult = data.tool_result
							lastMessage.isTable = true
						}
					}
					scrollToBottom(false)
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

// 键盘高度变化处理
function onKeyboardHeightChange(e) {
	console.log('键盘高度变化:', e.detail.height)
	keyboardHeight.value = e.detail.height
	isKeyboardVisible.value = e.detail.height > 0
}

// 输入框获得焦点
function onInputFocus() {
	isKeyboardVisible.value = true
}

// 输入框失去焦点
function onInputBlur() {
	// 延迟设置，避免点击发送按钮时先触发blur
	setTimeout(() => {
		isKeyboardVisible.value = false
	}, 200)
}

// 点击滚动区域（关闭键盘）
function handleScrollAreaClick() {
	if (isKeyboardVisible.value) {
		uni.hideKeyboard()
		isKeyboardVisible.value = false
	}
}

// 触摸滚动区域（准备关闭键盘）
function handleScrollAreaTouch() {
	if (isKeyboardVisible.value) {
		// 可以在这里添加更多交互逻辑
	}
}

// 渲染工具结果表格
function renderToolResultTable(toolResult) {
	try {
		// toolResult是JSON字符串："[["市场","证券代码","证券名称",...],["","","",...],["1","600010","包钢股份",...]]"
		// ⭐ 实际数据结构：
		// 第0行：表头 ["市场","证券代码","证券名称","现价<br>2026.02.25","涨跌幅<br>2026.02.25",...]
		// 第1行：格式化标识 ["0|0|0","0|0|0","2|0|0","2|0|0","0|0|0",...]
		// 第2行起：实际数据 ["1","600010","包钢股份","2.93","10.15",...]

		const data = JSON.parse(toolResult)

		if (!Array.isArray(data) || data.length < 3) {
			return ''
		}

		// 提取各行数据
		const headers = data[0] || []      // 表头行
		const formatFlags = data[1] || []  // 格式化标识行
		const rows = data.slice(2)         // 实际数据行（第2行起）

		// 过滤掉最后一条"总记录数"行
		const dataRows = rows.filter(row =>
			row[0] !== '总记录数' && row[0] !== ''
		)

		// 生成HTML表格 - 添加横向滚动容器
		let tableHtml = '<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;"><table class="tool-result-table" style="min-width: 100%;">'
		tableHtml += '<thead><tr>'

		// 渲染表头
		headers.forEach(header => {
			// 处理表头中的<br>标签（如"现价<br>2026.02.25"）
			const cleanHeader = header ? header.replace(/<br>/g, '<br/>') : ''
			tableHtml += `<th style="white-space: nowrap; padding: 8px 12px;">${cleanHeader}</th>`
		})
		tableHtml += '</tr></thead><tbody>'

		// 渲染数据行
		dataRows.forEach((row, rowIndex) => {
			tableHtml += '<tr>'

			row.forEach((cell, cellIndex) => {
				const formatFlag = formatFlags[cellIndex] || ''

				// 应用格式化函数
				const formattedCell = formatCellValue(cell, formatFlag, headers[cellIndex], row)

				tableHtml += `<td style="white-space: nowrap; padding: 8px 12px;">${formattedCell}</td>`
			})

			tableHtml += '</tr>'
		})

		tableHtml += '</tbody></table></div>'

		return tableHtml
	} catch (error) {
		console.error('解析工具结果失败:', error)
		// 降级：返回原始文本
		return `<pre style="white-space: pre-wrap; word-break: break-all; font-size: 12px;">${toolResult}</pre>`
	}
}

// 格式化单元格值（参考项目的完整逻辑）
function formatCellValue(value, formatFlag, fieldName, rowData) {
	// 空值处理
	if (value === '' || value === null || value === undefined) {
		return '--'
	}

	// 解析格式化标识（如"2|0|0"）
	const flags = formatFlag ? formatFlag.split('|') : []

	// 第1位：颜色/格式类型
	const typeFlag = flags[0] || '0'
	// 第2位：子类型
	const subType = flags[1] || '0'
	// 第3位：特殊标识
	const specialFlag = flags[2] || '0'

	// 根据字段名判断涨跌幅
	const isChangeField = fieldName === 'chg' || fieldName === 'chg0#'

	// 获取原始数值
	let numValue = parseFloat(value)

	// === 涨跌幅字段处理 ===
	if (isChangeField) {
		// typeFlag == "1": 根据正负值判断颜色（>0涨，<0跌，==0平）
		// typeFlag == "2": 涨跌幅+反向判断（>0跌，<0涨，==0平）
		// typeFlag == "3": 特殊规则（>1涨，<=1跌）

		if (typeFlag === '1') {
			// 默认规则：正数涨（红），负数跌（绿）
			if (numValue > 0) {
				return `<span class="color-up">${numValue}%</span>`
			} else if (numValue < 0) {
				return `<span class="color-down">${Math.abs(numValue)}%</span>`
			} else {
				return `<span>${numValue}%</span>`  // 平盘
			}
		} else if (typeFlag === '2') {
			// 反向规则：正数跌（绿），负数涨（红）
			if (numValue > 0) {
				return `<span class="color-down">${numValue}%</span>`
			} else if (numValue < 0) {
				return `<span class="color-up">${Math.abs(numValue)}%</span>`
			} else {
				return `<span>${numValue}%</span>`
			}
		} else if (typeFlag === '3') {
			// 特殊规则：>1涨，<=1跌
			if (numValue > 1) {
				return `<span class="color-up">${numValue}%</span>`
			} else if (numValue <= -1) {
				return `<span class="color-down">${Math.abs(numValue)}%</span>`
			} else {
				return `<span>${numValue}%</span>`
			}
		}
	}

	// === 价格字段处理（现价） ===
	if (fieldName === 'now_price' || fieldName === 'now_price0#') {
		// typeFlag == "1": 普通文本（subType == "0"）
		// typeFlag == "2": 两位小数
		// typeFlag == "3": 三位小数

		if (typeFlag === '0' || (typeFlag === '1' && subType === '0')) {
			// 文本类型，不做格式化
			return value
		}

		// 小数位数控制
		const decimals = typeFlag === '2' ? 2 : (typeFlag === '3' ? 3 : 2)

		// 添加前缀符号（typeFlag第3位）
		const prefix = specialFlag === '1' ? '+' : ''

		return `${prefix}${numValue.toFixed(decimals)}`
	}

	// === 百分比字段处理（非涨跌幅） ===
	if (subType === '2') {
		// 百分比格式
		const sign = numValue > 0 ? '+' : ''
		return `${sign}${numValue.toFixed(2)}%`
	}

	// === 千分位处理（subType == "1"） ===
	if (subType === '1') {
		// 千分位格式化：1,234.56
		return formatThousands(numValue)
	}

	// === 万亿处理（需要判断数值大小） ===
	// 这里简化处理：>= 1亿显示单位
	if (Math.abs(numValue) >= 100000000) {
		return (numValue / 100000000).toFixed(2) + '亿'
	}

	// 默认：返回原值
	return value
}

// 千分位格式化函数
function formatThousands(num) {
	const str = num.toString()
	const parts = str.split('.')
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return parts.join('.')
}

// 滚动到底部
function scrollToBottom(animate = true) {
	scrollWithAnimation.value = animate
	nextTick(() => {
		// 使用 uni.createSelectorQuery 获取容器的实际高度
		const query = uni.createSelectorQuery()
		query.select('.chat-container').boundingClientRect()
		query.selectAll('.message-item').boundingClientRect()
		query.exec((res) => {
			if (res && res[0] && res[1]) {
				const containerRect = res[0]
				const messageRects = res[1]

				if (messageRects && messageRects.length > 0) {
					// 计算所有消息的总高度
					let totalHeight = 0
					messageRects.forEach(rect => {
						if (rect) {
							totalHeight += rect.height + 30 // 30rpx 是 margin-bottom
						}
					})

					// 转换为 px (rpx -> px, 假设屏幕宽度 750rpx)
					const containerHeight = containerRect.height || 0

					// 计算滚动位置：内容总高度 - 容器可见高度 + 额外缓冲
					const scrollPosition = totalHeight - containerHeight + 200

					// 使用 scrollTop 直接设置滚动位置
					scrollTop.value = Math.max(0, scrollPosition)
				}
			} else {
				// 降级方案：使用 scroll-into-view
				if (messages.value.length > 0) {
					scrollIntoView.value = 'message-' + (messages.value.length - 1)
				}
			}
		})
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

})

// 页面卸载
onUnmounted(() => {
	if (marketRefreshTimer) {
		clearInterval(marketRefreshTimer)
	}

	// 保存当前对话历史（已按用户隔离）
	saveChatHistory(messages.value)
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
	z-index: 100;
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

/* 工具调用提示 */
.tool-calls-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 16rpx;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
	border-radius: 8rpx;
	margin-bottom: 16rpx;
}

.tool-icon {
	font-size: 28rpx;
}

.tool-text {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
}

/* 工具结果区域 */
.tool-result-content {
	margin: 16rpx 0;
}

.tool-result-header {
	margin-bottom: 12rpx;
}

.tool-result-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #667eea;
}

.financial-table-wrapper {
	overflow-x: auto;
	border-radius: 8rpx;
	border: 1rpx solid #e0e0e0;
}

.tool-result-table {
	width: 100%;
	border-collapse: collapse;
	background: #ffffff;
}

.tool-result-table thead {
	background: #f5f5f5;
}

.tool-result-table th {
	padding: 16rpx 12rpx;
	text-align: left;
	font-weight: bold;
	font-size: 26rpx;
	color: #333333;
	border-bottom: 2rpx solid #e0e0e0;
	white-space: nowrap;
}

.tool-result-table td {
	padding: 12rpx 16rpx;
	text-align: left;
	font-size: 26rpx;
	color: #666666;
	border-bottom: 1rpx solid #f0f0f0;
	white-space: nowrap;
}

.tool-result-table tbody tr:last-child td {
	border-bottom: none;
}

.tool-result-table tbody tr:hover {
	background: #fafafa;
}

/* 涨跌幅颜色（参考项目规则：涨红跌绿） */
.tool-result-table .color-up {
	color: #fc4a4a;  /* 上涨：红色 */
}

.tool-result-table .color-down {
	color: #229d45;  /* 下跌：绿色 */
}

.tool-result-table td:last-child:not([class*="color"]) {
	/* 如果涨跌幅单元格没有颜色class，根据值判断 */
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
	padding: 8rpx 20rpx 8rpx 20rpx;
	background: #fff1f0;
	color: #ff4d4f;
	border-radius: 8rpx;
	font-size: 26rpx;
	margin: 0 20rpx;
	text-align: center;
}

.input-wrapper {
	display: flex;
	align-items: flex-end;
	gap: 12rpx;
	padding: 0 24rpx;
	padding-bottom: calc(8rpx + env(safe-area-inset-bottom));
}

/* 输入框左侧操作按钮 */
.action-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fa;
	border-radius: 20rpx;
	transition: all 0.2s ease;
	flex-shrink: 0;
	border: 2rpx solid transparent;
}

.action-btn:active {
	transform: scale(0.92);
	background: #f0f2ff;
	border-color: #667eea;
}

.action-icon {
	font-size: 36rpx;
	color: #666666;
}

.action-btn:active .action-icon {
	color: #667eea;
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
	font-size: 32rpx;
	font-weight: 300;
	letter-spacing: 2rpx;
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
