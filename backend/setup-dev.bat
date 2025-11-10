@echo off
echo 🚀 Starting SmartMess Development Setup...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "setup-dev.ps1"

echo.
echo Setup completed! Press any key to exit...
pause >nul
