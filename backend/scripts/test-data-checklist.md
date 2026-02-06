# AITY VIP 测试数据部署执行清单

## ✅ 执行步骤

### 步骤1：验证环境（5分钟）

- [ ] 确认MySQL服务运行中
- [ ] 确认数据库名称：`投研图灵室`
- [ ] 确认数据库用户有足够权限
- [ ] 确认Node.js环境可用（如需生成密码哈希）

**验证命令：**
```bash
# 检查MySQL服务
mysql -u root -p -e "SELECT VERSION();"

# 检查数据库
mysql -u root -p -e "SHOW DATABASES LIKE '投研图灵室';"

# 检查Node.js（如需要）
node -v
```

### 步骤2：生成SQL脚本（2分钟）

**选项A：使用自动生成脚本（推荐）**
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend\scripts
node generate-sql-with-hash.js
```

- [ ] 执行成功，生成文件：`complete-test-data-with-hash.sql`
- [ ] 确认输出显示"已替换 6 处密码哈希"

**选项B：使用已生成的SQL文件**
- [ ] 确认文件存在：`complete-test-data-with-hash.sql`
- [ ] 文件大小约：22 KB

### 步骤3：备份数据库（可选但推荐）

```bash
# 创建备份
mysqldump -u root -p 投研图灵室 > backup_$(date +%Y%m%d_%H%M%S).sql
```

- [ ] 备份文件已创建
- [ ] 备份文件大小合理

### 步骤4：清理旧数据（可选）

**警告：此操作将删除所有现有数据！**

如果需要清理现有测试数据，在SQL脚本中取消以下部分的注释：

```sql
-- 在 complete-test-data-with-hash.sql 文件开头
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM discussion_replies;
DELETE FROM discussions;
DELETE FROM user_favorites;
DELETE FROM user_message_reads;
DELETE FROM message_attachments;
DELETE FROM messages;
DELETE FROM users;
DELETE FROM groups_table;

SET FOREIGN_KEY_CHECKS = 1;
```

- [ ] 如需清理，已取消注释
- [ ] 如需保留数据，保持注释状态

### 步骤5：执行SQL脚本（3分钟）

**方式A：命令行执行**
```bash
mysql -u root -p 投研图灵室 < D:\your-mcp-proxy\AITY_VIP\backend\scripts\complete-test-data-with-hash.sql
```

**方式B：使用MySQL客户端**
```sql
-- 连接数据库
mysql -u root -p
USE `投研图灵室`;

-- 执行脚本
source D:/your-mcp-proxy/AITY_VIP/backend/scripts/complete-test-data-with-hash.sql;
```

**方式C：使用Navicat等工具**
1. 打开Navicat
2. 连接到数据库
3. 选择数据库`投研图灵室`
4. 新建查询
5. 打开`complete-test-data-with-hash.sql`
6. 点击运行

- [ ] SQL脚本执行成功
- [ ] 无错误信息
- [ ] 显示"测试数据创建完成！"

### 步骤6：验证数据（5分钟）

执行以下验证查询：

```sql
-- 1. 验证用户数据
SELECT role, COUNT(*) as count FROM users GROUP BY role;
-- 预期结果：super_admin:1, admin:1, vip_mid:2, vip_short:1, trial:1

-- 2. 验证消息数据
SELECT type, COUNT(*) as count FROM messages GROUP BY type;
-- 预期结果：10种消息类型都有数据

-- 3. 验证讨论数据
SELECT status, COUNT(*) as count FROM discussions GROUP BY status;
-- 预期结果：pending:4, replied:6

-- 4. 验证统计数据
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM messages) as messages,
  (SELECT COUNT(*) FROM discussions) as discussions,
  (SELECT COUNT(*) FROM discussion_replies) as replies,
  (SELECT COUNT(*) FROM user_favorites) as favorites,
  (SELECT COUNT(*) FROM user_message_reads) as reads;
-- 预期结果：users:6, messages:19+, discussions:10, replies:16, favorites:14, reads:53
```

- [ ] 用户数量：6
- [ ] 消息数量：19+
- [ ] 讨论数量：10
- [ ] 回复数量：16
- [ ] 收藏数量：14
- [ ] 已读记录：53

### 步骤7：测试登录（10分钟）

使用以下测试账号登录系统：

| 序号 | 邮箱 | 密码 | 预期角色 | 测试项 |
|-----|------|------|---------|--------|
| 1 | admin@aity.com | 123456 | 超级管理员 | ✓ 登录成功<br>✓ 可访问所有功能<br>✓ 可管理用户 |
| 2 | manager@aity.com | 123456 | 管理员 | ✓ 登录成功<br>✓ 可管理消息和讨论<br>✓ 不可管理用户 |
| 3 | vip_mid@aity.com | 123456 | VIP中线用户 | ✓ 登录成功<br>✓ 仅看到中线策略消息<br>✓ 可创建讨论 |
| 4 | vip_short@aity.com | 123456 | VIP短线用户 | ✓ 登录成功<br>✓ 仅看到短线策略消息<br>✓ 可创建讨论 |
| 5 | trial@aity.com | 123456 | 试用用户 | ✓ 登录成功<br>✓ 仅看到全部用户消息<br>✓ 账户已过期提示 |
| 6 | vip_test@aity.com | 123456 | 测试用户 | ✓ 登录成功<br>✓ VIP中线用户权限 |

- [ ] 所有测试账号可以登录
- [ ] 角色权限正确
- [ ] 消息访问权限正确

### 步骤8：功能验证（30分钟）

#### 用户认证测试
- [ ] 不同角色登录成功
- [ ] Token验证正常
- [ ] 权限验证正常
- [ ] 过期用户访问限制

#### 消息功能测试
- [ ] 消息列表显示
- [ ] 消息标签过滤
- [ ] 消息类型筛选
- [ ] 消息搜索功能
- [ ] 消息详情查看
- [ ] 已读/未读状态
- [ ] 消息收藏/取消
- [ ] 附件查看

#### 讨论功能测试
- [ ] 创建公开讨论
- [ ] 创建私密讨论
- [ ] 讨论列表显示
- [ ] 讨论详情查看
- [ ] 回复讨论
- [ ] 讨论状态更新

#### 管理功能测试
- [ ] 用户列表查看
- [ ] 用户编辑
- [ ] 用户状态管理
- [ ] 消息创建
- [ ] 消息编辑
- [ ] 消息发布
- [ ] 定时发布
- [ ] 数据统计

## 📊 验证标准

### 数据完整性
- ✓ 所有表都有数据
- ✓ 外键关系正确
- ✓ 无孤立记录
- ✓ 数据统计准确

### 功能完整性
- ✓ 所有用户类型可登录
- ✓ 消息权限过滤正确
- ✓ 讨论功能正常
- ✓ 收藏功能正常
- ✓ 已读状态正确

### 边界情况
- ✓ 过期用户无法访问VIP内容
- ✓ 无权限操作被拒绝
- ✓ 空数据合理处理
- ✓ 并发操作正常

## 🐛 常见问题排查

### 问题1：密码验证失败
**症状**：使用123456无法登录
**原因**：密码哈希未正确生成
**解决**：
```bash
# 重新生成SQL文件
node generate-sql-with-hash.js

# 或手动生成哈希
node generate-password-hash.js
```

### 问题2：外键约束错误
**症状**：执行SQL时报外键约束错误
**原因**：数据插入顺序问题
**解决**：
```sql
-- 临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;
-- 执行SQL脚本
SET FOREIGN_KEY_CHECKS = 1;
```

### 问题3：中文字符乱码
**症状**：查询结果中文显示为???
**原因**：字符集设置问题
**解决**：
```sql
-- 修改数据库字符集
ALTER DATABASE `投研图灵室` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 重新执行SQL脚本
```

### 问题4：数据统计不正确
**症状**：消息的read_count或total_count不准确
**原因**：统计查询未执行
**解决**：
```sql
-- 重新执行统计更新查询（在SQL脚本末尾）
UPDATE messages m
SET total_count = (
  SELECT COUNT(DISTINCT u.id)
  FROM users u
  WHERE u.status = 'active'
  AND (
    m.group_id = 'all'
    OR (m.group_id = 'vip_mid' AND u.role IN ('vip_mid', 'super_admin', 'admin'))
    OR (m.group_id = 'vip_short' AND u.role IN ('vip_short', 'super_admin', 'admin'))
  )
);

UPDATE messages m
SET read_count = (
  SELECT COUNT(DISTINCT r.user_id)
  FROM user_message_reads r
  WHERE r.message_id = m.id
);
```

## 📝 完成确认

### 部署完成后检查

- [ ] 所有脚本执行成功
- [ ] 数据验证通过
- [ ] 测试账号可登录
- [ ] 功能测试通过
- [ ] 无错误日志

### 交付文档

- [ ] 测试数据SQL脚本
- [ ] 使用指南文档
- [ ] 测试账号清单
- [ ] 执行日志

### 签署确认

**部署人员**：____________________  **日期**：____________________

**测试人员**：____________________  **日期**：____________________

**验收人员**：____________________  **日期**：____________________

---

## 📞 支持

如遇到问题：
1. 查看详细指南：`complete-test-data-guide.md`
2. 查看快速参考：`README.md`
3. 联系开发团队

---

**文档版本**：v1.0
**最后更新**：2026-02-06
**维护团队**：AITY VIP Team
