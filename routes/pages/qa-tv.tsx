import { useEffect, useMemo, useRef, useState } from "react";

const TOKENS = `
:root {
  --background: #050506;
  --foreground: #fefefe;
  --primary: #ffe0c2;
  --primary-foreground: #081a1b;
  --secondary: #393028;
  --secondary-foreground: #ffe0c2;
  --muted: #1c1c1e;
  --muted-foreground: #a0a0a5;
  --border: #201e18;
  --card: #111113;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: "Hanken Grotesk", "Inter", "Segoe UI", sans-serif; background: var(--background); color: var(--foreground); }
.app { min-height: 100vh; display: flex; flex-direction: column; padding: 20px; }
.top { display: flex; align-items: flex-start; gap: 20px; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
.item { border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: grid; gap: 10px; background: var(--muted); }
.meta { color: var(--muted-foreground); font-size: 14px; }
.question-text { white-space: pre-line; line-height: 1.4; font-size: 18px; }
.ticker { position: fixed; bottom: 0; left: 0; right: 0; background: var(--muted); border-top: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; gap: 16px; overflow: hidden; }
.ticker-inner { display: flex; gap: 32px; animation: ticker-scroll 30s linear infinite; }
@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.dock { position: fixed; top: 20px; right: 20px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
.logo { max-width: 120px; max-height: 48px; object-fit: contain; }
`;

type Question = {
  id: string;
  text: string;
  submitter_name?: string | null;
  vote_count: number;
  created_at: string;
};

type Config = {
  title: string;
  logo_url?: string;
};

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
  const res = await fetch(path, { ...init, headers });
  const payload = await res.json().catch(() => ({}));
  return { res, payload } as const;
}

export default function QATV() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<Config>({ title: "Live Q&A" });
  const [loading, setLoading] = useState(true);

  const prevCountRef = useRef(0);

  async function load() {
    const { res, payload } = await api("/api/qa/questions");
    if (res.ok && payload?.ok) {
      setQuestions(payload.data.questions || []);
      setConfig(payload.data.config || config);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(() => load(), 2000);
    return () => clearInterval(timer);
  }, []);

  const sorted = useMemo(() => [...questions].sort((a, b) => b.vote_count - a.vote_count), [questions]);

  return (
    <main className="app">
      <style>{TOKENS}</style>

      {loading ? (
        <div className="card" style={{ textAlign: "center", marginTop: "40vh" }}>
          <p className="meta">Loading...</p>
        </div>
      ) : (
        <>
          <div className="top">
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 48, fontWeight: 700 }}>{config.title}</h1>
              <p className="meta" style={{ marginTop: 8 }}>{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="main">
            {sorted.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 60 }}>
                <p className="meta">No questions yet. Waiting for submissions...</p>
                <a href="/qa/submit" style={{ color: "var(--primary)", marginTop: 16, display: "inline-block" }}>Submit the first question →</a>
              </div>
            ) : (
              <>
                <section>
                  <h2 style={{ fontSize: 24, marginBottom: 12 }}>Top Voted</h2>
                  {sorted.slice(0, 3).map((q, i) => (
                    <article key={q.id} className="item" style={{ marginBottom: 12 }}>
                      <div className="question-text">{q.text}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {q.submitter_name ? <span className="meta">Asked by {q.submitter_name}</span> : <span />}
                        <span style={{ fontSize: 32, fontWeight: 700, color: "var(--primary)" }}>{q.vote_count}</span>
                      </div>
                    </article>
                  ))}
                </section>

                <section style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 24, marginBottom: 12 }}>All Questions</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {sorted.slice(3).map((q) => (
                      <article key={q.id} className="item">
                        <div className="question-text">{q.text}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          {q.submitter_name ? <span className="meta">Asked by {q.submitter_name}</span> : <span />}
                          <span style={{ fontSize: 20, fontWeight: 600 }}>{q.vote_count} votes</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {config.logo_url ? (
            <aside className="dock">
              <img src={config.logo_url} alt="Logo" className="logo" />
            </aside>
          ) : null}

          {sorted.length > 5 ? (
            <div className="ticker">
              <div className="ticker-inner">
                {sorted.map((q) => (
                  <span key={q.id} style={{ whiteSpace: "nowrap" }}>
                    {q.text.slice(0, 60)}{q.text.length > 60 ? "..." : ""} · <strong>{q.vote_count} votes</strong>
                  </span>
                ))}
                {sorted.map((q) => (
                  <span key={`${q.id}-dup`} style={{ whiteSpace: "nowrap" }}>
                    {q.text.slice(0, 60)}{q.text.length > 60 ? "..." : ""} · <strong>{q.vote_count} votes</strong>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
