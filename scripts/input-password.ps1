#!/usr/bin/env powershell
# 密码输入脚本 - 用于安全地输入SSH密码

$SERVER_IP = "124.221.119.134"
$SERVER_USER = "root"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  腾讯云服务器密码输入工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器信息:" -ForegroundColor Yellow
Write-Host "  IP地址: $SERVER_IP" -ForegroundColor White
Write-Host "  用户名: $SERVER_USER" -ForegroundColor White
Write-Host ""
Write-Host "请输入服务器密码:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "测试SSH连接..." -ForegroundColor Yellow

$sshCommand = "echo $passwordPlain | & 'C:\Windows\System32\OpenSSH\ssh.exe' -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} 'echo SSH连接成功'"

try {
    $result = Invoke-Expression $sshCommand
    if ($result -eq "SSH连接成功") {
        Write-Host "✓ SSH连接成功!" -ForegroundColor Green
        Write-Host ""
        Write-Host "密码验证通过，现在可以运行部署脚本了。" -ForegroundColor Green
        Write-Host ""
        
        # 保存密码到环境变量（临时）
        [Environment]::SetEnvironmentVariable("SSH_PASSWORD", $passwordPlain, "User")
        Write-Host "密码已保存到环境变量，部署脚本将自动使用。" -ForegroundColor Green
    } else {
        Write-Host "✗ SSH连接失败!" -ForegroundColor Red
        Write-Host "请检查密码是否正确。" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ SSH连接失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的解决方案:" -ForegroundColor Yellow
    Write-Host "1. 检查密码是否正确" -ForegroundColor White
    Write-Host "2. 确保服务器已启用密码登录" -ForegroundColor White
    Write-Host "3. 检查网络连接" -ForegroundColor White
}
