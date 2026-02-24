# AITY VIP 测试数据快速参考

## 📦 文件清单

### SQL脚本
- **complete-test-data.sql** - 完整测试数据SQL脚本（模板，需替换密码哈希）
- **complete-test-data-with-hash.sql** - 包含正确密码哈希的SQL脚本（自动生成）

### Node.js脚本
- **generate-password-hash.js** - 生成bcrypt密码哈希值
- **generate-sql-with-hash.js** - 自动生成包含密码哈希的SQL脚本（推荐使用）
- **create-test-data.js** - 原有Node.js测试数据脚本

### 文档
- **complete-test-data-guide.md** - 详细使用指南
- **README.md** - 本文件（快速参考）

## 🚀 快速开始（3步完成）

### 方式一：自动生成（推荐）

```bash
# 1. 进入脚本目录
cd D:\your-mcp-proxy\AITY_VIP\backend\scripts

# 2. 生成包含密码哈希的SQL脚本
node generate-sql-with-hash.js

# 3. 在MySQL中执行生成的SQL文件
mysql -u root -p 投研图灵室 < complete-test-data-with-hash.sql
```

### 方式二：手动生成

```bash
# 1. 生成密码哈希
node generate-password-hash.js

# 2. 复制生成的哈希值，替换 complete-test-data.sql 中的占位符

# 3. 执行SQL文件
mysql -u root -p 投研图灵室 < complete-test-data.sql
```

## 👥 测试账号

| 序号 | 用户名 | 邮箱 | 密码 | 角色 | 说明 |
|-----|--------|------|------|------|------|
| 1 | 超级管理员 | admin@aity.com | 123456 | super_admin | 拥有所有权限 |
| 2 | 管理员 | manager@aity.com | 123456 | admin | 普通管理员 |
| 3 | 中线VIP | vip_mid@aity.com | 123456 | vip_mid | VIP中线订阅用户 |
| 4 | 短线VIP | vip_short@aity.com | 123456 | vip_short | VIP短线订阅用户 |
| 5 | 试用用户 | trial@aity.com | 123456 | trial | 已过期（测试用） |
| 6 | 测试用户 | vip_test@aity.com | 123456 | vip_mid | 新测试账号 |

## 📊 测试数据统计

### 数据量
- **用户**: 6个
- **消息**: 19+条
  - 全部用户消息: 5条
  - 中线策略消息: 4条
  - 短线策略消息: 3条
  - 混合标签消息: 4条
  - 定时发布: 1条
  - 草稿: 1条
- **讨论**: 10个
  - 公开: 7个
  - 私密: 3个
  - 已回复: 6个
  - 待回复: 4个
- **回复**: 16条
- **收藏**: 14条
- **已读记录**: 53条
- **附件**: 8个

### 消息类型覆盖（10种）
1. pre_market_comment - 盘前点评
2. morning_comment - 早盘点评
3. morning_focus - 早盘关注
4. afternoon_comment - 尾盘点评
5. afternoon_focus - 尾盘关注
6. close_comment - 收盘点评
7. risk_warning - 风险提示
8. system - 系统消息
9. important - 重要消息
10. daily - 日常消息

## 🔍 功能测试清单

### 用户认证
- [ ] 超级管理员登录
- [ ] 普通管理员登录
- [ ] VIP中线用户登录
- [ ] VIP短线用户登录
- [ ] 试用用户登录（已过期）
- [ ] 错误密码登录
- [ ] Token验证

### 消息功能
- [ ] 消息列表（全部用户）
- [ ] 消息列表（中线VIP）
- [ ] 消息列表（短线VIP）
- [ ] 消息详情
- [ ] 消息类型筛选
- [ ] 消息搜索
- [ ] 已读/未读状态
- [ ] 消息收藏
- [ ] 取消收藏
- [ ] 消息附件查看
- [ ] 图片预览

### 讨论功能
- [ ] 创建讨论（公开）
- [ ] 创建讨论（私密）
- [ ] 讨论列表
- [ ] 讨论详情
- [ ] 回复讨论
- [ ] 查看私密讨论（管理员）
- [ ] 查看私密讨论（发起者）
- [ ] 讨论可见性验证

### 管理功能
- [ ] 用户列表
- [ ] 用户详情
- [ ] 用户编辑
- [ ] 用户状态管理
- [ ] 消息创建
- [ ] 消息编辑
- [ ] 消息删除
- [ ] 消息发布
- [ ] 定时发布
- [ ] 讨论管理
- [ ] 数据统计

### 边界情况
- [ ] 过期用户访问VIP内容
- [ ] 无权限访问
- [ ] 数据分页
- [ ] 空数据处理
- [ ] 并发操作

## 🛠️ 常用SQL查询

### 验证数据
```sql
-- 查看所有用户
SELECT id, name, email, role, status, expire_date FROM users;

-- 查看所有消息
SELECT id, title, type, group_id, tags, status FROM messages;

-- 查看所有讨论
SELECT id, message_id, user_name, title, status, visibility FROM discussions;

-- 查看消息附件
SELECT m.id, m.title, a.type, a.url, a.name
FROM messages m
LEFT JOIN message_attachments a ON m.id = a.message_id;

-- 统计数据
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM messages) as messages,
  (SELECT COUNT(*) FROM discussions) as discussions,
  (SELECT COUNT(*) FROM discussion_replies) as replies,
  (SELECT COUNT(*) FROM user_favorites) as favorites,
  (SELECT COUNT(*) FROM user_message_reads) as reads;
```

### 清理测试数据
```sql
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

## 📝 注意事项

1. **密码加密**: 所有测试账号密码均为`123456`，使用bcrypt加密（10轮）
2. **数据清理**: 清理脚本默认注释，需要时请手动取消注释
3. **重复执行**: SQL脚本使用`ON DUPLICATE KEY UPDATE`，可安全重复执行
4. **外键约束**: 已按正确顺序插入数据，避免外键问题
5. **生产环境**: 禁止在任何生产环境使用测试数据脚本

## 🔄 与现有脚本的关系

- **create-test-data.js** - Node.js版本的测试数据脚本，开发环境推荐使用
- **complete-test-data.sql** - SQL版本，测试环境推荐使用，数据更完整
- **create-vip-test-user.js** - 创建单个VIP测试用户
- **verify-vip-account.js** - 验证VIP账号状态

## 📚 更多信息

详细使用说明请参考：**complete-test-data-guide.md**

## 🆘 故障排除

### 问题1：无法连接数据库
```bash
# 检查MySQL服务状态
# Windows
net start MySQL

# 检查数据库配置
# 查看 .env 文件中的数据库配置
```

### 问题2：密码验证失败
```bash
# 重新生成密码哈希
node generate-password-hash.js

# 或者使用自动生成脚本
node generate-sql-with-hash.js
```

### 问题3：外键约束错误
```sql
-- 检查外键约束是否开启
SHOW VARIABLES LIKE 'foreign_key_checks';

-- 临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;
-- 执行SQL脚本
SET FOREIGN_KEY_CHECKS = 1;
```

### 问题4：中文乱码
```sql
-- 修改数据库字符集
ALTER DATABASE `投研图灵室` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 修改表字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📞 支持

如有问题，请联系开发团队或查看项目文档。

---

**版本**: v1.0
**更新**: 2026-02-06
**维护**: AITY VIP Team
