// HUMAN waitlist backend — unit checks for server/waitlist-core.ts.   Run:  npm run test:api
// EVERYTHING HERE IS MOCKED. No request leaves this machine and no database is contacted: Supabase is replaced by
// a function that records what it was sent and answers as Supabase's REST API does. The key used is a made-up string.
import assert from 'node:assert/strict';
import { handleWaitlistRequest, validate, restBase, resetRateLimit, MAX_BODY_BYTES, AGE_GROUPS, GENDERS, INTERESTS } from '../server/waitlist-core.ts';

const SITE = 'https://preview.example.test';
const FAKE_KEY = 'FAKE-TEST-KEY-not-a-real-secret';
const ENV = { WAITLIST_ENABLED: 'true', SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co', SUPABASE_SECRET_KEY: FAKE_KEY };
const IDEM = '3f2b8c1e-7a4d-4e9b-9c55-1a2b3c4d5e6f';
const good = () => ({
  firstName: 'Asha', ageGroup: '25–34', gender: 'Female', genderSelfDescribed: null, interests: ['hormonal', 'sleep'],
  email: 'Asha@Example.com', mobile: '+919812345678', city: 'Delhi', waitlistConsent: true,
  consentAt: new Date().toISOString(), privacyNoticeVersion: 'interim-2026-11-20',
});

/** a stand-in for Supabase: remembers rows, enforces the two unique rules, records every call */
function mockDb(mode = 'ok') {
  const calls = [], rows = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (mode === 'network') throw new TypeError('fetch failed');
    if (mode === 'unauthorised') return new Response(JSON.stringify({ message: 'Invalid API key' }), { status: 401 });
    if (mode === 'server') return new Response('upstream exploded', { status: 500 });
    if (mode === 'missing-column') return new Response(JSON.stringify({ code: 'PGRST204', message: "Could not find the 'city' column of 'waitlist_registrations' in the schema cache" }), { status: 400 });
    const row = JSON.parse(init.body);
    const clash = rows.find((r) => r.email === row.email) ? 'email' : rows.find((r) => r.idempotency_key && r.idempotency_key === row.idempotency_key) ? 'idempotency_key' : '';
    if (clash) return new Response(JSON.stringify({ code: '23505', message: `duplicate key value violates unique constraint "waitlist_registrations_${clash}_key"`, details: `Key (${clash})=(${row[clash]}) already exists.` }), { status: 409 });
    rows.push(row);
    return new Response(null, { status: 201 });
  };
  return { calls, rows, fetchImpl };
}
const req = (body, { method = 'POST', headers = {}, raw } = {}) =>
  new Request(SITE + '/api/waitlist', {
    method,
    headers: { 'content-type': 'application/json', origin: SITE, 'sec-fetch-site': 'same-origin', 'idempotency-key': IDEM, 'cf-connecting-ip': '203.0.113.7', ...headers },
    body: method === 'POST' ? (raw ?? JSON.stringify(body)) : undefined,
  });
const run = async (request, env = ENV, db = mockDb()) => {
  resetRateLimit(); // each check looks at one request; the throttle has its own test
  const logs = [];
  const res = await handleWaitlistRequest(request, env, { fetch: db.fetchImpl, log: (l) => logs.push(l) });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* empty */ }
  return { res, data, text, logs, db };
};

const results = [];
const test = async (name, fn) => {
  resetRateLimit();
  try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, String(e.message).split('\n')[0]]); }
};

// ---------- off by default ----------
await test('disabled by default: no variables at all → 503, body never read, database never contacted', async () => {
  for (const env of [{}, { WAITLIST_ENABLED: 'false', ...ENV, WAITLIST_ENABLED: 'false' }, { ...ENV, WAITLIST_ENABLED: 'TRUE' }, { ...ENV, WAITLIST_ENABLED: '1' }, { ...ENV, WAITLIST_ENABLED: ' true' }, { ...ENV, WAITLIST_ENABLED: undefined }]) {
    const r = await run(req(good()), env);
    assert.equal(r.res.status, 503); assert.equal(r.data.status, 'disabled'); assert.equal(r.db.calls.length, 0);
  }
});
await test('enabled but the key or the address is missing or wrong → 503, database never contacted', async () => {
  for (const patch of [{ SUPABASE_SECRET_KEY: '' }, { SUPABASE_SECRET_KEY: undefined }, { SUPABASE_URL: '' }, { SUPABASE_URL: 'not a url' }, { SUPABASE_URL: 'http://abcdefghijklmnop.supabase.co' }, { SUPABASE_URL: 'https://evil.example.com' }, { SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co.evil.com' }]) {
    const r = await run(req(good()), { ...ENV, ...patch });
    assert.equal(r.res.status, 503, JSON.stringify(patch)); assert.equal(r.db.calls.length, 0);
  }
  assert.equal(restBase('https://abcdefghijklmnop.supabase.co/'), 'https://abcdefghijklmnop.supabase.co/rest/v1/waitlist_registrations');
});

// ---------- a successful registration ----------
await test('valid submission → 200 accepted; exactly one INSERT with the right address, headers and columns', async () => {
  const r = await run(req(good()));
  assert.equal(r.res.status, 200); assert.deepEqual(r.data, { status: 'accepted' });
  assert.equal(r.db.calls.length, 1);
  const { url, init } = r.db.calls[0];
  assert.equal(url, 'https://abcdefghijklmnop.supabase.co/rest/v1/waitlist_registrations');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.apikey, FAKE_KEY); assert.equal(init.headers.Authorization, 'Bearer ' + FAKE_KEY);
  assert.equal(init.headers.Prefer, 'return=minimal'); // nothing is read back
  assert.deepEqual(Object.keys(JSON.parse(init.body)).sort(), ['age_group', 'city', 'consent_at_client', 'email', 'first_name', 'gender', 'gender_self_described', 'idempotency_key', 'interests', 'mobile', 'privacy_notice_version', 'waitlist_consent']);
  const row = r.db.rows[0];
  assert.equal(row.first_name, 'Asha'); assert.equal(row.email, 'asha@example.com'); assert.equal(row.age_group, '25–34');
  assert.deepEqual(row.interests, ['hormonal', 'sleep']); assert.equal(row.mobile, '+919812345678'); assert.equal(row.waitlist_consent, true);
  assert.equal(row.idempotency_key, IDEM); assert.equal(row.privacy_notice_version, 'interim-2026-11-20');
  assert.equal(r.res.headers.get('cache-control'), 'no-store'); assert.match(r.res.headers.get('content-type'), /application\/json/);
  assert.equal(r.res.headers.get('access-control-allow-origin'), null); // no other site is given permission
});
await test('only the required fields → accepted; optional values stored as null or empty', async () => {
  const r = await run(req({ firstName: '  Ravi ', email: 'ravi@example.com', waitlistConsent: true, privacyNoticeVersion: 'interim-2026-11-20' }), ENV);
  assert.equal(r.res.status, 200);
  const row = r.db.rows[0];
  assert.equal(row.first_name, 'Ravi'); assert.equal(row.age_group, null); assert.equal(row.gender, null); assert.deepEqual(row.interests, []);
  assert.equal(row.mobile, null); assert.equal(row.city, null); assert.equal(row.consent_at_client, null);
});
await test('every option the form offers is accepted (age groups, genders, all ten interests, self-described gender)', async () => {
  for (const ageGroup of AGE_GROUPS) for (const gender of GENDERS) {
    resetRateLimit();
    const r = await run(req({ ...good(), ageGroup, gender, genderSelfDescribed: 'non-binary', interests: INTERESTS, email: `a${Math.random()}@example.com` }, { headers: { 'idempotency-key': crypto.randomUUID() } }));
    assert.equal(r.res.status, 200, `${ageGroup} / ${gender}`);
    assert.equal(r.db.rows[0].gender_self_described, gender === 'Other / self-describe' ? 'non-binary' : null);
  }
});

// ---------- invalid submissions ----------
await test('consent: missing, false, or anything that is not the boolean true → 400, nothing stored', async () => {
  for (const v of [undefined, false, 'true', 1, 'on', null, {}]) {
    const body = good(); if (v === undefined) delete body.waitlistConsent; else body.waitlistConsent = v;
    const r = await run(req(body));
    assert.equal(r.res.status, 400, String(v)); assert.equal(r.data.status, 'invalid'); assert.equal(r.db.calls.length, 0);
    assert.equal(r.logs.at(-1).field, 'waitlistConsent');
  }
});
await test('each field is validated on the server → 400, nothing stored', async () => {
  const bad = {
    firstName: ['', '   ', 'x'.repeat(81), 42, null, 'Asha\u0000', ['Asha']],
    email: ['', 'not-an-email', 'a@b', 'a b@example.com', 'x'.repeat(250) + '@example.com', null, 7],
    ageGroup: ['18-24', '13–17', 'old', 5, ['25–34']],            // a hyphen is not the en dash
    gender: ['female', 'Other', 3],
    genderSelfDescribed: ['x'.repeat(61), 12],
    interests: ['sleep', ['sleep', 'sleep'], ['unknown'], [1], INTERESTS.concat('preventive'), { a: 1 }],
    mobile: ['12', '9812345678', '+91 98123 45678', '+1234567890123456', 99],
    city: ['x'.repeat(81), 5, 'Del\nhi'],
    privacyNoticeVersion: ['', null, 'has spaces', 'x'.repeat(65), '<script>'],
  };
  for (const [field, values] of Object.entries(bad)) for (const v of values) {
    const body = { ...good(), gender: field === 'genderSelfDescribed' ? 'Other / self-describe' : good().gender, [field]: v };
    const r = await run(req(body));
    assert.equal(r.res.status, 400, `${field} = ${JSON.stringify(v)} was accepted`); assert.equal(r.db.calls.length, 0);
    assert.equal(r.logs.at(-1).field, field);
  }
});
await test('unknown fields, non-objects and broken JSON → 400, nothing stored', async () => {
  for (const body of [{ ...good(), role: 'admin' }, { ...good(), id: 'x' }, [good()], 'text', 5, null]) {
    const r = await run(req(body)); assert.equal(r.res.status, 400); assert.equal(r.db.calls.length, 0);
  }
  const r = await run(req(null, { raw: '{"firstName":' })); assert.equal(r.res.status, 400); assert.equal(r.db.calls.length, 0);
});
await test('an Idempotency-Key that is not a UUID → 400; none at all is allowed', async () => {
  assert.equal((await run(req(good(), { headers: { 'idempotency-key': 'abc' } }))).res.status, 400);
  const h = new Headers({ 'content-type': 'application/json', origin: SITE });
  const r = await run(new Request(SITE + '/api/waitlist', { method: 'POST', headers: h, body: JSON.stringify(good()) }));
  assert.equal(r.res.status, 200); assert.equal(r.db.rows[0].idempotency_key, null);
});
await test('an implausible consent time is not stored (the database records its own)', async () => {
  for (const consentAt of ['1999-01-01T00:00:00Z', '2999-01-01T00:00:00Z', 'yesterday', 12345]) {
    const r = await run(req({ ...good(), consentAt })); assert.equal(r.res.status, 200); assert.equal(r.db.rows[0].consent_at_client, null);
  }
});

// ---------- request limits ----------
await test('request size: a body over 8 KB is refused with 413, whether or not it declares its size', async () => {
  const big = JSON.stringify({ ...good(), city: 'x'.repeat(MAX_BODY_BYTES) });
  let r = await run(req(null, { raw: big })); assert.equal(r.res.status, 413); assert.equal(r.db.calls.length, 0);
  // declared small, actually large: the stream is cut off at the limit
  const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(big)); c.close(); } });
  r = await run(new Request(SITE + '/api/waitlist', { method: 'POST', headers: { 'content-type': 'application/json', origin: SITE }, body: stream, duplex: 'half' }));
  assert.equal(r.res.status, 413); assert.equal(r.db.calls.length, 0);
  // just under the limit is still read (and then judged on its content)
  r = await run(req(null, { raw: JSON.stringify({ ...good(), city: 'Delhi' }) })); assert.equal(r.res.status, 200);
});
await test('wrong content type → 415; wrong method → 405; a preflight is given no permission', async () => {
  let r = await run(req(good(), { headers: { 'content-type': 'text/plain' } })); assert.equal(r.res.status, 415); assert.equal(r.db.calls.length, 0);
  r = await run(req(good(), { headers: { 'content-type': 'application/x-www-form-urlencoded' } })); assert.equal(r.res.status, 415);
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) { r = await run(req(good(), { method })); assert.equal(r.res.status, 405, method); assert.equal(r.db.calls.length, 0); }
  r = await run(new Request(SITE + '/api/waitlist', { method: 'OPTIONS', headers: { origin: 'https://other.example', 'access-control-request-method': 'POST' } }));
  assert.equal(r.res.status, 204); assert.equal(r.res.headers.get('access-control-allow-origin'), null); assert.equal(r.res.headers.get('access-control-allow-methods'), null);
});

// ---------- unauthorised requests ----------
await test('requests that do not come from this website’s own pages → 403, nothing stored', async () => {
  for (const headers of [{ origin: 'https://evil.example' }, { origin: 'null' }, { origin: SITE.replace('https', 'http') }, { origin: SITE + '.evil.com' }, { 'sec-fetch-site': 'cross-site' }, { 'sec-fetch-site': 'same-site' }]) {
    const r = await run(req(good(), { headers })); assert.equal(r.res.status, 403, JSON.stringify(headers)); assert.equal(r.db.calls.length, 0);
  }
  const noOrigin = new Request(SITE + '/api/waitlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(good()) });
  const r = await run(noOrigin); assert.equal(r.res.status, 403); assert.equal(r.db.calls.length, 0);
});
await test('rate limit: the ninth request from one address inside ten minutes → 429; another address is unaffected; the window expires', async () => {
  const db = mockDb(); let t = 1_800_000_000_000; const logs = [];
  const go = (ip, i) => handleWaitlistRequest(req({ ...good(), email: `p${i}@example.com` }, { headers: { 'cf-connecting-ip': ip, 'idempotency-key': crypto.randomUUID() } }), ENV, { fetch: db.fetchImpl, now: () => t, log: (l) => logs.push(l) });
  for (let i = 0; i < 8; i++) assert.equal((await go('198.51.100.1', i)).status, 200);
  const ninth = await go('198.51.100.1', 9); assert.equal(ninth.status, 429); assert.equal(ninth.headers.get('retry-after'), '600');
  assert.equal((await go('198.51.100.2', 20)).status, 200);
  t += 10 * 60 * 1000 + 1;
  assert.equal((await go('198.51.100.1', 30)).status, 200);
  assert.ok(!JSON.stringify(logs).includes('198.51.100'), 'an address was logged');
});

// ---------- duplicates ----------
await test('duplicate email: answered exactly like a new registration, one row only, in any letter case', async () => {
  const db = mockDb();
  const first = await run(req(good()), ENV, db);
  const again = await run(req({ ...good(), email: 'ASHA@example.COM', firstName: 'Someone Else' }, { headers: { 'idempotency-key': crypto.randomUUID() } }), ENV, db);
  assert.equal(first.res.status, 200); assert.equal(again.res.status, 200);
  assert.equal(again.text, first.text); // the same bytes: nothing reveals that the address was already there
  assert.equal(db.rows.length, 1); assert.equal(db.rows[0].first_name, 'Asha'); // and the existing record was not changed
  assert.equal(again.logs.at(-1).outcome, 'accepted-existing');
});
await test('the same submission sent twice (same Idempotency-Key) is stored once', async () => {
  const db = mockDb();
  await run(req(good()), ENV, db);
  const r = await run(req({ ...good(), email: 'other@example.com' }), ENV, db); // same key, different email
  assert.equal(r.res.status, 200); assert.equal(db.rows.length, 1);
});

// ---------- failures and secrecy ----------
await test('database failures → 502 with a neutral message; no database text reaches the visitor', async () => {
  for (const mode of ['network', 'unauthorised', 'server', 'missing-column']) {
    const r = await run(req(good()), ENV, mockDb(mode));
    assert.equal(r.res.status, 502, mode); assert.equal(r.data.status, 'error');
    assert.ok(!/Invalid API key|exploded|schema cache|column|supabase/i.test(r.text), mode + ': ' + r.text);
  }
  const r = await run(req(good()), ENV, mockDb('missing-column'));
  assert.equal(r.logs.at(-1).code, 'PGRST204'); assert.match(r.logs.at(-1).schemaNote, /city/); // a set-up mistake is diagnosable from the log
});
await test('the secret key and the visitor’s details never appear in a response or a log line', async () => {
  const seen = [];
  for (const [mode, body, env] of [['ok', good(), ENV], ['ok', { ...good(), email: 'bad' }, ENV], ['unauthorised', good(), ENV], ['network', good(), ENV], ['ok', good(), {}], ['missing-column', good(), ENV]]) {
    const db = mockDb(mode); if (mode === 'ok') await run(req(good()), ENV, db); // second pass exercises the duplicate path
    resetRateLimit();
    const r = await run(req(body), env, db);
    seen.push(r.text, JSON.stringify([...r.res.headers]), JSON.stringify(r.logs));
  }
  const all = seen.join('\n');
  for (const secret of [FAKE_KEY, 'asha@example.com', 'Asha@Example.com', '+919812345678', 'Delhi', '203.0.113.7', 'hormonal']) assert.ok(!all.includes(secret), 'leaked: ' + secret);
  assert.ok(!/"first_name"|Asha/.test(all), 'a name was leaked');
});
await test('validate() alone: a clean row from good input; rejects without throwing on hostile input', () => {
  const v = validate(good(), IDEM, Date.now()); assert.equal(v.ok, true);
  for (const hostile of [undefined, null, 0, '', [], { __proto__: { waitlistConsent: true } }, { waitlistConsent: true, firstName: { toString: () => 'x' } }, JSON.parse('{"waitlistConsent":true,"firstName":"A","email":"a@b.co","privacyNoticeVersion":"v","constructor":1}')]) assert.equal(validate(hostile, null, Date.now()).ok, false);
});

for (const [status, name, note] of results) console.log(`${status}  ${name}${note ? '\n      ↳ ' + note : ''}`);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed} passed, ${failed} failed, ${results.length} total  (all mocked: no database was contacted)`);
process.exit(failed ? 1 : 0);
