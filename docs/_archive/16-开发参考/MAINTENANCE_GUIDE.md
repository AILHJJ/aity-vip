# AITY VIP 项目维护指南

## 📋 概述

本文档提供AITY VIP项目的日常维护指南，包括常见问题处理、性能监控、备份恢复等操作。

---

## 🚀 日常维护任务

### 每日任务

#### 1. 数据备份检查
```bash
# 检查最近备份
cd /path/to/backups
ls -lt | head -5

# 验证备份完整性
# (具体命令见 DATA_BACKUP_STRATEGY.md)
```

#### 2. 系统状态检查
```bash
# 检查后端服务状态
curl -s http://localhost:3001/api/health

# 检查数据库连接
cd backend
node test-db-connection.js
```

#### 3. 日志检查
```bash
# 查看错误日志
tail -f backend/logs/error.log

# 查看访问日志
tail -f backend/logs/access.log
```

### 每周任务

#### 1. 数据库性能检查
```sql
-- 检查数据库大小
SELECT
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;

-- 检查表大小
SELECT
  table_name AS 'Table',
  ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = '投研图灵室'
ORDER BY (data_length + index_length) DESC;
```

#### 2. 用户状态检查
```sql
-- 检查即将过期的用户
SELECT
  name,
  email,
  role,
  expire_date,
  DATEDIFF(expire_date, CURDATE()) as days_left
FROM users
WHERE expire_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY expire_date;

-- 检查过期用户
SELECT
  name,
  email,
  role,
  expire_date,
  DATEDIFF(CURDATE(), expire_date) as days_expired
FROM users
WHERE expire_date < CURDATE()
ORDER BY expire_date DESC;
```

#### 3. 磁盘空间检查
```bash
# 检查服务器磁盘使用
df -h

# 检查数据库目录大小
du -sh /var/lib/mysql/投研图灵室

# 检查日志文件大小
du -sh backend/logs/
```

### 每月任务

#### 1. 数据库优化
```sql
-- 优化表
OPTIMIZE TABLE users;
OPTIMIZE TABLE messages;
OPTIMIZE TABLE discussions;
OPTIMIZE TABLE ai_config;

-- 分析表
ANALYZE TABLE users;
ANALYZE TABLE messages;
ANALYZE TABLE discussions;
```

#### 2. 用户数据清理
```sql
-- 清理过期试用用户
-- (谨慎操作，先备份数据)
-- DELETE FROM users WHERE expire_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND role = 'trial';
```

---

## 🔧 常见维护操作

### 数据库维护

#### 重置用户密码
```bash
cd backend
node scripts/sync-members.js
```

#### 清理测试数据
```sql
-- 清理讨论相关数据
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM discussion_replies WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
DELETE FROM discussions WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
SET FOREIGN_KEY_CHECKS = 1;
```

#### 更新AI配置
```sql
-- 更新AI模型状态
UPDATE ai_config SET status = 'available' WHERE model_name = 'glm-4-flash';
```

### 系统维护

#### 重启后端服务
```bash
cd backend
pm2 restart all

# 或
npm stop
npm start
```

#### 清理日志文件
```bash
# 归档旧日志
mkdir -p logs/archive
mv logs/*.log logs/archive/

# 压缩日志
gzip logs/archive/*.log
```

#### 更新依赖包
```bash
cd backend
npm update

cd aity-uni-app-v2
npm update
```

---

## 🚨 故障排除

### 问题1: 数据库连接失败

**症状**: 无法连接到数据库

**诊断**:
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 检查数据库配置
cd backend
cat .env | grep DB_

# 测试连接
mysql -u root -p -e "SELECT VERSION();"
```

**解决**:
```bash
# 启动MySQL服务
sudo systemctl start mysql

# 或修改配置文件
# backend/.env
```

### 问题2: API响应慢

**症状**: 接口响应时间过长

**诊断**:
```sql
-- 检查慢查询
SHOW PROCESSLIST;

-- 查看表锁
SHOW OPEN TABLES WHERE In_use > 0;

-- 检查连接数
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
```

**解决**:
```bash
# 重启MySQL服务
sudo systemctl restart mysql

# 或优化查询
# 添加索引，优化SQL语句
```

### 问题3: 磁盘空间不足

**症状**: 磁盘使用率过高

**诊断**:
```bash
# 查找大文件
find / -type f -size +100M 2>/dev/null | xargs ls -lh

# 查看磁盘使用
du -sh /* | sort -rh | head -10
```

**解决**:
```bash
# 清理日志文件
rm -rf backend/logs/*.log

# 清理备份文件
find /path/to/backups -name "*.sql.gz" -mtime +30 -delete

# 清理临时文件
find /tmp -type f -mtime +7 -delete
```

### 问题4: 内存使用过高

**症状**: 系统内存占用过高

**诊断**:
```bash
# 查看进程内存使用
ps aux --sort=-%mem | head -10

# 查看Node.js进程
pm2 monit
```

**解决**:
```bash
# 重启Node.js服务
pm2 restart all

# 或增加内存限制
pm2 start backend --max-memory-restart 1G
```

---

## 📊 性能监控

### 系统资源监控

```bash
# CPU使用率
top -bn1 | grep "Cpu(s)"

# 内存使用率
free -h

# 磁盘IO
iostat -x 1 5

# 网络连接
netstat -an | grep ESTABLISHED | wc -l
```

### 应用监控

```bash
# PM2进程监控
pm2 list
pm2 monit

# API响应时间
curl -w "@%{time_total}\n" -o /dev/null -s http://localhost:3001/api/health

# 数据库查询性能
# (需要开启慢查询日志)
```

---

## 🔐 安全维护

### 定期安全检查

#### 1. 密码强度检查
```bash
# 检查是否有弱密码用户
SELECT name, email FROM users WHERE password = '$2a$10$UsYpJLJmPvYnLZfH7PLHpOx/xZqL7EqT3PQN9Y5FzF7NKTTFdYqOi';
```

#### 2. 过期用户清理
```sql
-- 禁用过期试用用户
UPDATE users
SET status = 'inactive'
WHERE expire_date < CURDATE() AND role = 'trial';
```

#### 3. 日志审计
```bash
# 检查异常登录
grep "Failed login" backend/logs/access.log | tail -20

# 检查API错误
grep "ERROR" backend/logs/error.log | tail -20
```

---

## 📝 维护日志

### 维护记录模板

| 日期 | 操作类型 | 执行人 | 结果 | 备注 |
|------|----------|--------|------|------|
| 2026-04-16 | 数据库恢复 | Claude | ✅ 成功 | 完整恢复13用户+18AI配置 |
| 2026-04-16 | 文件清理 | Claude | ✅ 成功 | 清理临时文件和归档 |
| 2026-04-16 | 文档重组 | Claude | ✅ 成功 | 优化文档结构 |

---

## 🎯 预防性维护

### 代码层面

1. **定期代码审查**: 每月审查一次核心代码
2. **依赖更新**: 每季度更新一次依赖包
3. **安全扫描**: 定期运行安全扫描工具

### 基础设施层面

1. **服务器更新**: 定期更新系统和软件
2. **备份测试**: 每月测试备份恢复流程
3. **性能测试**: 每季度进行性能压测

### 数据层面

1. **数据验证**: 每周验证数据完整性
2. **索引优化**: 每月检查和优化索引
3. **数据清理**: 每季度清理过期数据

---

## 📞 紧急联系

### 关键服务中断

1. **立即检查**: 确认问题范围和影响
2. **快速恢复**: 使用备份快速恢复服务
3. **通知用户**: 及时通知用户服务状态
4. **根因分析**: 事后分析问题原因

### 数据丢失

1. **停止写入**: 防止数据进一步损坏
2. **评估损失**: 确认丢失数据范围
3. **开始恢复**: 使用最新备份恢复
4. **验证数据**: 确认数据完整性

---

## 📚 相关文档

- [数据备份策略](../backend/scripts/DATA_BACKUP_STRATEGY.md)
- [数据恢复手册](../backend/scripts/DATA_RECOVERY_MANUAL.md)
- [数据库设置指南](../backend/scripts/DATABASE_SETUP_GUIDE.md)
- [用户密码清单](../backend/scripts/USER_PASSWORD_LIST.md)

---

**创建时间**: 2026-04-16  
**版本**: v1.0  
**维护**: AITY VIP Team  
**状态**: ✅ 已生效