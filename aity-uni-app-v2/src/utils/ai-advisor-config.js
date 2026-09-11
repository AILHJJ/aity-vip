/**
 * Agent 对话本地状态。
 * 服务地址、鉴权和默认 Agent 均由后端统一处理，前端只保存当前用户的会话状态。
 */

/**
 * 获取当前用户的存储Key
 * @param {String} key - 基础key名称
 * @returns {String} - 用户专属的key（格式：ai_advisor_{userId}_{key}）
 */
export function getUserStorageKey(key) {
  try {
    // 尝试从 uni storage 获取用户信息（最可靠的方式）
    const userInfo = uni.getStorageSync('userInfo') || uni.getStorageSync('user')
    let userId = 'anonymous'
    
    if (userInfo) {
      const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      userId = parsed.userId || parsed.id || parsed.uid || 'anonymous'
    }
    
    // 如果 uni storage 没有，尝试 pinia store
    if (userId === 'anonymous') {
      try {
        // 动态导入 pinia store（小程序安全方式）
        const stores = require('../store/user.js')
        if (stores && stores.useUserStore) {
          const userStore = stores.useUserStore()
          userId = userStore.userId || 'anonymous'
        }
      } catch (e) {
        // 小程序中 require 不支持路径别名，使用降级方案
      }
    }

    // 返回用户专属的key
    return `ai_advisor_${userId}_${key}`
  } catch (error) {
    console.error('获取用户存储Key失败:', error)
    // 降级方案：使用固定key（所有用户共享，仅用于错误恢复）
    return `ai_advisor_${key}`
  }
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
