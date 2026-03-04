# AI投顾接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0.0 |
| **最后更新** | 2026-03-04 |
| **维护人** | AI服务团队 |
| **接口基础地址** | `http://111.48.74.244:8888/v1/workflows/run` |
| **请求方式** | POST |
| **认证方式** | Bearer Token |
| **Content-Type** | application/json |

---

## 一、接口概览

### 接口分类总览

| 接口名称 | 功能说明 | Token | 优先级 |
|---------|---------|-------|--------|
| **AI资讯模块** ||||
| 个股24小时资讯查询 | 查询单只股票的详细资讯,AI自动整理总结 | app-3yde9NCq0vBW6apenu2jR29H | 高 |
| AI资讯早报生成 | 批量分析自选股的AI早报,包含事件影响分析 | app-nu968mbvMTrnAxFe6 | 高 |
| **AI收评模块** ||||
| AI收评生成 | 生成每日收盘后的市场分析总结 | - | 中 |

---

## 二、接口详情

### 模块一:AI资讯接口

#### 1. 个股24小时资讯查询接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://111.48.74.244:8888/v1/workflows/run` |
| **接口说明** | 查询单只股票在指定时间段内的相关资讯,AI会自动整理和总结 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 1小时 |

**请求头**

| 字段名 | 类型 | 是否必填 | 描述 |
|--------|------|---------|------|
| Authorization | string | 是 | 认证信息,格式:`Bearer app-3yde9NCq0vBW6apenu2jR29H` |
| Content-Type | string | 是 | 请求体类型,固定值:`application/json` |

**请求参数**

```json
{
  "inputs": {
    "setcode_code": "1.000001",
    "startDate": "2026-02-10",
    "endDate": "2026-02-11",
    "qsid": "999",
    "totalNews": 50
  },
  "response_mode": "blocking",
  "user": "aiznt-8888"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `inputs.setcode_code` | String | 是 | 市场代码_证券代码 | 格式:`市场ID.股票代码` |
| `inputs.startDate` | String | 是 | 起始日期 | 格式:`YYYY-MM-DD` |
| `inputs.endDate` | String | 是 | 结束日期 | 格式:`YYYY-MM-DD` |
| `inputs.qsid` | String | 否 | 券商ID | 默认:`999` |
| `inputs.totalNews` | Number | 否 | 资讯条数 | 默认:`100`,范围:1-1000 |
| `response_mode` | String | 是 | 响应模式 | 固定值:`blocking` |
| `user` | String | 是 | 用户标识符 | 例如:`aiznt-8888` |

**setcode_code格式说明**

**格式:** `市场ID.股票代码`

**市场ID对照表:**

| 市场ID | 市场名称 | 代码示例 |
|--------|---------|---------|
| 1 | 上海证券交易所 | 1.600000 |
| 0 | 深圳证券交易所 | 0.000001 |

**常用示例:**

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

**响应示例**

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
          "title": "【风口解读】顺灏股份涨停,11月28日至今涨149.66%",
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

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `code` | Number | 状态码,200表示成功 | 200 |
| `message` | String | 响应消息 | "Success" |
| `data.result` | String | AI整理的资讯摘要(Markdown格式) | "整理的资讯摘要..." |
| `data.sources` | Array | 原始资讯列表 | - |
| `sources[].item` | Object | 单条资讯对象 | - |
| `item.rec_id` | String | 资讯记录ID | "11566828" |
| `item.tableid` | String | 数据表ID | "tb_news_common" |
| `item.type` | String | 资讯类型 | xw=新闻 |
| `item.name` | String | 股票名称 | "顺灏股份" |
| `item.title` | String | 资讯标题 | "【风口解读】顺灏股份涨停..." |
| `item.url` | String | 资讯链接(可能为空) | "" |

**调用示例**

```javascript
async function getStockNews(stockCode, startDate, endDate, totalNews = 50) {
  const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer app-3yde9NCq0vBW6apenu2jR29H',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        setcode_code: stockCode,  // 例如: '1.600519'
        startDate: startDate,      // 例如: '2026-02-10'
        endDate: endDate,          // 例如: '2026-02-11'
        qsid: '999',
        totalNews: totalNews
      },
      response_mode: 'blocking',
      user: 'aiznt-8888'
    })
  });

  const data = await response.json();

  if (data.code === 200) {
    return {
      summary: data.data.result,
      sources: data.data.sources
    };
  } else {
    throw new Error(data.message || '查询失败');
  }
}

// 使用示例:查询贵州茅台最近24小时资讯
const news = await getStockNews('1.600519', '2026-02-10', '2026-02-11');
console.log('AI摘要:', news.summary);
console.log('资讯来源:', news.sources);
```

**cURL示例**

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

---

#### 2. AI资讯早报生成接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://111.48.74.244:8888/v1/workflows/run` |
| **接口说明** | 批量分析自选股的AI早报,包含主题事件、个股事件和影响分析 |
| **更新频率** | 每日一次 |
| **推荐缓存时长** | 24小时 |

**请求头**

| 字段名 | 类型 | 是否必填 | 描述 |
|--------|------|---------|------|
| Authorization | string | 是 | 认证信息,格式:`Bearer app-nu968mbvMTrnAxFe6` |
| Content-Type | string | 是 | 请求体类型,固定值:`application/json` |

**请求参数**

```json
{
  "inputs": {
    "SelfStock": "600519.SH,000001.SZ,300750.SZ",
    "date": "2026-02-11"
  },
  "response_mode": "blocking",
  "user": "aiznt-8888"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `inputs.SelfStock` | String | 是 | 自选股票列表,逗号分隔的股票代码 | 例如:`600519.SH,000001.SZ` |
| `inputs.date` | String | 是 | 指定日期 | 格式:`YYYY-MM-DD` |
| `response_mode` | String | 是 | 响应模式 | 固定值:`blocking` |
| `user` | String | 是 | 用户标识符 | 例如:`aiznt-8888` |

**股票代码格式说明**

**格式:** `股票代码.市场后缀`

**市场后缀对照表:**

| 市场后缀 | 市场名称 | 代码示例 |
|---------|---------|---------|
| .SH | 上海证券交易所 | 600519.SH |
| .SZ | 深圳证券交易所 | 000001.SZ |

**响应示例**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "summary": "【市场回顾】昨日主要指数多数上涨,沪指涨0.23%,深成指涨0.12%,创业板指跌0.25%...",
    "theme_events": [
      {
        "theme": "人工智能",
        "summary": "AI技术持续突破,多领域应用落地加速",
        "impact": "利好AI概念股整体表现",
        "direction": "积极"
      }
    ],
    "stock_events": [
      {
        "summary": "线上线下澄清未布局GEO及数字人营销业务",
        "impact": "该事件属于预期内澄清。短期看,澄清业务边界可能消除市场对其参与热门AI概念的误解,情绪面影响有限;中长期看,明确公司业务聚焦传统数字营销全流程,不涉及AI智能投流、生成式AI创意及智能数字人等前沿领域,对公司基本面无实质性改变,是一次性信息澄清。总体而言,事件影响中性且轻微。",
        "direction": "中性",
        "sources": [
          {
            "issue_date": "2026-01-21 15:21:39",
            "name": "数字人",
            "setcode": "2",
            "code": "920670",
            "title": "线上线下(300959):目前没有布局GEO(生成式引擎优化)相关业务",
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

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `code` | Number | 状态码,200表示成功 | 200 |
| `message` | String | 响应消息 | "Success" |
| `data.summary` | String | AI生成的早报摘要(Markdown格式) | "【市场回顾】..." |
| `data.theme_events` | Array | 主题事件列表 | - |
| `theme_events[].theme` | String | 主题名称 | "人工智能" |
| `theme_events[].summary` | String | 事件摘要 | "AI技术持续突破..." |
| `theme_events[].impact` | String | 影响分析 | "利好AI概念股..." |
| `theme_events[].direction` | String | 方向判断 | "积极"/"中性"/"谨慎" |
| `data.stock_events` | Array | 个股事件列表 | - |
| `stock_events[].summary` | String | 事件摘要 | "线上线下澄清..." |
| `stock_events[].impact` | String | 详细影响分析 | "该事件属于预期内澄清..." |
| `stock_events[].direction` | String | 方向判断 | "积极"/"中性"/"谨慎"/"利空" |
| `stock_events[].sources` | Array | 资讯来源列表 | - |
| `sources[].issue_date` | String | 发布日期 | "2026-01-21 15:21:39" |
| `sources[].name` | String | 股票名称 | "数字人" |
| `sources[].code` | String | 股票代码 | "920670" |
| `sources[].title` | String | 资讯标题 | "线上线下(300959)..." |
| `sources[].url` | String | 资讯链接 | "" |
| `data.date` | String | 生成时间 | "2026-01-22 12:48:51" |

**调用示例**

```javascript
async function generateDailyReport(stockList, date) {
  const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer app-nu968mbvMTrnAxFe6',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        SelfStock: stockList,  // 例如: '600519.SH,000001.SZ,300750.SZ'
        date: date             // 例如: '2026-02-11'
      },
      response_mode: 'blocking',
      user: 'aiznt-8888'
    })
  });

  const data = await response.json();

  if (data.code === 200) {
    return {
      summary: data.data.summary,
      themeEvents: data.data.theme_events,
      stockEvents: data.data.stock_events,
      generateDate: data.data.date
    };
  } else {
    throw new Error(data.message || '生成早报失败');
  }
}

// 使用示例:生成今日早报
const report = await generateDailyReport('600519.SH,000001.SZ,300750.SZ', '2026-02-11');
console.log('早报摘要:', report.summary);
console.log('主题事件:', report.themeEvents);
console.log('个股事件:', report.stockEvents);
```

**cURL示例**

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

---

### 模块二:AI收评接口

#### 3. AI收评生成接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | 待补充 |
| **接口说明** | 生成每日收盘后的市场分析总结 |
| **更新频率** | 每日收盘后 |
| **推荐缓存时长** | 24小时 |
| **开发状态** | 待开发 |

**功能说明**

AI收评功能将包括:
- 当日市场整体表现分析
- 板块表现总结
- 热点个股点评
- 资金流向分析
- 明日市场展望

**开发计划**

该接口正在规划中,预计将在后续版本中提供。

---

## 三、接口对比

### 两个AI资讯接口对比

| 特性 | 个股资讯查询 | AI资讯早报 |
|------|-------------|-----------|
| **Token** | app-3yde9NCq0vBW6apenu2jR29H | app-nu968mbvMTrnAxFe6 |
| **主要功能** | 查询单只股票的详细资讯 | 批量分析自选股的AI早报 |
| **输入参数** | 单个股票代码+日期范围 | 多个股票代码+单个日期 |
| **输出内容** | 原始资讯列表+AI摘要 | 结构化的事件分析+影响评估 |
| **适用场景** | 研究特定股票 | 每日盘前资讯汇总 |
| **分析深度** | 浅层(资讯聚合) | 深层(事件影响分析) |
| **推荐使用** | 个股详情页 | 首页/自选股页面 |
| **更新频率** | 实时 | 每日一次 |
| **推荐缓存时长** | 1小时 | 24小时 |

---

## 四、使用场景

### 场景1:个股详情页

使用**个股资讯查询接口**

```javascript
// 查询贵州茅台最近24小时资讯
getStockNews('1.600519', '2026-02-10', '2026-02-11')
  .then(result => {
    console.log('AI摘要:', result.summary);
    console.log('资讯来源:', result.sources);
  });
```

**适用场景:**
- 查看个股最新动态
- 研究股票走势原因
- 辅助投资决策

### 场景2:首页/自选股页面

使用**AI资讯早报接口**

```javascript
// 生成自选股早报
generateDailyReport('600519.SH,000001.SZ,300750.SZ', '2026-02-11')
  .then(result => {
    console.log('早报摘要:', result.summary);
    console.log('主题事件:', result.themeEvents);
    console.log('个股事件:', result.stockEvents);
  });
```

**适用场景:**
- 每日盘前资讯汇总
- 快速了解市场动态
- 自选股事件跟踪

### 场景3:组合使用

先用**AI资讯早报**快速了解全局,再用**个股资讯查询**深入研究感兴趣的股票。

```javascript
// Step 1: 生成早报,了解全局
const report = await generateDailyReport('600519.SH,000001.SZ', '2026-02-11');

// Step 2: 根据早报中的事件,深入研究感兴趣个股
if (report.stockEvents.length > 0) {
  const interestingStock = report.stockEvents[0];
  const detailNews = await getStockNews(
    interestingStock.sources[0].code,
    '2026-02-10',
    '2026-02-11'
  );
  console.log('详细信息:', detailNews);
}
```

---

## 五、错误码说明

### 常见错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| **网络错误** | 无法连接到服务器 | 检查网络连接,确认服务器地址正确 |
| **400** | 请求参数错误 | 检查inputs参数格式 |
| **401** | 认证失败 | 检查Token是否正确 |
| **403** | 无权限访问 | 联系管理员授权 |
| **429** | 请求过于频繁 | 降低请求频率 |
| **500** | 服务器内部错误 | 稍后重试或联系技术支持 |
| **503** | 服务暂时不可用 | 稍后重试 |

### 错误响应示例

```json
{
  "code": 401,
  "message": "Invalid token",
  "data": null
}
```

### 错误处理示例

```javascript
try {
  const response = await fetch('http://111.48.74.244:8888/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer app-3yde9NCq0vBW6apenu2jR29H',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }

  console.log('资讯摘要:', data.data.result);

} catch (error) {
  console.error('查询失败:', error);

  // 根据错误类型进行处理
  if (error.message.includes('Invalid token')) {
    console.error('认证失败,请检查Token配置');
  } else if (error.message.includes('timeout')) {
    console.error('请求超时,请稍后重试');
  } else {
    console.error('未知错误:', error.message);
  }

  // 显示用户友好的错误提示
  uni.showToast({
    title: '查询失败,请稍后重试',
    icon: 'none'
  });
}
```

---

## 六、数据处理逻辑

### 1. 日期计算

```javascript
// 计算最近N天的日期范围
function getDateRange(days = 1) {
  const endDate = new Date();
  const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

// 使用示例
const { startDate, endDate } = getDateRange(1);  // 最近1天
console.log(startDate, endDate);  // 2026-02-10, 2026-02-11
```

### 2. 股票代码格式转换

```javascript
// 统一股票代码格式
function normalizeStockCode(code, market) {
  // 格式1: 1.600519 -> 600519.SH
  if (code.includes('.')) {
    const [marketId, stockCode] = code.split('.');
    const suffix = marketId === '1' ? 'SH' : 'SZ';
    return `${stockCode}.${suffix}`;
  }

  // 格式2: 600519 (需要market参数)
  if (market) {
    return `${code}.${market}`;
  }

  return code;
}

// 使用示例
console.log(normalizeStockCode('1.600519'));    // 600519.SH
console.log(normalizeStockCode('600519', 'SH')); // 600519.SH
```

### 3. 事件方向统计

```javascript
// 统计事件方向分布
function analyzeEventDirections(stockEvents) {
  const directions = stockEvents.map(event => event.direction);

  return {
    positive: directions.filter(d => d === '积极').length,
    neutral: directions.filter(d => d === '中性').length,
    cautious: directions.filter(d => d === '谨慎').length,
    negative: directions.filter(d => d === '利空').length,
    total: directions.length
  };
}

// 使用示例
const stats = analyzeEventDirections(report.stockEvents);
console.log(`积极事件: ${stats.positive}/${stats.total}`);
console.log(`中性事件: ${stats.neutral}/${stats.total}`);
```

### 4. 资讯来源去重

```javascript
// 去除重复的资讯来源
function deduplicateSources(sources) {
  const seen = new Set();
  return sources.filter(source => {
    const key = `${source.tableid}-${source.rec_id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// 使用示例
const uniqueSources = deduplicateSources(news.sources);
console.log(`去重后资讯数: ${uniqueSources.length}`);
```

---

## 七、性能优化建议

### 1. 请求频率控制

```javascript
// 使用防抖避免频繁请求
const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const debouncedQuery = debounce(async (stockCode) => {
  const news = await getStockNews(stockCode, startDate, endDate);
  return news;
}, 2000);  // 2秒内只执行一次
```

### 2. 数据缓存

```javascript
// 缓存查询结果
const newsCache = new Map();

async function getStockNewsWithCache(stockCode, startDate, endDate) {
  const cacheKey = `${stockCode}-${startDate}-${endDate}`;

  // 检查缓存
  if (newsCache.has(cacheKey)) {
    const cached = newsCache.get(cacheKey);
    // 检查缓存是否过期(1小时)
    if (Date.now() - cached.timestamp < 3600000) {
      console.log('使用缓存数据:', cacheKey);
      return cached.data;
    }
  }

  // 发起请求
  const data = await getStockNews(stockCode, startDate, endDate);

  // 存入缓存
  newsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  return data;
}
```

### 3. 分页加载

```javascript
// 大量资讯时分批加载
async function getStockNewsPaginated(stockCode, startDate, endDate, totalNews = 100) {
  const pageSize = 20;
  const pages = Math.ceil(totalNews / pageSize);
  const allNews = [];

  for (let page = 0; page < pages; page++) {
    const data = await getStockNews(stockCode, startDate, endDate, pageSize);
    allNews.push(...data.sources);

    // 延迟避免请求过快
    if (page < pages - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return allNews;
}
```

### 4. 并行请求

```javascript
// 并行请求多个股票的资讯
async function batchGetStockNews(stockCodes, startDate, endDate) {
  const promises = stockCodes.map(code =>
    getStockNews(code, startDate, endDate)
  );

  const results = await Promise.all(promises);

  return stockCodes.reduce((acc, code, index) => {
    acc[code] = results[index];
    return acc;
  }, {});
}

// 使用示例
const batchNews = await batchGetStockNews(
  ['1.600519', '0.000001', '0.300750'],
  '2026-02-10',
  '2026-02-11'
);
```

---

## 八、安全注意事项

### 1. Token保护

```javascript
// ❌ 不安全:在前端硬编码Token
const TOKEN = 'app-3yde9NCq0vBW6apenu2jR29H';

// ✅ 安全:通过环境变量配置
const TOKEN = import.meta.env.VITE_DIFY_TOKEN;

// ✅ 更安全:通过后端代理转发
async function getStockNewsViaBackend(stockCode, startDate, endDate) {
  const response = await fetch('/api/dify/stock-news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getUserToken()}`  // 用户认证Token
    },
    body: JSON.stringify({
      stockCode,
      startDate,
      endDate
    })
  });
  return await response.json();
}
```

### 2. 参数验证

```javascript
// 验证股票代码格式
function validateStockCode(code) {
  // 格式: 市场ID.股票代码
  const pattern = /^[01]\.\d{6}$/;
  if (!pattern.test(code)) {
    throw new Error('股票代码格式错误,正确格式:市场ID.股票代码');
  }
}

// 验证日期范围
function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start > end) {
    throw new Error('起始日期不能大于结束日期');
  }

  if (end > now) {
    throw new Error('结束日期不能大于当前日期');
  }

  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 30) {
    throw new Error('日期范围不能超过30天');
  }
}

// 使用验证函数
async function getStockNewsValidated(code, startDate, endDate) {
  validateStockCode(code);
  validateDateRange(startDate, endDate);
  return await getStockNews(code, startDate, endDate);
}
```

### 3. 权限控制

```javascript
// 限制用户调用频率
const rateLimiter = new Map();

function checkRateLimit(userId, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // 清除过期记录
  const validRequests = userRequests.filter(
    timestamp => now - timestamp < windowMs
  );

  if (validRequests.length >= maxRequests) {
    throw new Error('请求过于频繁,请稍后重试');
  }

  validRequests.push(now);
  rateLimiter.set(userId, validRequests);
}

// 使用限流
async function getStockNewsWithRateLimit(userId, stockCode, startDate, endDate) {
  checkRateLimit(userId);
  return await getStockNews(stockCode, startDate, endDate);
}
```

---

## 九、集成方案

### 方案A:直接调用

在需要的页面直接调用API,适合简单场景。

```javascript
// pages/stock-detail/stock-detail.vue
import { getStockNews } from '@/api/dify';

async function loadStockNews() {
  const news = await getStockNews('1.600519', '2026-02-10', '2026-02-11');
  // 渲染资讯列表
}
```

### 方案B:通过图灵AI

利用现有的图灵AI功能,让AI自动调用资讯查询接口。

```javascript
// 在AI对话中自然查询
用户: "查询贵州茅台最近24小时的资讯"
系统: 自动识别意图 → 调用Dify接口 → 返回整理后的资讯
```

### 方案C:数据市场模块

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

### 方案D:Vue组件封装

创建可复用的Vue组件。

```vue
<!-- components/StockNews.vue -->
<template>
  <view class="stock-news">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="error" class="error">{{ error }}</view>
    <view v-else>
      <view class="summary">{{ news.summary }}</view>
      <view class="sources">
        <view v-for="(source, index) in news.sources" :key="index" class="source-item">
          <text class="title">{{ source.item.title }}</text>
          <text class="name">{{ source.item.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getStockNews } from '@/api/dify';

export default {
  name: 'StockNews',
  props: {
    stockCode: String,
    startDate: String,
    endDate: String
  },
  data() {
    return {
      news: null,
      loading: false,
      error: null
    };
  },
  async mounted() {
    await this.loadNews();
  },
  methods: {
    async loadNews() {
      this.loading = true;
      this.error = null;

      try {
        this.news = await getStockNews(
          this.stockCode,
          this.startDate,
          this.endDate
        );
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

---

## 十、后续扩展方向

### 功能增强

1. **多股票批量查询** - 一次性查询多只股票资讯
2. **关键词过滤** - 按关键词筛选相关资讯
3. **情感分析** - 分析资讯正负面情绪
4. **资讯分类** - 按公告、新闻、研报等分类
5. **智能摘要** - AI生成更长的深度分析
6. **定时推送** - 每日早上8点自动生成早报
7. **个性化推荐** - 根据用户持仓定制早报内容
8. **历史回顾** - 查看历史早报记录
9. **事件跟踪** - 跟踪事件后续发展
10. **情绪评分** - 量化市场情绪指标

### 数据关联

1. **关联行情数据** - 资讯与K线、涨跌幅关联
2. **关联资金流向** - 分析资讯对资金的影响
3. **关联龙虎榜** - 分析机构动向与资讯的关系
4. **关联业绩** - 事件对公司业绩的长期影响

### 可视化

1. **资讯词云** - 生成高频词云图
2. **时间线** - 按时间轴展示资讯
3. **热点图谱** - 构建资讯关联网络

---

## 十一、常用股票代码速查

| 代码 | 名称 | 市场 | setcode_code | 早报格式 |
|------|------|------|--------------|---------|
| 600519 | 贵州茅台 | SH | 1.600519 | 600519.SH |
| 000001 | 平安银行 | SZ | 0.000001 | 000001.SZ |
| 000002 | 万科A | SZ | 0.000002 | 000002.SZ |
| 600036 | 招商银行 | SH | 1.600036 | 600036.SH |
| 300750 | 宁德时代 | SZ | 0.300750 | 300750.SZ |
| 002594 | 比亚迪 | SZ | 0.002594 | 002594.SZ |
| 601318 | 中国平安 | SH | 1.601318 | 601318.SH |
| 000858 | 五粮液 | SZ | 0.000858 | 000858.SZ |
| 600887 | 伊利股份 | SH | 1.600887 | 600887.SH |
| 300059 | 东方财富 | SZ | 0.300059 | 300059.SZ |

---

## 十二、完整工具函数库

### 个股资讯相关

```javascript
// 已实现
- getStockNews()              // 查询个股资讯
- batchGetStockNews()         // 批量查询
- getStockNewsPaginated()     // 分页查询
- getStockNewsWithCache()     // 带缓存的查询
- deduplicateSources()        // 去除重复来源
- validateStockCode()         // 验证股票代码
- validateDateRange()         // 验证日期范围
```

### AI早报相关

```javascript
// 已实现
- generateDailyReport()           // 生成早报
- analyzeEventDirections()        // 统计事件方向
```

### 待实现

```javascript
// 计划中
- filterEventsByDirection()     // 按方向过滤事件
- countEventsByDirection()      // 统计事件方向
- extractThemes()               // 提取主题
- searchByKeyword()             // 搜索关键词
- sentimentAnalysis()           // 情感分析
```

---

## 十三、变更日志

### v1.0.0 (2026-03-04)

**初始版本**

**新增内容**:
- 📚 创建AI投顾接口文档
- 🎯 整合2个核心接口:
  - 个股24小时资讯查询
  - AI资讯早报生成
- 📖 提供完整的接口说明、参数、响应示例和调用示例
- 🔧 添加数据处理逻辑和错误处理说明
- 🏷️ 按功能模块组织接口,便于查找和使用
- 🔐 添加安全注意事项和性能优化建议
- 🎨 提供多种集成方案和组件封装示例

**文档来源**:
- 原文档: `dify-workflow.md`
- 设计文档: `AI收评.xlsx` (待开发)

**维护人**: AI服务团队

---

## 十四、参考文档

- 原始API文档: `dify-workflow.md`
- 设计文档: `AI收评.xlsx`
- 金融数据API: `01-financial-data-api.md`
- 打板功能API: `02-trading-board-api.md`

---

## 十五、联系方式

如有疑问,请联系AI服务团队。
