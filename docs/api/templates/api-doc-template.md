# [模块名称] API文档

## 文档信息
- **版本**: v1.0.0
- **最后更新**: YYYY-MM-DD
- **维护人**: @姓名
- **变更日志**: 见文档底部

---

## 一、接口概览

| 接口名称 | 方法 | 路径 | 说明 |
|---------|------|------|------|
| 接口1 | POST | /api/path | 接口说明 |

---

## 二、接口详情

### 1. [接口名称]

**基本信息**
- **接口路径**: `http://example.com/api/path`
- **请求方法**: POST
- **Content-Type**: application/json
- **认证方式**: 无需认证 / Bearer Token

**请求参数**
```json
{
  "param1": "value1",
  "param2": "value2"
}
```

**参数说明**
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| param1 | String | 是 | 参数说明 | "value1" |
| param2 | Number | 否 | 参数说明 | 123 |

**响应示例**
```json
{
  "code": 200,
  "data": {
    "field1": "value1"
  }
}
```

**字段说明**
| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| code | Number | 响应码 | 200 |
| data.field1 | String | 字段说明 | "value1" |

**调用示例**
```javascript
const response = await fetch('http://example.com/api/path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    param1: 'value1',
    param2: 123
  })
});
const data = await response.json();
console.log(data);
```

---

## 三、错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 400 | 参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 检查认证token |
| 404 | 资源不存在 | 检查请求路径 |
| 500 | 服务器错误 | 联系后端团队 |

---

## 四、变更日志

### v1.0.0 (YYYY-MM-DD)
- 🎉 初始版本
