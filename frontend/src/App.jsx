import { useCallback, useEffect, useRef, useState } from "react";
import DoraemonRobot from "./DoraemonRobot";

// Vite bakes this into the production bundle, so set VITE_API_URL in Render
// before deploying. Keep localhost as the development fallback.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://ai-chatbot-7mox.onrender.com"
    : "http://localhost:8000")
).replace(/\/$/, "");

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getSessionId() {
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_session_id", id);
  }
  return id;
}

/* ---------- getting a reply from backend using .env API keys ---------- */

async function getReply(text, sessionId) {
  let res;
  try {
    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text }),
    });
  } catch {
    throw new Error(`Cannot reach the backend at ${API_URL}.`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  const data = await res.json();
  return { reply: data.reply, provider: data.provider };
}

/* ---------- history list ---------- */

function Message({ role, children }) {
  return (
    <div className={`msg ${role}`}>
      <span className="avatar" aria-hidden="true">
        {role === "user" ? "Y" : "AI"}
      </span>
      <div className="body">{children}</div>
    </div>
  );
}

/* ---------- picture + speech bubble ---------- */

function ReplyText({ text, animate, onTalking, onDone }) {
  const [count, setCount] = useState(
    animate && !prefersReducedMotion() ? 0 : text.length
  );
  const typing = count < text.length;

  useEffect(() => {
    if (!typing) return undefined;
    const step = Math.max(1, Math.ceil(text.length / 300));
    const id = setInterval(
      () => setCount((c) => Math.min(text.length, c + step)),
      18
    );
    return () => clearInterval(id);
  }, [typing, text]);

  useEffect(() => {
    onTalking(typing);
  }, [typing, onTalking]);

  useEffect(() => {
    if (animate && !typing) onDone();
  }, [animate, typing, onDone]);

  useEffect(() => () => onTalking(false), [onTalking]);

  return (
    <>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {typing && <span className="caret" aria-hidden="true" />}
      <span className="sr-only">{text}</span>
    </>
  );
}

function Stage({ messages, loading, error, onTyped }) {
  const [talking, setTalking] = useState(false);
  const [slow, setSlow] = useState(false);
  const lastIdx = messages.length - 1;
  const last = messages[lastIdx];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const reply = !loading && last && last.role === "assistant" ? last : null;
  const handleDone = useCallback(() => onTyped(lastIdx), [onTyped, lastIdx]);

  // After a few seconds, explain the Puter sign-in window
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return undefined;
    }
    const id = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(id);
  }, [loading]);

  let content;
  if (loading) {
    content = (
      <>
        <span className="dots" aria-label="Thinking">
          <i />
          <i />
          <i />
        </span>
        {slow && <span className="hint">Thinking... generating response.</span>}
      </>
    );
  } else if (reply) {
    content = (
      <ReplyText
        key={lastIdx}
        text={reply.content}
        animate={!!reply.fresh}
        onTalking={setTalking}
        onDone={handleDone}
      />
    );
  } else if (error) {
    content = error;
  } else {
    content = "Hi! I am Doraemon, your 22nd-century AI Robot Analyst! Ask me anything.";
  }

  const mode = loading ? "thinking" : talking ? "talking" : "idle";

  return (
    <section className="stage">
      {lastUser && <p className="you-chip">{lastUser.content}</p>}
      <div className="speech-wrap">
        <div className="speech" role="status">
          {content}
        </div>
        <span className="speech-tail" aria-hidden="true" />
      </div>
      <DoraemonRobot mode={mode} />
      {reply?.provider && <p className="via">Answered by {reply.provider}</p>}
    </section>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [sessionId] = useState(getSessionId);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // Load saved history on first load
  useEffect(() => {
    fetch(`${API_URL}/history/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("History request failed");
        return r.json();
      })
      .then((data) => setMessages(data))
      .catch(() => setError(`Cannot reach the backend at ${API_URL}.`));
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showHistory]);

  const markTyped = useCallback((idx) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === idx && m.fresh ? { ...m, fresh: false } : m))
    );
  }, []);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const { reply, provider } = await getReply(text, sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, fresh: true, provider },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    try {
      await fetch(`${API_URL}/history/${sessionId}`, { method: "DELETE" });
    } catch {
      /* ignore, still clear the screen */
    }
    setMessages([]);
    setError("");
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Doraemon AI Robot Analyst</h1>
        <button
          type="button"
          className="pill-btn"
          onClick={() => setShowHistory((s) => !s)}
        >
          {showHistory ? "Back to chat" : "History"}
        </button>
        <button type="button" className="pill-btn" onClick={clearChat}>
          Clear chat
        </button>
      </header>

      {showHistory ? (
        <main className="chat">
          {messages.length === 0 && !loading && (
            <p className="empty">No messages yet.</p>
          )}
          {messages.map((m, i) => (
            <Message key={i} role={m.role}>
              <div className="bubble">{m.content}</div>
            </Message>
          ))}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </main>
      ) : (
        <Stage
          messages={messages}
          loading={loading}
          error={error}
          onTyped={markTyped}
        />
      )}

      <form className="input-bar" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          aria-label="Message"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
