@echo off
cd /d "%~dp0"
if not exist node_modules\electron\dist\electron.exe (
  echo Run npm ci in this folder first. Node.js is required for development only.
  pause
  exit /b 1
)
call npm.cmd start
if errorlevel 1 pause
