/**
 * 行情中心 UI 改进修复脚本
 * 根据设计文档应用所有改动
 */

const fs = require('fs');
const path = require('path');

const marketVuePath = path.join(__dirname, '../src/pages/market/market.vue');

// 读取文件内容
let content = fs.readFileSync(marketVuePath, 'utf8');

// ============================================
// 1. 涨跌停卡片改为 2x2 网格布局
// ============================================

// 替换 stats-grid 部分
const oldStatsGrid = `    <!-- Stats Grid -->
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value up">{{ marketData.upCount }}</text>
        <text class="stat-label">上涨</text>
      </view>
      <view class="stat-card">
        <text class="stat-value down">{{ marketData.downCount }}</text>
        <text class="stat-label">下跌</text>
      </view>
      <view class="stat-card">
        <text class="stat-value up">{{ marketData.limitUpCount }}</text>
        <text class="stat-label">涨停</text>
      </view>
      <view class="stat-card">
        <text class="stat-value down">{{ marketData.limitDownCount }}</text>
        <text class="stat-label">跌停</text>
      </view>
    </view>`;

const newThermometerSection = `    <!-- Market Thermometer - 分组型2x2网格布局 -->
    <view class="thermometer-section">
      <view class="thermo-header">
        <text class="thermo-title">市场温度计</text>
      </view>
      <view class="thermo-grid">
        <!-- 上半部分：上涨/下跌 -->
        <view class="thermo-row">
          <view class="thermo-card up-card">
            <text class="thermo-label">上涨</text>
            <text class="thermo-value up">{{ marketData.upCount }}</text>
          </view>
          <view class="thermo-card down-card">
            <text class="thermo-label">下跌</text>
            <text class="thermo-value down">{{ marketData.downCount }}</text>
          </view>
        </view>
        <!-- 下半部分：涨停/跌停 -->
        <view class="thermo-row">
          <view class="thermo-card up-card">
            <text class="thermo-label">涨停</text>
            <text class="thermo-value up">{{ marketData.limitUpCount }}</text>
          </view>
          <view class="thermo-card down-card">
            <text class="thermo-label">跌停</text>
            <text class="thermo-value down">{{ marketData.limitDownCount }}</text>
          </view>
        </view>
      </view>
    </view>`;

content = content.replace(oldStatsGrid, newThermometerSection);

// ============================================
// 2. 移除 sentiment-section（合并到温度计）
// ============================================

const oldSentimentSection = `    <!-- Sentiment Card -->
    <view class="sentiment-section">
      <view class="sentiment-card">
        <view class="sentiment-header">
          <text class="sentiment-title">市场情绪</text>
          <text class="sentiment-score" :class="sentimentClass">{{ sentimentScore }}</text>
        </view>
        <view class="sentiment-bar">
          <view class="sentiment-fill" :style="{ width: sentimentScore + '%' }"></view>
        </view>
        <view class="sentiment-labels">
          <text>恐慌</text>
          <text>中性</text>
          <text>贪婪</text>
        </view>
      </view>
    </view>`;

const newSentimentBar = `    <!-- 市场情绪条（合并到温度计下方） -->
    <view class="sentiment-bar-section">
      <view class="sentiment-bar-card">
        <view class="sentiment-header">
          <text class="sentiment-title">市场情绪</text>
          <text class="sentiment-score" :class="sentimentClass">{{ sentimentScore }}</text>
        </view>
        <view class="sentiment-bar">
          <view class="sentiment-fill" :style="{ width: sentimentScore + '%' }"></view>
        </view>
        <view class="sentiment-labels">
          <text>恐慌</text>
          <text>中性</text>
          <text>贪婪</text>
        </view>
      </view>
    </view>`;

content = content.replace(oldSentimentSection, newSentimentBar);

// ============================================
// 3. 移除 Tab 切换，改为三个独立卡片
// ============================================

// 移除 tabs 部分
const oldTabs = `    <!-- Tabs -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>`;

content = content.replace(oldTabs, '    <!-- Tabs removed - now using independent cards -->');

// 修改 tab-content 为独立卡片布局
const oldTabContent = `    <!-- Tab Content -->
    <view class="tab-content">
      <!-- Ladder Tab -->
      <view v-if="activeTab === 'ladder'" class="ladder-section">`;

const newCardsLayout = `    <!-- 三个独立卡片（原Tab内容） -->
    <view class="cards-container">
      <!-- 连板天梯卡片 -->
      <view class="card-section">
        <view class="card-header">
          <text class="card-icon">📈</text>
          <text class="card-title">连板天梯</text>
        </view>
        <view class="ladder-section">`;

content = content.replace(oldTabContent, newCardsLayout);

// 移除 ladder section 的 v-if 条件
content = content.replace('<view v-if="activeTab === \'ladder\'" class="ladder-section">', '<view class="ladder-section">');

// ============================================
// 4. 添加个股展开功能
// ============================================

// 在 stock-item 中添加展开按钮和展开内容
const oldStockItem = `            <view
              v-for="(stock, idx) in level.stocks"
              :key="stock.code"
              class="stock-item"
              @click="showStockDetail(stock)"
            >
              <text class="stock-rank">{{ idx + 1 }}</text>
              <view class="stock-info">
                <text class="stock-name">{{ stock.name }}</text>
                <view class="stock-meta">
                  <text class="stock-code">{{ stock.code }}</text>
                  <text v-if="stock.limitType" class="stock-tag" :class="getTagClass(stock.limitType)">{{ stock.limitType }}</text>
                  <text v-if="stock.isNew" class="stock-tag tag-new">次新</text>
                </view>
              </view>
              <view class="stock-price">
                <text class="stock-value up">{{ stock.price?.toFixed(2) }}</text>
                <text class="stock-change up">+{{ stock.changePct?.toFixed(2) }}%</text>
              </view>
            </view>`;

const newStockItemWithExpand = `            <view
              v-for="(stock, idx) in level.stocks"
              :key="stock.code"
              class="stock-item-wrapper"
            >
              <view class="stock-item" @click="toggleStockExpand(stock.code)">
                <text class="stock-rank">{{ idx + 1 }}</text>
                <view class="stock-info">
                  <text class="stock-name">{{ stock.name }}</text>
                  <view class="stock-meta">
                    <text class="stock-code">{{ stock.code }}</text>
                    <text v-if="stock.limitType" class="stock-tag" :class="getTagClass(stock.limitType)">{{ stock.limitType }}</text>
                    <text v-if="stock.isNew" class="stock-tag tag-new">次新</text>
                  </view>
                </view>
                <view class="stock-price">
                  <text class="stock-value up">{{ stock.price?.toFixed(2) }}</text>
                  <text class="stock-change up">+{{ stock.changePct?.toFixed(2) }}%</text>
                </view>
                <text class="expand-btn">{{ expandedStocks.includes(stock.code) ? '▲' : '▼' }}</text>
              </view>
              <!-- 展开详情 -->
              <view v-if="expandedStocks.includes(stock.code)" class="stock-expand-content">
                <view class="expand-row">
                  <text class="expand-label">涨停原因</text>
                  <text class="expand-value">{{ stock.reason || '暂无' }}</text>
                </view>
                <view class="expand-row">
                  <text class="expand-label">封单额</text>
                  <text class="expand-value">{{ formatAmount(stock.sealAmount) }}</text>
                  <text class="expand-label">换手率</text>
                  <text class="expand-value">{{ stock.turnoverRate?.toFixed(2) || '--' }}%</text>
                </view>
                <view class="expand-row">
                  <text class="expand-label">量比</text>
                  <text class="expand-value">{{ stock.volumeRatio?.toFixed(2) || '--' }}</text>
                  <text class="expand-label">净流入</text>
                  <text class="expand-value" :class="stock.netInflow >= 0 ? 'up' : 'down'">{{ formatAmount(stock.netInflow) }}</text>
                </view>
              </view>
            </view>`;

content = content.replace(oldStockItem, newStockItemWithExpand);

// ============================================
// 5. 添加必要的样式
// ============================================

// 查找 </style> 标签前添加新样式
const additionalStyles = `
/* 市场温度计 - 2x2网格布局 */
.thermometer-section {
  margin: 20rpx;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.2);
}
.thermo-header {
  margin-bottom: 16rpx;
}
.thermo-title {
  font-size: 28rpx;
  color: #00ffff;
  font-weight: bold;
}
.thermo-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.thermo-row {
  display: flex;
  gap: 12rpx;
}
.thermo-card {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
}
.thermo-card.up-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
  border: 1rpx solid rgba(34, 197, 94, 0.3);
}
.thermo-card.down-card {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1rpx solid rgba(239, 68, 68, 0.3);
}
.thermo-label {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}
.thermo-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
}
.thermo-value.up {
  color: #22c55e;
}
.thermo-value.down {
  color: #ef4444;
}

/* 情绪条样式调整 */
.sentiment-bar-section {
  margin: 0 20rpx 20rpx;
}
.sentiment-bar-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.1);
}

/* 独立卡片容器 */
.cards-container {
  padding: 0 20rpx;
}
.card-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.2);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}
.card-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}
.card-title {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
}

/* 个股展开功能 */
.stock-item-wrapper {
  margin-bottom: 12rpx;
}
.stock-expand-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8rpx;
  padding: 16rpx;
  margin-top: 8rpx;
  border: 1rpx solid rgba(0, 255, 255, 0.1);
}
.expand-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.expand-label {
  font-size: 22rpx;
  color: #888;
  width: 100rpx;
}
.expand-value {
  font-size: 22rpx;
  color: #fff;
  flex: 1;
}
.expand-btn {
  font-size: 20rpx;
  color: #00ffff;
  padding: 8rpx;
}
`;

// 在 </style> 前添加新样式
if (content.includes('</style>')) {
  content = content.replace('</style>', additionalStyles + '\n</style>');
}

// ============================================
// 6. 添加必要的 JavaScript 逻辑
// ============================================

// 在 script 部分添加 expandedStocks 状态
if (content.includes('const expandedLevels = ref')) {
  content = content.replace(
    'const expandedLevels = ref',
    '// 个股展开状态\nconst expandedStocks = ref([])\n\nconst toggleStockExpand = (code) => {\n  const idx = expandedStocks.value.indexOf(code)\n  if (idx > -1) {\n    expandedStocks.value.splice(idx, 1)\n  } else {\n    expandedStocks.value.push(code)\n  }\n}\n\nconst expandedLevels = ref'
  );
}

// 保存文件
fs.writeFileSync(marketVuePath, content, 'utf8');

console.log('✅ 行情中心 UI 改进已完成！');
console.log('  - 涨跌停卡片改为 2x2 网格布局');
console.log('  - 移除 Tab 切换，改为独立卡片');
console.log('  - 添加个股快捷展开功能');
console.log('  - 添加情绪条合并布局');
