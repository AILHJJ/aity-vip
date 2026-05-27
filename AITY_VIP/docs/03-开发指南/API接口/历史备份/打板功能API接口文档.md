# 打板功能API接口文档

**文档版本**: V1.0
**最后更新**: 2026-03-03
**数据来源**: 打板设计文档V1.3_何俊锋_20250306.xlsx

---

## 接口概览

本文档记录了打板功能涉及的所有外部API接口，用于后续功能开发参考。

### 接口分类
1. **基础数据接口** - 指数行情、板块信息等
2. **涨停板接口** - 涨停板列表、连板天梯等
3. **跌停板接口** - 跌停板列表
4. **涨停池接口** - 涨停池统计
5. **跌停池接口** - 跌停池统计
6. **强股票接口** - 强势股列表

7. **弱股票接口** - 弱势股列表
8. **市场统计接口** - 市场概览数据

9. **异动监控接口** - 害异动数据

---

## 1. 匇数行情接口

### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.PBCombHQ`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "Head": {
    "Target": 0
  },
  "Code": "999999",
  "Setcode": "1"
}
```

### 参数说明
- `Head.Target`: 目标值，默认0
- `Code`: 指数代码 (如999999=上证指数)
- `Setcode`: 市场代码 (1=沪市， 0=深市)

### 返回数据示例
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

### 返回字段说明
- `code`: 指数代码
- `setcode`: 市场代码
- `name`: 指数名称
- `close`: 昨收价
- `now`: 现价
- `vol`: 成交量
- `EXT_ZF`: 涨跌幅(%)

### 使用场景
- 获取上证指数、深证成指、创业板指等主要指数的实时行情

---

## 2. 涨停板接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.PBXmlBlock`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "Head": {
    "Target": 0
  },
  "Setcode": "1",
  "Type": "1"
}
```

### 参数说明
- `Head.Target`: 目标值，默认0
- `Setcode`: 市场代码 (1=沪市, 0=深市)
- `Type`: 板块类型 (1=行业板块)

### 返回数据示例
```json
{
  "Type": 1,
  "List": [
    {
      "Name": "涨停板1",
      "Code": "600001",
      "Zaf": 0.1
      // ... 其他字段
    }
  ]
}
```

### 使用场景
- 获取涨停板股票列表
- 连板天梯功能

---

## 3. 跌停板接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.PBXmlBlock`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "Head": {
    "Target": 0
  },
  "Setcode": "1",
  "Type": "2"
}
```

### 参数说明
- `Head.Target`: 目标值，默认0
- `Setcode`: 市场代码
- `Type`: 板块类型 (2=跌停板块)

### 使用场景
- 获取跌停板股票列表

---

## 4. 涨停池接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.hq_nlp_app_misc`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "3"
}
```

### 参数说明
- `ReqId`: 请求ID
- `Market`: 市场类型 (0=全部)
- `blockstyle`: 板块样式 (3=涨停池)

### 返回字段说明
- `Zdt`: 涨跌停标识 (0=涨停)
- `ZdtOld`: 昨日涨跌停标识
- `ZfRange`: 涨跌幅范围
- `SortIndex`: 排序索引

- `Page`: 页码
- `PageSize`: 每页数量
- `Sort`: 排序方式
- `Desc`: 降序排列
- `modname`: 模块名称

- `name`: 股票名称
- `caption`: 股票说明

- `BkCode`: 板块代码
- `FilterBkCode`: 过滤板块代码

- `Market`: 市场

### 使用场景
- 获取涨停池股票统计
- 涨停池分析

---

## 5. 跌停池接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.hq_nlp_app_misc`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "4"
}
```

### 参数说明
- `blockstyle`: 板块样式 (4=跌停池)
- 其他参数同涨停池接口

### 使用场景
- 获取跌停池股票统计
- 跌停池分析

---

## 6. 强股票接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.hq_nlp_app_misc`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "1"
}
```

### 参数说明
- `blockstyle`: 板块样式 (1=强股票)
- 其他参数同涨停池接口

### 使用场景
- 获取强势股列表
- 强势股分析

---

## 7. 弱股票接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.hq_nlp_app_misc`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "2"
}
```

### 参数说明
- `blockstyle`: 板块样式 (2=弱股票)
- 其他参数同涨停池接口

### 使用场景
- 获取弱势股列表
- 弱势股分析

---

## 8. 市场统计接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.hq_nlp_misc`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
```json
{
  "ReqId": "1000",
  "Market": "0",
  "blockstyle": "3"
}
```

### 返回字段说明
- 返回市场统计数据
- 包含涨跌分布、成交量统计等

### 使用场景
- 获取市场概览数据
- 市场情绪分析

---

## 9. 异动监控接口
### 接口信息
- **接口地址**: `/TQLEX?Entry=HQServ.PBPzxh`
- **请求方法**: POST
- **Content-Type**: application/json

### 请求参数
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

### 参数说明
- `Head.Target`: 目标值，默认0
- `Type`: 数据类型 (2=异动数据)
- `LastHMS`: 上次查询时间 (0=从头开始)
- `WantPos`: 期望位置 (0=从头获取)
- `Date`: 日期 (0=当天)

### 返回数据示例
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

### 返回字段说明
- `Type`: 返回数据类型
- `PzListDate`: 数据日期
- `LastAnsPos`: 最后位置标识，用于分页查询
- `GetNum`: 返回数据条数
- `List`: 异动数据列表
  - `SignalType`: 异动类型代码
  - `SignalTime`: 异动时间（格式: HHMM)
  - `Name`: 板块/主题名称
  - `SignalDesc`: 异动原因描述
  - `Data`: 板块/主题涨跌幅
  - `SetCode1/2/3`: 市场代码
  - `Code1/2/3`: 成分股代码
  - `Zaf1/2/3`: 成分股涨跌幅
  - `Name1/2/3`: 成分股名称

### 异动类型说明
| SignalType | 说明 |
|------------|------|
| 8 | 板块异动 |

### 异动原因说明
| SignalDesc | 说明 |
|------------|------|
| 高开 | 开盘价高于昨收价 |
| 快速上涨 | 短时间内快速拉升 |

### 使用场景
- 实时监控市场异动
- 异动推送提醒
- 异动历史查询
- 板块异动分析

- 个股异动关联分析

---

## 开发优先级

### P0 - 已完成 (当前行情中心)
- ✅ 指数行情接口
- ✅ 连板天梯(基于涨停板接口)

- ✅ 行业资金流向(市场统计接口)

- ✅ 涨跌分布(市场统计接口)

- ✅ 市场概览(市场统计接口)

- ✅ 异动监控(异动监控接口)

### P1 - 高优先级
- [ ] 涨停池/跌停池功能
- [ ] 强股票/弱股票分析
- [ ] 自选股功能集成

- [ ] 股票搜索功能

### P2 - 中优先级
- [ ] 板块轮动分析
- [ ] 个股异动关联分析
- [ ] 分时图/K线图

- [ ] 自动刷新机制

### P3 - 低优先级
- [ ] WebSocket实时推送
- [ ] 历史数据分析
- [ ] 更多技术指标

