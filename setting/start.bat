@echo off
cd /d D:\Documents\setting
start "Backend" cmd /k "cd backend && ..\myenv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 2
start "Frontend" cmd /k "cd frontend && python -m http.server 3000"
exit