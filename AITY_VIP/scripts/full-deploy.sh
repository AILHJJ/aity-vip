#!/bin/bash
# 完整部署脚本：包括代码、SSL证书（如果有）、后端服务
# 用于首次部署或完整更新

set -e

echo "=========================================="
echo "  AITY完整部署脚本"
echo "=========================================="

PROJECT_DIR="/root/aity-vip"
cd "$PROJECT_DIR" 2>/dev/null || {
    echo "❌ 项目目录不存在: $PROJECT_DIR"
    echo "请先执行: git clone https://github.com/AILHJJ/aity-vip.git $PROJECT_DIR"
    exit 1
}

# 1. 拉取最新代码
echo "📥 [1/5] 拉取最新代码..."
git pull origin feature/iteration-1

# 2. 安装后端依赖
echo "📦 [2/5] 安装后端依赖..."
cd backend
npm install

# 3. 检查SSL证书（如果有手动证书）
echo "🔐 [3/5] 检查SSL证书..."
if [ -f "$PROJECT_DIR/ssl-certs/deploy-ssl.sh" ]; then
    echo "发现SSL证书，开始部署..."
    bash "$PROJECT_DIR/ssl-certs/deploy-ssl.sh"
else
    echo "未发现手动SSL证书，跳过..."
    echo "如需使用Let's Encrypt，请运行: bash scripts/deploy-with-ssl.sh"
fi

# 4. 启动后端服务
echo "🚀 [4/5] 启动后端服务..."
if pm2 list | grep -q "aity-backend"; then
    pm2 restart aity-backend
else
    pm2 start src/index.js --name aity-backend --env production
fi
pm2 save

# 5. 查看状态和测试
echo "📊 [5/5] 服务状态："
pm2 status

echo ""
echo "🧪 测试访问..."
echo "HTTP: http://localhost:3001/api/health"
curl -s http://localhost:3001/api/health && echo "✅ HTTP正常" || echo "❌ HTTP失败"

echo "HTTPS: https://aity88.online/api/health"
curl -s https://aity88.online/api/health && echo "✅ HTTPS正常" || echo "❌ HTTPS失败"

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo "后端地址: http://localhost:3001"
echo "网站地址: https://aity88.online"
echo "API文档: https://aity88.online/api-docs"
echo "=========================================="
