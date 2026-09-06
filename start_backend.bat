@echo off
echo Starting MoSJE AI FastAPI Backend on http://localhost:8000 ...
set PYTHONPATH=%cd%\backend
python -m uvicorn app.main:app --reload --port 8000
