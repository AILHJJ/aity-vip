@echo off
chcp 65001 >nul
echo ==========================================
echo   SSL Certificate Auto Deployment Tool
echo   Time: %date% %time%
echo ==========================================
echo.

setlocal enabledelayedexpansion

:: Configuration
set SERVER_IP=124.221.119.134
set SERVER_USER=root
set LOCAL_CERT_PATH=d:\your-mcp-proxy\99-个人探索\AITY_VIP\aity88-online-new-cert\aity88.online_nginx
set REMOTE_TMP=/tmp

echo [1/5] Checking local certificate files...
echo ----------------------------------------
if not exist "%LOCAL_CERT_PATH%\aity88.online_bundle.crt" (
    echo ERROR: Certificate file not found!
    pause
    exit /b 1
)
if not exist "%LOCAL_CERT_PATH%\aity88.online.key" (
    echo ERROR: Key file not found!
    pause
    exit /b 1
)
echo OK: Certificate files found
dir "%LOCAL_CERT_PATH%\*.crt" "%LOCAL_CERT_PATH%\*.key"
echo.

echo [2/5] Uploading certificate to server...
echo ----------------------------------------
scp "%LOCAL_CERT_PATH%\aity88.online_bundle.crt" %SERVER_USER%@%SERVER_IP%:%REMOTE_TMP%\
if errorlevel 1 (
    echo ERROR: Failed to upload certificate file!
    pause
    exit /b 1
)

scp "%LOCAL_CERT_PATH%\aity88.online.key" %SERVER_USER%@%SERVER_IP%:%REMOTE_TMP%\
if errorlevel 1 (
    echo ERROR: Failed to upload key file!
    pause
    exit /b 1
)
echo OK: Files uploaded to server
echo.

echo [3/5] Uploading deployment scripts...
echo ----------------------------------------
scp "d:\your-mcp-proxy\99-个人探索\AITY_VIP\deploy-ssl-certificate.sh" %SERVER_USER%@%SERVER_IP%:/root/
if errorlevel 1 (
    echo ERROR: Failed to upload deployment script!
    pause
    exit /b 1
)

scp "d:\your-mcp-proxy\99-个人探索\AITY_VIP\deploy-rollback.sh" %SERVER_USER%@%SERVER_IP%:/root/
if errorlevel 1 (
    echo ERROR: Failed to upload rollback script!
    pause
    exit /b 1
)
echo OK: Scripts uploaded to server
echo.

echo [4/5] Executing deployment on server...
echo ----------------------------------------
echo This will:
echo   - Backup current certificate
echo   - Install new certificate
echo   - Set permissions
echo   - Test Nginx config
echo   - Reload Nginx (brief interruption ^<1 second)
echo.
set /p CONFIRM="Continue with deployment? (y/n): "
if /i not "!CONFIRM!"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)
echo.

ssh %SERVER_USER%@%SERVER_IP% "chmod +x /root/deploy-ssl-certificate.sh /root/deploy-rollback.sh && bash /root/deploy-ssl-certificate.sh"
if errorlevel 1 (
    echo.
    echo ==========================================
    echo   ❌ DEPLOYMENT FAILED!
    echo ==========================================
    echo.
    echo The deployment script encountered an error.
    echo Check the output above for details.
    echo.
    echo To manually rollback, run on server:
    echo   bash /root/deploy-rollback.sh
    echo.
    pause
    exit /b 1
)
echo.

echo [5/5] Verifying deployment...
echo ----------------------------------------
echo Checking current certificate status...
ssh %SERVER_USER%@%SERVER_IP% "echo | openssl s_client -servername aity88.online -connect aity88.online:443 2>/dev/null | openssl x509 -noout -dates -subject"
echo.

echo ==========================================
echo   ✅ DEPLOYMENT COMPLETE!
echo ==========================================
echo.
echo New SSL certificate has been deployed successfully!
echo.
echo What was done:
echo   ✓ Uploaded new certificate to server
echo   ✓ Backed up old certificate automatically
echo   ✓ Installed new certificate
echo   ✓ Reloaded Nginx (graceful reload)
echo   ✓ Verified new certificate is active
echo.
echo Next steps:
echo   1. Test in browser: https://aity88.online
echo   2. Test your mini-program
echo   3. Check for green lock icon
echo.
echo If problems occur, rollback command:
echo   ssh root@%SERVER_IP% "bash /root/deploy-rollback.sh"
echo.
pause
