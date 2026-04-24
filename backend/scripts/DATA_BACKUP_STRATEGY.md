# AITY VIP 数据备份与灾难恢复策略

## 📋 概述

本文档定义AITY VIP项目的数据备份策略和灾难恢复流程，确保数据安全和业务连续性。

---

## 🎯 备份目标

1. **数据完整性**: 确保所有关键数据得到备份
2. **恢复速度**: 快速恢复服务，最小化停机时间
3. **数据安全**: 防止数据丢失和损坏
4. **合规要求**: 满足业务数据保留要求

---

## 📊 备份数据范围

### 核心数据表

| 优先级 | 表名 | 说明 | 备份频率 |
|--------|------|------|----------|
| P0 | users | 用户数据 | 每日 |
| P0 | messages | 消息记录 | 每日 |
| P0 | discussions | 讨论数据 | 每日 |
| P1 | ai_config | AI配置 | 每周 |
| P1 | user_favorites | 用户收藏 | 每日 |
| P1 | user_message_reads | 阅读记录 | 每周 |
| P2 | discussion_replies | 讨论回复 | 每日 |
| P2 | discussion_favorites | 讨论收藏 | 每周 |
| P2 | message_attachments | 消息附件 | 每日 |
| P3 | groups_table | 用户分组 | 每周 |

---

## 🔄 备份策略

### 1. 自动备份（推荐）

#### 每日完整备份

```bash
#!/bin/bash
# 文件: scripts/auto-backup-daily.sh
# 说明: 每日自动备份脚本

# 配置
DB_NAME="投研图灵室_v2"
DB_USER="root"
DB_PASSWORD="your_password"
BACKUP_DIR="/path/to/backups/daily"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 生成备份文件名
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/aity_vip_full_${DATE}.sql"

# 执行备份
echo "开始备份: ${DATE}"
mysqldump -u${DB_USER} -p${DB_PASSWORD} \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  ${DB_NAME} > ${BACKUP_FILE}

# 压缩备份文件
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# 验证备份
if [ -f "${BACKUP_FILE}" ]; then
  echo "备份成功: ${BACKUP_FILE}"
  
  # 记录备份日志
  echo "$(date +%Y-%m-%d\ %H:%M:%S) - 备份成功: ${BACKUP_FILE}" >> ${BACKUP_DIR}/backup.log
  
  # 清理旧备份
  find ${BACKUP_DIR} -name "aity_vip_full_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
  echo "已清理 ${RETENTION_DAYS} 天前的旧备份"
else
  echo "备份失败!"
  echo "$(date +%Y-%m-%d\ %H:%M:%S) - 备份失败" >> ${BACKUP_DIR}/backup.log
  exit 1
fi
```

#### 设置定时任务

```bash
# 编辑crontab
crontab -e

# 添加以下任务
# 每天凌晨2点执行完整备份
0 2 * * * /d/your-mcp-proxy/AITY_VIP/backend/scripts/auto-backup-daily.sh

# 每周日凌晨3点执行清理任务
0 3 * * 0 /d/your-mcp-proxy/AITY_VIP/backend/scripts/clean-old-backups.sh
```

### 2. 增量备份（可选）

```bash
#!/bin/bash
# 文件: scripts/auto-backup-incremental.sh
# 说明: 增量备份脚本（基于二进制日志）

# 配置
DB_NAME="投研图灵室_v2"
DB_USER="root"
BACKUP_DIR="/path/to/backups/incremental"

# 启用二进制日志
# 在my.cnf中添加:
# log-bin=mysql-bin
# binlog_format=ROW

# 备份二进制日志
mysqladmin -u${DB_USER} -p${DB_PASSWORD} flush-logs
# 复制日志文件到备份目录
cp /var/lib/mysql/mysql-bin.* ${BACKUP_DIR}/
```

### 3. 手动备份

#### 完整备份

```bash
# 导出完整数据库
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  投研图灵室_v2 > backup_full_$(date +%Y%m%d).sql
```

#### 仅数据备份

```bash
# 只导出数据，不包含表结构
mysqldump -u root -p \
  --no-create-info \
  --single-transaction \
  投研图灵室_v2 > backup_data_$(date +%Y%m%d).sql
```

#### 仅表结构备份

```bash
# 只导出表结构
mysqldump -u root -p \
  --no-data \
  投研图灵室_v2 > backup_schema_$(date +%Y%m%d).sql
```

#### 特定表备份

```bash
# 备份用户表
mysqldump -u root -p \
  投研图灵室_v2 users > backup_users_$(date +%Y%m%d).sql

# 备份消息表
mysqldump -u root -p \
  投研图灵室_v2 messages > backup_messages_$(date +%Y%m%d).sql
```

---

## 🗄️ 备份存储策略

### 本地存储

```
/path/to/backups/
├── daily/           # 每日备份（保留30天）
│   ├── aity_vip_full_20260416.sql.gz
│   ├── aity_vip_full_20260415.sql.gz
│   └── ...
├── weekly/          # 每周备份（保留12周）
│   ├── aity_vip_full_20260415.sql.gz
│   └── ...
└── monthly/         # 每月备份（保留12个月）
    ├── aity_vip_full_20260401.sql.gz
    └── ...
```

### 远程存储（推荐）

```bash
#!/bin/bash
# 文件: scripts/sync-backup-remote.sh
# 说明: 同步备份到远程服务器

# 配置
LOCAL_BACKUP_DIR="/path/to/backups"
REMOTE_SERVER="user@backup-server.com"
REMOTE_BACKUP_DIR="/remote/backups/aity-vip"

# 使用rsync同步
rsync -avz --delete \
  ${LOCAL_BACKUP_DIR}/ \
  ${REMOTE_SERVER}:${REMOTE_BACKUP_DIR}/

# 或使用scp
# scp ${LOCAL_BACKUP_DIR}/*.sql.gz ${REMOTE_SERVER}:${REMOTE_BACKUP_DIR}/
```

### 云存储（可选）

```bash
#!/bin/bash
# 文件: scripts/upload-backup-s3.sh
# 说明: 上传备份到AWS S3

# 配置
BACKUP_FILE=$1
S3_BUCKET="s3://your-bucket/aity-vip-backups"

# 上传到S3
aws s3 cp ${BACKUP_FILE} ${S3_BUCKET}/

# 设置生命周期规则（自动删除旧备份）
# aws s3api put-bucket-lifecycle-configuration ...
```

---

## 🚨 灾难恢复流程

### 场景1: 数据损坏

**症状**: 数据库无法正常查询或数据异常

**恢复步骤**:

1. **停止应用服务**
   ```bash
   # 停止后端服务
   cd backend
   npm stop
   ```

2. **评估损坏程度**
   ```sql
   -- 检查表完整性
   CHECK TABLE users;
   CHECK TABLE messages;
   
   -- 检查数据一致性
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM messages;
   ```

3. **选择恢复策略**
   - 小范围损坏: 使用增量恢复
   - 大范围损坏: 使用完整备份恢复

4. **执行恢复**
   ```bash
   # 从最近备份恢复
   mysql -u root -p 投研图灵室_v2 < /path/to/backups/daily/aity_vip_full_latest.sql
   ```

5. **验证数据**
   ```bash
   cd backend
   node test-db-connection.js
   ```

6. **重启服务**
   ```bash
   cd backend
   npm start
   ```

### 场景2: 完全数据丢失

**症状**: 数据库文件丢失或服务器崩溃

**恢复步骤**:

1. **准备新环境**
   ```bash
   # 安装MySQL
   sudo apt-get install mysql-server
   
   # 启动MySQL服务
   sudo systemctl start mysql
   ```

2. **创建空数据库**
   ```sql
   CREATE DATABASE 投研图灵室_v2
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

3. **恢复最新备份**
   ```bash
   # 从远程备份或本地存储恢复
   mysql -u root -p 投研图灵室_v2 < backup_full_latest.sql
   ```

4. **恢复增量数据**
   ```bash
   # 如果有二进制日志备份
   mysqlbinlog mysql-bin.000123 | mysql -u root -p 投研图灵室_v2
   ```

5. **验证完整性**
   ```sql
   -- 检查所有表
   USE 投研图灵室_v2;
   SHOW TABLES;
   
   -- 检查数据量
   SELECT 'users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'messages', COUNT(*) FROM messages
   UNION ALL
   SELECT 'ai_config', COUNT(*) FROM ai_config;
   ```

6. **更新配置并重启**
   ```bash
   # 更新数据库连接配置
   # 启动服务
   cd backend
   npm start
   ```

### 场景3: 误删除数据

**症状**: 意外删除重要数据

**恢复步骤**:

1. **立即停止写入操作**
   ```bash
   # 停止后端服务，防止更多数据被修改
   cd backend
   npm stop
   ```

2. **评估丢失数据**
   ```sql
   -- 查看最近删除的数据
   -- 检查binlog或其他日志
   ```

3. **选择恢复方法**
   
   **方法A: 从备份恢复**
   ```bash
   # 恢复到删除前的备份
   mysql -u root -p 投研图灵室_v2 < backup_before_delete.sql
   ```
   
   **方法B: 从binlog恢复**
   ```bash
   # 提取binlog中的恢复语句
   mysqlbinlog --start-datetime="2026-04-16 10:00:00" \
               --stop-datetime="2026-04-16 11:00:00" \
               mysql-bin.000123 > recovery.sql
   mysql -u root -p 投研图灵室_v2 < recovery.sql
   ```

4. **验证恢复结果**
   ```sql
   -- 检查删除的数据是否恢复
   SELECT * FROM users WHERE email = 'deleted@example.com';
   ```

---

## 📋 备份验证

### 每周验证任务

```bash
#!/bin/bash
# 文件: scripts/verify-backup.sh
# 说明: 验证备份文件的完整性

# 配置
BACKUP_FILE=$1
TEST_DB="投研图灵室_v2_test"

# 创建测试数据库
mysql -u root -p -e "DROP DATABASE IF EXISTS ${TEST_DB}; CREATE DATABASE ${TEST_DB};"

# 恢复备份到测试数据库
mysql -u root -p ${TEST_DB} < ${BACKUP_FILE}

# 验证表和数据
mysql -u root -p ${TEST_DB} -e "
  SELECT
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM messages) as messages,
    (SELECT COUNT(*) FROM ai_config) as ai_config;
"

# 清理测试数据库
mysql -u root -p -e "DROP DATABASE ${TEST_DB};"

echo "备份验证完成"
```

### 每月灾难恢复演练

```bash
#!/bin/bash
# 文件: scripts/disaster-recovery-drill.sh
# 说明: 完整灾难恢复演练

echo "开始灾难恢复演练..."

# 1. 模拟数据丢失
echo "1. 模拟数据丢失..."
mysqldump -u root -p 投研图灵室_v2 > /tmp/before_drill.sql
mysql -u root -p -e "DROP DATABASE 投研图灵室_v2;"

# 2. 从备份恢复
echo "2. 从备份恢复..."
LATEST_BACKUP=$(find /path/to/backups/daily -name "aity_vip_full_*.sql.gz" | sort | tail -1)
gunzip -c ${LATEST_BACKUP} | mysql -u root -p

# 3. 验证数据
echo "3. 验证数据..."
cd backend
node test-db-connection.js

# 4. 测试应用功能
echo "4. 测试应用功能..."
# 启动测试服务器
# 运行测试脚本

echo "灾难恢复演练完成"
```

---

## 🔐 备份安全

### 加密备份

```bash
#!/bin/bash
# 文件: scripts/backup-encrypted.sh
# 说明: 创建加密备份

# 配置
BACKUP_FILE="backup_$(date +%Y%m%d).sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"
GPG_RECIPIENT="your-email@example.com"

# 创建备份
mysqldump -u root -p 投研图灵室_v2 > ${BACKUP_FILE}

# 加密备份
gpg --encrypt --recipient ${GPG_RECIPIENT} ${BACKUP_FILE}

# 删除未加密文件
rm ${BACKUP_FILE}

# 解密（恢复时）
# gpg --decrypt ${ENCRYPTED_FILE} > backup.sql
```

### 备份文件权限

```bash
# 设置备份文件权限
chmod 600 /path/to/backups/*.sql.gz
chown backup-user:backup-group /path/to/backups/*.sql.gz
```

---

## 📊 备份监控

### 备份状态检查

```bash
#!/bin/bash
# 文件: scripts/check-backup-status.sh
# 说明: 检查备份状态

# 配置
BACKUP_DIR="/path/to/backups/daily"
MAX_AGE_HOURS=48

# 检查最新备份
LATEST_BACKUP=$(find ${BACKUP_DIR} -name "aity_vip_full_*.sql.gz" | sort | tail -1)
BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y "${LATEST_BACKUP}") ))
BACKUP_AGE_HOURS=$(( BACKUP_AGE / 3600 ))

if [ ${BACKUP_AGE_HOURS} -gt ${MAX_AGE_HOURS} ]; then
  echo "警告: 最新备份已超过 ${MAX_AGE_HOURS} 小时"
  echo "最新备份: ${LATEST_BACKUP}"
  echo "备份时间: $(stat -c %y "${LATEST_BACKUP}")"
  
  # 发送告警
  # mail -s "备份告警" admin@example.com
else
  echo "备份状态正常: ${LATEST_BACKUP}"
fi
```

### 磁盘空间监控

```bash
#!/bin/bash
# 文件: scripts/check-disk-space.sh
# 说明: 检查备份目录磁盘空间

BACKUP_DIR="/path/to/backups"
DISK_USAGE=$(df -h ${BACKUP_DIR} | awk 'NR==2 {print $5}' | sed 's/%//')

if [ ${DISK_USAGE} -gt 80 ]; then
  echo "警告: 备份目录磁盘使用率超过80%"
  echo "当前使用率: ${DISK_USAGE}%"
  
  # 清理旧备份
  find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete
fi
```

---

## 📞 应急联系

| 角色 | 姓名 | 联系方式 | 职责 |
|------|------|----------|------|
| 数据库管理员 | - | - | 数据库恢复 |
| 系统管理员 | - | - | 服务器维护 |
| 技术负责人 | - | - | 决策协调 |

---

## 📝 备份日志

### 备份操作记录

| 日期 | 操作类型 | 执行人 | 备份文件 | 结果 | 备注 |
|------|----------|--------|----------|------|------|
| 2026-04-16 | 完整备份 | 自动脚本 | aity_vip_full_20260416.sql.gz | ✅ 成功 | 定时任务 |
| 2026-04-16 | 数据恢复 | Claude | database-complete-restoration.sql | ✅ 成功 | 灾难恢复 |

---

## 📚 相关文档

- [DATA_RECOVERY_MANUAL.md](./DATA_RECOVERY_MANUAL.md) - 数据恢复手册
- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - 数据库设置指南
- [USER_PASSWORD_LIST.md](./USER_PASSWORD_LIST.md) - 用户密码清单

---

**创建时间**: 2026-04-16
**版本**: v1.0
**维护**: AITY VIP Team
**状态**: ✅ 已生效

---

## 🎯 总结

实施完整的备份策略可以：

1. ✅ **防止数据丢失**: 每日自动备份确保数据安全
2. ✅ **快速恢复**: 标准化恢复流程最小化停机时间
3. ✅ **合规要求**: 满足业务数据保留和审计要求
4. ✅ **业务连续性**: 确保灾难情况下快速恢复服务

**立即行动**: 设置自动备份任务！
