# Markdown渲染功能快速开始指南

## 功能概述

消息详情页面现已支持完整的Markdown渲染，并提供六种精美主题供选择。

## 使用方法

### 1. 查看渲染效果

1. 打开任意包含Markdown格式的消息详情页
2. 内容会自动按Markdown格式渲染
3. 默认使用"简约白"主题

### 2. 切换主题

在消息详情页：

1. 点击"🎨 主题样式"选择器
2. 从六种主题中选择：
   - **简约白** - 简洁清爽，适合日常阅读
   - **GitHub** - 开发者熟悉的风格
   - **翡翠绿** - 清新护眼，绿色主题
   - **蓝色海洋** - 深邃海洋，专业风格
   - **暖阳橙** - 温暖活力，橙色主题
   - **暗夜模式** - 护眼暗色，夜间阅读
3. 主题会自动保存，下次访问时生效

## 支持的Markdown语法

### 文本样式
```markdown
**粗体文本**
*斜体文本*
~~删除线~~
```

### 代码
````markdown
行内代码：`code`

代码块：
```javascript
function hello() {
  console.log('Hello!')
}
```
````

### 列表
```markdown
- 无序列表项1
- 无序列表项2

1. 有序列表项1
2. 有序列表项2
```

### 表格
```markdown
| 列1 | 列2 | 列3 |
|:---|:---:|---:|
| 左对齐 | 居中 | 右对齐 |
| 内容1 | 内容2 | 内容3 |
```

### 引用
```markdown
> 这是一段引用文本
```

### 其他
- 标题：`# 一级标题` 到 `###### 六级标题`
- 链接：`[链接文本](https://example.com)`
- 图片：`![图片描述](https://example.com/image.jpg)`
- 分割线：`---`

## 在其他页面使用

### 步骤1: 导入样式和组件

```vue
<style lang="scss" scoped>
@import '@/styles/markdown-themes.scss';
</style>
```

```javascript
import { MarkdownRenderer } from '@/utils/markdown-renderer'
import MarkdownThemeSelector from '@/components/MarkdownThemeSelector.vue'
```

### 步骤2: 添加逻辑

```javascript
const markdownTheme = ref('default')

const renderedContent = computed(() => {
  if (!content) return ''
  return MarkdownRenderer.render(content)
})

const handleThemeChange = (newTheme) => {
  markdownTheme.value = newTheme
}
```

### 步骤3: 使用组件

```vue
<template>
  <!-- 主题选择器 -->
  <MarkdownThemeSelector v-model="markdownTheme" @change="handleThemeChange" />

  <!-- Markdown内容 -->
  <view :class="'markdown-theme-' + markdownTheme">
    <rich-text :nodes="renderedContent" class="markdown-content"></rich-text>
  </view>
</template>
```

## 文件说明

### 新增文件

- `src/styles/markdown-themes.scss` - 六种主题样式
- `src/components/MarkdownThemeSelector.vue` - 主题选择器组件
- `docs/02-功能文档/其他功能/Markdown渲染功能实现文档.md` - 完整文档

### 修改文件

- `src/pages/message-detail/message-detail.vue` - 集成Markdown渲染

### 现有文件（已存在）

- `src/utils/markdown-renderer.js` - Markdown渲染引擎

## 测试建议

创建一个包含各种Markdown语法的测试消息：

````markdown
# 测试标题

这是**粗体**和*斜体*以及~~删除线~~。

## 功能列表

- 完整的Markdown支持
- 六种精美主题
- 智能主题选择器

### 代码测试

```javascript
function test() {
  console.log('Markdown渲染测试')
}
```

| 特性 | 状态 |
|:-----|:-----|
| 标题 | ✅ |
| 列表 | ✅ |
| 代码 | ✅ |

> 引用文本测试

[链接测试](https://example.com)
````

## 常见问题

**Q: 为什么内容没有渲染？**
A: 检查内容是否为空，确认Markdown语法是否正确。

**Q: 主题样式不生效？**
A: 确保已导入 `@import '@/styles/markdown-themes.scss'`

**Q: 如何添加自定义主题？**
A: 在 `markdown-themes.scss` 中添加新的 `.markdown-theme-xxx` 类

## 相关资源

- [完整文档](./docs/02-功能文档/其他功能/Markdown渲染功能实现文档.md)
- [Markdown渲染规范](./docs/02-功能文档/其他功能/Markdown渲染规范.md)
- [mdnice开源项目](https://github.com/zhangbaby/markdown-nice)

---

**版本**: v1.0.0
**更新日期**: 2026-02-10
