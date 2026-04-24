# SSE事件说明文档

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0.0 |
| **最后更新** | 2026-03-04 |
| **维护人** | 后端开发团队 |
| **相关框架** | LangGraph |
| **相关文件** | `aity-uni-app-v2/src/pages/ai-advisor/ai-advisor.vue` |

---

## 概述

AI投顾功能使用**Server-Sent Events (SSE)** 实现流式响应。客户端与LangGraph API建立持久连接，服务器通过不同的事件类型推送数据。

### SSE基础信息

| 项目 | 内容 |
|------|------|
| **开发环境URL** | `http://localhost:3001/api/ai-advisor/stream` |
| **生产环境URL** | `https://www.tdx.com.cn/wenda/api` |
| **请求方法** | POST |
| **Content-Type** | application/json |
| **认证方式** | `tdx-auth: <token>` |

### 请求格式

```json
{
  "content": "用户消息内容",
  "agent": "wenda",
  "think": false,
  "threadId": "会话ID（首次为空字符串）"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| content | String | 是 | 用户消息内容 | "帮我查询热门股票" |
| agent | String | 是 | 代理标识 | "wenda" |
| think | Boolean | 否 | 是否显示思考过程 | false |
| threadId | String | 是 | 会话ID，首次传空字符串 | "" |

---

## 支持的事件类型

| 事件类型 | 功能说明 | 触发时机 | 优先级 |
|---------|---------|----------|--------|
| messages/partial | 流式AI文本输出（增量更新） | AI生成回复时 | 高 |
| messages/complete | 完整消息块结束 | AI回复完成 | 高 |
| messages/metadata | 会话元数据（thread_id、run_id） | 新会话开始时 | 高 |
| messages/tool | 工具调用通知 | AI决定调用工具时 | 中 |
| messages/tool_result | 工具执行结果（原始JSON数据） | 工具执行完成 | 中 |

---

## 事件详情

### 1. messages/partial - 流式文本输出

**功能说明**

流式AI文本输出，增量更新。AI生成回复时，持续推送增量内容。

**数据格式**

```json
{
  "type": "partial",
  "content": "AI回复内容（增量）"
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| type | String | 事件类型 | "partial" |
| content | String | 增量文本内容 | "您好" |

**处理方式**

- 追加到当前消息内容
- 显示thinking或content状态
- 实时更新UI
- 自动滚动到底部

**代码示例**

```javascript
if (data.type === 'partial') {
  const newContent = data.content || ''
  if (lastMessage) {
    lastMessage.content += newContent
    lastMessage.thinking = true
  }
  scrollToBottom(false)
}
```

---

### 2. messages/complete - 消息完成

**功能说明**

完整消息块结束。AI回复完成时，发送完整内容。

**数据格式**

```json
{
  "type": "complete",
  "content": "完整的AI回复内容（markdown格式）"
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| type | String | 事件类型 | "complete" |
| content | String | 完整的markdown文本 | "# 股票分析\n\n..." |

**处理方式**

- 替换当前消息内容为完整内容
- 清除thinking状态
- 渲染markdown格式
- 标记消息为完成状态

**代码示例**

```javascript
if (data.type === 'complete') {
  const completeContent = data.content || ''
  if (lastMessage) {
    lastMessage.content = completeContent
    lastMessage.thinking = false
    lastMessage.isComplete = true
  }
  scrollToBottom(true)
}
```

---

### 3. messages/metadata - 会话元数据

**功能说明**

会话元数据，包含thread_id和run_id。用于保持对话上下文。

**数据格式**

```json
{
  "type": "metadata",
  "thread_id": "thread_abc123xyz",
  "run_id": "run_xyz789abc"
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| type | String | 事件类型 | "metadata" |
| thread_id | String | 会话ID，用于保持上下文 | "thread_abc123xyz" |
| run_id | String | 运行ID | "run_xyz789abc" |

**处理方式**

- **保存threadId到本地存储**（按用户隔离）
- 用于后续对话的上下文连续性
- 实现"新对话"功能时清空

**代码示例**

```javascript
if (data.type === 'metadata') {
  const threadId = data.thread_id || ''
  if (threadId) {
    saveThreadId(threadId)  // 保存到本地存储（按用户隔离）
    console.log('会话ID已保存:', threadId)
  }
}
```

**threadId参数说明**

| 场景 | threadId值 | 后台行为 |
|------|-----------|---------|
| 首次对话 | `""` (空字符串) | 后台创建新会话 |
| 后续对话 | `"thread_abc123"` | 使用已有会话，保持上下文 |
| 点击"新对话" | `""` (清空) | 下次对话创建新会话 |

---

### 4. messages/tool - 工具调用通知

**功能说明**

工具调用通知。AI决定调用工具时触发。

**数据格式**

```json
{
  "type": "tool",
  "tool_name": "金融选股",
  "args": {
    "query": "热门股票",
    "limit": 10
  }
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| type | String | 事件类型 | "tool" |
| tool_name | String | 工具名称 | "金融选股" |
| args | Object | 工具参数 | {"query": "热门股票", "limit": 10} |

**处理方式**

- 显示"正在调用工具：xxx"提示
- 保存工具调用信息
- 等待tool_result事件

**代码示例**

```javascript
if (data.type === 'tool') {
  const toolName = data.tool_name || '未知工具'
  if (lastMessage) {
    lastMessage.toolCalls = [{
      function: {
        name: toolName,
        arguments: JSON.stringify(data.args)
      }
    }]
  }
  console.log('正在调用工具:', toolName)
}
```

**UI显示示例**

```html
<view class="tool-calls-info">
  <text class="tool-icon">🔧</text>
  <text class="tool-text">正在调用工具：{{ toolName }}</text>
</view>
```

---

### 5. messages/tool_result - 工具执行结果

**功能说明**

工具执行结果，返回原始JSON数据。

**数据格式**

```json
{
  "type": "tool_result",
  "tool_name": "金融选股",
  "tool_result": [
    [0, "", 0, "", "0"],
    ["POS", "market", "sec_code", "sec_name", "now_price", "chg0#", "所属行业", "timestamps"],
    ["", "", "", "2|0|0", "2|0|0", "0|0|0", ""],
    ["000001", "沪市", "平安银行", "12.45", "2.35", "银行业", "2024-01-15 10:30:00"],
    ["000002", "沪市", "万科A", "18.67", "-1.2", "房地产业", "2024-01-15 10:30:00"]
  ]
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| type | String | 事件类型 | "tool_result" |
| tool_name | String | 工具名称 | "金融选股" |
| tool_result | Array | 工具返回的原始数据 | [[...], [...], ...] |

**处理方式**

- **保存工具响应原始数据**
- **渲染为结构化表格**（优先于markdown文本显示）
- 解析3层数据结构
- 应用格式化标识和颜色规则

**代码示例**

```javascript
if (data.type === 'tool_result') {
  const toolName = data.tool_name
  const toolResult = JSON.stringify(data.tool_result)

  if (toolName === '金融选股') {
    // 保存工具结果
    if (lastMessage) {
      lastMessage.toolResult = toolResult
      lastMessage.isTable = true
    }
  }

  console.log('工具响应结果:', toolName, toolResult)
  scrollToBottom(false)
}
```

**数据结构解析**

**详见**: [数据格式说明文档](../ai-advisor/数据格式说明.md)

简要说明：

- **第0行**: 元数据 `[0, "", 0, "", "0"]`
- **第1行**: 字段定义 `["POS", "market", "sec_code", ...]`
- **第2行**: 格式化标识 `["", "", "", "2|0|0", ...]`
- **第3行+**: 实际数据 `["000001", "沪市", "平安银行", ...]`

**渲染效果**

```
🔧 正在调用工具：金融选股

📊 工具返回结果
┌──────────┬──────────┬─────────┬─────────┐
│ 证券代码 │ 证券名称 │ 市场   │ 现价    │ 涨跌幅  │
├──────────┼──────────┼─────────┼─────────┤
│ 000001   │ 平安银行 │ 沪市   │ 12.45   │ <span class="color-up">2.35%</span> │  ← 红色
│ 000002   │ 万科A   │ 沪市   │ 18.67   │ <span class="color-down">1.2%</span> │  ← 绿色
└──────────┴──────────┴─────────┴─────────┘

基于您的查询，我为您找到了以下热门股票...
```

---

## 事件流程示例

### 完整对话流程

```
用户发送消息 → POST /ai-advisor/stream
              ↓
       连接SSE流
              ↓
    ┌─────────────────┐
    │ 1. metadata    │ ← thread_id: "abc123"
    └─────────────────┘
              ↓
    ┌─────────────────┐
    │ 2. partial     │ ← "您"
    └─────────────────┘
              ↓
    ┌─────────────────┐
    │ 3. partial     │ ← "您好"
    └─────────────────┘
              ↓
    ┌─────────────────┐
    │ 4. tool       │ ← tool_name: "金融选股"
    └─────────────────┘
              ↓
    ┌─────────────────┐
    │ 5. tool_result │ ← 工具返回JSON数据
    └─────────────────┘
              ↓
    ┌─────────────────┐
    │ 6. partial     │ ← "为您找到"
    └─────────────────┘
              ↓
    ┌─────────────────┐
    │ 7. complete   │ ← 完整markdown文本
    └─────────────────┘
              ↓
        对话结束
```

---

## 实现要点

### SSE连接管理

**建立SSE连接**

```javascript
const eventSource = new EventSource(API_URL, {
  headers: {
    'tdx-auth': AUTH_TOKEN
  }
})
```

**监听消息事件**

```javascript
eventSource.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data)
    handleSSEMessage(data)
  } catch (error) {
    console.error('解析SSE消息失败:', error)
  }
}
```

**错误处理**

```javascript
eventSource.onerror = (error) => {
  console.error('SSE连接错误:', error)
  eventSource.close()
}
```

---

### 消息处理流程

**事件分发逻辑**

```javascript
function handleSSEMessage(data) {
  // 处理不同类型的事件
  switch (data.type) {
    case 'partial':
      handlePartialMessage(data)
      break
    case 'complete':
      handleCompleteMessage(data)
      break
    case 'metadata':
      handleMetadata(data)
      break
    case 'tool':
      handleToolCall(data)
      break
    case 'tool_result':
      handleToolResult(data)
      break
    default:
      console.warn('未知事件类型:', data.type)
  }
}
```

---

### 自动滚动优化

**平滑滚动 vs 立即滚动**

```javascript
function scrollToBottom(animate = true) {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query.select('.scroll-container').boundingClientRect()
    query.exec((res) => {
      if (res && res[0]) {
        const scrollTop = res[0].height
        if (animate) {
          // 平滑滚动（用于complete事件）
          scrollView.value.scrollTo({
            top: scrollTop,
            duration: 300
          })
        } else {
          // 立即滚动（用于partial事件）
          scrollView.value.scrollTop = scrollTop
        }
      }
    })
  })
}
```

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [01-financial-data-api.md](./01-financial-data-api.md) | 金融数据接口文档 |
| [02-trading-board-api.md](./02-trading-board-api.md) | 打板功能接口文档 |
| [03-ai-assistant-api.md](./03-ai-assistant-api.md) | AI助手接口文档 |
| [04-core-business-api.md](./04-core-business-api.md) | 核心业务接口文档 |
| [数据格式说明](../ai-advisor/数据格式说明.md) | 金融工具数据结构详解 |
| [技术实现](../ai-advisor/技术实现.md) | AI投顾功能技术实现 |

---

## 变更日志

### v1.0.0 (2026-03-04)
- 🎉 初始版本，整合SSE事件文档
- ✅ 5种事件类型说明
- ✅ 完整的数据格式和字段说明
- ✅ 代码示例和实现要点
- ✅ 事件流程示例
- ✅ 自动滚动优化方案

---

**相关文档**
- [03-ai-assistant-api.md](./03-ai-assistant-api.md) - AI助手接口
- [数据格式说明](../ai-advisor/数据格式说明.md) - 金融工具数据结构
