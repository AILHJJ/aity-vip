/**
 * Dify工作流 API
 * 提供AI驱动的个股资讯查询和早报生成功能
 */
import { post } from '../utils/request'

// Dify工作流基础配置
const DIFY_CONFIG = {
  baseURL: 'http://111.48.74.244:8888',
  tokens: {
    stockNews: 'app-3yde9NCq0vBW6apenu2jR29H',  // 个股资讯查询
    dailyReport: 'app-nu968mbvMTrnAxFe6'         // AI资讯早报
  },
  user: 'aiznt-8888'
}

/**
 * 查询个股资讯
 * @param {Object} options 查询参数
 * @param {String} options.stockCode 股票代码（带市场后缀，如600519.SH）
 * @param {String} options.startDate 起始日期，格式YYYY-MM-DD
 * @param {String} options.endDate 结束日期，格式YYYY-MM-DD
 * @param {Number} options.totalNews 资讯条数，默认100
 * @param {String} options.qsid 券商ID，默认999
 * @returns {Promise}
 *
 * @example
 * // 查询贵州茅台最近24小时资讯
 * queryStockNews({
 *   stockCode: '600519.SH',
 *   startDate: '2026-02-10',
 *   endDate: '2026-02-11',
 *   totalNews: 50
 * }).then(data => {
 *   console.log('AI摘要:', data.result)
 *   console.log('资讯来源:', data.sources)
 * })
 */
export function queryStockNews(options = {}) {
  const {
    stockCode,
    startDate,
    endDate,
    totalNews = 100,
    qsid = '999'
  } = options

  // 转换股票代码格式: 600519.SH → 1.600519
  const setcodeCode = convertToSetcodeCode(stockCode)

  const requestData = {
    inputs: {
      setcode_code: setcodeCode,
      startDate,
      endDate,
      qsid,
      totalNews
    },
    response_mode: 'blocking',
    user: DIFY_CONFIG.user
  }

  return post(`${DIFY_CONFIG.baseURL}/v1/workflows/run`, requestData, {
    headers: {
      'Authorization': `Bearer ${DIFY_CONFIG.tokens.stockNews}`,
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 生成AI资讯早报
 * @param {Object} options 查询参数
 * @param {String|Array} options.stockList 股票代码列表（逗号分隔字符串或数组）
 * @param {String} options.date 日期，格式YYYY-MM-DD
 * @returns {Promise}
 *
 * @example
 * // 生成今日早报
 * generateDailyReport({
 *   stockList: '600519.SH,000001.SZ,300750.SZ',
 *   date: '2026-02-11'
 * }).then(data => {
 *   console.log('早报摘要:', data.summary)
 *   console.log('主题事件:', data.theme_events)
 *   console.log('个股事件:', data.stock_events)
 * })
 */
export function generateDailyReport(options = {}) {
  const { stockList, date } = options

  // 转换stockList为逗号分隔的字符串
  const stockListStr = Array.isArray(stockList)
    ? stockList.join(',')
    : stockList

  const requestData = {
    inputs: {
      SelfStock: stockListStr,
      date: date
    },
    response_mode: 'blocking',
    user: DIFY_CONFIG.user
  }

  return post(`${DIFY_CONFIG.baseURL}/v1/workflows/run`, requestData, {
    headers: {
      'Authorization': `Bearer ${DIFY_CONFIG.tokens.dailyReport}`,
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 生成今日AI资讯早报（便捷方法）
 * @param {String|Array} stockList 股票代码列表
 * @returns {Promise}
 *
 * @example
 * // 生成今日早报（自动使用今天日期）
 * generateTodayReport(['600519.SH', '000001.SZ']).then(data => {
 *   console.log('今日早报:', data)
 * })
 */
export function generateTodayReport(stockList) {
  const today = new Date()
  const dateStr = formatDate(today)

  return generateDailyReport({
    stockList,
    date: dateStr
  })
}

/**
 * 批量查询多只股票资讯
 * @param {Array<Object>} stockList 股票列表
 * @param {String} startDate 起始日期
 * @param {String} endDate 结束日期
 * @param {Number} totalNews 每只股票资讯条数
 * @returns {Promise<Array>}
 *
 * @example
 * batchQueryStockNews(
 *   [{ code: '600519.SH' }, { code: '000001.SZ' }],
 *   '2026-02-10',
 *   '2026-02-11',
 *   30
 * ).then(results => {
 *   console.log('批量资讯:', results)
 * })
 */
export async function batchQueryStockNews(stockList, startDate, endDate, totalNews = 50) {
  const promises = stockList.map(stock =>
    queryStockNews({
      stockCode: stock.code,
      startDate,
      endDate,
      totalNews
    }).catch(error => {
      console.error(`查询${stock.code}资讯失败:`, error)
      return null
    })
  )

  const results = await Promise.all(promises)
  return results.filter(r => r !== null)
}

/**
 * 查询最近N小时资讯（便捷方法）
 * @param {String} stockCode 股票代码
 * @param {Number} hours 小时数，默认24
 * @param {Number} totalNews 资讯条数，默认100
 * @returns {Promise}
 *
 * @example
 * // 查询贵州茅台最近24小时资讯
 * queryRecentNews('600519.SH', 24, 50).then(data => {
 *   console.log('最近24小时资讯:', data)
 * })
 */
export function queryRecentNews(stockCode, hours = 24, totalNews = 100) {
  const endDate = new Date()
  const startDate = new Date(endDate - hours * 60 * 60 * 1000)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return queryStockNews({
    stockCode,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    totalNews
  })
}

/**
 * 转换股票代码格式
 * @param {String} stockCode 标准股票代码（如600519.SH）
 * @returns {String} Dify格式的代码（如1.600519）
 *
 * @example
 * convertToSetcodeCode('600519.SH')  // '1.600519'
 * convertToSetcodeCode('000001.SZ')  // '0.000001'
 * convertToSetcodeCode('300750.SZ')  // '0.300750'
 */
function convertToSetcodeCode(stockCode) {
  if (!stockCode || !stockCode.includes('.')) {
    throw new Error('Invalid stock code format. Expected: CODE.MARKET')
  }

  const [code, market] = stockCode.split('.')

  // 上海市场: 6开头 = 1, 5开头 = 1
  // 深圳市场: 0开头 = 0, 3开头 = 0
  let setcode = '0'
  if (market === 'SH' || (code.startsWith('6') || code.startsWith('5'))) {
    setcode = '1'
  }

  return `${setcode}.${code}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date 日期对象
 * @returns {String} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 解析资讯响应数据
 * @param {Object} response API响应
 * @returns {Object} 解析后的数据
 *
 * @example
 * parseNewsResponse(response)
 * // {
 * //   summary: 'AI生成的摘要...',
 * //   sources: [...],
 * //   count: 10
 * // }
 */
export function parseNewsResponse(response) {
  if (!response || response.code !== 200) {
    throw new Error(response?.message || 'Invalid response')
  }

  const { result, sources } = response.data || {}

  return {
    summary: result || '',
    sources: sources || [],
    count: sources?.length || 0
  }
}

/**
 * 解析AI早报响应数据
 * @param {Object} response API响应
 * @returns {Object} 解析后的数据
 *
 * @example
 * parseDailyReport(response)
 * // {
 * //   summary: '早报摘要...',
 * //   themeEvents: [...],
 * //   stockEvents: [...],
 * //   eventCount: 15
 * // }
 */
export function parseDailyReport(response) {
  if (!response || response.code !== 200) {
    throw new Error(response?.message || 'Invalid response')
  }

  const { summary, theme_events, stock_events, date } = response.data || {}

  return {
    summary: summary || '',
    themeEvents: theme_events || [],
    stockEvents: stock_events || [],
    eventCount: (theme_events?.length || 0) + (stock_events?.length || 0),
    generatedAt: date || ''
  }
}

/**
 * 格式化资讯来源列表
 * @param {Array} sources 原始sources数组
 * @returns {Array<Object>} 格式化后的资讯列表
 *
 * @example
 * formatNewsSources(data.sources)
 * // [
 * //   { id: '11566828', title: '...', name: '顺灏股份', type: 'news' },
 * //   ...
 * // ]
 */
export function formatNewsSources(sources = []) {
  return sources.map(source => {
    const item = source.item || {}
    return {
      id: item.rec_id,
      title: item.title,
      name: item.name,
      type: item.type === 'xw' ? 'news' : 'announcement',
      url: item.url,
      tableId: item.tableid,
      issueDate: item.issue_date,
      code: item.code,
      setcode: item.setcode
    }
  })
}

/**
 * 格式化早报事件列表
 * @param {Array} events 原始events数组
 * @returns {Array<Object>} 格式化后的事件列表
 */
export function formatReportEvents(events = []) {
  return events.map(event => ({
    summary: event.summary || '',
    impact: event.impact || '',
    direction: event.direction || '中性',
    sources: event.sources || []
  }))
}

/**
 * 按关键词过滤资讯
 * @param {Array} sources 资讯列表
 * @param {String} keyword 关键词
 * @returns {Array} 过滤后的资讯列表
 *
 * @example
 * const filtered = filterNewsByKeyword(sources, '涨停')
 */
export function filterNewsByKeyword(sources, keyword) {
  if (!keyword) return sources

  const lowerKeyword = keyword.toLowerCase()
  return sources.filter(source => {
    const title = (source.item?.title || '').toLowerCase()
    return title.includes(lowerKeyword)
  })
}

/**
 * 按方向过滤早报事件
 * @param {Array} events 事件列表（theme_events或stock_events）
 * @param {String} direction 方向（'积极'/'中性'/'谨慎'/'利空'）
 * @returns {Array} 过滤后的事件列表
 */
export function filterEventsByDirection(events, direction) {
  if (!direction) return events
  return events.filter(event => event.direction === direction)
}

/**
 * 统计资讯类型分布
 * @param {Array} sources 资讯列表
 * @returns {Object} 类型统计
 *
 * @example
 * const stats = countNewsTypes(sources)
 * // { news: 8, announcement: 2, other: 0, total: 10 }
 */
export function countNewsTypes(sources = []) {
  const stats = {
    news: 0,
    announcement: 0,
    other: 0,
    total: sources.length
  }

  sources.forEach(source => {
    const type = source.item?.type
    if (type === 'xw') {
      stats.news++
    } else if (type === 'gg') {
      stats.announcement++
    } else {
      stats.other++
    }
  })

  return stats
}

/**
 * 统计事件方向分布
 * @param {Object} report 解析后的早报数据
 * @returns {Object} 方向统计
 *
 * @example
 * const stats = countEventDirections(report)
 * // { positive: 5, neutral: 8, cautious: 2, negative: 0, total: 15 }
 */
export function countEventDirections(report) {
  const allEvents = [
    ...(report.themeEvents || []),
    ...(report.stockEvents || [])
  ]

  const stats = {
    positive: 0,
    neutral: 0,
    cautious: 0,
    negative: 0,
    total: allEvents.length
  }

  allEvents.forEach(event => {
    const dir = event.direction || '中性'
    if (dir === '积极') stats.positive++
    else if (dir === '中性') stats.neutral++
    else if (dir === '谨慎') stats.cautious++
    else if (dir === '利空') stats.negative++
  })

  return stats
}

/**
 * 提取早报中的主题
 * @param {Object} report 解析后的早报数据
 * @returns {Array<String>} 主题列表
 */
export function extractThemes(report) {
  const themeEvents = report.themeEvents || []
  return themeEvents.map(event => event.theme || '').filter(Boolean)
}

/**
 * 在早报中搜索关键词
 * @param {Object} report 解析后的早报数据
 * @param {String} keyword 关键词
 * @returns {Array<Object>} 匹配的事件列表
 */
export function searchInReport(report, keyword) {
  if (!keyword) return []

  const results = []
  const lowerKeyword = keyword.toLowerCase()

  // 搜索主题事件
  ;(report.themeEvents || []).forEach(event => {
    if ((event.theme || '').toLowerCase().includes(lowerKeyword) ||
        (event.summary || '').toLowerCase().includes(lowerKeyword)) {
      results.push({ type: 'theme', ...event })
    }
  })

  // 搜索个股事件
  ;(report.stockEvents || []).forEach(event => {
    if ((event.summary || '').toLowerCase().includes(lowerKeyword) ||
        (event.impact || '').toLowerCase().includes(lowerKeyword)) {
      results.push({ type: 'stock', ...event })
    }
  })

  return results
}

export default {
  // 个股资讯
  queryStockNews,
  batchQueryStockNews,
  queryRecentNews,

  // AI早报
  generateDailyReport,
  generateTodayReport,

  // 解析工具
  parseNewsResponse,
  parseDailyReport,
  formatNewsSources,
  formatReportEvents,

  // 过滤和统计
  filterNewsByKeyword,
  filterEventsByDirection,
  countNewsTypes,
  countEventDirections,
  extractThemes,
  searchInReport
}
