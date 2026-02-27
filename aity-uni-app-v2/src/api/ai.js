/**
 * AI 相关 API
 * 提供内容优化、智能推荐、配置管理等AI功能
 */
import { get, post, put } from '../utils/request'

/**
 * 优化消息内容
 * @param {Object} data 请求数据
 * @param {String} data.content - 原始内容
 * @param {String} data.type - 优化类型 (default, professional, concise)
 * @returns {Promise}
 */
export function optimizeContentApi(data) {
  return post('/ai/optimize', data)
}

/**
 * 获取所有 AI 配置（按厂商分组）
 * @returns {Promise}
 */
export function getAiConfigsApi() {
  return get('/ai/configs')
}

/**
 * 获取当前活跃的 AI 配置
 * @returns {Promise}
 */
export function getActiveAiConfigApi() {
  return get('/ai/config')
}

/**
 * 设置活跃模型
 * @param {Number} id 模型ID
 * @returns {Promise}
 */
export function setActiveModelApi(id) {
  return put(`/ai/config/${id}/active`)
}

/**
 * 更新 AI 配置
 * @param {Number} id 模型ID
 * @param {Object} data AI 配置数据
 * @param {String} data.displayName 显示名称
 * @param {String} data.description 模型简介
 * @param {String} data.features 模型特点
 * @param {String} data.baseUrl API地址
 * @param {String} data.apiKey API密钥
 * @param {String} data.promptTemplate 提示词模板
 * @returns {Promise}
 */
export function updateAiConfigApi(id, data) {
  return put(`/ai/config/${id}`, data)
}

/**
 * 更新厂商 API Key
 * @param {String} provider 厂商代码
 * @param {String} apiKey 新的API Key
 * @returns {Promise}
 */
export function updateProviderApiKeyApi(provider, apiKey) {
  return put(`/ai/provider/${provider}/apikey`, { apiKey })
}

/**
 * 测试单个 AI 连接
 * @param {Number} id 模型ID
 * @returns {Promise}
 */
export function testAiConnectionApi(id) {
  return post(`/ai/test-connection/${id}`)
}

/**
 * 批量测试所有 AI 连接
 * @returns {Promise}
 */
export function testAllAiConnectionsApi() {
  return post('/ai/test-all-connections')
}

/**
 * 生成内容摘要
 * @param {Object} data 请求数据
 * @param {String} data.content - 原始内容
 * @param {Number} data.maxLength - 最大长度
 * @returns {Promise}
 */
export function summarizeContentApi(data) {
  return post('/ai/summarize', data)
}

/**
 * 获取AI推荐的话题
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getRecommendedTopicsApi(params = {}) {
  return post('/ai/recommend-topics', params)
}

export default {
  optimizeContentApi,
  getAiConfigsApi,
  getActiveAiConfigApi,
  setActiveModelApi,
  updateAiConfigApi,
  updateProviderApiKeyApi,
  testAiConnectionApi,
  testAllAiConnectionsApi,
  summarizeContentApi,
  getRecommendedTopicsApi
}
