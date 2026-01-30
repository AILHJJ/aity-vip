#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="aity-backend"
PROJECT_DIR="/root/AITY/backend"
DOMAIN="aity88.online"
PORT=8443
NODE_PORT=3001

# 数据库配置（使用远程数据库）
DB_HOST="124.221.119.134"
DB_NAME="投研图灵室_test"
DB_USER="fl"
DB_PASSWORD="fl10b312"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AITY 后端自动化部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检查并安装 Node.js
check_nodejs() {
    echo -e "\n${YELLOW}[1/11] 检查 Node.js...${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✓ Node.js 已安装: $NODE_VERSION${NC}"
    else
        echo -e "${YELLOW}→ 安装 Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        echo -e "${GREEN}✓ Node.js 安装完成${NC}"
    fi
}

# 2. 检查并安装 MySQL 客户端
check_mysql() {
    echo -e "\n${YELLOW}[2/11] 检查 MySQL 客户端...${NC}"
    if command -v mysql &> /dev/null; then
        echo -e "${GREEN}✓ MySQL 客户端已安装${NC}"
    else
        echo -e "${YELLOW}→ 安装 MySQL 客户端...${NC}"
        apt-get update
        apt-get install -y mysql-client
        echo -e "${GREEN}✓ MySQL 客户端安装完成${NC}"
    fi
}

# 3. 检查并安装 PM2
check_pm2() {
    echo -e "\n${YELLOW}[3/11] 检查 PM2...${NC}"
    if command -v pm2 &> /dev/null; then
        echo -e "${GREEN}✓ PM2 已安装${NC}"
    else
        echo -e "${YELLOW}→ 安装 PM2...${NC}"
        npm install -g pm2
        echo -e "${GREEN}✓ PM2 安装完成${NC}"
    fi
}

# 4. 检查并安装 Nginx
check_nginx() {
    echo -e "\n${YELLOW}[4/11] 检查 Nginx...${NC}"
    if command -v nginx &> /dev/null; then
        echo -e "${GREEN}✓ Nginx 已安装${NC}"
    else
        echo -e "${YELLOW}→ 安装 Nginx...${NC}"
        apt-get update
        apt-get install -y nginx
        systemctl enable nginx
        echo -e "${GREEN}✓ Nginx 安装完成${NC}"
    fi
}

# 5. 设置项目目录
setup_project_dir() {
    echo -e "\n${YELLOW}[5/11] 检查项目目录...${NC}"

    # 检查项目目录是否存在
    if [ -d "$PROJECT_DIR" ]; then
        echo -e "${GREEN}✓ 项目目录已存在: $PROJECT_DIR${NC}"
    else
        echo -e "${RED}✗ 错误: 项目目录不存在: $PROJECT_DIR${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 项目目录检查完成${NC}"
}

# 6. 配置环境变量
setup_env() {
    echo -e "\n${YELLOW}[6/11] 配置环境变量...${NC}"

    cat > "$PROJECT_DIR/.env" << EOF
# 环境配置
NODE_ENV=production

# 服务器配置
PORT=$NODE_PORT
HOST=0.0.0.0

# 数据库配置
DB_HOST=$DB_HOST
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT 配置
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# 日志配置
LOG_LEVEL=info
EOF

    echo -e "${GREEN}✓ 环境变量配置完成${NC}"
}

# 7. 安装依赖
install_dependencies() {
    echo -e "\n${YELLOW}[7/11] 安装项目依赖...${NC}"
    cd "$PROJECT_DIR"
    npm install --production
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
}

# 8. 初始化数据库
init_database() {
    echo -e "\n${YELLOW}[8/11] 初始化数据库...${NC}"

    # 测试数据库连接
    echo -e "${YELLOW}→ 测试数据库连接...${NC}"
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 数据库连接成功${NC}"

        # 执行数据库初始化脚本
        if [ -f "$PROJECT_DIR/src/config/init-db.sql" ]; then
            echo -e "${YELLOW}→ 执行数据库初始化脚本...${NC}"
            mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$PROJECT_DIR/src/config/init-db.sql"
            echo -e "${GREEN}✓ 数据库初始化完成${NC}"
        else
            echo -e "${YELLOW}! 未找到数据库初始化脚本，跳过${NC}"
        fi
    else
        echo -e "${RED}✗ 数据库连接失败${NC}"
        echo -e "${YELLOW}请检查数据库配置${NC}"
        exit 1
    fi
}

# 9. 启动后端服务
start_backend() {
    echo -e "\n${YELLOW}[9/11] 启动后端服务...${NC}"

    cd "$PROJECT_DIR"

    # 停止旧的进程
    pm2 delete $PROJECT_NAME 2>/dev/null || true

    # 启动新进程
    pm2 start src/index.js --name $PROJECT_NAME --env production

    # 设置开机自启
    pm2 save
    pm2 startup systemd -u root --hp /root

    echo -e "${GREEN}✓ 后端服务启动完成${NC}"
}

# 10. 配置 Nginx
setup_nginx() {
    echo -e "\n${YELLOW}[10/11] 配置 Nginx...${NC}"

    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/$PROJECT_NAME << 'EOF'
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

    # 日志配置
    access_log /var/log/nginx/aity-access.log;
    error_log /var/log/nginx/aity-error.log;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:3001;
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
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/

    # 测试配置
    nginx -t

    if [ $? -eq 0 ]; then
        # 重启 Nginx
        systemctl restart nginx
        echo -e "${GREEN}✓ Nginx 配置完成${NC}"
    else
        echo -e "${RED}✗ Nginx 配置测试失败${NC}"
        exit 1
    fi
}

# 11. 配置防火墙
setup_firewall() {
    echo -e "\n${YELLOW}[11/11] 配置防火墙...${NC}"

    if command -v ufw &> /dev/null; then
        ufw allow 8443/tcp
        echo -e "${GREEN}✓ 防火墙配置完成${NC}"
    else
        echo -e "${YELLOW}! UFW 未安装，跳过防火墙配置${NC}"
    fi
}

# 显示部署结果
show_result() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n${YELLOW}服务信息:${NC}"
    echo -e "  项目目录: $PROJECT_DIR"
    echo -e "  后端地址: https://$DOMAIN:$PORT"
    echo -e "  健康检查: https://$DOMAIN:$PORT/health"
    echo -e "\n${YELLOW}常用命令:${NC}"
    echo -e "  查看日志: pm2 logs $PROJECT_NAME"
    echo -e "  重启服务: pm2 restart $PROJECT_NAME"
    echo -e "  停止服务: pm2 stop $PROJECT_NAME"
    echo -e "  查看状态: pm2 status"
    echo -e "\n${YELLOW}下一步:${NC}"
    echo -e "  1. 访问 https://$DOMAIN:$PORT/health 验证服务"
    echo -e "  2. 测试小程序连接"
    echo -e "  3. 提交小程序审核"
    echo -e "\n${GREEN}========================================${NC}"
}

# 主流程
main() {
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}请使用 root 用户运行此脚本${NC}"
        exit 1
    fi

    # 执行部署步骤
    check_nodejs
    check_mysql
    check_pm2
    check_nginx
    setup_project_dir
    setup_env
    install_dependencies
    init_database
    start_backend
    setup_nginx
    setup_firewall
    show_result
}

# 运行主流程
main
