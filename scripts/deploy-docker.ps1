#!/usr/bin/env powershell
# Docker 自动化部署脚本 (Windows版本)

# 脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 默认配置
$ServerIP = "124.221.119.134"
$ServerUser = "root"
$HttpsDomain = "aity88.online"
$HttpsPort = "8443"
$HttpPort = "8080"

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

# 检查Docker是否安装
function Check-Docker {
    Write-Yellow "检查Docker安装状态..."
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Green "Docker已安装"
        return $true
    } else {
        Write-Red "Docker未安装"
        return $false
    }
}

# 检查Docker Compose是否安装
function Check-DockerCompose {
    Write-Yellow "检查Docker Compose安装状态..."
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        Write-Green "Docker Compose已安装"
        return $true
    } else {
        Write-Red "Docker Compose未安装"
        return $false
    }
}

# 创建Docker配置文件
function Create-DockerConfig {
    Write-Yellow "创建Docker配置文件..."
    
    # 创建docker目录
    $DockerDir = Join-Path $ProjectRoot "docker"
    $NginxDir = Join-Path $DockerDir "nginx"
    $SslDir = Join-Path $NginxDir "ssl"
    
    if (!(Test-Path $SslDir)) {
        New-Item -ItemType Directory -Path $SslDir -Force | Out-Null
    }
    
    # 创建docker-compose.yml
    $DockerComposeContent = @"
version: '3.8'

services:
  backend:
    build: ../backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    networks:
      - aity-network
  
  frontend:
    build: ../frontend
    ports:
      - "5173:5173"
    restart: unless-stopped
    networks:
      - aity-network
  
  nginx:
    image: nginx:latest
    ports:
      - "8080:80"
      - "8443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - aity-network

networks:
  aity-network:
    driver: bridge
"@
    
    $DockerComposeFile = Join-Path $DockerDir "docker-compose.yml"
    $DockerComposeContent | Out-File -FilePath $DockerComposeFile -Encoding UTF8
    Write-Green "docker-compose.yml 创建成功"
}

# 创建后端Dockerfile
function Create-BackendDockerfile {
    Write-Yellow "创建后端Dockerfile..."
    
    $BackendDockerfileContent = @"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
"@
    
    $BackendDockerfile = Join-Path $ProjectRoot "backend\Dockerfile"
    $BackendDockerfileContent | Out-File -FilePath $BackendDockerfile -Encoding UTF8
    Write-Green "后端Dockerfile 创建成功"
}

# 创建前端Dockerfile
function Create-FrontendDockerfile {
    Write-Yellow "创建前端Dockerfile..."
    
    $FrontendDockerfileContent = @"
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
"@
    
    $FrontendDockerfile = Join-Path $ProjectRoot "frontend\Dockerfile"
    $FrontendDockerfileContent | Out-File -FilePath $FrontendDockerfile -Encoding UTF8
    Write-Green "前端Dockerfile 创建成功"
}

# 创建Nginx配置文件
function Create-NginxConfig {
    Write-Yellow "创建Nginx配置文件..."
    
    $NginxConfigContent = @"
events {
  worker_connections 1024;
}

http {
  server {
    listen 80;
    server_name aity88.online;
    
    return 301 https://$server_name:8443$request_uri;
  }
  
  server {
    listen 443 ssl;
    server_name aity88.online;
    
    ssl_certificate /etc/nginx/ssl/aity88.online.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
      expires 1y;
      add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location / {
      proxy_pass http://frontend:5173;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
      proxy_pass http://backend:3001;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
"@
    
    $NginxConfigFile = Join-Path $ProjectRoot "docker\nginx\nginx.conf"
    $NginxConfigContent | Out-File -FilePath $NginxConfigFile -Encoding UTF8
    Write-Green "Nginx配置文件 创建成功"
}

# 部署Docker服务
function Deploy-Docker {
    Write-Yellow "部署Docker服务..."
    
    $DockerDir = Join-Path $ProjectRoot "docker"
    Set-Location $DockerDir
    
    try {
        docker-compose up -d --build
        if ($LASTEXITCODE -eq 0) {
            Write-Green "Docker服务部署成功"
            return $true
        } else {
            Write-Red "Docker服务部署失败"
            return $false
        }
    } catch {
        Write-Red "Docker部署异常: $($_.Exception.Message)"
        return $false
    }
}

# 验证部署
function Verify-Deployment {
    Write-Yellow "验证部署状态..."
    
    $DockerDir = Join-Path $ProjectRoot "docker"
    Set-Location $DockerDir
    
    try {
        docker-compose ps
        if ($LASTEXITCODE -eq 0) {
            Write-Green "部署验证成功"
            return $true
        } else {
            Write-Red "部署验证失败"
            return $false
        }
    } catch {
        Write-Red "验证异常: $($_.Exception.Message)"
        return $false
    }
}

# 主函数
function Main {
    Write-Green "开始Docker自动化部署..."
    
    # 检查Docker环境
    if (!(Check-Docker)) {
        Write-Yellow "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    }
    
    if (!(Check-DockerCompose)) {
        Write-Yellow "请先安装Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    }
    
    # 创建配置文件
    Create-DockerConfig
    Create-BackendDockerfile
    Create-FrontendDockerfile
    Create-NginxConfig
    
    # 部署服务
    if (Deploy-Docker) {
        Write-Green "\n🎉 Docker自动化部署完成!"
        Write-Green "前端访问地址: https://$HttpsDomain:$HttpsPort"
        Write-Green "后端API地址: https://$HttpsDomain:$HttpsPort/api"
        Write-Yellow "HTTP访问地址: http://$HttpsDomain:$HttpPort (自动重定向至HTTPS)"
        
        # 验证部署
        Verify-Deployment
    } else {
        Write-Red "Docker部署失败"
        exit 1
    }
}

# 执行主函数
Main