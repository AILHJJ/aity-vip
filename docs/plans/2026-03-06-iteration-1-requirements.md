# 迭代1 需求文档

> **创建日期**: 2026-03-06
> **分支**: feature/iteration-1
> **状态**: 进行中

---

## 一、已完成功能

### 1.1 股票代码关联功能

#### 需求描述
在消息发布页面支持股票代码关联，用户可以手动添加或输入股票代码。

#### 实现内容
- **文件**: `create-message.vue`
- 支持手动添加股票代码（6位数字）
- 自动识别股票市场：6开头=上海，0/3开头=深圳，8/92开头=北京
- 显示股票卡片列表，支持删除操作
- 编辑模式自动加载已有股票代码

#### 股票代码验证规则
```javascript
const isValidStockCodePrefix = (code) => {
    const firstChar = code.charAt(0)
    if (firstChar === '6') return true  // 上海
    if (firstChar === '0' || firstChar === '3') return true  // 深圳
    if (firstChar === '8') return true  // 北京
    if (code.startsWith('92')) return true  // 北京
    return false
}
```

### 1.2 股票代码自动转换（方案B）

#### 需求描述
发布消息时，自动扫描内容中的股票代码并转换为标签格式。

#### 实现内容
- **文件**: `create-message.vue`
- 正则匹配6位数字（排除已标记的和无效前缀）
- 自动转换为 `$个股(代码)$` 格式
- 避免与手动添加的股票代码重复

#### 正则表达式
```javascript
const stockCodeRegex = /(?<!\$个股\()(?<![A-Z(])([0-9]{6})(?!\)\$)(?![)0-9])/g
```

### 1.3 股票代码高亮显示（方案C）

#### 需求描述
在消息详情页面，股票代码标签显示为高亮样式，带有市场标识。

#### 实现内容
- **文件**: `markdown-renderer.js`
- 将 `$个股(代码)$` 转换为带样式的span标签
- 显示市场标识（沪/深/京）
- 市场颜色：沪市红色，深市绿色，京市橙色

#### 样式效果
```html
<span style="display: inline-flex; background: gradient; border: 2rpx solid #3b82f6; border-radius: 8rpx;">
    <span style="background: #ef4444;">沪</span>
    688318
</span>
```

### 1.4 风险提示UI优化

#### 需求描述
消息详情页面的风险提示需要优化为专业金融风格。

#### 实现内容
- **文件**: `message-detail.vue`
- 采用图标+标题+内容布局
- 专业金融风格设计

#### UI结构
```html
<view class="risk-disclaimer">
    <view class="disclaimer-left">
        <text class="disclaimer-icon">⚠</text>
    </view>
    <view class="disclaimer-content">
        <text class="disclaimer-title">风险提示</text>
        <text class="disclaimer-text">本内容仅供参考...</text>
    </view>
</view>
```

### 1.5 深色模式主题系统（基础设施）

#### 需求描述
实现深色模式支持，采用品宣方案视觉风格。

#### 实现内容
- **Store**: `store/theme.js` - 主题状态管理
- **CSS变量**: `styles/theme-variables.scss` - 主题变量定义
- **App.vue**: 主题初始化
- **profile.vue**: 主题设置入口

#### 支持模式
- 浅色模式 (light)
- 深色模式 (dark)
- 跟随系统 (system)

#### 深色模式色彩
| 用途 | 深色模式值 |
|------|-----------|
| 背景主色 | `#020617` |
| 卡片背景 | `rgba(30,41,59,0.4)` |
| 玻璃效果 | `rgba(30,41,59,0.4)` |
| 文字主色 | `#e2e8f0` |
| 强调蓝色 | `#60a5fa` |

---

## 二、进行中功能

### 2.1 深色模式页面适配

#### 需求描述
将各页面组件改造为使用CSS变量，实现深色模式完整效果。

#### 待改造页面
- [ ] 首页 (home)
- [ ] 消息列表 (messages)
- [ ] 消息详情 (message-detail) - 部分完成
- [ ] 发布消息 (create-message)
- [ ] 个人中心 (profile)
- [ ] 行情中心 (market)

#### 改造方式
将硬编码颜色替换为CSS变量：
```scss
// Before
background: #f5f5f5;
color: #333333;

// After
background: var(--bg-primary);
color: var(--text-primary);
```

---

## 三、待开发功能

### 3.1 高级深色模式效果

#### 需求描述
在深色模式下实现品宣方案的高级视觉效果。

#### 功能列表
- [ ] 玻璃拟态卡片 (`backdrop-filter: blur(12px)`)
- [ ] 霓虹光效边框
- [ ] 网格背景
- [ ] 渐变光球动画（可选，性能考虑）

### 3.2 其他优化

- [ ] 移除"查看行情"按钮（用户可直接点击股票卡片）
- [ ] 消息编辑页移除消息类型提示文字

---

## 四、技术决策记录

### 4.1 主题系统方案选择

**决策**: 采用CSS变量 + SCSS混合方案

**原因**:
1. 性能最佳，无需重新编译
2. 小程序兼容性好
3. 易于维护
4. 切换无闪烁

**备选方案**:
- 双样式表方案（维护成本高）
- UniApp原生darkmode（功能有限）

### 4.2 股票代码验证规则

**决策**: 仅验证前缀，不验证完整代码

**原因**:
1. 避免误识别非股票6位数字
2. 简单有效
3. 符合A股市场规则

---

## 五、文件变更记录

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `store/theme.js` | 新增 | 主题状态管理 |
| `styles/theme-variables.scss` | 新增 | CSS变量定义 |
| `App.vue` | 修改 | 主题初始化 |
| `pages/profile/profile.vue` | 修改 | 添加主题设置入口 |
| `pages/create-message/create-message.vue` | 修改 | 股票代码自动转换 |
| `pages/message-detail/message-detail.vue` | 修改 | 风险提示UI、股票验证 |
| `utils/markdown-renderer.js` | 修改 | 股票代码高亮渲染 |

---

## 六、Git提交记录

```
c0f7544 refactor: 优化股票关联UI为专业金融风格，移除编辑页风险提示
24a6a3a feat: 实现消息发布页面股票代码关联功能
372bf2d feat(theme): 实现深色模式主题系统
[待提交] feat(message): 实现股票代码自动转换与高亮显示
```

---

## 七、后续工作

1. **优先级高**: 完成各页面深色模式适配
2. **优先级中**: 实现玻璃拟态等高级效果
3. **优先级低**: 性能优化、动画效果

---

## 八、参考资料

- [品宣方案原型](../design/prototypes/品宣方案.html)
- [消息发布原型](../design/prototypes/create-message-prototype-professional.html)
- [项目工作流程](../../.claude/WORKFLOW.md)
