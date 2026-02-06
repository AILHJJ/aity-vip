# ⚡ 快速验证清单

**最关键的5个检查** - 按顺序执行

---

## 1️⃣ 检查Git版本 (30秒)

```bash
ssh root@aity88.online "cd /root/AITY_VIP/backend && git log --oneline -3"
```

**必须看到**: `5b32f79` 或更新

---

## 2️⃣ 检查PM2状态 (10秒)

```bash
ssh root@aity88.online "pm2 status"
```

**必须是**: `online` 状态

---

## 3️⃣ 检查路由文件 (20秒)

```bash
ssh root@aity88.online "cd /root/AITY_VIP/backend && cat src/routes/messages.js | grep 'router.delete\|router.post.*favorite'"
```

**必须看到**:
```javascript
router.delete('/:id', deleteMessage);
router.post('/:id/favorite', favoriteMessage);
```

---

## 4️⃣ 测试API (15秒)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NzAyNjU1MDAsImV4cCI6MTc3MDM1MTkwMH0.stb6XJ2GHlw1-p4l38kR3sZWYlCrECOhL-4Mq0XUPlk"

# 测试删除（应该返回404或200，不是405）
curl -i -X DELETE https://aity88.online:8443/api/messages/99999 \
  -H "Authorization: Bearer $TOKEN" 2>&1 | grep "HTTP\"

# 测试收藏（应该返回200或401，不是404）
curl -i -X POST https://aity88.online:8443/api/messages/57/favorite \
  -H "Authorization: Bearer $TOKEN" 2>&1 | grep "HTTP\"
```

---

## 5️⃣ 如果以上任何一项失败，执行重启 (30秒)

```bash
ssh root@aity88.online "cd /root/AITY_VIP/backend && git pull origin feature/iteration-1 && pm2 restart aity-backend && pm2 logs aity-backend --lines 20 --nostream"
```

---

## ✅ 判断标准

| 检查项 | 预期结果 | 如果不符 |
|--------|---------|---------|
| Git版本 | 看到5b32f79 | 执行步骤5 |
| PM2状态 | online | 执行步骤5 |
| 路由文件 | 有delete和favorite路由 | 执行步骤5 |
| 删除测试 | HTTP/1.1 404或200 | 执行步骤5 |
| 收藏测试 | HTTP/1.1 200或401 | 执行步骤5 |

---

## 🎯 总时间

**最快**: 75秒（1分15秒）
**最慢**: 105秒（1分45秒，需要重启）

---

**开始验证吧！** 🚀
