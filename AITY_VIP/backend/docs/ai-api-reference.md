# AI 模块 API 快速参考

## 基础信息
- **基础路径：** `/api/ai`
- **认证方式：** JWT Bearer Token
- **响应格式：** JSON

## API 端点

### 1. 获取 AI 配置
```
GET /api/ai/config
权限：需要登录
说明：获取当前活跃的AI配置（管理员可见API Key）
```

### 2. 更新 AI 配置
```
PUT /api/ai/config/:id
权限：仅管理员
说明：更新指定ID的AI配置
Body: { modelName, displayName, apiKey, baseUrl, promptTemplate, isActive, defaultVersion }
```

### 3. 测试 AI 连接
```
POST /api/ai/test-connection/:id
权限：仅管理员
说明：测试指定ID的AI配置是否可以正常连接
```

### 4. 优化文案
```
POST /api/ai/optimize
权限：仅管理员
说明：使用AI优化文案内容
Body: { content: "要优化的内容" }
```

## 权限说明

### 用户角色
- `super_admin` - 超级管理员（全部权限）
- `admin` - 管理员（全部权限）
- `vip_mid` - 中期VIP（仅查看）
- `vip_short` - 短期VIP（仅查看）
- `trial` - 试用用户（仅查看）

### 权限矩阵
| 接口 | 普通用户 | 管理员 |
|-----|---------|-------|
| GET /api/ai/config | ✓ (脱敏) | ✓ (完整) |
| PUT /api/ai/config/:id | ✗ | ✓ |
| POST /api/ai/test-connection/:id | ✗ | ✓ |
| POST /api/ai/optimize | ✗ | ✓ |

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

### 错误响应
```json
{
  "code": 400/401/403/404/500,
  "message": "错误信息"
}
```

## 使用示例

### 1. 获取配置
```bash
curl -X GET http://localhost:3000/api/ai/config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 优化文案
```bash
curl -X POST http://localhost:3000/api/ai/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"需要优化的文案"}'
```

### 3. 更新配置
```bash
curl -X PUT http://localhost:3000/api/ai/config/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "apiKey": "new-api-key",
    "promptTemplate": "请优化以下文案："
  }'
```

### 4. 测试连接
```bash
curl -X POST http://localhost:3000/api/ai/test-connection/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 数据模型

### AiConfig 表结构
```javascript
{
  id: INT (PK, AUTO_INCREMENT),
  modelName: STRING(50) (NOT NULL, UNIQUE),
  displayName: STRING(100),
  apiKey: STRING(255) (NOT NULL),
  baseUrl: STRING(255) (NOT NULL),
  promptTemplate: TEXT,
  isActive: BOOLEAN (DEFAULT true),
  defaultVersion: ENUM('original', 'ai_optimized') (DEFAULT 'ai_optimized'),
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

## 错误码说明
- `400` - 请求参数错误
- `401` - 未登录或Token无效
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误
- `504` - AI API请求超时

## 支持的AI模型
- 智谱AI (glm-4-flash)
- OpenAI (gpt-3.5-turbo, gpt-4)
- 其他兼容OpenAI格式的模型

## 注意事项
1. API调用超时时间为30秒
2. 测试连接超时时间为10秒
3. 非管理员用户无法查看完整的API Key
4. 需要先在数据库中配置AI模型信息
