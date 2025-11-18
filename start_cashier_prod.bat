@echo off
title Run PRODUCTION Environment

echo Starting BACKEND (Production)...
cd /d "%~dp0backend"
set NODE_ENV=production
start "" /min cmd /c "npm run start:prod"

echo Starting FRONTEND (Production build)...

cd /d "%~dp0frontend"

REM Build frontend once if needed
if not exist "dist" (
    echo First-time production build...
    npm run build
)

start "" /min cmd /c "npm run preview"

echo Waiting for services to start...
timeout /t 8 >nul

echo Opening browser...
start http://localhost:4173

echo PRODUCTION environment running.
pause