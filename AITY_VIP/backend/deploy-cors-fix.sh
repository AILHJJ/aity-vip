#!/bin/bash
# 部署CORS修复到服务器
# 使用方法: ssh root@124.221.119.134 < deploy-cors-fix.sh

echo "===== 开始部署后端CORS修复 ====="

# 进入项目目录
cd /root/AITY_VIP/backend || exit 1

# 拉取最新代码
echo "拉取最新代码..."
git pull origin feature/iteration-1

# 重启后端服务
echo "重启后端服务..."
pm2 restart aity-backend

echo "===== 部署完成 ====="
echo "检查服务状态:"
pm2 status
