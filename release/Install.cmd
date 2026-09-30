@echo off
rem Double-click entry point. All installation logic lives in install.ps1.
rem Any arguments (for example -ExtensionId <id>) are passed through.
setlocal
cd /d "%~dp0"
echo Academic-clipper installer
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" (
  echo Installation FAILED ^(exit code %RC%^). Read the messages above, fix the problem and double-click Install.cmd again.
) else (
  echo Installer finished. See QUICKSTART.md for the next steps.
)
echo.
pause
exit /b %RC%
