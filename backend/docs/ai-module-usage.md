# AI 模块使用文档

## 概述
AI 模块提供了 AI 模型配置管理和内容优化功能，支持管理员配置多个 AI 模型并使用 AI 优化文案内容。

## 数据库设置

### 1. 创建数据表
执行以下 SQL 文件创建 `ai_configs` 表：
```bash
mysql -u root -p 投研图灵室_test < backend/migrations/create_ai_configs_table.sql
```

### 2. 配置 AI 模型
在数据库中插入 AI 配置：
```sql
INSERT INTO ai_configs (
  model_name,
  display_name,
  api_key,
  base_url,
  prompt_template,
  is_active,
  default_version
) VALUES (
  'glm-4-flash',
  '智谱AI GLM-4 Flash',
  'your-actual-api-key',
  'https://open.bigmodel.cn/api/paas/v4',
  '请优化以下文案，使其更加专业和流畅：',
  TRUE,
  'ai_optimized'
);
```

## API 接口

### 1. 获取 AI 配置
**接口：** `GET /api/ai/config`

**权限：** 需要登录

**说明：**
- 管理员可以看到完整的配置信息（包括 API Key）
- 普通用户只能看到脱敏后的配置（API Key 显示为 `***hidden***`）

**响应示例：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "modelName": "glm-4-flash",
    "displayName": "智谱AI GLM-4 Flash",
    "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
    "apiKey": "your-actual-api-key", // 或 "***hidden***" (非管理员)
    "promptTemplate": "请优化以下文案，使其更加专业和流畅：",
    "isActive": true,
    "defaultVersion": "ai_optimized",
    "createdAt": "2026-02-27T00:00:00.000Z",
    "updatedAt": "2026-02-27T00:00:00.000Z"
  }
}
```

### 2. 更新 AI 配置
**接口：** `PUT /api/ai/config/:id`

**权限：** 仅管理员

**请求体：**
```json
{
  "modelName": "glm-4-flash",
  "displayName": "智谱AI GLM-4 Flash",
  "apiKey": "new-api-key",
  "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
  "promptTemplate": "请优化以下文案：",
  "isActive": true,
  "defaultVersion": "ai_optimized"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "AI配置更新成功",
  "data": {
    "id": 1,
    "modelName": "glm-4-flash",
    ...
  }
}
```

### 3. 测试 AI 连接
**接口：** `POST /api/ai/test-connection/:id`

**权限：** 仅管理员

**说明：** 测试指定 ID 的 AI 配置是否可以正常连接

**响应示例：**
```json
{
  "code": 200,
  "message": "AI连接测试成功",
  "data": {
    "status": "success",
    "message": "连接测试成功",
    "response": {
      "choices": [...]
    }
  }
}
```

### 4. 优化文案
**接口：** `POST /api/ai/optimize`

**权限：** 仅管理员

**请求体：**
```json
{
  "content": "原始文案内容"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "AI优化成功",
  "data": {
    "original": "原始文案内容",
    "optimized": "优化后的文案内容",
    "model": "glm-4-flash",
    "timestamp": "2026-02-27T00:00:00.000Z"
  }
}
```

## 支持的 AI 模型

### 智谱 AI (BigModel)
- **模型名称：** `glm-4-flash`
- **Base URL：** `https://open.bigmodel.cn/api/paas/v4`
- **API 文档：** https://open.bigmodel.cn/dev/api

### 其他兼容 OpenAI 格式的模型
只要是兼容 OpenAI Chat Completions API 格式的模型，都可以配置使用。

## 使用示例

### JavaScript/Node.js
```javascript
// 优化文案
const response = await fetch('/api/ai/optimize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    content: '这是一段需要优化的文案'
  })
});

const result = await response.json();
console.log(result.data.optimized);
```

### cURL
```bash
# 优化文案
curl -X POST http://localhost:3000/api/ai/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"这是一段需要优化的文案"}'

# 获取配置
curl -X GET http://localhost:3000/api/ai/config \
  -H "Authorization: Bearer YOUR_TOKEN"

# 更新配置（管理员）
curl -X PUT http://localhost:3000/api/ai/config/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"apiKey":"new-api-key"}'

# 测试连接（管理员）
curl -X POST http://localhost:3000/api/ai/test-connection/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 错误处理

### 常见错误码
- **400：** 请求参数错误
- **401：** 未登录或 Token 无效
- **403：** 权限不足（非管理员）
- **404：** AI 配置不存在
- **500：** 服务器内部错误
- **504：** AI API 请求超时

### 错误响应示例
```json
{
  "code": 500,
  "message": "AI API调用失败: Incorrect API key provided"
}
```

## 安全建议

1. **保护 API Key：**
   - 非管理员用户无法查看完整的 API Key
   - 建议使用环境变量存储 API Key，不要硬编码在代码中

2. **设置超时：**
   - 优化接口设置了 30 秒超时
   - 测试连接接口设置了 10 秒超时

3. **权限控制：**
   - 优化、更新配置、测试连接等敏感操作仅限管理员
   - 普通用户只能查看脱敏后的配置

## 配置建议

### 提示词模板
可以根据业务需求自定义提示词模板，例如：
- `"请优化以下文案，使其更加专业和流畅："`
- `"请将以下内容改写为更简洁的版本："`
- `"请为以下内容添加更多细节和说明："`

### 多模型配置
可以配置多个 AI 模型，通过 `isActive` 字段控制使用哪个模型：
```sql
INSERT INTO ai_configs (model_name, display_name, api_key, base_url, is_active)
VALUES
  ('glm-4-flash', '智谱AI Flash', 'key1', 'https://open.bigmodel.cn/api/paas/v4', TRUE),
  ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'key2', 'https://api.openai.com/v1', FALSE);
```

## 文件清单

创建的文件：
1. `D:\your-mcp-proxy\AITY_VIP\backend\src\models\AiConfig.js` - AI 配置数据模型
2. `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\aiConfigController.js` - AI 配置控制器
3. `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\aiOptimizeController.js` - AI 优化控制器
4. `D:\your-mcp-proxy\AITY_VIP\backend\src\routes\ai.js` - AI 路由
5. `D:\your-mcp-proxy\AITY_VIP\backend\migrations\create_ai_configs_table.sql` - 数据库迁移文件

修改的文件：
1. `D:\your-mcp-proxy\AITY_VIP\backend\src\index.js` - 注册 AI 路由
