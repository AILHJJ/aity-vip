#!/bin/bash
# 部署配置文件
# 用途：配置域名、邮箱等信息
# 使用：复制此文件为 deploy.config.sh 并填写你的信息

# ============================================
# 基本配置
# ============================================

# 域名配置
DOMAIN="aity88.online"           # 主域名
WWW_DOMAIN="www.aity88.online"   # www域名（如果有）

# 邮箱配置（用于Let's Encrypt证书申请和续期提醒）
EMAIL="your-email@example.com"   # 修改为你的真实邮箱

# ============================================
# 服务器配置
# ============================================

# 项目目录
PROJECT_DIR="/root/aity-vip"

# 后端服务配置
BACKEND_PORT="3001"              # 后端服务端口
BACKEND_PROCESS_NAME="aity-backend"  # PM2进程名

# Nginx配置
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

# ============================================
# SSL证书配置
# ============================================

# SSL证书类型
# 可选值：
#   "letsencrypt" - 使用Let's Encrypt免费证书（推荐）
#   "manual"      - 使用手动购买的证书
SSL_TYPE="letsencrypt"

# Let's Encrypt证书路径（自动配置）
LETSENCRYPT_CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

# 手动证书路径（如果使用手动证书）
MANUAL_CERT_DIR="/etc/nginx/ssl"
MANUAL_CERT_KEY="$MANUAL_CERT_DIR/aity88.online.key"
MANUAL_CERT_CRT="$MANUAL_CERT_DIR/aity88.online_bundle.crt"

# ============================================
# 数据库配置（如果需要）
# ============================================

# 数据库主机
DB_HOST="124.221.119.134"

# 数据库端口
DB_PORT="3306"

# 数据库名称
DB_NAME="投研图灵室_test"

# 数据库用户
DB_USER="fl"

# 数据库密码
DB_PASSWORD="fl10b312"

# ============================================
# 其他配置
# ============================================

# 是否启用防火墙配置
ENABLE_FIREWALL="true"

# 是否配置开机自启
ENABLE_AUTO_START="true"

# 备份目录
BACKUP_DIR="/root/backups/aity-vip"

# ============================================
# 说明
# ============================================

# 1. 复制此文件
#    cp scripts/deploy.config.example.sh scripts/deploy.config.sh
#
# 2. 修改配置
#    nano scripts/deploy.config.sh
#
# 3. 使用配置
#    source scripts/deploy.config.sh
#    然后运行部署脚本
#
# 注意：
# - 不要将deploy.config.sh提交到Git（包含敏感信息）
# - .gitignore已配置忽略此文件
# - 修改邮箱为真实邮箱，用于证书申请和续期提醒
