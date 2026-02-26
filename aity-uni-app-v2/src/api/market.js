/**
 * 行情数据相关 API
 */
import { get } from '../utils/request'

/**
 * 获取指数行情
 * @returns {Promise}
 */
export function getIndexQuoteApi() {
  return get('/market/index-quote')
}

/**
 * 获取连板天梯（涨停专题）
 * @returns {Promise}
 */
export function getLimitUpLadderApi() {
  return get('/market/limit-up-ladder')
}

/**
 * 获取行业资金流向
 * @param {Object} params 查询参数
 * @param {String} params.type inflow 或 outflow
 * @param {Number} params.top 返回数量
 * @returns {Promise}
 */
export function getIndustryFundFlowApi(params = {}) {
  return get('/market/industry-fund-flow', params)
}

/**
 * 获取市场概览（综合数据）
 * @returns {Promise}
 */
export function getMarketOverviewApi() {
  return get('/market/overview')
}

/**
 * 获取行情ticker（兼容旧接口）
 * @returns {Promise}
 */
export function getMarketTickerApi() {
  return get('/market/ticker')
}

export default {
  getIndexQuoteApi,
  getLimitUpLadderApi,
  getIndustryFundFlowApi,
  getMarketOverviewApi,
  getMarketTickerApi
}
