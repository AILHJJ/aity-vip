# Dify工作流接口文档

## 概述

本文档记录Dify工作流相关的API接口，用于AI驱动的数据查询和分析。

## 基础信息

**基础URL：** `http://111.48.74.244:8888/v1/workflows/run`

**认证Token：**
- 个股资讯查询：`app-3yde9NCq0vBW6apenu2jR29H`
- AI资讯早报：`app-nu968mbvMTrnAxFe6`

---

## 1. 个股24小时资讯查询接口

### 接口地址
```
POST http://111.48.74.244:8888/v1/workflows/run
```

### 请求头

| 字段名 | 类型 | 是否必填 | 描述 |
|--------|------|---------|------|
| Authorization | string | 是 | 认证信息，格式：`Bearer <token>` |
| Content-Type | string | 是 | 请求体类型，固定值：`application/json` |

### 请求体

| 字段名 | 类型 | 是否必填 | 描述 |
|--------|------|---------|------|
| inputs | object | 是 | 输入参数对象，包含以下子字段： |
| inputs.setcode_code | string | 是 | 市场代码_证券代码，格式：`市场ID.股票代码` |
| inputs.startDate | string | 是 | 起始日期，格式：`YYYY-MM-DD` |
| inputs.endDate | string | 是 | 结束日期，格式：`YYYY-MM-DD` |
| inputs.qsid | string | 否 | 券商ID，默认：`999` |
| inputs.totalNews | number | 否 | 资讯条数，默认：`100` |
| response_mode | string | 是 | 响应模式，固定值：`blocking` |
| user | string | 是 | 用户标识符，例如：`aiznt-8888` |

### 请求示例

#### cURL
```bash
curl -X POST 'http://111.48.74.244:8888/v1/workflows/run' \
  -H 'Authorization: Bearer app-3yde9NCq0vBW6apenu2jR29H' \
  -H 'Content-Type: application/json' \
  -d '{
    "inputs": {
      "setcode_code": "1.000001",
      "startDate": "2026-02-10",
      "endDate": "2026-02-11",
      "qsid": "999",
      "totalNews": 50
    },
    "response_mode": "blocking",
    "user": "aiznt-8888"
  }'
```

#### JavaScript
```javascript
const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer app-3yde9NCq0vBW6apenu2jR29H',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {
      setcode_code: '1.000001',  // 平安银行
      startDate: '2026-02-10',
      endDate: '2026-02-11',
      qsid: '999',
      totalNews: 50
    },
    response_mode: 'blocking',
    user: 'aiznt-8888'
  })
})

const data = await response.json()
console.log('资讯数据:', data)
```

### 响应示例

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "result": "整理的资讯摘要...",
    "sources": [
      {
        "item": {
          "rec_id": "11566828",
          "tableid": "tb_news_common",
          "type": "xw",
          "name": "顺灏股份",
          "title": "【风口解读】顺灏股份涨停，11月28日至今涨149.66%",
          "url": ""
        }
      },
      {
        "item": {
          "rec_id": "11566829",
          "tableid": "tb_news_common",
          "type": "xw",
          "name": "比亚迪",
          "title": "比亚迪新能源汽车销量再创新高",
          "url": ""
        }
      }
    ]
  }
}
```

### 响应字段说明

| 字段名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码，200表示成功 |
| message | string | 响应消息 |
| data.result | string | AI整理的资讯摘要（Markdown格式） |
| data.sources | array | 原始资讯列表 |
| sources[].item | object | 单条资讯对象 |
| item.rec_id | string | 资讯记录ID |
| item.tableid | string | 数据表ID |
| item.type | string | 资讯类型（xw=新闻） |
| item.name | string | 股票名称 |
| item.title | string | 资讯标题 |
| item.url | string | 资讯链接（可能为空） |

---

## 参数详解

### setcode_code（市场代码_证券代码）

**格式：** `市场ID.股票代码`

**市场ID对照表：**
| 市场ID | 市场名称 | 代码示例 |
|--------|---------|---------|
| 1 | 上海证券交易所 | 600000.SH, 000001.SZ |
| 0 | 深圳证券交易所 | 000001.SZ, 300001.SZ |

**常用示例：**
```javascript
// 上海市场
'1.600000'  // 浦发银行
'1.600036'  // 招商银行
'1.600519'  // 贵州茅台

// 深圳市场
'0.000001'  // 平安银行
'0.000002'  // 万科A
'0.300750'  // 宁德时代
```

### 日期格式

**格式：** `YYYY-MM-DD`

**示例：**
```javascript
startDate: '2026-02-10'  // 2026年2月10日
endDate: '2026-02-11'    // 2026年2月11日

// 查询最近24小时
const today = new Date()
const yesterday = new Date(today - 24 * 60 * 60 * 1000)

startDate: yesterday.toISOString().split('T')[0]
endDate: today.toISOString().split('T')[0]
```

### totalNews（资讯条数）

**类型：** number

**范围：** 1-1000

**默认值：** 100

**说明：** 控制返回的资讯数量，建议根据实际需求调整以优化性能。

---

## 使用场景

### 1. 个股资讯查询
查询某只股票在指定时间段内的相关资讯，AI会自动整理和总结。

**适用场景：**
- 查看个股最新动态
- 研究股票走势原因
- 辅助投资决策

### 2. 板块资讯汇总
批量查询同一板块多只股票的资讯，发现板块热点。

**适用场景：**
- 板块轮动分析
- 热点题材捕捉
- 行业动态跟踪

### 3. 市场情绪分析
通过分析资讯标题和内容，判断市场情绪。

**适用场景：**
- 市场热度评估
- 情绪指标计算
- 风险预警

---

## 错误处理

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|---------|
| 400 | 请求参数错误 | 检查inputs参数格式 |
| 401 | 认证失败 | 检查Token是否正确 |
| 403 | 无权限访问 | 联系管理员授权 |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 服务器内部错误 | 稍后重试或联系技术支持 |

### 错误响应示例

```json
{
  "code": 401,
  "message": "Invalid token",
  "data": null
}
```

### JavaScript错误处理

```javascript
try {
  const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer app-3yde9NCq0vBW6apenu2jR29H',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  if (data.code !== 200) {
    throw new Error(data.message || '请求失败')
  }

  console.log('资讯摘要:', data.data.result)
  console.log('资讯来源:', data.data.sources)

} catch (error) {
  console.error('查询个股资讯失败:', error)
  // 降级处理：显示错误提示
  uni.showToast({
    title: '查询失败，请稍后重试',
    icon: 'none'
  })
}
```

---

## 性能优化建议

### 1. 请求频率控制
```javascript
// 使用防抖避免频繁请求
const debouncedQuery = debounce(async (stockCode) => {
  const news = await queryStockNews(stockCode)
  return news
}, 2000)  // 2秒内只执行一次
```

### 2. 数据缓存
```javascript
// 缓存查询结果
const newsCache = new Map()

async function queryStockNewsWithCache(stockCode, startDate, endDate) {
  const cacheKey = `${stockCode}-${startDate}-${endDate}`

  if (newsCache.has(cacheKey)) {
    const cached = newsCache.get(cacheKey)
    // 检查缓存是否过期（5分钟）
    if (Date.now() - cached.timestamp < 300000) {
      return cached.data
    }
  }

  const data = await queryStockNews(stockCode, startDate, endDate)
  newsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })

  return data
}
```

### 3. 分页加载
```javascript
// 大量资讯时分批加载
async function queryStockNewsPaginated(stockCode, startDate, endDate, totalNews = 100) {
  const pageSize = 20
  const pages = Math.ceil(totalNews / pageSize)
  const allNews = []

  for (let page = 0; page < pages; page++) {
    const data = await queryStockNews(stockCode, startDate, endDate, pageSize)
    allNews.push(...data.sources)

    // 延迟避免请求过快
    if (page < pages - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return allNews
}
```

---

## 集成方案

### 方案A：直接调用

在需要的页面直接调用API，适合简单场景。

```javascript
// pages/stock-detail/stock-detail.vue
import { queryStockNews } from '@/api/dify'

async function loadStockNews() {
  const news = await queryStockNews('1.600519', '2026-02-10', '2026-02-11')
  // 渲染资讯列表
}
```

### 方案B：通过图灵AI

利用现有的图灵AI功能，让AI自动调用资讯查询接口。

```javascript
// 在AI对话中自然查询
用户: "查询贵州茅台最近24小时的资讯"
系统: 自动识别意图 → 调用Dify接口 → 返回整理后的资讯
```

### 方案C：数据市场模块

在数据市场页面添加"个股资讯"Tab。

```javascript
// pages/data-market/data-market.vue
tabs: [
  { label: '指数行情', value: 'index' },
  { label: '连板天梯', value: 'limits' },
  { label: '资金流向', value: 'fundflow' },
  { label: '个股资讯', value: 'news' }  // 新增
]
```

---

## 后续扩展方向

### 功能增强
1. **多股票批量查询** - 一次性查询多只股票资讯
2. **关键词过滤** - 按关键词筛选相关资讯
3. **情感分析** - 分析资讯正负面情绪
4. **资讯分类** - 按公告、新闻、研报等分类
5. **智能摘要** - AI生成更长的深度分析

### 数据关联
1. **关联行情数据** - 资讯与K线、涨跌幅关联
2. **关联资金流向** - 分析资讯对资金的影响
3. **关联龙虎榜** - 分析机构动向与资讯的关系

### 可视化
1. **资讯词云** - 生成高频词云图
2. **时间线** - 按时间轴展示资讯
3. **热点图谱** - 构建资讯关联网络

---

## 安全注意事项

1. **Token保护**
   - 不要在前端硬编码Token
   - 建议通过后端代理转发请求
   - 定期更换Token

2. **参数验证**
   - 验证股票代码格式
   - 验证日期范围合理性
   - 限制单次查询数量

3. **权限控制**
   - 记录API调用日志
   - 限制用户调用频率
   - 实施用户级权限管理

---

## 联系方式

**接口维护：** 数据服务团队
**文档更新：** 2026-02-11
**版本号：** v1.0.0

---

## 附录

### 完整请求示例

```javascript
// 完整的查询流程
async function getStockNews(stockCode, days = 1) {
  // 1. 计算日期范围
  const endDate = new Date()
  const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000)

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  // 2. 构建请求参数
  const requestData = {
    inputs: {
      setcode_code: stockCode,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      qsid: '999',
      totalNews: 50
    },
    response_mode: 'blocking',
    user: 'aiznt-8888'
  }

  // 3. 发送请求
  try {
    const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-3yde9NCq0vBW6apenu2jR29H',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    const data = await response.json()

    if (data.code === 200) {
      return {
        summary: data.data.result,
        sources: data.data.sources
      }
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('查询失败:', error)
    throw error
  }
}

// 使用示例
getStockNews('1.600519', 1)  // 查询贵州茅台最近24小时资讯
  .then(result => {
    console.log('AI摘要:', result.summary)
    console.log('资讯来源:', result.sources)
  })
```

### 常用股票代码速查

| 代码 | 名称 | 市场代码 | setcode_code |
|------|------|---------|--------------|
| 600519 | 贵州茅台 | SH | 1.600519 |
| 000001 | 平安银行 | SZ | 0.000001 |
| 000002 | 万科A | SZ | 0.000002 |
| 600036 | 招商银行 | SH | 1.600036 |
| 300750 | 宁德时代 | SZ | 0.300750 |
| 002594 | 比亚迪 | SZ | 0.002594 |

---

## 2. AI资讯早报生成接口

### 接口地址
```
POST http://111.48.74.244:8888/v1/workflows/run
```

**Token：** `app-nu968mbvMTrnAxFe6`

### 请求头

| 字段名 | 类型 | 是否必填 | 描述 |
|--------|------|---------|------|
| Authorization | string | 是 | 认证信息，格式：`Bearer app-nu968mbvMTrnAxFe6` |
| Content-Type | string | 是 | 请求体类型，固定值：`application/json` |

### 请求体

| 字段名 | 类型 | 是否必填 | 描述 |
|--------|------|---------|------|
| inputs | object | 是 | 输入参数对象，包含以下子字段： |
| inputs.SelfStock | string | 是 | 自选股票列表，逗号分隔的股票代码 |
| inputs.date | string | 是 | 指定日期，格式：`YYYY-MM-DD` |
| response_mode | string | 是 | 响应模式，固定值：`blocking` |
| user | string | 是 | 用户标识符，例如：`aiznt-8888` |

### 请求示例

#### cURL
```bash
curl -X POST 'http://111.48.74.244:8888/v1/workflows/run' \
  -H 'Authorization: Bearer app-nu968mbvMTrnAxFe6' \
  -H 'Content-Type: application/json' \
  -d '{
    "inputs": {
      "SelfStock": "600519.SH,000001.SZ,300750.SZ",
      "date": "2026-02-11"
    },
    "response_mode": "blocking",
    "user": "aiznt-8888"
  }'
```

#### JavaScript
```javascript
const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer app-nu968mbvMTrnAxFe6',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {
      SelfStock: '600519.SH,000001.SZ,300750.SZ',
      date: '2026-02-11'
    },
    response_mode: 'blocking',
    user: 'aiznt-8888'
  })
})

const data = await response.json()
console.log('AI资讯早报:', data)
```

### 响应示例

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "summary": "【市场回顾】昨日主要指数多数上涨，沪指涨0.23%，深成指涨0.12%，创业板指跌0.25%...",
    "theme_events": [
      {
        "theme": "人工智能",
        "summary": "AI技术持续突破，多领域应用落地加速",
        "impact": "利好AI概念股整体表现",
        "direction": "积极"
      }
    ],
    "stock_events": [
      {
        "summary": "线上线下澄清未布局GEO及数字人营销业务",
        "impact": "该事件属于预期内澄清。短期看，澄清业务边界可能消除市场对其参与热门AI概念的误解，情绪面影响有限；中长期看，明确公司业务聚焦传统数字营销全流程，不涉及AI智能投流、生成式AI创意及智能数字人等前沿领域，对公司基本面无实质性改变，是一次性信息澄清。总体而言，事件影响中性且轻微。",
        "direction": "中性",
        "sources": [
          {
            "issue_date": "2026-01-21 15:21:39",
            "name": "数字人",
            "setcode": "2",
            "code": "920670",
            "title": "线上线下(300959)：目前没有布局GEO（生成式引擎优化）相关业务",
            "type": "xw",
            "tableid": "tb_news_common",
            "rec_id": "11639168",
            "url": ""
          }
        ]
      }
    ],
    "date": "2026-01-22 12:48:51"
  }
}
```

### 响应字段说明

| 字段名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码，200表示成功 |
| message | string | 响应消息 |
| data.summary | string | AI生成的早报摘要（Markdown格式） |
| data.theme_events | array | 主题事件列表 |
| theme_events[].theme | string | 主题名称 |
| theme_events[].summary | string | 事件摘要 |
| theme_events[].impact | string | 影响分析 |
| theme_events[].direction | string | 方向判断（积极/中性/谨慎） |
| data.stock_events | array | 个股事件列表 |
| stock_events[].summary | string | 事件摘要 |
| stock_events[].impact | string | 详细影响分析 |
| stock_events[].direction | string | 方向判断（积极/中性/谨慎/利空） |
| stock_events[].sources | array | 资讯来源列表 |
| sources[].issue_date | string | 发布日期 |
| sources[].name | string | 股票名称 |
| sources[].code | string | 股票代码 |
| sources[].title | string | 资讯标题 |
| sources[].url | string | 资讯链接 |
| data.date | string | 生成时间 |

### 功能特点

1. **智能汇总** - AI自动分析自选股的相关资讯
2. **事件分类** - 区分主题事件和个股事件
3. **影响分析** - 详细分析事件对股价的影响
4. **方向判断** - 给出积极/中性/谨慎的明确判断
5. **来源追溯** - 提供完整的资讯来源列表

---

## 3. 两个接口对比

| 特性 | 个股资讯查询 | AI资讯早报 |
|------|-------------|-----------|
| **Token** | app-3yde9NCq0vBW6apenu2jR29H | app-nu968mbvMTrnAxFe6 |
| **主要功能** | 查询单只股票的详细资讯 | 批量分析自选股的AI早报 |
| **输入参数** | 单个股票代码+日期范围 | 多个股票代码+单个日期 |
| **输出内容** | 原始资讯列表+AI摘要 | 结构化的事件分析+影响评估 |
| **适用场景** | 研究特定股票 | 每日盘前资讯汇总 |
| **分析深度** | 浅层（资讯聚合） | 深层（事件影响分析） |
| **推荐使用** | 个股详情页 | 首页/自选股页面 |

---

## 使用建议

### 场景1：个股详情页
使用**个股资讯查询接口**
```javascript
queryStockNews({
  stockCode: '600519.SH',
  startDate: '2026-02-10',
  endDate: '2026-02-11',
  totalNews: 50
})
```

### 场景2：首页/自选股页面
使用**AI资讯早报接口**
```javascript
generateDailyReport({
  stockList: '600519.SH,000001.SZ,300750.SZ',
  date: '2026-02-11'
})
```

### 场景3：组合使用
先用**AI资讯早报**快速了解全局，再用**个股资讯查询**深入研究感兴趣的股票。

---

## 集成方案更新

### API封装文件
**aity-uni-app-v2/src/api/dify.js**

新增函数：
```javascript
// 生成AI资讯早报
export function generateDailyReport(options) {
  const { stockList, date } = options

  return post(`${DIFY_CONFIG.baseURL}/v1/workflows/run`, {
    inputs: {
      SelfStock: stockList,
      date: date
    },
    response_mode: 'blocking',
    user: DIFY_CONFIG.user
  }, {
    headers: {
      'Authorization': `Bearer app-nu968mbvMTrnAxFe6`
    }
  })
}
```

---

## 后续扩展方向

### 功能增强
1. **定时推送** - 每日早上8点自动生成早报
2. **个性化推荐** - 根据用户持仓定制早报内容
3. **历史回顾** - 查看历史早报记录
4. **事件跟踪** - 跟踪事件后续发展
5. **情绪评分** - 量化市场情绪指标

### 数据关联
1. **关联行情** - 早报事件与当日涨跌幅关联
2. **关联资金** - 早报预测与实际资金流向对比
3. **关联业绩** - 事件对公司业绩的长期影响

---

## 安全注意事项

1. **Token管理**
   - 两个Token分别存储
   - 使用环境变量配置
   - 定期更新Token

2. **请求限流**
   - 单个用户每日限制调用次数
   - 实现请求队列管理
   - 避免并发请求过多

3. **数据缓存**
   - 早报数据缓存24小时
   - 个股资讯缓存1小时
   - 减少不必要的API调用

---

## 附录：完整工具函数库

### 个股资讯相关
```javascript
// 已实现
- queryStockNews()          // 查询个股资讯
- batchQueryStockNews()     // 批量查询
- queryRecentNews()         // 查询最近N小时
- parseNewsResponse()       // 解析响应
- formatNewsSources()       // 格式化来源
- filterNewsByKeyword()     // 关键词过滤
- countNewsTypes()          // 类型统计
```

### AI早报相关（待实现）
```javascript
// 计划中
- generateDailyReport()         // 生成早报
- parseDailyReport()            // 解析早报
- filterEventsByDirection()     // 按方向过滤事件
- countEventsByDirection()      // 统计事件方向
- extractThemes()               // 提取主题
- searchByKeyword()             // 搜索关键词
```

---

## 联系方式

**接口维护：** AI服务团队
**文档更新：** 2026-02-11
**版本号：** v2.0.0
