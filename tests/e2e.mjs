// HUMAN end-to-end checks. Run against a built preview:  npm run build && npm run preview &  then  npm run test:e2e
// Uses the Playwright library directly (no test runner dependency). Results print as PASS / FAIL with the test ID
// from the master prompt (K03 / K06). Nothing here sends data anywhere except the local preview server.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:4321';
const results = [];
const browser = await chromium.launch();

async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await c.newPage();
  page.consoleErrors = [];
  page.requests = [];
  page.on('console', (m) => m.type() === 'error' && page.consoleErrors.push(m.text()));
  page.on('pageerror', (e) => page.consoleErrors.push(String(e)));
  page.on('request', (r) => page.requests.push({ url: r.url(), method: r.method(), body: r.postData() }));
  return page;
}
async function test(id, name, fn) {
  try {
    await fn();
    results.push({ id, name, status: 'PASS' });
  } catch (e) {
    results.push({ id, name, status: 'FAIL', note: String(e.message || e).split('\n')[0] });
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const go = async (page, path) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
};
const ROUTES = ['/', '/women', '/men', '/about', '/faq', '/waitlist', '/privacy', '/terms', '/medical-disclaimer'];

// ---------- homepage ----------
await test('E2E-01', 'Direct load /: exact headline, CTA visible, no missing assets, no console errors', async () => {
  const p = await ctx();
  const failed = [];
  p.on('response', (r) => r.status() >= 400 && failed.push(r.url()));
  await go(p, '/');
  const h1 = await p.locator('h1').innerText();
  assert(/^HOW WELL DO YOU\s+know your health\?$/.test(h1.trim()), `headline was "${h1}"`);
  const l1 = await p.locator('.hero__l1').evaluate((e) => getComputedStyle(e).textTransform + '|' + e.textContent);
  assert(l1 === 'uppercase|How well do you', 'line 1 styling');
  const l2 = await p.locator('.hero__l2').evaluate((e) => getComputedStyle(e).fontStyle + '|' + e.textContent);
  assert(l2 === 'italic|know your health?', 'line 2 styling');
  assert(await p.locator('.hero a.btn[href="/waitlist"]').isVisible(), 'hero CTA not visible');
  assert(await p.locator('.hero .status-pill').isVisible(), 'status label not visible');
  assert(failed.length === 0, 'failed requests: ' + failed.join(', '));
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('GATE1-390', 'Hero at 390x844: wordmark, headline, CTA and status all inside first viewport; copy sits below the wordmark', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 } });
  await go(p, '/');
  for (const sel of ['.hero h1', '.hero a.btn', '.hero .status-pill']) {
    const b = await p.locator(sel).boundingBox();
    assert(b && b.y >= 0 && b.y + b.height <= 844, `${sel} outside first viewport`);
  }
  const img = await p.locator('[data-ih-slot]').boundingBox();
  const h1 = await p.locator('.hero h1').boundingBox();
  assert(img.y >= 60 && img.x >= 0 && img.x + img.width <= 390, 'wordmark outside the viewport or under the header');
  assert(h1.y >= img.y + img.height, 'headline overlaps the wordmark');
  await p.context().close();
});

await test('GATE1-1440', 'Hero at 1440x900: headline in the left half below the wordmark, not clipped', async () => {
  const p = await ctx();
  await go(p, '/');
  const b = await p.locator('.hero__l1').boundingBox();
  assert(b.x + b.width < 1440 * 0.5, `headline right edge at ${Math.round(b.x + b.width)}px`);
  const clipped = await p.locator('.hero h1').evaluate((e) => e.scrollWidth > e.clientWidth + 1);
  assert(!clipped, 'headline clipped');
  const art = await p.locator('[data-ih-slot]').boundingBox();
  assert(b.y >= art.y + art.height, 'headline overlaps the wordmark');
  for (const sel of ['.hero h1', '.hero a.btn', '.hero .status-pill', '[data-ih-slot]']) {
    const r = await p.locator(sel).boundingBox();
    assert(r.y >= 0 && r.y + r.height <= 900, sel + ' outside first viewport');
  }
  await p.context().close();
});

// ── INSIDE HUMAN hero film ──────────────────────────────────────────────────────────────────────────────────────
const ihAt = async (p, f) => {
  await p.evaluate((f) => {
    const t = document.querySelector('[data-ih-track]');
    const span = t.offsetHeight - document.querySelector('[data-ih-stage]').offsetHeight;
    scrollTo({ top: span * f, behavior: 'instant' });
  }, f);
  await p.waitForTimeout(220);
};
const ihState = (p) =>
  p.evaluate(() => {
    const sec = document.querySelector('[data-ih]');
    const vb = sec.querySelector('[data-ih-art]').getAttribute('viewBox').split(/\s+/).map(Number);
    return {
      act: sec.dataset.ihAct,
      vb,
      open: Number(sec.querySelector('[data-ih-open]').getAttribute('r')),
      dark: Number(getComputedStyle(sec.querySelector('[data-ih-dark]')).opacity),
      copy: Number(getComputedStyle(sec.querySelector('.ih__below')).opacity),
      inert: sec.querySelector('.ih__below').inert,
      film: sec.classList.contains('is-film'),
    };
  });

await test('IH-01', 'INSIDE HUMAN: five letters H-U-M-A-N, each clipped to its own letterform and carrying its assigned photograph; one eye image only', async () => {
  const p = await ctx();
  await go(p, '/');
  const d = await p.evaluate(() =>
    [...document.querySelectorAll('[data-ih-letter]')].map((g) => ({
      k: g.dataset.ihLetter,
      clip: g.getAttribute('clip-path'),
      imgs: [...g.querySelectorAll('image')].map((i) => i.getAttribute('href')),
      x: g.getBoundingClientRect().x,
    })),
  );
  assert(d.map((l) => l.k).join('') === 'human', 'letters: ' + d.map((l) => l.k).join(''));
  const want = { h: 'h-run-club', u: 'u-female', m: 'm-eye', a: 'a-couple', n: 'n-mature-man' };
  for (const l of d) {
    assert(l.clip === `url(#ih-clip-${l.k})`, l.k + ' clip ' + l.clip);
    assert(l.imgs.length === 1 && l.imgs[0].includes(want[l.k]), l.k + ' photo ' + l.imgs);
    assert(await p.locator(`#ih-clip-${l.k} path`).count(), l.k + ' has no letter path');
  }
  for (let i = 1; i < d.length; i++) assert(d[i].x > d[i - 1].x, 'letters out of order');
  assert((await p.locator('.hero image[href*="m-eye"]').count()) === 1, 'more than one eye image');
  assert((await p.locator('.hero video, .hero canvas').count()) === 0, 'video or canvas in the hero');
  await p.context().close();
});

await test('IH-02', 'INSIDE HUMAN: scroll drives statement → entering M → full-screen eye → darkness, and reverses exactly', async () => {
  const p = await ctx();
  await go(p, '/');
  const s0 = await ihState(p);
  assert(s0.film && s0.act === '1' && s0.copy === 1 && !s0.inert && s0.dark === 0 && s0.open === 0, 'start ' + JSON.stringify(s0));
  await ihAt(p, 0.2);
  const s2 = await ihState(p);
  assert(s2.act === '2' && Math.abs(s2.vb[2] - s0.vb[2]) < 0.5, 'wordmark should hold still while the photographs move');
  await ihAt(p, 0.7);
  const s4 = await ihState(p);
  assert(s4.vb[2] < 120, 'eye not full-screen: viewBox width ' + s4.vb[2]);
  assert(Math.abs(s4.vb[0] + s4.vb[2] / 2 - 270.6) < 1 && Math.abs(s4.vb[1] + s4.vb[3] / 2 - 66.4) < 1, 'camera not centred on the pupil');
  assert(s4.open > Math.hypot(s4.vb[2], s4.vb[3]) / 2, 'letter still masks the eye: r=' + s4.open);
  assert(s4.copy === 0 && s4.inert, 'hero copy still present during the eye');
  assert(s4.dark === 0, 'darkness too early');
  await ihAt(p, 1);
  const s6 = await ihState(p);
  assert(s6.act === '6' && s6.dark === 1, 'end ' + JSON.stringify(s6));
  await ihAt(p, 0.7);
  const r4 = await ihState(p);
  assert(JSON.stringify(r4.vb.map((v) => v.toFixed(2))) === JSON.stringify(s4.vb.map((v) => v.toFixed(2))) && r4.dark === 0, 'reverse to the eye differs');
  await ihAt(p, 0);
  const r0 = await ihState(p);
  assert(JSON.stringify(r0) === JSON.stringify(s0), 'reverse to start differs: ' + JSON.stringify(r0));
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('IH-03', 'INSIDE HUMAN: the film hands over to the next section on dark; Skip intro jumps there and moves focus', async () => {
  const p = await ctx();
  await go(p, '/');
  await ihAt(p, 1);
  const next = await p.evaluate(() => {
    const n = document.querySelector('[data-ih] ~ section');
    return { top: n.getBoundingClientRect().top, bg: getComputedStyle(n).backgroundColor };
  });
  assert(Math.abs(next.top - 900) < 4, 'next section not directly below the stage: ' + next.top);
  await ihAt(p, 0);
  await p.locator('[data-ih-skip]').click();
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => {
    const n = document.querySelector('[data-ih] ~ section');
    return { top: n.getBoundingClientRect().top, focus: n.contains(document.activeElement) || document.activeElement === n };
  });
  assert(after.top < 120 && after.top > -120, 'skip landed at ' + after.top);
  assert(after.focus, 'focus did not move past the film');
  await p.context().close();
});

await test('IH-04', 'INSIDE HUMAN: reduced motion and no JavaScript both give a single static screen with the full copy', async () => {
  for (const opt of [{ reducedMotion: 'reduce' }, { javaScriptEnabled: false }]) {
    const p = await ctx(opt);
    await go(p, '/');
    const d = await p.evaluate(() => {
      const sec = document.querySelector('[data-ih]');
      return { film: sec.classList.contains('is-film'), h: sec.offsetHeight, vh: innerHeight, skip: getComputedStyle(sec.querySelector('[data-ih-skip]')).display };
    });
    assert(!d.film && d.h < d.vh * 1.6, JSON.stringify(opt) + ' ' + JSON.stringify(d));
    assert(d.skip === 'none', 'skip control shown without a film');
    for (const sel of ['.hero h1', '.hero a.btn', '.hero .status-pill', '[data-ih-art]']) assert(await p.locator(sel).isVisible(), sel + ' hidden');
    await p.context().close();
  }
});

await test('IH-05', 'INSIDE HUMAN: no horizontal overflow and wordmark fully on screen at eight viewport sizes; header legible on the light hero', async () => {
  for (const [w, h] of [[1920, 1080], [1600, 900], [1366, 768], [1280, 720], [768, 1024], [390, 844], [375, 667], [360, 640]]) {
    const p = await ctx({ viewport: { width: w, height: h } });
    await go(p, '/');
    const d = await p.evaluate(() => {
      const r = document.querySelector('[data-ih-slot]').getBoundingClientRect();
      const b = document.querySelector('.hero a.btn').getBoundingClientRect();
      const hd = document.querySelector('.site-header').getBoundingClientRect();
      const logo = document.querySelector('.site-header a');
      return { over: document.documentElement.scrollWidth - innerWidth, l: r.left, r: r.right, t: r.top, hb: hd.bottom, btn: b.bottom, color: getComputedStyle(logo).color };
    });
    assert(d.over <= 0, `${w}x${h} overflow ${d.over}`);
    assert(d.l >= 0 && d.r <= w + 0.5, `${w}x${h} wordmark off screen`);
    assert(d.t >= d.hb - 1, `${w}x${h} wordmark under the header`);
    assert(d.btn <= h, `${w}x${h} CTA below the fold (${Math.round(d.btn)})`);
    const [r, g, b] = d.color.match(/\d+/g).map(Number);
    assert(r + g + b < 300, `${w}x${h} header text too light on ivory: ${d.color}`);
    await p.context().close();
  }
});

await test('E2E-03', 'Hero waitlist CTA opens /waitlist on the Welcome chapter', async () => {
  const p = await ctx();
  await go(p, '/');
  await p.locator('.hero a.btn').click();
  await p.waitForURL('**/waitlist');
  assert(await p.locator('#wl-h-welcome').isVisible(), 'welcome not shown');
  await p.context().close();
});

await test('E2E-04', 'Story cue scrolls to Scene 01; skip link reaches Scene 06 (V3-QA-09 deep anchors)', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/');
  await p.locator('.hero a[href="#scene-01"]').click();
  await p.waitForTimeout(300);
  assert((await p.locator('#scene-01').boundingBox()).y < 200, 'scene 01 not reached');
  await go(p, '/#scene-06');
  await p.waitForTimeout(300);
  assert(await p.locator('#s6-title').isVisible(), 'scene 06 heading not visible');
  const y = (await p.locator('#scene-06').boundingBox()).y;
  assert(y > -5 && y < 200, 'deep link landed at ' + y);
  await p.context().close();
});

await test('GATE2-ORDER', 'Eight scenes in locked order; transition line appears exactly once', async () => {
  const p = await ctx();
  await go(p, '/');
  const ids = await p.locator('section[id^="scene-"]').evaluateAll((els) => els.map((e) => e.id));
  assert(ids.join() === 'scene-01,scene-02,scene-03,scene-04,scene-05,scene-06,scene-07,scene-08', ids.join());
  const text = await p.locator('main').innerText();
  const n = (text.match(/another\s+side\s+to your health/gi) || []).length;
  assert(n === 1, `transition line appears ${n} times`);
  await p.context().close();
});

// ---------- Scene 03: phone → overview → heart, then an explorer of eight systems ----------
const s3At = async (p, f, wait = 200) => {
  await p.evaluate((f) => {
    const pin = document.querySelector('.s3__pin');
    const span = pin.offsetHeight - document.querySelector('.s3__stage').offsetHeight;
    scrollTo({ top: pin.getBoundingClientRect().top + scrollY + span * f, behavior: 'instant' });
  }, f);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await p.waitForTimeout(wait);
};
const s3Read = (p) =>
  p.evaluate(() => {
    const sec = document.querySelector('#scene-03');
    const o = (sel) => Number(getComputedStyle(sec.querySelector(sel)).opacity);
    const live = [...sec.querySelectorAll('[data-s3-slot]')].find((i) => Number(i.style.opacity) === 1);
    return {
      p: parseFloat(sec.style.getPropertyValue('--p')),
      state: sec.dataset.state,
      sel: sec.dataset.sel,
      phone: o('[data-s3-phone]'),
      overview: o('[data-s3-l="overview"]'),
      heartlum: o('[data-s3-l="heartlum"]'),
      heart: o('[data-s3-l="heart"]'),
      ex: o('[data-s3-ex]'),
      shown: live ? live.currentSrc || live.src : '',
      title: sec.querySelector('[data-s3-info]:not([style*="display: none"]) [data-f="title"]').textContent.trim(),
      pressed: [...sec.querySelectorAll('[data-s3-sys][aria-pressed="true"]')].map((b) => b.dataset.s3Sys),
      tick: [...sec.querySelectorAll('[data-s3-tick][aria-pressed="true"]')].map((b) => b.dataset.s3Tick),
    };
  });
const S3 = {
  heart: ['04-heart-focus', 'More than a heartbeat.'],
  lungs: ['05-lungs', 'Every breath has a story.'],
  metabolic: ['11-metabolic', 'Energy has an invisible story.'],
  digestion: ['06-digestive', 'What happens after you eat?'],
  thyroid: ['07-thyroid', 'Small gland. Far-reaching influence.'],
  nervous: ['08-nervous', 'A remarkable network.'],
  circulation: ['09-circulation', 'A connection within everything.'],
  reproductive: ['10-reproductive', 'Health changes through life.'],
};
const VIEWS = [{}, { viewport: { width: 390, height: 844 } }];

await test('E2E-05/06', 'Scene 03 guided sequence: phone → enter → overview → heart → explore, in order, and it reverses cleanly', async () => {
  for (const opts of VIEWS) {
    const p = await ctx(opts);
    await go(p, '/');
    const seen = [];
    for (const f of [0.02, 0.25, 0.5, 0.74, 0.95]) {
      await s3At(p, f, 450);
      seen.push(await s3Read(p));
    }
    assert(seen.map((r) => r.state).join() === 'phone,enter,overview,heart,explore', seen.map((r) => r.state).join());
    assert(seen[0].phone > 0.95 && seen[0].overview === 0, `phone state ${JSON.stringify(seen[0])}`);
    assert(seen[2].phone === 0 && seen[2].overview === 1 && seen[2].heartlum === 0, `overview state ${JSON.stringify(seen[2])}`);
    assert(seen[3].overview === 0 && seen[3].heartlum === 1, `luminous heart ${JSON.stringify(seen[3])}`);
    assert(seen[4].heart === 1 && seen[4].ex === 1 && seen[4].shown.includes('04-heart-focus') && seen[4].pressed.join() === 'heart', `explore ${JSON.stringify(seen[4])}`);
    assert(seen[4].title === 'More than a heartbeat.', 'explorer does not start on the heart');
    await s3At(p, 0.02, 500);
    const back = await s3Read(p);
    assert(back.state === 'phone' && back.phone > 0.95 && back.ex === 0 && back.pressed.length === 0, `did not reverse: ${JSON.stringify(back)}`);
    assert(await p.locator('#s3-title').isVisible(), 'heading hidden');
    // never trapped: the page scrolls on past the scene into Scene 04
    await p.evaluate(() => document.querySelector('#scene-04').scrollIntoView({ behavior: 'instant' }));
    assert(await p.locator('#s4-title').isVisible(), 'cannot reach Scene 04');
    assert(p.consoleErrors.length === 0, `console: ${p.consoleErrors[0]}`);
    await p.context().close();
  }
});

await test('S3-GHOST', 'Scene 03: the phone is gone before the overview settles, and no more than two stills ever overlap, briefly', async () => {
  for (const opts of VIEWS) {
    const p = await ctx(opts);
    await go(p, '/');
    let overlap = 0;
    for (let f = 0; f <= 1.0001; f += 0.01) {
      await s3At(p, f, 0);
      const r = await s3Read(p);
      const up = [r.phone, r.overview, r.heartlum].filter((v) => v > 0.02).length;
      // heart-focus sits directly on its luminous twin (same framing), so that pair is a lighting change, not a blend of bodies
      assert(up <= 2, `three stills at ${f.toFixed(2)}: ${JSON.stringify(r)}`);
      if (up === 2) overlap++;
      if (r.state === 'overview' || r.state === 'heart' || r.state === 'explore') assert(r.phone === 0, `phone visible in ${r.state} at ${f.toFixed(2)}`);
      if (r.heart > 0.02) assert(r.overview === 0 && r.phone === 0, `dark heart over another body at ${f.toFixed(2)}`);
    }
    assert(overlap <= 14, `handovers too long: ${overlap}% of the scroll`);
    await p.context().close();
  }
});

await test('S3-SYSTEMS', 'Scene 03 explorer: all eight systems, the strip, overview and markers each show the right artwork, copy and selected state', async () => {
  for (const opts of VIEWS) {
    const p = await ctx(opts);
    const mobile = !!opts.viewport;
    await go(p, '/');
    await s3At(p, 0.05);
    assert(await p.locator('[data-s3-ui]').first().evaluate((e) => e.inert), 'system controls live during the phone state');
    assert(!(await p.locator('[data-s3-sys]').first().isVisible()), 'system list visible during the phone state');
    await s3At(p, 0.96, 700);
    assert((await p.locator('[data-s3-sys]').count()) === 8 && (await p.locator('[data-s3-tick]').count()) === 8, 'eight systems, eight markers');
    // positions are measured against the stage itself, so a page scroll by the test driver does not count as movement
    const geom = () => p.evaluate(() => { const st = document.querySelector('.s3__stage').getBoundingClientRect(); return ['.s3__nav', '.s3__strip', '.s3__frame'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left - st.left, r.top - st.top, r.width, r.height].map(Math.round).join(); }).join('|'); });
    const g0 = await geom();
    for (const [k, [file, title]] of Object.entries(S3)) {
      await p.locator(`[data-s3-sys="${k}"]`).click();
      await p.waitForFunction((f) => [...document.querySelectorAll('[data-s3-slot]')].some((i) => i.style.opacity === '1' && (i.currentSrc || i.src).includes(f)), file, { timeout: 5000 });
      const r = await s3Read(p);
      assert(r.title === title && r.pressed.join() === k && r.tick.join() === k && r.sel === k, `${k}: ${JSON.stringify(r)}`);
      assert((await p.locator('[data-s3-slot]').evaluateAll((els) => els.filter((i) => i.style.opacity === '1').length)) === 1, `${k}: not exactly one artwork shown`);
      assert((await geom()) === g0, `${k}: the interface moved`);
    }
    // previous / next wrap around the eight; the strip's markers select directly (wide screens)
    await p.locator('[data-s3-next]').click();
    assert((await s3Read(p)).sel === 'heart', 'next did not wrap to the heart');
    await p.locator('[data-s3-prev]').click();
    assert((await s3Read(p)).sel === 'reproductive', 'previous did not wrap');
    if (!mobile) {
      await p.locator('[data-s3-tick="thyroid"]').click();
      assert((await s3Read(p)).sel === 'thyroid', 'marker did not select');
    }
    // overview, then a marker on the overview illustration opens that system
    await p.locator('[data-s3-over]').click();
    await p.waitForFunction(() => [...document.querySelectorAll('[data-s3-slot]')].some((i) => i.style.opacity === '1' && (i.currentSrc || i.src).includes('02-overview')));
    let r = await s3Read(p);
    assert(r.title === 'One body. Many connected systems.' && r.pressed.length === 0, `overview: ${JSON.stringify(r)}`);
    assert((await p.locator('[data-s3-over]').getAttribute('aria-pressed')) === 'true', 'overview not marked');
    assert((await p.locator('.s3__spot:visible').count()) === 5, 'overview markers missing');
    await p.locator('[data-s3-spot="lungs"]').click();
    await p.waitForFunction(() => [...document.querySelectorAll('[data-s3-slot]')].some((i) => i.style.opacity === '1' && (i.currentSrc || i.src).includes('05-lungs')));
    assert(await p.locator('[data-s3-spots]').evaluate((e) => e.inert), 'overview markers still live on a system view');
    await p.waitForTimeout(450);
    assert((await p.locator('.s3__spot:visible').count()) === 0, 'overview markers left on a system view');
    // rapid switching: the last choice wins and nothing is left half-shown
    for (const k of ['heart', 'nervous', 'digestion', 'thyroid', 'circulation', 'metabolic']) await p.locator(`[data-s3-sys="${k}"]`).click({ delay: 0 });
    await p.waitForFunction(() => [...document.querySelectorAll('[data-s3-slot]')].some((i) => i.style.opacity === '1' && (i.currentSrc || i.src).includes('11-metabolic')), null, { timeout: 5000 });
    await p.waitForTimeout(700);
    r = await s3Read(p);
    assert(r.sel === 'metabolic' && r.title === S3.metabolic[1] && r.pressed.join() === 'metabolic', `rapid: ${JSON.stringify(r)}`);
    assert((await p.locator('[data-s3-slot]').evaluateAll((els) => els.filter((i) => i.style.opacity === '1').length)) === 1, 'rapid: two artworks left visible');
    // scrolling does not reset the choice; scrolling back and returning remembers it
    await p.mouse.wheel(0, 60);
    await p.waitForTimeout(250);
    assert((await s3Read(p)).sel === 'metabolic', 'scroll reset the selection');
    await s3At(p, 0.5, 400);
    assert((await s3Read(p)).ex === 0, 'explorer artwork over the guided sequence');
    await s3At(p, 0.97, 900);
    r = await s3Read(p);
    assert(r.state === 'explore' && r.sel === 'metabolic' && r.shown.includes('11-metabolic'), `selection not remembered: ${JSON.stringify(r)}`);
    assert((await p.locator('#scene-03').count()) === 1 && (await p.locator('[data-s3-sys]').count()) === 8, 'duplicated scene or controls');
    assert(p.consoleErrors.length === 0, `console: ${p.consoleErrors[0]}`);
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
    await p.context().close();
  }
});

await test('S3-ENTER', 'Scene 03: the phone’s Explore control and an overview marker both carry the visitor into the explorer; keyboard works', async () => {
  const p = await ctx({ reducedMotion: 'no-preference' });
  await go(p, '/');
  await s3At(p, 0.03, 400);
  await p.locator('[data-s3-enter]').click();
  await p.waitForFunction(() => document.querySelector('#scene-03').dataset.state === 'explore', null, { timeout: 8000 });
  assert(await p.locator('[data-s3-screen]').evaluate((e) => e.inert), 'phone overlay still focusable in the explorer');
  await s3At(p, 0.5, 500);
  await p.locator('[data-s3-spot="thyroid"]').click();
  await p.waitForFunction(() => { const s = document.querySelector('#scene-03'); return s.dataset.state === 'explore' && [...s.querySelectorAll('[data-s3-slot]')].some((i) => i.style.opacity === '1' && (i.currentSrc || i.src).includes('07-thyroid')); }, null, { timeout: 8000 });
  // keyboard: buttons are real buttons; Enter and Space select; arrows move along the list; focus is visible
  await p.locator('[data-s3-sys="lungs"]').focus();
  await p.keyboard.press('Enter');
  assert((await s3Read(p)).sel === 'lungs', 'Enter did not select');
  await p.keyboard.press('ArrowDown');
  assert(await p.evaluate(() => document.activeElement?.getAttribute('data-s3-sys') === 'metabolic'), 'arrow key did not move focus');
  await p.keyboard.press('Space');
  assert((await s3Read(p)).sel === 'metabolic', 'Space did not select');
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  assert(ring !== 'none', 'no visible focus on the system buttons');
  for (const sel of ['[data-s3-sys]', '[data-s3-tick]', '[data-s3-prev]', '[data-s3-next]', '[data-s3-over]', '[data-s3-spot]'])
    for (const b of await p.locator(sel).all()) assert(((await b.getAttribute('aria-label')) || (await b.innerText())).trim().length > 1, `${sel} has no accessible name`);
  await p.context().close();
});

await test('S3-FALLBACK', 'Scene 03 without JavaScript: overview still, all eight systems written out; reduced motion: no pin, explorer available directly', async () => {
  const p = await ctx({ javaScriptEnabled: false });
  await go(p, '/');
  await p.locator('#scene-03').scrollIntoViewIfNeeded();
  assert((await p.locator('.s3__plain article:visible').count()) === 8, 'systems not written out without JS');
  assert((await p.locator('[data-s3-sys]:visible, .s3__spot:visible, .s3__strip:visible').count()) === 0, 'dead controls shown without JS');
  assert((await p.locator('.s3__stage').evaluate((e) => getComputedStyle(e).position)) !== 'sticky', 'pinned without JS');
  assert(Number(await p.locator('[data-s3-l="overview"]').evaluate((e) => getComputedStyle(e).opacity)) === 1, 'overview still hidden without JS');
  assert(!(await p.locator('[data-s3-phone]').isVisible()), 'phone shown without JS');
  assert(/An illustration, not a scan/.test(await p.locator('#scene-03').innerText()), 'disclaimer missing');
  await p.context().close();
  for (const opts of VIEWS) {
    const r = await ctx({ ...opts, reducedMotion: 'reduce' });
    await go(r, '/');
    await r.locator('.s3__frame').scrollIntoViewIfNeeded();
    await r.waitForTimeout(500);
    assert((await r.locator('.s3__stage').evaluate((e) => getComputedStyle(e).position)) !== 'sticky', 'pinned with reduced motion');
    assert((await r.locator('.s3__pin').evaluate((e) => e.offsetHeight)) < 1400, 'long scroll track with reduced motion');
    let st = await s3Read(r);
    assert(st.state === 'explore' && st.sel === 'overview' && st.shown.includes('02-overview'), `reduced: ${JSON.stringify(st)}`);
    for (const k of ['heart', 'reproductive']) {
      await r.locator(`[data-s3-sys="${k}"]`).click();
      await r.waitForFunction((f) => [...document.querySelectorAll('[data-s3-slot]')].some((i) => i.style.opacity === '1' && (i.currentSrc || i.src).includes(f)), S3[k][0]);
      st = await s3Read(r);
      assert(st.title === S3[k][1], `reduced ${k}: ${st.title}`);
    }
    assert(await r.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow with reduced motion');
    await r.context().close();
  }
});

await test('S3-HONEST', 'Scene 03 shows no values, scores or diagnostic claims, keeps the disclaimer, and has no muscular system', async () => {
  const p = await ctx();
  await go(p, '/');
  const t = await p.locator('#scene-03').evaluate((e) => e.textContent);
  assert(/An illustration, not a scan\. It does not show anyone’s results\./.test(t), 'disclaimer missing');
  assert(/Not everyone needs every test/.test(t), 'closing caveat missing');
  assert(!/\b\d+\s?(bpm|mmHg|mg\/dL|%|SpO2)/i.test(t) && !/\b(score|risk level|diagnos(is|e|tic)|your results|muscular)\b/i.test(t.replace(/does not show anyone’s results/g, '')), 'values, scores or diagnostic wording present');
  assert((await p.locator('#scene-03 img[alt]:not([alt=""])').count()) >= 2, 'meaningful images lack descriptions');
  await p.context().close();
});

await test('E2E-07', 'Resize from desktop to mobile inside Scene 03: no overflow, state stays coherent, copy leaves the pin', async () => {
  const p = await ctx();
  await go(p, '/');
  await s3At(p, 0.96, 600);
  await p.locator('[data-s3-sys="lungs"]').click();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(500);
  assert((await p.locator('.s3__copy').evaluate((e) => getComputedStyle(e).position)) !== 'sticky', 'copy still pinned on mobile');
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
  await p.setViewportSize({ width: 844, height: 390 });
  await p.waitForTimeout(400);
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow in landscape');
  assert((await s3Read(p)).sel === 'lungs', 'selection lost on resize');
  await p.context().close();
});

await test('SIG-3', 'Connected journey: all six stages, lines and planned details are visible at once, in order, with no script state', async () => {
  // V6: the journey is a static plate. Nothing is tabbed, dimmed or gated behind scroll or JavaScript.
  for (const opts of [{}, { viewport: { width: 390, height: 844 } }, { javaScriptEnabled: false }]) {
    const p = await ctx(opts);
    await go(p, '/#scene-06');
    const names = (await p.locator('.s6__name').allInnerTexts()).map((t) => t.trim().toUpperCase());
    assert(names.join(' ') === 'TEST UNDERSTAND ACT TRACK RETEST IMPROVE', `stage order: ${names.join(' ')}`);
    const stages = await p.locator('.s6__stage').all();
    assert(stages.length === 6, `stages: ${stages.length}`);
    for (const st of stages) {
      await st.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await p.waitForFunction((e) => Number(getComputedStyle(e).opacity) === 1, await st.elementHandle(), { timeout: 3000 });
      for (const sel of ['.s6__name', '.s6__line', '.s6__detail']) assert(await st.locator(sel).isVisible(), `${sel} hidden`);
    }
    assert((await p.locator('#scene-06 .s6__stages button').count()) === 0, 'journey should have no controls');
    assert(/None of it is available today/i.test(await p.locator('#scene-06').innerText()), 'planned qualifier missing');
    await p.context().close();
  }
});

// ---------- Scene 05: the report film (six acts, one scroll-driven timeline) ----------
const s5At = async (p, f, wait = 120) => {
  await p.evaluate((f) => {
    const t = document.querySelector('[data-s5-track]');
    const span = t.offsetHeight - document.querySelector('[data-s5-view]').offsetHeight;
    scrollTo({ top: t.getBoundingClientRect().top + scrollY + span * f, behavior: 'instant' });
  }, f);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (wait) await p.waitForTimeout(wait);
};
const s5Read = (p) =>
  p.evaluate(() => {
    const sec = document.querySelector('#scene-05');
    const o = (el) => { let v = 1; for (let n = el; n && n !== sec; n = n.parentElement) v *= Number(getComputedStyle(n).opacity); return v; };
    const q = (s) => sec.querySelector(s);
    const rows = [...sec.querySelectorAll('.s5__piece--row')];
    return {
      p: parseFloat(sec.style.getPropertyValue('--p')),
      act: Number(sec.dataset.s5Act),
      lines: [...sec.querySelectorAll('[data-s5-line]')].map((e) => +o(e).toFixed(2)),
      whole: o(q('[data-s5-whole]')),
      pieces: o(q('[data-s5-pieces]')),
      macro: o(q('[data-s5-macro]')),
      paper: rows.map((r) => +o(r.querySelector('img')).toFixed(2)),
      glass: rows.map((r) => +o(r.querySelector('.s5__glass')).toFixed(2)),
      planes: [...sec.querySelectorAll('[data-s5-plane]')].map((e) => +o(e).toFixed(2)),
      moved: rows.map((r) => { const m = new DOMMatrix(getComputedStyle(r).transform); return Math.round(Math.hypot(m.m41, m.m42, m.m43)); }),
      scale: new DOMMatrix(getComputedStyle(q('[data-s5-cam]')).transform).a,
      skipHidden: q('[data-s5-skip]').hidden,
      goInert: q('[data-s5-go]').inert,
    };
  });
const S5_VIEWS = [{}, { viewport: { width: 390, height: 844 } }];

await test('S5-ASSEMBLY', 'Scene 05: the eight slices sit exactly on the founders’ geometry, share one scale and rebuild the report before anything moves', async () => {
  const GEO = { header: [0, 529], cardiovascular: [529, 110], metabolic: [639, 112], hormonal: [751, 116], nutritional: [867, 116], 'clinical-context': [983, 110], 'follow-up': [1093, 111], footer: [1204, 244] };
  for (const opts of S5_VIEWS) {
    const p = await ctx(opts);
    await go(p, '/');
    await s5At(p, 0.08, 400);
    const m = await p.evaluate(() => {
      const doc = document.querySelector('[data-s5-doc]');
      return { H: doc.offsetHeight, W: doc.offsetWidth, pieces: [...document.querySelectorAll('[data-s5-piece]')].map((e) => ({ k: e.dataset.s5Piece, top: e.offsetTop, h: e.offsetHeight, w: e.offsetWidth, left: e.offsetLeft, t: (() => { const m = new DOMMatrix(getComputedStyle(e).transform); return [Math.hypot(m.m41, m.m42, m.m43), m.a]; })(), nat: [e.querySelector('img').naturalWidth, e.querySelector('img').naturalHeight] })) };
    });
    assert(m.pieces.length === 8, `pieces: ${m.pieces.length}`);
    assert(Math.abs(m.W / m.H - 1086 / 1448) < 0.004, `document aspect ${m.W}/${m.H}`);
    for (const pc of m.pieces) {
      const [y, h] = GEO[pc.k];
      assert(Math.abs(pc.top - (y / 1448) * m.H) <= 1 && Math.abs(pc.h - (h / 1448) * m.H) <= 1, `${pc.k} is off its recorded position: top ${pc.top}, height ${pc.h}`);
      assert(pc.left === 0 && Math.abs(pc.w - m.W) <= 1, `${pc.k} is not full width`);
      assert(pc.nat[0] === 1086 && pc.nat[1] === h, `${pc.k} image was resized: ${pc.nat}`);
      assert(pc.t[0] < 0.5 && Math.abs(pc.t[1] - 1) < 0.001, `${pc.k} has moved before the deconstruction`);
    }
    const r = await s5Read(p);
    assert(r.whole === 1 && r.pieces === 0, 'the whole report should be the one on screen before separation');
    await p.context().close();
  }
});

await test('S5-FILM', 'Scene 05: six acts in order, one statement at a time, one picture of the report at a time, and it plays backwards', async () => {
  for (const opts of S5_VIEWS) {
    const p = await ctx(opts);
    const wideView = !opts.viewport;
    await go(p, '/');
    assert((await p.locator('[data-s5-view]').evaluate((e) => getComputedStyle(e).position)) === 'sticky', 'stage is not pinned');
    const [vw, vh, w] = await p.evaluate(() => { const v = document.querySelector('[data-s5-view]'); return [v.clientWidth, v.clientHeight, innerWidth]; });
    assert(vw === w && vh >= (await p.evaluate(() => innerHeight)) - 1, 'stage is not full-viewport');
    const want = { 0.05: 1, 0.35: 2, 0.5: 3, 0.64: 4, 0.76: 5, 0.95: 6 };
    const seen = {};
    for (let f = 0; f <= 1.0001; f += 0.0125) {
      await s5At(p, f, 0);
      const r = await s5Read(p);
      const up = r.lines.filter((v) => v > 0.6).length;
      assert(up <= 1, `two statements readable at ${f.toFixed(3)}: ${r.lines}`);
      assert(r.lines.filter((v) => v > 0.25).length <= 2, `three statements at ${f.toFixed(3)}`);
      // one picture of the report at a time
      assert(!(r.whole > 0.02 && r.pieces > 0.02), `whole report and slices together at ${f.toFixed(3)}`);
      if (r.macro > 0.5) assert(r.whole * 1 < 0.05 || (await p.evaluate(() => Number(getComputedStyle(document.querySelector('[data-s5-cam]')).opacity))) < 0.05, `macro plate and report together at ${f.toFixed(3)}`);
      if (Math.max(...r.planes) > 0.05) assert(r.macro === 0 && r.whole === 0 && Math.max(...r.paper) < 0.05, `paper or macro behind the final planes at ${f.toFixed(3)}`);
      if (Math.max(...r.planes) > 0.95) assert(Math.max(...r.glass) < 0.05, `six planes and three planes together at ${f.toFixed(3)}`);
      for (let i = 0; i < 6; i++) assert(r.paper[i] + r.glass[i] <= 1.02, `row ${i}: paper and glass both strong at ${f.toFixed(3)}`);
      seen[f.toFixed(2)] = r;
    }
    for (const [f, act] of Object.entries(want)) {
      await s5At(p, Number(f), 60);
      const r = await s5Read(p);
      assert(r.act === act, `act at ${f}: ${r.act}`);
      assert(r.lines[act - 1] > 0.9, `statement ${act} not shown at ${f}: ${r.lines}`);
    }
    await s5At(p, 0.26, 60);
    assert((await s5Read(p)).scale > 1.8, 'the camera approach is too small to feel like entering the page');
    if (wideView) { await s5At(p, 0.35, 60); assert((await s5Read(p)).macro === 1, 'macro plate missing on a wide screen'); }
    await s5At(p, 0.535, 60);
    let r = await s5Read(p);
    assert(r.pieces === 1 && Math.min(...r.moved) > 6 && new Set(r.moved).size >= 5 && Math.min(...r.paper) > 0.9, `rows did not separate independently: ${JSON.stringify(r.moved)}`);
    await s5At(p, 0.69, 60);
    r = await s5Read(p);
    assert(Math.min(...r.glass) > 0.9 && Math.max(...r.paper) < 0.1, `paper did not become glass: ${JSON.stringify([r.paper, r.glass])}`);
    await s5At(p, 0.82, 60);
    r = await s5Read(p);
    assert(r.planes.length === 3 && Math.min(...r.planes) > 0.95, `three planes missing: ${r.planes}`);
    assert((await p.locator('[data-s5-plane] .s5__plane-label').allInnerTexts()).map((t) => t.trim().toUpperCase()).join() === 'CONTEXT,QUESTIONS,NEXT STEPS', 'plane labels');
    // backwards: glass returns to paper, paper to the sheet, the sheet to the opening shot
    await s5At(p, 0.535, 60);
    r = await s5Read(p);
    assert(Math.max(...r.planes) === 0 && Math.max(...r.glass) < 0.05 && Math.min(...r.paper) > 0.9, `did not return to paper: ${JSON.stringify(r)}`);
    await s5At(p, 0.05, 60);
    r = await s5Read(p);
    assert(r.whole === 1 && r.pieces === 0 && Math.max(...r.moved) === 0 && r.macro === 0 && r.lines[0] > 0.9 && Math.abs(r.scale - 1) < 0.02, `did not return to the opening: ${JSON.stringify(r)}`);
    // same scroll position, same picture
    await s5At(p, 0.6, 60);
    const a = JSON.stringify(await s5Read(p));
    await s5At(p, 0.9, 30);
    await s5At(p, 0.6, 60);
    assert(a === JSON.stringify(await s5Read(p)), 'the film is not deterministic');
    // disclosure always there; never trapped; no overflow; no errors
    assert(await p.locator('.s5__view .s5__disclosure').isVisible(), 'disclosure hidden');
    await p.evaluate(() => document.querySelector('#scene-06').scrollIntoView({ behavior: 'instant' }));
    assert(await p.locator('#s6-title').isVisible(), 'cannot reach Scene 06');
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
    assert(p.consoleErrors.length === 0, `console: ${p.consoleErrors[0]}`);
    await p.context().close();
  }
});

await test('S5-SKIP', 'Scene 05: Skip animation jumps to the closing shot; the continue link works only when shown; resize keeps the film coherent', async () => {
  const p = await ctx();
  await go(p, '/');
  await s5At(p, 0.1, 200);
  let r = await s5Read(p);
  assert(!r.skipHidden && r.goInert, `controls at the start: ${JSON.stringify([r.skipHidden, r.goInert])}`);
  await p.locator('[data-s5-skip]').focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(400);
  r = await s5Read(p);
  assert(r.p > 0.95 && r.act === 6 && r.lines[5] > 0.9 && r.skipHidden && !r.goInert, `after skip: ${JSON.stringify(r)}`);
  assert(await p.evaluate(() => document.activeElement?.matches('[data-s5-go]')), 'focus not moved to the continue link');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(900);
  assert((await p.evaluate(() => location.hash)) === '#scene-06', 'continue link did not go to Scene 06');
  await s5At(p, 0.5, 100);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(500);
  r = await s5Read(p);
  // the track is shorter on a phone, so the same pixel offset lands later in the film; what matters is a coherent frame
  assert(r.lines.filter((v) => v > 0.6).length <= 1 && !(r.whole > 0.02 && r.pieces > 0.02) && !(Math.max(...r.planes) > 0.05 && Math.max(...r.paper) > 0.05), `incoherent after resize: ${JSON.stringify(r)}`);
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow after resize');
  await p.setViewportSize({ width: 844, height: 390 });
  await p.waitForTimeout(400);
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow in landscape');
  await p.context().close();
});

await test('S5-FALLBACK', 'Scene 05 with reduced motion or without JavaScript: a still (report, three ideas, closing line, link), no pinned film', async () => {
  for (const opts of [{ reducedMotion: 'reduce' }, { javaScriptEnabled: false }, { reducedMotion: 'reduce', viewport: { width: 390, height: 844 } }]) {
    const p = await ctx(opts);
    await go(p, '/');
    await p.locator('#scene-05').scrollIntoViewIfNeeded();
    assert(!(await p.locator('[data-s5-track]').isVisible()), 'film shown');
    assert(await p.locator('.s5__still').isVisible(), 'still missing');
    assert((await p.locator('#scene-05').evaluate((e) => e.offsetHeight)) < 2200, 'long scroll track without the film');
    const t = await p.locator('.s5__still').innerText();
    for (const w of ['CONTEXT', 'What matters?', 'QUESTIONS', 'What should I ask?', 'NEXT STEPS', 'What happens next?', 'Illustrative report. No patient results.']) assert(t.toUpperCase().includes(w.toUpperCase()), `still is missing: ${w}`);
    assert(await p.locator('.s5__still-report').isVisible(), 'report image missing in the still');
    assert((await p.locator('.s5__still a[href="#scene-06"]').count()) === 1, 'link to Scene 06 missing');
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow');
    await p.context().close();
  }
});

await test('S5-HONEST', 'Scene 05 adds no values, scores or findings, shows no anatomy, and keeps its disclosure and a text equivalent', async () => {
  const p = await ctx();
  await go(p, '/');
  const t = await p.locator('#scene-05').evaluate((e) => e.textContent);
  assert(/Illustrative report\. No patient results\./.test(t), 'disclosure missing');
  assert(!/\d\s?(mg|mmol|bpm|%|\/)/i.test(t) && !/\b(score|abnormal|high risk|diagnos|your results?)\b/i.test(t), 'values or diagnostic wording in code-rendered text');
  assert((await p.locator('#s5-title').innerText()).includes('Getting tested is only the beginning'), 'heading text equivalent missing');
  const imgs = await p.locator('#scene-05 img').evaluateAll((els) => els.map((e) => e.currentSrc || e.src));
  assert(imgs.every((u) => /human-s05-/.test(u)), `unexpected image in Scene 05: ${imgs.find((u) => !/human-s05-/.test(u))}`);
  assert((await p.locator('#scene-05 [data-s5-piece] img[alt=""]').count()) === 8, 'decorative slices are announced');
  assert((await p.locator('#scene-05 button, #scene-05 a').count()) <= 3, 'unexpected controls');
  await p.context().close();
});

await test('E2E-08', 'Keyboard: every homepage link/button is reachable and shows a focus indicator', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/');
  const total = await p.locator('main a[href], main button, header a[href]:visible, footer a[href]').count();
  let seen = 0;
  for (let i = 0; i < total + 12; i++) {
    await p.keyboard.press('Tab');
    const ok = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const s = getComputedStyle(a);
      return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2;
    });
    if (ok === null) break;
    assert(ok, 'no focus ring on ' + (await p.evaluate(() => document.activeElement.outerHTML.slice(0, 80))));
    seen++;
  }
  assert(seen >= 20, `only ${seen} focus stops`);
  await p.context().close();
});

await test('E2E-09', 'Reduced motion: every route fully visible, no sticky pin, no hidden reveal states (V3-QA-04)', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  for (const r of ROUTES) {
    await go(p, r);
    const hidden = await p.evaluate(
      () => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity === '0').length,
    );
    assert(hidden === 0, `${r}: ${hidden} hidden reveal elements`);
  }
  await p.context().close();
});

await test('E2E-10/11', 'Portals navigate to /women and /men (mouse and keyboard); garnet and teal worlds applied', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/');
  await p.locator('a.portal--her').click();
  await p.waitForURL('**/women');
  const her = await p.locator('.seg__one').evaluate((e) => getComputedStyle(e).backgroundColor);
  assert(her === 'rgb(36, 16, 24)', 'her bg ' + her);
  await go(p, '/');
  await p.locator('a.portal--him').focus();
  await p.keyboard.press('Enter');
  await p.waitForURL('**/men');
  const him = await p.locator('.seg__one').evaluate((e) => getComputedStyle(e).backgroundColor);
  assert(him === 'rgb(9, 29, 31)', 'him bg ' + him);
  await p.context().close();
});

await test('PARITY', '/women and /men have the same section count, headings count and CTA count', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const shape = async (r) => {
    await go(p, r);
    return p.evaluate(() =>
      [document.querySelectorAll('main > section').length, document.querySelectorAll('main h2, main h3').length, document.querySelectorAll('main a.btn').length].join('/'),
    );
  };
  const a = await shape('/women');
  const b = await shape('/men');
  assert(a === b, `${a} vs ${b}`);
  await p.context().close();
});

await test('E2E-12', 'Mobile menu: opens as modal, focus trapped, ESC closes, focus returns, page does not scroll', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 } });
  await go(p, '/');
  await p.locator('[data-menu-open]').click();
  assert(await p.locator('dialog.mobile-menu[open]').isVisible(), 'menu not open');
  assert(await p.evaluate(() => document.querySelector('dialog').matches(':modal')), 'not modal');
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press('Tab');
    const inside = await p.evaluate(() => !!document.activeElement.closest('dialog') || document.activeElement === document.body);
    assert(inside, 'focus escaped the menu');
  }
  const y0 = await p.evaluate(() => scrollY);
  await p.mouse.wheel(0, 600);
  assert((await p.evaluate(() => scrollY)) === y0, 'background scrolled');
  await p.keyboard.press('Escape');
  assert(!(await p.locator('dialog.mobile-menu').isVisible()), 'menu still open');
  assert(await p.evaluate(() => document.activeElement.hasAttribute('data-menu-open')), 'focus not returned');
  await p.locator('[data-menu-open]').click();
  await p.locator('dialog a[href="/faq"]').click();
  await p.waitForURL('**/faq');
  await p.context().close();
});

await test('E2E-13', 'App folder absent: honest placeholder, no screenshots, no prototype link (V3-QA-12, E2E-46)', async () => {
  const p = await ctx();
  await go(p, '/');
  const t = await p.locator('#app').innerText();
  assert(/prototype is in development/i.test(t) && /No screens are shown yet/i.test(t) && /not a screen from the app/i.test(t), 'honest status copy missing');
  assert((await p.locator('#app img, #app iframe, #app video').count()) === 0, 'media present in app slot');
  assert((await p.locator('a[href*="edgeone"], a[href^="/app"]').count()) === 0, 'unverified app link present');
  await p.context().close();
});

await test('E2E-43', 'Final homepage CTA and header CTA both go to /waitlist', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/');
  await p.locator('#join a.btn').click();
  await p.waitForURL('**/waitlist');
  await go(p, '/about');
  await p.locator('header .nav a.btn').click();
  await p.waitForURL('**/waitlist');
  await p.context().close();
});

// ---------- interior ----------
await test('E2E-02', 'Logo from an interior page returns home', async () => {
  const p = await ctx();
  await go(p, '/faq');
  await p.locator('header a.wordmark').click();
  await p.waitForURL(BASE + '/');
  await p.context().close();
});

await test('E2E-16', 'FAQ: 12 questions; a question opens with keyboard and shows its answer', async () => {
  const p = await ctx();
  await go(p, '/faq');
  assert((await p.locator('details').count()) === 12, 'expected 12 questions');
  const d = p.locator('details').nth(1);
  await d.locator('summary').focus();
  await p.keyboard.press('Enter');
  assert(await d.locator('p').isVisible(), 'answer not visible');
  assert(/No\. HUMAN is in prelaunch development/.test(await d.locator('p').innerText()), 'answer text');
  await p.context().close();
});

await test('E2E-17', 'About: no founder names or bios; pending line shown', async () => {
  const p = await ctx();
  await go(p, '/about');
  const t = await p.locator('main').innerText();
  assert(/Our story is still being written/.test(t), 'pending line missing');
  assert(!/Abdanshi|Hana|founder(s)? (is|are|was|were)/i.test(t), 'founder detail present');
  await p.context().close();
});

await test('E2E-18', 'Legal routes exist, are marked Draft, and are linked from the waitlist', async () => {
  const p = await ctx();
  for (const r of ['/privacy', '/terms', '/medical-disclaimer']) {
    const res = await p.goto(BASE + r);
    assert(res.status() === 200, r + ' status ' + res.status());
    assert(/Draft — not approved for public launch/i.test(await p.locator('.legal__flag').innerText()), r + ' flag');
  }
  await go(p, '/waitlist');
  assert((await p.locator('a[href="/privacy"]').count()) >= 1, 'privacy link missing in waitlist');
  await p.context().close();
});

await test('E2E-47', 'Unknown route returns the branded 404 with working recovery links', async () => {
  const p = await ctx();
  const res = await p.goto(BASE + '/definitely-not-a-page');
  assert(res.status() === 404, 'status ' + res.status());
  assert(/isn’t here/.test(await p.locator('h1').innerText()), '404 copy');
  await p.locator('main a[href="/"]').click();
  await p.waitForURL(BASE + '/');
  await p.context().close();
});

await test('E2E-38/39', 'Every core route loads directly with one h1, a <main>, no console errors; Back/Forward works', async () => {
  const p = await ctx();
  for (const r of ROUTES) {
    await go(p, r);
    assert((await p.locator('h1:visible').count()) === 1, r + ' h1 count');
    assert((await p.locator('main').count()) === 1, r + ' main');
    assert((await p.title()).length > 8, r + ' title');
  }
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await go(p, '/');
  await go(p, '/women');
  await p.goBack();
  assert(p.url() === BASE + '/', 'back');
  await p.goForward();
  assert(p.url().endsWith('/women'), 'forward');
  await p.context().close();
});

await test('OVERFLOW', 'No horizontal overflow on any core route at 320, 360, 390, 768, 1024, 1280, 1440, 1920', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const bad = [];
  for (const w of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    await p.setViewportSize({ width: w, height: w < 500 ? 740 : 900 });
    for (const r of ROUTES) {
      await go(p, r);
      const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 0) bad.push(`${r}@${w} +${over}px`);
    }
  }
  assert(bad.length === 0, bad.join(', '));
  await p.context().close();
});

await test('E2E-37', 'JavaScript off: homepage story, headline, nav and CTAs all present and visible (V3-QA-01)', async () => {
  const p = await ctx({ javaScriptEnabled: false });
  await go(p, '/');
  assert(await p.locator('h1').isVisible(), 'h1');
  for (const id of ['s1-title', 's3-title', 's6-title', 's8-title', 'join-title']) assert(await p.locator('#' + id).isVisible(), id + ' hidden');
  assert((await p.locator('.s6__detail:visible').count()) === 6, 'stage copy hidden');
  assert(await p.locator('.hero a.btn').isVisible(), 'CTA');
  await go(p, '/waitlist');
  assert(/needs JavaScript/.test(await p.locator('main').innerText()), 'no-JS waitlist notice');
  await p.context().close();
});

await test('E2E-15/44', 'Images blocked: hero headline, CTA and status still readable; wordmark still drawn as solid letters (V3-QA-02)', async () => {
  const p = await ctx();
  await p.route('**/*.{webp,png,jpg,jpeg,avif}', (r) => r.abort());
  await go(p, '/');
  assert(await p.locator('h1').isVisible(), 'h1');
  const bg = await p.locator('.hero').evaluate((e) => getComputedStyle(e).backgroundColor);
  assert(bg === 'rgb(242, 238, 230)', 'hero bg ' + bg);
  const ink = await p.locator('.hero h1').evaluate((e) => getComputedStyle(e).color);
  assert(ink.match(/\d+/g).slice(0, 3).reduce((a, v) => a + Number(v), 0) < 200, 'headline not dark on ivory: ' + ink);
  assert((await p.locator('[data-ih-letter] rect').count()) === 5, 'letters have no solid fallback fill');
  assert(await p.locator('.hero a.btn').isVisible(), 'CTA');
  await p.context().close();
});

await test('CLAIMS', 'No invented counters, prices, testimonials, partners or live-service claims on any route', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const banned = /10,?000\+|₹\s?\d|Rs\.?\s?\d|testimonial|trusted by|our doctors|our partners|book (a|your) (test|consultation)|limited spots|reserve your (spot|place)\b|now available|live now/i;
  for (const r of ROUTES) {
    await go(p, r);
    const t = await p.locator('body').innerText();
    const m = t.match(banned);
    assert(!m, `${r}: "${m && m[0]}"`);
  }
  await p.context().close();
});

await test('NO-TRACKERS', 'No third-party requests on any route (no analytics, pixels, remote fonts) (V3-QA-19)', async () => {
  const p = await ctx();
  for (const r of ROUTES) await go(p, r);
  const ext = p.requests.filter((q) => !q.url.startsWith(BASE) && !q.url.startsWith('data:'));
  assert(ext.length === 0, ext.map((q) => q.url).join(', '));
  await p.context().close();
});

// ---------- waitlist ----------
const fillYou = async (p, name = 'Test Person', email = 'test.person@example.com') => {
  await p.fill('#wl-name', name);
  await p.fill('#wl-email', email);
};
const next = (p) => p.locator('[data-next]').click();
const chapter = (p) => p.locator('[data-wl]').getAttribute('data-chapter');
const toConsent = async (p) => {
  await go(p, '/waitlist');
  await next(p);
  await fillYou(p);
  await next(p);
  await p.fill('#wl-city', 'Jaipur');
  await p.selectOption('#wl-state', 'Rajasthan');
  await next(p);
};

await test('E2E-19', 'Welcome → Begin moves to You, labelled Step 1 of 3; five chapters, three data steps', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  assert((await p.locator('[data-ch]').count()) === 5, 'five chapters');
  assert((await p.locator('form[data-ch]').count()) === 3, 'three data steps');
  assert(!(await p.locator('[data-back]').isVisible()), 'Back visible on Welcome');
  await next(p);
  assert((await chapter(p)) === 'you', 'not on you');
  assert((await p.locator('[data-progress-label]').innerText()).toUpperCase() === 'STEP 1 OF 3', 'progress label');
  assert(await p.evaluate(() => document.activeElement.id === 'wl-h-you'), 'focus not moved to heading');
  await p.context().close();
});

await test('E2E-20', 'You: Continue with blank fields shows two errors, focuses the first, does not advance', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await next(p);
  await next(p);
  assert((await chapter(p)) === 'you', 'advanced');
  assert((await p.locator('#wl-name-err').innerText()) !== '' && (await p.locator('#wl-email-err').innerText()) !== '', 'errors missing');
  assert((await p.locator('#wl-name').getAttribute('aria-invalid')) === 'true', 'aria-invalid');
  assert(await p.evaluate(() => document.activeElement.id === 'wl-name'), 'focus');
  assert((await p.locator('[data-announce]').innerText()).length > 0, 'not announced');
  await p.context().close();
});

await test('E2E-21', 'You: invalid email shows an inline error and focuses the email field', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await next(p);
  await fillYou(p, 'A', 'not-an-email');
  await next(p);
  assert((await chapter(p)) === 'you', 'advanced');
  assert(await p.evaluate(() => document.activeElement.id === 'wl-email'), 'focus');
  await p.context().close();
});

await test('E2E-22', 'You: valid fields (Enter key) move to Location, Step 2 of 3; single-word name accepted', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await next(p);
  await fillYou(p, 'Madonna', 'm@example.co.in');
  await p.press('#wl-email', 'Enter');
  assert((await chapter(p)) === 'location', 'not on location');
  assert((await p.locator('[data-progress-label]').innerText()).toUpperCase() === 'STEP 2 OF 3', 'label');
  await p.context().close();
});

await test('E2E-23/24/25', 'Location: blank required fields error; blank WhatsApp allowed; invalid WhatsApp rejected', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await next(p);
  await fillYou(p);
  await next(p);
  await next(p);
  assert((await chapter(p)) === 'location', 'advanced with blanks');
  assert((await p.locator('#wl-city-err').innerText()) !== '' && (await p.locator('#wl-state-err').innerText()) !== '', 'errors');
  assert((await p.locator('#wl-state option').count()) === 37, 'expected 36 states/UTs + placeholder');
  await p.fill('#wl-city', 'Pune');
  await p.selectOption('#wl-state', 'Maharashtra');
  await p.fill('#wl-phone', '12345');
  await next(p);
  assert((await chapter(p)) === 'location', 'advanced with bad phone');
  assert((await p.locator('#wl-phone-err').innerText()) !== '', 'phone error');
  await p.fill('#wl-phone', '');
  await next(p);
  assert((await chapter(p)) === 'consent', 'blank phone blocked');
  assert(/No WhatsApp number given/.test(await p.locator('[data-sum="phone"]').innerText()), 'summary phone');
  await p.context().close();
});

await test('E2E-26/27', 'Back and Edit preserve every value; Edit returns to the summary; phone is masked there', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await next(p);
  await fillYou(p);
  await next(p);
  await p.fill('#wl-city', 'Jaipur');
  await p.selectOption('#wl-state', 'Rajasthan');
  await p.fill('#wl-phone', '98765 43210');
  await next(p);
  assert((await p.locator('[data-sum="phone"]').innerText()).includes('•') && !(await p.locator('[data-sum="phone"]').innerText()).includes('98765'), 'phone not masked');
  await p.locator('[data-back]').click();
  assert((await p.inputValue('#wl-city')) === 'Jaipur' && (await p.inputValue('#wl-state')) === 'Rajasthan', 'location lost');
  await p.locator('[data-back]').click();
  assert((await p.inputValue('#wl-name')) === 'Test Person', 'name lost');
  await next(p);
  await next(p);
  await p.locator('[data-edit="you"]').click();
  assert((await chapter(p)) === 'you', 'edit did not go to you');
  await p.fill('#wl-name', 'Edited Person');
  await next(p);
  assert((await chapter(p)) === 'consent', 'edit did not return to summary');
  assert((await p.locator('[data-sum="fullName"]').innerText()) === 'Edited Person', 'summary not updated');
  await p.goBack();
  assert((await chapter(p)) === 'you', 'browser Back');
  await p.context().close();
});

await test('E2E-28', 'Consent: neither box pre-checked; submitting without required consent errors and stays', async () => {
  const p = await ctx();
  await toConsent(p);
  assert(!(await p.isChecked('#wl-c1')) && !(await p.isChecked('#wl-c2')), 'a box is pre-checked');
  await next(p);
  assert((await chapter(p)) === 'consent', 'left consent');
  assert((await p.locator('#wl-c1-err').innerText()) !== '', 'error missing');
  assert(await p.evaluate(() => document.activeElement.id === 'wl-c1'), 'focus');
  await p.context().close();
});

await test('E2E-30', 'Preview mode: valid submit shows "not accepting registrations", never Success, and sends NOTHING', async () => {
  const p = await ctx();
  await toConsent(p);
  await p.check('#wl-c1');
  const before = p.requests.length;
  await next(p);
  await next(p); // double click
  await p.waitForTimeout(400);
  assert((await chapter(p)) === 'consent', 'left consent');
  assert(/not accepting registrations yet/i.test(await p.locator('[data-notice]').innerText()), 'notice missing');
  assert(!(await p.locator('[data-ch="success"]').isVisible()), 'Success visible');
  assert(p.requests.length === before, 'a network request was made');
  await p.context().close();
});

await test('PII', 'No form value reaches the URL, localStorage, sessionStorage, cookies or the console (V3-QA-19, E2E-45)', async () => {
  const p = await ctx();
  const logs = [];
  p.on('console', (m) => logs.push(m.text()));
  await toConsent(p);
  await p.check('#wl-c1');
  await next(p);
  const dump = await p.evaluate(() => JSON.stringify([location.href, { ...localStorage }, { ...sessionStorage }, document.cookie, history.state]));
  const all = dump + logs.join(' ');
  assert(!/Test Person|test\.person|Jaipur|Rajasthan/.test(all), 'PII found: ' + all.slice(0, 200));
  await p.context().close();
});

await test('E2E-34', 'Reload or forged URL (#success, ?success=true) never shows Success; draft is not retained (WL4-06)', async () => {
  const p = await ctx();
  for (const u of ['/waitlist#success', '/waitlist?success=true', '/waitlist#consent']) {
    await go(p, u);
    assert((await chapter(p)) === 'welcome', u + ' → ' + (await chapter(p)));
    assert(!(await p.locator('[data-ch="success"]').isVisible()), u + ' shows success');
  }
  await toConsent(p);
  await p.reload({ waitUntil: 'networkidle' });
  assert((await chapter(p)) === 'welcome', 'reload kept chapter');
  await next(p);
  assert((await p.inputValue('#wl-name')) === '', 'draft retained after reload');
  await p.context().close();
});

// Fixture tests: a clearly-labelled TEST endpoint is injected into this browser only. No real backend exists.
const withFixture = async (handler) => {
  const p = await ctx();
  let calls = 0;
  await p.route('**/__test_fixture__/waitlist', async (route) => {
    calls++;
    await handler(route, calls);
  });
  await toConsent(p);
  await p.evaluate(() => (document.querySelector('[data-wl]').dataset.endpoint = '/__test_fixture__/waitlist'));
  return { p, calls: () => calls };
};

await test('E2E-31/33/29', '[TEST FIXTURE] Accepted response → Success; double-click sends once; optional consent off does not block', async () => {
  const { p, calls } = await withFixture(async (route) => {
    await new Promise((r) => setTimeout(r, 300));
    const body = JSON.parse(route.request().postData());
    if (body.marketingConsent !== false || body.operationalConsent !== true) return route.fulfill({ status: 400, body: '{}' });
    if (!route.request().headers()['idempotency-key']) return route.fulfill({ status: 400, body: '{}' });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'accepted', registrationId: 'test-fixture' }) });
  });
  await p.check('#wl-c1');
  await p.locator('[data-next]').dblclick();
  await p.waitForSelector('[data-ch="success"]:not([hidden])');
  assert(calls() === 1, `backend called ${calls()} times`);
  assert(/Your registration has been received/.test(await p.locator('[data-ch="success"]').innerText()), 'confirmation');
  assert(!(await p.locator('.wl__bar').isVisible()), 'action bar still visible');
  await p.reload({ waitUntil: 'networkidle' });
  assert((await chapter(p)) === 'welcome', 'Success survived a refresh');
  await p.context().close();
});

await test('E2E-32', '[TEST FIXTURE] 500 and network failure → recoverable error, values and consent preserved, no Success (V3-QA-14)', async () => {
  const { p } = await withFixture(async (route, n) => (n === 1 ? route.fulfill({ status: 500, body: 'oops' }) : route.abort()));
  await p.check('#wl-c1');
  await p.check('#wl-c2');
  await next(p);
  await p.waitForFunction(() => /couldn’t complete/.test(document.querySelector('[data-notice]').textContent));
  assert((await chapter(p)) === 'consent', 'left consent');
  await next(p);
  await p.waitForFunction(() => /couldn’t reach/.test(document.querySelector('[data-notice]').textContent));
  assert((await p.isChecked('#wl-c1')) && (await p.isChecked('#wl-c2')), 'consent lost');
  assert((await p.locator('[data-sum="email"]').innerText()) === 'test.person@example.com', 'values lost');
  assert(!(await p.locator('[data-next]').isDisabled()), 'cannot retry');
  await p.context().close();
});

await test('V3-QA-15', '[TEST FIXTURE] Duplicate response shows neutral wording, no Success, no account enumeration', async () => {
  const { p } = await withFixture((route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'duplicate', userFacingMessage: 'If this is a new registration, it has been recorded.' }) }),
  );
  await p.check('#wl-c1');
  await next(p);
  await p.waitForFunction(() => !document.querySelector('[data-notice]').hidden && /Thank you/.test(document.querySelector('[data-notice]').textContent));
  assert(!/already/i.test(await p.locator('[data-notice]').innerText()), 'reveals existing registration');
  assert((await chapter(p)) === 'consent', 'left consent');
  await p.context().close();
});

await test('E2E-35', 'Waitlist at 360x640 (keyboard-height proxy): fields, Back and Continue reachable by scrolling; bar not fixed', async () => {
  const p = await ctx({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true });
  await go(p, '/waitlist');
  await next(p);
  await fillYou(p);
  await next(p);
  await p.setViewportSize({ width: 360, height: 360 });
  assert((await p.locator('.wl__bar').evaluate((e) => getComputedStyle(e).position)) === 'static', 'bar is fixed/sticky on mobile');
  await p.locator('#wl-phone').scrollIntoViewIfNeeded();
  assert(await p.locator('#wl-phone').isVisible(), 'phone field unreachable');
  await p.locator('[data-next]').scrollIntoViewIfNeeded();
  const b = await p.locator('[data-next]').boundingBox();
  assert(b.y >= 0 && b.y + b.height <= 360, 'Continue not reachable');
  const fs = await p.locator('#wl-city').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  assert(fs >= 16, 'input font-size under 16px (iOS zoom)');
  await p.context().close();
});

await test('A11Y-FORM', 'Every input has a label, autocomplete purpose and error hook; touch targets ≥ 44px (V3-QA-17)', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 } });
  await toConsent(p);
  const issues = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.wl input, .wl select').forEach((el) => {
      if (!el.labels || !el.labels.length) out.push('no label: ' + el.id);
      if (el.type !== 'checkbox' && !el.autocomplete) out.push('no autocomplete: ' + el.id);
    });
    document.querySelectorAll('.wl [data-ch]:not([hidden]) button, .wl__bar button:not([hidden]), .wl__top a').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height < 44) out.push(`small target ${Math.round(r.height)}px: ${el.textContent.trim().slice(0, 20)}`);
    });
    return out;
  });
  assert(issues.length === 0, issues.join('; '));
  await p.context().close();
});

await test('ZOOM', '200% text size at 390px: hero and waitlist grow vertically, no clipping or overflow', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  for (const r of ['/', '/waitlist', '/faq']) {
    await go(p, r);
    await p.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await p.waitForTimeout(150);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(over <= 0, `${r} overflows by ${over}px at 200%`);
  }
  await p.context().close();
});

await browser.close();
const pad = (s, n) => String(s).padEnd(n);
for (const r of results) console.log(`${pad(r.status, 5)} ${pad(r.id, 14)} ${r.name}${r.note ? '\n      ↳ ' + r.note : ''}`);
const failed = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n${results.length - failed} passed, ${failed} failed, ${results.length} total`);
process.exit(failed ? 1 : 0);
