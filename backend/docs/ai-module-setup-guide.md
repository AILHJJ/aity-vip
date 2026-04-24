# AI 模块安装配置指南

## 已创建的文件清单

### 核心文件
1. **模型文件**
   - `D:\your-mcp-proxy\AITY_VIP\backend\src\models\AiConfig.js` - AI配置数据模型

2. **控制器文件**
   - `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\aiConfigController.js` - AI配置管理控制器
   - `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\aiOptimizeController.js` - AI内容优化控制器

3. **路由文件**
   - `D:\your-mcp-proxy\AITY_VIP\backend\src\routes\ai.js` - AI相关API路由

4. **数据库迁移**
   - `D:\your-mcp-proxy\AITY_VIP\backend\migrations\create_ai_configs_table.sql` - 数据表创建SQL

5. **辅助脚本**
   - `D:\your-mcp-proxy\AITY_VIP\backend\scripts\seed-ai-config.js` - 初始化AI配置脚本

6. **文档**
   - `D:\your-mcp-proxy\AITY_VIP\backend\docs\ai-module-usage.md` - 完整使用文档
   - `D:\your-mcp-proxy\AITY_VIP\backend\docs\ai-api-reference.md` - API快速参考

### 修改的文件
1. `D:\your-mcp-proxy\AITY_VIP\backend\src\index.js` - 注册了AI路由

## 安装步骤

### 步骤 1: 创建数据表

在MySQL中执行以下命令创建数据表：

```bash
# 方式1：使用mysql命令行
mysql -u root -p 投研图灵室_test < D:\your-mcp-proxy\AITY_VIP\backend\migrations\create_ai_configs_table.sql

# 方式2：或直接在MySQL客户端中执行SQL文件内容
```

### 步骤 2: 配置 AI API密钥

**方式1：使用环境变量（推荐）**

在 `.env.development` 或 `.env.production` 文件中添加：
```bash
# 智谱AI配置
ZHIPU_API_KEY=your-actual-api-key-here
```

**方式2：直接在数据库中配置**

```sql
-- 更新AI配置
UPDATE ai_configs
SET api_key = 'your-actual-api-key-here'
WHERE id = 1;
```

### 步骤 3: 初始化AI配置（可选）

运行初始化脚本创建默认配置：
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/seed-ai-config.js
```

### 步骤 4: 重启服务器

```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
npm run dev
```

## 验证安装

### 1. 检查路由是否加载
启动服务器后，应该看到日志输出：
```
✅ 已加载环境配置: .env.development
Server started ...
```

### 2. 测试API接口

#### 获取配置（需要登录）
```bash
# 先登录获取token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# 获取AI配置
curl -X GET http://localhost:3000/api/ai/config \
  -H "Authorization: Bearer $TOKEN"
```

#### 优化文案（需要管理员权限）
```bash
curl -X POST http://localhost:3000/api/ai/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"这是一段需要优化的测试文案"}'
```

## API密钥获取指南

### 智谱AI (BigModel)
1. 访问：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台
4. 创建API密钥
5. 复制API Key并配置到系统

### OpenAI
1. 访问：https://platform.openai.com/
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的API密钥
5. 复制API Key并配置到系统

## 常见问题排查

### 问题1：路由404错误
**检查：**
```bash
# 确认路由文件存在
ls D:\your-mcp-proxy\AITY_VIP\backend\src\routes\ai.js

# 确认index.js中已注册路由
grep "aiRoutes" D:\your-mcp-proxy\AITY_VIP\backend\src\index.js
```

### 问题2：数据库表不存在
**检查：**
```sql
-- 检查表是否创建
SHOW TABLES LIKE 'ai_configs';

-- 查看表结构
DESC ai_configs;
```

### 问题3：API调用失败
**检查：**
1. API Key是否正确配置
2. 网络是否能访问AI服务
3. 余额是否充足
4. Base URL是否正确

**测试连接：**
```bash
# 使用管理员权限测试连接
curl -X POST http://localhost:3000/api/ai/test-connection/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 问题4：权限不足错误
**检查：**
```bash
# 确认用户角色
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role'

# 管理员角色应该是：super_admin 或 admin
```

## 生产环境配置建议

### 1. 使用HTTPS
确保生产环境使用HTTPS协议

### 2. 环境变量
不要在代码中硬编码API Key，使用环境变量：
```bash
# .env.production
ZHIPU_API_KEY=your-production-api-key
NODE_ENV=production
```

### 3. API限流
建议在nginx或应用层添加API限流保护

### 4. 日志监控
- 监控AI API调用成功率
- 记录错误日志
- 设置告警机制

### 5. 备份配置
定期备份AI配置数据：
```sql
-- 导出配置
mysqldump -u root -p 投研图灵室 ai_configs > ai_configs_backup.sql

-- 恢复配置
mysql -u root -p 投研图灵室 < ai_configs_backup.sql
```

## 升级和维护

### 更新提示词模板
```sql
UPDATE ai_configs
SET prompt_template = '新的提示词模板'
WHERE id = 1;
```

### 切换活跃模型
```sql
-- 停用当前模型
UPDATE ai_configs SET is_active = FALSE WHERE id = 1;

-- 启用新模型
UPDATE ai_configs SET is_active = TRUE WHERE id = 2;
```

### 添加新模型
```sql
INSERT INTO ai_configs (
  model_name, display_name, api_key, base_url,
  prompt_template, is_active, default_version
) VALUES (
  'gpt-3.5-turbo',
  'GPT-3.5 Turbo',
  'your-openai-api-key',
  'https://api.openai.com/v1',
  'Please optimize the following text:',
  FALSE,
  'ai_optimized'
);
```

## 技术支持

如有问题，请参考：
- 完整文档：`backend/docs/ai-module-usage.md`
- API参考：`backend/docs/ai-api-reference.md`

## 下一步

1. ✅ 完成数据库表创建
2. ✅ 配置API密钥
3. ✅ 测试API接口
4. ⏭️ 在前端集成AI优化功能
5. ⏭️ 根据实际使用调优提示词模板
