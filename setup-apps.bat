@echo off
echo Setting up Worker Payroll Manager Apps...

echo.
echo 1. Installing Node.js dependencies...
npm install

echo.
echo 2. Building Windows app...
npm run build-win

echo.
echo 3. Your apps are ready!
echo - Windows app: dist/Worker Payroll Manager Setup.exe
echo - PWA: Open index.html in browser and click "Install App"

echo.
echo To run desktop app in development:
echo npm start

pause 