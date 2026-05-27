#!/bin/bash
###
 # @Author: fuli fuli@example.com
 # @Date: 2026-01-26 14:14:28
 # @LastEditors: AI Assistant
 # @LastEditTime: 2026-04-23 11:30:00
 # @FilePath: \your-mcp-proxy\AITY_VIP\scripts\deploy-git.sh
 # @Description: Git优先部署脚本 - 优先使用Git部署，失败时使用SCP
### 

# =============================================
# 部署配置
# =============================================
SERVER_IP="124.221.119.134"
SERVER_USER="root"
SSH_KEY="$HOME/.ssh/id_rsa"  # 可改为具体密钥路径

# Git仓库配置
GIT_REPO="https://github.com/AILHJJ/aity-vip.git"
GIT_BRANCH="feature/iteration-1"  # 部署分支

# 服务器目录
SERVER_BASE="/root/aity-vip"
FRONTEND_DIR="$SERVER_BASE/aity-uni-app-v2"
BACKEND_DIR="$SERVER_BASE/backend"
NGINX_DIR="/etc/nginx"

# HTTPS配置
HTTPS_DOMAIN="aity88.online"
HTTPS_PORT="8443"
HTTP_PORT="8080"

# 本地目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_LOCAL_DIR="$SCRIPT_DIR/../aity-uni-app-v2"
BACKEND_LOCAL_DIR="$SCRIPT_DIR/../backend"

# =============================================
# SSH命令封装
# =============================================
SSH_CMD="ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP"
SCP_CMD="scp -o StrictHostKeyChecking=no"

# =============================================
# 日志配置
# =============================================
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/deploy_$(date +%Y%m%d_%H%M%S).log"

# =============================================
# 辅助函数
# =============================================
log() {
    local level="$1"
    local msg="$2"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $msg" >> "$LOG_FILE"
    echo "[$level] $msg"
}

info() { log "INFO" "$1"; }
warn() { log "WARN" "$1"; }
error() { log "ERROR" "$1"; }
success() { log "SUCCESS" "$1"; }

# =============================================
# 检查SSH连接
# =============================================
check_ssh() {
    info "检查SSH连接..."
    if $SSH_CMD "echo 'SSH连接成功'" > /dev/null 2>&1; then
        success "SSH连接成功"
        return 0
    else
        error "SSH连接失败"
        return 1
    fi
}

# =============================================
# Git部署 - 优先方案
# =============================================
deploy_with_git() {
    local target_dir="$1"
    local service_name="$2"
    
    info "尝试Git方式部署 $service_name..."
    
    # 检查服务器是否有Git
    if ! $SSH_CMD "which git" > /dev/null 2>&1; then
        warn "服务器未安装Git，使用SCP方式"
        return 1
    fi
    
    # 检查目标目录是否已是Git仓库
    if $SSH_CMD "cd $target_dir && git rev-parse --git-dir" > /dev/null 2>&1; then
        # 已是Git仓库，执行pull
        info "Git仓库已存在，执行git pull..."
        if $SSH_CMD "cd $target_dir && git config init.defaultBranch main && git fetch origin && git checkout $GIT_BRANCH && git pull origin $GIT_BRANCH 2>&1"; then
            success "$service_name Git部署成功"
            return 0
        else
            warn "$service_name Git pull失败，尝试重新克隆..."
            # 删除旧目录，重新克隆
            $SSH_CMD "cd $SERVER_BASE && rm -rf ${target_dir}_old && mv $target_dir ${target_dir}_old"
        fi
    fi
    
    # 首次部署或Git失败，重新克隆
    info "从Git仓库克隆 $service_name..."
    if $SSH_CMD "cd $SERVER_BASE && git clone -b $GIT_BRANCH $GIT_REPO ${target_dir}_new 2>&1"; then
        # 克隆成功，替换旧目录
        $SSH_CMD "cd $SERVER_BASE && rm -rf ${target_dir}_old && mv ${target_dir} ${target_dir}_backup_$(date +%s) 2>/dev/null; mv ${target_dir}_new $target_dir"
        success "$service_name Git克隆部署成功"
        return 0
    else
        error "$service_name Git部署失败"
        return 1
    fi
}

# =============================================
# SCP部署 - 备选方案
# =============================================
deploy_with_scp() {
    local local_dir="$1"
    local remote_dir="$2"
    local service_name="$3"
    
    info "使用SCP方式部署 $service_name..."
    
    # 确保远程目录存在
    $SSH_CMD "mkdir -p $remote_dir"
    
    # 使用rsync同步（更高效，只同步差异）
    if $SSH_CMD "which rsync" > /dev/null 2>&1; then
        info "使用rsync同步文件..."
        if rsync -az --delete -e "ssh -o StrictHostKeyChecking=no" "$local_dir/" "$SERVER_USER@$SERVER_IP:$remote_dir/"; then
            success "$service_name SCP部署成功"
            return 0
        fi
    fi
    
    # 回退到scp
    info "使用scp同步文件..."
    if $SCP_CMD -r "$local_dir"/* "$SERVER_USER@$SERVER_IP:$remote_dir/"; then
        success "$service_name SCP部署成功"
        return 0
    else
        error "$service_name SCP部署失败"
        return 1
    fi
}

# =============================================
# 智能部署函数
# =============================================
smart_deploy() {
    local local_dir="$1"
    local remote_dir="$2"
    local service_name="$3"
    
    info "========== 部署 $service_name =========="
    
    # 优先尝试Git方式
    if deploy_with_git "$remote_dir" "$service_name"; then
        return 0
    fi
    
    # Git失败，使用SCP
    warn "Git部署失败，切换到SCP备选方案..."
    if deploy_with_scp "$local_dir" "$remote_dir" "$service_name"; then
        return 0
    fi
    
    error "$service_name 部署失败"
    return 1
}

# =============================================
# 重启服务
# =============================================
restart_service() {
    local service_name="$1"
    local service_cmd="$2"
    
    info "重启 $service_name..."
    if $SSH_CMD "$service_cmd"; then
        success "$service_name 重启成功"
        return 0
    else
        error "$service_name 重启失败"
        return 1
    fi
}

# =============================================
# 验证部署
# =============================================
verify_deployment() {
    info "验证部署状态..."
    
    # 检查PM2服务
    if $SSH_CMD "pm2 status"; then
        success "PM2服务运行正常"
    else
        warn "PM2服务状态检查失败"
    fi
    
    # 检查后端健康
    sleep 2
    local health_result=$($SSH_CMD "curl -s http://localhost:3001/api/health 2>/dev/null || echo '{\"status\":\"unknown\"}'")
    info "后端健康检查: $health_result"
}

# =============================================
# 同步环境配置文件
# =============================================
sync_env_files() {
    info "同步环境配置文件..."
    
    # 后端环境配置
    local backend_env="$BACKEND_LOCAL_DIR/.env.production"
    if [ -f "$backend_env" ]; then
        $SCP_CMD "$backend_env" "$SERVER_USER@$SERVER_IP:$BACKEND_DIR/.env"
        info "后端环境配置已同步"
    else
        warn "后端环境配置文件不存在: $backend_env"
    fi
    
    # 前端环境配置
    local frontend_env="$FRONTEND_LOCAL_DIR/.env.production"
    if [ -f "$frontend_env" ]; then
        $SCP_CMD "$frontend_env" "$SERVER_USER@$SERVER_IP:$FRONTEND_DIR/.env"
        info "前端环境配置已同步"
    else
        warn "前端环境配置文件不存在: $frontend_env"
    fi
}

# =============================================
# 主部署流程
# =============================================
main() {
    echo "=========================================="
    echo "  AITY-VIP Git优先智能部署脚本"
    echo "  $(date)"
    echo "=========================================="
    log "INFO" "========== 部署开始 =========="
    log "INFO" "日志文件: $LOG_FILE"
    
    # 1. 检查SSH连接
    if ! check_ssh; then
        error "SSH连接失败，无法部署"
        exit 1
    fi
    
    # 2. 构建前端
    echo ""
    info "========== 构建前端 =========="
    cd "$FRONTEND_LOCAL_DIR"
    if npm run build 2>&1 | tee -a "$LOG_FILE"; then
        success "前端构建成功"
    else
        error "前端构建失败"
        exit 1
    fi
    
    # 3. 部署前端
    echo ""
    if ! smart_deploy "$FRONTEND_LOCAL_DIR/dist" "$FRONTEND_DIR" "前端"; then
        error "前端部署失败，退出"
        exit 1
    fi
    
    # 4. 部署后端
    echo ""
    if ! smart_deploy "$BACKEND_LOCAL_DIR" "$BACKEND_DIR" "后端"; then
        error "后端部署失败，退出"
        exit 1
    fi
    
    # 5. 同步环境配置（始终使用SCP，因为可能包含敏感信息）
    echo ""
    sync_env_files
    
    # 6. 安装依赖并重启服务
    echo ""
    info "========== 安装后端依赖 =========="
    if $SSH_CMD "cd $BACKEND_DIR && npm install --production 2>&1 | tail -20"; then
        success "后端依赖安装成功"
    else
        warn "后端依赖安装可能有问题，继续..."
    fi
    
    echo ""
    restart_service "后端服务" "cd $BACKEND_DIR && pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js"
    
    # 7. 验证部署
    echo ""
    verify_deployment
    
    # 8. 检查Nginx
    echo ""
    info "========== 检查Nginx =========="
    if $SSH_CMD "nginx -t && systemctl reload nginx"; then
        success "Nginx配置正常并已重载"
    else
        warn "Nginx可能需要手动检查"
    fi
    
    echo ""
    echo "=========================================="
    success "🎉 部署完成！"
    echo "  前端: https://$HTTPS_DOMAIN:$HTTPS_PORT"
    echo "  后端: https://$HTTPS_DOMAIN:$HTTPS_PORT/api"
    echo "  日志: $LOG_FILE"
    echo "=========================================="
    
    log "INFO" "========== 部署完成 =========="
}

# 执行
main "$@"
