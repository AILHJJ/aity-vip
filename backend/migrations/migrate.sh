#!/bin/bash
# ============================================
# 生产环境数据库迁移执行脚本
# 使用方法:
#   1. 上传此脚本和 SQL 文件到服务器
#   2. chmod +x migrate.sh
#   3. ./migrate.sh
# ============================================

# 数据库配置 - 请根据实际情况修改
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="aity_vip"  # 请修改为实际数据库名
DB_USER="root"      # 请修改为实际用户名

echo "============================================"
echo "AITY VIP 数据库迁移脚本"
echo "============================================"
echo ""
echo "即将执行迁移: 添加 bio 字段到 users 表"
echo ""

# 检查字段是否已存在
echo "检查字段是否已存在..."
EXISTS=$(mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p -e "
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = '$DB_NAME'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'bio';
" -sN 2>/dev/null)

if [ "$EXISTS" -gt 0 ]; then
    echo "bio 字段已存在，无需迁移。"
    exit 0
fi

echo "bio 字段不存在，开始迁移..."
echo ""

# 执行迁移
echo "请输入数据库密码:"
mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p $DB_NAME < "$(dirname "$0")/20260227-add-bio-column.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "迁移成功！"
    echo "============================================"

    # 验证
    echo ""
    echo "验证结果:"
    mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p -e "
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '$DB_NAME'
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'bio';
    " $DB_NAME 2>/dev/null
else
    echo ""
    echo "============================================"
    echo "迁移失败，请检查错误信息"
    echo "============================================"
fi
