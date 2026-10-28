@echo off
rem Launchers live in Launchers\Windows; run from the project root.
cd /d "%~dp0..\.."

rem Already running? Just open the browser.
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul
if %errorlevel%==0 (
  echo Server is already running.
  start "" http://localhost:5173
  timeout /t 3 >nul
  exit /b
)

if not exist node_modules (
  echo Installing dependencies, first run only...
  call npm install
)

echo.
echo Starting Genki Study...
echo   This PC:   http://localhost:5173
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do echo   Phone/Mac: http://%%a:5173
echo.
echo Close this window or run "Stop Server.bat" to stop.
echo.

start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:5173"
call npm run dev
