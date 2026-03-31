@echo off
REM Simple deployment script for NewsAuth Backend to Azure

set APP_NAME=news-ai-backend-final
set RESOURCE_GROUP=news-ai
set BACKEND_DIR=D:\News\backend

echo.
echo ================================================
echo   NewsAuth Backend - Deploying to Azure
echo ================================================
echo.

REM Step 1: Change to backend directory
echo Step 1: Changing to backend directory...
cd /d %BACKEND_DIR%
if errorlevel 1 (
    echo ERROR: Could not change to %BACKEND_DIR%
    exit /b 1
)
echo Done.
echo.

REM Step 2: Check git status
echo Step 2: Checking git status...
git status
echo.

REM Step 3: Display instructions
echo Step 3: Deployment Instructions
echo ================================
echo.
echo To complete deployment:
echo.
echo 1. Open Azure Portal and go to: %APP_NAME%
echo    URL: https://portal.azure.com
echo.
echo 2. Go to "Deployment Center" and copy the Git Clone URL
echo.
echo 3. Run these commands:
echo    git remote add azure [PASTE_GIT_URL_HERE]
echo    git push azure master
echo.
echo 4. Monitor deployment in:
echo    Azure Portal ^> %APP_NAME% ^> Deployment Center ^> Logs
echo.
echo Once deployed, your API will be at:
echo    https://%APP_NAME%.azurewebsites.net/api/analyze
echo.
