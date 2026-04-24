#!/bin/bash
# ============================================
# AITY_VIP 一键部署脚本
# 
# 功能：部署后端到腾讯云生产环境
# 
# 使用方式：
#   bash deploy.sh          # 正常部署
#   bash deploy.sh --force  # 强制部署（跳过确认）
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_HOST="124.221.119.134"
SERVER_USER="root"
SERVER_PATH="/www/wwwroot/AITY_VIP/backend"

echo ""
echo "=============================================="
echo "  🚀 AITY_VIP 部署工具"
echo "=============================================="
echo ""

# 解析参数
FORCE_MODE=false
if [ "$1" == "--force" ]; then
  FORCE_MODE=true
  echo -e "${BLUE}⚡ 强制模式已启用${NC}"
fi

# 本地检查
echo -e "${BLUE}📋 本地检查...${NC}"

# 检查git状态
if [ -d ".git" ]; then
  echo -e "  • Git仓库: ✅"
else
  echo -e "  • Git仓库: ❌ 未找到"
  exit 1
fi

# 检查node_modules
if [ -d "node_modules" ]; then
  echo -e "  • 依赖安装: ✅"
else
  echo -e "${YELLOW}  • 依赖未安装，运行 npm install...${NC}"
  npm install
fi

echo ""

# 确认部署
if [ "$FORCE_MODE" == "false" ]; then
  echo -e "${YELLOW}⚠️  即将部署到生产服务器: ${SERVER_HOST}${NC}"
  echo -e "${YELLOW}⚠️  这将重启后端服务，请确认！${NC}"
  read -p "是否继续? (y/n): " confirm
  
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${RED}部署已取消${NC}"
    exit 0
  fi
fi

echo ""
echo -e "${BLUE}📤 开始部署...${NC}"
echo ""

# 1. 提交本地更改（如果有）
if [ "$FORCE_MODE" == "false" ]; then
  git status --short
  if [ -n "$(git status --short)" ]; then
    echo ""
    read -p "有未提交的更改，是否自动提交? (y/n): " auto_commit
    if [ "$auto_commit" == "y" ] || [ "$auto_commit" == "Y" ]; then
      echo -e "${YELLOW}📝 请输入提交信息:${NC}"
      read -p "> " commit_msg
      git add .
      git commit -m "$commit_msg"
      echo -e "${GREEN}✅ 已提交更改${NC}"
    fi
  fi
fi

# 2. 推送到远程仓库
echo ""
echo -e "${BLUE}📤 推送到远程仓库...${NC}"
git push origin $(git rev-parse --abbrev-ref HEAD)

# 3. SSH到服务器执行部署
echo ""
echo -e "${BLUE}🖥️  连接服务器执行部署...${NC}"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

echo ""
echo "=============================================="
echo "  🖥️  服务器端部署"
echo "=============================================="
echo ""

# 进入项目目录
cd /www/wwwroot/AITY_VIP/backend

echo "📁 项目路径: $(pwd)"
echo ""

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin develop

# 2. 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 3. 重启PM2服务
echo ""
echo "🔄 重启后端服务..."
pm2 stop ecosystem.config.js || true
pm2 start ecosystem.config.js --env production

# 4. 等待服务启动
sleep 3

# 5. 检查服务状态
echo ""
echo "📊 服务状态:"
pm2 status

# 6. 检查日志
echo ""
echo "📋 最近日志 (最后10行):"
pm2 logs ecosystem.config.js --nostream --lines 10 || true

echo ""
echo "=============================================="
echo "  ✅ 部署完成!"
echo "=============================================="
ENDSSH

echo ""
echo "=============================================="
echo "  ✅ 部署成功!"
echo "=============================================="
echo ""
echo -e "${GREEN}🎉 您的更改已部署到生产环境${NC}"
echo ""
echo "💡 后续验证:"
echo "   1. 访问 https://aity88.online:8443/api/health 检查服务"
echo "   2. 在小程序中测试相关功能"
echo ""
