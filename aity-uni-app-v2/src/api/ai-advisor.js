/**
 * AI投顾API服务
 * 负责与通达信AI接口的交互
 * 使用uni.request替代fetch，兼容H5和小程序
 */

import { buildApiEndpoint, getAuthHeaders, buildRequestBody, saveThreadId } from '@/utils/ai-advisor-config'

// 检测是否为小程序环境
const isMiniProgram = typeof wx !== 'undefined' || (typeof uni !== 'undefined' && uni.getSystemInfoSync)

/**
 * AbortController polyfill for mini-programs
 * 小程序不支持AbortController，使用简单的取消标志替代
 */
class AbortControllerPolyfill {
  constructor() {
    this.signal = {
      aborted: false,
      addEventListener: () => {},
      removeEventListener: () => {}
    }
  }

  abort() {
    this.signal.aborted = true
  }
}

// 根据环境选择AbortController
const AbortControllerImpl = isMiniProgram
  ? AbortControllerPolyfill
  : (typeof AbortController !== 'undefined' ? AbortController : AbortControllerPolyfill)

/**
 * 发送消息到AI并获取流式回复
 * @param {String} content - 用户消息内容
 * @param {Function} onMessage - 接收流式消息的回调函数
 * @param {Function} onError - 错误回调函数
 * @param {Function} onComplete - 完成回调函数
 * @returns {Function} - 取消函数
 */
export function sendAIMessage(content, onMessage, onError, onComplete) {
  const threadId = getThreadId()
  const url = buildApiEndpoint('/agent/stream/chat')
  const body = buildRequestBody(content, threadId)
  const headers = getAuthHeaders()

  // 创建AbortController用于取消请求（兼容小程序）
  const abortController = new AbortControllerImpl()
  const signal = abortController.signal

  // 启动异步请求
  fetchAIMessageInternal(url, body, headers, signal, onMessage, onError, onComplete)

  // 返回取消函数
  return () => {
    abortController.abort()
  }
}

/**
 * 内部函数：处理流式请求
 * 使用uni.request进行请求，兼容H5和小程序
 */
async function fetchAIMessageInternal(url, body, headers, signal, onMessage, onError, onComplete) {
  let accumulatedContent = '' // 累积内容
  let accumulatedReasoning = '' // 累积推理内容

  try {
    // 检查是否已被取消（小程序兼容）
    if (signal.aborted) {
      console.log('AI请求已取消（请求前）')
      return
    }

    // 使用uni.request替代fetch
    uni.request({
      url: url,
      method: 'POST',
      header: headers,
      data: body,
      timeout: 60000,
      success: (response) => {
        console.log('AI响应状态:', response.statusCode)

        // 处理响应数据
        if (response.statusCode === 200) {
          try {
            // uni.request会将JSON响应自动解析为对象
            const data = response.data

            // 检查数据格式
            if (Array.isArray(data) && data.length > 0) {
              // 处理数组格式的响应
              for (const item of data) {
                processAIMessage(item, accumulatedContent, accumulatedReasoning, onMessage, saveThreadId)
              }

              // 完成
              if (onComplete) {
                onComplete({
                  content: accumulatedContent,
                  reasoning: accumulatedReasoning
                })
              }
            } else if (typeof data === 'object' && data !== null) {
              // 处理单个对象
              processAIMessage(data, accumulatedContent, accumulatedReasoning, onMessage, saveThreadId)

              // 完成
              if (onComplete) {
                onComplete({
                  content: accumulatedContent,
                  reasoning: accumulatedReasoning
                })
              }
            } else {
              console.warn('未知响应格式:', data)
              if (onError) {
                onError('响应格式错误')
              }
            }
          } catch (error) {
            console.error('处理AI响应失败:', error)
            if (onError) {
              onError('处理响应失败: ' + error.message)
            }
          }
        } else {
          console.error('AI请求失败:', response.statusCode, response.errMsg)
          if (onError) {
            onError(`HTTP ${response.statusCode}: ${response.errMsg}`)
          }
        }
      },
      fail: (error) => {
        console.error('AI请求失败:', error)
        if (onError) {
          onError(error.errMsg || '网络请求失败')
        }
      }
    })

  } catch (error) {
    console.error('AI请求异常:', error)
    if (onError) {
      onError(error.message || '请求失败')
    }
  }
}

/**
 * 处理单条AI消息
 */
function processAIMessage(message, accumulatedContent, accumulatedReasoning, onMessage, saveThreadId) {
  // 处理thread_id保存
  if (message.metadata && message.metadata.thread_id) {
    saveThreadId(message.metadata.thread_id)
  }

  // 处理主内容
  if (message.content) {
    // 获取新增内容
    const newContent = message.content.substring(accumulatedContent.length)
    if (newContent) {
      accumulatedContent = message.content

      // 回调新内容
      if (onMessage) {
        onMessage({
          type: 'content',
          content: newContent,
          fullContent: accumulatedContent
        })
      }
    }
  }

  // 处理推理过程（深度思考）
  if (message.additional_kwargs && message.additional_kwargs.reasoning_content) {
    const newReasoning = message.additional_kwargs.reasoning_content.substring(
      accumulatedReasoning.length
    )
    if (newReasoning) {
      accumulatedReasoning = message.additional_kwargs.reasoning_content

      // 回调推理内容
      if (onMessage) {
        onMessage({
          type: 'reasoning',
          content: newReasoning,
          fullReasoning: accumulatedReasoning
        })
      }
    }
  }

  // 处理工具调用
  if (message.tool_calls && message.tool_calls.length > 0) {
    const responseMetadata = message.response_metadata || {}
    const finishReason = responseMetadata.finish_reason || ''

    if (onMessage) {
      onMessage({
        type: 'tool_calls',
        tool_calls: message.tool_calls,
        finish_reason: finishReason
      })
    }
  }
}

/**
 * 获取threadId
 */
function getThreadId() {
  return uni.getStorageSync('ai_advisor_thread_id') || ''
}
