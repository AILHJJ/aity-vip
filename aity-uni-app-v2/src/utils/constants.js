/**
 * 常量定义
 */

// 消息类型
export const MESSAGE_TYPES = {
  POSITION_HANDLE: 'position_handle',  // 持仓处理（放在第一位）
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
  [MESSAGE_TYPES.POSITION_HANDLE]: '持仓处理',
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

// 消息标签（权限控制）
export const MESSAGE_TAGS = {
  SHORT_TERM: 'short_term',
  MID_TERM: 'mid_term',
  ALL_USERS: 'all_users'
}

// 消息标签标签映射
export const MESSAGE_TAG_LABELS = {
  [MESSAGE_TAGS.SHORT_TERM]: '短线策略',
  [MESSAGE_TAGS.MID_TERM]: '中线策略',
  [MESSAGE_TAGS.ALL_USERS]: '全部用户'
}

// 用户角色
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VIP_MID: 'vip_mid',
  VIP_SHORT: 'vip_short',
  TRIAL: 'trial'
}

// 用户角色标签映射
export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: '超级管理员',
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.VIP_MID]: 'VIP用户（中线）',
  [USER_ROLES.VIP_SHORT]: 'VIP用户（短线）',
  [USER_ROLES.TRIAL]: '体验用户'
}

// 讨论状态
export const DISCUSSION_STATUS = {
  PENDING: 'pending',
  REPLIED: 'replied'
}

// 讨论状态标签映射
export const DISCUSSION_STATUS_LABELS = {
  [DISCUSSION_STATUS.PENDING]: '待回复',
  [DISCUSSION_STATUS.REPLIED]: '已回复'
}

// 讨论可见性
export const DISCUSSION_VISIBILITY = {
  PRIVATE: 'private',
  PUBLIC: 'public'
}

// 讨论可见性标签映射
export const DISCUSSION_VISIBILITY_LABELS = {
  [DISCUSSION_VISIBILITY.PRIVATE]: '私密',
  [DISCUSSION_VISIBILITY.PUBLIC]: '公开'
}

// 消息状态
export const MESSAGE_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published'
}

// 消息状态标签映射
export const MESSAGE_STATUS_LABELS = {
  [MESSAGE_STATUS.DRAFT]: '草稿',
  [MESSAGE_STATUS.SCHEDULED]: '定时发布',
  [MESSAGE_STATUS.PUBLISHED]: '已发布'
}
