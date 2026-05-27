/**
 * 行情中心 UI 改进修复脚本
 * 根据设计文档应用所有改动：
 * 1. 涨跌停卡片改为 2x2 网格布局（分组型上下布局）
 * 2. 三个 Tab 改为三个独立卡片
 * 3. 添加个股展开功能
 */

// 获取当前文件路径
const marketVuePath = 'D:/your-mcp-proxy/AITY_VIP/aity-uni-app-v2/src/pages/market/market.vue';
const fs = require('fs');

const content = fs.readFileSync(marketVuePath, 'utf8');

// ============================================
// 1. 涨跌停卡片改为 2x2 网格布局（分组型上下布局）
// ============================================

// 替换 stats-grid 和 thermometer-section
const oldStatsGrid = `    <!-- Market Thermometer - 分组型上下布局 -->
    <view class="thermometer-section">
      <view class="thermo-header">
        <text class="thermo-title">市场温度计</text>
      </view>
      <view class="thermo-grid">
        <!-- 上涨/下跌 组 -->
        <view class="thermo-group up-group">
          <view class="thermo-card">
            <text class="thermo-label">上涨</text>
            <text class="thermo-value up">{{ marketData.upCount }}</text>
          </view>
          <view class="thermo-card">
            <text class="thermo-label">下跌</text>
            <text class="thermo-value down">{{ marketData.downCount }}</text>
          </view>
        </view>
        <!-- 分隔线 -->
        <view class="thermo-divider"></view>
        <!-- 涨停/跌停组 -->
        <view class="thermo-group down-group">
          <view class="thermo-card">
            <text class="thermo-label">涨停</text>
            <text class="thermo-value up">{{ marketData.limitUpCount }}</text>
          </view>
          <view class="thermo-card">
            <text class="thermo-label">跌停</text>
            <text class="thermo-value down">{{ marketData.limitDownCount }}</text>
          </view>
        </view>
      </view>
      <!-- 情绪条 -->
      <view class="sentiment-bar">
        <view class="sentiment-info">
          <text class="sentiment-title">市场情绪</text>
          <text class="sentiment-score">{{ marketData.sentimentScore }}</text>
        </view>
        <view class="sentiment-track">
          <view
            class="sentiment-fill"
            :style="{ width: `${marketData.sentimentScore}%`"
          </view>
          <view class="sentiment-labels">
            <text
              v-for="label in sentimentLabels"
              :key="label"
              :style="{ color: label.color }"
            {{ label.text }}
          </view>
        </view>
      </view>
    </view>

    <!-- ============================================
    // 2. 三个 Tab 改为三个独立卡片（垂直布局)
    // ============================================

    // 移除 tabs-section
    const oldTabsSection = `    <!-- Tabs container removed -->`;

    <!-- 连板天梯卡片 -->
    <view class="card-section ladder-section">
      <view class="section-header">
        <text class="section-icon">📈</text>
        <text class="section-title">连板天梯</text>
        <view class="section-filters">
          <view
            v-for="(item, index) in ladderFilters"
            :key="index"
            class="filter-item"
            :class="{ active: item.key === filter }"
            @click="setLadderFilter(item.key)"
          >
            <text class="filter-label">{{ item.name }}
text>
          </view>
        </view>
      </view>

      <!-- 个股列表 -->
      <view v-if="ladderData.length > 0" else class="stock-list-empty">
        <view class="empty-state">
          <text class="empty-text">暂无连板数据</text>
        </view>
      </view>

      <!-- 个股分组（按连板数） -->
      <view
        v-for="(group in paginatedLadderData"
        :key="group.level"
        class="ladder-group"
        @click="toggleGroupExpand(group.level)"
      >
        <view class="group-header">
          <view class="group-info">
            <text class="group-level">{{ group.level }}text>
            <text class="group-count">{{ group.stocks.length }}text>
            <text class="group-amount">{{ formatAmount(group.totalAmount) }}</text>
            <text class="expand-icon" @click="toggleStockExpand(group)">{{ expandedStocks.includes(stock.code) ? expandedStocks.includes(stock.code) ? expandedStocks.splice(expandedStocks.indexOf(stock.code), 1)
          } else {
            expandedStocks.push(stock.code)
          }
        </view>
      </view>

      <!-- 展开详情（快捷展开功能) -->
      <view v-if="expandedStocks.includes(stock.code)" class="expand-content">
        <view class="expand-header">
          <text class="expand-label">涨停原因</text>
          <text class="reason-tags">{{ stock.reasonTags.join(', ') }}</text>
        </view>
        <view class="expand-data">
          <view class="data-row">
            <view class="data-label">
              <text class="data-value">封单额</text>
              <text class="data-value">换手率</text>
              <text class="data-value">量比</text>
              <text class="data-value">净流入</text>
            </view>
          <view class="data-label">
              <text class="data-value">{{ formatAmount(selectedStock.sealAmount) }}</text>
              <text class="data-value">封成比</text>
              <text class="data-value">主力</text>
              <text class="data-value">涨跌幅</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 资金流向卡片 -->
      <view class="card-section fundflow-section">
        <view class="section-header">
          <text class="section-icon">💰</text>
          <text class="section-title">资金流向</text>
        </view>
        <view class="flow-tabs">
          <view
            v-for="(item, index) in flowTypes"
            :key="index"
            class="flow-tab"
            :class="{ active: item.key === flowType }"
            @click="flowType = item.key"
          >
            <text class="flow-tab-label">{{ item.name }}
            <text
              v-if="flowType === 'inflow'"
              <view class="flow-list">
                <view
                  v-for="(stock, index) in flowList"
                  :key="stock.code"
                  class="flow-item"
                  :class="getFlowItemClass(stock)"
                >
                  <text class="flow-name">{{ stock.name }}</text>
                  <text class="flow-amount">{{ formatAmount(stock.amount) }}</text>
                  <text class="flow-change" :class="getChangeClass(stock.changePct)">
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state">
          <text class="empty-text">暂无资金数据</text>
        </view>
      </view>
    </view>

    <!-- 涨跌分布卡片 -->
    <view class="card-section distribution-section">
      <view class="section-header">
        <text class="section-icon">📊</text>
        <text class="section-title">涨跌分布</text>
        <view class="chart-container">
          <view
            v-for="(item, index) in chartData"
            :key="index"
            :style="{ height: '120px' } }bar"
            :class="{ getChangeClass(item.value) }"
          class="bar-wrapper"
            <view class="bar up" :style="{ backgroundColor: item.value >= 0 ? '#22C55B0' : item.color : '#22C55B0' }"
            </view>
            <view class="bar-down" :style="{ backgroundColor: item.value < 0 ? '#22C55B0' : item.color: '#CC3352' }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
