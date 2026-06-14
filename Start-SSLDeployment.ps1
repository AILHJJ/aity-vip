# SSL Certificate Auto-Deployment Script
# This script will upload and deploy the new SSL certificate
# Run this script in PowerShell as Administrator if needed

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SSL Certificate Auto Deployment" -ForegroundColor Cyan
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ServerIP = "124.221.119.134"
$ServerUser = "root"
$LocalCertPath = "d:\your-mcp-proxy\99-个人探索\AITY_VIP\aity88-online-new-cert\aity88.online_nginx"
$RemoteTmp = "/tmp"
$ScpPath = "C:\Windows\System32\OpenSSH\scp.exe"
$SshPath = "C:\Windows\System32\OpenSSH\ssh.exe"

Write-Host "[Step 1/4] Verifying local certificate files..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (-not (Test-Path "$LocalCertPath\aity88.online_bundle.crt")) {
    Write-Host "ERROR: Certificate file not found!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "$LocalCertPath\aity88.online.key")) {
    Write-Host "ERROR: Key file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Certificate files verified:" -ForegroundColor Green
Get-ChildItem "$LocalCertPath\*.crt", "$LocalCertPath\*.key" | Format-Table Name, Length -AutoSize
Write-Host ""

Write-Host "[Step 2/4] Uploading certificate to server..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "You will be prompted for the server password." -ForegroundColor Yellow
Write-Host ""

try {
    # Upload certificate file
    Write-Host "Uploading aity88.online_bundle.crt..." -ForegroundColor White
    & $ScpPath "$LocalCertPath\aity88.online_bundle.crt" "${ServerUser}@${ServerIP}:${RemoteTmp}/"
    if ($LASTEXITCODE -ne 0) { throw "Failed to upload certificate" }
    
    # Upload key file
    Write-Host "Uploading aity88.online.key..." -ForegroundColor White
    & $ScpPath "$LocalCertPath\aity88.online.key" "${ServerUser}@${ServerIP}:${RemoteTmp}/"
    if ($LASTEXITCODE -ne 0) { throw "Failed to upload key" }
    
    Write-Host "OK: Both files uploaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to upload files: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[Step 3/4] Uploading deployment scripts..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$ScriptPath = "d:\your-mcp-proxy\99-个人探索\AITY_VIP"

try {
    Write-Host "Uploading deploy-ssl-certificate.sh..." -ForegroundColor White
    & $ScpPath "$ScriptPath\deploy-ssl-certificate.sh" "${ServerUser}@${ServerIP}:/root/"
    if ($LASTEXITCODE -ne 0) { throw "Failed to upload deploy script" }
    
    Write-Host "Uploading deploy-rollback.sh..." -ForegroundColor White
    & $ScpPath "$ScriptPath\deploy-rollback.sh" "${ServerUser}@${ServerIP}:/root/"
    if ($LASTEXITCODE -ne 0) { throw "Failed to upload rollback script" }
    
    Write-Host "OK: Scripts uploaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to upload scripts: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[Step 4/4] Executing deployment on server..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "This will now SSH into the server and run the deployment." -ForegroundColor Yellow
Write-Host "The deployment will:" -ForegroundColor White
Write-Host "  ✓ Backup current certificate" -ForegroundColor White
Write-Host "  ✓ Install new certificate (valid until Sep 12, 2026)" -ForegroundColor White
Write-Host "  ✓ Set secure permissions" -ForegroundColor White
Write-Host "  ✓ Test Nginx configuration" -ForegroundColor White
Write-Host "  ✓ Reload Nginx (<1 second interruption)" -ForegroundColor White
Write-Host ""
Write-Host "If anything fails, automatic rollback will occur!" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Deployment cancelled by user." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Connecting to server and executing deployment..." -ForegroundColor Cyan
Write-Host ""

try {
    $deployCommand = "chmod +x /root/deploy-ssl-certificate.sh /root/deploy-rollback.sh && bash /root/deploy-ssl-certificate.sh"
    & $SshPath "${ServerUser}@${ServerIP}" $deployCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "New certificate is now active!" -ForegroundColor Green
        Write-Host "Valid until: September 12, 2026" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Test in browser: https://aity88.online" -ForegroundColor White
        Write-Host "  2. Check for green lock icon" -ForegroundColor White
        Write-Host "  3. Test your mini-program" -ForegroundColor White
        Write-Host ""
        Write-Host "Rollback command (if needed):" -ForegroundColor Yellow
        Write-Host "  ssh root@124.221.119.134 'bash /root/deploy-rollback.sh'" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host "  ❌ DEPLOYMENT FAILED!" -ForegroundColor Red
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Check the error output above." -ForegroundColor Red
        Write-Host "To manually rollback:" -ForegroundColor Yellow
        Write-Host "  ssh root@124.221.119.134 'bash /root/deploy-rollback.sh'" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR during deployment: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
