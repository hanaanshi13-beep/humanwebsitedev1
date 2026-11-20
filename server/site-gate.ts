// HUMAN — site-wide password gate.
//
// Runs in front of EVERYTHING the site serves on Cloudflare Pages: pages, images, fonts, scripts, robots.txt and the
// /api function. Nothing is public. A visitor enters one shared password on a small sign-in page and receives a
// signed session cookie; every later request is checked against it on the server.
//
// RULES THIS FILE KEEPS
//   1. Fail closed. If SITE_PASSWORD is missing or shorter than 12 characters, or anything here throws, the answer is
//      an error page. The site is never served unprotected.
//   2. The password exists only in the server environment. It is never in a page, a cookie, a log line or the
//      repository. The cookie holds an expiry time and a signature, nothing else.
//   3. Nothing sent to a visitor who has not signed in may be stored by any cache.
//   4. No personal data is logged: outcomes only, never an address and never what was typed.
//
// Plain Web-API TypeScript with no dependencies, so the same code runs in the Pages Function and in the Node tests.

export interface GateEnv {
  SITE_PASSWORD?: string;
}
export interface GateDeps {
  now?: () => number;
  log?: (line: Record<string, unknown>) => void;
  wait?: (ms: number) => Promise<void>;
}

export const LOGIN_PATH = '/__human/login';
export const LOGOUT_PATH = '/__human/logout';
export const COOKIE = '__Host-human_session'; // __Host-: only over HTTPS, only for this exact site, whole site
export const MIN_PASSWORD = 12;
export const SESSION_SECONDS = 7 * 24 * 3600;
const MAX_FORM_BYTES = 4096;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const FAIL_MAX = 10; // wrong passwords from one address per window, per running instance (best effort)
const FAIL_DELAY_MS = 350;

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s: string): ArrayBuffer | null => {
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  } catch {
    return null;
  }
};

/** the signing key is derived from the password, so changing the password signs everybody out */
async function signingKey(password: string): Promise<CryptoKey> {
  const material = await crypto.subtle.digest('SHA-256', enc.encode(`human-site-gate:v1:${password}`));
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function issueToken(password: string, nowMs: number): Promise<string> {
  const exp = Math.floor(nowMs / 1000) + SESSION_SECONDS;
  const sig = await crypto.subtle.sign('HMAC', await signingKey(password), enc.encode(`v1.${exp}`));
  return `v1.${exp}.${b64url(sig)}`;
}
export async function validToken(token: string | null, password: string, nowMs: number): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1' || !/^\d{9,11}$/.test(parts[1])) return false;
  const exp = Number(parts[1]);
  const nowS = Math.floor(nowMs / 1000);
  if (exp <= nowS || exp > nowS + SESSION_SECONDS + 60) return false; // expired, or dated further ahead than we ever issue
  const sig = fromB64url(parts[2]);
  if (!sig || sig.byteLength !== 32) return false;
  return crypto.subtle.verify('HMAC', await signingKey(password), sig, enc.encode(`v1.${exp}`)); // constant-time
}

/** compares two strings without revealing, by timing, how much of them matched */
async function sameSecret(a: string, b: string): Promise<boolean> {
  const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const [x, y] = await Promise.all([crypto.subtle.sign('HMAC', key, enc.encode(a)), crypto.subtle.sign('HMAC', key, enc.encode(b))]);
  const p = new Uint8Array(x);
  const q = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < p.length; i++) diff |= p[i] ^ q[i];
  return diff === 0;
}

const readCookie = (request: Request): string | null => {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === COOKIE) return part.slice(i + 1).trim();
  }
  return null;
};

/** where to go after signing in: only a path on this site, never another site and never the gate's own addresses */
export function safeNext(v: string | null): string {
  if (!v || v.length > 512 || v[0] !== '/' || v[1] === '/' || v[1] === '\\') return '/';
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(v) || v.startsWith('/__human/')) return '/';
  return v;
}

// headers on everything shown to someone who has NOT signed in: store nothing, index nothing, frame nothing
const CLOSED: Record<string, string> = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin', // not 'no-referrer': that makes browsers send a blank Origin with the sign-in form
  Vary: 'Cookie',
};
const HTML = { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The sign-in page. Self-contained: it may not load anything from the site, because everything there is protected. */
function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<link rel="icon" href="data:,">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body { display: grid; place-items: center; padding: 24px; background: #f6f3ec; color: #14191c; font: 400 17px/1.6 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  main { width: 100%; max-width: 380px; }
  .mark { margin: 0 0 clamp(36px, 8vh, 64px); font-weight: 600; font-size: 20px; letter-spacing: 0.32em; }
  .eyebrow { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #8a5f0a; }
  h1 { margin: 14px 0 0; font: italic 400 clamp(38px, 9vw, 48px)/1.04 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif; letter-spacing: -0.01em; }
  p { margin: 14px 0 0; color: #55585a; }
  form { margin-top: 28px; }
  label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
  input { width: 100%; min-height: 52px; padding: 10px 16px; border: 1px solid rgba(20, 25, 28, 0.28); border-radius: 14px; background: #fff; color: inherit; font: inherit; }
  input:focus-visible, button:focus-visible { outline: 3px solid #14191c; outline-offset: 3px; }
  button { margin-top: 14px; width: 100%; min-height: 52px; padding: 8px 28px; border: 1px solid rgba(138, 95, 10, 0.5); border-radius: 999px; background: #f0dfbb; color: #1f231e; font: 600 15px/1.15 inherit; font-family: inherit; cursor: pointer; }
  .err { margin-top: 14px; color: #8a1f17; font-weight: 600; }
  .note { margin-top: 28px; font-size: 13px; }
</style>
</head>
<body>
<main>
<p class="mark">HUMAN</p>
${body}
</main>
</body>
</html>`;
}
const loginPage = (next: string, error = '') =>
  page(
    'HUMAN — private preview',
    `<p class="eyebrow">Private preview</p>
<h1>Enter the password.</h1>
<p>This prototype is shared by invitation.</p>
<form method="post" action="${LOGIN_PATH}">
<input type="hidden" name="next" value="${esc(next)}">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
<button type="submit">Continue</button>
</form>
<p class="note">HUMAN is in development. Nothing here is a live service.</p>`,
  );
const closedPage = () => page('HUMAN', `<p class="eyebrow">Unavailable</p>\n<h1>This site is not available.</h1>\n<p>Please try again later.</p>`);

const html = (status: number, body: string, extra: Record<string, string> = {}) => new Response(body, { status, headers: { ...CLOSED, ...HTML, ...extra } });
const text = (status: number, body: string, extra: Record<string, string> = {}) => new Response(body, { status, headers: { ...CLOSED, 'Content-Type': 'text/plain; charset=utf-8', ...extra } });
const redirect = (to: string, extra: Record<string, string> = {}) => new Response(null, { status: 303, headers: { ...CLOSED, Location: to, ...extra } });
const clearCookie = `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

// wrong-password counter, per running instance. Addresses are held in memory only and never written out.
const fails = new Map<string, number[]>();
export function resetGateLimits() {
  fails.clear();
}
const recentFails = (ip: string, nowMs: number) => (fails.get(ip) ?? []).filter((t) => nowMs - t < FAIL_WINDOW_MS);

async function readForm(request: Request): Promise<URLSearchParams | null> {
  if (!/^application\/x-www-form-urlencoded\b/i.test(request.headers.get('content-type') ?? '')) return null;
  const declared = Number(request.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > MAX_FORM_BYTES) return null;
  const raw = await request.text();
  if (raw.length > MAX_FORM_BYTES) return null;
  return new URLSearchParams(raw);
}

/**
 * The gate. `next` serves the real site (a page, a file or the API) and is called only for a signed-in visitor.
 */
export async function gate(request: Request, env: GateEnv, next: () => Promise<Response>, deps: GateDeps = {}): Promise<Response> {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((line) => console.log(JSON.stringify(line)));
  const wait = deps.wait ?? ((ms) => new Promise<void>((r) => setTimeout(r, ms)));
  try {
    // 1. No usable password configured: nothing is served. (The reason goes to the log, not to the visitor.)
    const password = (env.SITE_PASSWORD ?? '').trim();
    if (password.length < MIN_PASSWORD) {
      log({ event: 'gate', outcome: 'closed', reason: `SITE_PASSWORD is missing or shorter than ${MIN_PASSWORD} characters` });
      return html(503, closedPage(), { 'Retry-After': '3600' });
    }

    const url = new URL(request.url);
    const wantsPage = (request.method === 'GET' || request.method === 'HEAD') && /text\/html/i.test(request.headers.get('accept') ?? '');

    // 2. Signing out.
    if (url.pathname === LOGOUT_PATH) return redirect('/', { 'Set-Cookie': clearCookie });

    // 3. Signing in.
    if (url.pathname === LOGIN_PATH) {
      if (request.method !== 'POST') return redirect('/');
      // Only this site's own sign-in page may submit. Browsers say where a form came from in two ways; either is
      // accepted, because some privacy settings blank the first (Origin) while still sending the second.
      const origin = request.headers.get('origin');
      const fromSelf = origin === url.origin || ((origin === null || origin === 'null') && request.headers.get('sec-fetch-site') === 'same-origin');
      if (!fromSelf) {
        log({ event: 'gate', outcome: 'login-origin' });
        return text(403, 'Forbidden');
      }
      const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
      if (recentFails(ip, now()).length >= FAIL_MAX) {
        log({ event: 'gate', outcome: 'login-throttled' });
        return html(429, loginPage('/', 'Too many attempts. Please wait fifteen minutes and try again.'), { 'Retry-After': '900' });
      }
      const form = await readForm(request);
      const nextPath = safeNext(form?.get('next') ?? null);
      const typed = form?.get('password') ?? '';
      if (!form || typed.length > 256 || !(await sameSecret(typed.trim(), password))) {
        fails.set(ip, [...recentFails(ip, now()), now()]);
        if (fails.size > 5000) for (const [k, v] of fails) if (!v.some((t) => now() - t < FAIL_WINDOW_MS)) fails.delete(k);
        await wait(FAIL_DELAY_MS);
        log({ event: 'gate', outcome: 'login-wrong' });
        return html(401, loginPage(nextPath, 'That password is not correct.'));
      }
      fails.delete(ip);
      log({ event: 'gate', outcome: 'login-ok' });
      const token = await issueToken(password, now());
      return redirect(nextPath, { 'Set-Cookie': `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax` });
    }

    // 4. Everything else needs a valid session.
    if (await validToken(readCookie(request), password, now())) {
      const res = await next();
      const out = new Response(res.body, res);
      // a signed-in visitor's copy stays in their own browser: shared caches may not keep it, and pages are re-checked
      const isPage = /text\/html/i.test(out.headers.get('content-type') ?? '');
      out.headers.set('Cache-Control', isPage || url.pathname.startsWith('/api/') ? out.headers.get('cache-control') === 'no-store' ? 'no-store' : 'private, no-cache' : 'private, max-age=3600');
      out.headers.append('Vary', 'Cookie');
      out.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return out;
    }

    // 5. Not signed in: a page request gets the sign-in page, anything else a bare refusal. Nothing may be cached.
    if (wantsPage) return request.method === 'HEAD' ? new Response(null, { status: 401, headers: { ...CLOSED, ...HTML } }) : html(401, loginPage(safeNext(url.pathname + url.search)));
    if (url.pathname.startsWith('/api/')) return new Response(JSON.stringify({ status: 'unauthorised' }), { status: 401, headers: { ...CLOSED, 'Content-Type': 'application/json; charset=utf-8' } });
    return text(401, 'Authentication required');
  } catch {
    // 6. Anything unexpected: closed, never open.
    log({ event: 'gate', outcome: 'error' });
    return text(500, 'This site is not available.');
  }
}
