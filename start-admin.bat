@echo off
echo ====================================================
echo   OMS ADMIN MANAGEMENT SYSTEM (MDE)
echo   Central User & System Separation Management
echo ====================================================

echo Starting Admin Backend Server on http://127.0.0.1:5003...
start cmd /k "cd admin\backend && npm run dev"

echo Starting Admin Frontend React on http://127.0.0.1:5175...
start cmd /k "cd admin\frontend && npm run dev"

echo Admin Management Hub is running!
echo URL: http://localhost:5175
pause
