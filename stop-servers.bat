@echo off
echo Stopping TripL servers...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-servers.ps1"
ping -n 3 127.0.0.1 >nul
echo.
echo Done. Ports 8000 and 5173 should now be free.
pause
