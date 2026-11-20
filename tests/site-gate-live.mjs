// HUMAN site password gate — end-to-end checks in Cloudflare's local Pages runtime (workerd, via `wrangler pages dev`),
// with a real browser. The password is a made-up test value. Nothing leaves this machine.
//
// Run:   npm run build   then   WRANGLER="npx wrangler@4" node tests/site-gate-live.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');

const DIR = process.env.DEMO_DIR || 'dist';
const WRANGLER = (process.env.WRANGLER || 'npx wrangler@4').split(' ');
const PW = 'made-up-test-password-42';
const PORT = 8792, SITE = `http://127.0.0.1:${PORT}`;
const COOKIE = '__Host-human_session';

let site = null, siteLog = '';
async function startSite(vars) {
  await stopSite();
  siteLog = '';
  const args = [...WRANGLER.slice(1), 'pages', 'dev', path.resolve(DIR), '--port', String(PORT), '--ip', '127.0.0.1', '--compatibility-date', '2026-01-01', ...Object.entries(vars).flatMap(([k, v]) => ['-b', `${k}=${v}`])];
  site = spawn(WRANGLER[0], args, { cwd: process.cwd(), env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1', NO_COLOR: '1' }, detached: true });
  site.stdout.on('data', (d) => (siteLog += d)); site.stderr.on('data', (d) => (siteLog += d));
  for (let i = 0; i < 120; i++) {
    try { await fetch(SITE + '/', { redirect: 'manual' }); return; } catch { /* not up yet */ }
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
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(DIR).map((f) => '/' + path.relative(DIR, f).split(path.sep).join('/'));
const pick = (re) => files.find((f) => re.test(f));
const ASSETS = [pick(/\/_astro\/.*\.css$/), pick(/\/_astro\/.*\.js$/), pick(/\/_astro\/.*\.webp$/), pick(/\/_astro\/.*\.woff2$/), '/favicon.svg', '/robots.txt', '/_headers', '/_routes.json'].filter(Boolean);
const PAGES = ['/', '/about', '/faq', '/explore-plans', '/waitlist', '/women', '/men', '/privacy', '/terms', '/medical-disclaimer'];
const raw = (p, init = {}) => fetch(SITE + p, { redirect: 'manual', ...init, headers: { accept: 'text/html', ...(init.headers || {}) } });
const signIn = async (password = PW) => {
  const r = await fetch(SITE + '/__human/login', { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: SITE }, body: new URLSearchParams({ password, next: '/' }) });
  return { status: r.status, cookie: (r.headers.get('set-cookie') || '').split(';')[0], setCookie: r.headers.get('set-cookie') || '' };
};

const browser = await chromium.launch();
const results = [];
const test = async (name, fn) => { try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, String(e.message).split('\n')[0]]); } };

try {
  await startSite({ SITE_PASSWORD: PW });

  await test('G1 direct access without signing in: every page address shows only the sign-in page (401, never stored)', async () => {
    for (const p of [...PAGES, ...PAGES.slice(1).map((x) => x + '/'), '/index.html', '/about/index.html', '/404.html', '/no-such-page', '/?page=about', '/about?x=1']) {
      const r = await raw(p); const t = await r.text();
      assert.equal(r.status, 401, p); assert.equal(r.headers.get('cache-control'), 'no-store', p);
      assert.match(t, /Enter the password\./, p); assert.ok(!/How well do you|preventive health plans|Your questions, answered|site-header/i.test(t), p + ' leaked page content');
    }
  });
  await test('G2 direct access to files and the API without signing in: styles, scripts, images, fonts, robots.txt and /api are all refused', async () => {
    for (const a of ASSETS) {
      const r = await raw(a, { headers: { accept: '*/*' } }); const body = Buffer.from(await r.arrayBuffer());
      assert.equal(r.status, 401, a); assert.equal(r.headers.get('cache-control'), 'no-store', a); assert.equal(body.toString(), 'Authentication required', a);
    }
    const first = ASSETS[0];
    for (const init of [{ method: 'HEAD' }, { headers: { range: 'bytes=0-99', accept: '*/*' } }, { headers: { 'if-none-match': '*', accept: '*/*' } }, { headers: { cookie: `${COOKIE}=v1.9999999999.${'A'.repeat(43)}`, accept: '*/*' } }, { headers: { cookie: 'authenticated=true', accept: '*/*' } }, { headers: { authorization: 'Basic ' + Buffer.from('user:' + PW).toString('base64'), accept: '*/*' } }]) {
      const r = await raw(first, init); assert.equal(r.status, 401, JSON.stringify(init));
    }
    for (const p of ['//about', '/ABOUT', '/about/%2e%2e/index.html', '/_astro/%2e%2e/index.html', '/%2e/about', '/about%2f', '/.git/config', '/functions/_middleware.ts', '/server/site-gate.ts']) {
      const r = await raw(p); assert.ok(r.status === 401 || r.status === 400 || r.status === 404 || (r.status >= 300 && r.status < 400), `${p} → ${r.status}`);
      const t = await r.text(); assert.ok(!/site-header|How well do you|SITE_PASSWORD/i.test(t), p + ' leaked content');
    }
    for (const method of ['POST', 'GET', 'OPTIONS', 'PUT']) {
      const r = await fetch(SITE + '/api/waitlist', { method, headers: { 'content-type': 'application/json', origin: SITE }, body: method === 'POST' || method === 'PUT' ? '{}' : undefined });
      assert.equal(r.status, 401, method); assert.deepEqual(await r.json(), { status: 'unauthorised' });
    }
  });
  await test('G3 incorrect passwords in the browser: refused with a message, still on the sign-in page, no session', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
    await p.goto(SITE + '/explore-plans');
    for (const bad of ['wrong-password', PW + '!', PW.slice(0, 10)]) {
      await p.fill('input[name=password]', bad); await p.click('button[type=submit]'); await p.waitForLoadState('load');
      assert.match(await p.locator('h1').innerText(), /Enter the password/); assert.match(await p.locator('[role=alert]').innerText(), /not correct/);
      assert.equal((await ctx.cookies()).length, 0);
    }
    assert.ok(!(await p.content()).includes(PW)); // and the page never echoes what was typed
    await p.goto(SITE + '/about'); assert.match(await p.locator('h1').innerText(), /Enter the password/);
    await ctx.close();
  });
  await test('G4 correct password in the browser: lands on the page first asked for; every file then loads; the cookie is invisible to scripts', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    const bad = [], posts = [], errors = [];
    p.on('response', (r) => { if (r.status() >= 400 && !/\/explore-plans$/.test(new URL(r.url()).pathname)) bad.push(r.status() + ' ' + new URL(r.url()).pathname); });
    p.on('request', (r) => r.method() !== 'GET' && posts.push(new URL(r.url()).pathname)); p.on('pageerror', (e) => errors.push(String(e)));
    p.on('console', (m) => m.type() === 'error' && !/status of 401/.test(m.text()) && errors.push(m.text())); // the first, signed-out request is a 401 by design
    await p.goto(SITE + '/explore-plans');
    assert.equal(await p.locator('.site-header').count(), 0);
    await p.fill('input[name=password]', PW); await p.click('button[type=submit]'); await p.waitForLoadState('networkidle');
    assert.equal(new URL(p.url()).pathname.replace(/\/$/, ''), '/explore-plans');
    assert.equal((await p.locator('h1').innerText()).trim(), 'Our preventive health plans.');
    await p.evaluate(() => document.querySelectorAll('.xp-card img').forEach((i) => (i.loading = 'eager')));
    await p.waitForFunction(() => [...document.querySelectorAll('.xp-card img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 });
    assert.match(await p.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily), /Instrument Serif/); // styles and fonts arrived
    const c = (await ctx.cookies()).find((k) => k.name === COOKIE);
    assert.ok(c && c.httpOnly && c.secure && c.sameSite === 'Lax' && c.path === '/', 'cookie flags: ' + JSON.stringify(c));
    assert.equal(await p.evaluate(() => document.cookie), '');
    // the rest of the site, by its own links, without being asked again
    for (const [label, h1] of [['About', /You deserve to understand your health/], ['FAQ', /Your questions, answered/]]) {
      await p.locator('.site-header .nav a', { hasText: label }).click(); await p.waitForLoadState('networkidle');
      assert.match(await p.locator('h1').innerText(), h1);
    }
    // the investor waitlist is still a demonstration: it completes and sends nothing
    await p.goto(SITE + '/waitlist', { waitUntil: 'networkidle' });
    const settle = (n) => p.waitForFunction((n) => document.querySelector('[data-hp]').dataset.chapter === String(n) && document.querySelector('[data-fx]').hidden, n, { timeout: 20000 });
    assert.match(await p.locator('.hp__mode').innerText(), /Demonstration — nothing you enter is sent or stored/i);
    await p.locator('[data-begin]').click(); await settle(2); await p.fill('[name=firstName]', 'Asha');
    await p.locator('[data-form="2"] .hp-btn').click(); await settle(3); await p.locator('[data-form="3"] .hp-btn').click(); await settle(4);
    await p.fill('[name=email]', 'asha@example.com'); await p.check('#hp-consent', { force: true }); await p.locator('[data-submit]').click(); await settle(5);
    assert.ok(await p.locator('[data-preview-flag]').isVisible());
    assert.deepEqual(posts, ['/__human/login']); // the only non-GET request in the whole visit was the sign-in itself
    assert.deepEqual(bad, []); assert.deepEqual(errors, []);
    // signing out closes it again
    await p.goto(SITE + '/__human/logout'); await p.waitForLoadState('load');
    assert.match(await p.locator('h1').innerText(), /Enter the password/);
    await p.goto(SITE + '/about'); assert.match(await p.locator('h1').innerText(), /Enter the password/);
    await ctx.close();
  });
  await test('G5 a valid session: pages and files are served with private caching; an altered or signed-out session is refused', async () => {
    const s = await signIn();
    assert.equal(s.status, 303); assert.match(s.setCookie, /HttpOnly/); assert.match(s.setCookie, /Secure/); assert.match(s.setCookie, /SameSite=Lax/); assert.ok(!s.setCookie.includes(PW));
    let r = await raw('/about/', { headers: { cookie: s.cookie } });
    assert.equal(r.status, 200); assert.match(await r.text(), /You deserve to understand your health/); assert.equal(r.headers.get('cache-control'), 'private, no-cache'); assert.match(r.headers.get('x-robots-tag'), /noindex/);
    r = await raw(ASSETS[0], { headers: { cookie: s.cookie, accept: '*/*' } });
    assert.equal(r.status, 200); assert.match(r.headers.get('cache-control'), /^private/); assert.ok((await r.text()).length > 500);
    r = await raw('/no-such-page', { headers: { cookie: s.cookie } }); assert.equal(r.status, 404); assert.match(await r.text(), /isn’t here/);
    const [name, token] = s.cookie.split('='); const parts = token.split('.');
    for (const t of [`${parts[0]}.${Number(parts[1]) + 3600}.${parts[2]}`, `${parts[0]}.${parts[1]}.${parts[2].slice(0, -3)}AAA`, token.slice(0, -1), '']) {
      assert.equal((await raw('/about/', { headers: { cookie: `${name}=${t}` } })).status, 401, t.slice(0, 24));
    }
  });
  await test('G6 the password is in nothing a visitor can download, signed in or not', async () => {
    for (const f of walk(DIR)) if (/\.(html|js|css|json|txt|svg|map)$/.test(f) || path.basename(f).startsWith('_')) {
      const t = fs.readFileSync(f, 'utf8'); assert.ok(!t.includes(PW) && !/SITE_PASSWORD/.test(t), 'found in ' + f);
    }
    const s = await signIn();
    for (const p of ['/', '/waitlist', '/_routes.json', '/_headers']) for (const cookie of ['', s.cookie]) { const t = await (await raw(p, { headers: { cookie, accept: '*/*' } })).text(); assert.ok(!t.includes(PW), p); }
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(DIR, '_routes.json'), 'utf8')), { version: 1, include: ['/*'], exclude: [] }); // nothing is routed around the gate
  });
  await test('G7 guessing is throttled in the running site: the eleventh attempt after ten wrong ones is refused even with the right password', async () => {
    const codes = [];
    for (let i = 0; i < 10; i++) codes.push((await signIn('wrong-guess-' + i)).status);
    const eleventh = await signIn(PW);
    assert.deepEqual(codes, Array(10).fill(401)); assert.equal(eleventh.status, 429); assert.equal(eleventh.cookie, '');
  });

  // ===== fail closed =====
  await startSite({});
  await test('G8 fail closed, no SITE_PASSWORD: every page, file and API address answers 503 and nothing of the site is served', async () => {
    for (const p of [...PAGES, ...ASSETS, '/api/waitlist', '/__human/login']) {
      const r = await raw(p, { headers: { accept: p.includes('.') ? '*/*' : 'text/html' } }); const t = await r.text();
      assert.equal(r.status, 503, p); assert.equal(r.headers.get('cache-control'), 'no-store', p); assert.ok(!/site-header|How well do you|Enter the password/i.test(t), p);
    }
    const r = await fetch(SITE + '/__human/login', { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: SITE }, body: 'password=' });
    assert.equal(r.status, 503); assert.equal(r.headers.get('set-cookie'), null); // an empty password does not sign anyone in
  });
  await startSite({ SITE_PASSWORD: 'tooshort' });
  await test('G9 fail closed, password shorter than 12 characters: 503 everywhere, and that short password does not work', async () => {
    assert.equal((await raw('/')).status, 503); assert.equal((await raw(ASSETS[0], { headers: { accept: '*/*' } })).status, 503);
    assert.equal((await signIn('tooshort')).status, 503);
  });
} finally {
  await stopSite(); await browser.close();
}
for (const [status, name, note] of results) console.log(`${status}  ${name}${note ? '\n      ↳ ' + note : ''}`);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed} passed, ${failed} failed, ${results.length} total  (Cloudflare Pages local runtime, real browser)`);
process.exit(failed ? 1 : 0);
