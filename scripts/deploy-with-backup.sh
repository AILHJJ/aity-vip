#!/bin/bash
###
 # @Author: fuli fuli@example.com
 # @Date: 2026-01-26 14:14:28
 # @LastEditors: fuli fuli@example.com
 # @LastEditTime: 2026-04-26 14:00:00
 # @FilePath: \your-mcp-proxy\AITY_VIP\scripts\deploy-with-backup.sh
 # @Description: 带备份和回滚功能的部署脚本
###

# 部署脚本 - 支持自动备份和快速回滚

# 默认配置
SERVER_IP="124.221.119.134"
SERVER_USER="root"
SERVER_KEY="AITY0127.pem"
FRONTEND_DIR="/var/www/aity-vip/frontend"
BACKEND_DIR="/var/www/aity-vip/backend"
BACKUP_ROOT_DIR="/var/www/aity-vip/backups"
MAX_BACKUPS=5  # 保留最近5个备份

# 路径配置
SCRIPT_DIR="$(dirname "$0")"
FRONTEND_LOCAL_DIR="$(dirname "$0")/../aity-uni-app-v2"
BACKEND_LOCAL_DIR="$(dirname "$0")/../backend"

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

# SSH命令封装
function ssh_cmd() {
    ssh -i "$SCRIPT_DIR/$SERVER_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# SCP命令封装
function scp_cmd() {
    scp -i "$SCRIPT_DIR/$SERVER_KEY" -o StrictHostKeyChecking=no -r "$1" "$2"
}

# 生成备份时间戳
function get_timestamp() {
    date +%Y%m%d_%H%M%S
}

# 创建备份
function create_backup() {
    local timestamp=$(get_timestamp)
    local backup_dir="$BACKUP_ROOT_DIR/backup_$timestamp"

    echo_yellow "\n📦 创建备份: $backup_dir"

    # 创建备份目录
    ssh_cmd "mkdir -p $backup_dir/{frontend,backend}"

    # 备份前端
    echo_yellow "备份前端文件..."
    if ssh_cmd "cp -r $FRONTEND_DIR $backup_dir/frontend/ 2>/dev/null || true"; then
        echo_green "✓ 前端备份成功"
    else
        echo_red "✗ 前端备份失败（可能是首次部署）"
    fi

    # 备份后端
    echo_yellow "备份后端文件..."
    if ssh_cmd "cp -r $BACKEND_DIR $backup_dir/backend/ 2>/dev/null || true"; then
        echo_green "✓ 后端备份成功"
    else
        echo_red "✗ 后端备份失败（可能是首次部署）"
    fi

    # 保存当前Git提交信息
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local commit_msg=$(git log -1 --pretty=%B 2>/dev/null || echo "unknown")
    ssh_cmd "echo '$current_commit' > $backup_dir/git_commit.txt"
    ssh_cmd "echo '$commit_msg' >> $backup_dir/git_commit.txt"

    # 清理旧备份
    echo_yellow "清理旧备份（保留最近 $MAX_BACKUPS 个）..."
    ssh_cmd "cd $BACKUP_ROOT_DIR && ls -t | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -rf"

    echo_green "✓ 备份完成: $backup_dir"
    return 0
}

# 列出所有备份
function list_backups() {
    echo_green "\n📋 可用备份列表："
    echo_green "=================="

    ssh_cmd "ls -lht $BACKUP_ROOT_DIR 2>/dev/null | grep '^d' | awk '{print \$9}' | while read backup; do
        if [ -n \"\$backup\" ]; then
            echo \"📁 \$backup\"
            if [ -f $BACKUP_ROOT_DIR/\$backup/git_commit.txt ]; then
                echo \"  Git提交信息:\"
                ssh_cmd \"cat $BACKUP_ROOT_DIR/\$backup/git_commit.txt\" | sed 's/^/    /'
            fi
            echo ''
        fi
    done"

    if [ $? -ne 0 ]; then
        echo_red "没有找到备份"
        return 1
    fi
}

# 回滚到指定备份
function rollback_to_backup() {
    local backup_name=$1

    if [ -z "$backup_name" ]; then
        echo_red "请指定备份名称"
        list_backups
        return 1
    fi

    local backup_dir="$BACKUP_ROOT_DIR/$backup_name"

    echo_yellow "\n⚠️  准备回滚到备份: $backup_name"
    echo_yellow "这将覆盖当前的生产环境代码！"
    echo_yellow "请确认要继续吗？(yes/no)"
    read -r confirm

    if [ "$confirm" != "yes" ]; then
        echo_yellow "已取消回滚"
        return 0
    fi

    echo_yellow "开始回滚..."

    # 恢复前端
    echo_yellow "恢复前端文件..."
    if ssh_cmd "rm -rf $FRONTEND_DIR/* && cp -r $backup_dir/frontend/* $FRONTEND_DIR/"; then
        echo_green "✓ 前端恢复成功"
    else
        echo_red "✗ 前端恢复失败"
        return 1
    fi

    # 恢复后端
    echo_yellow "恢复后端文件..."
    if ssh_cmd "rm -rf $BACKEND_DIR/* && cp -r $backup_dir/backend/* $BACKEND_DIR/"; then
        echo_green "✓ 后端恢复成功"
    else
        echo_red "✗ 后端恢复失败"
        return 1
    fi

    # 重启服务
    echo_yellow "重启服务..."
    if ssh_cmd "cd $BACKEND_DIR && pm2 restart ecosystem.config.js && systemctl reload nginx"; then
        echo_green "✓ 服务重启成功"
    else
        echo_red "✗ 服务重启失败"
        return 1
    fi

    echo_green "\n🎉 回滚完成！"
    echo_green "当前版本: $backup_name"
}

# 部署新版本
function deploy_new_version() {
    echo_green "\n🚀 开始部署新版本..."

    # 1. 创建备份
    if ! create_backup; then
        echo_red "备份失败，取消部署"
        return 1
    fi

    # 2. 构建前端
    echo_yellow "\n🔨 构建前端项目..."
    cd "$FRONTEND_LOCAL_DIR"
    if npm run build; then
        echo_green "✓ 前端构建成功"
    else
        echo_red "✗ 前端构建失败"
        return 1
    fi

    # 3. 部署前端
    echo_yellow "\n📤 部署前端到服务器..."
    ssh_cmd "mkdir -p $FRONTEND_DIR"
    if scp_cmd "dist/*" "$SERVER_USER@$SERVER_IP:$FRONTEND_DIR"; then
        echo_green "✓ 前端部署成功"
    else
        echo_red "✗ 前端部署失败"
        return 1
    fi

    # 4. 部署后端
    echo_yellow "\n📤 部署后端到服务器..."
    ssh_cmd "mkdir -p $BACKEND_DIR"
    if scp_cmd "$BACKEND_LOCAL_DIR/*" "$SERVER_USER@$SERVER_IP:$BACKEND_DIR"; then
        echo_green "✓ 后端部署成功"
    else
        echo_red "✗ 后端部署失败"
        return 1
    fi

    # 5. 安装依赖并重启服务
    echo_yellow "\n🔄 安装后端依赖并重启服务..."
    if ssh_cmd "cd $BACKEND_DIR && npm install --production && pm2 restart ecosystem.config.js && systemctl reload nginx"; then
        echo_green "✓ 服务重启成功"
    else
        echo_red "✗ 服务重启失败"
        return 1
    fi

    echo_green "\n🎉 部署完成！"
    echo_green "前端访问地址: https://aity88.online:8443"
    echo_green "后端API地址: https://aity88.online:8443/api"
}

# 显示使用帮助
function show_help() {
    echo_green "AITY VIP 部署脚本 - 支持备份和回滚"
    echo ""
    echo "用法："
    echo "  $0 deploy              - 部署新版本（自动创建备份）"
    echo "  $0 rollback <backup>   - 回滚到指定备份"
    echo "  $0 list                - 列出所有可用备份"
    echo "  $0 backup              - 手动创建备份"
    echo ""
    echo "示例："
    echo "  $0 deploy"
    echo "  $0 rollback backup_20260126_140000"
    echo "  $0 list"
}

# 主函数
function main() {
    local command=${1:-help}

    case $command in
        deploy)
            deploy_new_version
            ;;
        rollback)
            rollback_to_backup "$2"
            ;;
        list)
            list_backups
            ;;
        backup)
            create_backup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo_red "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
