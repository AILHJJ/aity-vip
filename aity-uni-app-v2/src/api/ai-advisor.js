/**
 * AI投顾API服务
 * 通过后端代理与通达信AI接口交互
 * 使用SSE流式处理，支持GLM模型
 */

import { getApiBaseUrl, buildRequestBody, saveThreadId, getThreadId } from '@/utils/ai-advisor-config'

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
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/stream-chat`
  const body = buildRequestBody(content, threadId)

  // 创建SSE解析器
  const parser = new SSEParser(onMessage, onError, onComplete)

  // 发送请求到后端代理
  fetchSSE(url, body, parser)

  // 返回取消函数（暂不支持）
  return () => {}
}

/**
 * 发送SSE请求（通过后端代理）
 */
function fetchSSE(url, body, parser) {
  // 使用uni.request发送请求
  uni.request({
    url: url,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    data: body,
    timeout: 120000,
    responseType: 'text',  // 重要：接收文本响应
    success: (response) => {
      if (response.statusCode === 200) {
        // 解析SSE流
        parser.parse(response.data)
      } else if (response.statusCode === 401) {
        // Token过期，提示用户
        parser.onError('Token已过期，请联系管理员刷新')
      } else {
        parser.onError(`HTTP ${response.statusCode}: ${response.errMsg || '请求失败'}`)
      }
    },
    fail: (error) => {
      parser.onError(error.errMsg || '网络请求失败')
    }
  })
}

/**
 * SSE流解析器
 * 负责解析SSE协议并分发事件
 */
class SSEParser {
  constructor(onMessage, onError, onComplete) {
    this.onMessage = onMessage
    this.onError = onError
    this.onComplete = onComplete

    // 状态记录（用于计算增量）
    this.curAllContent = ''
    this.curAllReasoning = ''

    // 工具调用状态
    this.pendingToolCalls = []
  }

  /**
   * 解析SSE响应文本
   */
  parse(sseText) {
    try {
      // SSE事件用 \n\n 分隔
      const events = sseText.split('\n\n')

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue

        const event = this.parseEventBlock(eventBlock)
        if (event.type && event.data) {
          this.dispatch(event)
        }
      }

      // 完成
      if (this.onComplete) {
        this.onComplete()
      }
    } catch (error) {
      console.error('解析SSE失败:', error)
      if (this.onError) {
        this.onError('解析响应失败: ' + error.message)
      }
    }
  }

  /**
   * 解析单个SSE事件块
   */
  parseEventBlock(block) {
    const lines = block.split('\n')
    const event = { type: null, data: null, id: null }

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event.type = line.substring(6).trim()
      } else if (line.startsWith('data:')) {
        event.data = line.substring(5).trim()
      } else if (line.startsWith('id:')) {
        event.id = line.substring(3).trim()
      }
    }

    return event
  }

  /**
   * 分发事件到对应处理器
   */
  dispatch(event) {
    const { type, data } = event

    try {
      switch (type) {
        case 'messages/partial':
          this.handlePartial(data)
          break
        case 'messages/complete':
          this.handleComplete(data)
          break
        case 'messages/metadata':
          this.handleMetadata(data)
          break
        case 'error':
        case 'messages/invalid':
          console.warn('SSE错误事件:', type, data)
          break
        default:
          console.log('未知SSE事件:', type, data)
      }
    } catch (error) {
      console.error(`处理事件 ${type} 失败:`, error)
    }
  }

  /**
   * 处理部分消息（增量更新）
   */
  handlePartial(data) {
    const obj = JSON.parse(data)
    if (!Array.isArray(obj) || obj.length === 0) return

    const message = obj[0]

    // 处理主内容增量
    if (message.content) {
      const newContent = this.calculateDelta(
        message.content,
        this.curAllContent
      )
      if (newContent) {
        this.curAllContent = message.content

        // 回调新内容
        if (this.onMessage) {
          this.onMessage({
            type: 'content',
            content: newContent,
            fullContent: this.curAllContent
          })
        }
      }
    }

    // 处理思考过程（GLM模型特有）
    if (message.additional_kwargs?.reasoning_content) {
      const reasoning = message.additional_kwargs.reasoning_content
      const newReasoning = this.calculateDelta(
        reasoning,
        this.curAllReasoning
      )
      if (newReasoning) {
        this.curAllReasoning = reasoning

        // 回调思考过程
        if (this.onMessage) {
          this.onMessage({
            type: 'reasoning',
            content: newReasoning,
            fullReasoning: this.curAllReasoning
          })
        }
      }
    }

    // 处理工具调用
    if (message.tool_calls && message.tool_calls.length > 0) {
      if (this.onMessage) {
        this.onMessage({
          type: 'tool_calls',
          tool_calls: message.tool_calls,
          finish_reason: message.response_metadata?.finish_reason || ''
        })
      }
    }
  }

  /**
   * 处理完整消息（块结束）
   */
  handleComplete(data) {
    const obj = JSON.parse(data)
    if (!Array.isArray(obj) || obj.length === 0) return

    const message = obj[0]

    // 重置位置计数（为下一块准备）
    this.curAllContent = ''
    this.curAllReasoning = ''

    // 处理工具结果
    if (message.type === 'tool') {
      if (this.onMessage) {
        this.onMessage({
          type: 'tool_result',
          tool_name: message.name,
          tool_result: message.content,
          status: message.status || 'success'
        })
      }
    }
  }

  /**
   * 处理元数据
   */
  handleMetadata(data) {
    try {
      const metadata = JSON.parse(data)
      const threadData = Object.values(metadata)[0]

      if (threadData && threadData.metadata) {
        const { thread_id, run_id } = threadData.metadata

        // 保存thread_id
        if (thread_id) {
          saveThreadId(thread_id)
        }

        // 回调元数据
        if (this.onMessage && thread_id) {
          this.onMessage({
            type: 'metadata',
            thread_id: thread_id,
            run_id: run_id
          })
        }
      }
    } catch (error) {
      console.error('解析元数据失败:', error)
    }
  }

  /**
   * 计算增量内容
   * @param {String} fullContent - 完整内容
   * @param {String} lastContent - 上次的内容
   * @returns {String} - 新增的部分
   */
  calculateDelta(fullContent, lastContent) {
    if (!fullContent) return ''

    const lastLen = lastContent.length
    const fullLen = fullContent.length

    if (fullLen <= lastLen) {
      return ''
    }

    return fullContent.substring(lastLen, fullLen)
  }
}
