# Markdown渲染规范文档

## 概述

本文档定义了AITY uni-app v2项目中Markdown渲染的标准和最佳实践，基于增强的`markdown-renderer.js`工具类实现。

**适用范围**: 所有需要显示富文本内容的页面和组件

---

## 一、支持的Markdown语法

### 1.1 标题 (Headings)

**语法**:
```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

**渲染效果**:
- H1: 40rpx, 底部加粗边框
- H2: 36rpx, 底部细边框
- H3-H6: 渐进式缩小字号

**使用场景**:
- H1: 页面主标题（很少使用）
- H2: 章节标题
- H3: 小节标题
- H4-H6: 子标题（按需使用）

**注意事项**:
- 每个标题前后应有空行
- 不要跳级使用（如H1后直接用H3）

### 1.2 文本样式

#### 1.2.1 粗体 (Bold)

**语法**:
```markdown
**这是粗体文本**
__这也是粗体__
```

**渲染效果**:
```html
<strong>这是粗体文本</strong>
```

**CSS样式**:
```css
font-weight: 600;
color: #333333;
```

#### 1.2.2 斜体 (Italic)

**语法**:
```markdown
*这是斜体文本*
_这也是斜体_
```

**渲染效果**:
```html
<em>这是斜体文本</em>
```

**CSS样式**:
```css
font-style: italic;
color: #555555;
```

#### 1.2.3 删除线 (Strikethrough)

**语法**:
```markdown
~~这是删除的文本~~
```

**渲染效果**:
```html
<del>这是删除的文本</del>
```

**CSS样式**:
```css
text-decoration: line-through;
color: #999999;
```

#### 1.2.4 组合使用

**语法**:
```markdown
***粗斜体***
**粗体*包含斜体***
~~删除~~的**粗体**
```

### 1.3 代码 (Code)

#### 1.3.1 行内代码 (Inline Code)

**语法**:
```markdown
使用`const`声明常量
```

**渲染效果**:
```html
使用<code class="inline-code">const</code>声明常量
```

**CSS样式**:
```css
background: #f6f8fa;
color: #e83e8c;
padding: 4rpx 8rpx;
border-radius: 4rpx;
font-family: 'Consolas', 'Monaco', monospace;
```

**使用场景**:
- 变量名: `userName`
- 函数名: `getData()`
- 文件名: `config.json`
- 路径: `/usr/local/bin`

#### 1.3.2 代码块 (Code Block)

**语法**:
````markdown
```javascript
function hello() {
  console.log('Hello, World!')
}
```
````

**支持的语法标识**:
- `javascript` / `js`
- `python` / `py`
- `java`
- `cpp` / `c++`
- `css`
- `html`
- `json`
- `bash` / `sh`
- `sql`
- 或任何其他文本（纯文本）

**渲染效果**:
```html
<pre class="code-block" data-language="javascript">
  <code class="language-javascript">
    function hello() {
      console.log('Hello, World!')
    }
  </code>
</pre>
```

**CSS样式**:
```css
background: #282c34;
color: #abb2bf;
padding: 20rpx;
border-radius: 8rpx;
overflow-x: auto;
font-family: 'Consolas', 'Monaco', monospace;
font-size: 26rpx;
line-height: 1.6;
```

**注意事项**:
- 代码块前后应有空行
- 代码块内的HTML会被转义
- 支持水平滚动（长代码行）

### 1.4 列表 (Lists)

#### 1.4.1 无序列表 (Unordered List)

**语法**:
```markdown
- 第一项
- 第二项
  - 子项 2.1
  - 子项 2.2
- 第三项
```

**或使用**:
```markdown
* 第一项
* 第二项

或

+ 第一项
+ 第二项
```

**渲染效果**:
```html
<ul class="list-unstyled">
  <li class="list-item">第一项</li>
  <li class="list-item">第二项</li>
</ul>
```

**CSS样式**:
```css
padding-left: 40rpx;
margin: 16rpx 0;
```

#### 1.4.2 有序列表 (Ordered List)

**语法**:
```markdown
1. 第一项
2. 第二项
3. 第三项
```

**渲染效果**:
```html
<ol class="list-ordered">
  <li class="list-item-ordered" value="1">第一项</li>
  <li class="list-item-ordered" value="2">第二项</li>
</ol>
```

**注意事项**:
- 列表项之间可以有空行
- 支持嵌套列表（使用缩进）
- 列表项内可以包含其他Markdown元素

### 1.5 表格 (Tables)

**语法**:
```markdown
| 列1 | 列2 | 列3 |
|:---|:---:|---:|
| 左对齐 | 居中 | 右对齐 |
| 内容1 | 内容2 | 内容3 |
```

**对齐方式**:
- `:---` 左对齐（默认）
- `:---:` 居中对齐
- `---:` 右对齐

**渲染效果**:
```html
<table class="markdown-table">
  <thead>
    <tr>
      <th>列1</th>
      <th>列2</th>
      <th>列3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>左对齐</td>
      <td>居中</td>
      <td>右对齐</td>
    </tr>
  </tbody>
</table>
```

**CSS样式**:
```css
.markdown-table {
  width: 100%;
  border-collapse: collapse;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
  margin: 24rpx 0;
}

.markdown-table th {
  background: linear-gradient(to bottom, #f8f9fa, #f5f5f5);
  font-weight: 600;
  padding: 12rpx 16rpx;
}

.markdown-table tr:nth-child(even) {
  background: #fafafa;
}

.markdown-table tr:hover {
  background: #f0f2ff;
}
```

**注意事项**:
- 表格必须有表头分隔行
- 单元格内可以使用其他Markdown语法
- 空单元格使用空格

### 1.6 引用 (Blockquotes)

**语法**:
```markdown
> 这是一段引用文本
>
> 可以有多行
>
> > 嵌套引用
```

**渲染效果**:
```html
<blockquote>
  这是一段引用文本
  <br>
  可以有多行
</blockquote>
```

**CSS样式**:
```css
margin: 16rpx 0;
padding: 16rpx 20rpx;
background: #f0f2ff;
border-left: 4rpx solid #667eea;
color: #555555;
font-style: italic;
```

**使用场景**:
- 引用他人的话
- 重要提示
- 注意事项
- 警告信息

### 1.7 链接 (Links)

**语法**:
```markdown
[链接文本](https://example.com)
[带标题的链接](https://example.com "鼠标悬停提示")
```

**渲染效果**:
```html
<a href="https://example.com" class="link" target="_blank">链接文本</a>
```

**CSS样式**:
```css
color: #667eea;
text-decoration: none;
border-bottom: 1rpx dashed #667eea;
}

.link:active {
  color: #764ba2;
  border-bottom-style: solid;
}
```

**注意事项**:
- 所有链接自动添加`target="_blank"`
- 特殊字符需要转义
- 支持相对路径和绝对路径

### 1.8 图片 (Images)

**语法**:
```markdown
![替代文本](https://example.com/image.jpg)
![带标题的图片](https://example.com/image.jpg "图片标题")
```

**渲染效果**:
```html
<img src="https://example.com/image.jpg" alt="替代文本" class="markdown-image">
```

**CSS样式**:
```css
max-width: 100%;
height: auto;
border-radius: 8rpx;
margin: 16rpx 0;
```

**注意事项**:
- `alt`属性是必需的（用于无障碍访问）
- 支持本地图片和远程图片
- 建议使用webp格式优化加载

### 1.9 水平分割线 (Horizontal Rules)

**语法**:
```markdown
---
***
___
```

**渲染效果**:
```html
<hr class="divider">
```

**CSS样式**:
```css
border: none;
border-top: 2rpx solid #e0e0e0;
margin: 32rpx 0;
```

---

## 二、扩展功能

### 2.1 金融数据格式化

#### 2.1.1 涨跌幅颜色

**自动颜色规则**:
- 正数（> 0）: 红色 `#ff4d4f`
- 负数（< 0）: 绿色 `#52c41a`
- 零（= 0）: 灰色 `#666666`

**使用方法**:
```javascript
import { DataFormatter } from '@/utils/markdown-renderer'

// 在渲染前格式化数据
const formatted = DataFormatter.formatChange('2.56', null, '%')
// 返回: <span class="text-up">2.56%</span>
```

#### 2.1.2 大数值转换

**自动转换规则**:
- ≥ 1,0000万 → "X亿"
- ≥ 10,000 → "X万"
- < 10,000 → 原值

**使用方法**:
```javascript
const formatted = DataFormatter.formatBigNumber('123456789')
// 返回: "1.23亿"
```

#### 2.1.3 表格智能格式化

**自动识别的列名模式**:

| 列名包含 | 格式化方式 | 示例 |
|---------|----------|------|
| 涨跌幅、涨幅 | 百分比+颜色 | 2.56% → <span class="text-up">2.56%</span> |
| 现价、价格 | 保留2位小数 | 12.345 → 12.35 |
| 成交额、市值、资金 | 万/亿转换 | 123456789 → 1.23亿 |
| 日期 | 日期格式化 | 20260206 → 2026-02-06 |

---

## 三、最佳实践

### 3.1 代码示例

#### ✅ 推荐做法

```markdown
## 函数说明

`getData`函数用于获取用户信息。

**参数**:
- `userId`: 用户ID（必填）
- `options`: 配置选项（可选）

**返回值**: 用户对象

```javascript
const user = await getData('123', {
  includeProfile: true
})
```
```

#### ❌ 不推荐做法

```markdown
#大标题
**粗体**太多了显得**很乱**~~删除~~
代码没有`language`标识
```
```

### 3.2 表格设计

#### ✅ 推荐做法

```markdown
| 股票名称 | 代码 | 现价 | 涨跌幅 |
|:---|---:|---:|---:|
| 平安银行 | 000001 | 12.34 | 2.56% |
| 招商银行 | 600036 | 35.67 | -1.23% |
```

- 表头明确
- 对齐合理（名称左对齐，数字右对齐）
- 数值保留合适的小数位

#### ❌ 不推荐做法

```markdown
|a|b|c|
|x|y|z|
```

- 列名不清晰
- 没有对齐方式
- 数据格式不统一

### 3.3 列表使用

#### ✅ 推荐做法

```markdown
功能特性:
1. 支持多种语法高亮
2. 自动识别表格格式
3. 智能数据格式化

使用方法:
- 安装依赖包
- 导入工具类
- 调用渲染方法
```

#### ❌ 不推荐做法

```markdown
功能特性:
1.支持多种语法高亮
2.自动识别表格格式
使用方法:
-安装依赖包
-导入工具类
```

- 项与编号之间缺少空格
- 列表项之间应有空行分隔

---

## 四、性能优化

### 4.1 渲染性能

**优化建议**:

1. **避免过度嵌套**
   ```markdown
   ❌ 不推荐: > > > 嵌套过深
   ✅ 推荐: > 最多嵌套2层
   ```

2. **合理使用代码块**
   ```markdown
   ❌ 不推荐: 每行代码都用行内代码
   ✅ 推荐: 多行代码使用代码块
   ```

3. **表格大小控制**
   ```markdown
   ❌ 不推荐: 超过50行的表格
   ✅ 推荐: 限制显示前20行，提供"查看更多"
   ```

### 4.2 加载性能

**优化建议**:

1. **图片优化**
   - 使用webp格式
   - 限制图片尺寸（最大宽度1000px）
   - 使用懒加载（lazy loading）

2. **代码高亮延迟加载**
   - 首次渲染不加载高亮库
   - 用户滚动到时才加载

3. **表格分页**
   - 大表格分页显示
   - 提供"导出Excel"功能

---

## 五、调试和测试

### 5.1 常见问题

#### 问题1: 表格渲染不正确

**原因**: 表格语法不规范

**解决**:
```markdown
❌ 错误: |列1|列2  (缺少结尾的|)
✅ 正确: |列1|列2|
```

#### 问题2: 代码块不显示

**原因**: 代码块前后缺少空行

**解决**:
```markdown
❌ 错误:
文本```javascript
code
```

✅ 正确:
文本

```javascript
code
```
```

#### 问题3: 链接无法点击

**原因**: 使用了错误的链接语法

**解决**:
```markdown
❌ 错误: [链接] url
✅ 正确: [链接](url)
```

### 5.2 测试检查表

使用以下清单验证Markdown渲染质量:

**基础语法**:
- [ ] 标题层级正确
- [ ] 粗体/斜体显示正确
- [ ] 代码块语法高亮
- [ ] 链接可点击
- [ ] 图片显示正常

**表格功能**:
- [ ] 表头和数据行区分明显
- [ ] 对齐方式正确
- [ ] 斑马纹显示
- [ ] 悬停效果

**性能**:
- [ ] 大文档(<10KB)渲染<100ms
- [ ] 内存占用增长<5MB
- [ ] 滚动流畅

**兼容性**:
- [ ] iOS Safari正常
- [ ] Android Chrome正常
- [ ] 微信浏览器正常

---

## 六、API参考

### 6.1 MarkdownRenderer类

```javascript
import { MarkdownRenderer } from '@/utils/markdown-renderer'

// 渲染Markdown为HTML
static render(content: string): string
```

**参数**:
- `content`: Markdown格式的字符串

**返回**:
- HTML字符串

**示例**:
```javascript
const html = MarkdownRenderer.render('# Hello\n\n**粗体**文本')
// <h1>Hello</h1><br><strong>粗体</strong>文本
```

### 6.2 DataFormatter工具

```javascript
import { DataFormatter } from '@/utils/markdown-renderer'

// 格式化涨跌幅
static formatChange(value: string|number, compareValue: string|number, unit: string): string

// 格式化大数值
static formatBigNumber(value: string|number, precision: number): string

// 格式化百分比
static formatPercent(value: string|number, precision: number): string

// 格式化日期
static formatDate(dateStr: string, format: number): string
```

**参数说明**:
- `value`: 要格式化的值
- `compareValue`: 比较基准（用于颜色判断）
- `unit`: 单位（如%, 亿, 万）
- `precision`: 精度（小数位数）
- `format`: 日期格式（1=YYYY-MM-DD, 2=MM-DD, 3=YYYY）

### 6.3 FinancialTableParser类

```javascript
import { FinancialTableParser } from '@/utils/markdown-renderer'

// 解析金融表格JSON
static parse(content: string): object|null

// 渲染金融表格HTML
static render(tableData: object): string
```

---

## 七、版本历史

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v1.0.0 | 2026-02-06 | 初始版本，支持完整Markdown语法 |

---

## 八、相关文档

- [AI投顾渲染优化完整报告](./AI投顾渲染优化完整报告.md)
- [金融数据格式文档](./金融数据格式文档.md)
- [CommonMark规范](https://spec.commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-06
**维护者**: AITY开发团队
