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
  --card: #fcfcfc;
  --radius-md: 6px;
  --radius-lg: 12px;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: "Hanken Grotesk", "Inter", "Segoe UI", sans-serif; background: var(--background); color: var(--foreground); }
.app { min-height: 100vh; padding: 16px; }
.wrap { max-width: 1100px; margin: 0 auto; display: grid; gap: 12px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px; }
.grid { display: grid; gap: 10px; }
.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (max-width: 880px) { .grid-2 { grid-template-columns: 1fr; } }
.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
input, textarea { width: 100%; border: 1px solid #d8d8d8; border-radius: var(--radius-md); padding: 9px 10px; font: inherit; background: var(--background); color: var(--foreground); }
label { display: grid; gap: 6px; font-size: 13px; color: var(--muted-foreground); }
.btn { appearance: none; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 9px 12px; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; color: inherit; background: var(--muted); }
.btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.btn-danger { background: #8f2626; color: #fff; border-color: #8f2626; }
.meta { color: var(--muted-foreground); font-size: 12px; }
.error { color: #a42424; font-size: 14px; }
.item { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px; display: grid; gap: 8px; }
.question-text { white-space: pre-wrap; line-height: 1.3; }
.small-note { display: inline-block; border: 1px solid var(--border); border-radius: 999px; padding: 2px 8px; font-size: 11px; color: var(--muted-foreground); background: var(--muted); }
`;

type Settings = {
  submissions_enabled: boolean;
  voting_enabled: boolean;
  max_votes_per_minute: number;
};

type Config = {
  title: string;
  submit_label: string;
  logo_url: string;
};

type Question = {
  id: string;
  text: string;
  submitter_name?: string | null;
  vote_count: number;
  created_at: string;
};

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const res = await fetch(path, { ...init, headers });
  const payload = await res.json().catch(() => ({}));
  return { res, payload } as const;
}

export default function QaAdminPage() {
  const [settings, setSettings] = useState<Settings>({ submissions_enabled: true, voting_enabled: true, max_votes_per_minute: 20 });
  const [config, setConfig] = useState<Config>({ title: "Live Q&A", submit_label: "Submit Question", logo_url: "" });
  const [questions, setQuestions] = useState<Question[]>([]);

  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const sorted = useMemo(() => [...questions].sort((a, b) => b.vote_count - a.vote_count || (a.created_at < b.created_at ? 1 : -1)), [questions]);

  async function loadAll() {
    setLoading(true);
    setError("");

    const [qRes, sRes, cRes] = await Promise.all([
      api("/api/qa/questions"),
      api("/api/qa/admin/settings"),
      api("/api/qa/admin/config"),
    ]);

    if (!qRes.res.ok || !qRes.payload?.ok) {
      setError(qRes.payload?.error || "Failed to load questions");
      setLoading(false);
      return;
    }

    setQuestions(qRes.payload.data?.questions || []);

    if (sRes.res.ok && sRes.payload?.ok) {
      setSettings(sRes.payload.data?.settings || settings);
    }

    if (cRes.res.ok && cRes.payload?.ok) {
      setConfig(cRes.payload.data?.config || config);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function saveSettings(next: Partial<Settings>) {
    setBusy(true);
    setError("");
    const { res, payload } = await api("/api/qa/admin/settings", {
      method: "POST",
      body: JSON.stringify(next),
    });
    setBusy(false);
    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Failed to save settings");
      return;
    }
    setSettings(payload.data.settings);
    setInfo("Settings saved.");
  }

  async function saveConfig() {
    setBusy(true);
    setError("");
    const { res, payload } = await api("/api/qa/admin/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
    setBusy(false);
    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Failed to save config");
      return;
    }
    setConfig(payload.data.config);
    setInfo("Branding saved.");
  }

  async function runExport() {
    setBusy(true);
    setError("");
    const { res, payload } = await api("/api/qa/admin/export", { method: "GET" });
    setBusy(false);
    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Export failed");
      return;
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(`qa-${stamp}.md`, payload.data.markdown, "text/markdown;charset=utf-8");
    downloadFile(`qa-${stamp}.csv`, payload.data.csv, "text/csv;charset=utf-8");
    downloadFile(`qa-${stamp}.json`, JSON.stringify(payload.data.json, null, 2), "application/json;charset=utf-8");
    setInfo("Exported markdown, csv, and json.");
  }

  async function resetEvent() {
    const ok = window.confirm("Reset all questions and votes?");
    if (!ok) return;

    setBusy(true);
    setError("");
    const { res, payload } = await api("/api/qa/admin/reset", {
      method: "POST",
      body: JSON.stringify({}),
    });
    setBusy(false);

    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Reset failed");
      return;
    }

    setInfo(`Reset complete. Removed ${payload.data.deleted_questions} questions and ${payload.data.deleted_votes} votes.`);
    await loadAll();
  }

  async function mergeQuestions(source: string, target: string) {
    if (!source || !target || source === target) {
      setError("Pick two different questions to merge.");
      return;
    }
    setBusy(true);
    setError("");
    const { res, payload } = await api("/api/qa/admin/merge", {
      method: "POST",
      body: JSON.stringify({ source_question_id: source, target_question_id: target }),
    });
    setBusy(false);

    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Merge failed");
      return;
    }

    setInfo(`Merged successfully. Unique votes: ${payload?.data?.vote_count}.`);
    setSourceId("");
    setTargetId("");
    await loadAll();
  }

  return (
    <main className="app">
      <style>{TOKENS}</style>
      <div className="wrap">
        <section className="card grid">
          <h1 style={{ margin: 0, fontSize: 26 }}>Q&A Admin</h1>
          <div className="row">
            <a className="btn" href="/qa/submit">Submit page</a>
            <a className="btn" href="/qa/vote">Vote page</a>
            <a className="btn" href="/qa/tv">TV page</a>
            <button className="btn" onClick={() => loadAll()} disabled={busy}>Refresh</button>
          </div>
        </section>

        <section className="card grid">
          <h2 style={{ margin: 0, fontSize: 20 }}>Branding</h2>
          <div className="grid grid-2">
            <label>
              Event title
              <input value={config.title} onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))} />
            </label>
            <label>
              Submit button label
              <input value={config.submit_label} onChange={(e) => setConfig((prev) => ({ ...prev, submit_label: e.target.value }))} />
            </label>
            <label>
              Logo URL
              <input value={config.logo_url} onChange={(e) => setConfig((prev) => ({ ...prev, logo_url: e.target.value }))} placeholder="https://..." />
            </label>
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={saveConfig} disabled={busy}>Save branding</button>
          </div>
        </section>

        <section className="card grid">
          <h2 style={{ margin: 0, fontSize: 20 }}>Runtime Controls</h2>
          <div className="row">
            <button className="btn" onClick={() => saveSettings({ submissions_enabled: !settings.submissions_enabled })} disabled={busy}>
              {settings.submissions_enabled ? "Disable submissions" : "Enable submissions"}
            </button>
            <button className="btn" onClick={() => saveSettings({ voting_enabled: !settings.voting_enabled })} disabled={busy}>
              {settings.voting_enabled ? "Disable voting" : "Enable voting"}
            </button>
          </div>
          <div className="meta">
            submissions: <strong>{String(settings.submissions_enabled)}</strong> · voting: <strong>{String(settings.voting_enabled)}</strong>
          </div>
        </section>

        <section className="card grid">
          <h2 style={{ margin: 0, fontSize: 20 }}>Export + Reset</h2>
          <div className="row">
            <button className="btn" onClick={runExport} disabled={busy}>Export .md/.csv/.json</button>
            <button className="btn btn-danger" onClick={resetEvent} disabled={busy}>Reset all data</button>
          </div>
        </section>

        <section className="card grid">
          <h2 style={{ margin: 0, fontSize: 20 }}>Merge Questions</h2>
          <div className="grid grid-2">
            <label>
              Source question (will be merged into target)
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid var(--input)", background: "var(--background)", color: "var(--foreground)" }}>
                <option value="">Select source...</option>
                {sorted.map((q) => (
                  <option key={`s-${q.id}`} value={q.id}>{q.vote_count} votes · {q.text.slice(0, 90)}</option>
                ))}
              </select>
            </label>
            <label>
              Target question (kept card)
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid var(--input)", background: "var(--background)", color: "var(--foreground)" }}>
                <option value="">Select target...</option>
                {sorted.map((q) => (
                  <option key={`t-${q.id}`} value={q.id}>{q.vote_count} votes · {q.text.slice(0, 90)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={() => mergeQuestions(sourceId, targetId)} disabled={busy}>Merge selected</button>
          </div>
        </section>

        <section className="card grid">
          <h2 style={{ margin: 0, fontSize: 20 }}>Questions</h2>
          {loading ? <p className="meta">Loading...</p> : null}
          {!loading && sorted.length === 0 ? <p className="meta">No questions yet</p> : null}
          {sorted.map((q) => (
            <article key={q.id} className="item">
              <div className="row">
                <span className="small-note">votes: {q.vote_count}</span>
                <span className="meta">id: {q.id.slice(0, 8)}</span>
              </div>
              <div className="question-text">{q.text}</div>
              {q.submitter_name ? <div className="meta">Asked by {q.submitter_name}</div> : null}
            </article>
          ))}
        </section>

        {error ? <div className="error">{error}</div> : null}
        {info ? <div className="meta">{info}</div> : null}
      </div>
    </main>
  );
}
