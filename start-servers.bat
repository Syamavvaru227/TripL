@echo off
echo ==========================================
echo   TripL - Starting both servers
echo ==========================================
echo.

rem "cmd /k" keeps each window open, so if a server fails to start you can
rem actually read the error instead of the window vanishing (= "a crash").
start "TripL Backend  :8000" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "TripL Frontend :5173" cmd /k "%~dp0start-frontend.bat"

echo Backend:  http://localhost:8000   (docs at /docs)
echo Frontend: http://localhost:5173
echo.
echo Backend runs with auto-reload OFF, so it stays up during your demo.
echo While editing backend code, use start-backend-dev.bat instead.
echo.
echo Two windows opened. Close them, or run stop-servers.bat, to stop TripL.
echo.
pause
