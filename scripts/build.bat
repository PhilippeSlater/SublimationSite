@echo off
echo.
echo Regeneration du catalogue de produits...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate-catalog.ps1"

echo.
echo Regeneration des tags/logos/backgrounds...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate-customization-data.ps1"

echo.
pause
