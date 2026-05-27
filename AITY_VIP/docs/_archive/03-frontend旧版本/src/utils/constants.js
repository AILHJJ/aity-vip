// 消息类型定义
export const MESSAGE_TYPES = {
  PRE_MARKET_COMMENT: 'pre_market_comment',
  MORNING_COMMENT: 'morning_comment',
  MORNING_FOCUS: 'morning_focus',
  AFTERNOON_COMMENT: 'afternoon_comment',
  AFTERNOON_FOCUS: 'afternoon_focus',
  CLOSE_COMMENT: 'close_comment',
  RISK_WARNING: 'risk_warning',
  SYSTEM: 'system',
  IMPORTANT: 'important',
  DAILY: 'daily'
}

// 消息类型标签映射
export const MESSAGE_TYPE_LABELS = {
  [MESSAGE_TYPES.PRE_MARKET_COMMENT]: '盘前点评',
  [MESSAGE_TYPES.MORNING_COMMENT]: '早盘点评',
  [MESSAGE_TYPES.MORNING_FOCUS]: '早盘关注',
  [MESSAGE_TYPES.AFTERNOON_COMMENT]: '尾盘点评',
  [MESSAGE_TYPES.AFTERNOON_FOCUS]: '尾盘关注',
  [MESSAGE_TYPES.CLOSE_COMMENT]: '收盘点评',
  [MESSAGE_TYPES.RISK_WARNING]: '风险提示',
  [MESSAGE_TYPES.SYSTEM]: '系统消息',
  [MESSAGE_TYPES.IMPORTANT]: '重要消息',
  [MESSAGE_TYPES.DAILY]: '日常消息'
}

// 消息标签定义（用于权限控制）
export const MESSAGE_TAGS = {
  SHORT_TERM: 'short_term',
  MID_TERM: 'mid_term',
  ALL_USERS: 'all_users'
}

// 消息标签映射
export const MESSAGE_TAG_LABELS = {
  [MESSAGE_TAGS.SHORT_TERM]: '短线策略',
  [MESSAGE_TAGS.MID_TERM]: '中线策略',
  [MESSAGE_TAGS.ALL_USERS]: '全部用户'
}

// 讨论状态定义
export const DISCUSSION_STATUS = {
  PENDING: 'pending',
  REPLIED: 'replied'
}

// 讨论状态标签映射
export const DISCUSSION_STATUS_LABELS = {
  [DISCUSSION_STATUS.PENDING]: '待回复',
  [DISCUSSION_STATUS.REPLIED]: '已回复'
}

// 讨论可见性定义
export const DISCUSSION_VISIBILITY = {
  PRIVATE: 'private',
  PUBLIC: 'public'
}

// 讨论可见性标签映射
export const DISCUSSION_VISIBILITY_LABELS = {
  [DISCUSSION_VISIBILITY.PRIVATE]: '私密',
  [DISCUSSION_VISIBILITY.PUBLIC]: '公开'
}

// 获取消息类型标签
export const getMessageTypeLabel = (type) => {
  return MESSAGE_TYPE_LABELS[type] || type
}

// 获取消息标签
export const getMessageTagLabel = (tag) => {
  return MESSAGE_TAG_LABELS[tag] || tag
}

// 获取讨论状态标签
export const getDiscussionStatusLabel = (status) => {
  return DISCUSSION_STATUS_LABELS[status] || status
}

// 获取讨论可见性标签
export const getDiscussionVisibilityLabel = (visibility) => {
  return DISCUSSION_VISIBILITY_LABELS[visibility] || visibility
}

// 获取所有消息类型选项
export const getMessageTypeOptions = () => {
  return Object.entries(MESSAGE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }))
}

// 获取所有消息标签选项
export const getMessageTagOptions = () => {
  return Object.entries(MESSAGE_TAG_LABELS).map(([value, label]) => ({
    value,
    label
  }))
}

// 获取所有讨论状态选项
export const getDiscussionStatusOptions = () => {
  return Object.entries(DISCUSSION_STATUS_LABELS).map(([value, label]) => ({
    value,
    label
  }))
}

// 获取所有讨论可见性选项
export const getDiscussionVisibilityOptions = () => {
  return Object.entries(DISCUSSION_VISIBILITY_LABELS).map(([value, label]) => ({
    value,
    label
  }))
}