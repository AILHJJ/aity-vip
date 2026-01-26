# AITY VIP HTTPS部署脚本 (Windows版本)
# 用于将代码部署到腾讯云服务器并配置HTTPS

# 配置信息
$SERVER_IP = "124.221.119.134"     # 腾讯云服务器IP
$SERVER_USER = "root"                 # 服务器用户名
$FRONTEND_DIR = "/var/www/aity-vip/frontend"  # 前端部署目录
$BACKEND_DIR = "/var/www/aity-vip/backend"    # 后端部署目录
$NGINX_DIR = "/etc/nginx"                       # Nginx配置目录

# HTTPS配置
$HTTPS_DOMAIN = "aity88.online"
$HTTPS_PORT = "8443"
$HTTP_PORT = "8080"
$FRONTEND_URL = "https://$HTTPS_DOMAIN:$HTTPS_PORT"
$BACKEND_URL = "https://$HTTPS_DOMAIN:$HTTPS_PORT/api"

# 颜色输出函数
function Write-Green {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Yellow {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Red {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Yellow "开始部署AITY VIP项目..."
Write-Yellow "项目路径: $ProjectRoot"

# 1. 构建前端
Write-Yellow "`n[1/7] 构建前端项目..."
$FrontendDir = Join-Path $ProjectRoot "frontend"
Set-Location $FrontendDir

Write-Yellow "  安装前端依赖..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Red "前端依赖安装失败!"
    exit 1
}
Write-Green "  前端依赖安装成功!"

Write-Yellow "  构建前端项目..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Red "前端构建失败!"
    exit 1
}
Write-Green "  前端构建成功!"

# 2. 部署前端
Write-Yellow "`n[2/7] 部署前端到服务器..."
$DistDir = Join-Path $FrontendDir "dist"
scp -r "$DistDir/*" "$SERVER_USER@$SERVER_IP`:$FRONTEND_DIR"
if ($LASTEXITCODE -ne 0) {
    Write-Red "前端部署失败!"
    exit 1
}
Write-Green "  前端部署成功!"

# 3. 部署后端
Write-Yellow "`n[3/7] 部署后端到服务器..."
$BackendDir = Join-Path $ProjectRoot "backend"
scp -r "$BackendDir/*" "$SERVER_USER@$SERVER_IP`:$BACKEND_DIR"
if ($LASTEXITCODE -ne 0) {
    Write-Red "后端代码复制失败!"
    exit 1
}
Write-Green "  后端代码复制成功!"

# 4. 安装后端依赖并重启服务
Write-Yellow "`n[4/7] 安装后端依赖并重启服务..."
ssh "$SERVER_USER@$SERVER_IP" "cd $BACKEND_DIR && npm install --production && pm2 restart ecosystem.config.js"
if ($LASTEXITCODE -ne 0) {
    Write-Red "后端服务重启失败!"
    exit 1
}
Write-Green "  后端服务重启成功!"

# 5. 配置Nginx HTTPS
Write-Yellow "`n[5/7] 配置Nginx HTTPS..."
$NginxConfig = @"
# HTTP重定向至HTTPS
server {
    listen $HTTP_PORT;
    server_name $HTTPS_DOMAIN;
    
    return 301 https://`$`server_name:$HTTPS_PORT`$`request_uri;
}

# HTTPS服务器配置
server {
    listen $HTTPS_PORT ssl http2;
    server_name $HTTPS_DOMAIN;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/$HTTPS_DOMAIN.crt;
    ssl_certificate_key /etc/nginx/ssl/$HTTPS_DOMAIN.key;
    
    # SSL协议配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # HSTS配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # CSP配置
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
    
    # 其他安全头部
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # 反向代理配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host `$`host;
        proxy_set_header X-Real-IP `$`remote_addr;
        proxy_set_header X-Forwarded-For `$`proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$`scheme;
    }
}
"@

$NginxConfigPath = "$NGINX_DIR/conf.d/aity-vip-https.conf"
$CheckConfig = ssh "$SERVER_USER@$SERVER_IP" "test -f $NginxConfigPath && echo 'exists' || echo 'not exists'"
if ($CheckConfig -eq "exists") {
    Write-Green "  Nginx HTTPS配置已存在!"
} else {
    Write-Yellow "  创建Nginx HTTPS配置..."
    $NginxConfig | ssh "$SERVER_USER@$SERVER_IP" "cat > $NginxConfigPath"
    Write-Green "  Nginx HTTPS配置创建成功!"
}

# 6. 重启Nginx服务
Write-Yellow "`n[6/7] 重启Nginx服务..."
ssh "$SERVER_USER@$SERVER_IP" "nginx -t && systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Red "Nginx服务重启失败!"
    exit 1
}
Write-Green "  Nginx服务重启成功!"

# 7. 验证部署
Write-Yellow "`n[7/7] 验证部署状态..."
ssh "$SERVER_USER@$SERVER_IP" "pm2 status"
if ($LASTEXITCODE -ne 0) {
    Write-Red "部署验证失败!"
    exit 1
}
Write-Green "  部署验证成功!"

Write-Green "`n🎉 AITY VIP项目部署完成!"
Write-Green "前端访问地址: $FRONTEND_URL"
Write-Green "后端API地址: $BACKEND_URL"
Write-Yellow "HTTP访问地址: http://$HTTPS_DOMAIN:$HTTP_PORT (自动重定向至HTTPS)"
Write-Green "HTTPS访问地址: $FRONTEND_URL"
