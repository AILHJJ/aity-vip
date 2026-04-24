<!--
 * @Author: fuli fuli@example.com
 * @Date: 2026-03-04 11:07:20
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-03-04 11:08:39
 * @FilePath: \your-mcp-proxy\AITY_VIP\docs\行情图嵌入文档.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# 行情图嵌入文档

## 一、行情图嵌入URL

### 基础URL
```
https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail
```

### 参数说明
| 参数 | 类型 | 必选 | 说明 | 示例值 |
|------|------|------|------|--------|
| code | String | 是 | 股票代码 | 300162 |
| setcode | Number | 是 | 市场代码 | 0 |
| opentype | String | 否 | 打开方式 | native |

### 完整示例
```
https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail?code=300162&setcode=0&opentype=native
```

## 二、市场代码获取规则

### 核心规则
市场代码（setcode）必须且只能根据证券代码的前缀，通过以下规则生成：

| 交易所 | 证券代码前缀 | 市场代码 | 示例 |
|--------|-------------|----------|------|
| 上海交易所 | 以'6'开头（包括600/601/603/605/688等） | 1 | 600519（贵州茅台）、688318（财富趋势） |
| 深圳交易所 | 以'0'或'3'开头（包括000/002/003/300/301等） | 0 | 300750（宁德时代）、000001（平安银行） |
| 北京交易所 | 以'8'或'92'开头（包括83/87/88/920等） | 2 | 920035（N精创）、831010（凯添燃气） |

### 实现逻辑
```javascript
function getMarketCode(stockCode) {
  const code = String(stockCode);
  if (code.startsWith('6')) {
    return 1; // 上海交易所
  } else if (code.startsWith('0') || code.startsWith('3')) {
    return 0; // 深圳交易所
  } else if (code.startsWith('8') || code.startsWith('92')) {
    return 2; // 北京交易所
  } else {
    return 0; // 默认值，可根据实际情况调整
  }
}
```

## 三、集成建议

### 在消息详情页面集成
1. **识别股票代码**：从消息内容中提取股票代码
2. **判断市场代码**：使用上述规则生成市场代码
3. **构建URL**：拼接成完整的行情图URL
4. **嵌入方式**：
   - 使用iframe嵌入
   - 使用WebView打开
   - 提供链接跳转到外部浏览器

### 示例代码
```javascript
// 提取股票代码（示例）
function extractStockCode(text) {
  const stockCodeRegex = /[0-9]{6}/g;
  const matches = text.match(stockCodeRegex);
  return matches ? matches[0] : null;
}

// 生成行情图URL
function generateMarketChartUrl(stockCode) {
  const setcode = getMarketCode(stockCode);
  return `https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail?code=${stockCode}&setcode=${setcode}&opentype=native`;
}

// 使用示例
const stockCode = extractStockCode('宁德时代(300750)今日涨幅不错');
if (stockCode) {
  const chartUrl = generateMarketChartUrl(stockCode);
  console.log('行情图URL:', chartUrl);
  // 这里可以将URL嵌入到页面中
}
```

## 四、注意事项

1. **数据准确性**：行情数据由通达信提供，仅供参考，不作为投资决策依据
2. **网络连接**：需要确保设备能够访问外部网络
3. **响应时间**：首次加载可能需要一定时间，请做好加载状态提示
4. **兼容性**：在不同设备和浏览器上可能存在显示差异
5. **用户体验**：建议在嵌入时设置合适的宽度和高度，确保良好的显示效果

## 五、更新记录

### 2026-03-04
- 创建文档
- 记录行情图嵌入URL格式
- 整理市场代码判断规则
- 提供集成建议和示例代码