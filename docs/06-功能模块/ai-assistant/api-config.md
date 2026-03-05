# AI 模型 API 配置文档

> 整理日期：2025-02-27
> 用途：AITY VIP 系统 AI 文案优化功能

---

## 可用 API 汇总

### 1. 火山引擎（字节跳动）

**Base URL**: `https://ark.cn-beijing.volces.com/api/v3`

**API Key**: `d2d9a61f-6c5a-4f48-a7e7-364c430b0219`

**可用模型**:
| 模型 | 模型 ID | 特点 | 适用场景 |
|------|---------|------|---------|
| DeepSeek-V3 | `openai/deepseek-v3-2-251201` | 逻辑严密，分析能力强 | 专业分析、深度思考 |
| GLM-4.7 | `openai/glm-4-7-251222` | 思维敏捷，决策果断 | 快速响应、策略制定 |
| 豆包 1.5 Pro | `openai/doubao-1-5-pro-32k-250115` | 活泼开朗，风趣幽默 | 轻松风格、通俗表达 |

**调用格式** (OpenAI 兼容):
```javascript
{
  "model": "openai/deepseek-v3-2-251201",
  "messages": [{"role": "user", "content": "..."}]
}
```

---

### 2. 阿里云通义千问

**Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`

**API Key**: `sk-9bb1a10d39fc422bb488fab313d3ba23`

**可用模型**:
| 模型 | 模型 ID | 特点 | 适用场景 |
|------|---------|------|---------|
| Qwen-Plus | `openai/qwen-plus` | 激进主动，自信强势 | 有力表达、重点突出 |
| Qwen3-14B | `openai/qwen3-14b` | 反应迅速，推理准确 | 快速优化、简洁表达 |

**调用格式** (OpenAI 兼容):
```javascript
{
  "model": "openai/qwen-plus",
  "messages": [{"role": "user", "content": "..."}]
}
```

---

### 3. 智谱 AI (GLM)

**Base URL**: `https://open.bigmodel.cn/api/paas/v4/`

**API Key**: `52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl`

**可用模型**:
| 模型 | 模型 ID | 特点 | 适用场景 |
|------|---------|------|---------|
| GLM-4 | `glm-4` | 稳重谨慎，风险控制 | 稳健表达、专业严谨 |
| GLM-4-Flash | `glm-4-flash` | 快速响应，性价比高 | 日常优化、批量处理 |

**调用格式** (智谱专用):
```javascript
{
  "model": "glm-4-flash",
  "messages": [{"role": "user", "content": "..."}]
}
```

---

## 推荐配置

### 文案优化推荐

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| **日常优化** | GLM-4-Flash | 速度快、成本低 |
| **专业分析** | DeepSeek-V3 | 逻辑严密、分析深入 |
| **通俗表达** | 豆包 1.5 Pro | 语言活泼、易理解 |
| **简洁风格** | Qwen3-14B | 响应快、表达精准 |

---

## 安全注意事项

1. **API Key 保护**：不要在前端暴露 API Key
2. **调用限制**：注意各平台的调用频率限制
3. **费用监控**：定期检查 API 调用费用
4. **备用方案**：配置多个模型以便切换

---

## 后端调用示例

```javascript
// 火山引擎
const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer d2d9a61f-6c5a-4f48-a7e7-364c430b0219',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/deepseek-v3-2-251201',
    messages: [{ role: 'user', content: '优化这段文字...' }]
  })
});

// 智谱 AI
const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 52757e59510747dca81bb32c60bfb445.l0eRqzr0XcRYKaFl',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'glm-4-flash',
    messages: [{ role: 'user', content: '优化这段文字...' }]
  })
});
```
