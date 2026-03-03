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
html.dark {
  --background: #111111;
  --foreground: #eeeeee;
  --primary: #ffe0c2;
  --primary-foreground: #081a1b;
  --secondary: #393028;
  --secondary-foreground: #ffe0c2;
  --muted: #222222;
  --muted-foreground: #b4b4b4;
  --border: #201e18;
  --card: #191919;
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

function getEventId() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("event") || "default").toLowerCase().trim();
  const cleaned = raw.replace(/[^a-z0-9_-]/g, "").slice(0, 48);
  return cleaned || "default";
}

async function fetchConfig(eventId: string) {
  const res = await fetch(\`/api/qa/questions?event=\${encodeURIComponent(eventId)}\`, { headers: { Accept: "application/json", "x-qa-event-id": eventId } });
  const payload = await res.json().catch(() => ({}));
  return payload?.data?.config || { title: "Live Q&A", submit_label: "Submit Question" };
}

export default function QaLandingPage() {
  const [eventId, setEventId] = useState("default");
  const [title, setTitle] = useState("Live Q&A");
  const [submitLabel, setSubmitLabel] = useState("Submit Question");

  useEffect(() => {
    const event = getEventId();
    setEventId(event);
    fetchConfig(event).then((cfg) => {
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
          <a className="btn btn-primary" href={\`/qa/submit?event=\${encodeURIComponent(eventId)}\`}>{submitLabel}</a>
          <a className="btn btn-secondary" href={\`/qa/vote?event=\${encodeURIComponent(eventId)}\`}>Upvote</a>
          <a className="btn" href={\`/qa/tv?event=\${encodeURIComponent(eventId)}\`}>TV view</a>
        </div>
        <div className="meta">event: {eventId}</div>
      </section>
    </main>
  );
}
