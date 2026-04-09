#!/bin/bash

# 腾讯云后端服务重启脚本
# 使用方法：bash restart-backend.sh

echo "=========================================="
echo "  AITY 后端服务重启脚本"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 进入后端目录
echo -e "\n${YELLOW}[1/5] 进入后端目录...${NC}"
cd /root/private-sharing-app/backend || {
    echo -e "${RED}错误: 无法进入后端目录${NC}"
    echo "请修改脚本中的路径为实际的后端路径"
    exit 1
}

# 2. 拉取最新代码（可选）
echo -e "\n${YELLOW}[2/5] 检查代码更新...${NC}"
read -p "是否拉取最新代码？(y/n): " pull_code
if [ "$pull_code" = "y" ]; then
    git pull origin feature/iteration-1
    echo -e "${GREEN}✓ 代码更新完成${NC}"
fi

# 3. 安装依赖（如果需要）
echo -e "\n${YELLOW}[3/5] 检查依赖...${NC}"
read -p "是否重新安装依赖？(y/n): " install_deps
if [ "$install_deps" = "y" ]; then
    npm install --production
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
fi

# 4. 停止旧服务
echo -e "\n${YELLOW}[4/5] 停止旧服务...${NC}"
pm2 delete private-sharing-app-backend 2>/dev/null || echo "服务未运行"

# 5. 启动新服务
echo -e "\n${YELLOW}[5/5] 启动新服务...${NC}"
pm2 start src/index.js --name private-sharing-app-backend --env production

# 6. 保存PM2配置
pm2 save

# 7. 查看服务状态
echo -e "\n${GREEN}=========================================="
echo "  服务状态"
echo "==========================================${NC}"
pm2 status

# 8. 查看日志
echo -e "\n${YELLOW}查看最新日志:${NC}"
sleep 2
pm2 logs private-sharing-app-backend --lines 20 --nostream

echo -e "\n${GREEN}=========================================="
echo "  重启完成！"
echo "==========================================${NC}"
echo -e "\n常用命令:"
echo "  查看日志: pm2 logs private-sharing-app-backend"
echo "  查看状态: pm2 status"
echo "  重启服务: pm2 restart private-sharing-app-backend"
echo "  停止服务: pm2 stop private-sharing-app-backend"
echo ""
