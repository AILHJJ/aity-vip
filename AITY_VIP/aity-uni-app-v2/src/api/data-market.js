/**
 * 数据市场 API
 * 提供连板天梯、资金流向等金融数据接口
 */
import { post } from '../utils/request'

const BASE_URL = 'http://123.60.27.66:7615/TQLEX?Entry='

/**
 * 获取连板天梯数据
 * @param {Object} options 请求参数
 * @param {String} options.blocktype 板块类型，默认'0'
 * @param {String} options.blockstyle 板块样式，默认'3'
 * @returns {Promise}
 *
 * @example
 * getContinuousLimitsData().then(data => {
 *   console.log('连板天梯:', data)
 * })
 */
export function getContinuousLimitsData(options = {}) {
  return post(`${BASE_URL}HQServ.PBXmlBlock`, {
    Head: { Target: 0 },
    Blocktype: options.blocktype || '0',
    Blockstyle: options.blockstyle || '3',
    Blockid: 'Stock_SCHIGH'
  })
}

/**
 * 获取资金净流入TOP N
 * @param {Number} topN 取前N名，默认5
 * @returns {Promise}
 *
 * @example
 * getFundInflowData(10).then(data => {
 *   console.log('净流入TOP10:', data)
 * })
 */
export function getFundInflowData(topN = 5) {
  return post(`${BASE_URL}HQServ.PBXmlBlock`, {
    Head: { Target: 0 },
    Code: `HY,1,0,${topN}`,
    Blockid: 'MStock_ZLJX_ADDE_R'
  })
}

/**
 * 获取资金净流出TOP N
 * @param {Number} topN 取前N名，默认5
 * @returns {Promise}
 *
 * @example
 * getFundOutflowData(10).then(data => {
 *   console.log('净流出TOP10:', data)
 * })
 */
export function getFundOutflowData(topN = 5) {
  return post(`${BASE_URL}HQServ.PBXmlBlock`, {
    Head: { Target: 0 },
    Code: `HY,1,0,${topN}`,
    Blockid: 'MStock_ZLJX_ADDE'
  })
}

/**
 * 获取指数行情数据
 * @param {String} codes 指数代码，逗号分隔
 * @returns {Promise}
 *
 * @example
 * getIndexQuotesData('000001.SZ,399001.SZ').then(data => {
 *   console.log('指数行情:', data)
 * })
 */
export function getIndexQuotesData(codes = '000001.SZ,399001.SZ,000300.SH,000016.SH,000688.SH,000905.SH') {
  return post(`${BASE_URL}HQServ.IndexQuote`, {
    Head: { Target: 0 },
    Code: codes
  })
}

export default {
  getContinuousLimitsData,
  getFundInflowData,
  getFundOutflowData,
  getIndexQuotesData
}
