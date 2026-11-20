// HUMAN site password gate — unit checks for server/site-gate.ts.   Run:  npm run test:gate
// Nothing here uses a real password: the value below is made up for the test.
import assert from 'node:assert/strict';
import { gate, issueToken, validToken, safeNext, resetGateLimits, COOKIE, LOGIN_PATH, LOGOUT_PATH, SESSION_SECONDS } from '../server/site-gate.ts';

const SITE = 'https://human-preview.example.test';
const PW = 'made-up-test-password-42';
const ENV = { SITE_PASSWORD: PW };
const SECRET_PAGE = '<html><body>THE REAL WEBSITE</body></html>';
const site = (type = 'text/html; charset=utf-8', extra = {}) => {
  const calls = { n: 0 };
  const next = async () => { calls.n++; return new Response(type.startsWith('text/html') ? SECRET_PAGE : 'REAL ASSET BYTES', { status: 200, headers: { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable', ...extra } }); };
  return { calls, next };
};
const get = (path, headers = {}, method = 'GET') => new Request(SITE + path, { method, headers: { accept: 'text/html,application/xhtml+xml', ...headers } });
const login = (password, { next = '/', headers = {}, body } = {}) =>
  new Request(SITE + LOGIN_PATH, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: SITE, 'cf-connecting-ip': '203.0.113.9', ...headers }, body: body ?? new URLSearchParams({ password, next }).toString() });
const run = async (request, env = ENV, s = site(), deps = {}) => {
  const logs = [];
  const res = await gate(request, env, s.next, { log: (l) => logs.push(l), wait: async () => {}, ...deps });
  return { res, text: await res.text(), logs, served: s.calls.n };
};
const cookieOf = (res) => (res.headers.get('set-cookie') ?? '').split(';')[0];
const signIn = async (env = ENV) => cookieOf((await run(login(env.SITE_PASSWORD))).res);

const results = [];
const test = async (name, fn) => { resetGateLimits(); try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, String(e.message).split('\n')[0]]); } };
const closed = (res) => { assert.equal(res.headers.get('cache-control'), 'no-store'); assert.match(res.headers.get('x-robots-tag'), /noindex/); };

await test('fail closed: no password, an empty one or one under 12 characters → 503 for pages, files and the API; the site is never reached', async () => {
  for (const env of [{}, { SITE_PASSWORD: '' }, { SITE_PASSWORD: '   ' }, { SITE_PASSWORD: 'short' }, { SITE_PASSWORD: 'elevenchars' }, { SITE_PASSWORD: undefined }]) {
    for (const r of [get('/'), get('/_astro/app.css', { accept: 'text/css' }), get('/api/waitlist', { accept: '*/*' }), login('short'), get('/', { cookie: `${COOKIE}=v1.9999999999.AAAA` })]) {
      const o = await run(r, env);
      assert.equal(o.res.status, 503); assert.equal(o.served, 0); closed(o.res); assert.ok(!o.text.includes('REAL'));
    }
  }
  const o = await run(get('/'), {});
  assert.match(o.logs[0].reason, /SITE_PASSWORD/); assert.ok(!/SITE_PASSWORD|12 characters/.test(o.text), 'the reason is shown to visitors');
});
await test('fail closed: if the site itself throws, the answer is an error, not the page', async () => {
  const cookie = await signIn();
  const o = await gate(get('/', { cookie }), ENV, async () => { throw new Error('boom'); }, { log: () => {} });
  assert.equal(o.status, 500); assert.equal(o.headers.get('cache-control'), 'no-store');
});
await test('not signed in: every kind of address is refused and nothing is served', async () => {
  for (const [path, accept] of [['/', 'text/html'], ['/about', 'text/html'], ['/waitlist', 'text/html'], ['/explore-plans/', 'text/html'], ['/404.html', 'text/html'], ['/does-not-exist', 'text/html']]) {
    const o = await run(get(path, { accept }));
    assert.equal(o.res.status, 401, path); assert.equal(o.served, 0); closed(o.res);
    assert.match(o.text, /Enter the password\./); assert.ok(!o.text.includes('REAL WEBSITE'));
    assert.match(o.text, new RegExp(`name="next" value="${path.replace(/[/.]/g, '\\$&')}"`)); // comes back to where they were going
  }
  for (const path of ['/_astro/index.abc123.css', '/_astro/hero.def456.webp', '/favicon.svg', '/robots.txt', '/_headers', '/_routes.json']) {
    const o = await run(get(path, { accept: '*/*' }));
    assert.equal(o.res.status, 401, path); assert.equal(o.served, 0); closed(o.res); assert.equal(o.text, 'Authentication required');
  }
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'GET']) {
    const o = await run(new Request(SITE + '/api/waitlist', { method, headers: { 'content-type': 'application/json', origin: SITE }, body: method === 'GET' || method === 'OPTIONS' ? undefined : '{}' }));
    assert.equal(o.res.status, 401, method); assert.equal(o.served, 0); closed(o.res); assert.deepEqual(JSON.parse(o.text), { status: 'unauthorised' });
  }
  const head = await run(get('/', {}, 'HEAD')); assert.equal(head.res.status, 401); assert.equal(head.served, 0);
});
await test('the sign-in page is self-contained and gives nothing away', async () => {
  const o = await run(get('/'));
  assert.ok(!o.text.includes(PW)); assert.ok(!/<script|src=|href="(?!data:,)/i.test(o.text), 'the page loads something');
  assert.match(o.res.headers.get('content-security-policy'), /default-src 'none'/); assert.equal(o.res.headers.get('x-frame-options'), 'DENY');
  assert.equal(o.res.headers.get('referrer-policy'), 'same-origin'); // 'no-referrer' would blank the Origin of the sign-in form and lock everyone out
  assert.match(o.text, /type="password"/); assert.match(o.text, new RegExp(`action="${LOGIN_PATH}"`)); assert.match(o.text, /noindex/);
});
await test('wrong password: refused, no cookie, the page says so without saying why; many variants', async () => {
  for (const bad of ['', 'wrong', PW + 'x', PW.slice(0, -1), PW.toUpperCase(), 'x'.repeat(300)]) {
    resetGateLimits();
    const o = await run(login(bad));
    assert.equal(o.res.status, 401, bad.slice(0, 20)); assert.equal(o.res.headers.get('set-cookie'), null); closed(o.res); assert.equal(o.served, 0);
    assert.match(o.text, /That password is not correct\./); assert.ok(!o.text.includes(PW));
  }
  const o = await run(login(PW, { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: PW }) }));
  assert.equal(o.res.status, 401); assert.equal(o.res.headers.get('set-cookie'), null);
});
await test('correct password: a signed, HttpOnly, Secure cookie and a redirect to the page first asked for', async () => {
  const o = await run(login(PW, { next: '/explore-plans?x=1' }));
  assert.equal(o.res.status, 303); assert.equal(o.res.headers.get('location'), '/explore-plans?x=1'); closed(o.res);
  const sc = o.res.headers.get('set-cookie');
  assert.match(sc, new RegExp(`^${COOKIE}=v1\\.\\d+\\.[A-Za-z0-9_-]{43};`)); assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Lax/); assert.match(sc, /Path=\//); assert.match(sc, new RegExp(`Max-Age=${SESSION_SECONDS}`));
  assert.ok(!sc.includes(PW) && !/Domain=/i.test(sc)); assert.equal(o.served, 0);
  const padded = await run(login('  ' + PW + '\n')); assert.equal(padded.res.status, 303); // a stray space from copy-and-paste is forgiven
});
await test('signed in: pages, files and the API are served; copies are private to that browser', async () => {
  const cookie = await signIn();
  let o = await run(get('/about', { cookie }));
  assert.equal(o.res.status, 200); assert.equal(o.text, SECRET_PAGE); assert.equal(o.served, 1);
  assert.equal(o.res.headers.get('cache-control'), 'private, no-cache'); assert.match(o.res.headers.get('vary'), /Cookie/); assert.match(o.res.headers.get('x-robots-tag'), /noindex/);
  o = await run(get('/_astro/app.css', { cookie, accept: 'text/css' }), ENV, site('text/css'));
  assert.equal(o.res.status, 200); assert.equal(o.res.headers.get('cache-control'), 'private, max-age=3600'); assert.ok(!/public|immutable/.test(o.res.headers.get('cache-control')));
  o = await run(new Request(SITE + '/api/waitlist', { method: 'POST', headers: { cookie, origin: SITE, 'content-type': 'application/json' }, body: '{}' }), ENV, site('application/json', { 'cache-control': 'no-store' }));
  assert.equal(o.served, 1); assert.equal(o.res.headers.get('cache-control'), 'no-store');
});
await test('forged, altered, expired and foreign cookies are refused', async () => {
  const now = Date.now();
  const good = await issueToken(PW, now);
  assert.equal(await validToken(good, PW, now), true);
  const [v, exp, sig] = good.split('.');
  const bad = [
    '', 'garbage', 'v1.' + exp, `v2.${exp}.${sig}`, `${v}.${Number(exp) + 1}.${sig}`,              // changed expiry
    `${v}.${exp}.${sig.slice(0, -2)}AA`, `${v}.${exp}.${'A'.repeat(43)}`, `${v}.${exp}.`,            // changed or empty signature
    await issueToken('another-password-entirely', now),                                               // signed with a different password
    `${v}.99999999999.${sig}`, good + '.extra', 'v1.abc.def', 'x'.repeat(500),
  ];
  for (const t of bad) {
    assert.equal(await validToken(t, PW, now), false, t.slice(0, 30));
    const o = await run(get('/', { cookie: `${COOKIE}=${t}` })); assert.equal(o.res.status, 401); assert.equal(o.served, 0);
  }
  assert.equal(await validToken(good, PW, now + (SESSION_SECONDS + 1) * 1000), false, 'expired token accepted');
  assert.equal(await validToken(good, PW, now + (SESSION_SECONDS - 5) * 1000), true);
  // the right value under the wrong cookie name, or a plain "authenticated=true", means nothing
  for (const c of [`human_session=${good}`, 'authenticated=true', `session=${good}; admin=1`]) assert.equal((await run(get('/', { cookie: c }))).res.status, 401);
});
await test('changing the password signs everyone out', async () => {
  const cookie = await signIn();
  assert.equal((await run(get('/', { cookie }), { SITE_PASSWORD: 'a-brand-new-password-99' })).res.status, 401);
});
await test('sign-in cannot be used to send someone to another website', async () => {
  for (const next of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', 'evil', '', '/__human/logout', '/a\nb', '/' + 'x'.repeat(600)]) {
    assert.equal(safeNext(next), '/', next.slice(0, 30));
    const o = await run(login(PW, { next })); assert.equal(o.res.headers.get('location'), '/');
  }
  assert.equal(safeNext('/waitlist'), '/waitlist'); assert.equal(safeNext('/faq#waitlist'), '/faq#waitlist');
  const o = await run(get('/"><script>alert(1)</script>')); assert.ok(!/<script>alert/.test(o.text), 'the requested address is echoed unescaped');
});
await test('sign-in is only accepted from this site’s own page; other methods on the address go nowhere', async () => {
  for (const headers of [{ origin: 'https://evil.example' }, { origin: 'null' }]) { const o = await run(login(PW, { headers })); assert.equal(o.res.status, 403); assert.equal(o.res.headers.get('set-cookie'), null); }
  const noOrigin = new Request(SITE + LOGIN_PATH, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ password: PW }).toString() });
  assert.equal((await run(noOrigin)).res.status, 403);
  // a browser whose privacy settings blank the Origin header still signs in, because it also states "same-origin"
  const blank = await run(login(PW, { headers: { origin: 'null', 'sec-fetch-site': 'same-origin' } })); assert.equal(blank.res.status, 303);
  for (const sfs of ['cross-site', 'same-site', 'none']) assert.equal((await run(login(PW, { headers: { origin: 'null', 'sec-fetch-site': sfs } }))).res.status, 403, sfs);
  assert.equal((await run(login(PW, { headers: { origin: 'https://evil.example', 'sec-fetch-site': 'same-origin' } }))).res.status, 403);
  const g = await run(get(LOGIN_PATH)); assert.equal(g.res.status, 303); assert.equal(g.res.headers.get('location'), '/'); assert.equal(g.res.headers.get('set-cookie'), null);
});
await test('guessing is throttled: after ten wrong passwords from one address the eleventh attempt is refused even if correct; it lifts after fifteen minutes', async () => {
  let t = 1_800_000_000_000; const deps = { now: () => t };
  for (let i = 0; i < 10; i++) assert.equal((await run(login('guess-' + i), ENV, site(), deps)).res.status, 401);
  const blocked = await run(login(PW), ENV, site(), deps);
  assert.equal(blocked.res.status, 429); assert.equal(blocked.res.headers.get('set-cookie'), null); assert.equal(blocked.res.headers.get('retry-after'), '900'); closed(blocked.res);
  assert.equal((await run(login(PW, { headers: { 'cf-connecting-ip': '198.51.100.20' } }), ENV, site(), deps)).res.status, 303); // someone else is unaffected
  t += 15 * 60 * 1000 + 1;
  assert.equal((await run(login(PW), ENV, site(), deps)).res.status, 303);
  assert.ok(!JSON.stringify(blocked.logs).includes('203.0.113'), 'an address was logged');
});
await test('a wrong password is answered after a short delay, to slow guessing', async () => {
  let waited = 0;
  await run(login('nope'), ENV, site(), { wait: async (ms) => { waited += ms; } });
  assert.ok(waited >= 300, 'no delay');
});
await test('signing out clears the cookie', async () => {
  const o = await run(get(LOGOUT_PATH, { cookie: await signIn() }));
  assert.equal(o.res.status, 303); assert.match(o.res.headers.get('set-cookie'), new RegExp(`^${COOKIE}=; .*Max-Age=0`)); closed(o.res);
});
await test('the password never appears in any response, header or log line', async () => {
  const seen = [];
  const cookie = await signIn();
  for (const r of [get('/'), login(PW), login('wrong'), get('/', { cookie }), get('/api/waitlist', { accept: '*/*' }), get(LOGOUT_PATH), login(PW, { headers: { origin: 'https://evil.example' } })]) {
    const o = await run(r); seen.push(o.text, JSON.stringify([...o.res.headers]), JSON.stringify(o.logs));
  }
  seen.push(JSON.stringify((await run(get('/'), {})).logs));
  assert.ok(!seen.join('\n').includes(PW)); assert.ok(!seen.join('\n').includes('203.0.113.9'));
});

for (const [status, name, note] of results) console.log(`${status}  ${name}${note ? '\n      ↳ ' + note : ''}`);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed} passed, ${failed} failed, ${results.length} total`);
process.exit(failed ? 1 : 0);
