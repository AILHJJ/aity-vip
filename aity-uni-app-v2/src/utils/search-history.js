/**
 * 搜索历史管理工具
 */

const MAX_HISTORY = 10
const STORAGE_KEY = 'search_history'

/**
 * 添加搜索历史
 * @param {String} keyword - 搜索关键词
 */
export function addSearchHistory(keyword) {
	if (!keyword || !keyword.trim()) {
		return
	}

	let history = getSearchHistory()

	// 去重并添加到开头
	history = history.filter(item => item !== keyword.trim())
	history.unshift(keyword.trim())

	// 限制数量
	if (history.length > MAX_HISTORY) {
		history = history.slice(0, MAX_HISTORY)
	}

	uni.setStorageSync(STORAGE_KEY, history)
}

/**
 * 获取搜索历史
 * @returns {Array} 搜索历史数组
 */
export function getSearchHistory() {
	return uni.getStorageSync(STORAGE_KEY) || []
}

/**
 * 清除搜索历史
 */
export function clearSearchHistory() {
	uni.removeStorageSync(STORAGE_KEY)
}

/**
 * 删除单条历史记录
 * @param {String} keyword - 要删除的关键词
 */
export function removeSearchHistory(keyword) {
	let history = getSearchHistory()
	history = history.filter(item => item !== keyword)
	uni.setStorageSync(STORAGE_KEY, history)
}
