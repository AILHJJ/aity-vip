#!/bin/bash

# AITY VIP 统一开发启动脚本
# 一键启动前后端服务

echo "===================================="
echo "AITY VIP 开发环境启动脚本"
echo "===================================="

# 检查 Node.js 版本
echo "检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js v16.0.0+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "Node.js 版本: $NODE_VERSION"

# 创建输出目录
mkdir -p logs

# 启动后端服务
echo "\n启动后端服务..."
if [ -d "backend" ]; then
    cd backend || exit 1
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "后端依赖未安装，正在安装..."
        npm install
    fi
    
    # 启动后端（后台运行）
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "后端服务已启动，PID: $BACKEND_PID"
    echo "后端日志: ../logs/backend.log"
    echo "后端访问: http://localhost:3000"
    
    cd .. || exit 1
else
    echo "错误: 未找到 backend 目录"
    exit 1
fi

# 等待 3 秒确保后端启动
sleep 3

# 启动前端服务
echo "\n启动前端服务..."
if [ -d "frontend" ]; then
    cd frontend || exit 1
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "前端依赖未安装，正在安装..."
        npm install
    fi
    
    # 启动前端（后台运行）
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "前端服务已启动，PID: $FRONTEND_PID"
    echo "前端日志: ../logs/frontend.log"
    echo "前端访问: http://localhost:3002"
    
    cd .. || exit 1
else
    echo "错误: 未找到 frontend 目录"
    exit 1
fi

echo "\n===================================="
echo "开发环境启动完成！"
echo "===================================="
echo "后端服务: http://localhost:3000"
echo "前端服务: http://localhost:3002"
echo "\n查看日志:"
echo "  tail -f logs/backend.log  # 后端日志"
echo "  tail -f logs/frontend.log # 前端日志"
echo "\n停止服务:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "===================================="

# 输出启动状态
echo "\n服务启动状态检查..."
sleep 2

# 检查后端服务
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败，请查看 logs/backend.log"
fi

# 检查前端服务
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败，请查看 logs/frontend.log"
fi

echo "\n开发环境已就绪，开始编码吧！"
