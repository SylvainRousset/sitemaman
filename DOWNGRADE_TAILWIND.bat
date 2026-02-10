@echo off
echo ====================================
echo DOWNGRADE TAILWIND v4 vers v3
echo ====================================
echo.
echo Tailwind v4 est trop recent et cause des fuites memoire.
echo Cette operation va downgrader vers la v3 stable.
echo.
pause

echo.
echo [1/3] Suppression de Tailwind v4...
call npm uninstall tailwindcss @tailwindcss/postcss

echo.
echo [2/3] Installation de Tailwind v3...
call npm install tailwindcss@^3.4.0 postcss@^8.4.32 autoprefixer@^10.4.16 --save-dev

echo.
echo [3/3] Nettoyer le cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo ====================================
echo TERMINE!
echo ====================================
echo.
echo IMPORTANT: Vous devez maintenant creer un fichier tailwind.config.js
echo Ouvrez Claude Code et demandez de creer la config Tailwind v3
echo.
pause
