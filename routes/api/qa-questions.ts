import type { Context } from "hono";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const DATA_FILE = process.env.QA_DATA_FILE || "/home/workspace/qa-app/data/qa-store.json";
const LOCK_FILE = `${DATA_FILE}.lock`;
const TMP_FILE = `${DATA_FILE}.tmp`;
const MAX_TEXT_LENGTH = 280;
const SUBMISSION_THROTTLE_MS = 10_000;
const MAX_NAME_LENGTH = 80;

const DEFAULT_EVENT_ID = "default";
const DEFAULT_SETTINGS = {
  submissions_enabled: true,
  voting_enabled: true,
  max_votes_per_minute: 20,
};
const DEFAULT_CONFIG = {
  title: "Live Q&A",
  brand_name: "Q&A",
  submit_label: "Submit Question",
  logo_url: "",
};

type EventSettings = {
  submissions_enabled: boolean;
  voting_enabled: boolean;
  max_votes_per_minute: number;
};

type EventConfig = {
  title: string;
  brand_name: string;
  submit_label: string;
  logo_url: string;
};

type Question = {
  id: string;
  event_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  submitter_name?: string | null;
};

type Vote = {
  id: string;
  event_id: string;
  question_id: string;
  voter_id: string;
  created_at: string;
};

type Store = {
  questions: Question[];
  votes: Vote[];
  settings_by_event: Record<string, EventSettings>;
  config_by_event: Record<string, EventConfig>;
};

const defaultStore: Store = {
  questions: [],
  votes: [],
  settings_by_event: { [DEFAULT_EVENT_ID]: { ...DEFAULT_SETTINGS } },
  config_by_event: { [DEFAULT_EVENT_ID]: { ...DEFAULT_CONFIG } },
};

const json = (c: Context, status: number, body: Record<string, unknown>) => c.json(body, status);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim();
}

function sanitizeName(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim();
}

function sanitizeEventId(value: string | undefined | null): string {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return DEFAULT_EVENT_ID;
  const cleaned = raw.replace(/[^a-z0-9_-]/g, "").slice(0, 48);
  return cleaned || DEFAULT_EVENT_ID;
}

function getActorId(c: Context): string {
  return c.req.header("x-qa-user-id")?.trim() || "";
}

function getEventId(c: Context): string {
  const fromHeader = c.req.header("x-qa-event-id");
  const fromQuery = c.req.query("event");
  return sanitizeEventId(fromHeader || fromQuery || DEFAULT_EVENT_ID);
}

function normalizeSettings(input: Partial<EventSettings> | undefined): EventSettings {
  const maxVotes = Number(input?.max_votes_per_minute);
  return {
    submissions_enabled: input?.submissions_enabled !== false,
    voting_enabled: input?.voting_enabled !== false,
    max_votes_per_minute: Number.isFinite(maxVotes) && maxVotes > 0 ? Math.min(120, Math.round(maxVotes)) : DEFAULT_SETTINGS.max_votes_per_minute,
  };
}

function normalizeConfig(input: Partial<EventConfig> | undefined): EventConfig {
  const title = sanitizeText(input?.title).slice(0, 120);
  const brand = sanitizeText(input?.brand_name).slice(0, 80);
  const submitLabel = sanitizeText(input?.submit_label).slice(0, 80);
  const logo = typeof input?.logo_url === "string" ? input.logo_url.trim().slice(0, 500) : "";
  return {
    title: title || DEFAULT_CONFIG.title,
    brand_name: brand || DEFAULT_CONFIG.brand_name,
    submit_label: submitLabel || DEFAULT_CONFIG.submit_label,
    logo_url: logo,
  };
}

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

    const questionsRaw = Array.isArray(parsed.questions) ? parsed.questions : [];
    const votesRaw = Array.isArray(parsed.votes) ? parsed.votes : [];

    const questions: Question[] = questionsRaw.map((q: any) => ({
      id: String(q.id || randomUUID()),
      event_id: sanitizeEventId(q.event_id || DEFAULT_EVENT_ID),
      text: String(q.text || ""),
      created_at: String(q.created_at || new Date().toISOString()),
      updated_at: String(q.updated_at || new Date().toISOString()),
      created_by: String(q.created_by || ""),
      is_deleted: Boolean(q.is_deleted),
      submitter_name: typeof q.submitter_name === "string" ? q.submitter_name : null,
    }));

    const votes: Vote[] = votesRaw.map((v: any) => ({
      id: String(v.id || randomUUID()),
      event_id: sanitizeEventId(v.event_id || DEFAULT_EVENT_ID),
      question_id: String(v.question_id || ""),
      voter_id: String(v.voter_id || ""),
      created_at: String(v.created_at || new Date().toISOString()),
    }));

    const settingsByEvent: Record<string, EventSettings> = {};
    const configByEvent: Record<string, EventConfig> = {};

    if (parsed.settings_by_event && typeof parsed.settings_by_event === "object") {
      for (const [eventId, settings] of Object.entries(parsed.settings_by_event)) {
        settingsByEvent[sanitizeEventId(eventId)] = normalizeSettings(settings as Partial<EventSettings>);
      }
    } else {
      settingsByEvent[DEFAULT_EVENT_ID] = normalizeSettings(parsed.settings || undefined);
    }

    if (parsed.config_by_event && typeof parsed.config_by_event === "object") {
      for (const [eventId, conf] of Object.entries(parsed.config_by_event)) {
        configByEvent[sanitizeEventId(eventId)] = normalizeConfig(conf as Partial<EventConfig>);
      }
    }

    if (!settingsByEvent[DEFAULT_EVENT_ID]) settingsByEvent[DEFAULT_EVENT_ID] = { ...DEFAULT_SETTINGS };
    if (!configByEvent[DEFAULT_EVENT_ID]) configByEvent[DEFAULT_EVENT_ID] = { ...DEFAULT_CONFIG };

    return { questions, votes, settings_by_event: settingsByEvent, config_by_event: configByEvent };
  } catch {
    return { ...defaultStore };
  }
}

async function writeStore(store: Store): Promise<void> {
  await writeFile(TMP_FILE, JSON.stringify(store, null, 2), "utf8");
  await rename(TMP_FILE, DATA_FILE);
}

function getEventSettings(store: Store, eventId: string): EventSettings {
  return store.settings_by_event[eventId] || store.settings_by_event[DEFAULT_EVENT_ID] || { ...DEFAULT_SETTINGS };
}

function getEventConfig(store: Store, eventId: string): EventConfig {
  return store.config_by_event[eventId] || store.config_by_event[DEFAULT_EVENT_ID] || { ...DEFAULT_CONFIG };
}

function listVisible(store: Store, actorId: string, eventId: string) {
  const active = store.questions.filter((q) => !q.is_deleted && sanitizeEventId(q.event_id) === eventId);
  const questionIds = new Set(active.map((q) => q.id));
  const votesByQuestion = new Map<string, number>();
  const votedByActor = new Set<string>();

  for (const vote of store.votes) {
    if (sanitizeEventId(vote.event_id) !== eventId) continue;
    if (!questionIds.has(vote.question_id)) continue;
    votesByQuestion.set(vote.question_id, (votesByQuestion.get(vote.question_id) || 0) + 1);
    if (actorId && vote.voter_id === actorId) votedByActor.add(vote.question_id);
  }

  return active
    .map((q) => ({
      id: q.id,
      event_id: eventId,
      text: q.text,
      created_at: q.created_at,
      updated_at: q.updated_at,
      created_by: q.created_by,
      submitter_name: q.submitter_name || null,
      vote_count: votesByQuestion.get(q.id) || 0,
      voted_by_me: votedByActor.has(q.id),
    }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

function buildData(store: Store, actorId: string, eventId: string) {
  return {
    event_id: eventId,
    questions: listVisible(store, actorId, eventId),
    settings: getEventSettings(store, eventId),
    config: getEventConfig(store, eventId),
    server_time: new Date().toISOString(),
  };
}

async function handleGet(c: Context) {
  try {
    const actorId = getActorId(c);
    const eventId = getEventId(c);
    const store = await withLock(readStore);
    return json(c, 200, { ok: true, data: buildData(store, actorId, eventId) });
  } catch (err) {
    return json(c, 500, {
      ok: false,
      error: "Failed to load questions",
      detail: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

async function handlePost(c: Context) {
  const actorId = getActorId(c);
  const eventId = getEventId(c);
  if (!actorId) return json(c, 401, { ok: false, error: "Missing x-qa-user-id header" });

  let payload: { text?: string; submitter_name?: string };
  try {
    payload = await c.req.json();
  } catch {
    return json(c, 400, { ok: false, error: "Invalid JSON body" });
  }

  const text = sanitizeText(payload.text);
  const submitterName = sanitizeName(payload.submitter_name);
  if (!text) return json(c, 400, { ok: false, error: "Question text is required" });
  if (text.length > MAX_TEXT_LENGTH) return json(c, 400, { ok: false, error: `Question must be ${MAX_TEXT_LENGTH} characters or fewer` });
  if (submitterName.length > MAX_NAME_LENGTH) return json(c, 400, { ok: false, error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` });

  try {
    const result = await withLock(async () => {
      const store = await readStore();
      const settings = getEventSettings(store, eventId);
      if (!settings.submissions_enabled) return { type: "disabled" as const, store };

      const lastForUser = store.questions
        .filter((q) => sanitizeEventId(q.event_id) === eventId && q.created_by === actorId)
        .map((q) => q.created_at)
        .sort()
        .at(-1);

      if (lastForUser) {
        const elapsed = Date.now() - new Date(lastForUser).getTime();
        if (elapsed < SUBMISSION_THROTTLE_MS) {
          return { type: "throttled" as const, retry_after_ms: SUBMISSION_THROTTLE_MS - elapsed, store };
        }
      }

      const now = new Date().toISOString();
      const question: Question = {
        id: randomUUID(),
        event_id: eventId,
        text,
        created_at: now,
        updated_at: now,
        created_by: actorId,
        is_deleted: false,
        submitter_name: submitterName || null,
      };

      store.questions.push(question);
      if (!store.settings_by_event[eventId]) store.settings_by_event[eventId] = { ...getEventSettings(store, eventId) };
      if (!store.config_by_event[eventId]) store.config_by_event[eventId] = { ...getEventConfig(store, eventId) };

      await writeStore(store);
      return { type: "created" as const, store, question };
    });

    if (result.type === "disabled") return json(c, 403, { ok: false, error: "Submissions are currently disabled" });
    if (result.type === "throttled") {
      return json(c, 429, {
        ok: false,
        error: "You are submitting too quickly. Please retry shortly.",
        retry_after_ms: Math.ceil(result.retry_after_ms),
      });
    }

    return json(c, 201, { ok: true, data: { question: result.question, ...buildData(result.store, actorId, eventId) } });
  } catch (err) {
    return json(c, 500, {
      ok: false,
      error: "Failed to create question",
      detail: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

export default async (c: Context) => {
  if (c.req.method === "GET") return handleGet(c);
  if (c.req.method === "POST") return handlePost(c);
  return json(c, 405, { ok: false, error: "Method not allowed", allowed: ["GET", "POST"] });
};
