#!/bin/bash
# AITY服务器端编译并部署脚本（方案3）
# 功能: 拉取最新代码 -> 服务器端编译 -> 部署
# 前提: 服务器已安装Node.js和npm依赖
# 使用: 在服务器上保存为 /tmp/AITY/build-and-deploy.sh 并添加执行权限

set -e

echo "========================================="
echo "AITY 服务器端编译并部署脚本"
echo "========================================="
echo ""

# 检查Node.js环境
echo "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js"
    echo "请先安装: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✅ Node.js版本: $NODE_VERSION"
echo "✅ NPM版本: $NPM_VERSION"
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

# 3. 更新前端代码
echo "步骤3: 更新前端代码..."
cd /tmp/AITY/aity-uni-app-v2
git pull origin feature/iteration-1
echo "✅ 前端代码更新完成"
echo ""

# 4. 检查是否需要安装依赖
echo "步骤4: 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "首次编译，正在安装依赖..."
    npm install
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已存在，跳过安装"
fi
echo ""

# 5. 编译H5
echo "步骤5: 编译H5前端（服务器端编译）..."
echo "⏳ 编译中，请稍候..."
if npm run build:h5; then
    echo "✅ H5编译成功"
else
    echo "❌ H5编译失败！"
    echo "请查看错误信息并修复"
    exit 1
fi
echo ""

# 6. 验证编译产物
echo "步骤6: 验证编译产物..."
if [ ! -f "dist/build/h5/index.html" ]; then
    echo "❌ 错误: 编译产物不存在"
    exit 1
fi
echo "✅ 编译产物验证通过"
echo ""

# 7. 备份旧版本
echo "步骤7: 备份旧版本..."
if [ -d /var/www/html/h5 ]; then
    BACKUP_DIR="/var/www/html/h5-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r /var/www/html/h5 "$BACKUP_DIR"
    echo "已备份到: $BACKUP_DIR"
else
    echo "无需备份（首次部署）"
fi
echo ""

# 8. 部署新版本
echo "步骤8: 部署新版本..."
mkdir -p /var/www/html/h5
cp -r dist/build/h5/* /var/www/html/h5/
chown -R www-data:www-data /var/www/html/h5
chmod -R 755 /var/www/html/h5
echo "✅ 前端部署完成"
echo ""

# 9. 验证部署
echo "步骤9: 验证部署..."
if [ -f /var/www/html/h5/index.html ]; then
    echo "✅ 验证成功: index.html 存在"
    echo "✅ 部署成功！"
else
    echo "❌ 验证失败: index.html 不存在"
    exit 1
fi
echo ""

# 10. 显示部署状态
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "后端状态:"
pm2 status aity-backend
echo ""
echo "前端状态:"
echo "✅ 前端已部署（服务器端编译）"
echo "访问地址: http://111.48.74.245/h5/"
echo ""
echo "编译信息:"
echo "  - 编译时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  - 编译方式: 服务器端编译"
echo "  - Node版本: $NODE_VERSION"
echo ""
echo "========================================="
