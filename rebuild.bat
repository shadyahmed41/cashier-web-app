@echo off
title Run PRODUCTION Environment

:: --- Start BACKEND ---
echo Building and starting BACKEND (Production)...
cd /d "%~dp0backend"
set NODE_ENV=production
npm install
npm run build
start "" /min cmd /c "npm run start:prod"

:: --- Start FRONTEND ---
echo Building and starting FRONTEND (Production)...
cd /d "%~dp0frontend"
npm install
npm run build
start "" /min cmd /c "npm run preview"

:: --- Wait a few seconds and open browser ---
echo Waiting for services to start...
timeout /t 10 >nul
start http://localhost:4173

echo PRODUCTION environment running.
pause
