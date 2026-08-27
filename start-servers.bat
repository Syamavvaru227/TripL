@echo off
echo ==========================================
echo   TripL - Starting servers...
echo ==========================================
echo.

echo [1/2] Starting Backend (FastAPI on port 8000)...
cd /d "%~dp0tripl-backend"
start "TripL Backend" cmd /c "venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Frontend (Vite on port 5173)...
cd /d "%~dp0tripl-frontend"
start "TripL Frontend" cmd /c "npx vite --host"

echo.
echo ==========================================
echo   Both servers starting...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo ==========================================
echo.
echo Press any key to exit this window (servers keep running)...
pause >nul
