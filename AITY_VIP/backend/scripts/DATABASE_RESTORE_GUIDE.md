# 数据库恢复使用指南

## 📋 概述

本指南用于恢复AITY VIP项目的数据库，使用了新的数据库名称以便与旧数据库合并（如果找到）。

**新数据库名称**: `投研图灵室_v2`
**创建时间**: 2026-04-15

---

## 🚀 快速开始（3步完成）

### 第1步：在Navicat中执行SQL脚本

1. 打开Navicat，连接到 `124.221.119.134:3306`
2. 点击 **查询** → **新建查询**
3. 打开文件：`backend/scripts/restore-database-complete.sql`
4. 点击 **运行** （或按F9）
5. 等待执行完成（约5-10秒）

✅ 看到 "数据库初始化完成" 提示即表示成功！

---

### 第2步：更新环境变量配置

编辑 `backend/.env.production-remote` 文件：

```bash
# 修改这行
DB_NAME=投研图灵室_v2
```

或者编辑 `backend/.env.development` 文件：

```bash
# 修改这行
DB_NAME=投研图灵室_v2
```

---

### 第3步：验证数据库

在Navicat中：

1. 刷新数据库列表
2. 找到 `投研图灵室_v2` 数据库
3. 查看表：应该有10个表
   - groups_table
   - users
   - message_attachments
   - messages
   - user_favorites
   - user_message_reads
   - discussions
   - discussion_replies
   - discussion_favorites
   - ai_config

4. 查询用户表：
   ```sql
   SELECT * FROM users;
   ```
   应该看到5个测试用户（密码都是：123456）

---

## 👥 测试账号

| 邮箱 | 密码 | 角色 | 说明 |
|------|------|------|------|
| admin@aity.com | 123456 | 超级管理员 | 拥有所有权限 |
| manager@aity.com | 123456 | 管理员 | 普通管理员 |
| vip_mid@aity.com | 123456 | VIP中线用户 | VIP用户 |
| vip_short@aity.com | 123456 | VIP短线用户 | VIP用户 |
| trial@aity.com | 123456 | 试用用户 | 已过期 |

---

## 🔄 数据合并方案（如果找到旧数据库）

### 方案A: 直接合并数据

如果找到旧的 `投研图灵室` 数据库，可以合并数据：

```sql
-- 1. 合并用户数据（保留旧用户的ID）
INSERT INTO 投研图灵室_v2.users
SELECT * FROM 投研图灵室.users
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email);

-- 2. 合并消息数据
INSERT INTO 投研图灵室_v2.messages
SELECT * FROM 投研图灵室.messages
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  content = VALUES(content);

-- 3. 合并讨论数据
INSERT INTO 投研图灵室_v2.discussions
SELECT * FROM 投研图灵室.discussions
ON DUPLICATE KEY UPDATE
  content = VALUES(content);

-- 4. 合并其他表
INSERT INTO 投研图灵室_v2.message_attachments
SELECT * FROM 投研图灵室.message_attachments;

INSERT INTO 投研图灵室_v2.user_favorites
SELECT * FROM 投研图灵室.user_favorites;

INSERT INTO 投研图灵室_v2.user_message_reads
SELECT * FROM 投研图灵室.user_message_reads;

INSERT INTO 投研图灵室_v2.discussion_replies
SELECT * FROM 投研图灵室.discussion_replies;

INSERT INTO 投研图灵室_v2.discussion_favorites
SELECT * FROM 投研图灵室.discussion_favorites;
```

### 方案B: 导出旧数据再导入

如果旧数据库在不同的服务器：

1. **导出旧数据库**：
   ```bash
   # 在Navicat中：右键 投研图灵室 → 转储SQL文件
   # 或使用命令行：
   mysqldump -h 旧服务器IP -u fl -p 投研图灵室 > old_backup.sql
   ```

2. **导入到新数据库**：
   ```bash
   # 在Navicat中：运行SQL文件
   # 或使用命令行：
   mysql -h 124.221.119.134 -u fl -p 投研图灵室_v2 < old_backup.sql
   ```

---

## ⚙️ 更新AI配置

数据库恢复后，需要更新AI模型的API密钥：

```sql
-- 更新智谱AI的API密钥
UPDATE ai_config
SET api_key = '你的实际API密钥'
WHERE model_name = 'glm-4-flash';
```

或通过后端管理界面更新（如果有的话）。

---

## 🛠️ 故障排查

### 问题1: 无法创建数据库

**错误**: `Can't create database '投研图灵室_v2' (errno: 16038240)`

**解决方案**:
1. 先在Navicat中手动创建数据库：
   - 右键连接 → 新建数据库
   - 名称: `投研图灵室_v2`
   - 字符集: `utf8mb4`
   - 排序规则: `utf8mb4_unicode_ci`

2. 然后运行SQL脚本时跳过CREATE DATABASE部分

### 问题2: 表已存在

**错误**: `Table 'xxx' already exists`

**解决方案**:
在SQL脚本开头添加：
```sql
DROP DATABASE IF EXISTS `投研图灵室_v2`;
```

### 问题3: 连接失败

**错误**: `Access denied for user 'fl'@'%'`

**解决方案**:
检查 `.env` 文件中的数据库配置是否正确：
```bash
DB_HOST=124.221.119.134
DB_PORT=3306
DB_USER=fl
DB_PASSWORD=fl10b312
DB_NAME=投研图灵室_v2
```

---

## 📊 数据库结构

### 核心表

1. **users** - 用户表
   - 存储用户信息、权限、VIP过期时间等

2. **groups_table** - 用户分组
   - all, vip_mid, vip_short, trial

3. **messages** - 消息表
   - 存储盘前点评、早盘点评、风险提示等

4. **discussions** - 讨论表
   - 用户发起的讨论和问答

5. **ai_config** - AI配置表
   - AI模型配置和API密钥

### 关联表

- **message_attachments** - 消息附件
- **user_favorites** - 用户收藏
- **user_message_reads** - 已读记录
- **discussion_replies** - 讨论回复
- **discussion_favorites** - 讨论收藏

---

## ✅ 验证清单

恢复完成后，请检查：

- [ ] 数据库 `投研图灵室_v2` 已创建
- [ ] 10个表都已创建
- [ ] 有5个测试用户
- [ ] 有2条示例消息
- [ ] 有2个AI配置（需更新API密钥）
- [ ] .env文件已更新DB_NAME
- [ ] 后端服务可以正常启动
- [ ] 可以用测试账号登录

---

## 📞 技术支持

如遇问题，请检查：

1. **MySQL版本**: 需要 5.7+ (支持JSON类型)
2. **字符集**: 必须是 utf8mb4
3. **用户权限**: fl用户需要有CREATE DATABASE权限
4. **磁盘空间**: 确保服务器有足够空间

---

## 📅 更新日志

- **2026-04-15**: 创建恢复脚本和指南
  - 使用新数据库名称便于合并
  - 包含完整的表结构和测试数据
  - 提供数据合并方案
