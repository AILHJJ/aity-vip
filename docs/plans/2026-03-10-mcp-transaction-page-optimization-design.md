# MCP消费流水页面优化设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 创建日期 | 2026-03-10 |
| 设计目标 | 优化通达信MCP控制台的消费流水页面,提升用户体验和信息展示效率 |
| 目标用户 | 机构投资者(多业务组/多密钥场景) |
| 参考对象 | OpenAI Usage Dashboard、Anthropic Console |

---

## 一、设计背景

### 1.1 当前问题

**现有消费流水页面存在以下问题:**
1. 统计卡片中的"总调用次数"不够实用,用户更关注当期数据
2. 表格缺少"密钥名称"列,无法区分不同业务组的消耗
3. 筛选器功能单一,无法按密钥/API类型精准筛选
4. 整体信息密度可优化,减少视觉噪音

### 1.2 设计目标

1. **简化信息展示** - 只保留用户真正关心的核心数据
2. **支持多业务组管理** - 通过"密钥名称"区分不同部门/项目的消耗
3. **提升筛选效率** - 增加密钥和API类型筛选,快速定位问题
4. **保持简洁风格** - 参考大模型token管理页面,避免过度设计

---

## 二、设计方案

### 2.1 页面结构概览

```
┌──────────────────────────────────────────────────────────────────┐
│  消费流水                                                          │
│  查看每次API调用的详细记录                                          │
├──────────────────────────────────────────────────────────────────┤
│  [积分余额: 45,678] [本月消耗: 5,678] [本月调用: 892次]             │
├──────────────────────────────────────────────────────────────────┤
│  [全部时间▼] [全部密钥▼] [全部API▼] [导出]                         │
├──────────────────────────────────────────────────────────────────┤
│  时间       | API名称            | 密钥名称   | 消耗积分 | 剩余积分 │
│  14:30:25   | tdx_wenda_quotes   | 量化交易组 | -120    | 45,678  │
│  14:28:15   | PBHQInfo_quotes    | 投研分析组 | -85     | 45,798  │
│  14:25:42   | glossary_query     | 客户服务组 | -45     | 45,883  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 核心改动点

| 改动项 | 原设计 | 新设计 | 理由 |
|--------|--------|--------|------|
| **统计卡片3** | 总调用次数 | 本月调用次数 | 用户更关注当期数据 |
| **表格列数** | 4列 | 5列(+密钥名称) | 支持多业务组场景 |
| **筛选器** | 仅时间筛选 | 时间+密钥+API | 提升筛选精度 |
| **筛选器样式** | 平铺按钮 | 下拉选择器 | 节省空间,简化交互 |

---

## 三、详细设计

### 3.1 统计卡片区

#### 卡片1: 积分余额

```html
<div class="stat-card">
  <div class="stat-label">积分余额</div>
  <div class="stat-value">45,678</div>
  <div class="stat-note">
    <i class="fas fa-infinity"></i> 永不过期
  </div>
</div>
```

**数据字段:**
- 显示值: 当前可用积分总数
- 格式: 千分位分隔(如 45,678)
- 说明: "永不过期"(保持原有特性)

---

#### 卡片2: 本月消耗

```html
<div class="stat-card">
  <div class="stat-label">本月消耗</div>
  <div class="stat-value">5,678</div>
  <div class="stat-change">
    <i class="fas fa-arrow-up"></i> 12% 较上月
  </div>
</div>
```

**数据字段:**
- 显示值: 本月累计消耗积分
- 格式: 千分位分隔
- 趋势: 与上月对比(↑/↓百分比)
- 颜色: 上升趋势用绿色,下降用红色

---

#### 卡片3: 本月调用次数 ⭐ 新增

```html
<div class="stat-card">
  <div class="stat-label">本月调用次数</div>
  <div class="stat-value">892</div>
  <div class="stat-note">
    <i class="fas fa-info-circle"></i> 平均 30次/天
  </div>
</div>
```

**数据字段:**
- 显示值: 本月API调用总次数
- 格式: 千分位分隔
- 说明: 计算日均调用次数(总次数/本月已过天数)

**计算逻辑:**
```javascript
const daysInMonth = new Date().getDate(); // 本月已过天数
const avgPerDay = Math.round(totalCalls / daysInMonth);
```

---

### 3.2 筛选工具栏

#### 筛选器1: 时间范围

```html
<select class="filter-select">
  <option value="all">全部时间</option>
  <option value="today">今天</option>
  <option value="week">本周</option>
  <option value="month">本月</option>
  <option value="custom">自定义</option>
</select>
```

**交互行为:**
- 切换选项: 立即重新加载表格数据
- 自定义: 弹出日期范围选择器
- 默认值: "全部时间"

---

#### 筛选器2: 密钥名称 ⭐ 新增

```html
<select class="filter-select">
  <option value="all">全部密钥</option>
  <option value="key_001">量化交易组</option>
  <option value="key_002">投研分析组</option>
  <option value="key_003">客户服务组</option>
  ...
</select>
```

**数据来源:**
- 从API密钥管理页面获取所有密钥列表
- 显示密钥名称(key_name),值为密钥ID(key_id)

**交互行为:**
- 切换选项: 立即重新加载表格数据
- 统计卡片数据: 同步更新为选中密钥的消耗数据
- 默认值: "全部密钥"

---

#### 筛选器3: API名称

```html
<select class="filter-select">
  <option value="all">全部API</option>
  <option value="tdx_wenda_quotes">tdx_wenda_quotes</option>
  <option value="PBHQInfo_quotes">PBHQInfo_quotes</option>
  <option value="glossary_query">glossary_query</option>
  ...
</select>
```

**数据来源:**
- 从后端获取所有可用的API工具列表
- 显示API名称(api_name),值为API标识(api_code)

**交互行为:**
- 切换选项: 立即重新加载表格数据
- 默认值: "全部API"

---

#### 导出按钮

```html
<button class="btn btn-outline" onclick="exportTransactions()">
  <i class="fas fa-download"></i>
  导出
</button>
```

**导出逻辑:**
```javascript
function exportTransactions() {
  // 1. 获取当前筛选条件
  const filters = getCurrentFilters();

  // 2. 调用后端API获取数据(最多10000条)
  const data = await fetchTransactionData(filters, 10000);

  // 3. 转换为CSV格式
  const csv = convertToCSV(data);

  // 4. 生成文件名
  const filename = `消费流水_${formatDate(new Date())}.csv`;

  // 5. 触发下载
  downloadCSV(csv, filename);
}
```

**CSV格式:**
```
时间,API名称,密钥名称,消耗积分,剩余积分
2024-03-05 14:30:25,tdx_wenda_quotes,量化交易组,-120,45678
2024-03-05 14:28:15,PBHQInfo_quotes,投研分析组,-85,45798
...
```

---

### 3.3 流水表格

#### 表格结构

| 列名 | 宽度 | 数据字段 | 格式 | 样式 |
|------|------|----------|------|------|
| 时间 | 18% | timestamp | YYYY-MM-DD HH:mm:ss | 正常字重 |
| API名称 | 22% | api_name | 原始值 | 等宽字体+淡紫背景 |
| 密钥名称 | 20% | key_name | 原始值 | 正常字体 |
| 消耗积分 | 18% | cost | -数值 | 红色加粗 |
| 剩余积分 | 22% | balance | 千分位 | 灰色等宽 |

#### HTML结构

```html
<table class="transaction-table">
  <thead>
    <tr>
      <th>时间</th>
      <th>API名称</th>
      <th>密钥名称</th>
      <th>消耗积分</th>
      <th>剩余积分</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="time">2024-03-05 14:30:25</td>
      <td><span class="api-tag">tdx_wenda_quotes</span></td>
      <td class="key-name">量化交易组</td>
      <td class="cost negative">-120</td>
      <td class="balance">45,678</td>
    </tr>
    ...
  </tbody>
</table>
```

#### 样式定义

```css
/* 时间列 */
.transaction-table .time {
  color: var(--text);
  font-weight: 500;
  font-size: 14px;
}

/* API名称标签 */
.transaction-table .api-tag {
  font-family: 'Courier New', monospace;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-light);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

/* 密钥名称 */
.transaction-table .key-name {
  color: var(--text);
  font-weight: 500;
  font-size: 14px;
}

/* 消耗积分 */
.transaction-table .cost.negative {
  color: var(--danger);
  font-weight: 700;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

/* 剩余积分 */
.transaction-table .balance {
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

/* 行悬停 */
.transaction-table tbody tr:hover {
  background-color: rgba(99, 102, 241, 0.05);
}
```

---

### 3.4 分页加载

#### 初始加载

```javascript
// 首次加载最近20条记录
const initialData = await fetchTransactions({
  page: 1,
  size: 20,
  filters: defaultFilters
});
```

#### 加载更多

```html
<div class="load-more">
  <button class="btn btn-outline" onclick="loadMore()">
    <i class="fas fa-chevron-down"></i>
    加载更多
  </button>
</div>
```

**加载逻辑:**
```javascript
let currentPage = 1;

async function loadMore() {
  currentPage++;
  const newData = await fetchTransactions({
    page: currentPage,
    size: 20,
    filters: getCurrentFilters()
  });

  appendToTable(newData);
}
```

---

## 四、数据字段映射

### 4.1 后端数据结构

```typescript
interface TransactionRecord {
  id: string;                    // 记录ID
  timestamp: string;             // 时间戳 "2024-03-05 14:30:25"
  api_name: string;              // API名称 "tdx_wenda_quotes"
  key_id: string;                // 密钥ID "sk_live_8bH3k5...K9l"
  key_name: string;              // 密钥名称 "量化交易组"
  cost: number;                  // 消耗积分(绝对值) 120
  balance: number;               // 剩余积分 45678
}

interface TransactionResponse {
  records: TransactionRecord[];  // 记录列表
  total: number;                 // 总记录数
  stats: {
    current_balance: number;     // 当前余额
    month_cost: number;          // 本月消耗
    month_calls: number;         // 本月调用次数
    month_trend: number;         // 月度趋势百分比
  };
}
```

### 4.2 前端展示逻辑

```javascript
function formatTransactionRecord(record) {
  return {
    时间: formatDateTime(record.timestamp),      // "2024-03-05 14:30:25"
    API名称: record.api_name,                    // "tdx_wenda_quotes"
    密钥名称: record.key_name,                   // "量化交易组"
    消耗积分: `-${record.cost}`,                 // "-120"
    剩余积分: formatNumber(record.balance)       // "45,678"
  };
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatNumber(num) {
  return num.toLocaleString('zh-CN');
}
```

---

## 五、交互行为

### 5.1 筛选联动

```javascript
// 监听筛选器变化
document.querySelectorAll('.filter-select').forEach(select => {
  select.addEventListener('change', async () => {
    // 1. 获取当前筛选条件
    const filters = getCurrentFilters();

    // 2. 重新加载统计数据
    await loadStats(filters);

    // 3. 重置分页并加载表格数据
    currentPage = 1;
    await loadTransactions(filters, currentPage, 20);
  });
});

function getCurrentFilters() {
  return {
    timeRange: document.querySelector('#filter-time').value,
    keyId: document.querySelector('#filter-key').value,
    apiName: document.querySelector('#filter-api').value
  };
}
```

### 5.2 统计卡片更新

```javascript
async function loadStats(filters) {
  const response = await fetch('/api/transactions/stats', {
    method: 'POST',
    body: JSON.stringify(filters)
  });

  const stats = await response.json();

  // 更新卡片1: 积分余额
  document.querySelector('.stat-card:nth-child(1) .stat-value').textContent =
    formatNumber(stats.current_balance);

  // 更新卡片2: 本月消耗
  document.querySelector('.stat-card:nth-child(2) .stat-value').textContent =
    formatNumber(stats.month_cost);
  document.querySelector('.stat-card:nth-child(2) .stat-change').innerHTML =
    `<i class="fas fa-arrow-${stats.month_trend > 0 ? 'up' : 'down'}"></i>
     ${Math.abs(stats.month_trend)}% 较上月`;

  // 更新卡片3: 本月调用次数
  document.querySelector('.stat-card:nth-child(3) .stat-value').textContent =
    formatNumber(stats.month_calls);
  const daysInMonth = new Date().getDate();
  const avgPerDay = Math.round(stats.month_calls / daysInMonth);
  document.querySelector('.stat-card:nth-child(3) .stat-note').innerHTML =
    `<i class="fas fa-info-circle"></i> 平均 ${avgPerDay}次/天`;
}
```

---

## 六、业务场景

### 6.1 场景1: 查看某个业务组的消耗

**用户操作:**
1. 在"密钥名称"筛选器中选择"量化交易组"
2. 页面自动刷新,只显示该组的消费记录
3. 统计卡片数据更新为该组的消耗情况

**后端逻辑:**
```sql
SELECT
  COUNT(*) as month_calls,
  SUM(cost) as month_cost
FROM transactions
WHERE key_name = '量化交易组'
  AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01');
```

---

### 6.2 场景2: 对比不同业务组的使用情况

**用户操作:**
1. 点击"导出"按钮,下载完整消费流水CSV
2. 在Excel中按"密钥名称"列分组统计
3. 生成各部门的成本对比报表

**Excel数据透视表示例:**

| 密钥名称 | 调用次数 | 消耗积分 | 占比 |
|----------|----------|----------|------|
| 量化交易组 | 456 | 5,678 | 45% |
| 投研分析组 | 312 | 3,892 | 31% |
| 客户服务组 | 124 | 1,545 | 12% |
| 其他 | 100 | 1,250 | 10% |

---

### 6.3 场景3: 异常消耗排查

**用户操作:**
1. 发现"本月消耗"卡片显示异常增长(↑85%)
2. 通过"密钥名称"筛选,定位到"量化交易组"
3. 再通过"API名称"筛选,发现"tdx_wenda_quotes"调用频繁
4. 检查该组是否有异常脚本或配置错误

**排查流程:**
```
发现异常 → 筛选密钥 → 筛选API → 查看详细记录 → 定位问题
```

---

## 七、技术实现

### 7.1 前端技术栈

- **框架**: 纯HTML + CSS + JavaScript(保持与现有页面一致)
- **样式**: 复用现有CSS变量和组件样式
- **图标**: Font Awesome 6.4.0
- **数据请求**: Fetch API

### 7.2 后端API接口

#### 获取消费流水列表

```
POST /api/transactions/list
```

**请求参数:**
```json
{
  "filters": {
    "timeRange": "month",
    "keyId": "key_001",
    "apiName": "tdx_wenda_quotes"
  },
  "page": 1,
  "size": 20
}
```

**响应数据:**
```json
{
  "records": [
    {
      "id": "txn_001",
      "timestamp": "2024-03-05 14:30:25",
      "api_name": "tdx_wenda_quotes",
      "key_id": "key_001",
      "key_name": "量化交易组",
      "cost": 120,
      "balance": 45678
    }
  ],
  "total": 892,
  "page": 1,
  "size": 20
}
```

#### 获取统计数据

```
POST /api/transactions/stats
```

**请求参数:**
```json
{
  "filters": {
    "timeRange": "month",
    "keyId": "key_001",
    "apiName": "all"
  }
}
```

**响应数据:**
```json
{
  "current_balance": 45678,
  "month_cost": 5678,
  "month_calls": 892,
  "month_trend": 12.5
}
```

---

## 八、视觉设计

### 8.1 配色方案

保持现有深色主题:

```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --bg-dark: #0f172a;
  --bg-card: #1e293b;
  --bg-card-hover: #334155;
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

### 8.2 响应式适配

#### 桌面端(>1024px)
- 统计卡片: 3列横向排列
- 筛选器: 横向平铺
- 表格: 完整5列显示

#### 平板端(768-1024px)
- 统计卡片: 3列横向(缩小间距)
- 筛选器: 横向平铺(紧凑)
- 表格: 完整5列(缩小内边距)

#### 移动端(<768px)
- 统计卡片: 单列纵向堆叠
- 筛选器: 垂直堆叠
- 表格: 横向滚动

---

## 九、实施计划

### 9.1 开发任务

| 任务 | 预估工时 | 优先级 |
|------|----------|--------|
| 修改统计卡片(总调用→本月调用) | 0.5h | P0 |
| 表格新增"密钥名称"列 | 1h | P0 |
| 新增密钥筛选器 | 1.5h | P0 |
| 新增API筛选器 | 1h | P0 |
| 筛选器联动逻辑 | 1h | P0 |
| 导出功能优化 | 0.5h | P1 |
| 响应式适配测试 | 1h | P1 |
| **总计** | **6.5h** | - |

### 9.2 测试要点

1. **功能测试**
   - 筛选器切换是否正常刷新数据
   - 统计卡片数据是否随筛选条件同步更新
   - 导出CSV是否包含完整5列数据

2. **性能测试**
   - 大数据量(10000+条)下的表格加载速度
   - 筛选器切换的响应时间(<500ms)

3. **兼容性测试**
   - Chrome/Firefox/Safari浏览器兼容
   - 移动端横向滚动是否流畅

---

## 十、后续优化方向

### 10.1 短期优化(1-2周)

1. **实时刷新** - 每30秒自动刷新统计数据
2. **快捷筛选** - 增加"最近1小时"、"今天"快捷按钮
3. **记忆筛选** - 保存用户上次选择的筛选条件

### 10.2 中期优化(1-2月)

1. **趋势图表** - 在统计卡片下方添加7天消耗趋势图
2. **成本预警** - 当月消耗超过阈值时发送提醒
3. **分组统计** - 支持按密钥/按API的分组统计视图

### 10.3 长期优化(3-6月)

1. **自定义报表** - 用户可自定义报表维度和指标
2. **数据对比** - 支持不同时间段的消耗对比
3. **智能分析** - AI自动识别异常消耗模式

---

## 附录

### A. 相关文档

- [通达信MCP积分扣减机制](D:/your-mcp-proxy/wenda_mcp/wenda_query_v1/src/index.ts)
- [现有消费流水页面](D:/your-mcp-proxy/wenda_query_new/MCP用户控制台-方案A标准版.html)

### B. 参考资料

- [OpenAI API Usage Dashboard](https://platform.openai.com/usage)
- [Anthropic Console Usage](https://console.anthropic.com/)

---

**文档版本:** v1.0
**最后更新:** 2026-03-10
**维护者:** AI设计团队
