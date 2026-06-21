@echo off
echo Starting AlphaFlow...

start "AlphaFlow Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

start "AlphaFlow Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
pause
