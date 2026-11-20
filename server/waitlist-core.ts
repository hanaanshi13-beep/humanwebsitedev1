// HUMAN waitlist — the server side of POST /api/waitlist.
//
// This module is the whole backend: it checks the request, validates every field again (the browser's checks are
// a courtesy, not a defence), and writes one row to Supabase with the project's SECRET key. It is plain Web-API
// TypeScript with no dependencies, so the same code runs in a Cloudflare Pages Function and in the Node tests.
//
// SAFETY RULES THIS FILE KEEPS
//   1. Off by default. Unless WAITLIST_ENABLED is exactly "true", every request is refused before its body is read
//      and nothing is contacted. The investor-facing site never sets it.
//   2. The secret key lives only in the server environment. It is sent to Supabase in request headers and appears
//      nowhere else: not in a response, not in a log line, not in an error.
//   3. Nothing personal is logged. Log lines carry an outcome, an HTTP status and at most a database error code.
//   4. The database is only ever asked to INSERT one row into one table. Nothing is read back.
//   5. A repeated email address gets the same answer as a new one, so the endpoint cannot be used to find out
//      whether somebody has registered.

export interface WaitlistEnv {
  WAITLIST_ENABLED?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
}

/** things the tests replace; production uses the defaults */
export interface Deps {
  fetch?: typeof fetch;
  now?: () => number;
  log?: (line: Record<string, unknown>) => void;
}

export const TABLE = 'waitlist_registrations';
export const MAX_BODY_BYTES = 8 * 1024;
const DB_TIMEOUT_MS = 8000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8; // per address, per window, per running instance (best effort; see docs/HUMAN-WAITLIST-BACKEND.md)

// These lists are the form's own options (src/data/portal.ts) and the table's CHECK constraints
// (supabase/waitlist_registrations.sql). The three must stay identical. Note the EN DASH in the age ranges.
export const AGE_GROUPS = ['18–24', '25–34', '35–44', '45–54', '55+', 'Prefer not to say'];
export const GENDERS = ['Female', 'Male', 'Other / self-describe', 'Prefer not to say'];
const SELF_DESCRIBE = 'Other / self-describe';
export const INTERESTS = ['preventive', 'fitness', 'hormonal', 'heart', 'energy', 'womens', 'mens', 'longevity', 'sleep', 'wellbeing'];
const ALLOWED_KEYS = [
  'firstName', 'ageGroup', 'gender', 'genderSelfDescribed', 'interests', 'email', 'mobile', 'city',
  'waitlistConsent', 'consentAt', 'privacyNoticeVersion',
];

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const E164 = /^\+\d{7,15}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERSION = /^[A-Za-z0-9._-]{1,64}$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;

export interface Row {
  first_name: string;
  age_group: string | null;
  gender: string | null;
  gender_self_described: string | null;
  interests: string[];
  email: string;
  mobile: string | null;
  city: string | null;
  waitlist_consent: true;
  consent_at_client: string | null;
  privacy_notice_version: string;
  idempotency_key: string | null;
}

type Checked = { ok: true; row: Row } | { ok: false; field: string };

const text = (v: unknown, max: number): string | null | undefined => {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  if (s === '') return null;
  if (s.length > max || CONTROL.test(s)) return undefined;
  return s;
};

/** Validates the submitted object and turns it into a database row. Never trusts the browser. */
export function validate(body: unknown, idempotencyKey: string | null, nowMs: number): Checked {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, field: 'body' };
  const b = body as Record<string, unknown>;
  for (const k of Object.keys(b)) if (!ALLOWED_KEYS.includes(k)) return { ok: false, field: 'unknown field' };

  // consent first: without it nothing else matters. It must be the boolean true, not "true", 1 or "on".
  if (b.waitlistConsent !== true) return { ok: false, field: 'waitlistConsent' };

  const firstName = text(b.firstName, 80);
  if (!firstName) return { ok: false, field: 'firstName' };

  const emailRaw = text(b.email, 254);
  if (!emailRaw || !EMAIL.test(emailRaw)) return { ok: false, field: 'email' };
  const email = emailRaw.toLowerCase();

  const ageGroup = text(b.ageGroup, 40);
  if (ageGroup === undefined || (ageGroup !== null && !AGE_GROUPS.includes(ageGroup))) return { ok: false, field: 'ageGroup' };

  const gender = text(b.gender, 40);
  if (gender === undefined || (gender !== null && !GENDERS.includes(gender))) return { ok: false, field: 'gender' };

  let self = text(b.genderSelfDescribed, 60);
  if (self === undefined) return { ok: false, field: 'genderSelfDescribed' };
  if (gender !== SELF_DESCRIBE) self = null; // only meaningful with that choice; otherwise it is not kept

  const interestsIn = b.interests ?? [];
  if (!Array.isArray(interestsIn) || interestsIn.length > INTERESTS.length) return { ok: false, field: 'interests' };
  const interests: string[] = [];
  for (const i of interestsIn) {
    if (typeof i !== 'string' || !INTERESTS.includes(i) || interests.includes(i)) return { ok: false, field: 'interests' };
    interests.push(i);
  }

  const mobile = text(b.mobile, 20);
  if (mobile === undefined || (mobile !== null && !E164.test(mobile))) return { ok: false, field: 'mobile' };

  const city = text(b.city, 80);
  if (city === undefined) return { ok: false, field: 'city' };

  const version = text(b.privacyNoticeVersion, 64);
  if (!version || !VERSION.test(version)) return { ok: false, field: 'privacyNoticeVersion' };

  // the visitor's clock is recorded only if it is a believable time; the database stamps its own in any case
  let consentAtClient: string | null = null;
  if (typeof b.consentAt === 'string' && b.consentAt.length <= 40) {
    const t = Date.parse(b.consentAt);
    if (Number.isFinite(t) && Math.abs(t - nowMs) <= 48 * 3600 * 1000) consentAtClient = new Date(t).toISOString();
  }

  return {
    ok: true,
    row: {
      first_name: firstName,
      age_group: ageGroup,
      gender,
      gender_self_described: self,
      interests,
      email,
      mobile,
      city,
      waitlist_consent: true,
      consent_at_client: consentAtClient,
      privacy_notice_version: version,
      idempotency_key: idempotencyKey,
    },
  };
}

const json = (status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      ...extra,
    },
  });

const RETRY = 'Your details are still here. Please try again in a moment.';

/** Reads at most `limit` bytes. Returns null if the body is larger, so an oversized request is never buffered. */
async function readCapped(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(all);
}

/** The project's own REST address, or null if SUPABASE_URL is not one. Stops a mistyped value sending data elsewhere. */
export function restBase(raw: string | undefined): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  const supabase = u.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/.test(u.hostname);
  const local = u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost'); // local tests only
  if (!supabase && !local) return null;
  return `${u.origin}/rest/v1/${TABLE}`;
}

// Best-effort throttle, per running instance. It slows a single noisy source; it is not a substitute for the
// rate-limiting rule described in the deployment notes. Addresses are held in memory only and never written out.
const hits = new Map<string, number[]>();
export function resetRateLimit() {
  hits.clear();
}
function limited(key: string, nowMs: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => nowMs - t < RATE_WINDOW_MS);
  recent.push(nowMs);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => nowMs - t < RATE_WINDOW_MS)) hits.delete(k);
  return recent.length > RATE_MAX;
}

export async function handleWaitlistRequest(request: Request, env: WaitlistEnv, deps: Deps = {}): Promise<Response> {
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((line) => console.log(JSON.stringify(line)));
  const done = (outcome: string, status: number, body: Record<string, unknown>, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) => {
    log({ event: 'waitlist', outcome, status, ...extra });
    return json(status, body, headers);
  };

  // 1. Off unless explicitly switched on. Nothing is read and nothing is contacted.
  if (env.WAITLIST_ENABLED !== 'true') return done('disabled', 503, { status: 'disabled' });

  // 2. Only a POST carries a registration. (A preflight gets no permission, so other sites cannot call this.)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
  if (request.method !== 'POST') return done('method', 405, { status: 'error' }, {}, { Allow: 'POST' });

  // 3. Only this website's own pages may submit: the browser states where the request came from.
  const self = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (origin !== self || (site !== null && site !== 'same-origin')) return done('origin', 403, { status: 'error' });

  // 4. Configuration must be complete before anything is accepted.
  const base = restBase(env.SUPABASE_URL);
  const key = (env.SUPABASE_SECRET_KEY ?? '').trim();
  if (!base || !key) return done('misconfigured', 503, { status: 'unavailable', userFacingMessage: RETRY });

  // 5. One source cannot flood the list.
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (limited(ip, now())) return done('rate', 429, { status: 'error', userFacingMessage: RETRY }, {}, { 'Retry-After': '600' });

  // 6. Shape and size of the request.
  if (!/^application\/json\b/i.test(request.headers.get('content-type') ?? '')) return done('type', 415, { status: 'error' });
  const raw = await readCapped(request, MAX_BODY_BYTES);
  if (raw === null) return done('size', 413, { status: 'error' });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return done('json', 400, { status: 'invalid' });
  }
  const idem = request.headers.get('idempotency-key');
  if (idem !== null && !UUID.test(idem)) return done('invalid', 400, { status: 'invalid' }, { field: 'Idempotency-Key' });

  // 7. Every field, again, on the server.
  const checked = validate(body, idem ? idem.toLowerCase() : null, now());
  if (!checked.ok) return done('invalid', 400, { status: 'invalid', userFacingMessage: 'Please check your details and try again.' }, { field: checked.field });

  // 8. One INSERT. Nothing is read back.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), DB_TIMEOUT_MS);
  let res: Response;
  try {
    res = await doFetch(base, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(checked.row),
      signal: ctrl.signal,
    });
  } catch {
    return done('db-unreachable', 502, { status: 'error', userFacingMessage: RETRY });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 201 || res.status === 200 || res.status === 204) return done('accepted', 200, { status: 'accepted' });

  // Only the error CODE is looked at or logged. The database's detail text can contain the submitted values.
  let code = '';
  let schemaNote: string | undefined;
  try {
    const err = (await res.json()) as { code?: unknown; message?: unknown };
    if (typeof err.code === 'string') code = err.code.slice(0, 16);
    // a wrong table or column name is a set-up mistake; its message names the column, never a person
    if (/^(PGRST|42)/.test(code) && typeof err.message === 'string') schemaNote = err.message.slice(0, 200);
  } catch {
    /* no readable error body */
  }
  // Already registered (same email), or the same submission sent twice: answer exactly as for a new registration.
  if (res.status === 409 || code === '23505') return done('accepted-existing', 200, { status: 'accepted' });
  return done('db-error', 502, { status: 'error', userFacingMessage: RETRY }, { db: res.status, code, ...(schemaNote ? { schemaNote } : {}) });
}
