# AITY VIP 数据库建表指南

## 📋 概述

本指南帮助你在新服务器或本地环境中快速建立完整的AITY VIP数据库。

**文件位置**: `backend/scripts/database-complete-setup.sql`

**数据库信息**:
- 数据库名称: `投研图灵室_v2`
- 字符集: `utf8mb4`
- 排序规则: `utf8mb4_unicode_ci`
- 表数量: 10个核心表

---

## 📦 包含的数据

### 表结构（10个表）
1. `groups_table` - 用户分组表
2. `users` - 用户表
3. `message_attachments` - 消息附件表
4. `messages` - 消息表
5. `user_favorites` - 用户收藏表
6. `user_message_reads` - 用户消息已读表
7. `discussions` - 讨论表
8. `discussion_replies` - 讨论回复表
9. `discussion_favorites` - 讨论收藏表
10. `ai_config` - AI配置表

### 测试数据
- **用户**: 5个测试用户（密码统一为：123456）
- **AI模型**: 16个已验证可用的AI模型配置
- **消息**: 2条示例消息
- **分组**: 4个用户分组（all, vip_mid, vip_short, trial）

---

## 🚀 快速开始

### 方法1: 使用MySQL命令行（推荐）

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 执行建表脚本
source /d/your-mcp-proxy/AITY_VIP/backend/scripts/database-complete-setup.sql

# 或者一行命令
mysql -u root -p < /d/your-mcp-proxy/AITY_VIP/backend/scripts/database-complete-setup.sql
```

### 方法2: 使用Navicat或其他图形化工具

1. 打开Navicat，连接到MySQL服务器
2. 点击"查询" → "新建查询"
3. 打开文件: `backend/scripts/database-complete-setup.sql`
4. 点击"运行"（或按F5）

### 方法3: 使用脚本自动初始化

```bash
cd /d/your-mcp-proxy/AITY_VIP/backend
node scripts/init-database.js
```

---

## 👥 测试账号

| 用户名 | 邮箱 | 密码 | 角色 | 说明 |
|--------|------|------|------|------|
| admin | admin@example.com | 123456 | super_admin | 超级管理员，拥有所有权限 |
| 管理员 | manager@example.com | 123456 | admin | 普通管理员 |
| 等风来 | 625668823@qq.com | 123456 | vip_short | VIP短线用户 |
| vip_test | vip_test@example.com | 123456 | vip_mid | VIP中线用户 |
| 试用用户 | trial@example.com | 123456 | trial | 试用用户（已过期） |

---

## 🤖 AI模型配置

系统已预置16个已验证可用的AI模型：

### 推荐使用（默认启用）
1. **glm-4-flash** (智谱AI) - 性价比最高，免费快速
2. **deepseek-v3-250324** (火山引擎) - 分析能力强
3. **qwen3-max** (阿里云) - 旗舰模型，功能最强
4. **qwen-turbo** (阿里云) - 极速响应，成本低

### 所有模型
- **智谱AI**: glm-4-flash, glm-4.7
- **火山引擎**: deepseek-v3, deepseek-r1, doubao-1.5-pro, doubao-1.5-lite
- **阿里云**: qwen3-max, qwen3.5-plus, qwen3.5-flash, qwen-plus, qwen-turbo, deepseek-v3, deepseek-r1, kimi-k2.5, MiniMax-M2.5, glm-4.7

**API密钥已包含，无需配置！**

---

## 🔧 初始化后配置

### 1. 更新后端配置

编辑 `backend/.env` 或 `backend/.env.production`:

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=投研图灵室_v2

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### 2. 测试数据库连接

```bash
cd backend
node test-db-connection.js
```

### 3. 启动后端服务

```bash
cd backend
npm install  # 首次运行
npm start
```

---

## 📊 验证安装

执行以下SQL验证数据库是否正确创建：

```sql
-- 查看数据库
SHOW DATABASES LIKE '投研图灵室%';

-- 查看表
USE 投研图灵室_v2;
SHOW TABLES;

-- 查看用户数据
SELECT id, name, email, role, status FROM users;

-- 查看AI配置
SELECT id, model_name, display_name, is_active FROM ai_config ORDER BY sort_order;

-- 统计数据
SELECT '用户' AS type, COUNT(*) AS count FROM users
UNION ALL
SELECT 'AI模型', COUNT(*) FROM ai_config
UNION ALL
SELECT '消息', COUNT(*) FROM messages;
```

---

## 🔄 更新现有数据库

如果数据库已存在，只想更新结构或添加测试数据：

### 仅更新表结构
```sql
USE 投研图灵室_v2;
-- 手动执行每个CREATE TABLE语句（去掉DROP TABLE）
```

### 仅添加测试数据
```sql
USE 投研图灵室_v2;
-- 执行INSERT语句部分
```

### 使用模型同步
```bash
cd backend
npx sequelize-cli db:migrate
```

---

## 🛠️ 故障排查

### 问题1: 字符集错误

**错误**: `Character set 'utf8mb4' is not supported`

**解决**: 确保MySQL版本 >= 5.5.3

```sql
-- 检查MySQL版本
SELECT VERSION();
```

### 问题2: 数据库已存在

**错误**: `Can't create database '投研图灵室_v2'; database exists`

**解决**: 脚本会自动删除旧数据库，如需保留：

```sql
-- 修改脚本，注释掉删除语句
-- DROP DATABASE IF EXISTS `投研图灵室_v2`;
```

### 问题3: 权限不足

**错误**: `Access denied for user 'root'@'localhost'`

**解决**: 确保MySQL用户有CREATE DATABASE权限

```sql
-- 授予权限
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 问题4: 中文乱码

**解决**: 确保连接字符集正确

```bash
mysql -u root -p --default-character-set=utf8mb4
```

或在配置文件中添加：

```env
DB_CHARSET=utf8mb4
```

---

## 📚 相关文档

- [数据库表结构文档](./DATABASE_SCHEMA.md)
- [数据库恢复指南](./DATABASE_RESTORE_GUIDE.md)
- [测试数据说明](./complete-test-data-guide.md)

---

## 🆘 获取帮助

如果遇到问题：

1. 检查MySQL版本和字符集支持
2. 查看MySQL错误日志: `/var/log/mysql/error.log`
3. 确认文件路径和权限
4. 查看Sequelize同步日志

---

## 📝 更新日志

### v2.0 (2026-04-16)
- ✅ 完整表结构（10个表）
- ✅ 5个测试用户（含真实用户）
- ✅ 16个AI模型配置
- ✅ 4个用户分组
- ✅ 示例消息数据
- ✅ 完整索引和约束

---

**创建时间**: 2026-04-16
**维护者**: AITY VIP Team
**版本**: v2.0
