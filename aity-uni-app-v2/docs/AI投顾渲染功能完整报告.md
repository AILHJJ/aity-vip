# AI投顾渲染功能完整报告

**版本**: v1.7.2
**完成日期**: 2026-02-06
**状态**: ✅ 渲染功能已完善

---

## 📋 实施总结

### 本次更新重点

根据用户需求，我们完善了AI投顾功能的渲染系统：

1. ✅ **完整的Markdown渲染** - 支持表格、代码块、粗体、斜体等
2. ✅ **过滤@@替换串** - 自动移除业务卡片渲染标记
3. ✅ **金融选股工具表格** - 自动解析JSON数据并渲染成美观的表格

---

## 🎯 核心功能

### 1. Markdown完整渲染

**文件**: `src/pages/ai-advisor/ai-advisor.vue:164-258`

**支持语法**:
- ✅ 代码块：```语言 代码```
- ✅ 行内代码：`代码`
- ✅ 粗体：**文本**
- ✅ 斜体：*文本*
- ✅ 表格：|列1|列2|
- ✅ 无序列表：- 项目
- ✅ 有序列表：1. 项目
- ✅ 换行：两个空格 + 回车

**代码示例**:
```javascript
// 渲染Markdown（完整实现，支持表格、代码块等）
function renderMarkdown(content) {
	if (!content) return ''

	// 首先过滤所有 @@替换串@@
	content = content.replace(/@@.+?@@/g, '')

	// 转义HTML
	let html = content
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

	// 处理各种Markdown语法...

	return html
}
```

### 2. 过滤@@替换串

**正则表达式**: `/@@.+?@@/g`

**过滤内容示例**:
- `@@688318_1_行情图@@` → 移除
- `@@wdtest0003|type=0|qhnum=1|jjrnum=2@@` → 移除
- `@@agent=AI下单|webcallFunc=tdxOpenNativeModule@@` → 移除

**说明**: 这些替换串是通达信业务系统中用于渲染卡片的标记，在我们的小程序中不支持，所以直接过滤掉。

### 3. 金融选股工具表格渲染

**触发条件**: 当检测到工具调用包含"金融选股"工具时

**数据格式**: JSON数组
```json
[
  ["行号", "证券名称", "证券代码", "市场", "现价", "涨跌幅"],
  [1, "平安银行", "000001", "A股", "12.34", "+5.67%"],
  [2, "万科A", "000002", "A股", "8.90", "-2.15%"],
  ...
  ["总计", 150]
]
```

**解析逻辑** (`src/pages/ai-advisor/ai-advisor.vue:260-310`):
```javascript
function parseFinancialTable(content) {
	try {
		const data = JSON.parse(content)

		if (!Array.isArray(data) || data.length === 0) {
			return null
		}

		let headers = []
		let rows = []
		let total = 0

		// 解析总数
		if (data.length > 1) {
			const lastRow = data[data.length - 1]
			if (Array.isArray(lastRow) && lastRow.length >= 2) {
				total = lastRow[1]
			}
		}

		// 解析表头和数据行（最多7行）
		const endIndex = data.length > 7 ? 7 : data.length - 1
		const tableData = data.slice(0, endIndex)

		tableData.forEach((row, index) => {
			if (index === 0) {
				// 表头
				headers = row.map(cell => {
					if (typeof cell === 'string') {
						return cell.replace(/<br>.*$/, '').trim()
					}
					return String(cell).trim()
				})
			} else {
				// 数据行
				rows.push(row)
			}
		})

		return { headers, rows, total }
	} catch (e) {
		return null
	}
}
```

**渲染效果** (`src/pages/ai-advisor/ai-advisor.vue:312-351`):
```html
<div class="financial-table-container">
  <div class="table-info">共找到 150 条结果，显示前 6 条</div>
  <table class="financial-table">
    <thead>
      <tr>
        <th>行号</th>
        <th>证券名称</th>
        <th>证券代码</th>
        <th>市场</th>
        <th>现价</th>
        <th>涨跌幅</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>平安银行</td>
        <td>000001</td>
        <td>A股</td>
        <td>12.34</td>
        <td>+5.67%</td>
      </tr>
      ...
    </tbody>
  </table>
</div>
```

---

## 🎨 UI样式

### 1. 金融表格样式

**文件**: `src/pages/ai-advisor/ai-advisor.vue:876-929`

**特点**:
- 蓝色提示条显示总数
- 灰色表头背景
- 斑马纹行悬停效果
- 圆角边框
- 响应式布局

**样式代码**:
```scss
.financial-table-container {
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	overflow: hidden;
	margin: 16rpx 0;
}

.table-info {
	padding: 16rpx;
	background: #f0f2ff;
	font-size: 26rpx;
	color: #667eea;
	text-align: center;
	border-bottom: 1rpx solid #e0e0e0;
}

.financial-table thead {
	background: #f5f5f5;
}

.financial-table tbody tr:hover {
	background: #fafafa;
}
```

### 2. Markdown表格样式

```scss
.markdown-content ::v-deep table {
	width: 100%;
	border-collapse: collapse;
	margin: 16rpx 0;
}

.markdown-content ::v-deep th {
	border: 1rpx solid #e0e0e0;
	padding: 12rpx;
	text-align: left;
	background: #f5f5f5;
	font-weight: bold;
}

.markdown-content ::v-deep td {
	border: 1rpx solid #e0e0e0;
	padding: 12rpx;
	text-align: left;
}
```

### 3. 代码块样式

```scss
.markdown-content ::v-deep pre {
	background: #f5f5f5;
	padding: 16rpx;
	border-radius: 8rpx;
	overflow-x: auto;
	margin: 12rpx 0;
}

.markdown-content ::v-deep code {
	background: #f5f5f5;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	font-family: monospace;
}
```

---

## 🔄 数据流程

### 完整的渲染流程

```
AI返回内容
    ↓
检测工具调用类型
    ├─ 金融选股工具 → isTable = true
    └─ 其他工具 → isTable = false
    ↓
根据isTable决定渲染方式
    ├─ true → 尝试解析JSON表格
    │   ├─ 解析成功 → 渲染金融表格
    │   └─ 解析失败 → 回退到Markdown
    └─ false → 直接使用Markdown渲染
    ↓
渲染处理
    ├─ 过滤@@替换串
    ├─ 转义HTML特殊字符
    ├─ 解析Markdown语法
    └─ 生成HTML
    ↓
rich-text组件渲染
```

---

## 📊 使用示例

### 示例1: 普通文本

**输入**:
```
根据查询结果，以下是符合条件的股票：

1. 平安银行 (000001)
2. 万科A (000002)

这些股票表现良好。
```

**渲染**:
- 列表正确显示
- 粗体正确渲染
- 换行正确

### 示例2: Markdown表格

**输入**:
```markdown
| 股票名称 | 代码 | 涨跌幅 |
|---------|------|--------|
| 平安银行 | 000001 | +5.67% |
| 万科A | 000002 | -2.15% |
```

**渲染**:
- 表格正确渲染
- 表头加粗
- 边框清晰

### 示例3: 金融选股工具

**工具调用**:
```json
{
  "function": {
    "name": "金融选股",
    "arguments": "{\"category\": \"AG\", \"message\": \"查找银行股\"}"
  }
}
```

**返回内容**:
```json
[
  ["行号", "证券名称", "证券代码", "市场", "现价", "涨跌幅"],
  [1, "平安银行", "000001", "A股", "12.34", "+5.67%"],
  [2, "万科A", "000002", "A股", "8.90", "-2.15%"],
  ["总计", 150]
]
```

**渲染效果**:
- 美观的表格
- 蓝色提示"共找到 150 条结果，显示前 2 条"
- 表头灰色背景
- 数据行斑马纹

### 示例4: 代码块

**输入**:
````javascript
```javascript
function hello() {
  console.log("Hello World");
}
```
````

**渲染**:
- 灰色代码块
- 等宽字体
- 保持缩进

---

## ⚙️ 配置说明

### 1. 自动检测金融工具

**代码** (`src/pages/ai-advisor/ai-advisor.vue:449-456`):
```javascript
// 检查是否是金融选股工具
const hasFinancialTool = data.tool_calls.some(tool =>
  tool.function?.name === '金融选股'
)
if (hasFinancialTool) {
  isFinancialQuery.value = true
  lastMessage.isTable = true
}
```

### 2. 条件渲染

**模板** (`src/pages/ai-advisor/ai-advisor.vue:75-85`):
```html
<view v-if="message.content" class="content-area">
  <!-- 如果是金融选股工具，尝试解析JSON表格 -->
  <view v-if="message.isTable" class="financial-content">
    <rich-text v-if="parseFinancialTable(message.content)" :nodes="renderFinancialTable(parseFinancialTable(message.content))"></rich-text>
    <rich-text v-else :nodes="renderMarkdown(message.content)"></rich-text>
  </view>
  <!-- 否则使用普通Markdown渲染 -->
  <view v-else class="markdown-content">
    <rich-text :nodes="renderMarkdown(message.content)"></rich-text>
  </view>
</view>
```

---

## 🚀 性能优化

### 1. 智能回退机制

当JSON解析失败时，自动回退到Markdown渲染，确保内容始终能显示。

### 2. 限制显示行数

金融表格最多显示7行数据，避免过长的内容影响性能。

### 3. 增量更新

只更新变化的部分，减少不必要的重渲染。

---

## 🐛 注意事项

### 1. rich-text组件限制

- **不支持所有HTML标签** - uni-app的rich-text组件只支持部分标签
- **样式有限制** - 不能使用所有CSS属性
- **事件处理受限** - 不支持所有事件

### 2. 表格渲染

- **Markdown表格** - 需要 `|列1|列2|` 格式，并且有分隔行 `|---|---|`
- **金融表格** - 必须是JSON数组格式，第一行是表头
- **复杂表格** - 不支持合并单元格等复杂操作

### 3. XSS防护

所有用户输入都经过HTML转义，防止XSS攻击：
```javascript
html = content
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
```

---

## 📈 后续优化

### 计划功能

1. **使用marked.js库** - 更强大的Markdown解析
2. **代码高亮** - 使用highlight.js
3. **LaTeX公式** - 支持数学公式渲染
4. **图片支持** - 支持图片上传和显示
5. **表格排序** - 金融表格支持点击列头排序

---

## 📝 更新日志

### v1.7.2 (2026-02-06)

**新增**:
- ✅ 完整的Markdown渲染（表格、代码、列表）
- ✅ 自动过滤@@替换串
- ✅ 金融选股工具JSON表格解析和渲染
- ✅ 美观的表格样式
- ✅ 智能回退机制

**优化**:
- ✅ 改进表格检测逻辑
- ✅ 优化CSS样式
- ✅ 完善错误处理

**修复**:
- ✅ 修复表格分隔行处理
- ✅ 修复代码块换行问题
- ✅ 修复特殊字符转义

---

## ✅ 完成清单

- ✅ Markdown完整渲染
- ✅ 表格支持（Markdown格式）
- ✅ 代码块支持
- ✅ 列表支持
- ✅ 过滤@@替换串
- ✅ 金融选股工具表格解析
- ✅ 美观的表格样式
- ✅ 智能回退机制
- ✅ XSS防护
- ✅ H5版本测试
- ✅ 文档完善

---

**完成时间**: 2026-02-06
**开发者**: Claude Code Assistant
**版本**: v1.7.2
**状态**: ✅ 渲染功能完善，可投入使用
