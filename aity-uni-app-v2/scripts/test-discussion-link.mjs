import assert from 'node:assert/strict'
import {
  findMessageById,
  getMessageTitleById,
  normalizeMessageId,
  selectMessageByPickerIndex
} from '../src/utils/discussion-link.mjs'
import {
  getMessageTypeDisplayLabel,
  getUserFacingOperationMessage
} from '../src/utils/message-labels.mjs'

const messages = [
  { id: '688318', title: '手动选择消息', type: '互动交流' },
  { messageId: 42, title: 'messageId 字段消息' },
  { message_id: '77', title: 'snake_case 字段消息' }
]

assert.equal(normalizeMessageId(messages[0]), 688318)
assert.equal(normalizeMessageId(messages[1]), 42)
assert.equal(normalizeMessageId(messages[2]), 77)
assert.equal(normalizeMessageId({ id: 'bad' }), null)

assert.deepEqual(selectMessageByPickerIndex(messages, '0'), messages[0])
assert.deepEqual(selectMessageByPickerIndex(messages, 1), messages[1])
assert.equal(selectMessageByPickerIndex(messages, '9'), null)
assert.equal(selectMessageByPickerIndex(messages, 'bad'), null)

assert.deepEqual(findMessageById(messages, '688318'), messages[0])
assert.deepEqual(findMessageById(messages, 42), messages[1])
assert.deepEqual(findMessageById(messages, '77'), messages[2])
assert.equal(findMessageById(messages, 999), null)

assert.equal(getMessageTitleById(messages, '688318'), '手动选择消息')
assert.equal(getMessageTitleById(messages, 42), 'messageId 字段消息')
assert.equal(getMessageTitleById(messages, 999), '')

assert.equal(getMessageTypeDisplayLabel('risk_warning'), '风险提示')
assert.equal(getMessageTypeDisplayLabel('position_handle'), '持仓处理')
assert.equal(getMessageTypeDisplayLabel('unknown_type'), '消息')
assert.equal(getMessageTypeDisplayLabel(null), '消息')

assert.equal(getUserFacingOperationMessage('Message pinned', '置顶失败'), '已置顶')
assert.equal(getUserFacingOperationMessage('Message unpinned', '取消置顶失败'), '已取消置顶')
assert.equal(getUserFacingOperationMessage('Success', '操作完成'), '操作成功')
assert.equal(getUserFacingOperationMessage('Unknown backend text', '操作失败'), '操作失败')
assert.equal(getUserFacingOperationMessage('', '操作失败'), '操作失败')

console.log('discussion-link helper tests passed')
