#!/bin/bash
# 构建脚本 - 用于构建前后端项目

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

# 开始构建
echo_yellow "开始构建AITY VIP项目..."

# 1. 构建前端
echo_yellow "\n1. 构建前端项目..."
cd "$(dirname "$0")/../aity-uni-app-v2"
if npm install; then
    echo_green "前端依赖安装成功!"
else
    echo_red "前端依赖安装失败!"
    exit 1
fi

if npm run build; then
    echo_green "前端构建成功!"
else
    echo_red "前端构建失败!"
    exit 1
fi

# 2. 构建后端
echo_yellow "\n2. 构建后端项目..."
cd "$(dirname "$0")/../backend"
if npm install; then
    echo_green "后端依赖安装成功!"
else
    echo_red "后端依赖安装失败!"
    exit 1
fi

echo_green "\n🎉 AITY VIP项目构建完成!"
echo_green "前端构建输出: $(dirname "$0")/../aity-uni-app-v2/dist"
echo_green "后端构建输出: $(dirname "$0")/../backend"