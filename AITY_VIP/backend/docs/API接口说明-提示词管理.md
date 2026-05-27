# AI配置提示词管理 - API接口说明

## 前端开发快速指南

本文档提供前端开发所需的AI配置提示词管理API接口说明。

---

## 基础信息

**Base URL**: `/api/ai`

**认证方式**: Bearer Token (JWT)

**权限要求**: 大部分接口需要管理员权限 (`checkAdmin`)

---

## 接口列表

### 1. 获取所有默认提示词

获取系统默认提示词以及所有模型的特定提示词配置。

```http
GET /api/ai/prompt/default
```

**权限**: 管理员

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "prompt": "通用提示词内容...",
    "modelSpecificPrompts": {
      "glm-4-flash": "智谱GLM-4-Flash专属提示词...",
      "deepseek-v3": "DeepSeek-V3专属提示词...",
      "qwen3-max": "Qwen3-Max专属提示词...",
      ...
    },
    "version": "2.0.0",
    "updatedAt": "2026-03-02",
    "modelsCount": 16
  }
}
```

**前端使用场景**:
- 在AI配置管理页面显示所有可用的提示词模板
- 提示词编辑器中提供默认值
- 版本信息展示

---

### 2. 获取特定模型的提示词

获取指定模型的默认提示词配置。

```http
GET /api/ai/prompt/model/:modelName
```

**权限**: 管理员

**路径参数**:
- `modelName`: 模型名称，如 `glm-4-flash`, `deepseek-v3`

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "modelName": "glm-4-flash",
    "prompt": "智谱GLM-4-Flash专属提示词...",
    "isDefault": false
  }
}
```

**前端使用场景**:
- 当用户选择特定模型时，加载该模型的默认提示词
- 在提示词编辑器中预填充内容
- 区分是否为通用提示词

---

### 3. 应用模型特定提示词

将代码中定义的模型特定提示词应用到数据库中。

```http
POST /api/ai/prompt/apply-model-specific
```

**权限**: 管理员

**请求体**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "模型特定提示词应用成功",
  "data": {
    "totalModels": 16,
    "appliedCount": 16,
    "results": [
      {
        "modelName": "glm-4-flash",
        "displayName": "智谱GLM-4-Flash（推荐）",
        "applied": true
      },
      {
        "modelName": "some-model",
        "displayName": "某模型",
        "applied": false,
        "reason": "未配置特定提示词，使用通用提示词"
      }
    ],
    "message": "已为 16 个模型应用专属提示词"
  }
}
```

**前端使用场景**:
- 一键初始化所有模型的提示词配置
- "恢复默认配置"功能
- 批量操作后的结果展示

---

### 4. 批量更新所有模型的提示词

使用统一的提示词更新所有模型。

```http
PUT /api/ai/prompt/all
```

**权限**: 管理员

**请求体**:
```json
{
  "prompt": "统一的提示词内容..."
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "已更新 16 个模型的提示词",
  "data": {
    "updatedCount": 16,
    "prompt": "统一的提示词内容..."
  }
}
```

**前端使用场景**:
- 批量修改所有模型的提示词
- 统一提示词模板
- 快速配置

---

### 5. 恢复默认提示词

清空数据库中的自定义提示词，恢复使用代码中定义的默认提示词。

```http
POST /api/ai/prompt/reset
```

**权限**: 管理员

**请求体**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "已恢复 16 个模型为默认提示词",
  "data": {
    "resetCount": 16,
    "defaultPrompt": "通用默认提示词内容..."
  }
}
```

**前端使用场景**:
- "重置为默认"功能
- 清除自定义配置
- 故障恢复

---

### 6. 获取所有AI配置（包含提示词）

获取系统中所有AI模型的配置信息，包括当前使用的提示词。

```http
GET /api/ai/configs
```

**权限**: 已登录用户

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "provider": "zhipu",
      "providerName": "智谱AI",
      "models": [
        {
          "id": 1,
          "modelName": "glm-4-flash",
          "displayName": "智谱GLM-4-Flash（推荐）",
          "description": "模型描述...",
          "features": ["快速响应", "中文优化"],
          "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
          "promptTemplate": "当前使用的提示词...",
          "isActive": true,
          "defaultVersion": "ai_optimized",
          "status": "available",
          "sortOrder": 1,
          "apiKey": "sk-***"  // 非管理员显示为隐藏
        }
      ]
    }
  ]
}
```

**前端使用场景**:
- AI配置管理列表
- 模型选择器
- 状态监控

---

### 7. 更新单个AI配置（包括提示词）

更新指定模型的配置，可以包含自定义提示词。

```http
PUT /api/ai/config/:id
```

**权限**: 管理员

**路径参数**:
- `id`: 配置ID

**请求体**:
```json
{
  "modelName": "glm-4-flash",
  "displayName": "智谱GLM-4-Flash（推荐）",
  "apiKey": "sk-...",
  "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
  "promptTemplate": "自定义提示词内容...",
  "defaultVersion": "ai_optimized",
  "description": "模型描述",
  "features": "快速响应|中文优化",
  "status": "available"
}
```

**响应示例**:
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

**前端使用场景**:
- 编辑模型配置
- 自定义特定模型的提示词
- 更新API Key

---

## 前端实现示例

### Vue 3 Composition API 示例

```javascript
import { ref, reactive } from 'vue';
import axios from 'axios';

const API_BASE = '/api/ai';

export function useAiPrompts() {
  const loading = ref(false);
  const error = ref(null);

  // 获取所有默认提示词
  const getDefaultPrompts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${API_BASE}/prompt/default`);
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取特定模型提示词
  const getModelPrompt = async (modelName) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${API_BASE}/prompt/model/${modelName}`);
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 应用模型特定提示词
  const applyModelSpecificPrompts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post(`${API_BASE}/prompt/apply-model-specific`);
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 批量更新提示词
  const updateAllPrompts = async (prompt) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put(`${API_BASE}/prompt/all`, { prompt });
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 恢复默认提示词
  const resetPrompts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post(`${API_BASE}/prompt/reset`);
      return response.data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getDefaultPrompts,
    getModelPrompt,
    applyModelSpecificPrompts,
    updateAllPrompts,
    resetPrompts
  };
}
```

### React Hooks 示例

```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api/ai';

export function useAiPrompts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDefaultPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/prompt/default`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyModelSpecificPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/prompt/apply-model-specific`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ... 其他方法类似

  return {
    loading,
    error,
    getDefaultPrompts,
    applyModelSpecificPrompts
    // ... 其他方法
  };
}
```

---

## UI组件建议

### 1. 提示词管理面板

```vue
<template>
  <div class="prompt-manager">
    <!-- 操作按钮 -->
    <div class="actions">
      <el-button @click="handleApplyModelSpecific" :loading="loading">
        应用模型特定提示词
      </el-button>
      <el-button @click="handleReset" type="warning">
        恢复默认
      </el-button>
    </div>

    <!-- 模型列表 -->
    <el-table :data="models" border>
      <el-table-column prop="displayName" label="模型名称" />
      <el-table-column prop="modelName" label="模型ID" />
      <el-table-column label="提示词状态">
        <template #default="{ row }">
          <el-tag v-if="row.promptTemplate" type="success">已自定义</el-tag>
          <el-tag v-else type="info">使用默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">
            编辑提示词
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 提示词编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑提示词" width="800px">
      <el-input
        v-model="editingPrompt"
        type="textarea"
        :rows="15"
        placeholder="请输入提示词..."
      />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

## 错误处理

### 常见错误码

- **400**: 提示词不能为空
- **401**: 未授权，需要登录
- **403**: 权限不足，需要管理员权限
- **404**: 未找到指定的模型
- **500**: 服务器内部错误

### 错误处理示例

```javascript
try {
  await applyModelSpecificPrompts();
  ElMessage.success('提示词应用成功');
} catch (error) {
  if (error.response?.status === 403) {
    ElMessage.error('需要管理员权限');
  } else if (error.response?.status === 400) {
    ElMessage.error(error.response.data.message);
  } else {
    ElMessage.error('操作失败，请稍后重试');
  }
}
```

---

## 最佳实践

### 1. 加载状态管理

- 使用loading状态提升用户体验
- 禁用操作按钮防止重复提交
- 显示进度指示器

### 2. 错误提示

- 明确的错误信息
- 友好的用户提示
- 提供重试机制

### 3. 数据缓存

- 缓存默认提示词，减少重复请求
- 使用响应式数据管理状态
- 实时更新UI

### 4. 权限控制

- 根据用户角色显示/隐藏操作按钮
- 前端验证 + 后端验证双重保障
- 敏感操作需要二次确认

---

## 测试建议

### 1. 单元测试

```javascript
describe('AI Prompts API', () => {
  test('should get default prompts', async () => {
    const data = await getDefaultPrompts();
    expect(data).toHaveProperty('prompt');
    expect(data).toHaveProperty('modelSpecificPrompts');
    expect(data.modelsCount).toBeGreaterThan(0);
  });
});
```

### 2. 集成测试

- 测试完整的提示词管理工作流
- 验证权限控制
- 测试错误场景

---

## 更新日志

### 2026-03-02

- 新增 `getModelPrompt` 接口
- 新增 `applyModelSpecificPrompts` 接口
- 更新 `getDefaultPrompt` 接口响应格式
- 添加16个模型的专属提示词配置

---

## 联系方式

如有疑问，请联系后端开发团队。
