// 创建占位图标的说明文档

# TabBar图标说明

## 当前状态
由于没有实际的图标文件，有两个解决方案：

### 方案1: 使用emoji作为图标（快速解决）
修改 pages.json，移除iconPath配置，使用纯文字tabBar

### 方案2: 创建简单的占位图标
使用在线工具生成图标，或使用emoji转换工具

## 推荐方案：移除图标配置

对于开发测试阶段，可以先移除图标配置：

```json
"tabBar": {
  "color": "#7A7E83",
  "selectedColor": "#007AFF",
  "borderStyle": "black",
  "backgroundColor": "#F8F8F8",
  "list": [
    {
      "pagePath": "pages/messages/messages",
      "text": "消息"
    },
    {
      "pagePath": "pages/discussions/discussions",
      "text": "讨论"
    },
    {
      "pagePath": "pages/ai-advisor/ai-advisor",
      "text": "AI投顾"
    },
    {
      "pagePath": "pages/profile/profile",
      "text": "我的"
    }
  ]
}
```

## 后续优化
- 使用iconfont或iconpark等图标库
- 设计专业的tabBar图标
- 确保图标尺寸：81px * 81px
