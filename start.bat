@echo off
title CourseGen AI - localhost:3005
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting CourseGen AI on http://localhost:3005
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3005"
call npm run dev -- -p 3005
pause
