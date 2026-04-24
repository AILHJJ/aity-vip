# 收藏页面测试指南

## 准备工作

1. **确保后端服务运行**
   ```bash
   cd D:\your-mcp-proxy\AITY_VIP\backend
   npm start
   ```

2. **确保前端服务运行**
   ```bash
   cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
   npm run dev:h5
   ```

## 功能测试清单

### 1. 消息收藏功能

#### 1.1 获取收藏消息列表
- **路由**：`GET /api/favorites?page=1&limit=20`
- **预期结果**：
  - 返回码 200
  - 包含 `data.list` 数组
  - 包含 `data.pagination` 对象（total, page, limit, pages）
  - 每个消息对象包含：id, title, content, type, senderId, createdAt等

#### 1.2 收藏消息
- **路由**：`POST /api/messages/:id/favorite`
- **预期结果**：
  - 返回码 200 或 201
  - 返回收藏记录对象

#### 1.3 取消收藏消息
- **路由**：`DELETE /api/messages/:id/favorite`
- **预期结果**：
  - 返回码 200
  - 提示"取消收藏成功"

### 2. 讨论收藏功能（新增）

#### 2.1 获取收藏讨论列表
- **路由**：`GET /api/discussions/favorites?page=1&limit=20`
- **预期结果**：
  - 返回码 200
  - 包含 `data.list` 数组
  - 包含 `data.pagination` 对象
  - 每个讨论对象包含：id, title, content, status, visibility, creatorName等

#### 2.2 收藏讨论
- **路由**：`POST /api/discussions/:id/favorite`
- **预期结果**：
  - 返回码 200 或 201
  - 返回收藏记录对象

#### 2.3 取消收藏讨论
- **路由**：`DELETE /api/discussions/:id/favorite`
- **预期结果**：
  - 返回码 200
  - 提示"取消收藏成功"

## 前端界面测试

### 我的收藏页面
**路径**：`/pages/favorites/favorites`

#### 测试场景

**场景1：消息收藏标签**
1. 进入"我的收藏"页面
2. 默认显示"消息收藏"标签
3. 验证：
   - ✓ 能正常加载收藏的消息列表
   - ✓ 消息显示标题、内容、类型标签
   - ✓ 显示创建时间
   - ✓ 有"取消收藏"按钮

**场景2：讨论收藏标签**
1. 点击"讨论收藏"标签
2. 验证：
   - ✓ 能正常加载收藏的讨论列表
   - ✓ 讨论显示标题、内容
   - ✓ 显示可见性标签（公开/私密）
   - ✓ 显示回复数量
   - ✓ 有"取消收藏"按钮

**场景3：下拉刷新**
1. 在任意标签页
2. 下拉刷新
3. 验证：
   - ✓ 显示刷新动画
   - ✓ 列表重新加载
   - ✓ 数据更新

**场景4：加载更多**
1. 当收藏数量超过20条时
2. 滚动到底部
3. 验证：
   - ✓ 显示"加载更多..."
   - ✓ 自动加载下一页
   - ✓ 新数据追加到列表末尾

**场景5：空状态**
1. 当没有收藏内容时
2. 验证：
   - ✓ 显示空状态图标
   - ✓ 显示"暂无收藏"文字

**场景6：取消收藏**
1. 在消息收藏列表中，点击某条消息的"取消收藏"按钮
2. 确认弹窗
3. 验证：
   - ✓ 显示确认对话框
   - ✓ 确认后提示"已取消收藏"
   - ✓ 该条消息从列表中移除
   - ✓ 列表刷新

4. 在讨论收藏列表中，重复上述步骤
5. 验证：
   - ✓ 功能与消息收藏一致

## 错误处理测试

### 错误场景1：未登录访问
- 清除登录状态
- 访问收藏页面
- **预期**：跳转到登录页

### 错误场景2：网络错误
- 关闭后端服务
- 尝试加载收藏列表
- **预期**：显示"加载失败"提示

### 错误场景3：取消已删除的内容
- 收藏一条消息/讨论
- 在数据库中删除该消息/讨论
- 在收藏列表中取消收藏
- **预期**：
  - 如果使用 `DELETE /api/favorites/:id`，可能返回404
  - 如果使用 `DELETE /api/messages/:id/favorite`，可能返回404或200
  - 前端应优雅处理错误

## 性能测试

### 大量数据测试
1. 创建100+条收藏记录
2. 验证：
   - ✓ 首屏加载时间 < 2秒
   - ✓ 分页切换流畅
   - ✓ 滚动无卡顿

## API测试工具

### 使用cURL测试

```bash
# 1. 登录获取token
curl -X POST http://192.168.2.140:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# 2. 获取消息收藏列表（替换YOUR_TOKEN）
curl -X GET "http://192.168.2.140:3001/api/favorites?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 获取讨论收藏列表
curl -X GET "http://192.168.2.140:3001/api/discussions/favorites?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. 收藏讨论（替换DISCUSSION_ID）
curl -X POST "http://192.168.2.140:3001/api/discussions/DISCUSSION_ID/favorite" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. 取消收藏讨论
curl -X DELETE "http://192.168.2.140:3001/api/discussions/DISCUSSION_ID/favorite" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 使用Postman测试

1. 导入以下环境变量：
   - `BASE_URL`: http://192.168.2.140:3001
   - `TOKEN`: 从登录接口获取

2. 测试集合：
   - ✓ GET /api/favorites
   - ✓ GET /api/discussions/favorites
   - ✓ POST /api/messages/:id/favorite
   - ✓ DELETE /api/messages/:id/favorite
   - ✓ POST /api/discussions/:id/favorite
   - ✓ DELETE /api/discussions/:id/favorite

## 常见问题排查

### 问题1：消息收藏列表返回500错误
**已修复**：在 `favoritesController.js` 中添加了 `required: false` 选项

### 问题2：讨论收藏列表返回400错误
**已修复**：
1. 创建了 `DiscussionFavorite` 模型
2. 创建了 `discussion_favorites` 数据库表
3. 添加了 `getFavoriteDiscussions` 控制器函数
4. 添加了 `/api/discussions/favorites` 路由

### 问题3：取消收藏后列表不更新
**解决方案**：前端已实现刷新逻辑 `await loadList(true)`

### 问题4：数据库连接失败
**检查**：
1. 确认数据库服务运行
2. 检查 `.env` 配置
3. 测试数据库连接：
   ```bash
   mysql -h 124.221.119.134 -u fl -pfl10b312 投研图灵室_test
   ```

## 验证数据库表结构

```sql
-- 验证 discussion_favorites 表
DESCRIBE discussion_favorites;

-- 查看索引
SHOW INDEX FROM discussion_favorites;

-- 查看外键
SELECT
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
  TABLE_SCHEMA = '投研图灵室_test'
  AND TABLE_NAME = 'discussion_favorites'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

## 日志检查

### 后端日志
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
tail -f logs/app.log
```

查看关键日志：
- "=== 获取收藏列表请求开始 ==="
- "获取收藏列表请求处理完成，总耗时: XX ms"
- "获取收藏讨论列表错误:"

## 测试完成标准

- ✓ 所有API端点返回正确的HTTP状态码
- ✓ 前端界面显示正常，无JavaScript错误
- ✓ 收藏/取消收藏功能工作正常
- ✓ 分页功能正常
- ✓ 下拉刷新功能正常
- ✓ 空状态显示正常
- ✓ 错误处理符合预期
- ✓ 性能满足要求（加载时间 < 2秒）
