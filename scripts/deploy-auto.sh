#!/bin/bash

###############################################################################
# AITY VIP 后端自动化部署脚本
# 用途：一键部署后端到腾讯云服务器
# 使用方法：bash deploy-auto.sh
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/var/www/aity-vip"
BACKEND_DIR="$PROJECT_DIR/backend"
NODE_VERSION="18"

# 数据库配置（使用远程数据库）
DB_HOST="124.221.119.134"
DB_PORT="3306"
DB_USER="fl"
DB_PASSWORD="fl10b312"
DB_NAME="投研图灵室"

# JWT 密钥
JWT_SECRET="4a1e8c5530aec9beab0d6af47176be105af27e3dc7f4962dab7220b446af492b"

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

print_step() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
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
    print_step "步骤 1/12: 检查并安装 Node.js"

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

# 安装 PM2
install_pm2() {
    print_step "步骤 2/12: 检查并安装 PM2"

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
    print_step "步骤 3/12: 检查并安装 Nginx"

    if command -v nginx &> /dev/null; then
        print_info "Nginx 已安装: $(nginx -v 2>&1)"
        return
    fi

    print_info "安装 Nginx..."
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_info "Nginx 安装完成"
}

# 创建项目目录
create_project_dir() {
    print_step "步骤 4/12: 创建项目目录"

    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "后端代码目录不存在: $BACKEND_DIR"
        print_error "请先上传后端代码到服务器"
        exit 1
    fi

    print_info "项目目录已存在: $BACKEND_DIR"
}

# 测试数据库连接
test_database() {
    print_step "步骤 5/12: 测试数据库连接"

    print_info "测试连接到远程数据库..."

    if command -v mysql &> /dev/null; then
        if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null; then
            print_info "数据库连接成功"
        else
            print_warn "数据库连接失败，但继续部署（稍后可能需要手动配置）"
        fi
    else
        print_info "MySQL 客户端未安装，跳过数据库测试"
    fi
}

# 创建环境配置文件
create_env_file() {
    print_step "步骤 6/12: 创建环境配置文件"

    cat > $BACKEND_DIR/.env.production <<EOF
# 数据库配置（远程数据库）
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
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
    print_step "步骤 7/12: 安装项目依赖"

    cd $BACKEND_DIR
    print_info "正在安装依赖，这可能需要几分钟..."
    npm install --production
    print_info "依赖安装完成"
}

# 初始化数据库
init_database() {
    print_step "步骤 8/12: 初始化数据库"

    cd $BACKEND_DIR

    if [ -f "scripts/init-db.js" ]; then
        print_info "正在初始化数据库表结构..."
        NODE_ENV=production node scripts/init-db.js || print_warn "数据库初始化可能失败，请稍后检查"
        print_info "数据库初始化完成"
    else
        print_warn "未找到数据库初始化脚本，跳过此步骤"
    fi
}

# 创建日志目录
create_log_dir() {
    print_step "步骤 9/12: 创建日志目录"

    mkdir -p /var/log/aity-vip
    chmod 755 /var/log/aity-vip
    print_info "日志目录创建完成"
}

# 启动服务
start_service() {
    print_step "步骤 10/12: 启动后端服务"

    cd $BACKEND_DIR

    # 停止旧服务（如果存在）
    pm2 delete aity-backend 2>/dev/null || true

    # 启动新服务
    print_info "正在启动后端服务..."
    pm2 start src/index.js --name aity-backend --env production
    pm2 save
    pm2 startup systemd -u root --hp /root

    print_info "后端服务启动完成"

    # 等待服务启动
    sleep 3

    # 显示服务状态
    pm2 status
}

# 配置 Nginx
configure_nginx() {
    print_step "步骤 11/12: 配置 Nginx"

    # 检查 SSL 证书
    if [ ! -f "/etc/nginx/ssl/aity88.online.crt" ] || [ ! -f "/etc/nginx/ssl/aity88.online.key" ]; then
        print_warn "SSL 证书不存在"
        print_warn "请手动配置 SSL 证书："
        print_warn "  1. 上传证书到 /etc/nginx/ssl/"
        print_warn "  2. 或使用 Let's Encrypt: certbot --nginx -d aity88.online"
        print_warn "跳过 Nginx 配置"
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
    rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    if nginx -t; then
        systemctl restart nginx
        print_info "Nginx 配置完成"
    else
        print_error "Nginx 配置测试失败"
    fi
}

# 配置防火墙
configure_firewall() {
    print_step "步骤 12/12: 配置防火墙"

    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8443/tcp
        ufw --force enable
        print_info "防火墙配置完成"
    else
        print_warn "UFW 未安装，跳过防火墙配置"
    fi
}

# 验证部署
verify_deployment() {
    print_step "验证部署"

    # 等待服务完全启动
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
        print_warn "⚠️  健康检查接口异常，请检查日志"
    fi

    print_info "部署验证完成"
}

# 打印部署信息
print_deployment_info() {
    echo
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  🎉 部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo
    echo -e "${BLUE}服务信息:${NC}"
    echo "  API 地址: https://aity88.online:8443/api"
    echo "  健康检查: https://aity88.online:8443/health"
    echo
    echo -e "${BLUE}服务管理命令:${NC}"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs aity-backend"
    echo "  重启服务: pm2 restart aity-backend"
    echo "  停止服务: pm2 stop aity-backend"
    echo
    echo -e "${BLUE}下一步操作:${NC}"
    echo "  1. 测试 API: curl https://aity88.online:8443/api/health"
    echo "  2. 在微信开发者工具中测试小程序连接"
    echo "  3. 确认功能正常后，提交小程序审核"
    echo
    echo -e "${YELLOW}注意事项:${NC}"
    if [ ! -f "/etc/nginx/ssl/aity88.online.crt" ]; then
        echo "  ⚠️  SSL 证书未配置，请手动配置后重启 Nginx"
    fi
    echo "  📝 查看日志: pm2 logs aity-backend"
    echo "  📊 监控服务: pm2 monit"
    echo
    echo -e "${GREEN}========================================${NC}"
    echo
}

# 主函数
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  AITY VIP 后端自动化部署${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo

    check_root

    print_info "开始自动化部署..."
    echo

    # 执行部署步骤
    install_nodejs
    install_pm2
    install_nginx
    create_project_dir
    test_database
    create_env_file
    install_dependencies
    init_database
    create_log_dir
    start_service
    configure_nginx
    configure_firewall
    verify_deployment
    print_deployment_info
}

# 运行主函数
main
