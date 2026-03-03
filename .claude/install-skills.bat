@echo off
chcp 936 >nul 2>&1

echo ==========================================
echo  Skills Install Script v2.2
echo ==========================================
echo.

REM === Phase 1: Environment Check ===

echo [Check 1/5] Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js 16+
    echo Download: https://nodejs.org/
    goto :end_error
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%
echo.

echo [Check 2/5] npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found!
    goto :end_error
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm: %NPM_VERSION%
echo.

echo [Check 3/5] Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found! Please install Git
    echo Download: https://git-scm.com/download/win
    goto :end_error
)
echo [OK] Git installed
echo.

echo [Check 4/5] Network...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo [WARN] Cannot connect to GitHub
    echo If you need proxy: git config --global http.proxy http://host:port
) else (
    echo [OK] GitHub accessible
)
echo.

echo [Check 5/5] Skills CLI...
npx skills --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Skills CLI not installed, will use npx
    set USE_NPX=1
) else (
    echo [OK] Skills CLI ready
    set USE_NPX=0
)
echo.

REM === Phase 2: Configuration ===

echo ==========================================
echo   Configuration
echo ==========================================
echo.

echo [Config] npm mirror...
npm config set registry https://registry.npmmirror.com
echo [OK] Mirror configured
echo.

echo [Config] Git timeout...
git config --global http.lowSpeedLimit 0 2>nul
git config --global http.lowSpeedTime 999999 2>nul
echo [OK] Git configured
echo.

echo [Clean] npm cache...
npm cache clean --force >nul 2>&1
echo [OK] Cache cleared
echo.

REM === Phase 3: Show Installed Skills ===

echo ==========================================
echo   Installed Skills
echo ==========================================
echo.

echo Your installed skills:
echo.
dir /b "%USERPROFILE%\.claude\skills" 2>nul
echo.

REM === Phase 4: Instructions ===

echo ==========================================
echo   How to Install More Skills
echo ==========================================
echo.
echo Method 1: Clone from GitHub
echo   git clone https://github.com/anthropics/skills.git
echo   Copy folders to: %USERPROFILE%\.claude\skills\
echo.
echo Method 2: Download ZIP manually
echo   Visit: https://github.com/anthropics/skills
echo   Extract to: %USERPROFILE%\.claude\skills\
echo.
echo Method 3: Use npx (requires good network)
echo   npx skills add anthropics/skills@skill-name -g
echo.

echo ==========================================
echo   Environment Summary
echo ==========================================
echo.
echo Node.js:  %NODE_VERSION%
echo npm:      %NPM_VERSION%
echo Skills:   %USERPROFILE%\.claude\skills\
echo.

goto :end_success

:end_error
echo.
echo ==========================================
echo   Installation Failed
echo ==========================================
echo.
echo Please check the errors above and retry.
echo.
pause
exit /b 1

:end_success
echo.
pause
exit /b 0
