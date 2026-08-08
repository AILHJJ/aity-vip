export function normalizeMessageId(messageOrId) {
	if (messageOrId === null || messageOrId === undefined) return null

	const rawId = typeof messageOrId === 'object'
		? messageOrId.id ?? messageOrId.messageId ?? messageOrId.message_id
		: messageOrId
	const id = Number(rawId)

	return Number.isInteger(id) && id > 0 ? id : null
}

export function selectMessageByPickerIndex(messages, index) {
	const normalizedIndex = Number(index)
	if (!Array.isArray(messages) || !Number.isInteger(normalizedIndex)) return null

	return messages[normalizedIndex] || null
}

export function findMessageById(messages, id) {
	const normalizedId = normalizeMessageId(id)
	if (!Array.isArray(messages) || !normalizedId) return null

	return messages.find(message => normalizeMessageId(message) === normalizedId) || null
}

export function getMessageTitleById(messages, id) {
	return findMessageById(messages, id)?.title || ''
}
