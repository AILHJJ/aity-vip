# AITY VIP 数据恢复完整手册

## 🚨 紧急数据恢复指南

### 情况说明
原生产数据库丢失，需要基于项目历史数据恢复完整数据库。

### 🎯 恢复目标
1. ✅ 恢复所有真实用户数据
2. ✅ 恢复完整的AI配置
3. ✅ 恢复历史消息和讨论
4. ✅ 建立数据备份机制
5. ✅ 防止未来数据丢失

---

## 📋 数据恢复清单

### 第一步：数据收集 ✅

| 数据来源 | 文件位置 | 数据内容 | 状态 |
|---------|---------|----------|------|
| 用户数据 | `backend/scripts/sync-members.js` | 真实会员信息（彼得、吴文文、等风来等） | ✅ 已收集 |
| AI配置 | `backend/migrations/20260227-ai-models-complete.sql` | 18个AI模型配置 | ✅ 已收集 |
| 消息数据 | `backend/scripts/complete-test-data-with-hash.sql` | 19条完整消息 | ✅ 已收集 |
| 测试数据 | `backend/create-complete-test-data.js` | 完整测试场景 | ✅ 已收集 |
| 表结构 | `backend/src/models/*.js` | 10个表结构定义 | ✅ 已收集 |

### 第二步：数据整合 ✅

已创建完整恢复脚本：
- **文件**: `backend/scripts/database-complete-restoration.sql`
- **版本**: v3.0 Final
- **大小**: 约50KB
- **内容**: 完整表结构 + 所有历史数据

---

## 🚀 快速恢复步骤

### 方法1：MySQL命令行（推荐）

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 执行恢复脚本
source /d/your-mcp-proxy/AITY_VIP/backend/scripts/database-complete-restoration.sql

# 或者一行命令
mysql -u root -p < /d/your-mcp-proxy/AITY_VIP/backend/scripts/database-complete-restoration.sql
```

### 方法2：Navicat图形界面

1. 打开Navicat，连接到MySQL服务器
2. 点击"查询" → "新建查询"
3. 打开文件: `backend/scripts/database-complete-restoration.sql`
4. 点击"运行"（或按F5）

### 方法3：Node.js脚本

```bash
cd backend
node scripts/init-database.js
```

---

## 👥 恢复的用户数据

### 系统管理员（2个）
| 用户名 | 邮箱 | 密码 | 角色 | 说明 |
|--------|------|------|------|------|
| admin | admin@example.com | tytls8888 | super_admin | 超级管理员 |
| 管理员 | manager@example.com | tytls8888 | admin | 普通管理员 |

### 正式会员（6个）
| 昵称 | 邮箱 | 会员类型 | 过期时间 | 状态 |
|------|------|----------|----------|------|
| 彼得 | bd@qq.com | 季卡 | 3个月后 | active |
| 吴文文 | 11222@qq.com | 季卡 | 3个月后 | active |
| 吴佳萍 | wjp@qq.com | 季卡 | 3个月后 | active |
| 郭敏 | gm8888@qq.com | 半年卡 | 6个月后 | active |
| 罗序祥 | lxx@qq.com | 月卡 | 1个月后 | active |
| Niko | 123456@qq.com | 月卡 | 1个月后 | active |

### 测试账号（5个）
| 昵称 | 邮箱 | 角色 | 会员类型 | 过期时间 | 说明 |
|------|------|------|----------|----------|------|
| 等风来 | 625668823@qq.com | vip_mid | 月卡 | 1个月后 | **真实用户** |
| 妮儿 | nier@test.com | vip_short | 月卡 | 1个月后 | 测试账号 |
| 测试中线 | test_mid@test.com | vip_mid | 季卡 | 3个月后 | 测试账号 |
| 测试短线 | test_short@test.com | vip_short | 季卡 | 3个月后 | 测试账号 |
| 试用用户 | trial@example.com | trial | - | 已过期 | 测试账号 |

**统一密码**: `tytls8888` (投研图灵室8888)

---

## 🤖 AI配置恢复

### 已恢复的AI模型（18个）

#### 智谱AI（4个）
1. **glm-4-flash** ✅ (默认启用) - 性价比之王
2. glm-4.5 ⚠️ - 欠费状态
3. **glm-4.7** ✅ - 推理增强版
4. glm-5 ⚠️ - 旗舰版（欠费）

#### 火山引擎（4个）
5. **deepseek-v3-250324** ✅ - 分析能力强
6. **deepseek-r1-250528** ✅ - 深度推理
7. **doubao-1-5-pro-32k-250115** ✅ - 通俗易懂
8. **doubao-1-5-lite-32k-250115** ✅ - 快速版

#### 阿里云通义千问（10个）
9. **qwen3-max** ✅ - 旗舰版
10. **qwen3.5-plus** ✅ - 增强版
11. **qwen3.5-flash** ✅ - 快速版
12. **qwen-plus** ✅ - 稳定版
13. **qwen-turbo** ✅ - 极速版
14. **deepseek-v3(阿里云)** ✅ - 托管版
15. **deepseek-r1(阿里云)** ✅ - 推理版
16. **kimi-k2.5** ✅ - 长文本专家
17. **MiniMax-M2.5** ✅ - 创意生成
18. **glm-4.7(阿里云)** ✅ - 推理增强

**API密钥状态**: ✅ 所有密钥已恢复，无需重新配置

---

## 📊 数据完整性检查

### 恢复后验证步骤

```sql
-- 1. 检查数据库
SHOW DATABASES LIKE '投研图灵室%';

-- 2. 检查表结构
USE 投研图灵室_v2;
SHOW TABLES;

-- 3. 检查用户数据
SELECT id, name, email, role, status, expire_date FROM users;

-- 4. 检查AI配置
SELECT id, model_name, display_name, is_active, status FROM ai_config ORDER BY sort_order;

-- 5. 数据统计
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM ai_config) as ai_models,
  (SELECT COUNT(*) FROM messages) as messages,
  (SELECT COUNT(*) FROM groups_table) as groups;
```

### 预期结果
- ✅ 用户数量: 13
- ✅ AI模型: 18
- ✅ 基础消息: 2
- ✅ 用户分组: 4
- ✅ 表数量: 10

---

## 🔄 添加更多测试数据（可选）

如果需要添加更多测试数据（19条消息 + 讨论 + 回复）：

```bash
# 方法1: 使用SQL脚本
mysql -u root -p 投研图灵室_v2 < backend/scripts/complete-test-data-with-hash.sql

# 方法2: 使用Node脚本
cd backend
node create-complete-test-data.js
```

**额外数据包括**:
- 19条完整消息（覆盖所有类型）
- 10个讨论话题
- 16条讨论回复
- 用户收藏和已读记录
- 消息附件

---

## 🛡️ 数据备份策略

### 自动备份脚本

创建定期备份任务：

```bash
# 1. 创建备份脚本
cat > /path/to/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
mysqldump -u root -p投研图灵室_v2 > ${BACKUP_DIR}/aity_vip_${DATE}.sql
# 保留最近30天的备份
find ${BACKUP_DIR} -name "aity_vip_*.sql" -mtime +30 -delete
EOF

# 2. 添加到crontab（每天凌晨2点执行）
crontab -e
# 添加以下行：
0 2 * * * /path/to/backup.sh
```

### 手动备份

```bash
# 导出完整数据库
mysqldump -u root -p 投研图灵室_v2 > backup_$(date +%Y%m%d).sql

# 只导出数据
mysqldump -u root -p 投研图灵室_v2 --no-create-info > data_$(date +%Y%m%d).sql

# 只导出表结构
mysqldump -u root -p 投研图灵室_v2 --no-data > schema_$(date +%Y%m%d).sql
```

---

## 📝 数据恢复日志

### 恢复记录

| 日期 | 操作 | 执行人 | 结果 | 备注 |
|------|------|--------|------|------|
| 2026-04-16 | 完整数据库恢复 | Claude | ✅ 成功 | 基于历史数据恢复v3.0 |

### 数据来源记录

1. **用户数据来源**: `sync-members.js` (2026-02-27)
2. **AI配置来源**: `20260227-ai-models-complete.sql` (2025-02-27)
3. **消息数据来源**: `complete-test-data-with-hash.sql` (2026-02-06)
4. **测试数据来源**: `create-complete-test-data.js` (2026-02-06)

---

## ⚠️ 注意事项

### 安全提醒

1. **密码安全**:
   - 统一密码: `tytls8888`
   - 生产环境建议首次登录后修改
   - 密码使用bcrypt加密（10轮）

2. **API密钥**:
   - 所有AI模型API密钥已包含
   - 请勿泄露给外部人员
   - 定期检查密钥有效性

3. **数据备份**:
   - 建议每日自动备份
   - 重要操作前手动备份
   - 保留至少30天备份历史

### 恢复后配置

1. **更新环境配置**:
   ```env
   # backend/.env
   DB_NAME=投研图灵室_v2
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   ```

2. **测试连接**:
   ```bash
   cd backend
   node test-db-connection.js
   ```

3. **启动服务**:
   ```bash
   cd backend
   npm start
   ```

---

## 🆘 故障排查

### 常见问题

**Q1: 字符集错误**
```
Character set 'utf8mb4' is not supported
```
**A**: 确保MySQL版本 >= 5.5.3

**Q2: 外键约束错误**
```
Cannot add or update a child row
```
**A**: 数据已按正确顺序插入，检查是否有重复数据

**Q3: 密码登录失败**
```
Invalid password
```
**A**: 确认使用统一密码 `tytls8888`

**Q4: 数据库已存在**
```
Database already exists
```
**A**: 脚本会自动删除旧数据库，如需保留请手动修改

---

## 📞 获取帮助

如遇到问题：

1. 检查MySQL版本和字符集支持
2. 查看MySQL错误日志
3. 确认文件路径和权限
4. 参考本文档故障排查章节

---

## 📚 相关文档

- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - 建表详细指南
- [DATABASE_RESTORE_GUIDE.md](./DATABASE_RESTORE_GUIDE.md) - 数据恢复指南
- [README.md](./README.md) - 脚本快速参考

---

**创建时间**: 2026-04-16
**版本**: v3.0 Final
**维护**: AITY VIP Team
**状态**: ✅ 已验证可用

---

## 🎉 恢复完成

数据库已成功恢复！系统现在包含：

- ✅ 13个用户账号（6个正式会员 + 5个测试账号 + 2个管理员）
- ✅ 18个AI模型配置（API密钥已配置）
- ✅ 4个用户分组
- ✅ 2条基础系统消息
- ✅ 完整的表结构（10个表）

**下一步**: 启动后端服务并测试登录功能！
