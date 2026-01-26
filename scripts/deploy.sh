#!/bin/bash
###
 # @Author: fuli fuli@example.com
 # @Date: 2026-01-26 14:14:28
 # @LastEditors: fuli fuli@example.com
 # @LastEditTime: 2026-01-26 14:14:31
 # @FilePath: \your-mcp-proxy\AITY_VIP\scripts\deploy.sh
 # @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
### 
# 部署脚本 - 用于将代码部署到腾讯云服务器

# 配置信息
SERVER_IP="your-server-ip"        # 腾讯云服务器IP
SERVER_USER="ubuntu"               # 服务器用户名
FRONTEND_DIR="/var/www/aity-vip/frontend"  # 前端部署目录
BACKEND_DIR="/var/www/aity-vip/backend"    # 后端部署目录

# 颜色输出函数
function echo_green() {
    echo -e "\033[32m$1\033[0m"
}

function echo_yellow() {
    echo -e "\033[33m$1\033[0m"
}

function echo_red() {
    echo -e "\033[31m$1\033[0m"
}

# 开始部署
echo_yellow "开始部署AITY VIP项目..."

# 1. 构建前端
echo_yellow "\n1. 构建前端项目..."
cd "$(dirname "$0")/../frontend"
if npm run build; then
    echo_green "前端构建成功!"
else
    echo_red "前端构建失败!"
    exit 1
fi

# 2. 部署前端
echo_yellow "\n2. 部署前端到服务器..."
if scp -r dist/* "$SERVER_USER@$SERVER_IP:$FRONTEND_DIR"; then
    echo_green "前端部署成功!"
else
    echo_red "前端部署失败!"
    exit 1
fi

# 3. 部署后端
echo_yellow "\n3. 部署后端到服务器..."
if scp -r "$(dirname "$0")/../backend"/* "$SERVER_USER@$SERVER_IP:$BACKEND_DIR"; then
    echo_green "后端代码复制成功!"
else
    echo_red "后端代码复制失败!"
    exit 1
fi

# 4. 安装后端依赖并重启服务
echo_yellow "\n4. 安装后端依赖并重启服务..."
if ssh "$SERVER_USER@$SERVER_IP" "cd $BACKEND_DIR && npm install && pm2 restart ecosystem.config.js"; then
    echo_green "后端服务重启成功!"
else
    echo_red "后端服务重启失败!"
    exit 1
fi

# 5. 验证部署
echo_yellow "\n5. 验证部署状态..."
if ssh "$SERVER_USER@$SERVER_IP" "pm2 status"; then
    echo_green "部署验证成功!"
else
    echo_red "部署验证失败!"
    exit 1
fi

echo_green "\n🎉 AITY VIP项目部署完成!"
echo_green "前端访问地址: http://$SERVER_IP"
echo_green "后端API地址: http://$SERVER_IP:3001/api"