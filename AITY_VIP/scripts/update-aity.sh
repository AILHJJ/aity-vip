#!/bin/bash
# ============================================================
# AITY VIP 服务器端一键更新脚本
# 用途：在腾讯云服务器上执行，更新前后端代码并重启服务
# 使用：bash update-aity.sh
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== 配置区域 ====================
# 请根据实际服务器环境修改以下配置

# Git 分支
BRANCH="develop"

# 代码目录
BACKEND_DIR="/tmp/AITY/backend"
FRONTEND_DIR="/tmp/AITY/aity-uni-app-v2"

# Nginx 静态文件目录（请根据实际 Nginx 配置修改）
NGINX_DIR="/usr/share/nginx/html/aity"

# ==================== 函数定义 ====================

echo_header() {
    echo -e "${GREEN}"
    echo "============================================"
    echo "   $1"
    echo "============================================"
    echo -e "${NC}"
}

echo_step() {
    echo -e "${BLUE}[步骤 $1]${NC} $2"
}

echo_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 检查目录是否存在
check_dir() {
    if [ ! -d "$1" ]; then
        echo_error "目录不存在: $1"
        echo_warning "请先克隆代码或修改脚本中的路径配置"
        return 1
    fi
    return 0
}

# ==================== 主流程 ====================

echo_header "AITY VIP 服务器端一键更新"

echo -e "配置信息:"
echo -e "  分支: ${YELLOW}$BRANCH${NC}"
echo -e "  后端目录: ${YELLOW}$BACKEND_DIR${NC}"
echo -e "  前端目录: ${YELLOW}$FRONTEND_DIR${NC}"
echo -e "  Nginx目录: ${YELLOW}$NGINX_DIR${NC}"
echo ""

# ==================== 1. 更新后端 ====================
echo_step "1/4" "更新后端代码"

if check_dir "$BACKEND_DIR"; then
    cd "$BACKEND_DIR"

    # 获取当前分支和最新commit
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "  当前分支: ${YELLOW}$CURRENT_BRANCH${NC}"

    # 拉取最新代码
    echo "  拉取最新代码..."
    git fetch origin
    git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH origin/$BRANCH
    git pull origin $BRANCH

    # 检查 package.json 是否有变化
    if git diff HEAD@{1} --name-only 2>/dev/null | grep -q "package.json\|package-lock.json"; then
        echo_warning "检测到依赖变化，安装依赖..."
        npm install --production
    fi

    # 重启后端服务
    echo "  重启后端服务..."
    pm2 restart all

    echo_success "后端更新完成"
else
    echo_warning "跳过后端更新（目录不存在）"
fi

echo ""

# ==================== 2. 更新前端代码 ====================
echo_step "2/4" "更新前端代码"

if check_dir "$FRONTEND_DIR"; then
    cd "$FRONTEND_DIR"

    # 获取当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "  当前分支: ${YELLOW}$CURRENT_BRANCH${NC}"

    # 拉取最新代码
    echo "  拉取最新代码..."
    git fetch origin
    git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH origin/$BRANCH
    git pull origin $BRANCH

    # 检查 package.json 是否有变化
    if git diff HEAD@{1} --name-only 2>/dev/null | grep -q "package.json\|package-lock.json"; then
        echo_warning "检测到依赖变化，安装依赖..."
        npm install
    fi

    echo_success "前端代码更新完成"
else
    echo_warning "跳过前端更新（目录不存在）"
fi

echo ""

# ==================== 3. 编译 H5 ====================
echo_step "3/4" "编译 H5 版本"

if check_dir "$FRONTEND_DIR"; then
    cd "$FRONTEND_DIR"
    echo "  开始编译 H5..."
    npm run build:h5

    if [ -d "$FRONTEND_DIR/dist/build/h5" ]; then
        echo_success "H5 编译完成"

        # 显示编译结果大小
        BUILD_SIZE=$(du -sh "$FRONTEND_DIR/dist/build/h5" | cut -f1)
        echo -e "  编译结果大小: ${YELLOW}$BUILD_SIZE${NC}"
    else
        echo_error "H5 编译失败（未找到输出目录）"
        exit 1
    fi
else
    echo_warning "跳过 H5 编译（前端目录不存在）"
fi

echo ""

# ==================== 4. 部署到 Nginx ====================
echo_step "4/4" "部署到 Nginx"

if [ -d "$FRONTEND_DIR/dist/build/h5" ]; then
    # 检查 Nginx 目录是否存在
    if [ ! -d "$NGINX_DIR" ]; then
        echo_warning "Nginx 目录不存在，正在创建: $NGINX_DIR"
        mkdir -p "$NGINX_DIR"
    fi

    # 备份旧版本（可选）
    if [ "$(ls -A $NGINX_DIR 2>/dev/null)" ]; then
        BACKUP_DIR="${NGINX_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        echo "  备份旧版本到: $BACKUP_DIR"
        cp -r "$NGINX_DIR" "$BACKUP_DIR"
    fi

    # 复制新版本
    echo "  复制编译结果到 Nginx 目录..."
    rm -rf "$NGINX_DIR"/*
    cp -r "$FRONTEND_DIR/dist/build/h5"/* "$NGINX_DIR/"

    echo_success "部署到 Nginx 完成"
else
    echo_warning "跳过 Nginx 部署（H5 编译结果不存在）"
fi

echo ""

# ==================== 完成总结 ====================
echo_header "更新完成！"

echo -e "服务状态:"
echo ""

# 显示 PM2 状态
echo -e "${YELLOW}后端服务 (PM2):${NC}"
pm2 list

echo ""

# 显示访问地址
echo -e "${YELLOW}访问地址:${NC}"
echo -e "  后端 API: ${GREEN}http://服务器IP:3001${NC}"
echo -e "  H5 前端: ${GREEN}http://服务器IP (Nginx)${NC}"

echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  1. 如果 Nginx 目录不正确，请修改脚本中的 NGINX_DIR 变量"
echo -e "  2. 如果前端无法访问，请检查 Nginx 配置"
echo -e "  3. 查看后端日志: ${BLUE}pm2 logs${NC}"
echo -e "  4. 查看 Nginx 日志: ${BLUE}tail -f /var/log/nginx/error.log${NC}"
