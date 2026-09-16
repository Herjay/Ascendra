@echo off
title Ascendra Local Launcher
echo ===================================================
echo   Starting Ascendra (Offline-First Tracker)
echo   Local URL: http://localhost:8080
echo ===================================================
echo.
start "" http://localhost:8080
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
