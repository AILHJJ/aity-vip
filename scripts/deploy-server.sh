#!/bin/bash

###############################################################################
# AITY VIP 后端服务器部署脚本
# 用途：自动化部署后端代码到腾讯云服务器
# 使用方法：在服务器上运行此脚本
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="aity-backend"
PROJECT_DIR="/root/aity-vip"
BACKEND_DIR="$PROJECT_DIR/backend"
DB_NAME="投研图灵室"
DB_USER="投研图灵室"
NODE_VERSION="18"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 用户或 sudo 运行此脚本"
        exit 1
    fi
}

# 安装 Node.js
install_nodejs() {
    print_info "检查 Node.js 安装..."

    if command -v node &> /dev/null; then
        NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_CURRENT" -ge "$NODE_VERSION" ]; then
            print_info "Node.js 已安装: $(node -v)"
            return
        fi
    fi

    print_info "安装 Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    print_info "Node.js 安装完成: $(node -v)"
}

# 安装 MySQL
install_mysql() {
    print_info "检查 MySQL 安装..."

    if command -v mysql &> /dev/null; then
        print_info "MySQL 已安装"
        return
    fi

    print_info "安装 MySQL..."
    apt-get update
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    print_info "MySQL 安装完成"
}

# 安装 PM2
install_pm2() {
    print_info "检查 PM2 安装..."

    if command -v pm2 &> /dev/null; then
        print_info "PM2 已安装: $(pm2 -v)"
        return
    fi

    print_info "安装 PM2..."
    npm install -g pm2
    print_info "PM2 安装完成: $(pm2 -v)"
}

# 安装 Nginx
install_nginx() {
    print_info "检查 Nginx 安装..."

    if command -v nginx &> /dev/null; then
        print_info "Nginx 已安装: $(nginx -v 2>&1)"
        return
    fi

    print_info "安装 Nginx..."
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_info "Nginx 安装完成"
}

# 创建项目目录
create_project_dir() {
    print_info "创建项目目录..."
    mkdir -p $PROJECT_DIR
    mkdir -p $BACKEND_DIR
    print_info "项目目录创建完成: $PROJECT_DIR"
}

# 配置数据库
setup_database() {
    print_info "配置数据库..."

    # 提示用户输入数据库密码
    read -sp "请输入 MySQL root 密码: " MYSQL_ROOT_PASSWORD
    echo
    read -sp "请输入新的数据库用户密码: " DB_PASSWORD
    echo

    # 创建数据库和用户
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

    print_info "数据库配置完成"

    # 保存数据库密码供后续使用
    export DB_PASSWORD
}

# 创建环境配置文件
create_env_file() {
    print_info "创建环境配置文件..."

    # 生成随机 JWT Secret
    JWT_SECRET=$(openssl rand -hex 32)

    cat > $BACKEND_DIR/.env.production <<EOF
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# JWT 配置
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3001
NODE_ENV=production

# CORS 配置
ALLOWED_ORIGINS=https://aity88.online:8443,https://servicewechat.com

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/aity-vip/backend.log
EOF

    chmod 600 $BACKEND_DIR/.env.production
    print_info "环境配置文件创建完成"
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."
    cd $BACKEND_DIR
    npm install --production
    print_info "依赖安装完成"
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."
    cd $BACKEND_DIR
    NODE_ENV=production node scripts/init-db.js
    print_info "数据库初始化完成"
}

# 启动服务
start_service() {
    print_info "启动后端服务..."
    cd $BACKEND_DIR

    # 停止旧服务（如果存在）
    pm2 delete aity-backend 2>/dev/null || true

    # 启动新服务
    pm2 start src/index.js --name aity-backend --env production
    pm2 save
    pm2 startup

    print_info "后端服务启动完成"
}

# 配置 Nginx
configure_nginx() {
    print_info "配置 Nginx..."

    # 检查 SSL 证书是否存在
    if [ ! -f "/etc/nginx/ssl/aity88.online.crt" ]; then
        print_warn "SSL 证书不存在，请手动配置 SSL 证书"
        print_warn "证书路径: /etc/nginx/ssl/aity88.online.crt"
        print_warn "密钥路径: /etc/nginx/ssl/aity88.online.key"
        return
    fi

    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/aity-vip <<'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name aity88.online;
    return 301 https://$server_name:8443$request_uri;
}

# HTTPS 配置
server {
    listen 8443 ssl http2;
    server_name aity88.online;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/aity88.online.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }

    # 日志
    access_log /var/log/nginx/aity-vip-access.log;
    error_log /var/log/nginx/aity-vip-error.log;
}
EOF

    # 启用配置
    ln -sf /etc/nginx/sites-available/aity-vip /etc/nginx/sites-enabled/

    # 测试配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx

    print_info "Nginx 配置完成"
}

# 配置防火墙
configure_firewall() {
    print_info "配置防火墙..."

    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8443/tcp
        ufw allow 22/tcp
        ufw --force enable
        print_info "防火墙配置完成"
    else
        print_warn "UFW 未安装，跳过防火墙配置"
    fi
}

# 创建日志目录
create_log_dir() {
    print_info "创建日志目录..."
    mkdir -p /var/log/aity-vip
    chown -R www-data:www-data /var/log/aity-vip
    print_info "日志目录创建完成"
}

# 验证部署
verify_deployment() {
    print_info "验证部署..."

    # 等待服务启动
    sleep 5

    # 检查服务状态
    if pm2 list | grep -q "aity-backend.*online"; then
        print_info "✅ 后端服务运行正常"
    else
        print_error "❌ 后端服务启动失败"
        pm2 logs aity-backend --lines 20
        exit 1
    fi

    # 检查健康检查接口
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        print_info "✅ 健康检查接口正常"
    else
        print_error "❌ 健康检查接口异常"
        exit 1
    fi

    print_info "部署验证完成"
}

# 打印部署信息
print_deployment_info() {
    echo
    echo "========================================"
    echo "  部署完成！"
    echo "========================================"
    echo "API 地址: https://aity88.online:8443/api"
    echo "健康检查: https://aity88.online:8443/health"
    echo
    echo "服务管理命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs aity-backend"
    echo "  重启服务: pm2 restart aity-backend"
    echo "  停止服务: pm2 stop aity-backend"
    echo
    echo "下一步操作:"
    echo "1. 在微信公众平台配置服务器域名: https://aity88.online:8443"
    echo "2. 上传小程序代码"
    echo "3. 提交审核"
    echo "========================================"
    echo
}

# 主函数
main() {
    echo "========================================"
    echo "  AITY VIP 后端部署脚本"
    echo "========================================"
    echo

    check_root

    print_info "开始部署..."

    # 安装必要软件
    install_nodejs
    install_mysql
    install_pm2
    install_nginx

    # 创建项目结构
    create_project_dir
    create_log_dir

    # 配置数据库
    setup_database

    # 创建环境配置
    create_env_file

    # 安装依赖
    install_dependencies

    # 初始化数据库
    init_database

    # 启动服务
    start_service

    # 配置 Nginx
    configure_nginx

    # 配置防火墙
    configure_firewall

    # 验证部署
    verify_deployment

    # 打印部署信息
    print_deployment_info
}

# 运行主函数
main
