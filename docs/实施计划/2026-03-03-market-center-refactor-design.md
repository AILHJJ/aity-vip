# 行情中心重构设计方案

## 1. 概述

**目标**: 完全重写行情中心页面，参考原型图 `market-center-optimized.html`，采用深色金融主题风格

**文件位置**:
- 原型图: `docs/design/prototypes/market-center-optimized.html`
- 目标文件: `aity-uni-app-v2/src/pages/market/market.vue`

## 2. 整体架构

**技术栈**: Vue 3 Composition API + uni-app
**风格**: 深色金融主题（深蓝/深紫渐变）

**组件结构**:
```
market.vue (主页面)
├── Header区域
├── IndexBar（指数行情）
├── StatsGrid（涨跌统计）
├── SentimentCard（情绪仪表）
├── Tabs（标签切换）
├── FilterBar（筛选条）
├── TabContent区域
│   ├── LadderTab（连板天梯）
│   ├── FundFlowTab（资金流向）
│   └── DistributionTab（涨跌分布）
└── StockDetailModal（详情弹窗）
```

## 3. 页面布局（从上到下）

### 3.1 Header区域
- 左侧: 返回按钮
- 中间: 标题"行情中心"
- 右侧: 更新时间 + 刷新按钮

### 3.2 IndexBar（指数行情）
- 横向滚动容器
- 4个指数卡片: 上证、深证、创业板、科创50
- 每项显示: 指数名、当前价、涨跌幅
- 颜色区分涨/跌

### 3.3 StatsGrid（涨跌统计）
- 4格网格布局
- 上涨数（红色）
- 下跌数（绿色）
- 涨停数（红色高亮）
- 跌停数（绿色高亮）

### 3.4 SentimentCard（情绪仪表）
- 左侧: 圆形仪表盘显示情绪分数(0-100)
- 右侧: 横向进度条
- 标签: 恐慌 / 中性 / 贪婪
- 颜色渐变: 绿->黄->红

### 3.5 Tabs（标签切换）
- 3个Tab: 连板天梯 / 资金流向 / 涨跌分布
- 下划线指示器
- 点击切换内容区域

### 3.6 FilterBar（筛选条）
- 横向滚动
- 筛选项: 全部 / 主板 / 创业板 / 科创板 / 北证
- 选中状态高亮
- 点击切换筛选

### 3.7 TabContent区域

#### 连板天梯Tab
- 分层级展示（3连板、2连板、首板等）
- 每级可展开/折叠
- 展开时显示股票列表
- 股票项显示:
  - 序号
  - 名称 + 代码
  - 板型标签（T字板/一字板/换手板/次新）
  - 价格 + 涨幅
- 点击弹出详情Modal

#### 资金流向Tab
- 流入/流出切换按钮
- 行业排名列表
- 每项显示:
  - 排名
  - 行业名称
  - 涨跌统计
  - 净流入金额
  - 流入占比

#### 涨跌分布Tab
- 柱状图分布
- X轴: 涨跌幅区间（跌停/-5%以下/-5~-3%/-3~0%/0~3%/3~5%/5%以上/涨停）
- Y轴: 股票数量
- 颜色区分: 涨(红)/跌(绿)

### 3.8 StockDetailModal（详情弹窗）
- 底部滑出式
- 半屏遮罩背景
- 头部: 股票名称 + 代码 + 关闭按钮
- 内容区:
  - 价格信息卡片
  - 板型分析
  - 涨停原因/题材标签
  - 资金数据网格（封单额/封成比/换手率/量比/净流入/主力流入）
  - 时间信息

## 4. 数据接口

### 4.1 API调用
```javascript
// 市场概览
getMarketOverviewApi() -> { upCount, downCount, limitUpCount, limitDownCount, totalStocks }

// 指数行情
getIndexQuoteApi() -> [{ code, name, price, changePct }]

// 连板天梯
getLimitUpLadderApi() -> { highestDays, total, levels: [{ days, count, stocks }] }

// 行业资金流向
getIndustryFundFlowApi({ type, top }) -> [{ name, netInflow, netInflowPct, upCount, downCount }]
```

### 4.2 数据处理
- 格式化金额显示（亿/万）
- 格式化百分比显示
- 计算情绪分数
- 按板块筛选数据

## 5. 交互设计

### 5.1 刷新
- 点击刷新按钮
- 显示loading状态
- 重新获取所有数据
- 更新时间显示

### 5.2 Tab切换
- 点击Tab切换内容
- 下划线跟随动画
- 保持筛选状态

### 5.3 筛选
- 点击筛选条项
- 高亮选中状态
- 过滤当前Tab的数据
- 连板天梯: 按板块筛选股票
- 资金流向: 按板块筛选行业
- 涨跌分布: 按板块筛选股票

### 5.4 天梯展开/折叠
- 点击层级头部
- 展开/折叠动画
- 展开时加载/显示股票列表

### 5.5 股票详情
- 点击股票项
- 底部滑出Modal
- 点击遮罩或关闭按钮关闭

## 6. 样式规范

### 6.1 颜色变量
```scss
$up-color: #ff4757;      // 涨/红
$down-color: #2ed573;    // 跌/绿
$primary-color: #5d9cec; // 主色调
$bg-dark: #0f1419;     // 深色背景
$bg-card: #1e2636;     // 卡片背景
```

### 6.2 字体规范
- 标题: 18px, 600
- 正文: 14px, 400
- 辅助: 12px, 400
- 数字: SF Mono, Consolas

## 7. 开发任务

1. 重构market.vue模板结构
2. 实现Header区域
3. 实现IndexBar组件
4. 实现StatsGrid组件
5. 实现SentimentCard组件
6. 实现Tabs切换功能
7. 实现FilterBar组件
8. 实现LadderTab（连板天梯）
9. 实现FundFlowTab（资金流向）
10. 实现DistributionTab（涨跌分布柱状图）
11. 实现StockDetailModal
12. 整合数据接口
13. 测试验证

## 8. 注意事项

- 保持与现有API接口兼容
- 注意小程序性能优化
- 合理使用scroll-view
- 避免过深的组件嵌套
