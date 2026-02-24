/**
 * 数据格式化工具
 * 提供金额、百分比、时间等格式化函数
 */

/**
 * 格式化金额
 * 自动转换为亿、万等单位
 * @param {Number} amount 金额数值
 * @param {Number} decimals 保留小数位数，默认2
 * @returns {String} 格式化后的金额字符串
 *
 * @example
 * formatAmount(1234567890.50)  // '12.35亿'
 * formatAmount(12345678.90)     // '123.46万'
 * formatAmount(1234.56)         // '1234.56'
 */
export function formatAmount(amount, decimals = 2) {
  if (amount === null || amount === undefined) {
    return '--'
  }

  const absAmount = Math.abs(amount)

  if (absAmount >= 100000000) {
    return (amount / 100000000).toFixed(decimals) + '亿'
  } else if (absAmount >= 10000) {
    return (amount / 10000).toFixed(decimals) + '万'
  }

  return amount.toFixed(decimals)
}

/**
 * 格式化百分比
 * @param {Number} value 小数形式的百分比（如0.1234）
 * @param {Number} decimals 保留小数位数，默认2
 * @param {Boolean} withSign 是否带符号，默认true
 * @returns {String} 格式化后的百分比字符串
 *
 * @example
 * formatPercent(0.1234)     // '+12.34%'
 * formatPercent(-0.0567)    // '-5.67%'
 * formatPercent(0.1234, 1)  // '+12.3%'
 */
export function formatPercent(value, decimals = 2, withSign = true) {
  if (value === null || value === undefined) {
    return '--'
  }

  const percent = (value * 100).toFixed(decimals)
  return withSign ? (value >= 0 ? '+' + percent : percent) : percent
}

/**
 * 格式化价格
 * @param {Number} price 价格数值
 * @param {Number} decimals 保留小数位数，默认2
 * @returns {String} 格式化后的价格字符串
 *
 * @example
 * formatPrice(12.3456)  // '12.35'
 * formatPrice(12.3)     // '12.30'
 */
export function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined) {
    return '--'
  }

  return price.toFixed(decimals)
}

/**
 * 格式化时间
 * @param {String|Date} timestamp 时间戳或日期对象
 * @param {String} format 时间格式，默认'HH:mm'
 * @returns {String} 格式化后的时间字符串
 *
 * @example
 * formatTime('2026-02-11 09:30:00')              // '09:30'
 * formatTime('2026-02-11 09:30:00', 'YYYY-MM-DD') // '2026-02-11'
 * formatTime(Date.now())                         // '15:30'
 */
export function formatTime(timestamp, format = 'HH:mm') {
  if (!timestamp) {
    return '--'
  }

  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  if (format === 'HH:mm:ss') {
    return `${hours}:${minutes}:${seconds}`
  } else if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  } else if (format === 'YYYY-MM-DD HH:mm') {
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  return `${hours}:${minutes}`
}

/**
 * 格式化日期（友好的相对时间）
 * @param {String|Date} timestamp 时间戳或日期对象
 * @returns {String} 格式化后的友好时间字符串
 *
 * @example
 * formatFriendlyTime(Date.now() - 1000 * 60)      // '1分钟前'
 * formatFriendlyTime(Date.now() - 1000 * 60 * 60) // '1小时前'
 * formatFriendlyTime('2026-02-10')                // '昨天'
 */
export function formatFriendlyTime(timestamp) {
  if (!timestamp) {
    return '--'
  }

  const now = Date.now()
  const date = new Date(timestamp).getTime()
  const diff = now - date

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 大于7天，显示具体日期
  return formatTime(timestamp, 'YYYY-MM-DD')
}

/**
 * 格式化成交量/额
 * @param {Number} value 数值
 * @param {String} type 类型，'volume'表示成交量（手），'amount'表示成交额（元）
 * @returns {String} 格式化后的字符串
 *
 * @example
 * formatVolume(123456789)     // '12.35万手'
 * formatVolume(12345678900)   // '1234.57万手'
 * formatAmount(1234567890)    // '1.23亿'
 */
export function formatVolume(value, type = 'volume') {
  if (value === null || value === undefined) {
    return '--'
  }

  if (type === 'volume') {
    // 成交量（手）
    if (value >= 10000) {
      return (value / 10000).toFixed(2) + '万手'
    }
    return value + '手'
  } else if (type === 'amount') {
    // 成交额（元）
    return formatAmount(value)
  }

  return value.toString()
}

/**
 * 格式化股票代码（添加后缀）
 * @param {String} code 股票代码
 * @returns {String} 格式化后的股票代码
 *
 * @example
 * formatStockCode('000001')  // '000001.SZ'
 * formatStockCode('600000')  // '600000.SH'
 * formatStockCode('300001')  // '300001.SZ'
 * formatStockCode('688001')  // '688001.SH'
 */
export function formatStockCode(code) {
  if (!code) {
    return '--'
  }

  // 已经有后缀
  if (code.includes('.')) {
    return code
  }

  // 6开头是沪市，0/3开头是深市
  if (code.startsWith('6') || code.startsWith('5')) {
    return code + '.SH'
  } else if (code.startsWith('0') || code.startsWith('3')) {
    return code + '.SZ'
  }

  return code
}

/**
 * 格式化涨跌停状态
 * @param {Number} status 状态码
 * @returns {String} 状态文本
 *
 * @example
 * formatLimitStatus(1)   // '涨停'
 * formatLimitStatus(-1)  // '跌停'
 * formatLimitStatus(0)   // '正常'
 */
export function formatLimitStatus(status) {
  const statusMap = {
    1: '涨停',
    '-1': '跌停',
    0: '正常'
  }

  return statusMap[status] || '--'
}

/**
 * 判断涨跌颜色
 * @param {Number} value 数值
 * @returns {String} 颜色类型 'up' | 'down' | 'neutral'
 *
 * @example
 * getColorType(1.23)     // 'up'
 * getColorType(-1.23)    // 'down'
 * getColorType(0)        // 'neutral'
 */
export function getColorType(value) {
  if (value > 0) {
    return 'up'
  } else if (value < 0) {
    return 'down'
  }
  return 'neutral'
}

/**
 * 格式化数字（千分位）
 * @param {Number} num 数字
 * @returns {String} 格式化后的字符串
 *
 * @example
 * formatNumber(1234567)  // '1,234,567'
 */
export function formatNumber(num) {
  if (num === null || num === undefined) {
    return '--'
  }

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 截断文本
 * @param {String} text 原文本
 * @param {Number} maxLength 最大长度
 * @param {String} suffix 后缀，默认'...'
 * @returns {String} 截断后的文本
 *
 * @example
 * truncateText('这是一段很长的文本', 5)  // '这是一段很...'
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + suffix
}

/**
 * 获取颜色类名
 * @param {Number} value 数值
 * @returns {String} CSS类名
 *
 * @example
 * getColorClass(1.23)   // 'text-up'
 * getColorClass(-1.23)  // 'text-down'
 * getColorClass(0)      // 'text-neutral'
 */
export function getColorClass(value) {
  const type = getColorType(value)
  return `text-${type}`
}

export default {
  formatAmount,
  formatPercent,
  formatPrice,
  formatTime,
  formatFriendlyTime,
  formatVolume,
  formatStockCode,
  formatLimitStatus,
  getColorType,
  getColorClass,
  formatNumber,
  truncateText
}
