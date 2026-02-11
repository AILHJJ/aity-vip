/**
 * AI投顾API配置
 * 注意：此接口由通达信提供，我们仅作为API使用方
 */

// API配置
export const AI_ADVISOR_CONFIG = {
  // API地址
  API_URL: 'https://www.tdx.com.cn/wenda/api',

  // 认证token（临时方案，建议后续通过后端代理获取）
  // 注意：token需要定期更新，过期后需要重新登录获取
  AUTH_TOKEN: 'afbec96cadb94be4b419add834e11583_1_JX_2',

  // Agent类型
  AGENT_TYPE: 'wenda', // 问小达

  // 是否开启深度思考
  ENABLE_THINK: false,

  // 请求超时时间（毫秒）
  TIMEOUT: 60000,
}

// 获取深度思考模式状态
export function getThinkMode() {
  return uni.getStorageSync('ai_advisor_think_mode') || AI_ADVISOR_CONFIG.ENABLE_THINK
}

// 设置深度思考模式状态
export function setThinkMode(enabled) {
  uni.setStorageSync('ai_advisor_think_mode', enabled)
  AI_ADVISOR_CONFIG.ENABLE_THINK = enabled
  return enabled
}

/**
 * 构建完整的API端点URL
 */
export function buildApiEndpoint(path) {
  return `${AI_ADVISOR_CONFIG.API_URL}${path}`
}

/**
 * 获取认证头
 */
export function getAuthHeaders() {
  return {
    'Accept': 'text/event-stream',
    'Content-Type': 'application/json',
    'tdx-auth': AI_ADVISOR_CONFIG.AUTH_TOKEN
  }
}

/**
 * 构建请求体
 */
export function buildRequestBody(content, threadId = null) {
  // 获取当前的深度思考模式状态（而不是使用配置中的静态值）
  const currentThinkMode = getThinkMode()

  const body = {
    content: content,
    agent: AI_ADVISOR_CONFIG.AGENT_TYPE,
    think: currentThinkMode
  }

  // 如果有threadId，添加到请求体
  if (threadId) {
    body.threadId = threadId
  }

  return body
}

/**
 * 保存会话ID到本地存储
 */
export function saveThreadId(threadId) {
  uni.setStorageSync('ai_advisor_thread_id', threadId)
}

/**
 * 从本地存储获取会话ID
 */
export function getThreadId() {
  return uni.getStorageSync('ai_advisor_thread_id') || ''
}

/**
 * 保存对话历史到本地存储
 */
export function saveChatHistory(messages) {
  try {
    uni.setStorageSync('ai_advisor_chat_history', JSON.stringify(messages))
  } catch (error) {
    console.error('保存对话历史失败:', error)
  }
}

/**
 * 从本地存储获取对话历史
 */
export function getChatHistory() {
  try {
    const history = uni.getStorageSync('ai_advisor_chat_history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('获取对话历史失败:', error)
    return []
  }
}

/**
 * 清空对话历史
 */
export function clearChatHistory() {
  uni.removeStorageSync('ai_advisor_chat_history')
  uni.removeStorageSync('ai_advisor_thread_id')
}
