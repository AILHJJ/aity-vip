#!/usr/bin/env powershell
# 部署脚本 - 用于将代码部署到腾讯云服务器

# 配置
$CONFIG = @{
    Server = @{
        IP = "124.221.119.134"
        User = "root"
        FrontendDir = "/root/aity-vip/aity-uni-app-v2"
        BackendDir = "/root/aity-vip/backend"
        NginxDir = "/etc/nginx"
        SshKey = "d:\your-mcp-proxy\AITY_VIP\AITY0127.pem"
    }
    Https = @{
        Domain = "aity88.online"
        Port = "8443"
        HttpPort = "8080"
    }
    Paths = @{
        Frontend = "..\frontend"
        Backend = "..\backend"
    }
    Logs = @{
        Dir = "logs"
    }
}

# 获取脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 路径配置
$FrontendLocalDir = Join-Path $ScriptDir $CONFIG.Paths.Frontend
$BackendLocalDir = Join-Path $ScriptDir $CONFIG.Paths.Backend

# 日志配置
$LogDir = Join-Path $ScriptDir $CONFIG.Logs.Dir
$LogFile = Join-Path $LogDir "deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# 保存原始目录
$OriginalLocation = Get-Location

# 颜色输出函数
function Write-Green {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
    Write-Log $Message "INFO"
}

function Write-Yellow {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
    Write-Log $Message "INFO"
}

function Write-Red {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
    Write-Log $Message "ERROR"
}

# 日志记录函数
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    try {
        if (!(Test-Path $LogDir)) {
            New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        }
        $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        "[$Timestamp] [$Level] $Message" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    } catch {
        Write-Host "日志写入失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 检查SSH连接函数
function Test-SSHConnection {
    param(
        [string]$User,
        [string]$IP,
        [string]$PrivateKeyPath
    )
    Write-Yellow "检查SSH连接到 $User@$IP..."
    try {
        if (!(Test-Path $PrivateKeyPath)) {
            Write-Red "SSH密钥文件不存在: $PrivateKeyPath"
            return $false
        }
        
        # 设置密钥权限
        icacls "$PrivateKeyPath" /inheritance:r /grant:r "$env:USERNAME`:F" /remove "Everyone" 2>&1 | Out-Null
        
        $sshExe = "C:\Windows\System32\OpenSSH\ssh.exe"
        if (!(Test-Path $sshExe)) {
            Write-Red "SSH客户端不存在: $sshExe"
            return $false
        }
        
        $result = & "$sshExe" -i "$PrivateKeyPath" -o StrictHostKeyChecking=no "$User@$IP" "echo 'SSH连接测试成功'" 2>&1
        
        if ($result -match "SSH连接测试成功") {
            Write-Green "✅ SSH连接成功!"
            return $true
        } else {
            Write-Red "❌ SSH连接失败: $result"
            return $false
        }
    } catch {
        Write-Red "❌ SSH连接失败: $($_.Exception.Message)"
        return $false
    }
}

# 执行SSH命令函数
function Invoke-SSHCommand {
    param(
        [string]$User,
        [string]$IP,
        [string]$PrivateKeyPath,
        [string]$Command
    )
    try {
        $sshExe = "C:\Windows\System32\OpenSSH\ssh.exe"
        $result = & "$sshExe" -i "$PrivateKeyPath" "$User@$IP" "$Command" 2>&1
        return @{
            Success = $LASTEXITCODE -eq 0
            Output = $result
        }
    } catch {
        return @{
            Success = $false
            Output = $_.Exception.Message
        }
    }
}

# 上传文件函数
function Upload-File {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$User,
        [string]$IP,
        [string]$PrivateKeyPath
    )
    try {
        $scpExe = "C:\Windows\System32\OpenSSH\scp.exe"
        $result = & "$scpExe" -i "$PrivateKeyPath" -r "$Source" "$User@$IP:$Destination" 2>&1
        return @{
            Success = $LASTEXITCODE -eq 0
            Output = $result
        }
    } catch {
        return @{
            Success = $false
            Output = $_.Exception.Message
        }
    }
}

# 主部署函数
function Deploy-AITYVIP {
    Write-Yellow "🚀 开始部署AITY VIP项目..."
    Write-Log "部署开始" "INFO"

    # 检查必要的目录
    if (!(Test-Path $FrontendLocalDir)) {
        Write-Red "前端目录不存在: $FrontendLocalDir"
        exit 1
    }
    
    if (!(Test-Path $BackendLocalDir)) {
        Write-Red "后端目录不存在: $BackendLocalDir"
        exit 1
    }

    # 检查SSH连接
    Write-Yellow "\n========================================"
    Write-Yellow "  SSH连接配置"
    Write-Yellow "========================================"
    Write-Yellow "服务器信息"
    Write-Yellow "  IP地址: $($CONFIG.Server.IP)"
    Write-Yellow "  用户名: $($CONFIG.Server.User)"
    Write-Yellow "  SSH密钥: $($CONFIG.Server.SshKey)"
    Write-Yellow ""

    if (!(Test-SSHConnection $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey)) {
        Write-Red "SSH连接失败，无法继续部署!"
        Write-Red "尝试解决方案:"
        Write-Red "1. 检查密钥是否正确绑定到腾讯云服务器"
        Write-Red "2. 检查服务器安全组是否开放端口22"
        Write-Red "3. 检查服务器是否正常运行"
        Write-Log "SSH连接失败，部署终止" "ERROR"
        exit 1
    }

    # 1. 构建前端
    Write-Yellow "\n1. 构建前端项目..."
    Set-Location $FrontendLocalDir
    Write-Log "开始构建前端" "INFO"

    try {
        Write-Host "安装前端依赖..." -ForegroundColor Yellow
        $npmInstall = npm install 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Green "前端依赖安装成功!"
            
            Write-Host "构建前端项目..." -ForegroundColor Yellow
            $npmBuild = npm run build 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Green "前端构建成功!"
                Write-Log "前端构建成功" "INFO"
            } else {
                Write-Red "前端构建失败: $npmBuild"
                Write-Log "前端构建失败: $npmBuild" "ERROR"
                exit 1
            }
        } else {
            Write-Red "前端依赖安装失败: $npmInstall"
            Write-Log "前端依赖安装失败: $npmInstall" "ERROR"
            exit 1
        }
    } catch {
        Write-Red "前端构建异常: $($_.Exception.Message)"
        Write-Log "前端构建异常: $($_.Exception.Message)" "ERROR"
        exit 1
    }

    # 2. 部署前端
    Write-Yellow "\n2. 部署前端到服务器..."
    Write-Log "开始部署前端到服务器" "INFO"

    try {
        # 确保服务器目录存在
        $cmd = "mkdir -p $($CONFIG.Server.FrontendDir)"
        $result = Invoke-SSHCommand $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey $cmd
        if ($result.Success) {
            Write-Green "前端目录创建成功"
        } else {
            Write-Red "创建前端目录失败: $($result.Output)"
        }
        
        # 上传前端文件
        $frontendDist = Join-Path $FrontendLocalDir "dist"
        if (Test-Path $frontendDist) {
            $uploadResult = Upload-File "$frontendDist/*" "$($CONFIG.Server.FrontendDir)" $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey
            if ($uploadResult.Success) {
                Write-Green "前端部署成功!"
                Write-Log "前端部署成功" "INFO"
            } else {
                Write-Red "前端部署失败: $($uploadResult.Output)"
                Write-Log "前端部署失败: $($uploadResult.Output)" "ERROR"
                exit 1
            }
        } else {
            Write-Red "前端构建目录不存在: $frontendDist"
            exit 1
        }
    } catch {
        Write-Red "前端部署失败: $($_.Exception.Message)"
        Write-Log "前端部署失败: $($_.Exception.Message)" "ERROR"
        exit 1
    }

    # 3. 部署后端
    Write-Yellow "\n3. 部署后端到服务器..."
    Write-Log "开始部署后端到服务器" "INFO"

    try {
        # 确保服务器目录存在
        $cmd = "mkdir -p $($CONFIG.Server.BackendDir)"
        $result = Invoke-SSHCommand $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey $cmd
        if ($result.Success) {
            Write-Green "后端目录创建成功"
        } else {
            Write-Red "创建后端目录失败: $($result.Output)"
        }
        
        # 上传后端文件
        $uploadResult = Upload-File "$BackendLocalDir/*" "$($CONFIG.Server.BackendDir)" $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey
        if ($uploadResult.Success) {
            Write-Green "后端代码复制成功!"
            Write-Log "后端代码复制成功" "INFO"
        } else {
            Write-Red "后端代码复制失败: $($uploadResult.Output)"
            Write-Log "后端代码复制失败: $($uploadResult.Output)" "ERROR"
            exit 1
        }
    } catch {
        Write-Red "后端代码复制失败: $($_.Exception.Message)"
        Write-Log "后端代码复制失败: $($_.Exception.Message)" "ERROR"
        exit 1
    }

    # 4. 安装后端依赖并重启服务
    Write-Yellow "\n4. 安装后端依赖并重启服务..."
    Write-Log "开始安装后端依赖并重启服务" "INFO"

    try {
        $cmd = "cd $($CONFIG.Server.BackendDir) && npm install --production && pm2 restart ecosystem.config.js"
        $result = Invoke-SSHCommand $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey $cmd
        
        if ($result.Success) {
            Write-Green "后端服务重启成功!"
            Write-Log "后端服务重启成功" "INFO"
        } else {
            Write-Red "后端服务操作失败: $($result.Output)"
            Write-Red "尝试解决方案:"
            Write-Red "1. 检查Node.js版本"
            Write-Red "2. 检查PM2是否安装"
            Write-Red "3. 安装PM2: npm install -g pm2"
            Write-Log "后端服务操作失败: $($result.Output)" "ERROR"
        }
    } catch {
        Write-Red "后端服务操作失败: $($_.Exception.Message)"
        Write-Log "后端服务操作失败: $($_.Exception.Message)" "ERROR"
    }

    # 5. 配置Nginx HTTPS
    Write-Yellow "\n5. 配置Nginx HTTPS..."
    Write-Log "开始配置Nginx HTTPS" "INFO"

    try {
        # 确保Nginx配置目录存在
        $cmd = "mkdir -p $($CONFIG.Server.NginxDir)/conf.d"
        $result = Invoke-SSHCommand $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey $cmd
        if ($result.Success) {
            Write-Green "Nginx配置目录创建成功"
        }
        
        # 创建Nginx配置
        $nginxConfig = @"
# HTTP重定向至HTTPS
server {
    listen $($CONFIG.Https.HttpPort);
    server_name $($CONFIG.Https.Domain);
    
    return 301 https://$($CONFIG.Https.Domain):$($CONFIG.Https.Port)$request_uri;
}

# HTTPS服务器配置
server {
    listen $($CONFIG.Https.Port) ssl http2;
    server_name $($CONFIG.Https.Domain);
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/$($CONFIG.Https.Domain).crt;
    ssl_certificate_key /etc/nginx/ssl/$($CONFIG.Https.Domain).key;
    
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
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"@
        
        # 创建临时配置文件
        $tempConfigFile = [System.IO.Path]::GetTempFileName() + ".conf"
        $nginxConfig | Out-File -FilePath $tempConfigFile -Encoding UTF8
        
        # 上传配置文件
        $uploadResult = Upload-File "$tempConfigFile" "$($CONFIG.Server.NginxDir)/conf.d/aity-vip-https.conf" $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey
        if ($uploadResult.Success) {
            Write-Green "Nginx配置上传成功"
        } else {
            Write-Red "Nginx配置上传失败: $($uploadResult.Output)"
        }
        
        # 删除临时文件
        Remove-Item $tempConfigFile -Force
        
    } catch {
        Write-Red "Nginx配置失败: $($_.Exception.Message)"
        Write-Log "Nginx配置失败: $($_.Exception.Message)" "ERROR"
    }

    # 6. 重启Nginx服务
    Write-Yellow "\n6. 重启Nginx服务..."
    Write-Log "开始重启Nginx服务" "INFO"

    try {
        $cmd = "nginx -t && systemctl reload nginx"
        $result = Invoke-SSHCommand $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey $cmd
        
        if ($result.Success) {
            Write-Green "Nginx重启成功!"
            Write-Log "Nginx重启成功" "INFO"
        } else {
            Write-Red "Nginx重启失败: $($result.Output)"
            Write-Red "尝试解决方案:"
            Write-Red "1. 检查Nginx配置: nginx -t"
            Write-Red "2. 检查Nginx服务状态: systemctl status nginx"
            Write-Log "Nginx重启失败: $($result.Output)" "ERROR"
        }
    } catch {
        Write-Red "Nginx重启失败: $($_.Exception.Message)"
        Write-Log "Nginx重启失败: $($_.Exception.Message)" "ERROR"
    }

    # 7. 验证部署
    Write-Yellow "\n7. 验证部署状态..."
    Write-Log "开始验证部署状态" "INFO"

    try {
        $cmd = "pm2 status"
        $result = Invoke-SSHCommand $CONFIG.Server.User $CONFIG.Server.IP $CONFIG.Server.SshKey $cmd
        
        if ($result.Success) {
            Write-Green "✅ 部署验证成功!"
            Write-Host "PM2服务状态:" -ForegroundColor Yellow
            $result.Output | Write-Host
            Write-Log "部署验证成功" "INFO"
        } else {
            Write-Red "❌ 部署验证失败: $($result.Output)"
            Write-Log "部署验证失败: $($result.Output)" "ERROR"
        }
    } catch {
        Write-Red "❌ 部署验证失败: $($_.Exception.Message)"
        Write-Log "部署验证失败: $($_.Exception.Message)" "ERROR"
    }

    # 生成访问地址
    $FRONTEND_URL = "https://$($CONFIG.Https.Domain):$($CONFIG.Https.Port)"
    $BACKEND_URL = "https://$($CONFIG.Https.Domain):$($CONFIG.Https.Port)/api"

    Write-Green "\n🎉 AITY VIP项目部署完成!"
    Write-Green "前端访问地址: $FRONTEND_URL"
    Write-Green "后端API地址: $BACKEND_URL"
    Write-Yellow "HTTP访问地址: http://$($CONFIG.Https.Domain):$($CONFIG.Https.HttpPort) (自动重定向到HTTPS)"
    Write-Green "HTTPS访问地址: $FRONTEND_URL"
    Write-Yellow "部署日志文件: $LogFile"

    Write-Log "部署完成" "INFO"
    Write-Log "前端访问地址: $FRONTEND_URL" "INFO"
    Write-Log "后端API地址: $BACKEND_URL" "INFO"
    Write-Log "HTTPS访问地址: $FRONTEND_URL" "INFO"

    Write-Yellow "\n使用提示:"
    Write-Yellow "1. 检查端口占用情况，执行命令:"
    Write-Yellow "   ssh -i $($CONFIG.Server.SshKey) $($CONFIG.Server.User)@$($CONFIG.Server.IP) 'lsof -i :8443 && lsof -i :8080 && lsof -i :3001'"
    Write-Yellow "2. 后端服务启动失败，查看日志:"
    Write-Yellow "   ssh -i $($CONFIG.Server.SshKey) $($CONFIG.Server.User)@$($CONFIG.Server.IP) 'pm2 logs'"
    Write-Yellow "3. Nginx配置错误，查看日志:"
    Write-Yellow "   ssh -i $($CONFIG.Server.SshKey) $($CONFIG.Server.User)@$($CONFIG.Server.IP) 'tail -f /var/log/nginx/error.log'"
    Write-Yellow "4. 如需再次部署，直接运行此脚本即可"

    # 返回到原目录
    Set-Location $OriginalLocation
}

# 执行部署
Deploy-AITYVIP
