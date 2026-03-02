@echo off
REM ======================================================
REM Windows Sandbox Startup Script
REM Launches the test script in PowerShell with admin rights
REM ======================================================

echo.
echo =============================================
echo   UnifiedPOS Clean Machine Test
echo   Starting in 5 seconds...
echo =============================================
echo.

timeout /t 5 /nobreak > nul

REM Run PowerShell test script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "C:\Testing\test-installer.ps1"
