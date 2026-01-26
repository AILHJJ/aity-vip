#!/bin/bash
# 启动脚本 - 用于启动开发环境的前后端服务

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

# 开始启动
echo_yellow "开始启动AITY VIP开发环境..."

# 1. 启动后端服务
echo_yellow "\n1. 启动后端服务..."
cd "$(dirname "$0")/../backend"
if npm install; then
    echo_green "后端依赖安装成功!"
else
    echo_red "后端依赖安装失败!"
    exit 1
fi

# 在新终端启动后端服务
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="AITY VIP Backend" -- bash -c "npm run dev; exec bash"
    echo_green "后端服务已在新终端启动!"
elif command -v xterm &> /dev/null; then
    xterm -title "AITY VIP Backend" -e "npm run dev"
    echo_green "后端服务已在新终端启动!"
elif command -v cmd.exe &> /dev/null; then
    cmd.exe /c "start cmd /k cd \"$(pwd)\" && npm run dev"
    echo_green "后端服务已在新终端启动!"
else
    echo_yellow "未找到终端模拟器，直接启动后端服务..."
    npm run dev &
    echo_green "后端服务已后台启动!"
fi

# 2. 启动前端服务
echo_yellow "\n2. 启动前端服务..."
cd "$(dirname "$0")/../frontend"
if npm install; then
    echo_green "前端依赖安装成功!"
else
    echo_red "前端依赖安装失败!"
    exit 1
fi

# 在新终端启动前端服务
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="AITY VIP Frontend" -- bash -c "npm run dev; exec bash"
    echo_green "前端服务已在新终端启动!"
elif command -v xterm &> /dev/null; then
    xterm -title "AITY VIP Frontend" -e "npm run dev"
    echo_green "前端服务已在新终端启动!"
elif command -v cmd.exe &> /dev/null; then
    cmd.exe /c "start cmd /k cd \"$(pwd)\" && npm run dev"
    echo_green "前端服务已在新终端启动!"
else
    echo_yellow "未找到终端模拟器，直接启动前端服务..."
    npm run dev &
    echo_green "前端服务已后台启动!"
fi

echo_green "\n🎉 AITY VIP开发环境启动完成!"
echo_green "前端开发服务器地址: http://localhost:5173"
echo_green "后端开发服务器地址: http://localhost:3001"