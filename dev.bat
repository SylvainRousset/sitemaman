@echo off
echo ====================================
echo Nettoyage du cache...
echo ====================================
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo ====================================
echo Demarrage du serveur en mode leger
echo ====================================
set NODE_OPTIONS=--max-old-space-size=1024 --no-warnings
npm run dev:safe

pause
