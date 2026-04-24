@echo off
chcp 936 >nul
echo ==========================================
echo  Claude Skills Installer
echo ==========================================
echo.

set SKILLS_DIR=%USERPROFILE%\.claude\skills
set SOURCE_DIR=%~dp0skills

REM Check if skills folder exists
if not exist "%SOURCE_DIR%" (
    echo [ERROR] skills folder not found!
    echo Please make sure 'skills' folder is in the same directory as this script.
    echo.
    pause
    exit /b 1
)

REM Create target directory
if not exist "%SKILLS_DIR%" (
    mkdir "%SKILLS_DIR%"
    echo [OK] Created: %SKILLS_DIR%
)

echo Installing skills...
echo.

REM Copy all skills
xcopy "%SOURCE_DIR%\*" "%SKILLS_DIR%\" /E /I /Y /Q

echo.
echo ==========================================
echo  Installation Complete!
echo ==========================================
echo.
echo Skills installed to: %SKILLS_DIR%
echo.
echo Installed skills:
dir /b "%SKILLS_DIR%"
echo.
echo You can now use these skills in Claude Code!
echo.
pause
