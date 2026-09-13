@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%tripl-backend"
set "PY=%BACKEND%\venv\Scripts\python.exe"

echo ==========================================
echo   TripL - Backend (FastAPI :8000)
echo ==========================================

if not exist "%PY%" (
    echo [ERROR] Virtual environment not found:
    echo         %PY%
    echo.
    echo   Create it with:
    echo     python -m venv venv
    echo     venv\Scripts\python.exe -m pip install -r requirements.txt
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
echo Auto-reload is OFF for maximum stability. Press Ctrl+C to stop.
echo Need reload while editing code? Use start-backend-dev.bat instead.
echo.

rem NOTE: --reload is intentionally NOT passed here.
rem On this setup uvicorn's WatchFiles reloader was watching the whole
rem tripl-backend folder (including venv\), firing on unrelated file changes
rem and then failing to respawn the worker - which looks exactly like a crash
rem mid-demo. Run start-backend-dev.bat when you actually want reload.
"%PY%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000

echo.
echo [Backend stopped] exit code %errorlevel%
pause
