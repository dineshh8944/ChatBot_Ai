@echo off
cd /d "%~dp0backend"

if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing packages...
pip install -r requirements.txt

if not exist .env (
  copy .env.example .env >nul
  echo.
  echo A new .env file was created in the backend folder.
  echo Open it, put your keys after GROQ_API_KEY= and GEMINI_API_KEY=, save, then run this file again.
  echo.
  pause
  exit /b
)

echo Starting backend on http://localhost:8000
python -m uvicorn main:app --reload --port 8000
pause
