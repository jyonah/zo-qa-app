import type { Context } from "hono";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";

const DATA_FILE = process.env.QA_DATA_FILE || "/home/workspace/qa-app/data/qa-store.json";
const LOCK_FILE = `${DATA_FILE}.lock`;
const TMP_FILE = `${DATA_FILE}.tmp`;

const DEFAULT_SETTINGS = {
  submissions_enabled: true,
  voting_enabled: true,
  max_votes_per_minute: 20,
};

type EventSettings = {
  submissions_enabled: boolean;
  voting_enabled: boolean;
  max_votes_per_minute: number;
};

type Store = {
  questions: any[];
  votes: any[];
  settings: EventSettings;
  config: { title: string; submit_label: string; logo_url: string };
};

const json = (c: Context, status: number, body: Record<string, unknown>) => c.json(body, status);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withLock<T>(fn: () => Promise<T>, tries = 30): Promise<T> {
  await mkdir(DATA_FILE.replace(/\/[^/]+$/, ""), { recursive: true });
  for (let i = 0; i < tries; i += 1) {
    try {
      await writeFile(LOCK_FILE, String(process.pid), { flag: "wx" });
      try {
        return await fn();
      } finally {
        await rm(LOCK_FILE, { force: true });
      }
    } catch {
      await sleep(25 + i * 10);
    }
  }
  throw new Error("Store is busy. Please retry.");
}

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as any;
    return {
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
      settings: parsed.settings || { ...DEFAULT_SETTINGS },
      config: parsed.config || { title: "Live Q&A", submit_label: "Submit Question", logo_url: "" },
    };
  } catch {
    return { 
      questions: [], 
      votes: [], 
      settings: { ...DEFAULT_SETTINGS }, 
      config: { title: "Live Q&A", submit_label: "Submit Question", logo_url: "" } 
    };
  }
}

async function writeStore(store: Store): Promise<void> {
  await writeFile(TMP_FILE, JSON.stringify(store, null, 2), "utf8");
  await rename(TMP_FILE, DATA_FILE);
}

export default async (c: Context) => {
  if (c.req.method === "GET") {
    try {
      const store = await withLock(readStore);
      return json(c, 200, { ok: true, data: { settings: store.settings } });
    } catch (err) {
      return json(c, 500, { ok: false, error: "Failed to load settings", detail: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  if (c.req.method !== "POST") {
    return json(c, 405, { ok: false, error: "Method not allowed", allowed: ["GET", "POST"] });
  }

  let payload: Partial<EventSettings>;
  try {
    payload = await c.req.json();
  } catch {
    return json(c, 400, { ok: false, error: "Invalid JSON body" });
  }

  try {
    const store = await withLock(async () => {
      const current = await readStore();
      const maxVotes = Number(payload?.max_votes_per_minute);
      current.settings = {
        submissions_enabled: payload?.submissions_enabled !== false,
        voting_enabled: payload?.voting_enabled !== false,
        max_votes_per_minute: Number.isFinite(maxVotes) && maxVotes > 0 ? Math.min(120, Math.round(maxVotes)) : DEFAULT_SETTINGS.max_votes_per_minute,
      };
      await writeStore(current);
      return current;
    });

    return json(c, 200, { ok: true, data: { settings: store.settings } });
  } catch (err) {
    return json(c, 500, { ok: false, error: "Failed to update settings", detail: err instanceof Error ? err.message : "Unknown error" });
  }
};
