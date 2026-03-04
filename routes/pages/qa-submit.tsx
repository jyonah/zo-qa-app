import { FormEvent, useEffect, useMemo, useState } from "react";

const TOKENS = `
:root {
  --background: #f9f9f9;
  --foreground: #202020;
  --primary: #644a40;
  --primary-foreground: #ffffff;
  --secondary: #ffdfb5;
  --secondary-foreground: #582d1d;
  --muted: #efefef;
  --muted-foreground: #646464;
  --border: #d8d8d8;
  --input: #d8d8d8;
  --card: #fcfcfc;
  --radius-md: 6px;
  --radius-lg: 12px;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: "Hanken Grotesk", "Inter", "Segoe UI", sans-serif; background: var(--background); color: var(--foreground); }
.app { min-height: 100vh; padding: 16px; }
.wrap { max-width: 760px; margin: 0 auto; display: grid; gap: 12px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px; }
.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
input, textarea { width: 100%; border: 1px solid var(--input); border-radius: var(--radius-md); padding: 10px 12px; font: inherit; background: var(--background); color: var(--foreground); }
textarea { min-height: 96px; resize: vertical; }
.btn { appearance: none; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px 12px; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.btn-subtle { background: var(--muted); color: var(--foreground); }
.question { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); }
.meta { font-size: 12px; color: var(--muted-foreground); }
.error { color: #a42424; font-size: 14px; }
`;

type Question = {
  id: string;
  text: string;
  created_at: string;
  created_by: string;
  vote_count: number;
  submitter_name?: string | null;
};

type Settings = { submissions_enabled: boolean };
type Config = { title: string; submit_label: string };

const USER_KEY = "qa-user-id";
const NAME_SESSION_KEY = "qa-submitter-name";

function getUserId() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(USER_KEY);
  if (existing) return existing;
  const generated = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(USER_KEY, generated);
  return generated;
}

function getSessionName() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(NAME_SESSION_KEY) || "";
}

function setSessionName(name: string) {
  if (typeof window === "undefined") return;
  if (!name) sessionStorage.removeItem(NAME_SESSION_KEY);
  else sessionStorage.setItem(NAME_SESSION_KEY, name);
}

async function api(path: string, init: RequestInit = {}) {
  const userId = getUserId();
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  headers.set("x-qa-user-id", userId);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const res = await fetch(path, { ...init, headers });
  const payload = await res.json().catch(() => ({}));
  return { res, payload } as const;
}

export default function QaSubmitPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<Settings>({ submissions_enabled: true });
  const [config, setConfig] = useState<Config>({ title: "Live Q&A", submit_label: "Submit Question" });

  const [text, setText] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const userId = useMemo(() => getUserId(), []);
  const mine = useMemo(() => questions.filter((q) => q.created_by === userId), [questions, userId]);

  async function load() {
    setLoading(true);
    setError("");
    const { res, payload } = await api("/api/qa/questions");
    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Failed to load questions");
      setLoading(false);
      return;
    }
    setQuestions(payload.data.questions || []);
    setSettings(payload.data.settings || settings);
    setConfig(payload.data.config || config);
    setLoading(false);
  }

  useEffect(() => {
    setSubmitterName(getSessionName());
    load();
  }, []);

  async function submitQuestion(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return setError("Question text is required");
    if (trimmed.length > 280) return setError("Question must be 280 characters or fewer");

    const trimmedName = submitterName.trim();
    setSaving(true);
    setError("");

    if (editingId) {
      const { res, payload } = await api(`/api/qa/questions/${editingId}`, { method: "PATCH", body: JSON.stringify({ text: trimmed }) });
      setSaving(false);
      if (!res.ok || !payload?.ok) return setError(payload?.error || "Failed to edit question");
      setText("");
      setEditingId(null);
      await load();
      return;
    }

    const { res, payload } = await api("/api/qa/questions", { method: "POST", body: JSON.stringify({ text: trimmed, submitter_name: trimmedName }) });
    setSaving(false);
    if (!res.ok || !payload?.ok) return setError(payload?.error || "Failed to submit question");

    setSessionName(trimmedName);
    window.location.href = "/qa/vote";
  }

  async function deleteQuestion(id: string) {
    setError("");
    const { res, payload } = await api(`/api/qa/questions/${id}`, { method: "DELETE" });
    if (!res.ok || !payload?.ok) return setError(payload?.error || "Failed to delete question");
    await load();
  }

  return (
    <main className="app">
      <style>{TOKENS}</style>
      <div className="wrap">
        <section className="card">
          <h1 style={{ margin: 0, fontSize: 26 }}>{config.title} · Submit</h1>
          <p className="meta">Ask one clear question. You can edit or delete your own entries below.</p>

          {!settings.submissions_enabled ? <div className="error">Submissions are currently disabled.</div> : null}

          <form onSubmit={submitQuestion} className="grid" style={{ display: "grid", gap: 10 }}>
            <input
              value={submitterName}
              onChange={(e) => {
                const value = e.target.value;
                setSubmitterName(value);
                setSessionName(value.trim());
              }}
              maxLength={80}
              placeholder="Your name (optional)"
              aria-label="Your name"
              disabled={!settings.submissions_enabled}
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              placeholder="Type your question"
              aria-label="Question text"
              disabled={!settings.submissions_enabled}
            />
            <div className="row" style={{ justifyContent: "space-between" }}>
              <a className="btn btn-subtle" href="/qa/vote">Upvote Questions</a>
              <div className="row">
                {editingId ? (
                  <button type="button" className="btn btn-subtle" onClick={() => { setEditingId(null); setText(""); }}>
                    Cancel
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary" disabled={saving || !settings.submissions_enabled}>
                  {editingId ? "Edit" : config.submit_label || "Submit Question"}
                </button>
              </div>
            </div>
          </form>

          {error ? <div className="error">{error}</div> : null}
        </section>

        <section className="card">
          <h2 style={{ margin: 0, fontSize: 20 }}>Your questions</h2>
          {loading ? <p className="meta">Loading...</p> : null}
          {!loading && mine.length === 0 ? <p className="meta">No questions yet</p> : null}
          <div style={{ display: "grid", gap: 8 }}>
            {mine.map((q) => (
              <article key={q.id} className="question">
                <div>{q.text}</div>
                {q.submitter_name ? <div className="meta">Asked by {q.submitter_name}</div> : null}
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="meta">Votes: {q.vote_count}</span>
                  <div className="row">
                    <button type="button" className="btn btn-subtle" onClick={() => { setEditingId(q.id); setText(q.text); }}>Edit</button>
                    <button type="button" className="btn" onClick={() => deleteQuestion(q.id)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
