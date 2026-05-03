#!/bin/bash
###
 # @Author: fuli fuli@example.com
 # @Date: 2026-04-26 14:00:00
 # @LastEditors: fuli fuli@example.com
 # @LastEditTime: 2026-04-26 14:00:00
 # @FilePath: \your-mcp-proxy\AITY_VIP\scripts\rollback-git.sh
 # @Description: Git版本回滚脚本
###

# Git回滚脚本

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

# 显示最近的提交历史
function show_history() {
    echo_green "\n📋 最近的Git提交历史："
    echo_green "====================="
    git log --oneline --graph --decorate -10
}

# 回滚到指定版本
function rollback() {
    local commit_hash=$1

    if [ -z "$commit_hash" ]; then
        echo_red "请指定要回滚到的提交哈希值"
        show_history
        return 1
    fi

    echo_yellow "\n⚠️  准备回滚到提交: $commit_hash"
    echo_yellow "请确认要继续吗？(yes/no)"
    read -r confirm

    if [ "$confirm" != "yes" ]; then
        echo_yellow "已取消回滚"
        return 0
    fi

    echo_yellow "开始回滚..."

    # 保存当前更改
    local current_branch=$(git branch --show-current)
    local backup_branch="backup_before_rollback_$(date +%Y%m%d_%H%M%S)"

    echo_yellow "创建备份分支: $backup_branch"
    git branch "$backup_branch"

    # 执行回滚
    if git reset --hard "$commit_hash"; then
        echo_green "✓ 代码回滚成功"
        echo_green "备份分支: $backup_branch"

        echo_yellow "\n下一步操作："
        echo_yellow "1. 检查代码: git status"
        echo_yellow "2. 重新部署: ./scripts/deploy.sh"
        echo_yellow "3. 如需恢复: git reset --hard $current_branch"
        echo_yellow "4. 或使用备份分支: git checkout $backup_branch"
    else
        echo_red "✗ 回滚失败"
        return 1
    fi
}

# 撤销指定提交（保留历史）
function revert_commit() {
    local commit_hash=$1

    if [ -z "$commit_hash" ]; then
        echo_red "请指定要撤销的提交哈希值"
        show_history
        return 1
    fi

    echo_yellow "\n撤销提交: $commit_hash"
    echo_yellow "这将创建一个新的提交来撤销指定的更改..."
    echo_yellow "请确认要继续吗？(yes/no)"
    read -r confirm

    if [ "$confirm" != "yes" ]; then
        echo_yellow "已取消操作"
        return 0
    fi

    if git revert "$commit_hash" --no-edit; then
        echo_green "✓ 撤销成功"
        echo_yellow "\n下一步操作："
        echo_yellow "1. 检查更改: git status"
        echo_yellow "2. 重新部署: ./scripts/deploy.sh"
    else
        echo_red "✗ 撤销失败"
        echo_yellow "如有冲突，请解决后手动完成:"
        echo_yellow "1. git status"
        echo_yellow "2. 解决冲突文件"
        echo_yellow "3. git add <resolved-files>"
        echo_yellow "4. git revert --continue"
        return 1
    fi
}

# 显示使用帮助
function show_help() {
    echo_green "Git版本回滚脚本"
    echo ""
    echo "用法："
    echo "  $0 list                      - 显示最近10个提交"
    echo "  $0 rollback <commit-hash>    - 硬回滚到指定提交（会丢弃后续提交）"
    echo "  $0 revert <commit-hash>      - 撤销指定提交（保留历史记录）"
    echo ""
    echo "示例："
    echo "  $0 list"
    echo "  $0 rollback 7ced123"
    echo "  $0 revert 2a1c06c"
    echo ""
    echo "说明："
    echo "  rollback: 将代码完全回退到指定提交，后续提交会被丢弃"
    echo "  revert:   创建新提交来撤销指定提交的更改，保留完整历史"
}

# 主函数
function main() {
    local command=${1:-help}

    case $command in
        list|ls)
            show_history
            ;;
        rollback)
            rollback "$2"
            ;;
        revert)
            revert_commit "$2"
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
