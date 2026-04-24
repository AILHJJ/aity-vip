# NLPSE.StockSelect 接口调用排查文档

## 概述

**接口名称**: `NLPSE.StockSelect`
**功能**: 自然语言股票筛选接口
**日志文件**: `C:\Users\DELL\Desktop\20260310143903\log\taapi.log`
**编码**: GB2312/GBK

---

## 调用统计

| 统计项 | 值 |
|--------|-----|
| 调用次数 | **1 次** |
| 调用时间 | 14:38:02.344 |
| 线程ID | tid:455 |

---

## 完整调用链路

### 1. 前置条件 - 用户配置数据获取

**时间**: `14:38:02.342`
**行号**: 3144-3147

```
14:38:02.342 [T]找到作业 CTAJob_InetTQL, 0x0x1240bca68, 0x0x123acf448
14:38:02.342 [T]Job CTAJob_InetTQL, Option len=33
14:38:02.342 [T]{"Length": "445","AttachLog": ""}
14:38:02.342 [T]Job CTAJob_InetTQL, Data len=445
14:38:02.342 [T][[0,"",1,"",""],["DataID","DataType","Title","Explain","Content","DetailType","Application","CloudDate","TotalCount","Version","AvgScore","QSID","PhoneNum","StorageType","DeleteFlag","Nick","otherCharParam","intParam"],[],["74878293a28f4da794efd56397baa1ec","11","涨停板1","涨停板","{\"Name\":\"涨停板1\",\"xgInfo\":{\"question\":\"涨停板\",\"RANG\":\"AG\"},\"xgType\":\"2\"}","2","0","2026-03-10 13:36:41","0","1","0.0","","","","0","","","1"]]
```

**用户配置数据解析**:
```json
{
  "DataID": "74878293a28f4da794efd56397baa1ec",
  "DataType": "11",
  "Title": "涨停板1",
  "Explain": "涨停板",
  "Content": {
    "Name": "涨停板1",
    "xgInfo": {
      "question": "涨停板",
      "RANG": "AG"
    },
    "xgType": "2"
  },
  "DetailType": "2",
  "Application": "0",
  "CloudDate": "2026-03-10 13:36:41",
  "TotalCount": "0",
  "Version": "1",
  "AvgScore": "0.0",
  "intParam": "1"
}
```

---

### 2. NLPSE.StockSelect 请求

**时间**: `14:38:02.344`
**行号**: 3148-3152

#### 请求头信息
```
行 3148: 14:38:02.344 [T]找到作业 CTAJob_InetTQL, 0x0x1240b4398, 0x0x12924e438, tid:455
行 3149: 14:38:02.344 [T]Job CTAJob_InetTQL, Option len=31
行 3150: 14:38:02.344 [T]NLPSE.StockSelect {"RIR": "1"}
行 3151: 14:38:02.344 [T]Job CTAJob_InetTQL, Data len=89
```

#### 请求体 (Data)
```
行 3152: 14:38:02.344 [T][{"message":"涨停板","screen_type":1,"TDXID":"R25041409274911531561DPTIT","forward":"1"}]
```

#### 请求参数详解

| 参数 | 类型 | 值 | 说明 |
|------|------|-----|------|
| message | string | "涨停板" | 用户输入的自然语言查询 |
| screen_type | int | 1 | 屏幕类型 (1=手机端) |
| TDXID | string | "R25041409274911531561DPTIT" | 用户唯一标识 |
| forward | string | "1" | 转发标志 |

#### 请求 Option 参数
```json
{
  "RIR": "1"
}
```
- `RIR`: 可能表示 "Return Immediate Result" 或类似的即时返回标志

---

### 3. 中间调用 - UBA 客户端操作信息上报

**时间**: `14:38:02.365`
**行号**: 3153-3158

```
14:38:02.365 [T]找到作业 CTAJob_InetTQL, 0x0x1240bca68, 0x0x123ad0988, tid:456
14:38:02.365 [T]Job CTAJob_InetTQL, Option len=20
14:38:02.365 [T]UBA:client_op_info
14:38:02.365 [T]Job CTAJob_InetTQL, Data len=436
14:38:02.365 [T]x... (二进制数据)
```

> **说明**: 这是用户行为分析(UBA)的数据上报，与 StockSelect 接口并行执行。

---

### 4. NLPSE.StockSelect 响应 (中间结果)

**时间**: `14:38:02.442`
**行号**: 3159-3163

```
14:38:02.442 [T]找到作业 CTAJob_InetTQL, 0x0x1240b4398, 0x0x12924e438
14:38:02.442 [T]Job CTAJob_InetTQL, Option len=77
14:38:02.442 [T]{"RI": "58576C01","ContentType": "text\/json","Length": "76","AttachLog": ""}
14:38:02.442 [T]Job CTAJob_InetTQL, Data len=76
14:38:02.442 [T][[0,"",1,"58576C01",""],["nlpse_id","result"],[],["7615336599328461023",""]]
```

#### 响应解析

**响应头**:
```json
{
  "RI": "58576C01",           // Request ID - 请求唯一标识
  "ContentType": "text/json", // 内容类型
  "Length": "76",             // 数据长度
  "AttachLog": ""             // 附加日志
}
```

**响应体**:
```json
{
  "nlpse_id": "7615336599328461023",  // NLP 处理任务ID
  "result": ""                         // 初始为空，后续通过 NLPQuery 获取
}
```

---

### 5. NLPSE.NLPCheckDelete 检查

**时间**: `14:38:02.748`
**行号**: 3168-3172

```
14:38:02.748 [T]找到作业 CTAJob_InetTQL, 0x0x1240b4398, 0x0x12924af18, tid:457
14:38:02.748 [T]Job CTAJob_InetTQL, Option len=40
14:38:02.748 [T]NLPSE.NLPCheckDelete {"RI": "58576C01"}
14:38:02.748 [T]Job CTAJob_InetTQL, Data len=78
14:38:02.748 [T][{"screen_type":1,"op_flag":1,"forward":"1","nlpse_id":"7615336599328461023"}]
```

#### 请求参数
```json
{
  "screen_type": 1,
  "op_flag": 1,
  "forward": "1",
  "nlpse_id": "7615336599328461023"
}
```

---

### 6. NLPSE.NLPCheckDelete 响应 (NLP 解析结果)

**时间**: `14:38:02.854`
**行号**: 3173-3182

```
14:38:02.853 [T]找到作业 CTAJob_InetTQL, 0x0x1240b4398, 0x0x12924af18
14:38:02.853 [T]Job CTAJob_InetTQL, Option len=61
14:38:02.853 [T]{"ContentType": "text\/json","Length": "527","AttachLog": ""}
14:38:02.854 [T]Job CTAJob_InetTQL, Data len=527
14:38:02.854 [T][[0,"",1,"58576C01",""],["result"],[],["{\"R\": \"OP\",\"T\": \"智能选股综合窗\",\"I\": \"涨停板\",\"CFN\": \"DESC\",\"KEY\": \"涨速\",\"IP\": \"223.104.122.58\",\"screen_type\": 1,\"sys_type\": 2,\"forward\": \"\",\"RANG\": \"AG\",\"op_id\": \"R25041409274911531561DPTIT\",\"check\": \"0\",\"BK\": \"\",\"rang_message\": \"\",\"uuid\": \"8c871746-e339-4a45-ae80-93ac8e7ad1e0\",\"ARG\": 100,\"dataId\": \"54a8bc9c8f2d0790a5af3c3ee0ea100d\",\"func_id\": \"7615336599060246672\",\"question_rang\": 0,\"MATCH\": 100,\"NUM\": 100}"]]
```

#### NLP 解析结果详解

```json
{
  "R": "OP",                    // 操作类型 (OP = Open/打开)
  "T": "智能选股综合窗",          // 目标窗口/功能
  "I": "涨停板",                 // 用户原始输入
  "CFN": "DESC",                // 排序方向 (DESC = 降序)
  "KEY": "涨速",                // 排序关键字 ← 核心字段
  "IP": "223.104.122.58",       // 客户端IP
  "screen_type": 1,             // 屏幕类型
  "sys_type": 2,                // 系统类型
  "forward": "",                // 转发标志
  "RANG": "AG",                 // 范围 (AG = A股)
  "op_id": "R25041409274911531561DPTIT",  // 操作ID
  "check": "0",                 // 检查标志
  "BK": "",                     // 板块
  "rang_message": "",           // 范围消息
  "uuid": "8c871746-e339-4a45-ae80-93ac8e7ad1e0",  // UUID
  "ARG": 100,                   // 参数/返回数量
  "dataId": "54a8bc9c8f2d0790a5af3c3ee0ea100d",    // 数据ID
  "func_id": "7615336599060246672",                // 功能ID
  "question_rang": 0,           // 问题范围
  "MATCH": 100,                 // 匹配度 (100%)
  "NUM": 100                    // 返回数量
}
```

---

### 7. NLPSE.NLPQuery 数据查询 (分页1)

**时间**: `14:38:02.860`
**行号**: 3183-3186

```
14:38:02.860 [T]找到作业 CTAJob_InetTQL, 0x0x1240b4398, 0x0x12924bf08, tid:458
14:38:02.860 [T]Job CTAJob_InetTQL, Option len=34
14:38:02.860 [T]NLPSE.NLPQuery {"RI": "58576C01"}
14:38:02.860 [T]Job CTAJob_InetTQL, Data len=112
14:38:02.860 [T][{"forward":"1","timestamps":0,"nlpse_id":"7615336599328461023","COUNT":50,"op_flag":1,"screen_type":1,"POS":0}]
```

#### 请求参数
```json
{
  "forward": "1",
  "timestamps": 0,
  "nlpse_id": "7615336599328461023",
  "COUNT": 50,        // 每页数量
  "op_flag": 1,
  "screen_type": 1,
  "POS": 0            // 起始位置 (第1页)
}
```

---

### 8. NLPSE.NLPQuery 响应 (第1页数据)

**时间**: `14:38:02.947`
**行号**: 3210-3211

```
14:38:02.947 [T]{"ContentType": "text\/json","Length": "4538","AttachLog": ""}
14:38:02.947 [T]Job CTAJob_InetTQL, Data len=4538
14:38:02.947 [T][[0,"",50,"58576C01","50"],["POS","market","sec_code","sec_name","now_price","chg","涨幅(%)<br>2026.03.100#","涨速<br>2026.03.10","成交量(手)<br>2026.03.10","换手率(%)<br>2026.03.10","5日均量占比<br>2026.03.10"],["","","","","2|0|0","2|0|0","1|9|1","0|9|1","0|9|1","0|9|1","0|9|1"],[...50条股票数据...]]
```

**返回**: 第 1-50 条股票数据

---

### 9. NLPSE.NLPQuery 数据查询 (分页2)

**时间**: `14:38:02.949`
**行号**: 3212-3216

```
14:38:02.949 [T][{"forward":"1","timestamps":0,"nlpse_id":"7615336599328461023","COUNT":50,"op_flag":1,"screen_type":1,"POS":50}]
```

#### 请求参数
```json
{
  "forward": "1",
  "timestamps": 0,
  "nlpse_id": "7615336599328461023",
  "COUNT": 50,
  "op_flag": 1,
  "screen_type": 1,
  "POS": 50           // 起始位置 (第2页)
}
```

---

### 10. NLPSE.NLPQuery 响应 (第2页数据)

**时间**: `14:38:03.058`
**行号**: 3221

```
14:38:03.058 [T]{"ContentType": "text\/json","Length": "4572","AttachLog": ""}
14:38:03.058 [T]Job CTAJob_InetTQL, Data len=4572
14:38:03.058 [T][[0,"",50,"58576C01","100"],[...字段定义...],[...50条股票数据...]]
```

**返回**: 第 51-100 条股票数据

---

### 11. NLPSE.NLPQuery 数据查询 (分页3)

**时间**: `14:38:03.063`
**行号**: 3222-3226

```
14:38:03.063 [T][{"forward":"1","timestamps":0,"nlpse_id":"7615336599328461023","COUNT":50,"op_flag":1,"screen_type":1,"POS":100}]
```

---

### 12. NLPSE.NLPQuery 响应 (空数据 - 查询结束)

**时间**: `14:38:03.155`
**行号**: 3257-3258

```
14:38:03.155 [T]{"ContentType": "text\/json","Length": "282","AttachLog": ""}
14:38:03.155 [T]Job CTAJob_InetTQL, Data len=282
14:38:03.155 [T][[0,"",0,"58576C01",""],["POS","market",...],[...],[]]
```

**返回**: 空数据，表示已查询完毕

---

## 接口调用时序图

```
时间线          操作
────────────────────────────────────────────────────────────
14:38:02.342   [前置] 获取用户配置数据
     │
14:38:02.344   [请求] NLPSE.StockSelect
     │              message="涨停板"
     │
14:38:02.365   [并行] UBA:client_op_info 上报
     │
14:38:02.442   [响应] StockSelect 中间结果
     │              nlpse_id="7615336599328461023"
     │
14:38:02.748   [请求] NLPSE.NLPCheckDelete
     │
14:38:02.854   [响应] NLP 解析结果
     │              KEY="涨速" (排序键)
     │              MATCH=100
     │
14:38:02.860   [请求] NLPQuery (POS=0, COUNT=50)
     │
14:38:02.947   [响应] 返回第 1-50 条
     │
14:38:02.949   [请求] NLPQuery (POS=50, COUNT=50)
     │
14:38:03.058   [响应] 返回第 51-100 条
     │
14:38:03.063   [请求] NLPQuery (POS=100, COUNT=50)
     │
14:38:03.155   [响应] 空数据 (查询结束)
────────────────────────────────────────────────────────────
总耗时: 约 813ms
```

---

## 接口性能分析

| 阶段 | 开始时间 | 结束时间 | 耗时 |
|------|----------|----------|------|
| StockSelect 请求到中间响应 | 14:38:02.344 | 14:38:02.442 | **98ms** |
| NLP 解析处理 | 14:38:02.442 | 14:38:02.854 | **412ms** |
| 数据查询(第1页) | 14:38:02.860 | 14:38:02.947 | **87ms** |
| 数据查询(第2页) | 14:38:02.949 | 14:38:03.058 | **109ms** |
| 数据查询(第3页-空) | 14:38:03.063 | 14:38:03.155 | **92ms** |
| **总耗时** | 14:38:02.344 | 14:38:03.155 | **811ms** |

---

## 关键日志行号索引

| 行号 | 内容 | 类型 |
|------|------|------|
| 3144-3147 | 用户配置数据获取 | 前置 |
| **3148-3152** | **NLPSE.StockSelect 请求** | **请求** |
| 3159-3163 | StockSelect 中间响应 | 响应 |
| 3168-3182 | NLP 解析结果 (KEY=涨速) | 响应 |
| 3183-3211 | NLPQuery 第1页 | 请求/响应 |
| 3212-3221 | NLPQuery 第2页 | 请求/响应 |
| 3222-3258 | NLPQuery 第3页 (空) | 请求/响应 |

---

## 排查建议

### 1. 如果接口无响应

- 检查行 3159-3163 是否有中间响应
- 检查 `nlpse_id` 是否正确生成

### 2. 如果 NLP 解析错误

- 检查行 3182 的 NLP 解析结果
- 重点查看 `KEY` 字段是否正确
- 检查 `MATCH` 值是否为 100

### 3. 如果数据为空

- 检查行 3211、3221 的 `Data len` 是否为 0
- 检查 NLP 解析的 `RANG` 字段是否正确

### 4. 如果分页异常

- 检查 `POS` 和 `COUNT` 参数
- 检查是否有空响应（行 3258）

---

## 相关接口

| 接口 | 功能 | 调用时机 |
|------|------|----------|
| NLPSE.StockSelect | 自然语言股票筛选 | 用户输入查询 |
| NLPSE.NLPCheckDelete | 检查/删除 NLP 任务 | StockSelect 之后 |
| NLPSE.NLPQuery | 查询 NLP 结果数据 | 分页获取数据 |
| UBA:client_op_info | 用户行为上报 | 并行执行 |

---

*文档生成时间: 2026-03-10*
*日志来源: C:\Users\DELL\Desktop\20260310143903\log\taapi.log*
