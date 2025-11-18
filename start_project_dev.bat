@echo off
title Run DEV Environment

echo Starting BACKEND (Dev)...
cd /d "%~dp0backend"
set NODE_ENV=development
start "" /min cmd /c "npm run start:dev"

echo Starting FRONTEND (Dev)...
cd /d "%~dp0frontend"
start "" /min cmd /c "npm run dev"

echo Waiting for services to start...
timeout /t 8 >nul

echo Opening browser...
start http://localhost:5173

echo DEV environment running.
pause
