/**
 * 时间格式化工具
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化时间
 * @param {String|Date} time 时间
 * @param {String} format 格式
 * @returns {String}
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return ''
  return dayjs(time).format(format)
}

/**
 * 格式化为相对时间
 * @param {String|Date} time 时间
 * @returns {String}
 */
export function formatRelativeTime(time) {
  if (!time) return ''
  return dayjs(time).fromNow()
}

/**
 * 格式化日期（不含时间）
 * @param {String|Date} time 时间
 * @returns {String}
 */
export function formatDate(time) {
  return formatTime(time, 'YYYY-MM-DD')
}

/**
 * 格式化时间（不含日期）
 * @param {String|Date} time 时间
 * @returns {String}
 */
export function formatTimeOnly(time) {
  return formatTime(time, 'HH:mm:ss')
}

/**
 * 格式化为友好的时间显示
 * 今天显示时间，昨天显示"昨天"，更早显示日期
 * @param {String|Date} time 时间
 * @returns {String}
 */
export function formatFriendlyTime(time) {
  if (!time) return ''

  const now = dayjs()
  const target = dayjs(time)

  // 今天
  if (target.isSame(now, 'day')) {
    return target.format('HH:mm')
  }

  // 昨天
  if (target.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天 ' + target.format('HH:mm')
  }

  // 今年
  if (target.isSame(now, 'year')) {
    return target.format('MM-DD HH:mm')
  }

  // 更早
  return target.format('YYYY-MM-DD')
}

export default {
  formatTime,
  formatRelativeTime,
  formatDate,
  formatTimeOnly,
  formatFriendlyTime
}
