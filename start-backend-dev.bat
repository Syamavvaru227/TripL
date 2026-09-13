@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%tripl-backend"
set "PY=%BACKEND%\venv\Scripts\python.exe"

echo ==========================================
echo   TripL - Backend DEV (auto-reload :8000)
echo ==========================================

if not exist "%PY%" (
    echo [ERROR] Virtual environment not found:
    echo         %PY%
    echo.
    pause
    exit /b 1
)

netstat -ano | findstr "LISTENING" | findstr /c:":8000 " >nul 2>&1
if %errorlevel%==0 (
    echo [WARN] Port 8000 is already in use - the backend is probably running.
    echo        Run stop-servers.bat first if you want to restart it.
    echo.
    pause
    exit /b 1
)

cd /d "%BACKEND%"
echo Starting on http://localhost:8000   ^(API docs: /docs^)
echo Auto-reload ON, watching only the app\ folder.
echo Press Ctrl+C to stop.
echo.

rem --reload-dir app is the important part: without it uvicorn watches the
rem whole tripl-backend tree, so a pip install or any venv file change
rem restarts the server (and used to kill it).
"%PY%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app

echo.
echo [Backend DEV stopped] exit code %errorlevel%
pause
