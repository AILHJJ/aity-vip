#!/bin/bash
# 腾讯云服务器部署脚本
# 使用方法：在服务器上运行此脚本

echo "=========================================="
echo "  AITY VIP 后端部署脚本"
echo "=========================================="

# 1. 进入项目目录
cd /root/aity-vip/backend

# 2. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin feature/iteration-1

# 3. 安装依赖（如果需要）
echo "📦 检查依赖..."
npm install

# 4. 重启服务
echo "🔄 重启后端服务..."
pm2 restart aity-backend

# 5. 查看日志
echo "📋 查看最新日志..."
pm2 logs aity-backend --lines 50

echo "✅ 部署完成！"
echo "=========================================="
