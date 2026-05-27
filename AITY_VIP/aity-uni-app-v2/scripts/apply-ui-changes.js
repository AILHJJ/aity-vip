const fs = require('fs');
const path = require('path');

const marketVuePath = path.join(__dirname, '../src/pages/market/market.vue');

let content = fs.readFileSync(marketVuePath, 'utf8');

// 1. 替换 stats-grid
content = content.replace(/<!-- Stats Grid -->`, `    <!-- Market Thermometer - 2x2 Grid -->
    <view class="thermometer-section">
      <view class="thermo-header">
        <text class="thermo-title">市场温度计</text>
      </view>
      <view class="thermo-grid">
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
    </view>

    <!-- 市场情绪条 -->
    <view class="sentiment-bar-section">
      <view class="sentiment-bar-card">
        <view class="sentiment-header">
          <text class="sentiment-title">市场情绪</text>
          <text class="sentiment-score" :class="sentimentClass">{{ sentimentScore }}</text>
        </view>
        <view class="sentiment-bar">
          <view class="sentiment-fill" :style="{ width: sentimentScore + '%' }"></view>
        <view class="sentiment-labels">
          <text>恐慌</text>
          <text>中性</text>
          <text>贪婪</text>
        </view>
      </view>
    </view>

    <!-- Tabs removed - using independent cards -->
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
    </view>
`);

fs.writeFileSync(marketVuePath, content, 'utf8');
console.log('UI changes applied');
