// HUMAN waitlist backend — end-to-end checks in Cloudflare's local Pages runtime (workerd, via `wrangler pages dev`).
// The real pages talk to the real function file (functions/api/waitlist.ts) exactly as they would on Cloudflare.
//
// THE DATABASE IS MOCKED. Supabase is replaced by a small local server on 127.0.0.1 that behaves like its REST API
// (key check, unique email, unique idempotency key). No request leaves this machine and the key is a made-up string.
//
// Run:
//   PUBLIC_WAITLIST_MODE=live PUBLIC_WAITLIST_ENDPOINT=/api/waitlist npx astro build --outDir /tmp/human-live
//   npm run build                                  (the investor build, in dist/)
//   LIVE_DIR=/tmp/human-live WRANGLER="npx wrangler@4" node tests/waitlist-live.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');

const LIVE_DIR = process.env.LIVE_DIR;
const DEMO_DIR = process.env.DEMO_DIR || 'dist';
const WRANGLER = (process.env.WRANGLER || 'npx wrangler@4').split(' ');
if (!LIVE_DIR || !fs.existsSync(LIVE_DIR)) { console.error('Set LIVE_DIR to a build made with PUBLIC_WAITLIST_MODE=live PUBLIC_WAITLIST_ENDPOINT=/api/waitlist'); process.exit(2); }
const FAKE_KEY = 'FAKE-TEST-KEY-not-a-real-secret';
const DB_PORT = 54329, SITE_PORT = 8791, SITE = `http://127.0.0.1:${SITE_PORT}`;

// ---------- the stand-in for Supabase ----------
const db = { rows: [], calls: [] };
const mock = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    db.calls.push({ method: req.method, url: req.url, apikey: req.headers.apikey, auth: req.headers.authorization, prefer: req.headers.prefer });
    const send = (status, obj) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(obj ? JSON.stringify(obj) : ''); };
    if (req.url !== '/rest/v1/waitlist_registrations' || req.method !== 'POST') return send(404, { message: 'not found' });
    if (req.headers.apikey !== FAKE_KEY || req.headers.authorization !== 'Bearer ' + FAKE_KEY) return send(401, { message: 'Invalid API key' });
    const row = JSON.parse(body);
    const clash = db.rows.some((r) => r.email.toLowerCase() === row.email.toLowerCase()) ? 'email' : db.rows.some((r) => r.idempotency_key && r.idempotency_key === row.idempotency_key) ? 'idempotency_key' : '';
    if (clash) return send(409, { code: '23505', message: `duplicate key value violates unique constraint "waitlist_registrations_${clash}_key"`, details: `Key (${clash})=(${row[clash]}) already exists.` });
    db.rows.push(row);
    send(201);
  });
});
await new Promise((r) => mock.listen(DB_PORT, '127.0.0.1', r));

// ---------- the site + function, in the Pages runtime ----------
let site = null, siteLog = '';
async function startSite(dir, vars) {
  await stopSite();
  siteLog = '';
  const args = [...WRANGLER.slice(1), 'pages', 'dev', path.resolve(dir), '--port', String(SITE_PORT), '--ip', '127.0.0.1', '--compatibility-date', '2026-01-01', ...Object.entries(vars).flatMap(([k, v]) => ['-b', `${k}=${v}`])];
  site = spawn(WRANGLER[0], args, { cwd: process.cwd(), env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1', NO_COLOR: '1' }, detached: true });
  site.stdout.on('data', (d) => (siteLog += d)); site.stderr.on('data', (d) => (siteLog += d));
  for (let i = 0; i < 120; i++) {
    try { const r = await fetch(SITE + '/robots.txt'); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('the local Pages runtime did not start:\n' + siteLog.slice(-1500));
}
async function stopSite() {
  if (!site) return;
  try { process.kill(-site.pid, 'SIGTERM'); } catch { /* already gone */ }
  await new Promise((r) => setTimeout(r, 1500));
  site = null;
}

const browser = await chromium.launch();
const results = [];
const test = async (name, fn) => { try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, String(e.message).split('\n')[0]]); } };
const settle = (p, n) => p.waitForFunction((n) => document.querySelector('[data-hp]').dataset.chapter === String(n) && document.querySelector('[data-fx]').hidden, n, { timeout: 20000 });
async function journey(email, { first = 'Asha' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const posts = [], responses = [], errors = [];
  p.on('request', (r) => r.method() !== 'GET' && posts.push({ url: r.url(), headers: r.headers(), body: r.postData() }));
  p.on('response', async (r) => { if (r.request().method() !== 'GET') responses.push({ status: r.status(), text: await r.text().catch(() => ''), headers: r.headers() }); });
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(SITE + '/waitlist', { waitUntil: 'networkidle' });
  const label = await p.locator('.hp__mode').innerText();
  await p.locator('[data-begin]').click(); await settle(p, 2);
  await p.fill('[name=firstName]', first); await p.locator('#hp-age-1').check({ force: true }); await p.locator('#hp-gen-0').check({ force: true });
  await p.locator('[data-form="2"] .hp-btn').click(); await settle(p, 3);
  await p.locator('#hp-int-hormonal').check({ force: true }); await p.locator('#hp-int-sleep').check({ force: true });
  await p.locator('[data-form="3"] .hp-btn').click(); await settle(p, 4);
  await p.fill('[name=email]', email); await p.fill('[name=mobile]', '98123 45678'); await p.fill('[name=city]', 'Delhi'); await p.check('#hp-consent', { force: true });
  await p.locator('[data-submit]').click();
  await p.waitForFunction(() => document.querySelector('[data-hp]').dataset.chapter === '5' || (document.querySelector('[data-notice]').classList.contains('is-on') && !document.querySelector('[data-submit]').disabled && !/Joining/.test(document.querySelector('[data-notice]').innerText) && !/demonstration/i.test(document.querySelector('[data-notice]').innerText)), null, { timeout: 25000 }).catch(() => {});
  await p.waitForTimeout(600);
  const out = { label, chapter: await p.locator('[data-hp]').getAttribute('data-chapter'), flag: await p.locator('[data-preview-flag]').isVisible(), thanks: await p.locator('[data-thanks]').innerText().catch(() => ''), notice: (await p.locator('[data-notice]').innerText()).replace(/\s+/g, ' '), posts, responses, errors };
  await ctx.close();
  return out;
}
const post = (body, headers = {}, method = 'POST') => fetch(SITE + '/api/waitlist', { method, headers: { 'content-type': 'application/json', origin: SITE, ...headers }, body: method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
const good = (email) => ({ firstName: 'Ravi', ageGroup: null, gender: null, genderSelfDescribed: null, interests: [], email, mobile: null, city: null, waitlistConsent: true, consentAt: new Date().toISOString(), privacyNoticeVersion: 'interim-2026-11-20' });

try {
  // ===== A. Private test build, backend switched on =====
  await startSite(LIVE_DIR, { WAITLIST_ENABLED: 'true', SUPABASE_URL: `http://127.0.0.1:${DB_PORT}`, SUPABASE_SECRET_KEY: FAKE_KEY });

  await test('A1 successful submission: the real page → the function → one stored row with the right columns; closing chapter shown without a demonstration label', async () => {
    const j = await journey('Asha.Test@Example.com');
    assert.equal(j.chapter, '5', 'did not reach the closing chapter: ' + j.notice);
    assert.equal(j.flag, false); assert.equal(j.thanks, 'Thank you, Asha.'); assert.match(j.label, /Private test — what you enter is saved/i);
    assert.equal(j.posts.length, 1); assert.equal(new URL(j.posts[0].url).pathname, '/api/waitlist'); assert.match(j.posts[0].headers['idempotency-key'], /^[0-9a-f-]{36}$/);
    assert.equal(j.responses[0].status, 200); assert.deepEqual(JSON.parse(j.responses[0].text), { status: 'accepted' }); assert.equal(j.responses[0].headers['cache-control'], 'no-store');
    assert.equal(db.rows.length, 1);
    const r = db.rows[0];
    assert.deepEqual({ first_name: r.first_name, age_group: r.age_group, gender: r.gender, gender_self_described: r.gender_self_described, interests: r.interests, email: r.email, mobile: r.mobile, city: r.city, waitlist_consent: r.waitlist_consent, privacy_notice_version: r.privacy_notice_version },
      { first_name: 'Asha', age_group: '25–34', gender: 'Female', gender_self_described: null, interests: ['hormonal', 'sleep'], email: 'asha.test@example.com', mobile: '+919812345678', city: 'Delhi', waitlist_consent: true, privacy_notice_version: 'interim-2026-11-20' });
    assert.match(r.idempotency_key, /^[0-9a-f-]{36}$/); assert.ok(r.consent_at_client);
    const call = db.calls.at(-1); assert.equal(call.apikey, FAKE_KEY); assert.equal(call.prefer, 'return=minimal');
    assert.equal(j.errors.length, 0, j.errors.join());
  });
  await test('A2 duplicate submission: the same email again looks identical to the visitor and stores nothing new', async () => {
    const j = await journey('asha.test@example.com', { first: 'Imposter' });
    assert.equal(j.chapter, '5'); assert.deepEqual(JSON.parse(j.responses[0].text), { status: 'accepted' });
    assert.equal(db.rows.length, 1); assert.equal(db.rows[0].first_name, 'Asha');
  });
  // a fresh instance for each group below: the function throttles one address to eight requests in ten minutes
  const ON = { WAITLIST_ENABLED: 'true', SUPABASE_URL: `http://127.0.0.1:${DB_PORT}`, SUPABASE_SECRET_KEY: FAKE_KEY };
  await startSite(LIVE_DIR, ON);
  await test('A3 invalid submissions are refused by the server (400) and store nothing', async () => {
    const before = db.rows.length;
    for (const patch of [{ waitlistConsent: false }, { waitlistConsent: 'true' }, { email: 'not-an-email' }, { firstName: '' }, { ageGroup: '18-24' }, { interests: ['x'] }, { mobile: '12' }, { extra: 1 }]) {
      const r = await post({ ...good('v@example.com'), ...patch }); assert.equal(r.status, 400, JSON.stringify(patch));
    }
    assert.equal(db.rows.length, before);
  });
  await startSite(LIVE_DIR, ON);
  await test('A3b malformed requests: broken JSON → 400, wrong content type → 415, oversized body → 413; nothing stored', async () => {
    const before = db.rows.length;
    assert.equal((await post('{broken')).status, 400);
    assert.equal((await post(good('v@example.com'), { 'content-type': 'text/plain' })).status, 415);
    assert.equal((await post(JSON.stringify({ ...good('v@example.com'), city: 'x'.repeat(9000) }))).status, 413);
    assert.equal(db.rows.length, before);
  });
  await test('A4 unauthorised requests: another site, no origin, other methods → refused; the function grants no cross-site permission', async () => {
    const before = db.rows.length;
    assert.equal((await post(good('x@example.com'), { origin: 'https://evil.example' })).status, 403);
    assert.equal((await fetch(SITE + '/api/waitlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(good('x@example.com')) })).status, 403);
    assert.equal((await post(null, {}, 'GET')).status, 405);
    const pre = await fetch(SITE + '/api/waitlist', { method: 'OPTIONS', headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } });
    assert.equal(pre.headers.get('access-control-allow-origin'), null);
    assert.equal(db.rows.length, before);
  });
  await startSite(LIVE_DIR, ON);
  await test('A4b rate limit in the running function: the ninth request from one address inside ten minutes is refused (429)', async () => {
    const before = db.rows.length;
    const codes = [];
    for (let i = 0; i < 9; i++) codes.push((await post(good(`burst${i}@example.com`), { 'idempotency-key': crypto.randomUUID() })).status);
    assert.deepEqual(codes, [200, 200, 200, 200, 200, 200, 200, 200, 429]);
    assert.equal(db.rows.length, before + 8);
  });
  await test('A5 the database refuses a wrong key: the mock itself rejects anything but the configured secret', async () => {
    const r = await fetch(`http://127.0.0.1:${DB_PORT}/rest/v1/waitlist_registrations`, { method: 'POST', headers: { apikey: 'wrong', authorization: 'Bearer wrong', 'content-type': 'application/json' }, body: JSON.stringify(good('k@example.com')) });
    assert.equal(r.status, 401);
  });
  await test('A6 the secret is not in anything a visitor can download', async () => {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const dir of [LIVE_DIR, DEMO_DIR]) for (const f of walk(dir)) if (/\.(html|js|css|json|txt|map)$/.test(f) || path.basename(f).startsWith('_')) {
      const t = fs.readFileSync(f, 'utf8');
      assert.ok(!t.includes(FAKE_KEY) && !/SUPABASE_SECRET_KEY|sb_secret|service_role|supabase\.co/i.test(t), 'found in ' + f);
    }
    for (const u of ['/', '/waitlist', '/api/waitlist']) { const t = await (await fetch(SITE + u)).text(); assert.ok(!t.includes(FAKE_KEY), u); }
  });

  // ===== B. Same private build, backend left OFF (the default) =====
  await startSite(LIVE_DIR, {});
  await test('B1 backend disabled by default: the function refuses (503) and never contacts the database; the page keeps the details and says so', async () => {
    const calls = db.calls.length, rows = db.rows.length;
    const j = await journey('later@example.com');
    assert.equal(j.chapter, '4'); assert.equal(j.responses[0].status, 503); assert.match(j.notice, /couldn’t complete your registration/i);
    assert.equal((await post(good('z@example.com'))).status, 503);
    assert.equal(db.calls.length, calls); assert.equal(db.rows.length, rows);
  });
  await startSite(LIVE_DIR, { WAITLIST_ENABLED: 'true' });
  await test('B2 switched on but without database settings: still refused (503), nothing contacted', async () => {
    const calls = db.calls.length;
    assert.equal((await post(good('z@example.com'))).status, 503); assert.equal(db.calls.length, calls);
  });

  // ===== C. Investor-facing build =====
  await startSite(DEMO_DIR, {});
  await test('C1 investor build as it will be hosted (no variables): demonstration journey sends nothing; the function refuses direct requests', async () => {
    const calls = db.calls.length;
    const j = await journey('investor@example.com');
    assert.equal(j.chapter, '5'); assert.equal(j.flag, true); assert.match(j.label, /Demonstration — nothing you enter is sent or stored/i);
    assert.equal(j.posts.length, 0, 'the demonstration made a request');
    assert.equal((await post(good('z@example.com'))).status, 503); assert.equal(db.calls.length, calls);
  });
  await startSite(DEMO_DIR, { WAITLIST_ENABLED: 'true', SUPABASE_URL: `http://127.0.0.1:${DB_PORT}`, SUPABASE_SECRET_KEY: FAKE_KEY });
  await test('C2 investor build even if the backend variables were set by mistake: the pages still send nothing', async () => {
    const rows = db.rows.length;
    const j = await journey('investor2@example.com');
    assert.equal(j.chapter, '5'); assert.equal(j.flag, true); assert.equal(j.posts.length, 0); assert.equal(db.rows.length, rows);
  });
} finally {
  await stopSite(); await browser.close(); mock.close();
}
for (const [status, name, note] of results) console.log(`${status}  ${name}${note ? '\n      ↳ ' + note : ''}`);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed} passed, ${failed} failed, ${results.length} total  (Cloudflare Pages local runtime; database MOCKED on 127.0.0.1)`);
process.exit(failed ? 1 : 0);
