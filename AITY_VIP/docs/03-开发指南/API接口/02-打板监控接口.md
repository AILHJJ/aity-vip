# 打板功能API接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0.0 |
| **最后更新** | 2026-03-04 |
| **维护人** | 后端开发团队 |
| **接口基础地址** | `http://123.60.27.66:7615/TQLEX` |
| **请求方式** | POST |
| **认证方式** | 无需认证 |
| **Content-Type** | application/json |

---

## 一、接口概览

### 接口分类总览

| 接口名称 | Entry | 功能说明 | 优先级 |
|---------|-------|----------|--------|
| **基础数据模块** |||
| 指数行情 | HQServ.PBCombHQ | 获取上证指数、深证成指等主要指数实时行情 | 高 |
| **涨停板模块** |||
| 涨停板列表 | HQServ.PBXmlBlock | 获取涨停板股票列表，支持连板天梯功能 | 高 |
| **跌停板模块** |||
| 跌停板列表 | HQServ.PBXmlBlock | 获取跌停板股票列表 | 高 |
| **涨停池模块** |||
| 涨停池统计 | HQServ.hq_nlp_app_misc | 获取涨停池统计数据，包含涨跌停标识、排序等 | 中 |
| **跌停池模块** |||
| 跌停池统计 | HQServ.hq_nlp_app_misc | 获取跌停池统计数据 | 中 |
| **强势股模块** |||
| 强势股列表 | HQServ.hq_nlp_app_misc | 获取强势股列表及分析数据 | 中 |
| **弱势股模块** |||
| 弱势股列表 | HQServ.hq_nlp_app_misc | 获取弱势股列表及分析数据 | 中 |
| **市场统计模块** |||
| 市场概览 | HQServ.hq_nlp_misc | 获取市场整体概况、涨跌分布等统计数据 | 高 |
| **异动监控模块** |||
| 异动监控 | HQServ.PBPzxh | 获取市场异动数据，包括板块异动、个股异动等 | 中 |

---

## 二、接口详情

### 模块一：基础数据接口

#### 1. 指数行情接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBCombHQ` |
| **接口说明** | 获取上证指数、深证成指等主要指数的实时行情数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 5秒 |

**请求参数**

```json
{
  "Head": {
    "Target": 0
  },
  "Code": "999999",
  "Setcode": "1"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Head.Target` | Number | 是 | 目标值，默认0 | 0 |
| `Code` | String | 是 | 指数代码 | 999999=上证指数, 399001=深证成指 |
| `Setcode` | String | 是 | 市场代码 | 1=沪市, 0=深市 |

**响应示例**

```json
{
  "code": "999999",
  "setcode": "1",
  "name": "上证指数",
  "close": 3000.00,
  "now": 3050.00,
  "vol": 100000000,
  "EXT_ZF": "1.67"
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `code` | String | 指数代码 | "999999" |
| `setcode` | String | 市场代码 | "1" |
| `name` | String | 指数名称 | "上证指数" |
| `close` | Number | 昨收价 | 3000.00 |
| `now` | Number | 现价 | 3050.00 |
| `vol` | Number | 成交量 | 100000000 |
| `EXT_ZF` | String | 涨跌幅(%) | "1.67" |

**调用示例**

```javascript
async function getIndexQuote(indexCode = '999999', market = '1') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBCombHQ', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Code": indexCode,
      "Setcode": market
    })
  });
  return await response.json();
}

// 使用示例：获取上证指数
const shIndex = await getIndexQuote('999999', '1');
```

---

### 模块二：涨停板接口

#### 2. 涨停板列表接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock` |
| **接口说明** | 获取涨停板股票列表，支持连板天梯功能 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 15秒 |

**请求参数**

```json
{
  "Head": {
    "Target": 0
  },
  "Setcode": "1",
  "Type": "1"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Head.Target` | Number | 是 | 目标值，默认0 | 0 |
| `Setcode` | String | 是 | 市场代码 | 1=沪市, 0=深市 |
| `Type` | String | 是 | 板块类型 | 1=行业板块, 2=涨停板块 |

**响应示例**

```json
{
  "Type": 1,
  "List": [
    {
      "Name": "涨停股票1",
      "Code": "600001",
      "Zaf": 0.1,
      "Open": 10.50,
      "Close": 10.00,
      "Now": 11.00,
      "High": 11.00,
      "Low": 10.00,
      "Vol": 1000000,
      "Amount": 11000000
    }
  ]
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Type` | Number | 板块类型 | 1 |
| `List` | Array | 涨停股票列表 | - |
| `List[].Name` | String | 股票名称 | "涨停股票1" |
| `List[].Code` | String | 股票代码 | "600001" |
| `List[].Zaf` | Number | 涨跌幅 | 0.1 |
| `List[].Open` | Number | 开盘价 | 10.50 |
| `List[].Close` | Number | 昨收价 | 10.00 |
| `List[].Now` | Number | 现价 | 11.00 |
| `List[].High` | Number | 最高价 | 11.00 |
| `List[].Low` | Number | 最低价 | 10.00 |
| `List[].Vol` | Number | 成交量 | 1000000 |
| `List[].Amount` | Number | 成交额 | 11000000 |

**调用示例**

```javascript
async function getLimitUpList(market = '1') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Setcode": market,
      "Type": "1"
    })
  });
  const data = await response.json();
  return data.List || [];
}

// 使用示例：获取沪市涨停板列表
const limitUpList = await getLimitUpList('1');
```

---

### 模块三：跌停板接口

#### 3. 跌停板列表接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock` |
| **接口说明** | 获取跌停板股票列表 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 15秒 |

**请求参数**

```json
{
  "Head": {
    "Target": 0
  },
  "Setcode": "1",
  "Type": "2"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Head.Target` | Number | 是 | 目标值，默认0 | 0 |
| `Setcode` | String | 是 | 市场代码 | 1=沪市, 0=深市 |
| `Type` | String | 是 | 板块类型 | 2=跌停板块 |

**响应示例**

```json
{
  "Type": 2,
  "List": [
    {
      "Name": "跌停股票1",
      "Code": "600002",
      "Zaf": -0.1,
      "Open": 9.50,
      "Close": 10.00,
      "Now": 9.00,
      "High": 9.50,
      "Low": 9.00,
      "Vol": 800000,
      "Amount": 7200000
    }
  ]
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Type` | Number | 板块类型 | 2 |
| `List` | Array | 跌停股票列表 | - |
| `List[].Name` | String | 股票名称 | "跌停股票1" |
| `List[].Code` | String | 股票代码 | "600002" |
| `List[].Zaf` | Number | 涨跌幅 | -0.1 |

**调用示例**

```javascript
async function getLimitDownList(market = '1') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Setcode": market,
      "Type": "2"
    })
  });
  const data = await response.json();
  return data.List || [];
}

// 使用示例：获取沪市跌停板列表
const limitDownList = await getLimitDownList('1');
```

---

### 模块四：涨停池接口

#### 4. 涨停池统计接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc` |
| **接口说明** | 获取涨停池统计数据，包含涨跌停标识、排序等信息 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 20秒 |

**请求参数**

```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "3"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `ReqId` | String | 是 | 请求ID | "1000" |
| `Market` | String | 是 | 市场类型 | 0=全部, 1=沪市, 2=深市 |
| `blockstyle` | String | 是 | 板块样式 | 3=涨停池, 4=跌停池 |

**响应示例**

```json
{
  "Zdt": "0",
  "ZdtOld": "0",
  "ZfRange": "10.00",
  "SortIndex": "1",
  "Page": "1",
  "PageSize": "20",
  "Sort": "Zaf",
  "Desc": "1",
  "modname": "涨停池",
  "name": "涨停股票1",
  "caption": "3天3板",
  "BkCode": "HY001",
  "FilterBkCode": "",
  "Market": "1"
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Zdt` | String | 涨跌停标识 | 0=涨停, 1=跌停 |
| `ZdtOld` | String | 昨日涨跌停标识 | 0=涨停, 1=跌停 |
| `ZfRange` | String | 涨跌幅范围 | "10.00" |
| `SortIndex` | String | 排序索引 | "1" |
| `Page` | String | 页码 | "1" |
| `PageSize` | String | 每页数量 | "20" |
| `Sort` | String | 排序方式 | "Zaf"=涨跌幅 |
| `Desc` | String | 降序排列 | "1"=降序, "0"=升序 |
| `modname` | String | 模块名称 | "涨停池" |
| `name` | String | 股票名称 | "涨停股票1" |
| `caption` | String | 股票说明 | "3天3板" |
| `BkCode` | String | 板块代码 | "HY001" |
| `FilterBkCode` | String | 过滤板块代码 | "" |
| `Market` | String | 市场 | "1"=沪市 |

**调用示例**

```javascript
async function getLimitUpPool(market = '0', page = '1', pageSize = '20') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "ReqId": "1000",
      "Market": market,
      "blockstyle": "3",
      "Page": page,
      "PageSize": pageSize
    })
  });
  return await response.json();
}

// 使用示例：获取全部市场涨停池第一页数据
const limitUpPool = await getLimitUpPool('0', '1', '20');
```

---

### 模块五：跌停池接口

#### 5. 跌停池统计接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc` |
| **接口说明** | 获取跌停池统计数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 20秒 |

**请求参数**

```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "4"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `ReqId` | String | 是 | 请求ID | "1000" |
| `Market` | String | 是 | 市场类型 | 0=全部, 1=沪市, 2=深市 |
| `blockstyle` | String | 是 | 板块样式 | 4=跌停池 |

**响应示例**

```json
{
  "Zdt": "1",
  "ZdtOld": "0",
  "ZfRange": "-10.00",
  "SortIndex": "1",
  "modname": "跌停池",
  "name": "跌停股票1",
  "caption": "首日跌停",
  "Market": "1"
}
```

**字段说明**

字段说明同涨停池接口，主要区别在于：
- `Zdt` = "1" 表示跌停
- `modname` = "跌停池"
- `ZfRange` 为负值

**调用示例**

```javascript
async function getLimitDownPool(market = '0', page = '1', pageSize = '20') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "ReqId": "1000",
      "Market": market,
      "blockstyle": "4",
      "Page": page,
      "PageSize": pageSize
    })
  });
  return await response.json();
}

// 使用示例：获取全部市场跌停池第一页数据
const limitDownPool = await getLimitDownPool('0', '1', '20');
```

---

### 模块六：强势股接口

#### 6. 强势股列表接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc` |
| **接口说明** | 获取强势股列表及分析数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 20秒 |

**请求参数**

```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "1"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `ReqId` | String | 是 | 请求ID | "1000" |
| `Market` | String | 是 | 市场类型 | 0=全部, 1=沪市, 2=深市 |
| `blockstyle` | String | 是 | 板块样式 | 1=强势股, 2=弱势股 |

**响应示例**

```json
{
  "modname": "强势股",
  "name": "强势股票1",
  "caption": "连续上涨",
  "ZfRange": "8.50",
  "Zdt": "0",
  "Market": "1"
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `modname` | String | 模块名称 | "强势股" |
| `name` | String | 股票名称 | "强势股票1" |
| `caption` | String | 股票说明 | "连续上涨" |
| `ZfRange` | String | 涨跌幅范围 | "8.50" |
| `Zdt` | String | 涨跌停标识 | 0=未涨停 |
| `Market` | String | 市场 | "1"=沪市 |

**调用示例**

```javascript
async function getStrongStocks(market = '0', page = '1', pageSize = '20') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "ReqId": "1000",
      "Market": market,
      "blockstyle": "1",
      "Page": page,
      "PageSize": pageSize
    })
  });
  return await response.json();
}

// 使用示例：获取强势股列表
const strongStocks = await getStrongStocks('0', '1', '20');
```

---

### 模块七：弱势股接口

#### 7. 弱势股列表接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc` |
| **接口说明** | 获取弱势股列表及分析数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 20秒 |

**请求参数**

```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "2"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `ReqId` | String | 是 | 请求ID | "1000" |
| `Market` | String | 是 | 市场类型 | 0=全部, 1=沪市, 2=深市 |
| `blockstyle` | String | 是 | 板块样式 | 2=弱势股 |

**响应示例**

```json
{
  "modname": "弱势股",
  "name": "弱势股票1",
  "caption": "连续下跌",
  "ZfRange": "-8.50",
  "Zdt": "0",
  "Market": "1"
}
```

**字段说明**

字段说明同强势股接口，主要区别在于：
- `modname` = "弱势股"
- `caption` = "连续下跌"
- `ZfRange` 为负值

**调用示例**

```javascript
async function getWeakStocks(market = '0', page = '1', pageSize = '20') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "ReqId": "1000",
      "Market": market,
      "blockstyle": "2",
      "Page": page,
      "PageSize": pageSize
    })
  });
  return await response.json();
}

// 使用示例：获取弱势股列表
const weakStocks = await getWeakStocks('0', '1', '20');
```

---

### 模块八：市场统计接口

#### 8. 市场概览接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_misc` |
| **接口说明** | 获取市场整体概况、涨跌分布、成交量统计等数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 10秒 |

**请求参数**

```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "3"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `ReqId` | String | 是 | 请求ID | "1000" |
| `Market` | String | 是 | 市场类型 | 0=全部, 1=沪市, 2=深市 |
| `blockstyle` | String | 是 | 板块样式 | 3=市场统计 |

**响应示例**

```json
{
  "TotalCount": "5000",
  "UpCount": "2500",
  "DownCount": "2000",
  "LimitUpCount": "100",
  "LimitDownCount": "20",
  "Amount": "500000000000",
  "Volume": "300000000",
  "Distribution": [
    {
      "Range": "0-3",
      "Up": "1200",
      "Down": "800"
    },
    {
      "Range": "3-5",
      "Up": "800",
      "Down": "400"
    },
    {
      "Range": "5-7",
      "Up": "400",
      "Down": "200"
    },
    {
      "Range": ">7",
      "Up": "200",
      "Down": "100"
    },
    {
      "Range": "limit",
      "Up": "100",
      "Down": "20"
    }
  ]
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `TotalCount` | String | 总股票数 | "5000" |
| `UpCount` | String | 上涨家数 | "2500" |
| `DownCount` | String | 下跌家数 | "2000" |
| `LimitUpCount` | String | 涨停家数 | "100" |
| `LimitDownCount` | String | 跌停家数 | "20" |
| `Amount` | String | 成交额（元） | "500000000000" |
| `Volume` | String | 成交量 | "300000000" |
| `Distribution` | Array | 涨跌分布数据 | - |
| `Distribution[].Range` | String | 涨跌区间 | "0-3" |
| `Distribution[].Up` | String | 上涨家数 | "1200" |
| `Distribution[].Down` | String | 下跌家数 | "800" |

**涨跌区间说明**
- 0-3: 小幅上涨/下跌（0%-3%）
- 3-5: 中幅上涨/下跌（3%-5%）
- 5-7: 大幅上涨/下跌（5%-7%）
- \>7: 超大幅上涨/下跌（>7%）
- limit: 涨停/跌停

**调用示例**

```javascript
async function getMarketOverview(market = '0') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_misc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "ReqId": "1000",
      "Market": market,
      "blockstyle": "3"
    })
  });
  const data = await response.json();

  // 计算涨跌比
  const upDownRatio = (parseInt(data.UpCount) / parseInt(data.DownCount)).toFixed(2);

  // 转换成交额为亿元
  const amountInYi = (parseFloat(data.Amount) / 1e8).toFixed(2);

  return {
    ...data,
    upDownRatio,
    amountInYi
  };
}

// 使用示例：获取市场概览
const marketOverview = await getMarketOverview('0');
console.log(`涨跌比: ${marketOverview.upDownRatio}`);
console.log(`成交额: ${marketOverview.amountInYi}亿元`);
```

---

### 模块九：异动监控接口

#### 9. 异动监控接口

**基本信息**

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBPzxh` |
| **接口说明** | 获取市场异动数据，包括板块异动、个股异动等 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 10秒 |

**请求参数**

```json
{
  "Head": {
    "Target": 0
  },
  "Type": "2",
  "LastHMS": "0",
  "WantPos": "0",
  "Date": "0"
}
```

**参数说明**

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Head.Target` | Number | 是 | 目标值，默认0 | 0 |
| `Type` | String | 是 | 数据类型 | 2=异动数据 |
| `LastHMS` | String | 是 | 上次查询时间 | 0=从头开始 |
| `WantPos` | String | 是 | 期望位置 | 0=从头获取 |
| `Date` | String | 是 | 日期 | 0=当天 |

**响应示例**

```json
{
  "Type": 1,
  "PzListDate": 20260303,
  "LastAnsPos": 1047,
  "GetNum": 5,
  "List": [
    {
      "SignalType": 8,
      "SignalTime": 930,
      "Name": "精装修",
      "SignalDesc": "高开",
      "Data": 1.51748312,
      "SetCode3": "1",
      "Code1": "002271",
      "Zaf1": 0.0272109229,
      "Name1": "东方雨虹",
      "SetCode2": 1,
      "Code2": "603737",
      "Zaf2": 0.0148340845,
      "Name2": "三棵树",
      "SetCode1": 1,
      "Code3": "002043",
      "Zaf3": 0.0418181866,
      "Name3": "兔 宝 宝"
    }
  ]
}
```

**字段说明**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Type` | Number | 返回数据类型 | 1 |
| `PzListDate` | Number | 数据日期 | 20260303 |
| `LastAnsPos` | Number | 最后位置标识，用于分页查询 | 1047 |
| `GetNum` | Number | 返回数据条数 | 5 |
| `List` | Array | 异动数据列表 | - |
| `List[].SignalType` | Number | 异动类型代码 | 8 |
| `List[].SignalTime` | Number | 异动时间（格式: HHMM） | 930 |
| `List[].Name` | String | 板块/主题名称 | "精装修" |
| `List[].SignalDesc` | String | 异动原因描述 | "高开" |
| `List[].Data` | Number | 板块/主题涨跌幅 | 1.51748312 |
| `List[].SetCode1/2/3` | Number | 市场代码 | 1 |
| `List[].Code1/2/3` | String | 成分股代码 | "002271" |
| `List[].Zaf1/2/3` | Number | 成分股涨跌幅 | 0.0272109229 |
| `List[].Name1/2/3` | String | 成分股名称 | "东方雨虹" |

**异动类型说明**

| SignalType | 说明 |
|------------|------|
| 8 | 板块异动 |

**异动原因说明**

| SignalDesc | 说明 |
|------------|------|
| 高开 | 开盘价高于昨收价 |
| 快速上涨 | 短时间内快速拉升 |
| 突破 | 突破关键价位 |

**调用示例**

```javascript
async function getAbnormalMovements(type = '2', lastHMS = '0', wantPos = '0', date = '0') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBPzxh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Type": type,
      "LastHMS": lastHMS,
      "WantPos": wantPos,
      "Date": date
    })
  });
  const data = await response.json();

  // 格式化异动时间
  const formattedList = data.List.map(item => ({
    ...item,
    formattedTime: `${item.SignalTime.toString().padStart(4, '0').slice(0, 2)}:${item.SignalTime.toString().padStart(4, '0').slice(2, 4)}`,
    stocks: [
      { code: item.Code1, name: item.Name1, zaf: item.Zaf1 },
      { code: item.Code2, name: item.Name2, zaf: item.Zaf2 },
      { code: item.Code3, name: item.Name3, zaf: item.Zaf3 }
    ]
  }));

  return {
    ...data,
    List: formattedList
  };
}

// 使用示例：获取当天异动数据
const abnormalMovements = await getAbnormalMovements('2', '0', '0', '0');
console.log(`获取到 ${abnormalMovements.GetNum} 条异动`);
```

**分页查询示例**

```javascript
// 分页获取异动数据
let lastPos = '0';
let allMovements = [];

while (true) {
  const data = await getAbnormalMovements('2', '0', lastPos, '0');

  if (data.GetNum === 0) break;

  allMovements = allMovements.concat(data.List);
  lastPos = data.LastAnsPos.toString();

  // 避免无限循环
  if (allMovements.length >= 100) break;
}

console.log(`共获取 ${allMovements.length} 条异动数据`);
```

---

## 三、错误码说明

### 常见错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| **网络错误** | 无法连接到服务器 | 检查网络连接，确认服务器地址正确 |
| **参数错误** | 请求参数格式不正确 | 检查JSON格式，确保必填参数已提供 |
| **服务器内部错误** | 服务器处理请求时发生错误 | 稍后重试，联系后端团队 |
| **数据解析错误** | 返回数据格式不符合预期 | 检查返回数据结构，处理异常情况 |
| **请求长度错误** | 请求参数过长 | 检查参数长度，确保符合接口要求 |

### 错误处理示例

```javascript
try {
  const data = await getLimitUpList('1');
  // 处理数据
} catch (error) {
  if (error.response) {
    // 服务器返回错误状态码
    console.error('服务器错误:', error.response.status);
    if (error.response.status === 400) {
      console.error('请求参数错误');
    } else if (error.response.status === 500) {
      console.error('服务器内部错误，请稍后重试');
    }
  } else if (error.request) {
    // 网络错误，没有收到响应
    console.error('网络错误，请检查连接');
  } else {
    // 其他错误
    console.error('错误:', error.message);
  }
  // 使用备用数据或显示错误提示
}
```

---

## 四、数据处理逻辑

### 1. 时间格式化

```javascript
// 将异动时间格式化为 HH:MM
const formatTime = (time) => {
  const timeStr = time.toString().padStart(4, '0');
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
};

// 示例
console.log(formatTime(930));  // "09:30"
console.log(formatTime(1450)); // "14:50"
```

### 2. 成交额单位转换

```javascript
// 将成交额从元转换为亿元
const formatAmount = (amount) => {
  return (parseFloat(amount) / 1e8).toFixed(2);
};

// 示例
console.log(formatAmount("500000000000")); // "5000.00"
```

### 3. 涨跌幅格式化

```javascript
// 将涨跌幅格式化为百分比字符串
const formatChangePercent = (value) => {
  const percent = (parseFloat(value) * 100).toFixed(2);
  return parseFloat(value) >= 0 ? `+${percent}%` : `${percent}%`;
};

// 示例
console.log(formatChangePercent(0.0523));  // "+5.23%"
console.log(formatChangePercent(-0.1));    // "-10.00%"
```

### 4. 涨跌比计算

```javascript
// 计算涨跌比
const calculateUpDownRatio = (upCount, downCount) => {
  if (downCount === 0) return '∞';
  return (upCount / downCount).toFixed(2);
};

// 示例
console.log(calculateUpDownRatio(2500, 1500)); // "1.67"
console.log(calculateUpDownRatio(100, 0));      // "∞"
```

### 5. 板块数据解析

```javascript
// 解析涨停池/跌停池的板块代码
const parseBlockCode = (bkCode) => {
  if (!bkCode) return null;

  const prefix = bkCode.substring(0, 2);
  const blockTypes = {
    'HY': '行业',
    'GN': '概念',
    'DY': '地域',
    'FG': '风格'
  };

  return {
    code: bkCode,
    type: blockTypes[prefix] || '未知',
    name: getBlockName(bkCode) // 需要实现getBlockName函数
  };
};
```

---

## 五、开发优先级

### P0 - 已完成（当前行情中心）

- ✅ 指数行情接口
- ✅ 涨停板列表（连板天梯）
- ✅ 异动监控

### P1 - 高优先级

- [ ] 涨停池/跌停池功能
- [ ] 强股票/弱股票分析
- [ ] 市场概览统计

### P2 - 中优先级

- [ ] 股票搜索功能
- [ ] 板块轮动分析
- [ ] 个股异动关联分析

### P3 - 低优先级

- [ ] WebSocket实时推送
- [ ] 历史数据分析
- [ ] 更多技术指标

---

## 六、变更日志

### v1.0.0 (2026-03-04)

**初始版本**

**新增内容**:
- 📚 创建打板功能API接口文档
- 🎯 整合9个核心接口：
  - 基础数据：指数行情
  - 涨停板：涨停板列表
  - 跌停板：跌停板列表
  - 涨停池：涨停池统计
  - 跌停池：跌停池统计
  - 强势股：强势股列表
  - 弱势股：弱势股列表
  - 市场统计：市场概览
  - 异动监控：异动数据
- 📖 提供完整的接口说明、参数、响应示例和调用示例
- 🔧 添加数据处理逻辑和错误处理建议
- 🏷️ 按功能模块组织接口，便于查找和使用

**文档来源**:
- 原文档：打板功能API接口文档.md
- 设计文档：打板设计文档V1.3_何俊锋_20250306.xlsx

**维护人**: 后端开发团队

---

## 七、参考文档

- 产品设计文档: `打板设计文档V1.3_何俊锋_20250306.xlsx`
- 原始API文档: `打板功能API接口文档.md`
- 金融数据API文档: `01-financial-data-api.md`
- 相关设计: `docs/design/hqinfo.py`

---

## 八、联系方式

如有疑问，请联系后端开发团队。
