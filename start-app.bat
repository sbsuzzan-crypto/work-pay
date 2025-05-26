@echo off
title Worker Payroll Manager
echo.
echo ========================================
echo  Worker Payroll Manager
echo ========================================
echo.
echo Starting the application...
echo.

REM Try to start with Python first
python -m http.server 8080 2>nul
if %errorlevel% neq 0 (
    echo Python not found, trying alternative methods...
    echo.
    
    REM Try with Node.js
    npx serve . -p 8080 2>nul
    if %errorlevel% neq 0 (
        echo Node.js not found either.
        echo.
        echo Please install Python or Node.js to run the server.
        echo.
        echo Alternative: Open 'portable-app.html' directly in your browser
        echo.
        pause
        exit /b 1
    )
)

echo.
echo App is running at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo. 