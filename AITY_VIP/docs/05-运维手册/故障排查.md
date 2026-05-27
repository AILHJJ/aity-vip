# 故障排查指南

> **文档类型**: 运维文档
> **创建日期**: 2026-03-05
> **最后更新**: 2026-03-05
> **维护人员**: 运维团队
> **适用版本**: v2.0.0

---

## 文档概述

本文档提供VIP投研内部分享系统的常见故障排查指南和解决方案，帮助运维人员快速定位和解决问题。

---

## 目录

- [故障排查流程](#故障排查流程)
- [后端服务故障](#后端服务故障)
- [前端故障](#前端故障)
- [数据库故障](#数据库故障)
- [网络故障](#网络故障)
- [常见错误代码](#常见错误代码)

---

## 故障排查流程

### 标准排查流程

```
┌─────────────────┐
│  1. 故障发现    │ ← 监控告警、用户反馈
├─────────────────┤
│  2. 故障确认    │ ← 验证故障真实存在
├─────────────────┤
│  3. 信息收集    │ ← 收集日志、监控数据
├─────────────────┤
│  4. 原因分析    │ ← 分析根本原因
├─────────────────┤
│  5. 制定方案    │ ← 制定解决方案
├─────────────────┤
│  6. 执行修复    │ ← 实施解决方案
├─────────────────┤
│  7. 验证测试    │ ← 验证问题解决
├─────────────────┤
│  8. 总结记录    │ ← 记录故障和经验
└─────────────────┘
```

### 快速诊断命令

```bash
# 一键健康检查
cat > /root/scripts/health-check.sh << 'EOF'
#!/bin/bash
echo "=== 系统健康检查 ==="
echo "时间: $(date)"
echo ""

echo "=== 1. CPU状态 ==="
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU使用率: " (100 - $1) "%"}'

echo ""
echo "=== 2. 内存状态 ==="
free -h | awk 'NR==2{printf "内存使用率: %.2f%%\n", $3/$2*100}'

echo ""
echo "=== 3. 磁盘状态 ==="
df -h | awk '$NF=="/"{printf "磁盘使用率: %s\n", $5}'

echo ""
echo "=== 4. 服务状态 ==="
systemctl is-active nginx && echo "Nginx: 运行中" || echo "Nginx: 未运行"
systemctl is-active mysql && echo "MySQL: 运行中" || echo "MySQL: 未运行"
pm2 status | grep backend && echo "Backend: 运行中" || echo "Backend: 未运行"

echo ""
echo "=== 4. 网络连接 ==="
netstat -tuln | grep ":8443" && echo "HTTPS端口: 正常" || echo "HTTPS端口: 异常"

echo ""
echo "=== 检查完成 ==="
EOF

chmod +x /root/scripts/health-check.sh
```

---

## 后端服务故障

### 问题1: 后端服务无法启动

**症状**：
- PM2显示服务状态为 `errored`
- API请求全部失败
- 日志显示启动错误

**可能原因**：
1. 端口被占用
2. 数据库连接失败
3. 环境变量配置错误
4. 依赖包缺失

**排查步骤**：

```bash
# 1. 查看服务状态
cd backend
pm2 status

# 2. 查看错误日志
pm logs --lines 50

# 3. 检查端口占用
netstat -tuln | grep 3001

# 4. 测试数据库连接
mysql -u fl -p -h 124.221.119.134

# 5. 检查环境变量
cat .env | grep -v "SECRET"
```

**解决方案**：

```bash
# 端口被占用
lsof -i:3001 | kill -9 <PID>

# 数据库连接失败
# 检查数据库配置
nano .env

# 依赖包缺失
npm install

# 重启服务
pm2 restart backend
pm2 save
```

### 问题2: API返回500错误

**症状**：
- 前端请求API收到500状态码
- 错误信息：`Server error`

**常见原因及解决方案**：

#### 原因1: Vue 3 Proxy对象序列化问题

**问题详情**：
- Vue 3的响应式系统使用Proxy对象
- 直接发送Proxy对象到服务器会导致序列化失败

**解决方案**：
```javascript
// ❌ 错误：直接发送Proxy对象
const data = {
  tags: formData.value.tags,
  attachments: formData.value.attachments
}

// ✅ 正确：转换为纯JavaScript对象
const data = {
  tags: Array.isArray(formData.value.tags) ? [...formData.value.tags] : [],
  attachments: formData.value.attachments.map(attach => ({
    name: attach.name,
    path: attach.path,
    size: attach.size,
    type: attach.type || 'image'
  }))
}
```

#### 原因2: 数据库关联查询错误

**问题详情**：
- Sequelize模型关联关系未正确建立
- 查询时出现 `is not associated to` 错误

**解决方案**：
```javascript
// 在查询中添加 required: false，使用LEFT JOIN
const results = await Model.findAll({
  include: [{
    model: RelatedModel,
    as: 'relation',
    required: false  // 允许关联为null
  }]
})
```

#### 原因3: 数据库表或字段不存在

**解决方案**：
```bash
# 检查数据库表
mysql -u fl -p -e "USE 投研图灵室; SHOW TABLES;"

# 检查表结构
mysql -u fl -p -e "USE 投研图灵室; DESCRIBE table_name;"

# 运行数据库迁移
npm run migrate
```

### 问题3: API返回404错误

**症状**：
- API请求返回404 Not Found

**常见原因及解决方案**：

#### 原因1: API方法使用错误

**问题详情**：
- 前端使用POST方法调用只支持GET的接口

**解决方案**：
```javascript
// ❌ 错误：使用POST方法
export function getCurrentUserApi() {
  return post('/auth/me')
}

// ✅ 正确：使用GET方法
export function getCurrentUserApi() {
  return get('/auth/me')
}
```

#### 原因2: 路由未注册

**解决方案**：
```javascript
// 检查路由是否正确注册
// backend/src/routes/index.js
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/favorites', favoritesRoutes)
```

### 问题4: API返回400错误

**症状**：
- API请求返回400 Bad Request

**常见原因及解决方案**：

#### 原因1: 请求参数验证失败

**解决方案**：
```javascript
// 检查必填字段
const requiredFields = ['title', 'content', 'type']
const missingFields = requiredFields.filter(field => !req.body[field])

if (missingFields.length > 0) {
  return res.status(400).json({
    code: 400,
    message: `Missing required fields: ${missingFields.join(', ')}`
  })
}
```

#### 原因2: 数据类型不匹配

**解决方案**：
```javascript
// 确保字段类型正确
groupId: req.body.groupId ? parseInt(req.body.groupId) : null
```

---

## 前端故障

### 问题1: 小程序无法加载

**症状**：
- 小程序启动时白屏
- 提示网络错误
- 无法显示页面

**排查步骤**：

```bash
# 1. 检查服务器状态
curl https://aity88.online:8443/api/health

# 2. 检查HTTPS证书
openssl x509 -in /etc/letsencrypt/live/aity88.online/cert.pem -text -noout

# 3. 检查Nginx配置
nginx -t

# 4. 查看Nginx日志
tail -f /var/log/nginx/error.log
```

**解决方案**：

```bash
# Nginx配置问题
nginx -t
systemctl restart nginx

# SSL证书问题
certbot renew --force-renewal
systemctl reload nginx

# 后端服务问题
cd backend
pm2 restart backend
```

### 问题2: H5版本调试困难

**解决方案**：

使用H5版本进行调试，优势对比：

| 对比项 | 微信开发者工具 | H5浏览器 |
|--------|---------------|----------|
| 调试工具 | 简化版 | 完整Chrome DevTools |
| Console | 查看不便 | 清晰显示 |
| Network面板 | 功能有限 | 详细完整 |
| 错误堆栈 | 不够详细 | 完整显示 |
| 代码修改生效 | 需重新编译 | 立即生效 |

**启动H5调试**：
```bash
cd aity-uni-app-v2
npm run dev:h5

# 访问: http://localhost:5173/
```

### 问题3: 自动热重载问题

**症状**：
- 小程序开发时自动热重载
- 不需要自动编译

**解决方案**：

不要导入 `src` 目录，应该导入编译后的 `dist/build/mp-weixin` 目录。

---

## 数据库故障

### 问题1: 数据库连接失败

**症状**：
- 应用无法连接数据库
- 错误：`Connection refused` 或 `Access denied`

**排查步骤**：

```bash
# 1. 测试数据库连接
mysql -h 124.221.119.134 -u fl -p

# 2. 检查数据库状态
systemctl status mysql

# 3. 检查防火墙
telnet 124.221.119.134 3306

# 4. 检查用户权限
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user='fl';"
```

**解决方案**：

```bash
# 用户权限问题
mysql -u root -p
GRANT ALL PRIVILEGES ON 投研图灵室.* TO 'fl'@'%';
FLUSH PRIVILEGES;

# 防火墙问题
ufw allow 3306

# 配置问题
nano backend/.env
# 确保数据库配置正确
```

### 问题2: 查询速度慢

**症状**：
- API响应时间过长
- 数据库查询超时

**排查步骤**：

```bash
# 1. 查看慢查询日志
mysql -u fl -p -e "SHOW VARIABLES LIKE 'slow_query_log';"
tail -f /var/log/mysql/slow-query.log

# 2. 分析查询计划
mysql -u fl -p 投研图灵室 -e "EXPLAIN SELECT * FROM messages WHERE status='published';"

# 3. 检查索引
mysql -u fl -p 投研图灵室 -e "SHOW INDEX FROM messages;"
```

**解决方案**：

```sql
-- 添加索引
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- 优化查询
SELECT * FROM messages
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;
```

### 问题3: 数据库表损坏

**症状**：
- 查询报错：`Table is marked as crashed`

**解决方案**：

```bash
# 修复表
mysqlcheck -u fl -p --repair 投研图灵室

# 优化所有表
mysqlcheck -u fl -p --optimize --all-databases
```

---

## 网络故障

### 问题1: 网站无法访问

**症状**：
- 浏览器显示无法连接
- 502 Bad Gateway
- 504 Gateway Timeout

**排查步骤**：

```bash
# 1. 检查服务器网络
ping aity88.online

# 2. 检查端口监听
netstat -tuln | grep 8443

# 3. 检查防火墙
ufw status

# 4. 检查Nginx状态
systemctl status nginx
```

**解决方案**：

```bash
# Nginx未运行
systemctl start nginx

# 端口未监听
cd backend
pm2 restart backend

# 防火墙阻止
ufw allow 8443/tcp
```

### 问题2: SSL证书问题

**症状**：
- 浏览器提示连接不安全
- SSL证书过期

**解决方案**：

```bash
# 续期证书
certbot renew

# 强制续期
certbot renew --force-renewal

# 重新加载Nginx
systemctl reload nginx

# 查看证书信息
openssl x509 -in /etc/letsencrypt/live/aity88.online/cert.pem -text -noout
```

---

## 常见错误代码

### HTTP状态码

| 状态码 | 说明 | 常见原因 | 解决方案 |
|--------|------|----------|----------|
| **200** | 成功 | - | - |
| **201** | 创建成功 | 资源创建成功 | 检查响应数据 |
| **400** | 请求错误 | 参数验证失败 | 检查请求参数 |
| **401** | 未授权 | Token缺失或无效 | 重新登录 |
| **403** | 禁止访问 | 权限不足 | 检查用户权限 |
| **404** | 未找到 | 路由不存在 | 检查API路径 |
| **500** | 服务器错误 | 代码异常 | 查看服务器日志 |
| **502** | 网关错误 | 后端服务未运行 | 启动后端服务 |
| **503** | 服务不可用 | 服务器过载 | 检查服务器负载 |
| **504** | 网关超时 | 响应超时 | 优化查询或增加超时时间 |

### 数据库错误

| 错误代码 | 说明 | 解决方案 |
|---------|------|----------|
| **ER_ACCESS_DENIED_ERROR** | 访问被拒绝 | 检查用户名密码 |
| **ER_BAD_DB_ERROR** | 数据库不存在 | 创建数据库 |
| **ER_NO_SUCH_TABLE** | 表不存在 | 运行迁移脚本 |
| **ER_DUP_ENTRY** | 重复键 | 检查唯一性约束 |
| **ER_NO_REFERENCED_ROW** | 外键约束失败 | 检查关联数据是否存在 |

---

## 应急响应

### 紧急联系人

| 角色 | 联系方式 | 职责 |
|------|----------|------|
| **系统管理员** | 13545023884 | 整体协调 |
| **后端开发** | 13545023884 | 后端故障处理 |
| **前端开发** | 13545023884 | 前端故障处理 |
| **数据库管理员** | 13545023884 | 数据库故障处理 |

### 应急响应流程

#### P0 - 严重故障（15分钟响应）

1. 立即通知应急团队
2. 启动备用服务（如有）
3. 定位故障原因
4. 实施临时方案
5. 恢复服务
6. 彻底解决问题

#### P1 - 高危故障（30分钟响应）

1. 通知相关人员
2. 分析故障影响
3. 制定解决方案
4. 实施修复
5. 验证恢复

---

## 相关文档

- [系统维护](./maintenance.md) - 维护流程和备份策略
- [监控指南](./monitoring.md) - 监控配置和告警规则
- [部署手册](../02-deployment/deployment-guide.md) - 部署流程和配置
- [API文档](../04-api/api-reference.md) - API接口说明

---

**维护团队**: 运维团队
**最后更新**: 2026-03-05
**版本**: v1.0.0
