const MESSAGE_TYPE_DISPLAY_LABELS = Object.freeze({
	position_handle: '持仓处理',
	pre_market_comment: '盘前点评',
	morning_comment: '早盘点评',
	morning_focus: '早盘关注',
	afternoon_comment: '午盘点评',
	afternoon_focus: '午盘关注',
	close_comment: '收盘点评',
	risk_warning: '风险提示',
	system: '系统通知',
	important: '重要通知',
	daily: '日常消息'
})

export function getMessageTypeDisplayLabel(type, customLabel = '') {
	if (typeof customLabel === 'string' && customLabel.trim()) {
		return customLabel.trim()
	}

	const normalizedType = typeof type === 'string' ? type.trim() : ''
	return MESSAGE_TYPE_DISPLAY_LABELS[normalizedType] || '消息'
}
