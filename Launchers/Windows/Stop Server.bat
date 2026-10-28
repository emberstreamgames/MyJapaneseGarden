@echo off
set found=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":5173 .*LISTENING"') do (
  taskkill /PID %%p /F >nul 2>&1
  set found=1
)
if %found%==1 (echo Server stopped.) else (echo Server was not running.)
timeout /t 2 >nul
