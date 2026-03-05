# 消息发布页面优化需求

> **创建日期**: 2026-03-05
> **状态**: 需求分析完成
> **优先级**: P0
> **负责人**: 用户 + Claude Code
> **相关文件**: `aity-uni-app-v2/src/pages/create-message/create-message.vue`

---

## 📋 需求概述

对 `create-message.vue` 消息发布页面进行功能优化。

---

## ✅ 已完成功能（代码已实现）

### 1. 风险提示 Banner ✅
**状态**: 已实现，位于页面顶部

**代码位置**: 第5-15行
```vue
<view class="risk-warning-banner" :class="{ collapsed: !showRiskWarning }">
  <view class="warning-header" @click="showRiskWarning = !showRiskWarning">
    <text class="warning-icon">⚠️</text>
    <text class="warning-title">风险提示</text>
    <text class="collapse-icon">{{ showRiskWarning ? '▼' : '▶' }}</text>
  </view>
  <view v-if="showRiskWarning" class="warning-content">
    <text class="warning-text">以下内容为个人交易总结，仅作为复盘交流使用，不作为投资建议。股市有风险，投资需谨慎。</text>
  </view>
</view>
```

**功能特性**:
- ✅ 可折叠/展开设计
- ✅ 点击标题栏切换状态
- ✅ 显示 ⚠️ 图标
- ✅ 默认文案已设置

---

### 2. 图片上传（支持粘贴） ✅
**状态**: 已实现，支持多端

**代码位置**:
- 粘贴处理: 第529-673行 `handlePaste()`
- 小程序粘贴: 第463-527行 `handlePasteImage()`
- 文件选择: 第676-765行 `handleUpload()`

**功能特性**:
- ✅ H5端支持 Ctrl+V 粘贴图片
- ✅ 小程序端工具栏粘贴按钮 📋
- ✅ 图片大小限制（10MB）
- ✅ 数量限制（最多9张）
- ✅ 图片预览缩略图
- ✅ 一键删除

---

### 3. 股票代码关联 ✅ (部分完成)
**状态**: UI已实现，后端API对接可能待完善

**代码位置**: 第186-218行
```vue
<view class="form-item stock-code-item">
  <text class="form-label">关联股票（可选）</text>
  <view class="stock-input-container">
    <input v-model="stockCodeInput" placeholder="输入股票代码，如：000001" />
    <button class="stock-search-btn" @click="handleSearchStock">🔍</button>
    <button class="stock-add-btn" @click="handleAddStock">添加</button>
  </view>
  <view v-if="formData.stockCodes.length > 0" class="stock-tags-container">
    <view v-for="(code, index) in formData.stockCodes" class="stock-tag">
      <text class="stock-tag-text">{{ code }}</text>
      <text class="stock-tag-remove" @click="handleRemoveStock(index)">×</text>
    </view>
  </view>
</view>
```

**已实现**:
- ✅ 输入框 + 搜索按钮 + 添加按钮
- ✅ 股票代码标签展示
- ✅ 一键移除功能
- ✅ 最多10只股票限制
- ✅ formData 包含 `stockCodes` 数组

**待确认/待完成**:
- ⏳ `handleSearchStock` 方法实现（搜索股票）
- ⏳ `handleAddStock` 方法实现（添加股票）
- ⏳ 股票搜索API对接
- ⏳ 提交时是否保存 stockCodes 到后端

---

### 4. 其他已完成功能 ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| 策略类型选择 | ✅ | 短线/中线策略，单选，记忆功能 |
| 推送对象选择 | ✅ | 仅管理员可见，联动策略类型 |
| 消息类型选择 | ✅ | 10种类型下拉选择 |
| Markdown编辑器 | ✅ | 工具栏 + 编辑/预览切换 |
| 12种主题样式 | ✅ | 下拉选择 + 颜色预览 + 记忆功能 |
| AI一键优化 | ✅ | 调用后端API优化内容 |
| 草稿自动保存 | ✅ | localStorage持久化 |
| 底部固定按钮 | ✅ | 取消/发布按钮 |

---

## ✅ 已完成实现

### 1. 股票代码关联 - 功能完善 ✅
- [x] 搜索股票功能（handleSearchStock）- 跳转行情页面查看
- [x] 添加股票功能（handleAddStock）- 添加到列表
- [x] 删除股票功能（handleRemoveStock）
- [x] 股票代码验证（6位数字）
- [x] 数量限制（最多10只）
- [x] 提交时转换为 `$个股(代码)$` 格式附加到内容末尾

- [x] 详情页 `parseStockTags` 已支持 `$个股(代码)$` 格式

### 2. 行情展示 ✅
**实现方式**: 点击股票标签跳转到第三方行情页面
- [x] 使用第三方行情URL: `https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail?code=xxx&setcode=x&opentype=native`
- [x] 自动判断市场代码（沪市/深市/北交所）
- [x] 通过 webview 页面展示行情

---

## 📝 实施计划

### 阶段1: 需求确认（当前）
- [x] 分析已完成功能
- [x] 确认股票代码关联具体要求
- [x] 确认行情展示具体要求

### 阶段2: 开发实现
- [x] 完善股票搜索/添加功能
- [x] 实现行情展示功能
- [x] 对接后端API

### 阶段3: 测试验证
- [ ] 功能测试
- [ ] 多端兼容测试（H5/小程序）

---

## 📝 实施计划

### 阶段1: 需求确认（当前）
- [x] 分析已完成功能
- [ ] 确认股票代码关联具体要求
- [ ] 确认行情展示具体要求

### 阶段2: 开发实现
- [ ] 完善股票搜索/添加功能
- [ ] 实现行情展示功能
- [ ] 对接后端API

### 阶段3: 测试验证
- [ ] 功能测试
- [ ] 多端兼容测试（H5/小程序）

---

## 🔍 代码分析摘要

**文件**: `aity-uni-app-v2/src/pages/create-message/create-message.vue`
**总行数**: 2642行
**框架**: Vue 3 Composition API
**平台**: uni-app (H5 + 微信小程序)

### 数据结构
```javascript
formData = {
  strategy: 'short_term',        // 策略类型
  pushTarget: 'short_term',      // 推送对象
  messageType: 'morning_focus',  // 消息类型
  theme: 'default',              // Markdown主题
  title: '',                     // 标题
  content: '',                   // 内容
  attachments: [],               // 附件
  stockCodes: []                 // 股票代码（需确认是否提交）
}
```

---

## 🔄 变更记录

| 日期 | 变更内容 | 操作人 |
|------|----------|--------|
| 2026-03-05 | 创建需求文档 | Claude Code |
| 2026-03-05 | 完成代码分析，整理已完成/待完成功能 | Claude Code |

---

## 📌 下一步行动

**请用户确认以下问题：**

1. **股票代码关联**
   - 是否需要搜索功能？输入代码后显示股票名称？
   - 提交消息时是否需要保存 stockCodes 到后端？

2. **行情展示**
   - 需要展示什么内容？（上证指数/深证成指/个股行情？）
   - 展示在页面什么位置？
   - 数据从哪里获取？
