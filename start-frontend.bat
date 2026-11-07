@echo off
cd /d "%~dp0frontend"

if not exist node_modules (
  echo Installing packages, this takes a minute...
  call npm install
)

echo Starting frontend. Open http://localhost:5173
call npm run dev
pause
