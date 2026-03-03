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
  --input: #d8d8d8;
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
  --input: #484848;
  --card: #191919;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Hanken Grotesk", "Inter", "Segoe UI", sans-serif;
  background: var(--background);
  color: var(--foreground);
}
.app { min-height: 100vh; padding: 24px; }
.wrap { max-width: 600px; margin: 0 auto; display: grid; gap: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.grid { display: grid; gap: 12px; }
input {
  width: 100%;
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font: inherit;
  font-size: 16px;
  background: var(--background);
  color: var(--foreground);
}
label { display: grid; gap: 8px; font-size: 14px; color: var(--muted-foreground); }
.btn {
  appearance: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  background: var(--muted);
}
.btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.meta { color: var(--muted-foreground); font-size: 13px; }
.error { color: #a42424; font-size: 14px; background: #fef2f2; padding: 12px; border-radius: var(--radius-md); }
.success { color: #166534; font-size: 14px; background: #f0fdf4; padding: 12px; border-radius: var(--radius-md); }
.optional { color: var(--muted-foreground); font-size: 12px; }
.url-preview { max-width: 200px; max-height: 60px; object-fit: contain; border-radius: var(--radius-md); border: 1px solid var(--border); margin-top: 8px; }
`;

type Config = {
  title: string;
  submit_label: string;
  logo_url: string;
};

function readEventFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("event") || "default").toLowerCase().trim();
  const cleaned = raw.replace(/[^a-z0-9_-]/g, "").slice(0, 48);
  return cleaned || "default";
}

function setEventInUrl(eventId: string) {
  const next = new URL(window.location.href);
  next.searchParams.set("event", eventId);
  window.history.replaceState({}, "", next.toString());
}

async function api(eventId: string, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  headers.set("x-qa-event-id", eventId);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const res = await fetch(path, { ...init, headers });
  const payload = await res.json().catch(() => ({}));
  return { res, payload } as const;
}

export default function QaSetupPage() {
  const [eventId, setEventId] = useState("default");
  const [config, setConfig] = useState<Config>({ title: "Live Q&A", submit_label: "Submit Question", logo_url: "" });
  const [logoOption, setLogoOption] = useState<"none" | "url">("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fromUrl = readEventFromUrl();
    setEventId(fromUrl);
    setEventInUrl(fromUrl);
    loadConfig(fromUrl);
  }, []);

  async function loadConfig(ev: string) {
    setLoading(true);
    setError("");
    const { res, payload } = await api(ev, "/api/qa/admin/config");
    setLoading(false);
    if (res.ok && payload?.ok && payload.data?.config) {
      setConfig(payload.data.config);
      if (payload.data.config.logo_url) {
        setLogoOption("url");
      }
    }
  }

  async function saveConfig() {
    setSaving(true);
    setError("");
    setSuccess(false);

    const configToSave = {
      ...config,
      logo_url: logoOption === "none" ? "" : config.logo_url,
    };

    const { res, payload } = await api(eventId, "/api/qa/admin/config", {
      method: "POST",
      body: JSON.stringify(configToSave),
    });
    setSaving(false);

    if (!res.ok || !payload?.ok) {
      setError(payload?.error || "Failed to save");
      return;
    }

    setConfig(payload.data.config);
    setSuccess(true);
  }

  const adminUrl = `/qa/admin?event=${encodeURIComponent(eventId)}`;
  const submitUrl = `/qa/submit?event=${encodeURIComponent(eventId)}`;
  const voteUrl = `/qa/vote?event=${encodeURIComponent(eventId)}`;
  const tvUrl = `/qa/tv?event=${encodeURIComponent(eventId)}`;

  return (
    <main className="app">
      <style>{TOKENS}</style>
      <div className="wrap">
        <section className="card">
          <h1 style={{ margin: "0 0 8px 0", fontSize: 28 }}>Set Up Your Q&A</h1>
          <p className="meta" style={{ margin: "0 0 20px 0" }}>Configure your event in a few quick steps.</p>

          {loading ? (
            <p className="meta">Loading...</p>
          ) : (
            <div className="grid">
              <label>
                Event name
                <input
                  value={config.title}
                  onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="My Event Q&A"
                />
                <span className="meta" style={{ marginTop: 4 }}>This appears as the heading on all pages. Used for exports too.</span>
              </label>

              <label>
                Submit button label <span className="optional">(optional)</span>
                <input
                  value={config.submit_label}
                  onChange={(e) => setConfig((prev) => ({ ...prev, submit_label: e.target.value }))}
                  placeholder="Submit Question"
                />
                <span className="meta" style={{ marginTop: 4 }}>Default: "Submit Question"</span>
              </label>

              <label>
                Logo <span className="optional">(optional)</span>
                <div style={{ display: "flex", gap: "12px", marginTop: 8 }}>
                  <label style={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="logo"
                      checked={logoOption === "none"}
                      onChange={() => setLogoOption("none")}
                      style={{ width: "auto" }}
                    />
                    <span>No logo</span>
                  </label>
                  <label style={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="logo"
                      checked={logoOption === "url"}
                      onChange={() => setLogoOption("url")}
                      style={{ width: "auto" }}
                    />
                    <span>Use image URL</span>
                  </label>
                </div>
                {logoOption === "url" && (
                  <div style={{ display: "grid", gap: "8px", marginTop: 8 }}>
                    <input
                      value={config.logo_url}
                      onChange={(e) => setConfig((prev) => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                    {config.logo_url && (
                      <img src={config.logo_url} alt="Logo preview" className="url-preview" onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "block")} />
                    )}
                  </div>
                )}
              </label>

              {error && <div className="error">{error}</div>}
              {success && <div className="success">Saved! Your Q&A is ready.</div>}

              <button className="btn btn-primary" onClick={saveConfig} disabled={saving}>
                {saving ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          )}
        </section>

        {success && (
          <section className="card">
            <h2 style={{ margin: "0 0 12px 0", fontSize: 20 }}>Share Your Q&A</h2>
            <p className="meta" style={{ marginBottom: 16 }}>Share these links with your attendees.</p>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <p className="meta" style={{ marginBottom: 4 }}>For attendees to submit questions:</p>
                <a className="btn" href={submitUrl} style={{ display: "inline-block" }}>{submitUrl}</a>
              </div>
              <div>
                <p className="meta" style={{ marginBottom: 4 }}>For attendees to vote on questions:</p>
                <a className="btn" href={voteUrl} style={{ display: "inline-block" }}>{voteUrl}</a>
              </div>
              <div>
                <p className="meta" style={{ marginBottom: 4 }}>For display on a projector/TV:</p>
                <a className="btn" href={tvUrl} style={{ display: "inline-block" }}>{tvUrl}</a>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <p className="meta" style={{ marginBottom: 8 }}>Need runtime controls (enable/disable submissions, export, reset)?</p>
              <a className="btn" href={adminUrl}>Open Admin Panel</a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
