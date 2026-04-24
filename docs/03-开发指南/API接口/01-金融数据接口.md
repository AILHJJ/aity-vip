# 金融数据接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **最后更新** | 2026-03-04 |
| **维护人** | 后端开发团队 |
| **接口基础地址** | `http://123.60.27.66:7615/TQLEX` |
| **请求方式** | `POST` |
| **认证方式** | 无需认证 |
| **Content-Type** | `application/json` |

---

## 接口概览

| 接口名称 | Entry | 功能说明 | 优先级 |
|---------|-------|----------|--------|
| 市场概览与涨跌停分布 | HQServ.PBHQInfo | 获取市场整体概况、涨跌停分布、涨幅区间分布 | 高 |
| 行业资金净流入 | HQServ.PBXmlBlock | 获取行业资金净流入数据，按净流入金额排序 | 高 |
| 行业资金净流出 | HQServ.PBXmlBlock | 获取行业资金净流出数据，按净流出金额排序 | 高 |
| 连板股票详细分析（NLP，推荐） | HQServ.hq_nlp_app_misc | 获取连续涨停个股的详细分析数据，包含30个分析指标 | 高 |
| 连板天梯（板块数据） | HQServ.PBXmlBlock | 获取连板天梯基础数据，返回格式为JSON字符串 | 中 |
| 指数行情 | HQServ.IndexQuote | 获取主要指数的实时行情数据 | 高 |
| 综合行情 | HQServ.PBCombHQ | 获取多个指数的实时行情数据，支持自定义返回字段 | 中 |
| 概念板块涨跌幅排行 | HQServ.PBHYStat | 获取概念板块涨幅或跌幅排行前三的数据 | 中 |
| 板块异动 | HQServ.PBPzxh | 获取板块异动数据，包括异动时间、板块名称、异动原因等 | 低 |

---

## 接口详情

### 1. 市场概览与涨跌停分布接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBHQInfo` |
| **接口说明** | 获取市场整体概况、涨跌停分布、涨幅区间分布等数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 10秒 |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "Setcode": "1",
  "Code": "880005",
  "HasHQInfo": "1",
  "BspNum": "5"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Setcode` | String | 是 | 市场代码 | 1=A股 |
| `Code` | String | 是 | 指数代码 | 880005=沪深A股 |
| `HasHQInfo` | String | 是 | 是否包含HQInfo数据 | 1=包含，0=不包含 |
| `BspNum` | String | 是 | 涨跌分布区间数量 | 5=5个区间 |

#### 响应示例

```json
{
  "BspInfo": [
    {
      "BuyV": "1200",
      "SellV": "800",
      "Range": "0-3"
    },
    {
      "BuyV": "800",
      "SellV": "400",
      "Range": "3-5"
    },
    {
      "BuyV": "400",
      "SellV": "200",
      "Range": "5-7"
    },
    {
      "BuyV": "200",
      "SellV": "100",
      "Range": ">7"
    },
    {
      "BuyV": "100",
      "SellV": "20",
      "Range": "limit"
    }
  ],
  "HQInfo": {
    "HQDate": "20260302",
    "HQTime": "150000",
    "MaxP": "4000",
    "Now": "2500",
    "Average": "1500",
    "Amount": "500000000000",
    "Volume": "300000000",
    "TotalBuyv": "100",
    "TotalSellv": "20"
  }
}
```

#### 字段说明

**BspInfo - 涨跌分布信息**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `BspInfo` | Array | 涨跌分布信息数组 | - |
| `BspInfo[].BuyV` | String | 上涨家数 | "1200" |
| `BspInfo[].SellV` | String | 下跌家数 | "800" |
| `BspInfo[].Range` | String | 涨跌区间 | "0-3" |

**区间说明**:
- 0-3: 小幅上涨/下跌
- 3-5: 中幅上涨/下跌
- 5-7: 大幅上涨/下跌
- >7: 超大幅上涨/下跌
- limit: 涨停/跌停

**HQInfo - 市场基础信息**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `HQInfo` | Object | 市场基础信息对象 | - |
| `HQInfo.HQDate` | String | 行情日期 | "20260302" |
| `HQInfo.HQTime` | String | 行情时间 | "150000" |
| `HQInfo.MaxP` | String | 总股票数 | "4000" |
| `HQInfo.Now` | String | 上涨家数 | "2500" |
| `HQInfo.Average` | String | 下跌家数 | "1500" |
| `HQInfo.Amount` | String | 成交额（元） | "500000000000" |
| `HQInfo.Volume` | String | 成交量 | "300000000" |
| `HQInfo.TotalBuyv` | String | 涨停家数 | "100" |
| `HQInfo.TotalSellv` | String | 跌停家数 | "20" |

#### 调用示例

```javascript
async function getMarketOverview() {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBHQInfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Setcode": "1",
      "Code": "880005",
      "HasHQInfo": "1",
      "BspNum": "5"
    })
  });
  return await response.json();
}
```

---

### 2. 行业资金净流入接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock` |
| **接口说明** | 获取行业资金净流入数据，按净流入金额排序 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 15秒 |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "Code": "HY,1,0,3",
  "Blockid": "MStock_ZLJX_ADDE_R"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Code` | String | 是 | 板块类型和查询条件 | HY,1,0,3 (HY=行业,1=按净流入降序,0=实时,3=前3名) |
| `Blockid` | String | 是 | 板块ID | MStock_ZLJX_ADDE_R=资金净流入 |

#### 响应示例

```json
{
  "Blockstyle": "3",
  "Blockid": "MStock_ZLJX_ADDE_R",
  "Totalrow": 1,
  "Num": 30,
  "Buf": "[[\"0\",\"HY004\",\"半导体\",\"0\",\"0\",\"0\",\"1500000000\"],[\"0\",\"HY005\",\"新能源\",\"0\",\"0\",\"0\",\"1200000000\"],[\"0\",\"HY006\",\"医药\",\"0\",\"0\",\"0\",\"900000000\"]]"
}
```

#### 字段说明

**响应字段**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Blockstyle` | String | 板块风格 | "3" |
| `Blockid` | String | 板块ID | "MStock_ZLJX_ADDE_R" |
| `Totalrow` | Number | 总行数 | 1 |
| `Num` | Number | 板块数量 | 30 |
| `Buf` | String | 行业资金数据（JSON字符串） | 见响应示例 |

**Buf字段解析**

```json
[
  ["0","HY004","半导体","0","0","0","1500000000"],
  ["0","HY005","新能源","0","0","0","1200000000"]
]
```

| 位置 | 说明 | 示例值 |
|------|------|--------|
| 0 | 市场类型 | 0=深市，1=沪市 |
| 1 | 行业代码 | "HY004" |
| 2 | 行业名称 | "半导体" |
| 3-5 | 预留字段 | "0" |
| 6 | 资金净流入金额（元） | "1500000000" |

#### 调用示例

```javascript
async function getIndustryInflow() {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Code": "HY,1,0,3",
      "Blockid": "MStock_ZLJX_ADDE_R"
    })
  });
  const data = await response.json();
  // 解析Buf字段
  if (data.Buf) {
    return JSON.parse(data.Buf).map(item => ({
      market: item[0] === '0' ? '深市' : '沪市',
      code: item[1],
      name: item[2],
      netInflow: parseFloat(item[6]) || 0
    }));
  }
  return [];
}
```

---

### 3. 行业资金净流出接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock` |
| **接口说明** | 获取行业资金净流出数据，按净流出金额排序 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 15秒 |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "Code": "HY,1,0,3",
  "Blockid": "MStock_ZLJX_ADDE"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Code` | String | 是 | 板块类型和查询条件 | HY,1,0,3 (HY=行业,1=按净流出降序,0=实时,3=前3名) |
| `Blockid` | String | 是 | 板块ID | MStock_ZLJX_ADDE=资金净流出 |

#### 响应示例

```json
{
  "Blockstyle": "3",
  "Blockid": "MStock_ZLJX_ADDE",
  "Totalrow": 1,
  "Num": 30,
  "Buf": "[[\"0\",\"HY001\",\"银行\",\"0\",\"0\",\"0\",\"1000000000\"],[\"0\",\"HY002\",\"房地产\",\"0\",\"0\",\"0\",\"800000000\"],[\"0\",\"HY003\",\"钢铁\",\"0\",\"0\",\"0\",\"600000000\"]]"
}
```

#### 字段说明

**响应字段**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Blockstyle` | String | 板块风格 | "3" |
| `Blockid` | String | 板块ID | "MStock_ZLJX_ADDE" |
| `Totalrow` | Number | 总行数 | 1 |
| `Num` | Number | 板块数量 | 30 |
| `Buf` | String | 行业资金数据（JSON字符串） | 见响应示例 |

**Buf字段解析**

```json
[
  ["0","HY001","银行","0","0","0","1000000000"],
  ["0","HY002","房地产","0","0","0","800000000"]
]
```

| 位置 | 说明 | 示例值 |
|------|------|--------|
| 0 | 市场类型 | 0=深市，1=沪市 |
| 1 | 行业代码 | "HY001" |
| 2 | 行业名称 | "银行" |
| 3-5 | 预留字段 | "0" |
| 6 | 资金净流出金额（元） | "1000000000" |

#### 调用示例

```javascript
async function getIndustryOutflow() {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Code": "HY,1,0,3",
      "Blockid": "MStock_ZLJX_ADDE"
    })
  });
  const data = await response.json();
  // 解析Buf字段
  if (data.Buf) {
    return JSON.parse(data.Buf).map(item => ({
      market: item[0] === '0' ? '深市' : '沪市',
      code: item[1],
      name: item[2],
      netOutflow: parseFloat(item[6]) || 0
    }));
  }
  return [];
}
```

---

### 4. 连板股票详细分析接口（NLP，推荐）

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc` |
| **接口说明** | 获取连续涨停个股的详细分析数据，包含30个分析指标 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 20秒 |
| **推荐程度** | ⭐⭐⭐⭐⭐ |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "AppType": "misc"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `AppType` | String | 是 | 应用类型 | misc=综合分析（默认），news=新闻分析，hot=热点分析 |

#### 响应示例

```json
{
  "返回结果": [
    {
      "N001": "证券名称",
      "N002": "证券代码",
      "N003": "0",
      "N004": "0",
      "N005": "10.50",
      "N006": "+5.23",
      "N007": "2026-03-02 09:30:00",
      "N008": "",
      "N009": "3天3板",
      "N010": "2",
      "N011": "0",
      "N012": "龙头",
      "N013": "1000000",
      "N014": "85%",
      "N015": "2026-03-02 09:31:00",
      "N016": "",
      "N017": "2026-03-02 09:32:00",
      "N018": "",
      "N019": "5",
      "N020": "0",
      "N021": "1500000",
      "N022": "0",
      "N023": "50000000",
      "N024": "8.5",
      "N025": "12.5%",
      "N026": "2.3",
      "N027": "1000000000",
      "N028": "50000000",
      "N029": "30000000",
      "N030": "热点概念"
    }
  ]
}
```

#### 字段说明

| 字段名 | 字段类型 | 字段说明 | 示例值 |
|--------|----------|----------|--------|
| `N001` | string | 证券名称 | "证券名称" |
| `N002` | string | 证券代码 | "证券代码" |
| `N003` | string | 次新标识：0=默认，1=次新 | "0" |
| `N004` | string | 市场类型：0=深市，1=沪市 | "0" |
| `N005` | string | 现价 | "10.50" |
| `N006` | string | 涨幅 | "+5.23" |
| `N007` | string | 最近一次涨停时间 | "2026-03-02 09:30:00" |
| `N008` | string | 最近一次跌停时间 | "" |
| `N009` | string | 几天几板 | "3天3板" |
| `N010` | string | 连续涨停天数 | "2" |
| `N011` | string | 连续跌停天数 | "0" |
| `N012` | string | 板型：龙头/中军/跟风/妖股 | "龙头" |
| `N013` | string | 封单额（元） | "1000000" |
| `N014` | string | 封成比 | "85%" |
| `N015` | string | 首次涨停时间 | "2026-03-02 09:31:00" |
| `N016` | string | 首次跌停时间 | "" |
| `N017` | string | 最后涨停打开时间 | "2026-03-02 09:32:00" |
| `N018` | string | 最后跌停打开时间 | "" |
| `N019` | string | 首次涨停后涨停打开次数 | "5" |
| `N020` | string | 首次跌停后跌停打开次数 | "0" |
| `N021` | string | 最高涨停封单额（元） | "1500000" |
| `N022` | string | 最高跌停封单额（元） | "0" |
| `N023` | string | 涨停金额（元） | "50000000" |
| `N024` | string | 涨速（5分钟） | "8.5" |
| `N025` | string | 换手率 | "12.5%" |
| `N026` | string | 量比 | "2.3" |
| `N027` | string | 总金额（元） | "1000000000" |
| `N028` | string | 资金净流入（元） | "50000000" |
| `N029` | string | 主力资金净流入（元） | "30000000" |
| `N030` | string | 涨停原因 | "热点概念" |

#### 调用示例

```javascript
async function getContinuousLimitDetail(appType = 'misc') {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.hq_nlp_app_misc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "AppType": appType
    })
  });
  const data = await response.json();
  // 处理返回数据
  if (data['返回结果'] && Array.isArray(data['返回结果'])) {
    return data['返回结果'].map(item => ({
      name: item.N001,
      code: item.N002,
      isNew: item.N003 === '1',
      market: item.N004 === '0' ? '深市' : '沪市',
      currentPrice: parseFloat(item.N005) || 0,
      changePercent: parseFloat(item.N006) || 0,
      lastLimitUpTime: item.N007,
      lastLimitDownTime: item.N008,
      boardInfo: item.N009,
      consecutiveLimitUpDays: parseInt(item.N010) || 0,
      consecutiveLimitDownDays: parseInt(item.N011) || 0,
      boardType: item.N012,
      sealAmount: parseInt(item.N013) || 0,
      sealRatio: parseFloat(item.N014) || 0,
      firstLimitUpTime: item.N015,
      firstLimitDownTime: item.N016,
      lastLimitUpOpenTime: item.N017,
      lastLimitDownOpenTime: item.N018,
      firstLimitUpOpenCount: parseInt(item.N019) || 0,
      firstLimitDownOpenCount: parseInt(item.N020) || 0,
      maxLimitUpSealAmount: parseInt(item.N021) || 0,
      maxLimitDownSealAmount: parseInt(item.N022) || 0,
      limitUpAmount: parseInt(item.N023) || 0,
      limitUpSpeed: parseFloat(item.N024) || 0,
      turnoverRate: parseFloat(item.N025) || 0,
      volumeRatio: parseFloat(item.N026) || 0,
      totalAmount: parseInt(item.N027) || 0,
      netInflow: parseInt(item.N028) || 0,
      mainNetInflow: parseInt(item.N029) || 0,
      limitUpReason: item.N030
    }));
  }
  return [];
}
```

#### 优势

- 数据字段丰富，包含30个分析指标
- 数据格式清晰，易于解析
- 支持多种应用类型（综合分析、新闻分析、热点分析）
- 适合详细分析和深度研究

---

### 5. 连板天梯接口（板块数据）

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock` |
| **接口说明** | 获取连板天梯基础数据，返回格式为JSON字符串，需要二次解析 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 20秒 |
| **推荐程度** | ⭐⭐⭐ |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "Blocktype": "0",
  "Blockstyle": "3",
  "Blockid": "Stock_SCHIGH"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Blocktype` | String | 是 | 板块类型 | 0=股票 |
| `Blockstyle` | String | 是 | 板块风格 | 3=连板 |
| `Blockid` | String | 是 | 板块ID | Stock_SCHIGH=连板高度 |

#### 响应示例

```json
{
  "Blockstyle": "3",
  "Blockid": "Stock_SCHIGH",
  "Totalrow": 1,
  "Num": 286,
  "Buf": "[[\"3\",\"1\"],[\"0\",\"002843\",\"深证成指\"],...]"
}
```

#### 字段说明

**响应字段**

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Blockstyle` | Number | 板块风格 | "3" |
| `Blockid` | String | 板块ID | "Stock_SCHIGH" |
| `Totalrow` | Number | 总行数 | 1 |
| `Num` | Number | 板块数量 | 286 |
| `Buf` | String | 股票板块数据（JSON字符串） | 见响应示例 |

**Buf字段解析**

```json
[
  ["3","1"],
  ["0","002843","深证成指"]
]
```

| 位置 | 说明 | 示例值 |
|------|------|--------|
| 0 | 市场类型 | 0=深市，1=沪市 |
| 1 | 股票代码 | "002843" |
| 2 | 股票名称 | "深证成指" |

#### 调用示例

```javascript
async function getContinuousLimitBlock() {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBXmlBlock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Blocktype": "0",
      "Blockstyle": "3",
      "Blockid": "Stock_SCHIGH"
    })
  });
  const data = await response.json();
  // 解析Buf字段
  if (data.Buf) {
    const parsedBlocks = JSON.parse(data.Buf);
    return parsedBlocks.map(block => ({
      market: block[0] === '0' ? '深市' : '沪市',
      code: block[1],
      name: block[2]
    }));
  }
  return [];
}
```

#### 对比说明

| 对比项 | NLP应用接口（推荐） | 板块数据接口 |
|--------|---------------------|--------------|
| **接口地址** | HQServ.hq_nlp_app_misc | HQServ.PBXmlBlock |
| **数据格式** | 键值对（N001-N030） | JSON数组字符串 |
| **字段数量** | 30个分析指标 | 3个基础字段 |
| **数据丰富度** | 高（包含资金流向、涨停分析等） | 低（仅基础信息） |
| **解析难度** | 低（直接映射） | 中（需要二次解析） |
| **适用场景** | 详细分析、深度研究 | 快速查询、列表展示 |
| **推荐程度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

### 6. 指数行情接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.IndexQuote` |
| **接口说明** | 获取主要指数的实时行情数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 5秒 |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "Code": "000001.SZ,399001.SZ,000300.SH,000016.SH,000688.SH,000905.SH"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `Code` | String | 是 | 指数代码列表，逗号分隔 |

**常用指数代码**:

| 代码 | 名称 |
|------|------|
| 000001.SZ | 上证指数 |
| 399001.SZ | 深证成指 |
| 000300.SH | 沪深300 |
| 000016.SH | 上证50 |
| 000688.SH | 科创50 |
| 000905.SH | 中证500 |

#### 响应示例

```json
{
  "Head": {
    "Target": 0,
    "Time": "2026-02-11 09:30:00"
  },
  "Data": [
    {
      "Code": "000001.SZ",
      "Name": "上证指数",
      "Price": 3245.67,
      "Change": 12.34,
      "ChangePct": 0.38,
      "Volume": 123456789000,
      "Amount": 987654321000,
      "High": 3250.12,
      "Low": 3230.45,
      "Open": 3238.90,
      "LastClose": 3233.33
    }
  ]
}
```

#### 字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Code` | String | 指数代码 | "000001.SZ" |
| `Name` | String | 指数名称 | "上证指数" |
| `Price` | Number | 最新价 | 3245.67 |
| `Change` | Number | 涨跌额 | 12.34 |
| `ChangePct` | Number | 涨跌幅(%) | 0.38 |
| `Volume` | Number | 成交量 | 123456789000 |
| `Amount` | Number | 成交额 | 987654321000 |
| `High` | Number | 最高价 | 3250.12 |
| `Low` | Number | 最低价 | 3230.45 |
| `Open` | Number | 开盘价 | 3238.90 |
| `LastClose` | Number | 昨收价 | 3233.33 |

#### 调用示例

```javascript
async function getIndexQuote(codes = ['000001.SZ', '399001.SZ']) {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.IndexQuote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Code": codes.join(',')
    })
  });
  const data = await response.json();
  return data.Data || [];
}
```

---

### 7. 综合行情接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBCombHQ` |
| **接口说明** | 获取多个指数的实时行情数据，支持自定义返回字段 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 5秒 |

#### 请求参数

```json
{
  "Head": {
    "Target": 0
  },
  "WantCol": ["VOL", "NOW", "CLOSE"],
  "Setcode": ["1", "0", "1", "0", "1", "2"],
  "Code": ["999999", "399001", "000300", "399006", "000688", "899050"]
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `WantCol` | Array | 否 | 需要返回的列 | VOL=成交量，NOW=现价，CLOSE=收盘价，OPEN=开盘价，HIGH=最高价，LOW=最低价 |
| `Setcode` | Array | 是 | 市场代码数组 | 1=沪市，0=深市，2=其他市场 |
| `Code` | Array | 是 | 指数代码数组 | 999999=上证指数，399001=深证成指，000300=沪深300，399006=创业板指，000688=科创50，899050=北证50 |

#### 响应示例

```json
{
  "code": "999999",
  "setcode": "1",
  "name": "上证指数",
  "close": 3000.00,
  "now": 3050.00,
  "vol": 100000000,
  "EXT_ZF": "1.67",
  "open": 3020.00,
  "high": 3060.00,
  "low": 3010.00
}
```

#### 字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `code` | String | 指数代码 | "999999" |
| `setcode` | String | 市场代码 | "1" |
| `name` | String | 指数名称 | "上证指数" |
| `close` | Number | 昨收价 | 3000.00 |
| `now` | Number | 现价 | 3050.00 |
| `vol` | Number | 成交量 | 100000000 |
| `EXT_ZF` | String | 涨跌幅(%) | "1.67" |
| `open` | Number | 开盘价 | 3020.00 |
| `high` | Number | 最高价 | 3060.00 |
| `low` | Number | 最低价 | 3010.00 |

#### 调用示例

```javascript
async function getCombinedQuote(setcodes, codes, wantCol = ['VOL', 'NOW', 'CLOSE']) {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBCombHQ', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "WantCol": wantCol,
      "Setcode": setcodes,
      "Code": codes
    })
  });
  return await response.json();
}

// 使用示例
getCombinedQuote(
  ['1', '0', '1'],  // 沪市、深市、沪市
  ['999999', '399001', '000300'],  // 上证指数、深证成指、沪深300
  ['VOL', 'NOW', 'CLOSE']  // 成交量、现价、收盘价
);
```

---

### 8. 概念板块涨跌幅排行接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBHYStat` |
| **接口说明** | 获取概念板块涨幅或跌幅排行前三的数据 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 15秒 |

#### 请求参数

**按涨幅排序**:

```json
{
  "Head": {
    "CharSet": "1",
    "Target": 0,
    "SSOToken": "string"
  },
  "Num": "3",
  "Blocktype": "0",
  "Desc_order": "0",
  "Iszangsu": "0",
  "Pos": "-1",
  "Needtotalnum": "2"
}
```

**按跌幅排序**:

```json
{
  "Head": {
    "CharSet": "1",
    "Target": 0,
    "SSOToken": "string"
  },
  "Num": "3",
  "Blocktype": "0",
  "Desc_order": "1",
  "Iszangsu": "0",
  "Pos": "-1",
  "Needtotalnum": "2"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Head.CharSet` | String | 是 | 字符集 | 1=UTF-8 |
| `Head.Target` | Number | 是 | 目标值 | 0 |
| `Head.SSOToken` | String | 否 | 认证令牌 | - |
| `Num` | String | 是 | 返回数量 | 3=前三 |
| `Blocktype` | String | 是 | 板块类型 | 0=概念板块 |
| `Desc_order` | String | 是 | 排序方式 | 0=升序，1=降序 |
| `Iszangsu` | String | 是 | 是否包含藏股 | 0=不包含 |
| `Pos` | String | 是 | 起始位置 | -1=从头开始 |
| `Needtotalnum` | String | 是 | 是否需要总数 | 2=需要 |

#### 响应示例

```json
{
  "Setcode": 1,
  "Code": "999999",
  "num": 146,
  "zstddeDataList": [
    {
      "Value": 14628266000,
      "Rate": [
        {
          "value": [
            8114,
            7140,
            3927,
            3726
          ]
        }
      ]
    }
  ]
}
```

#### 字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Setcode` | Number | 市场代码 | 1 |
| `Code` | String | 股票市场 | "999999" |
| `num` | Number | 数量 | 146 |
| `zstddeDataList` | Array | 每分钟资金流向数据 | - |
| `zstddeDataList[].Value` | Number | 总数据(额,量或单数) | 14628266000 |
| `zstddeDataList[].Rate` | Array | 4个数组：特大/大/中/小单 | - |
| `zstddeDataList[].Rate[].value` | Array | 4个数据：买入/卖出/主买/主卖 | [8114,7140,3927,3726] |

#### 调用示例

```javascript
async function getBlockStat(descOrder = 0) {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBHYStat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": {
        "CharSet": "1",
        "Target": 0,
        "SSOToken": "string"
      },
      "Num": "3",
      "Blocktype": "0",
      "Desc_order": descOrder.toString(),
      "Iszangsu": "0",
      "Pos": "-1",
      "Needtotalnum": "2"
    })
  });
  return await response.json();
}
```

---

### 9. 板块异动接口

#### 基本信息

| 项目 | 内容 |
|------|------|
| **接口地址** | `http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBPzxh` |
| **接口说明** | 获取板块异动数据，包括异动时间、板块名称、异动原因等 |
| **更新频率** | 实时 |
| **推荐缓存时长** | 10秒 |

#### 请求参数

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

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `Head.Target` | Number | 是 | 目标值 | 0 |
| `Type` | String | 是 | 数据类型 | 2=异动数据 |
| `LastHMS` | String | 是 | 上次查询时间 | 0=从头开始 |
| `WantPos` | String | 是 | 期望位置 | 0=从头获取 |
| `Date` | String | 是 | 日期 | 0=当天 |

#### 响应示例

```json
{
  "Type": 1,
  "PzListDate": 20230904,
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

#### 字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `Type` | Number | 数据类型 | 1 |
| `PzListDate` | Number | 数据日期 | 20230904 |
| `LastAnsPos` | Number | 上次回答位置 | 1047 |
| `GetNum` | Number | 获取数量 | 5 |
| `List` | Array | 异动数据列表 | - |
| `List[].SignalType` | Number | 信号类型 | 8 |
| `List[].SignalTime` | Number | 异动时间 | 930 |
| `List[].Name` | String | 板块名称 | "精装修" |
| `List[].SignalDesc` | String | 异动原因 | "高开" |
| `List[].Data` | Number | 异动数据 | 1.51748312 |
| `List[].Code1` | String | 股票代码1 | "002271" |
| `List[].Zaf1` | Number | 涨幅1 | 0.0272109229 |
| `List[].Name1` | String | 股票名称1 | "东方雨虹" |
| `List[].Code2` | String | 股票代码2 | "603737" |
| `List[].Zaf2` | Number | 涨幅2 | 0.0148340845 |
| `List[].Name2` | String | 股票名称2 | "三棵树" |
| `List[].Code3` | String | 股票代码3 | "002043" |
| `List[].Zaf3` | Number | 涨幅3 | 0.0418181866 |
| `List[].Name3` | String | 股票名称3 | "兔 宝 宝" |

#### 调用示例

```javascript
async function getBlockAbnormal() {
  const response = await fetch('http://123.60.27.66:7615/TQLEX?Entry=HQServ.PBPzxh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "Head": { "Target": 0 },
      "Type": "2",
      "LastHMS": "0",
      "WantPos": "0",
      "Date": "0"
    })
  });
  return await response.json();
}
```

---

## 错误码说明

### 常见错误

| 错误类型 | HTTP状态码 | 说明 | 处理建议 |
|----------|-----------|------|----------|
| **网络错误** | - | 无法连接到服务器 | 检查网络连接，确认服务器地址正确 |
| **参数错误** | 400 | 请求参数格式不正确 | 检查JSON格式，确保必填参数已提供 |
| **服务器内部错误** | 500 | 服务器处理请求时发生错误 | 稍后重试，联系后端团队 |
| **数据解析错误** | - | 返回数据格式不符合预期 | 检查返回数据结构，处理异常情况 |
| **请求长度错误** | 413 | 请求参数过长 | 检查参数长度，确保符合接口要求 |

### 错误处理示例

```javascript
try {
  const data = await getMarketOverview();
  // 处理数据
} catch (error) {
  if (error.response) {
    // 服务器返回错误状态码
    if (error.response.status === 400) {
      console.error('请求参数错误');
    } else if (error.response.status === 500) {
      console.error('服务器内部错误');
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

## 数据处理逻辑

### 1. 市场概览数据处理

**时间格式化**:
```javascript
// 将 HQDate 和 HQTime 转换为可读格式
const dateStr = "20260302";
const timeStr = "150000";
const formattedDateTime = `${dateStr.slice(0,4)}年${dateStr.slice(4,6)}月${dateStr.slice(6,8)}日 ${timeStr.slice(0,2)}:${timeStr.slice(2,4)}:${timeStr.slice(4,6)}`;
// 结果: "2026年03月02日 15:00:00"
```

**成交额单位转换**:
```javascript
const amount = "500000000000";
const amountInYi = (parseFloat(amount) / 1e8).toFixed(2);
// 结果: "5000.00亿元"
```

**涨跌比计算**:
```javascript
const upCount = 2500;
const downCount = 1500;
const leadRatio = (upCount / downCount).toFixed(2);
// 结果: "1.67"
```

### 2. 涨跌分布数据处理

```javascript
// 提取各区间涨跌家数
const bspInfo = data.BspInfo || [];
const ranges = {
  up_0_3: parseInt(bspInfo[0]?.BuyV) || 0,
  down_0_3: parseInt(bspInfo[0]?.SellV) || 0,
  up_3_5: parseInt(bspInfo[1]?.BuyV) || 0,
  down_3_5: parseInt(bspInfo[1]?.SellV) || 0,
  up_5_7: parseInt(bspInfo[2]?.BuyV) || 0,
  down_5_7: parseInt(bspInfo[2]?.SellV) || 0,
  up_7_plus: parseInt(bspInfo[3]?.BuyV) || 0,
  down_7_plus: parseInt(bspInfo[3]?.SellV) || 0,
  limit_up: parseInt(bspInfo[4]?.BuyV) || 0,
  limit_down: parseInt(bspInfo[4]?.SellV) || 0
};

// 涨跌停数据处理（双来源校验）
const limitUpFromBsp = ranges.limit_up;
const limitUpFromHq = parseInt(data.HQInfo?.TotalBuyv) || 0;
const limitUp = limitUpFromBsp > 0 ? limitUpFromBsp : limitUpFromHq;
```

### 3. 资金流向数据处理

```javascript
// 解析Buf字段并转换单位
const inflowData = JSON.parse(data.Buf);
const top3Inflow = inflowData.slice(0, 3).map(item => ({
  market: item[0] === '0' ? '深市' : '沪市',
  code: item[1],
  name: item[2],
  netInflow: (parseFloat(item[6]) / 1e8).toFixed(2) // 转换为亿元
}));
```

### 4. 连板数据处理

**NLP接口数据解析**:
```javascript
const nlpData = data['返回结果'] || [];
const formattedData = nlpData.map(item => ({
  name: item.N001,
  code: item.N002,
  currentPrice: parseFloat(item.N005) || 0,
  changePercent: parseFloat(item.N006) || 0,
  consecutiveLimitUpDays: parseInt(item.N010) || 0,
  boardType: item.N012,
  netInflow: (parseInt(item.N028) / 1e8).toFixed(2) // 转换为亿元
}));
```

**板块接口数据解析**:
```javascript
const blockData = JSON.parse(data.Buf);
const formattedData = blockData.map(item => ({
  market: item[0] === '0' ? '深市' : '沪市',
  code: item[1],
  name: item[2]
}));
```

---

## 数据缓存策略

### 缓存配置

```javascript
const CACHE_CONFIG = {
  MARKET_OVERVIEW: {
    duration: 10000,     // 10秒
    key: 'market_overview_cache'
  },
  INDUSTRY_FLOW: {
    duration: 15000,     // 15秒
    key: 'industry_flow_cache'
  },
  CONTINUOUS_LIMIT: {
    duration: 20000,     // 20秒
    key: 'continuous_limit_cache'
  },
  INDEX_QUOTE: {
    duration: 5000,      // 5秒
    key: 'index_quote_cache'
  },
  BLOCK_ABNORMAL: {
    duration: 10000,     // 10秒
    key: 'block_abnormal_cache'
  }
};
```

### 缓存实现

```javascript
const getWithCache = async (cacheKey, fetchFn, duration) => {
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < duration) {
      console.log('使用缓存数据:', cacheKey);
      return data;
    }
  }

  const result = await fetchFn();
  localStorage.setItem(cacheKey, JSON.stringify({
    data: result,
    timestamp: Date.now()
  }));

  return result;
};

// 使用示例
const marketData = await getWithCache(
  CACHE_CONFIG.MARKET_OVERVIEW.key,
  getMarketOverview,
  CACHE_CONFIG.MARKET_OVERVIEW.duration
);
```

---

## 性能优化建议

### 1. 并行请求

```javascript
// 同时请求多个接口，减少等待时间
const [marketData, inflowData, outflowData, limitData] = await Promise.all([
  getMarketOverview(),
  getIndustryInflow(),
  getIndustryOutflow(),
  getContinuousLimitDetail()
]);
```

### 2. 请求防抖

```javascript
import { debounce } from 'lodash-es';

const debouncedGetIndexQuote = debounce(getIndexQuote, 500);

// 在输入框中使用
<input @input="debouncedGetIndexQuote" />
```

### 3. 虚拟滚动

```javascript
import { useVirtualList } from '@vueuse/core';

const { list: virtualList, containerProps, wrapperProps } = useVirtualList({
  data: stockList,
  itemHeight: 50
});
```

### 4. 数据压缩

```javascript
// 优化数据传输大小
const compressedData = {
  // 只返回必要的字段
  items: data.map(item => ({
    n: item.name,
    c: item.code,
    p: item.price
  }))
};
```

### 5. 错误重试

```javascript
const retryFetch = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## 测试建议

### 1. 单元测试

```javascript
describe('Financial Data API', () => {
  test('should parse NLP data correctly', () => {
    const mockData = {
      '返回结果': [
        {
          N001: '测试股票',
          N002: '000001',
          N005: '10.50',
          N006: '+5.23',
          N010: '3'
        }
      ]
    };

    const parsed = mockData['返回结果'].map(item => ({
      name: item.N001,
      code: item.N002,
      currentPrice: parseFloat(item.N005) || 0,
      changePercent: parseFloat(item.N006) || 0,
      consecutiveLimitUpDays: parseInt(item.N010) || 0
    }));

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('测试股票');
    expect(parsed[0].currentPrice).toBe(10.50);
    expect(parsed[0].changePercent).toBe(5.23);
    expect(parsed[0].consecutiveLimitUpDays).toBe(3);
  });

  test('should parse market overview data correctly', () => {
    const mockData = {
      BspInfo: [
        { BuyV: "1200", SellV: "800" }
      ],
      HQInfo: {
        HQDate: "20260302",
        MaxP: "4000",
        Now: "2500"
      }
    };

    expect(mockData.BspInfo[0].BuyV).toBe("1200");
    expect(mockData.HQInfo.MaxP).toBe("4000");
  });
});
```

### 2. 集成测试

- 测试完整的数据获取流程
- 验证数据解析逻辑
- 测试错误处理
- 测试性能和响应时间

---

## 变更日志

### v1.0 (2026-03-04)

**初始版本**:
- 整合所有金融数据接口到统一文档
- 包含9个核心接口：市场概览、资金流向、连板天梯、指数行情等
- 提供详细的接口说明、参数、响应示例和调用示例
- 添加数据处理逻辑和缓存策略
- 提供性能优化建议和测试方案

**合并来源**:
- 连板天梯接口文档.md
- 金融行情数据接口文档.md
- 金融数据接口综合文档.md
- 金融数据接口最终文档.md

---

## 参考文档

- 产品设计文档: `打板设计文档V1.3_何俊锋_20250306.xlsx`
- 参考代码: `d:\your-mcp-proxy\AITY_VIP\docs\design\hqinfo.py`
- 相关接口: `API接口说明-提示词管理.md`

---

## 联系方式

如有疑问，请联系后端开发团队。
