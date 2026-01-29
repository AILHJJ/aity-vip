// 时间格式化函数
export const formatTime = (time) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 计算时间差
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    // 格式化日期
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}

// 格式化日期
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 格式化时间
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 获取相对时间
export const getRelativeTime = (time) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 计算时间差
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(diff / 604800000)
  const months = Math.floor(diff / 2592000000)
  const years = Math.floor(diff / 31536000000)
  
  if (years > 0) {
    return `${years}年前`
  } else if (months > 0) {
    return `${months}个月前`
  } else if (weeks > 0) {
    return `${weeks}周前`
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 导出 formatRelativeTime 作为 getRelativeTime 的别名
export const formatRelativeTime = getRelativeTime

// 判断是否是今天
export const isToday = (time) => {
  if (!time) return false
  
  const date = new Date(time)
  const today = new Date()
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// 判断是否是昨天
export const isYesterday = (time) => {
  if (!time) return false
  
  const date = new Date(time)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
}

// 获取时间范围
export const getTimeRange = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}