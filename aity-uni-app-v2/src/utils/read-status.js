/**
 * 消息已读/未读状态管理工具
 */

const STORAGE_KEY = 'read_messages'
const MAX_HISTORY = 500 // 最多保存500条已读记录

/**
 * 标记消息为已读
 * @param {Number} messageId 消息ID
 */
export function markAsRead(messageId) {
	if (!messageId) return

	try {
		let readMessages = getReadMessages()

		// 添加到已读列表
		if (!readMessages.includes(messageId)) {
			readMessages.unshift(messageId)

			// 限制数量
			if (readMessages.length > MAX_HISTORY) {
				readMessages = readMessages.slice(0, MAX_HISTORY)
			}

			uni.setStorageSync(STORAGE_KEY, readMessages)
		}
	} catch (error) {
		console.error('标记已读失败:', error)
	}
}

/**
 * 检查消息是否已读
 * @param {Number} messageId 消息ID
 * @returns {Boolean}
 */
export function isMessageRead(messageId) {
	if (!messageId) return false

	try {
		const readMessages = getReadMessages()
		return readMessages.includes(messageId)
	} catch (error) {
		console.error('检查已读状态失败:', error)
		return false
	}
}

/**
 * 获取所有已读消息ID列表
 * @returns {Array<Number>}
 */
export function getReadMessages() {
	try {
		return uni.getStorageSync(STORAGE_KEY) || []
	} catch (error) {
		console.error('获取已读列表失败:', error)
		return []
	}
}

/**
 * 清空已读记录
 */
export function clearReadHistory() {
	try {
		uni.removeStorageSync(STORAGE_KEY)
	} catch (error) {
		console.error('清空已读记录失败:', error)
	}
}

/**
 * 批量标记为已读
 * @param {Array<Number>} messageIds 消息ID列表
 */
export function markMultipleAsRead(messageIds) {
	if (!Array.isArray(messageIds) || messageIds.length === 0) return

	try {
		let readMessages = getReadMessages()

		messageIds.forEach(id => {
			if (!readMessages.includes(id)) {
				readMessages.unshift(id)
			}
		})

		// 限制数量
		if (readMessages.length > MAX_HISTORY) {
			readMessages = readMessages.slice(0, MAX_HISTORY)
		}

		uni.setStorageSync(STORAGE_KEY, readMessages)
	} catch (error) {
		console.error('批量标记已读失败:', error)
	}
}

/**
 * 获取未读消息数量
 * @param {Array<Number>} allMessageIds 所有消息ID列表
 * @returns {Number}
 */
export function getUnreadCount(allMessageIds) {
	if (!Array.isArray(allMessageIds)) return 0

	try {
		const readMessages = getReadMessages()
		const unreadMessages = allMessageIds.filter(id => !readMessages.includes(id))
		return unreadMessages.length
	} catch (error) {
		console.error('计算未读数量失败:', error)
		return 0
	}
}
