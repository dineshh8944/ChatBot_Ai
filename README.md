# AI Chatbot (React + FastAPI + Puter / Groq / Gemini / OpenAI + MongoDB)

One page: a picture answers inside a speech bubble. No login.

## How answers are made
1. **Puter.js** (in the browser, free, no API key). The first time, a Puter
   sign-in window opens. Sign in or create a free Puter account.
2. If Puter fails or has no credit, the **backend** tries, in this order:
   **Groq**, **Gemini**, **OpenAI**. A provider with an empty key is skipped.

A small line under the picture shows who answered.

## History storage
- `MONGODB_URI` set and MongoDB running: history is saved in MongoDB.
- `MONGODB_URI` empty, or MongoDB not running: history is kept in the backend's
  memory (lost when the backend restarts). The backend switches by itself and
  `http://localhost:8000` shows `history_storage`.

## Settings (`backend/.env`)
Keys, models, `MONGODB_URI`, `MONGODB_DATABASE`, `FRONTEND_ORIGIN`.
Never upload this file anywhere.

## Change the picture
Replace `frontend/public/hero.png` with your own image (same file name).

## Requirements
- Python 3.10+
- Node.js 18+
- MongoDB is optional (see above)

## Easy start on Windows
1. Double-click `start-backend.bat`.
2. Double-click `start-frontend.bat`.
3. Open http://localhost:5173

## Manual start

Backend (Terminal 1):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Frontend (Terminal 2):
```powershell
cd frontend
npm install
npm run dev
```

## API
- `GET /` shows backup providers and the history storage in use
- `POST /chat` {session_id, message} -> {reply, provider} (backup path)
- `POST /save` {session_id, user_message, reply} (stores a Puter answer)
- `GET /history/{session_id}`
- `DELETE /history/{session_id}`
