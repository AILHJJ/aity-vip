-- 使邮箱字段变为可选的数据库迁移脚本
-- 执行前请备份数据库

-- 检查当前数据库类型（MySQL/MariaDB）
-- MySQL 5.7+ 版本

-- 1. 移除email字段的NOT NULL约束
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NULL;

-- 2. 为已有的NULL值设置默认邮箱（可选，如果需要保持数据完整性）
UPDATE users SET email = CONCAT(name, '@localhost') WHERE email IS NULL OR email = '';

-- 3. 添加注释说明
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NULL COMMENT '邮箱地址，可选字段，为空时自动生成username@localhost';

-- 验证修改
DESCRIBE users;
SELECT id, name, email FROM users LIMIT 10;
