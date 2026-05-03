#!/bin/bash

# 投研图灵室 - 服务检查脚本
# 用于自动化测试前的服务状态检查和自动启动

echo "========================================="
echo "🔍 投研图灵室 - 服务状态检查"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务配置
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5174"
BACKEND_DIR="/d/your-mcp-proxy/AITY_VIP/backend"
FRONTEND_DIR="/d/your-mcp-proxy/AITY_VIP/aity-uni-app-v2"

# 检查后端服务
check_backend() {
    echo "📝 检查后端服务..."
    if curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端服务运行中${NC} ($BACKEND_URL)"
        return 0
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
        return 1
    fi
}

# 检查前端服务
check_frontend() {
    echo "📝 检查前端服务..."
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 前端服务运行中${NC} ($FRONTEND_URL)"
        return 0
    else
        echo -e "${YELLOW}⚠️  前端服务未运行${NC}"
        return 1
    fi
}

# 启动后端服务
start_backend() {
    echo -e "${YELLOW}🚀 正在启动后端服务...${NC}"
    cd "$BACKEND_DIR" && npm run dev > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "后端进程 PID: $BACKEND_PID"
}

# 启动前端服务
start_frontend() {
    echo -e "${YELLOW}🚀 正在启动前端服务...${NC}"
    cd "$FRONTEND_DIR" && npm run dev:h5 > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "前端进程 PID: $FRONTEND_PID"
}

# 等待服务就绪
wait_for_services() {
    echo ""
    echo "⏳ 等待服务启动 (15秒)..."
    for i in {1..15}; do
        echo -n "."
        sleep 1
    done
    echo ""
}

# 主流程
main() {
    BACKEND_NEEDED=0
    FRONTEND_NEEDED=0

    # 检查后端
    if ! check_backend; then
        BACKEND_NEEDED=1
    fi

    # 检查前端
    if ! check_frontend; then
        FRONTEND_NEEDED=1
    fi

    # 如果有服务需要启动
    if [ $BACKEND_NEEDED -eq 1 ] || [ $FRONTEND_NEEDED -eq 1 ]; then
        echo ""
        echo "========================================="
        echo "🚀 启动未运行的服务"
        echo "========================================="

        if [ $BACKEND_NEEDED -eq 1 ]; then
            start_backend
        fi

        if [ $FRONTEND_NEEDED -eq 1 ]; then
            start_frontend
        fi

        # 等待服务启动
        wait_for_services

        # 再次验证
        echo ""
        echo "========================================="
        echo "🔍 验证服务状态"
        echo "========================================="

        ALL_READY=1

        if [ $BACKEND_NEEDED -eq 1 ]; then
            if check_backend; then
                echo -e "${GREEN}✅ 后端服务启动成功${NC}"
            else
                echo -e "${RED}❌ 后端服务启动失败${NC}"
                ALL_READY=0
            fi
        fi

        if [ $FRONTEND_NEEDED -eq 1 ]; then
            if check_frontend; then
                echo -e "${GREEN}✅ 前端服务启动成功${NC}"
            else
                echo -e "${RED}❌ 前端服务启动失败${NC}"
                ALL_READY=0
            fi
        fi

        if [ $ALL_READY -eq 0 ]; then
            echo ""
            echo -e "${RED}❌ 部分服务启动失败,请检查日志${NC}"
            echo "后端日志: /tmp/backend.log"
            echo "前端日志: /tmp/frontend.log"
            exit 1
        fi
    fi

    echo ""
    echo "========================================="
    echo -e "${GREEN}🎉 所有服务就绪,可以开始测试${NC}"
    echo "========================================="
    echo ""
    echo "服务地址:"
    echo "  前端: $FRONTEND_URL"
    echo "  后端: $BACKEND_URL"
    echo ""
}

# 执行主流程
main
