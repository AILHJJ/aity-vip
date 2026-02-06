/**
 * AI投顾API服务
 * 负责与通达信AI接口的交互
 */

import { buildApiEndpoint, getAuthHeaders, buildRequestBody, saveThreadId } from '@/utils/ai-advisor-config'

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

  // 创建AbortController用于取消请求
  const abortController = new AbortController()
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
 * 使用缓冲区处理SSE流，避免JSON解析错误
 */
async function fetchAIMessageInternal(url, body, headers, signal, onMessage, onError, onComplete) {
  let accumulatedContent = '' // 累积内容
  let accumulatedReasoning = '' // 累积推理内容
  let buffer = '' // SSE缓冲区

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: signal
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    // 读取流
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        // 流结束
        if (onComplete) {
          onComplete({
            content: accumulatedContent,
            reasoning: accumulatedReasoning
          })
        }
        break
      }

      // 解码数据块并添加到缓冲区
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // 处理缓冲区中的完整事件
      buffer = processBuffer(buffer, onMessage, (data, eventType) => {
        try {
          const obj = JSON.parse(data)

          // 检查数据格式
          if (!obj || !Array.isArray(obj) || obj.length === 0) {
            return
          }

          const message = obj[0]

          // 处理thread_id保存
          if (message.metadata && message.metadata.thread_id) {
            saveThreadId(message.metadata.thread_id)
          }

          // 处理内容增量
          if (message.content) {
            const newContent = message.content.substring(accumulatedContent.length)
            if (newContent) {
              accumulatedContent = message.content

              // 回调新内容（不过滤，因为可能包含表格JSON）
              if (newContent) {
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
              onMessage({
                type: 'reasoning',
                content: newReasoning,
                fullReasoning: accumulatedReasoning
              })
            }
          }

          // 处理工具调用
          if (message.tool_calls && message.tool_calls.length > 0) {
            const responseMetadata = message.response_metadata || {}
            const finishReason = responseMetadata.finish_reason || ''

            onMessage({
              type: 'tool_calls',
              tool_calls: message.tool_calls,
              finish_reason: finishReason
            })
          }

          // 处理完成事件
          if (eventType === 'messages/complete') {
            onComplete({
              content: accumulatedContent,
              reasoning: accumulatedReasoning
            })
          }

        } catch (parseError) {
          console.error('解析SSE数据失败:', parseError, data)
        }
      })

      // 保留未处理的部分到缓冲区
      buffer = getRemainingBuffer(buffer)
    }

  } catch (error) {
    // 处理取消
    if (error.name === 'AbortError') {
      console.log('AI请求已取消')
      return
    }

    // 处理其他错误
    console.error('AI请求失败:', error)
    if (onError) {
      onError(error)
    }
  }
}

/**
 * 处理缓冲区中的完整SSE事件
 * @param {String} buffer - 缓冲区内容
 * @param {Function} onMessage - 消息回调
 * @param {Function} processData - 处理单个事件的回调
 * @returns {String} - 剩余的缓冲区内容
 */
function processBuffer(buffer, onMessage, processData) {
  // SSE事件以 \n\n 分隔
  const events = buffer.split('\n\n')

  // 处理除最后一个之外的所有事件（最后一个可能不完整）
  for (let i = 0; i < events.length - 1; i++) {
    const eventBlock = events[i]
    if (!eventBlock.trim()) continue

    const event = parseEventBlock(eventBlock)
    if (event.type && event.data) {
      processData(event.data, event.type)
    }
  }

  // 返回剩余部分（最后一个可能不完整的事件）
  return events[events.length - 1] || ''
}

/**
 * 解析单个SSE事件块
 * @param {String} block - 事件块
 * @returns {Object} - { type, data, id }
 */
function parseEventBlock(block) {
  const lines = block.split('\n')
  const event = { type: null, data: null, id: null }

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event.type = line.substring(6).trim()
    }
    if (line.startsWith('data:')) {
      event.data = line.substring(5).trim()
    }
    if (line.startsWith('id:')) {
      event.id = line.substring(3).trim()
    }
  }

  return event
}

/**
 * 获取剩余的缓冲区内容（不完整的事件）
 * @param {String} buffer - 缓冲区内容
 * @returns {String} - 剩余内容
 */
function getRemainingBuffer(buffer) {
  const lastNewlineIndex = buffer.lastIndexOf('\n\n')
  return lastNewlineIndex !== -1 ? buffer.substring(lastNewlineIndex + 2) : buffer
}

/**
 * 过滤 @@@@ 替换字符串（不支持）
 * @param {String} content - 内容
 * @returns {String} - 过滤后的内容
 */
function filterReplacementStrings(content) {
  if (!content) return ''
  // 移除 @@@@@...@@@@ 格式的替换字符串
  return content.replace(/@@.+?@@/g, '')
}

/**
 * 获取threadId
 */
function getThreadId() {
  return uni.getStorageSync('ai_advisor_thread_id') || ''
}
