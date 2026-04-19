#!/bin/bash

# 腾讯云服务器 - 查找AITY项目目录
# 使用方法：bash find-project-dir.sh

echo "=========================================="
echo "  查找AITY项目目录"
echo "=========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "\n${YELLOW}[1] 检查PM2进程及其工作目录...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}PM2已安装，查看进程信息：${NC}"
    pm2 status

    echo -e "\n${YELLOW}获取PM2进程详细信息：${NC}"
    pm2 show aity-backend 2>/dev/null | grep "script path" || echo "未找到 aity-backend 进程"
else
    echo -e "${RED}PM2未安装${NC}"
fi

echo -e "\n${YELLOW}[2] 查找常见的项目部署目录...${NC}"
COMMON_DIRS=(
    "/root/aity-vip/backend"
    "/home/aity-vip/backend"
    "/var/www/aity-vip/backend"
    "/opt/aity-vip/backend"
)

for dir in "${COMMON_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ 找到目录: $dir${NC}"
        if [ -d "$dir/.git" ]; then
            echo -e "  ${GREEN}├─ Git仓库${NC}"
            cd "$dir" 2>/dev/null && git remote -v 2>/dev/null | head -1 || true
        fi
        if [ -f "$dir/package.json" ]; then
            echo -e "  ${GREEN}└─ 包含package.json${NC}"
        fi
    fi
done

echo -e "\n${YELLOW}[3] 搜索包含Git仓库的目录...${NC}"
SEARCH_BASES=("/root" "/home" "/opt" "/var/www")

for base in "${SEARCH_BASES[@]}"; do
    if [ -d "$base" ]; then
        find "$base" -maxdepth 3 -name ".git" -type d 2>/dev/null | while read gitdir; do
            projectdir=$(dirname "$gitdir")
            if [ -f "$projectdir/package.json" ] || [ -d "$projectdir/backend" ] || [ -f "$projectdir/src/index.js" ]; then
                echo -e "${GREEN}✓ 找到可能的项目目录: $projectdir${NC}"
                cd "$projectdir" 2>/dev/null && git remote -v 2>/dev/null | grep "aity-vip" && echo "  ${GREEN}└─ 包含aity-vip仓库${NC}" || true
            fi
        done
    fi
done

echo -e "\n${YELLOW}[4] 检查端口占用...${NC}"
if command -v netstat &> /dev/null; then
    netstat -tlnp 2>/dev/null | grep ":3001" || echo "端口3001未被占用"
elif command -v ss &> /dev/null; then
    ss -tlnp 2>/dev/null | grep ":3001" || echo "端口3001未被占用"
fi

echo -e "\n${GREEN}=========================================="
echo "  查找完成"
echo "==========================================${NC}"

echo -e "\n${YELLOW}建议操作：${NC}"
echo "1. 进入找到的项目目录: cd /root/aity-vip/backend"
echo "2. 拉取最新代码: git pull origin feature/iteration-1"
echo "3. 启动服务: pm2 start ecosystem.config.js --env production"
