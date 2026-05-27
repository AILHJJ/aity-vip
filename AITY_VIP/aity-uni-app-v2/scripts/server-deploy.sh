#!/bin/bash
# AITY统一部署脚本（服务器端）
# 功能: 更新后端 + 部署前端
# 使用: 在服务器上保存为 /tmp/AITY/deploy.sh 并添加执行权限

set -e

echo "========================================="
echo "AITY 统一部署脚本"
echo "========================================="
echo ""

# 1. 更新后端
echo "步骤1: 更新后端..."
cd /tmp/AITY/backend
git reset --hard
git pull origin feature/iteration-1
echo "✅ 后端更新完成"
echo ""

# 2. 重启后端服务
echo "步骤2: 重启后端服务..."
pm2 restart aity-backend -f
echo "✅ 后端服务已重启"
echo ""

# 3. 部署前端（检查是否有编译产物）
echo "步骤3: 部署前端..."
if [ -f /tmp/h5-upload.zip ]; then
    echo "发现前端编译产物，开始部署..."

    # 备份旧版本
    if [ -d /var/www/html/h5 ]; then
        BACKUP_DIR="/var/www/html/h5-backup-$(date +%Y%m%d-%H%M%S)"
        cp -r /var/www/html/h5 "$BACKUP_DIR"
        echo "已备份到: $BACKUP_DIR"
    fi

    # 部署新版本
    mkdir -p /var/www/html/h5
    unzip -o /tmp/h5-upload.zip -d /var/www/html/h5/
    chown -R www-data:www-data /var/www/html/h5
    chmod -R 755 /var/www/html/h5

    # 清理临时文件
    rm -f /tmp/h5-upload.zip

    echo "✅ 前端部署完成"
    echo ""

    # 验证部署
    if [ -f /var/www/html/h5/index.html ]; then
        echo "✅ 验证成功: index.html 存在"
    else
        echo "⚠️  警告: index.html 不存在"
    fi
else
    echo "⚠️  未发现前端编译产物，跳过前端部署"
fi

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "后端状态:"
pm2 status aity-backend
echo ""
echo "前端状态:"
if [ -f /var/www/html/h5/index.html ]; then
    echo "✅ 前端已部署"
    echo "访问地址: http://111.48.74.245/h5/"
else
    echo "⚠️  前端未部署"
fi
echo ""
echo "========================================="
