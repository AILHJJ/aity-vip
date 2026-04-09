#!/bin/bash

# 腾讯云服务器 - 查找AITY项目目录
# 使用方法：bash find-project-dir.sh

echo "=========================================="
echo "  查找AITY项目目录"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}[1] 检查PM2进程及其工作目录...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}PM2已安装，查看进程信息：${NC}"
    pm2 status

    echo -e "\n${YELLOW}获取PM2进程详细信息：${NC}"
    pm2 list 2>/dev/null | grep -E "private-sharing|aity|backend" || echo "未找到相关进程"

    # 尝试获取进程的工作目录
    echo -e "\n${YELLOW}尝试获取PM2进程的工作目录：${NC}"
    pm2 show private-sharing-app-backend 2>/dev/null | grep "script path" || echo "未找到进程配置"
    pm2 show aity-backend 2>/dev/null | grep "script path" || echo ""
    pm2 show aity-vip-backend 2>/dev/null | grep "script path" || echo ""

    # 查看PM2日志目录
    echo -e "\n${YELLOW}PM2日志目录：${NC}"
    pm2 show private-sharing-app-backend 2>/dev/null | grep -E "error|out" || echo ""
else
    echo -e "${RED}PM2未安装${NC}"
fi

echo -e "\n${YELLOW}[2] 查找常见的项目部署目录...${NC}"

# 常见的项目目录列表
COMMON_DIRS=(
    "/root/private-sharing-app/backend"
    "/root/aity-vip/backend"
    "/root/aity/backend"
    "/home/private-sharing-app/backend"
    "/home/aity-vip/backend"
    "/var/www/aity-vip/backend"
    "/opt/aity-vip/backend"
)

for dir in "${COMMON_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ 找到目录: $dir${NC}"
        # 检查是否是Git仓库
        if [ -d "$dir/.git" ]; then
            echo -e "  ${GREEN}├─ Git仓库${NC}"
            cd "$dir" 2>/dev/null && git remote -v 2>/dev/null | head -1 || echo "  └─ 无法获取Git信息"
        fi
        # 检查是否有package.json
        if [ -f "$dir/package.json" ]; then
            echo -e "  ${GREEN}└─ 包含package.json${NC}"
        fi
    fi
done

echo -e "\n${YELLOW}[3] 搜索包含Git仓库的目录...${NC}"

# 在常见位置搜索Git仓库
SEARCH_BASES=(
    "/root"
    "/home"
    "/opt"
    "/var/www"
)

for base in "${SEARCH_BASES[@]}"; do
    if [ -d "$base" ]; then
        echo -e "${YELLOW}搜索 $base 下的Git仓库...${NC}"
        find "$base" -maxdepth 3 -name ".git" -type d 2>/dev/null | while read gitdir; do
            projectdir=$(dirname "$gitdir")
            # 检查是否包含backend或aity相关文件
            if [ -f "$projectdir/package.json" ] || [ -d "$projectdir/backend" ] || [ -f "$projectdir/src/index.js" ]; then
                echo -e "${GREEN}✓ 找到可能的项目目录: $projectdir${NC}"
                # 检查Git远程仓库
                cd "$projectdir" 2>/dev/null && git remote -v 2>/dev/null | grep "aity-vip" && echo "  ${GREEN}└─ 包含aity-vip仓库${NC}" || true
            fi
        done
    fi
done

echo -e "\n${YELLOW}[4] 查找运行中的Node.js进程...${NC}"
if command -v ps &> /dev/null; then
    echo -e "${YELLOW}Node.js进程：${NC}"
    ps aux | grep "node.*index.js" | grep -v grep || echo "未找到相关进程"

    echo -e "\n${YELLOW}运行中的Node.js应用：${NC}"
    ps aux | grep node | grep -v grep | awk '{print "PID:", $2, "CMD:", $11, $12, $13}'
fi

echo -e "\n${YELLOW}[5] 检查端口占用...${NC}"
if command -v netstat &> /dev/null; then
    echo -e "${YELLOW}端口3001占用情况：${NC}"
    netstat -tlnp 2>/dev/null | grep ":3001" || echo "端口3001未被占用"
elif command -v ss &> /dev/null; then
    echo -e "${YELLOW}端口3001占用情况：${NC}"
    ss -tlnp 2>/dev/null | grep ":3001" || echo "端口3001未被占用"
fi

echo -e "\n${YELLOW}[6] 查找最近访问的Git仓库目录...${NC}"
if [ -f ~/.bash_history ] || [ -f ~/.zsh_history ]; then
    echo -e "${YELLOW}最近cd过的目录：${NC}"
    # 查找最近cd过的包含backend或aity的目录
    grep -E "cd.*backend|cd.*aity" ~/.bash_history 2>/dev/null | tail -5 || echo "未找到历史记录"
fi

echo -e "\n${YELLOW}[7] 检查systemd服务...${NC}"
if command -v systemctl &> /dev/null; then
    echo -e "${YELLOW}包含aity或backend的服务：${NC}"
    systemctl list-units --type=service --all | grep -iE "aity|backend" || echo "未找到相关服务"
fi

echo -e "\n${GREEN}=========================================="
echo "  查找完成"
echo "==========================================${NC}"

echo -e "\n${YELLOW}建议操作：${NC}"
echo "1. 根据上面的结果，进入找到的项目目录"
echo "2. 运行: git status 确认是正确的项目"
echo "3. 运行: git pull origin feature/iteration-1 拉取最新代码"
echo "4. 运行: pm2 status 查看服务状态"
