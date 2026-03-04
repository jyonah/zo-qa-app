import { useEffect, useState } from "react";

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
.app { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.card { width: 100%; max-width: 560px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; display: grid; gap: 16px; }
.cta { display: grid; gap: 12px; }
.btn { appearance: none; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 14px; font-size: 16px; font-weight: 600; cursor: pointer; text-align: center; text-decoration: none; }
.btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.btn-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.meta { font-size: 12px; color: var(--muted-foreground); }
`;

async function fetchConfig() {
  const res = await fetch("/api/qa/questions", { headers: { Accept: "application/json" } });
  const payload = await res.json().catch(() => ({}));
  return payload?.data?.config || { title: "Live Q&A", submit_label: "Submit Question" };
}

export default function QaLandingPage() {
  const [title, setTitle] = useState("Live Q&A");
  const [submitLabel, setSubmitLabel] = useState("Submit Question");

  useEffect(() => {
    fetchConfig().then((cfg) => {
      setTitle(cfg?.title || "Live Q&A");
      setSubmitLabel(cfg?.submit_label || "Submit Question");
    });
  }, []);

  return (
    <main className="app">
      <style>{TOKENS}</style>
      <section className="card" aria-label="Q&A Home">
        <h1 style={{ margin: 0, fontSize: 28 }}>{title}</h1>
        <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.4 }}>Submit questions and vote in real time.</p>
        <div className="cta">
          <a className="btn btn-primary" href="/qa/submit">{submitLabel}</a>
          <a className="btn btn-secondary" href="/qa/vote">Upvote</a>
          <a className="btn" href="/qa/tv">TV view</a>
        </div>
      </section>
    </main>
  );
}
