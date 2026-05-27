#!/bin/bash
# H5部署到腾讯云脚本 (Linux服务器端)
# 在服务器上执行此脚本

echo "========================================"
echo "H5部署脚本 - 腾讯云服务器"
echo "========================================"
echo.

# 配置
DEPLOY_PATH="/var/www/html/h5"
SOURCE_PATH="/tmp/AITY/aity-uni-app-v2/dist/build/h5"
BACKUP_PATH="/var/www/html/h5-backup-$(date +%Y%m%d-%H%M%S)"

echo "步骤1: 检查前端编译产物..."
if [ ! -d "$SOURCE_PATH" ]; then
    echo "[错误] 未找到编译产物: $SOURCE_PATH"
    echo "请先在本地编译H5，然后上传到服务器"
    echo "或在服务器上执行: cd /tmp/AITY/aity-uni-app-v2 && npm run build:h5"
    exit 1
fi
echo "[成功] 找到编译产物"
echo.

echo "步骤2: 备份当前版本..."
if [ -d "$DEPLOY_PATH" ]; then
    mkdir -p /var/www/html
    cp -r $DEPLOY_PATH $BACKUP_PATH
    echo "[成功] 已备份到: $BACKUP_PATH"
else
    echo "[提示] 首次部署，无需备份"
    mkdir -p $DEPLOY_PATH
fi
echo.

echo "步骤3: 部署新版本..."
# 删除旧文件
rm -rf $DEPLOY_PATH/*
# 复制新文件
cp -r $SOURCE_PATH/* $DEPLOY_PATH/
echo "[成功] 文件已复制"
echo.

echo "步骤4: 设置权限..."
chown -R www-data:www-data $DEPLOY_PATH
chmod -R 755 $DEPLOY_PATH
echo "[成功] 权限已设置"
echo.

echo "步骤5: 验证部署..."
if [ -f "$DEPLOY_PATH/index.html" ]; then
    echo "[成功] index.html 存在"
else
    echo "[错误] index.html 不存在"
    exit 1
fi

if [ -d "$DEPLOY_PATH/assets" ]; then
    echo "[成功] assets 目录存在"
else
    echo "[警告] assets 目录不存在"
fi
echo.

echo "========================================"
echo "部署成功！"
echo "访问地址: http://111.48.74.245/h5/"
echo "========================================"
echo.

# 可选: 重启Nginx
read -p "是否重启Nginx? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    systemctl restart nginx
    echo "[成功] Nginx已重启"
fi
