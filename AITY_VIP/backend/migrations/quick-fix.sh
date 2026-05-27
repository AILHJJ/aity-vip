#!/bin/bash
# ============================================
# 快速修复脚本 - 直接在服务器执行
# 复制此文件内容到服务器执行即可
# ============================================

echo "正在添加 bio 字段到 users 表..."

# 直接执行 SQL（需要输入密码）
mysql -u root -p << 'EOF'
-- 请先切换到正确的数据库，替换 aity_vip 为你的数据库名
USE aity_vip;

-- 添加 bio 字段
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL COMMENT '用户简介';

-- 验证
SELECT 'bio 字段添加成功！' AS result;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'bio';
EOF

echo ""
echo "完成！"
