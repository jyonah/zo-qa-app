import { useEffect, useMemo, useState } from "react";

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
.item { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); }
.question-text { white-space: pre-line; line-height: 1.35; }
.meta { font-size: 12px; color: var(--muted-foreground); }
.error { color: #a42424; font-size: 14px; }
.btn { appearance: none; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px 12px; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.btn-voted { background: var(--secondary); color: var(--secondary-foreground); border-color: var(--secondary); }
.btn-subtle { background: var(--muted); color: var(--foreground); }
`;

type Question = {
  id: string;
  text: string;
  created_at: string;
  submitter_name?: string | null;
  vote_count: number;
  voted_by_me: boolean;
};

type Settings = { voting_enabled: boolean };
type Config = { title: string };

const USER_KEY = "qa-user-id";

function getUserId() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(USER_KEY);
  if (existing) return existing;
  const generated = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(USER_KEY, generated);
  return generated;
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

export default function QaVotePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<Settings>({ voting_enabled: true });
  const [config, setConfig] = useState<Config>({ title: "Live Q&A" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const { res, payload } = await api("/api/qa/questions");
    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Failed to load questions");
      setLoading(false);
      return;
    }
    setQuestions(payload.data.questions || []);
    setSettings(payload.data.settings || settings);
    setConfig(payload.data.config || config);
    setError("");
    setLoading(false);
  }

  useEffect(() => {
    load();
    const timer = setInterval(() => load(), 3000);
    return () => clearInterval(timer);
  }, []);

  const sorted = useMemo(() => [...questions].sort((a, b) => b.vote_count - a.vote_count || (a.created_at < b.created_at ? 1 : -1)), [questions]);

  async function toggleVote(id: string) {
    const { res, payload } = await api(`/api/qa/questions/${id}/vote`, { method: "POST", body: JSON.stringify({}) });
    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Vote update failed");
      return;
    }
    await load();
  }

  return (
    <main className="app">
      <style>{TOKENS}</style>
      <div className="wrap">
        <section className="card">
          <h1 style={{ margin: 0, fontSize: 26 }}>{config.title} · Upvote</h1>
          <div className="row">
            <a className="btn btn-subtle" href="/qa/submit">Submit a question</a>
            <a className="btn btn-subtle" href="/qa/tv">TV view</a>
          </div>
          <p className="meta">Tap again to remove your vote.</p>
          {!settings.voting_enabled ? <p className="error">Voting is currently disabled.</p> : null}
          {error ? <div className="error">{error}</div> : null}
        </section>

        <section className="card">
          {loading ? <p className="meta">Loading...</p> : null}
          {!loading && sorted.length === 0 ? <p className="meta">No questions yet</p> : null}
          <div style={{ display: "grid", gap: 8 }}>
            {sorted.map((q) => (
              <article key={q.id} className="item">
                <div className="question-text">{q.text}</div>
                {q.submitter_name ? <div className="meta">Asked by {q.submitter_name}</div> : null}
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="meta">Votes: {q.vote_count}</span>
                  <button className={`btn ${q.voted_by_me ? "btn-voted" : "btn-primary"}`} onClick={() => toggleVote(q.id)} disabled={!settings.voting_enabled}>
                    {q.voted_by_me ? "Remove vote" : "Upvote"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
