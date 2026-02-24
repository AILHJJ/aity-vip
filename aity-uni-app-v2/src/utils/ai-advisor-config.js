/**
 * AI投顾API配置
 * 通过后端代理服务访问通达信问小达API
 */

// 导入用户store（用于生成用户专属的存储key）
import { useUserStore } from '@/store/user'

// API配置 - 使用后端代理
export const AI_ADVISOR_CONFIG = {
  // 后端代理API地址
  API_URL: '/api/ai-advisor',  // 使用相对路径，由前端代理转发到后端

  // 生产环境地址（如果需要直接访问后端）
  PROD_API_URL: 'https://aity88.online:8443/api/ai-advisor',

  // Agent类型
  AGENT_TYPE: 'wenda', // 问小达

  // 是否开启深度思考
  ENABLE_THINK: false,

  // 请求超时时间（毫秒）
  TIMEOUT: 120000,
}

/**
 * 获取API基础URL
 */
export function getApiBaseUrl() {
  // #ifdef H5
  // H5环境使用相对路径
  return AI_ADVISOR_CONFIG.API_URL
  // #endif

  // #ifndef H5
  // 小程序等其他环境使用完整URL
  return AI_ADVISOR_CONFIG.PROD_API_URL
  // #endif
}

/**
 * 获取当前用户的存储Key
 * @param {String} key - 基础key名称
 * @returns {String} - 用户专属的key（格式：ai_advisor_{userId}_{key}）
 */
export function getUserStorageKey(key) {
  try {
    // 获取用户store
    const userStore = useUserStore()
    const userId = userStore.userId || 'anonymous'

    // 返回用户专属的key
    return `ai_advisor_${userId}_${key}`
  } catch (error) {
    console.error('获取用户存储Key失败:', error)
    // 降级方案：使用固定key（所有用户共享，仅用于错误恢复）
    return `ai_advisor_${key}`
  }
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
 * 保存会话ID到本地存储（按用户隔离）
 */
export function saveThreadId(threadId) {
  const key = getUserStorageKey('thread_id')
  uni.setStorageSync(key, threadId)
}

/**
 * 从本地存储获取会话ID（按用户隔离）
 */
export function getThreadId() {
  const key = getUserStorageKey('thread_id')
  return uni.getStorageSync(key) || ''
}

/**
 * 保存对话历史到本地存储（按用户隔离）
 */
export function saveChatHistory(messages) {
  try {
    const key = getUserStorageKey('chat_history')
    uni.setStorageSync(key, JSON.stringify(messages))
  } catch (error) {
    console.error('保存对话历史失败:', error)
  }
}

/**
 * 从本地存储获取对话历史（按用户隔离）
 */
export function getChatHistory() {
  try {
    const key = getUserStorageKey('chat_history')
    const history = uni.getStorageSync(key)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('获取对话历史失败:', error)
    return []
  }
}

/**
 * 清空当前用户的对话历史
 */
export function clearChatHistory() {
  const historyKey = getUserStorageKey('chat_history')
  const threadKey = getUserStorageKey('thread_id')
  uni.removeStorageSync(historyKey)
  uni.removeStorageSync(threadKey)
}
