@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Open RUSHMEA in Chrome.ps1"
if errorlevel 1 (
  echo.
  echo RUSHMEA could not be opened. Review the error above.
  pause
)
