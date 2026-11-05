export const DISCUSSION_VIEWS_HIDDEN_KEY = 'admin_hide_discussion_views'

export function getDiscussionViewsHidden(storage = globalThis.uni) {
	try {
		return storage?.getStorageSync(DISCUSSION_VIEWS_HIDDEN_KEY) === true
	} catch (error) {
		return false
	}
}

export function setDiscussionViewsHidden(hidden, storage = globalThis.uni) {
	const value = Boolean(hidden)
	try {
		storage?.setStorageSync(DISCUSSION_VIEWS_HIDDEN_KEY, value)
	} catch (error) {
		return false
	}
	return true
}
