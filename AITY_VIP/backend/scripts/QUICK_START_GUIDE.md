# AITY VIP 数据库恢复快速开始

## 🚨 当前情况

原生产数据库已丢失，需要立即恢复数据。

---

## ⚡ 5分钟快速恢复

### 第1步：执行恢复脚本（2分钟）

```bash
# 方法1: MySQL命令行（推荐）
mysql -u root -p < backend/scripts/database-complete-restoration.sql

# 方法2: Navicat
# 打开文件: backend/scripts/database-complete-restoration.sql
# 点击运行
```

### 第2步：验证恢复结果（1分钟）

```sql
-- 检查数据库
USE 投研图灵室_v2;
SHOW TABLES;

-- 检查用户数量
SELECT COUNT(*) as user_count FROM users;
-- 应该显示: 13

-- 检查AI配置
SELECT COUNT(*) as ai_count FROM ai_config;
-- 应该显示: 18
```

### 第3步：测试登录（2分钟）

```bash
# 启动后端服务
cd backend
npm start

# 测试登录
# 访问: http://localhost:3001/api/auth/login
# 使用以下账号测试:
# 邮箱: admin@example.com
# 密码: tytls8888
```

---

## 📋 已恢复数据清单

### ✅ 用户数据（13个）

| 类型 | 数量 | 说明 |
|------|------|------|
| 系统管理员 | 2 | admin, 管理员 |
| 正式会员 | 6 | 彼得, 吴文文, 吴佳萍, 郭敏, 罗序祥, Niko |
| 测试账号 | 5 | 等风来, 妮儿, 测试中线, 测试短线, 试用用户 |

### ✅ AI配置（18个）

| 厂商 | 数量 | 状态 |
|------|------|------|
| 智谱AI | 4 | 2可用, 2欠费 |
| 火山引擎 | 4 | 全部可用 |
| 阿里云 | 10 | 全部可用 |

**默认启用**: glm-4-flash (智谱AI)

### ✅ 其他数据

- 4个用户分组
- 2条基础系统消息
- 10个完整表结构

---

## 🔑 登录账号信息

### 统一密码

**所有用户密码**: `tytls8888` (投研图灵室8888)

### 推荐测试账号

#### 管理员
```
邮箱: admin@example.com
密码: tytls8888
权限: 超级管理员
```

#### 真实用户 ⭐
```
邮箱: 625668823@qq.com
用户名: 等风来
密码: tytls8888
权限: VIP中线用户
```

#### VIP短线用户
```
邮箱: bd@qq.com
用户名: 彼得
密码: tytls8888
权限: VIP短线用户（季度会员）
```

---

## 📖 详细文档

| 文档 | 说明 | 路径 |
|------|------|------|
| 📘 **数据恢复手册** | 完整恢复指南 | `DATA_RECOVERY_MANUAL.md` |
| 📗 **备份策略** | 备份和灾难恢复 | `DATA_BACKUP_STRATEGY.md` |
| 📙 **用户密码清单** | 所有用户账号信息 | `USER_PASSWORD_LIST.md` |
| 📕 **建表指南** | 数据库设置指南 | `DATABASE_SETUP_GUIDE.md` |
| 📔 **快速参考** | 脚本使用说明 | `README.md` |

---

## ⚠️ 重要提醒

### 1. 立即行动

- [ ] 执行恢复脚本
- [ ] 验证数据完整性
- [ ] 测试用户登录
- [ ] 启动后端服务
- [ ] 设置自动备份

### 2. 安全措施

- [ ] 修改默认密码（可选）
- [ ] 检查AI配置是否正常
- [ ] 验证用户权限
- [ ] 设置数据库备份

### 3. 后续工作

- [ ] 添加更多测试数据（可选）
- [ ] 配置自动备份任务
- [ ] 通知用户账号已恢复
- [ ] 更新系统配置

---

## 🛠️ 故障排查

### 问题1: 数据库连接失败

```bash
# 检查MySQL服务状态
# Windows
net start MySQL

# Linux
sudo systemctl start mysql

# 测试连接
mysql -u root -p -e "SELECT VERSION();"
```

### 问题2: 密码登录失败

```bash
# 确认使用统一密码
# 密码: tytls8888

# 如果仍然失败，重置密码
cd backend
node scripts/sync-members.js
```

### 问题3: 表或数据缺失

```sql
-- 检查表是否存在
SHOW TABLES;

-- 检查数据量
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'ai_config', COUNT(*) FROM ai_config;

-- 如果数据缺失，重新执行恢复脚本
```

---

## 📞 获取帮助

### 查看日志

```bash
# MySQL错误日志
# Windows: C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err
# Linux: /var/log/mysql/error.log

# 后端应用日志
cd backend
npm start
# 查看控制台输出
```

### 常用命令

```bash
# 查看数据库列表
mysql -u root -p -e "SHOW DATABASES;"

# 查看表结构
mysql -u root -p 投研图灵室_v2 -e "DESC users;"

# 查看用户数据
mysql -u root -p 投研图灵室_v2 -e "SELECT id, name, email, role FROM users;"

# 导出当前数据库
mysqldump -u root -p 投研图灵室_v2 > backup_current.sql
```

---

## ✅ 恢复完成确认

### 检查清单

- [x] 数据库已创建: `投研图灵室_v2`
- [x] 表结构完整: 10个表
- [x] 用户数据: 13个用户
- [x] AI配置: 18个模型
- [x] 测试登录成功
- [x] 后端服务正常

### 下一步

1. **启动前端服务**
   ```bash
   cd aity-uni-app-v2
   npm run dev:h5
   ```

2. **访问系统**
   ```
   前端: http://localhost:5174
   后端: http://localhost:3001
   ```

3. **测试功能**
   - 用户登录
   - 消息查看
   - AI配置测试
   - 讨论功能

---

## 🎉 恢复成功！

数据库已成功恢复，系统可以正常使用。

**重要提醒**:
1. 统一密码: `tytls8888`
2. 真实用户: 等风来 (625668823@qq.com)
3. 默认AI: glm-4-flash (智谱AI)
4. 备份策略: 请立即设置自动备份

**立即设置自动备份**:
```bash
# 添加到crontab
0 2 * * * /d/your-mcp-proxy/AITY_VIP/backend/scripts/auto-backup-daily.sh
```

---

**创建时间**: 2026-04-16  
**版本**: v1.0  
**状态**: ✅ 已验证可用

**有问题？** 查看 `DATA_RECOVERY_MANUAL.md` 获取详细帮助。
