#!/bin/bash
# 快速更新并重启服务
# 用于日常更新代码和重启服务

set -e

echo "=========================================="
echo "  更新AITY项目并重启服务"
echo "=========================================="

PROJECT_DIR="/root/aity-vip"
cd "$PROJECT_DIR"

# 1. 拉取最新代码
echo "📥 [1/4] 拉取最新代码..."
git pull origin feature/iteration-1

# 2. 安装依赖
echo "📦 [2/4] 安装依赖..."
cd backend
npm install

# 3. 重启服务
echo "🔄 [3/4] 重启服务..."
if pm2 list | grep -q "aity-backend"; then
    pm2 restart aity-backend
else
    pm2 start src/index.js --name aity-backend --env production
fi
pm2 save

# 4. 查看状态
echo "📊 [4/4] 服务状态："
pm2 status

echo ""
echo "=========================================="
echo "  ✅ 更新完成！"
echo "=========================================="
echo "查看日志: pm2 logs aity-backend --lines 50"
echo "=========================================="
