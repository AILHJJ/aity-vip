# 🔍 服务器部署状态验证指南

**日期**: 2025-02-05
**目的**: 验证后端代码是否正确部署和运行

---

## 📋 验证步骤

### 第一步：连接服务器

```bash
ssh root@aity88.online
```

---

### 第二步：检查Git提交记录

**验证后端代码是否更新到最新版本**

```bash
cd /root/AITY_VIP/backend
git log --oneline -5
```

**预期输出**（应该包含以下commit）:
```
5b32f79 feat: 修复删除消息500错误，使用事务保证数据一致性
239d5e9 feat: 添加图片上传接口
c73b5ed docs: 添加图片粘贴上传功能使用说明
```

**如果看不到 `5b32f79`，说明代码没有拉取成功，需要执行**:
```bash
git pull origin feature/iteration-1
```

---

### 第三步：检查PM2运行状态

```bash
pm2 status
```

**预期输出**:
```
┌────┬─────────────────┬─────────┬─────────┐
│ id │ name            │ version │ mode    │
├────┼─────────────────┼─────────┼─────────┤
│ 1  │ aity-backend    │ 1.0.0   │ fork    │
│    │ Server running  │ online  │ ●       │
└────┴─────────────────┴─────────┴─────────┘
```

**如果状态不是 `online`，需要重启**:
```bash
pm2 restart aity-backend
```

**如果完全没有这个进程，需要启动**:
```bash
cd /root/AITY_VIP/backend
pm2 start src/index.js --name aity-backend
pm2 save
```

---

### 第四步：检查后端日志

**查看最近的错误日志**

```bash
pm2 logs aity-backend --lines 100 --nostream | grep -E "error|Error|ERROR|删除消息|读取失败"
```

**正常情况**:
- 不应该有大量的ERROR
- 应该看到 "Server running on port 8443"
- 应该看到 "Routes registered" 或类似的日志

**如果看到路由相关的错误**:
```
Error: Cannot find module '../models/Discussion'
Error: Cannot find module '../models/DiscussionReply'
```

**解决方法**:
```bash
cd /root/AITY_VIP/backend/src/models
ls -la

# 确认以下文件存在：
# - Discussion.js
# - DiscussionReply.js
# - index.js

# 如果不存在，需要拉取最新代码
cd /root/AITY_VIP/backend
git pull origin feature/iteration-1
```

---

### 第五步：检查关键路由是否注册

**测试各个API端点**

```bash
# 设置测试token
TOKEN="your-test-token-here"

# 1. 测试删除消息接口（应该返回200或404，不应该返回405或500）
curl -X DELETE https://aity88.online:8443/api/messages/999 \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

# 2. 测试收藏接口
curl -X POST https://aity88.online:8443/api/messages/57/favorite \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

# 3. 测试置顶接口
curl -X POST https://aity88.online:8443/api/messages/57/pin \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"
```

**预期结果**:
- 删除接口: 404 (消息不存在) 或 200 (成功) 或 401 (未授权)
- 收藏接口: 200 或 401
- 置顶接口: 200 或 401

**如果返回 404 Not Found**:
说明路由没有注册，需要检查:
1. `backend/src/routes/messages.js` 文件是否存在
2. `backend/src/index.js` 中是否正确注册路由

---

### 第六步：检查路由文件

**验证关键路由文件是否存在**

```bash
cd /root/AITY_VIP/backend/src

# 检查路由文件
cat routes/messages.js | grep -A 2 "router.delete\|router.post.*favorite\|router.post.*pin"
```

**预期输出**:
```javascript
router.delete('/:id', deleteMessage);
router.post('/:id/favorite', favoriteMessage);
router.post('/:id/unfavorite', unfavoriteMessage);
router.post('/:id/pin', pinMessage);
router.post('/:id/unpin', unpinMessage);
```

**如果看不到这些路由**，说明路由文件没有更新，需要:
```bash
cd /root/AITY_VIP/backend
git pull origin feature/iteration-1
pm2 restart aity-backend
```

---

### 第七步：检查模型文件

**验证模型是否完整**

```bash
cd /root/AITY_VIP/backend/src/models

# 检查模型文件
ls -la | grep -E "Discussion|Message"

# 预期看到：
# Discussion.js
# DiscussionReply.js
# Message.js
# MessageAttachment.js
# UserMessageRead.js
```

**如果缺少文件**，需要:
```bash
cd /root/AITY_VIP/backend
git pull origin feature/iteration-1
```

---

### 第八步：完整重启PM2

**如果以上检查都正常，但API还是报错，执行完整重启**

```bash
cd /root/AITY_VIP/backend

# 1. 停止PM2进程
pm2 stop aity-backend
pm2 delete aity-backend

# 2. 确认代码是最新的
git pull origin feature/iteration-1
git log --oneline -3

# 3. 确认依赖完整（如果package.json有变化）
# npm install

# 4. 重新启动
pm2 start src/index.js --name aity-backend

# 5. 查看启动日志
pm2 logs aity-backend --lines 50

# 6. 检查状态
pm2 status

# 7. 保存配置
pm2 save
```

---

## 🧪 完整测试流程

**在服务器上执行完整测试**

```bash
# 1. 获取一个有效的token（先登录）
TOKEN=$(curl -s -X POST https://aity88.online:8443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' \
  | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. 测试获取消息列表
curl -s https://aity88.online:8443/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  | python -m json.tool | head -30

# 3. 测试删除消息（使用一个不存在的ID测试接口）
curl -i -X DELETE https://aity88.online:8443/api/messages/99999 \
  -H "Authorization: Bearer $TOKEN"

# 4. 测试收藏功能
curl -i -X POST https://aity88.online:8443/api/messages/57/favorite \
  -H "Authorization: Bearer $TOKEN"

# 5. 测试置顶功能
curl -i -X POST https://aity88.online:8443/api/messages/57/pin \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 问题诊断决策树

### 情况1: Git commit不是最新的

```
问题: git log看不到5b32f79
解决: git pull origin feature/iteration-1
```

### 情况2: PM2进程状态不是online

```
问题: pm2 status显示stopped或errored
解决: pm2 restart aity-backend
```

### 情况3: 路由返回404

```
问题: curl返回404 Not Found
原因: 路由没有注册或代码没有更新
解决:
  1. git pull
  2. 检查routes/messages.js
  3. pm2 restart
```

### 情况4: 删除返回500

```
问题: DELETE返回500 Server Error
原因: 模型导入失败或数据库错误
解决:
  1. 检查models/Discussion.js是否存在
  2. 查看pm2 logs中的详细错误
  3. 确认数据库表结构
```

### 情况5: 收藏/置顶返回404

```
问题: POST /api/messages/xx/favorite返回404
原因: 路由文件没有更新
解决:
  1. git pull
  2. pm2 restart
  3. 清除浏览器缓存重新测试
```

---

## ✅ 验证成功标志

当看到以下所有标志，说明部署成功:

1. ✅ Git log显示commit 5b32f79
2. ✅ PM2 status显示online
3. ✅ PM2 logs没有ERROR级别的错误
4. ✅ 删除消息接口返回200或404（不是405）
5. ✅ 收藏接口返回200或401（不是404）
6. ✅ 置顶接口返回200或401（不是404）
7. ✅ 前端操作不再报错

---

## 🚨 常见问题速查

### Q1: "Host key verification failed"

```bash
# 解决方法：清除SSH缓存
ssh-keygen -R aity88.online

# 然后重新连接
ssh root@aity88.online
```

### Q2: PM2命令不存在

```bash
# 全局安装PM2
npm install -g pm2

# 然后重新执行
pm2 restart aity-backend
```

### Q3: Git pull失败

```bash
# 如果有本地修改，先stash
git stash

# 然后pull
git pull origin feature/iteration-1

# 如果需要，恢复stash
git stash pop
```

### Q4: 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 8443

# 杀死占用进程
kill -9 <PID>

# 重启PM2
pm2 restart aity-backend
```

---

## 📝 执行记录

**请在执行后填写以下记录**:

```
执行时间: _______________

执行人: _______________

第二步 - Git commit: ____ 看到commit 5b32f79
第三步 - PM2状态: ____ online / ____ stopped
第四步 - 日志检查: ____ 有ERROR / ____ 无ERROR
第五步 - API测试: ____ 通过 / ____ 失败
第六步 - 路由检查: ____ 正常 / ____ 缺失
第七步 - 模型检查: ____ 完整 / ____ 缺失
第八步 - PM2重启: ____ 执行 / ____ 未执行

最终状态: ____ 所有功能正常 / ____ 仍有问题

问题描述（如有）:
________________________________________
________________________________________
________________________________________
```

---

**请按照以上步骤逐一检查，并将结果反馈！** 🔍
