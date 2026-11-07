import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from openai import AsyncOpenAI  # generic HTTP client, also used for Groq and Gemini
from pydantic import BaseModel

load_dotenv()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("chatbot")


def env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


OPENAI_API_KEY = env("OPENAI_API_KEY")
GROQ_API_KEY = env("GROQ_API_KEY")
GEMINI_API_KEY = env("GEMINI_API_KEY")
OPENAI_MODEL = env("OPENAI_MODEL", "gpt-4o-mini")
GROQ_MODEL = env("GROQ_MODEL", "openai/gpt-oss-120b")
GEMINI_MODEL = env("GEMINI_MODEL", "gemini-3.8-flash")
SYSTEM_PROMPT = env(
    "SYSTEM_PROMPT",
    "You are Doraemon, the 22nd-century cat robot and AI Analyst! You are cheerful, witty, and an expert analyst. You break down complex questions, data, and scenarios into clear, structured, and insightful answers with helpful futuristic analytical perspective.",
)

# MONGODB_URI empty = keep history in server memory.
# Old names (MONGO_URL, DB_NAME) still work.
MONGODB_URI = env("MONGODB_URI") or env("MONGO_URL")
MONGODB_DATABASE = env("MONGODB_DATABASE") or env("DB_NAME") or "chatbot_db"
FRONTEND_ORIGINS = [
    o.strip()
    for o in env("FRONTEND_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if o.strip()
]


def is_real(key: str) -> bool:
    """False for empty values and for the placeholder text from .env.example."""
    return bool(key) and "your" not in key.lower()


# Backup providers, tried in this order when Puter (in the browser) fails:
# free ones first, the paid OpenAI key last.
PROVIDERS = []


def add_provider(name: str, key: str, model: str, base_url: str | None = None):
    if not is_real(key):
        return
    kwargs = {"api_key": key, "timeout": 12.0}
    if base_url:
        kwargs["base_url"] = base_url
    PROVIDERS.append({"name": name, "model": model, "client": AsyncOpenAI(**kwargs)})


# 1. Official OpenAI GPT (if OPENAI_API_KEY is provided in .env)
add_provider("GPT-4o", OPENAI_API_KEY, OPENAI_MODEL)

# 2. OpenAI GPT model (via your active API key)
add_provider("GPT", GROQ_API_KEY, GROQ_MODEL, "https://api.groq.com/openai/v1")

if not PROVIDERS:
    log.warning(
        "No AI provider key in backend/.env (GROQ_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY). "
        "Chat requests will fail until a key is added."
    )


# ---------------------------------------------------------------- storage


class MemoryStore:
    """Chat history kept in server memory. Lost when the backend restarts."""

    name = "memory"

    def __init__(self):
        self.items: dict[str, list[dict]] = {}

    async def add_pair(self, sid: str, user_text: str, reply: str) -> None:
        rows = self.items.setdefault(sid, [])
        rows.append({"role": "user", "content": user_text})
        rows.append({"role": "assistant", "content": reply})

    async def recent(self, sid: str, n: int = 20) -> list[dict]:
        return list(self.items.get(sid, []))[-n:]

    async def all(self, sid: str) -> list[dict]:
        return list(self.items.get(sid, []))[-500:]

    async def clear(self, sid: str) -> int:
        return len(self.items.pop(sid, []))


class MongoStore:
    name = "mongodb"

    def __init__(self, client, database: str):
        self.col = client[database]["messages"]

    async def add_pair(self, sid: str, user_text: str, reply: str) -> None:
        now = datetime.now(timezone.utc)
        await self.col.insert_many(
            [
                {"session_id": sid, "role": "user", "content": user_text, "created_at": now},
                {
                    "session_id": sid,
                    "role": "assistant",
                    "content": reply,
                    "created_at": now + timedelta(milliseconds=1),
                },
            ]
        )

    async def recent(self, sid: str, n: int = 20) -> list[dict]:
        cursor = self.col.find({"session_id": sid}).sort("created_at", -1).limit(n)
        rows = await cursor.to_list(length=n)
        rows.reverse()
        return [{"role": r["role"], "content": r["content"]} for r in rows]

    async def all(self, sid: str) -> list[dict]:
        cursor = self.col.find({"session_id": sid}).sort("created_at", 1)
        rows = await cursor.to_list(length=500)
        return [{"role": r["role"], "content": r["content"]} for r in rows]

    async def clear(self, sid: str) -> int:
        result = await self.col.delete_many({"session_id": sid})
        return result.deleted_count


store = MemoryStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Use MongoDB when it answers, otherwise keep history in memory."""
    global store
    if MONGODB_URI:
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        try:
            await client.admin.command("ping")
            store = MongoStore(client, MONGODB_DATABASE)
            log.info("History is stored in MongoDB (%s).", MONGODB_DATABASE)
        except Exception as e:
            log.warning("MongoDB is not reachable (%s). Keeping history in memory.", e)
    else:
        log.info("MONGODB_URI is empty. Keeping history in memory.")
    yield


app = FastAPI(title="AI Chatbot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    provider: str


class SaveRequest(BaseModel):
    session_id: str
    user_message: str
    reply: str


class HistoryItem(BaseModel):
    role: str
    content: str


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "AI Chatbot API is running",
        "providers": [p["name"] for p in PROVIDERS],
        "history_storage": store.name,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Answers using your configured providers: Groq, Gemini, or OpenAI."""
    user_text = req.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not PROVIDERS:
        raise HTTPException(
            status_code=503,
            detail="No AI provider configured. "
            "Add GROQ_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY to backend/.env.",
        )

    past = await store.recent(req.session_id, 20)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += past
    messages.append({"role": "user", "content": user_text})

    reply = None
    used = ""
    errors = []
    for p in PROVIDERS:
        try:
            completion = await p["client"].chat.completions.create(
                model=p["model"], messages=messages
            )
            reply = completion.choices[0].message.content or ""
            used = p["name"]
            break
        except Exception as e:  # try the next provider
            log.warning("%s failed: %s", p["name"], e)
            errors.append(f"{p['name']}: {e}")

    if reply is None:
        raise HTTPException(
            status_code=500, detail="All AI providers failed. " + " | ".join(errors)
        )

    await store.add_pair(req.session_id, user_text, reply)
    return ChatResponse(reply=reply, provider=used)


@app.post("/save")
async def save(req: SaveRequest):
    """The browser got its answer from Puter and sends the pair here to be stored."""
    if not req.user_message.strip() or not req.reply.strip():
        raise HTTPException(status_code=400, detail="Nothing to save")
    await store.add_pair(req.session_id, req.user_message.strip(), req.reply)
    return {"saved": 2}


@app.get("/history/{session_id}", response_model=List[HistoryItem])
async def history(session_id: str):
    return [HistoryItem(**m) for m in await store.all(session_id)]


@app.delete("/history/{session_id}")
async def clear_history(session_id: str):
    return {"deleted": await store.clear(session_id)}
