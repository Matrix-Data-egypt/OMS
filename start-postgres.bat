@echo off
echo ====================================================
echo   Starting OMS PostgreSQL 18 Service (Native Windows)
echo   MDE - Matrix Data Egypt
echo ====================================================
net start postgresql-x64-18
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL service started successfully on port 5432!
) else (
    echo [NOTE] If you got Access Denied, please right-click this file and select 'Run as Administrator'.
)
pause
