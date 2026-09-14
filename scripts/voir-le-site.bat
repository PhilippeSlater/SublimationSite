@echo off
echo Demarrage du site en local...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serveur-local.ps1"

echo.
echo Le serveur s'est arrete ou n'a pas pu demarrer (voir le message ci-dessus).
pause
