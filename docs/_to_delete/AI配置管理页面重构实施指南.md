# AI配置管理页面重构实施指南

## 文件位置
`aity-uni-app-v2/src/pages/admin/ai-config.vue`

## 重构概览

### 主要变更
1. ✅ 添加Tab切换（模型管理/提示词管理/连接测试）
2. ✅ 添加厂商下拉选择器
3. ✅ 优化操作按钮（图标+文字）
4. ✅ 简化按钮文字
5. ✅ 提示词管理改为Tab页面
6. ✅ 连接测试改为独立Tab

## 代码结构

### Template结构
```vue
<template>
  <view class="ai-config-container">
    <!-- 1. Tab切换导航 -->
    <view class="tab-container">
      <view class="tab-item">模型管理</view>
      <view class="tab-item">提示词管理</view>
      <view class="tab-item">连接测试</view>
    </view>

    <!-- 2. Tab内容区域 -->
    <view class="tab-content">
      <!-- Tab1: 模型管理 -->
      <view v-if="activeTab === 'models'">
        - 当前默认模型卡片
        - 厂商选择器
        - 模型列表（操作按钮已优化）
      </view>

      <!-- Tab2: 提示词管理 -->
      <view v-if="activeTab === 'prompts'">
        - 提示词编辑器
        - 保存/恢复按钮
      </view>

      <!-- Tab3: 连接测试 -->
      <view v-if="activeTab === 'test'">
        - 测试摘要
        - 测试按钮
        - 测试结果列表
      </view>
    </view>

    <!-- 3. 弹窗（保留原有） -->
    - 编辑模型弹窗
    - 更新API Key弹窗
  </view>
</template>
```

### Script结构
```javascript
// 新增状态
const activeTab = ref('models')           // 当前激活的Tab
const selectedProviderIndex = ref(0)      // 选中的厂商索引

// 新增computed
const currentProvider = computed(() => {
  // 返回当前选中的厂商对象
})

const providerOptions = computed(() => {
  // 返回厂商下拉选项
})

// 新增方法
const switchTab = (tab) => {
  // 切换Tab
}

const onProviderChange = (e) => {
  // 厂商选择器变化
}

const loadCurrentPrompt = async () => {
  // 加载当前提示词（Tab切换时调用）
}

const getStatusShort = (status) => {
  // 获取状态简短文本（用于测试结果）
}
```

### Style结构
```scss
// 新增样式
.tab-container { }       // Tab容器
.tab-item { }            // Tab项
.tab-content { }         // Tab内容区域
.provider-selector { }   // 厂商选择器
.selector-display { }    // 选择器显示
.action-text-btn { }     // 文字操作按钮
.prompts-tab { }         // 提示词Tab
.test-tab { }            // 测试Tab
.test-results { }        // 测试结果

// 修改样式
.model-card { }          // 模型卡片（改为独立卡片）
.model-actions-row { }   // 操作按钮行（新增）

// 删除样式
.icon-btn { }            // 旧图标按钮（已删除）
.prompt-modal相关的样式  // 提示词弹窗样式（已删除）
```

## 关键技术点

### 1. Tab切换实现
```vue
<view class="tab-item"
      :class="{ active: activeTab === 'models' }"
      @click="switchTab('models')">
  <text class="tab-icon">🤖</text>
  <text class="tab-text">模型管理</text>
</view>
```

```javascript
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'prompts' && !currentPrompt.value) {
    loadCurrentPrompt()
  }
}
```

### 2. 厂商选择器实现
```vue
<view class="provider-selector" v-if="providers.length > 0">
  <picker mode="selector"
          :value="selectedProviderIndex"
          :range="providerOptions"
          range-key="label"
          @change="onProviderChange">
    <view class="selector-display">
      <text class="selector-label">厂商:</text>
      <text class="selector-value">
        {{ providerOptions[selectedProviderIndex]?.label }}
      </text>
      <text class="selector-arrow">▼</text>
    </view>
  </picker>
</view>
```

```javascript
const providerOptions = computed(() => {
  return providers.value.map(p => ({
    label: p.providerName,
    value: p.provider
  }))
})

const onProviderChange = (e) => {
  selectedProviderIndex.value = e.detail.value
}
```

### 3. 操作按钮优化
```vue
<!-- 旧的图标按钮 -->
<button class="icon-btn" @click="testSingleModel(model)">
  <text>🧪</text>
</button>

<!-- 新的文字按钮 -->
<button class="action-text-btn test-btn" @click="testSingleModel(model)">
  <text>🧪 测试</text>
</button>
```

```scss
.action-text-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;

  &.test-btn {
    background: #f0f5ff;
    color: #667eea;
  }

  &.set-btn {
    background: #fffbe6;
    color: #d48806;
  }

  &.edit-btn {
    background: #f5f7fa;
    color: #666;
  }
}
```

## 样式规范

### 颜色方案
```scss
// 主色调（渐变）
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// 测试按钮（蓝色）
$test-bg: #f0f5ff;
$test-color: #667eea;

// 设为默认（黄色）
$set-bg: #fffbe6;
$set-color: #d48806;

// 编辑（灰色）
$edit-bg: #f5f7fa;
$edit-color: #666;

// 状态颜色
$success: #52c41a;
$warning: #faad14;
$error: #ff4d4f;
```

### 间距规范
```scss
// 卡片间距
$card-padding: 24rpx;
$card-margin: 16rpx;
$card-radius: 16rpx;

// 按钮间距
$btn-gap: 12rpx;
$btn-padding: 16rpx 20rpx;

// Tab间距
$tab-padding: 20rpx 16rpx;
$tab-gap: 8rpx;
```

## 测试要点

### 功能测试
- [ ] Tab切换正常工作
- [ ] 厂商选择器可以切换
- [ ] 操作按钮（测试/设为默认/编辑）正常工作
- [ ] 提示词保存和恢复功能正常
- [ ] 连接测试功能正常
- [ ] 编辑弹窗正常打开和保存
- [ ] API Key更新弹窗正常工作

### UI测试
- [ ] Tab激活状态显示正确
- [ ] 按钮文字显示正确
- [ ] 颜色方案统一
- [ ] 移动端适配正常
- [ ] 响应式布局正常

### 兼容性测试
- [ ] 所有原有功能保持正常
- [ ] API调用没有变化
- [ ] 权限检查正常工作
- [ ] 错误处理正常

## 部署步骤

1. **备份原文件**
   ```bash
   cp aity-uni-app-v2/src/pages/admin/ai-config.vue aity-uni-app-v2/src/pages/admin/ai-config.vue.backup
   ```

2. **替换文件**
   - 直接使用重构后的文件替换原文件

3. **测试验证**
   - 启动开发服务器
   - 访问AI配置管理页面
   - 逐一测试各项功能

4. **提交代码**
   ```bash
   git add aity-uni-app-v2/src/pages/admin/ai-config.vue
   git commit -m "refactor: 重构AI配置管理页面UI设计

   - 添加Tab切换（模型管理/提示词管理/连接测试）
   - 添加厂商下拉选择器
   - 优化操作按钮为文字按钮
   - 简化按钮文字
   - 提示词管理改为Tab页面
   - 连接测试改为独立Tab"
   ```

## 回滚方案

如果发现问题需要回滚：
```bash
cp aity-uni-app-v2/src/pages/admin/ai-config.vue.backup aity-uni-app-v2/src/pages/admin/ai-config.vue
```

## 后续优化建议

1. **搜索功能**
   - 添加模型搜索框
   - 快速定位特定模型

2. **批量操作**
   - 支持批量选择模型
   - 批量测试/批量更新

3. **操作历史**
   - 记录配置变更历史
   - 支持回滚操作

4. **导出导入**
   - 支持配置导出
   - 支持配置导入

5. **性能优化**
   - 虚拟滚动（大量模型时）
   - 懒加载（按需加载厂商数据）

## 相关文档
- [AI配置管理页面UI重构说明.md](./AI配置管理页面UI重构说明.md)
- [AI配置管理UI重构对比.md](./AI配置管理UI重构对比.md)

## 联系方式
如有问题，请联系开发团队。
