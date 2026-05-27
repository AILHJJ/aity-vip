#!/bin/bash

# 后端服务修复脚本
# 用于修复502 Bad Gateway问题

echo "========================================="
echo "  后端服务修复脚本"
echo "========================================="
echo ""

# 1. 检查当前目录
echo "📂 当前目录: $(pwd)"
echo ""

# 2. 检查package.json
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在!"
    echo "请确保在backend目录下执行此脚本"
    exit 1
fi

# 3. 检查并安装依赖
echo ""
echo "📦 检查依赖..."
if [ ! -d "node_modules/axios" ]; then
    echo "❌ axios 未安装,正在安装依赖..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装成功"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ axios 已安装"
fi

# 4. 停止旧的服务
echo ""
echo "🛑 停止旧的PM2服务..."
pm2 stop aity-backend 2>/dev/null
pm2 delete aity-backend 2>/dev/null

# 5. 清理缓存
echo ""
echo "🧹 清理PM2缓存..."
pm2 flush

# 6. 启动服务
echo ""
echo "🚀 启动后端服务..."
pm2 start src/index.js --name "aity-backend"

# 7. 等待服务启动
echo ""
echo "⏳ 等待服务启动(5秒)..."
sleep 5

# 8. 检查服务状态
echo ""
echo "📊 服务状态:"
pm2 status

# 9. 查看日志
echo ""
echo "📋 最新日志:"
pm2 logs aity-backend --lines 20 --nostream

# 10. 测试API
echo ""
echo "🧪 测试API..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8443/api/auth/login)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ API响应正常 (HTTP $HTTP_CODE)"
else
    echo "❌ API响应异常 (HTTP $HTTP_CODE)"
    echo ""
    echo "查看详细错误日志:"
    pm2 logs aity-backend --lines 50 --nostream
fi

echo ""
echo "========================================="
echo "  修复完成!"
echo "========================================="
echo ""
echo "如果还有问题,请查看详细日志:"
echo "  pm2 logs aity-backend --lines 100"
echo ""
