@echo off
echo ====================================================
echo   OMS MEDIA DEPARTMENT SYSTEM
echo   Developed by MDE - Matrix Data Egypt
echo ====================================================

echo Starting Media Backend Server on http://127.0.0.1:5002...
start cmd /k "cd backend && npm run dev"

echo Starting Media Frontend React on http://127.0.0.1:5174...
start cmd /k "cd frontend && npm run dev"

echo Media System is running!
echo Dashboard URL: http://localhost:5174
pause
