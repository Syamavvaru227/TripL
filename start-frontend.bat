@echo off
setlocal
set "ROOT=%~dp0"
set "FRONTEND=%ROOT%tripl-frontend"
set "VITE=%FRONTEND%\node_modules\.bin\vite.cmd"

echo ==========================================
echo   TripL - Frontend (Vite :5173)
echo ==========================================

if not exist "%FRONTEND%\node_modules" (
    echo [ERROR] node_modules not found. Run this first:
    echo         cd "%FRONTEND%"
    echo         npm install
    echo.
    pause
    exit /b 1
)

if not exist "%VITE%" (
    echo [ERROR] Local vite binary not found:
    echo         %VITE%
    echo         Re-run "npm install" inside tripl-frontend.
    echo.
    pause
    exit /b 1
)

netstat -ano | findstr "LISTENING" | findstr /c:":5173 " >nul 2>&1
if %errorlevel%==0 (
    echo [WARN] Port 5173 is already in use - the frontend is probably running.
    echo        Run stop-servers.bat first if you want to restart it.
    echo.
    pause
    exit /b 1
)

cd /d "%FRONTEND%"
echo Starting on http://localhost:5173
echo Press Ctrl+C to stop.
echo.

rem Call the local vite.cmd directly so we never depend on npx/PATH resolution,
rem which is what silently fell back to the wrong Python/Node in the past.
call "%VITE%"

echo.
echo [Frontend stopped] exit code %errorlevel%
pause
