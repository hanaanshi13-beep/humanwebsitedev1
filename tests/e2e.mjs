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
  // E2E_ONLY=<regex> runs just the matching test ids (for quick re-checks)
  if (process.env.E2E_ONLY && !new RegExp(process.env.E2E_ONLY).test(id)) return;
  const t0 = Date.now();
  try {
    await fn();
    results.push({ id, name, status: 'PASS' });
  } catch (e) {
    results.push({ id, name, status: 'FAIL', note: String(e.message || e).split('\n')[0] });
  }
  // live progress on stderr, so a long run can be followed (the summary still prints at the end on stdout)
  if (process.env.E2E_PROGRESS) process.stderr.write(`${results.at(-1).status} ${id} ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const go = async (page, path) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
};
const ROUTES = ['/', '/women', '/men', '/explore-plans', '/about', '/faq', '/waitlist', '/privacy', '/terms', '/medical-disclaimer'];

// ---------- homepage ----------
// On the homepage the navigation is absent during the opening film and returns with the next section.
const pastHero = async (p) => {
  await p.evaluate(() => {
    const n = document.querySelector('[data-ih] ~ section');
    scrollTo({ top: n.getBoundingClientRect().top + scrollY, behavior: 'instant' });
  });
  await p.waitForTimeout(450);
};
const heroOnly = (p) =>
  p.evaluate(() => {
    const stage = document.querySelector('[data-ih-stage]');
    const vis = (e) => {
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return c.visibility !== 'hidden' && c.display !== 'none' && Number(c.opacity) > 0.01 && r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
    };
    const hd = document.querySelector('[data-header]');
    return {
      header: vis(hd),
      interactive: [...stage.querySelectorAll('a, button')].filter(vis).map((e) => e.getAttribute('aria-label') || e.textContent.trim()),
      text: stage.innerText.replace(/\s+/g, ' ').trim(),
      headerFocusable: [...hd.querySelectorAll('a, button')].some((e) => !e.closest('[inert]')),
    };
  });

await test('E2E-01', 'Direct load /: exact headline; opening shows only eyebrow, wordmark, headline and arrow; no missing assets, no console errors', async () => {
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
  const o = await heroOnly(p);
  assert(!o.header && !o.headerFocusable, 'navigation visible or focusable on the opening screen');
  assert(o.interactive.length === 1 && o.interactive[0] === 'Continue to the next section', 'opening controls: ' + JSON.stringify(o.interactive));
  assert(/^THE INVISIBLE SIDE OF YOUR HEALTH HOW WELL DO YOU know your health\?$/i.test(o.text), 'opening text: ' + o.text);
  assert((await p.locator('h1').count()) === 1, 'h1 count');
  assert(failed.length === 0, 'failed requests: ' + failed.join(', '));
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('GATE1-390', 'Hero at 390x844: eyebrow, wordmark, headline and arrow in that order on one centre line, all inside the first viewport', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 } });
  await go(p, '/');
  const r = [];
  for (const sel of ['.ih__eyebrow', '[data-ih-slot]', '.hero h1', '[data-ih-go]']) r.push(await p.locator(sel).boundingBox());
  r.forEach((b, i) => {
    assert(b && b.y >= 0 && b.y + b.height <= 844 && b.x >= 0 && b.x + b.width <= 390, `element ${i} outside first viewport`);
    assert(Math.abs(b.x + b.width / 2 - 195) <= 2, `element ${i} off the centre line by ${b.x + b.width / 2 - 195}`);
    if (i) assert(b.y >= r[i - 1].y + r[i - 1].height, `element ${i} overlaps the one above`);
  });
  assert(r[3].width >= 44 && r[3].height >= 44, 'arrow touch target too small');
  await p.context().close();
});

await test('GATE1-1440', 'Hero at 1440x900: one centred composition; wordmark dominant; headline lines centred, unclipped; arrow near the foot', async () => {
  const p = await ctx();
  await go(p, '/');
  const box = (sel) => p.locator(sel).boundingBox();
  const [eb, art, l1, l2, go_] = [await box('.ih__eyebrow'), await box('[data-ih-slot]'), await box('.hero__l1'), await box('.hero__l2'), await box('[data-ih-go]')];
  for (const [n, b] of Object.entries({ eyebrow: eb, wordmark: art, line1: l1, line2: l2, arrow: go_ })) {
    assert(Math.abs(b.x + b.width / 2 - 720) <= 2, `${n} off centre by ${Math.round(b.x + b.width / 2 - 720)}px`);
    assert(b.y >= 0 && b.y + b.height <= 900, `${n} outside first viewport`);
  }
  assert(art.width >= 1440 * 0.84 && art.width <= 1440 * 0.92, 'wordmark width ' + Math.round(art.width));
  assert(eb.y + eb.height <= art.y && art.y + art.height <= l1.y && l1.y + l1.height <= l2.y + 8 && l2.y + l2.height <= go_.y, 'order or overlap');
  assert(art.y - (eb.y + eb.height) >= 20 && art.y - (eb.y + eb.height) <= 46, 'eyebrow gap ' + (art.y - eb.y - eb.height));
  assert(go_.y + go_.height / 2 > 900 * 0.86, 'arrow not near the foot');
  assert(go_.width >= 48 && go_.width <= 58, 'arrow diameter ' + go_.width);
  const clipped = await p.locator('.hero h1').evaluate((e) => e.scrollWidth > e.clientWidth + 1);
  assert(!clipped, 'headline clipped');
  const st = await p.evaluate(() => {
    const a = getComputedStyle(document.querySelector('.hero__l1'));
    const b = getComputedStyle(document.querySelector('.hero__l2'));
    return { w: a.fontWeight, fa: a.fontFamily, fb: b.fontFamily, sb: b.fontStyle, ra: parseFloat(b.fontSize) / parseFloat(a.fontSize) };
  });
  assert(Number(st.w) >= 750 && /Hanken/.test(st.fa) && /Instrument Serif/.test(st.fb) && st.sb === 'italic' && st.ra > 1.1, JSON.stringify(st));
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
      copy: Number(getComputedStyle(sec.querySelector('.hero__title')).opacity),
      inert: sec.querySelector('.hero__title').inert,
      arrow: Number(getComputedStyle(sec.querySelector('[data-ih-next]')).opacity),
      arrowInert: sec.querySelector('[data-ih-next]').inert,
      pulse: getComputedStyle(sec.querySelector('.ih__halo')).animationName,
      nav: document.querySelector('[data-header]').dataset.ihNav,
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
  // the portal's A06 is the same file as the U photograph, so the build may serve it under either name
  const want = { h: 'A01-blood-tube', u: /u-female|A06-womens-portrait/, m: 'm-eye', a: 'a-couple', n: 'n-mature-man' };
  for (const l of d) {
    assert(l.clip === `url(#ih-clip-${l.k})`, l.k + ' clip ' + l.clip);
    assert(l.imgs.length === 1 && (want[l.k] instanceof RegExp ? want[l.k].test(l.imgs[0]) : l.imgs[0].includes(want[l.k])), l.k + ' photo ' + l.imgs);
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
  assert(s0.arrow === 1 && !s0.arrowInert && s0.pulse !== 'none' && s0.nav === 'hidden', 'arrow/nav at start ' + JSON.stringify(s0));
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
  assert(s4.arrow === 0 && s4.arrowInert && s4.pulse === 'none', 'arrow still present over the eye');
  assert(s4.nav === 'hidden', 'navigation over the film');
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

await test('IH-03', 'INSIDE HUMAN arrow: targets the real next section, plays the film on the way, lands with the hero released, focus moved, navigation back; interruptible; repeat clicks safe', async () => {
  const p = await ctx();
  await go(p, '/');
  const info = await p.evaluate(() => {
    const a = document.querySelector('[data-ih-go]');
    const n = document.querySelector('[data-ih] ~ section');
    return { href: a.getAttribute('href'), tag: a.tagName, name: a.getAttribute('aria-label'), next: n.id, first: document.querySelector('main section + section, main > section:nth-of-type(2)')?.id };
  });
  assert(info.tag === 'A' && info.href === '#' + info.next && info.next === 'what-is-human', JSON.stringify(info));
  assert(info.name === 'Continue to the next section', 'accessible name: ' + info.name);
  // keyboard: the arrow is the first focusable thing after the skip link
  await p.keyboard.press('Tab');
  await p.keyboard.press('Tab');
  assert(await p.evaluate(() => document.activeElement.matches('[data-ih-go]')), 'arrow not reachable by keyboard right after the skip link');
  await p.keyboard.press('Enter');
  await p.locator('[data-ih-go]').click({ force: true }).catch(() => {}); // a second activation mid-travel
  await p.waitForFunction(() => scrollY > 1500, null, { timeout: 15000 });
  const mid = await p.evaluate(() => ({ y: scrollY, act: document.querySelector('[data-ih]').dataset.ihAct }));
  assert(mid.y > 300 && Number(mid.act) >= 3, 'film not playing during travel: ' + JSON.stringify(mid));
  // the travel takes up to 4.6 s so the film is never rushed; it ends by moving focus to the introduction
  await p.waitForFunction(() => document.activeElement === document.querySelector('#what-is-human'), null, { timeout: 90000 });
  await p.waitForTimeout(500);
  const end = await p.evaluate(() => {
    const n = document.querySelector('#what-is-human');
    const hd = document.querySelector('[data-header]');
    const first = n.querySelector('.eyebrow, h2').getBoundingClientRect();
    return { top: n.getBoundingClientRect().top, focus: document.activeElement === n, nav: hd.dataset.ihNav, inert: hd.inert, op: getComputedStyle(hd).opacity, hb: hd.querySelector('.site-header__shell').getBoundingClientRect().bottom, first: first.top, dark: getComputedStyle(document.querySelector('[data-ih-dark]')).opacity };
  });
  assert(end.top >= 0 && end.top < 80, 'landed at ' + end.top);
  assert(end.dark === '1', 'landed before the film had finished');
  assert(end.focus, 'focus did not move to the next section');
  assert(end.nav === 'shown' && !end.inert && Number(end.op) > 0.95, 'navigation did not return: ' + JSON.stringify(end));
  assert(end.first >= end.hb, 'first line of the next section sits under the header');
  const y1 = await p.evaluate(() => scrollY);
  await p.waitForTimeout(400);
  assert((await p.evaluate(() => scrollY)) === y1, 'page still moving after arrival');
  await p.locator('.site-header .nav a[href="/faq"]').click();
  await p.waitForURL('**/faq');
  // interruption
  await go(p, '/');
  await p.locator('[data-ih-go]').click();
  await p.waitForTimeout(600);
  await p.mouse.wheel(0, 5);
  await p.waitForTimeout(300);
  const a = await p.evaluate(() => scrollY);
  await p.waitForTimeout(700);
  const b = await p.evaluate(() => scrollY);
  assert(a === b && a < 2000, `wheel did not take over: ${a} → ${b}`);
  await p.context().close();
});

await test('IH-06', 'Homepage navigation: hidden and inert through the whole film, returns with the next section, hides again on the way back, no flicker at the boundary', async () => {
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const p = await ctx({ viewport: vp });
    await go(p, '/');
    const nav = () => p.evaluate(() => { const h = document.querySelector('[data-header]'); const c = getComputedStyle(h); return { s: h.dataset.ihNav, inert: h.inert, vis: c.visibility, pe: c.pointerEvents }; });
    for (const f of [0, 0.02, 0.3, 0.6, 0.9, 1]) {
      await ihAt(p, f);
      await p.waitForTimeout(300);
      const n = await nav();
      assert(n.s === 'hidden' && n.inert && n.vis === 'hidden' && n.pe === 'none', `${vp.width} nav at ${f}: ${JSON.stringify(n)}`);
    }
    await pastHero(p);
    let n = await nav();
    assert(n.s === 'shown' && !n.inert && n.vis === 'visible', `${vp.width} nav after hero: ${JSON.stringify(n)}`);
    // small movements around the boundary must not toggle it
    const flips = await p.evaluate(async () => {
      const h = document.querySelector('[data-header]');
      const n = document.querySelector('[data-ih] ~ section');
      const base = n.getBoundingClientRect().top + scrollY - innerHeight * 0.62;
      let last = null, count = 0;
      for (let i = 0; i < 24; i++) {
        scrollTo({ top: base + (i % 2 ? 30 : -30), behavior: 'instant' });
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (last !== null && h.dataset.ihNav !== last) count++;
        last = h.dataset.ihNav;
      }
      return count;
    });
    assert(flips <= 1, `${vp.width} navigation flickered ${flips} times at the boundary`);
    await ihAt(p, 0.5);
    await p.waitForTimeout(300);
    n = await nav();
    assert(n.s === 'hidden' && n.inert, `${vp.width} nav did not hide on the way back`);
    await ihAt(p, 0);
    const o = await heroOnly(p);
    assert(!o.header && o.interactive.length === 1, `${vp.width} opening not restored: ${JSON.stringify(o)}`);
    await p.context().close();
  }
  // other pages keep their header from the first pixel
  const q = await ctx();
  await go(q, '/faq');
  assert(await q.locator('.site-header .wordmark').isVisible(), 'header missing on /faq');
  assert(!(await q.evaluate(() => document.querySelector('[data-header]').inert)), 'header inert on /faq');
  await q.context().close();
});

await test('IH-04', 'INSIDE HUMAN: reduced motion and no JavaScript both give one static centred screen; arrow is static and still navigates', async () => {
  for (const opt of [{ reducedMotion: 'reduce' }, { javaScriptEnabled: false }]) {
    const p = await ctx(opt);
    await go(p, '/');
    const d = await p.evaluate(() => {
      const sec = document.querySelector('[data-ih]');
      return {
        film: sec.classList.contains('is-film'), h: sec.offsetHeight, vh: innerHeight,
        anim: [sec.querySelector('.ih__arrow'), sec.querySelector('.ih__arrow svg'), sec.querySelector('.ih__halo')].map((e) => getComputedStyle(e).animationName).join(),
      };
    });
    assert(!d.film && d.h < d.vh * 1.3, JSON.stringify(opt) + ' ' + JSON.stringify(d));
    if (opt.reducedMotion) assert(d.anim === 'none,none,none', 'arrow still animating with reduced motion: ' + d.anim);
    for (const sel of ['.ih__eyebrow', '.hero h1', '[data-ih-art]', '[data-ih-go]']) {
      assert(await p.locator(sel).isVisible(), sel + ' hidden');
      const b = await p.locator(sel).boundingBox();
      assert(Math.abs(b.x + b.width / 2 - 720) <= 2 && b.y + b.height <= 900, sel + ' not centred in the first screen');
    }
    await p.locator('[data-ih-go]').click();
    await p.waitForTimeout(500);
    const top = await p.evaluate(() => document.querySelector('#what-is-human').getBoundingClientRect().top);
    assert(top > -5 && top < 140, JSON.stringify(opt) + ' arrow landed at ' + top);
    if (!opt.reducedMotion) assert(await p.locator('.site-header .wordmark').isVisible(), 'no-JS: header must stay available');
    await p.context().close();
  }
});

await test('IH-05', 'INSIDE HUMAN opening at eleven viewport sizes: no overflow, four elements centred and inside the first screen, no navigation', async () => {
  for (const [w, h] of [[1920, 1080], [1600, 900], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [430, 932], [390, 844], [375, 667], [360, 640]]) {
    const p = await ctx({ viewport: { width: w, height: h } });
    await go(p, '/');
    const d = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const l1 = document.querySelector('.hero__l1');
      return {
        over: document.documentElement.scrollWidth - innerWidth,
        els: ['.ih__eyebrow', '[data-ih-slot]', '.hero__l1', '.hero__l2', '[data-ih-go]'].map((s) => { const b = r(s); return { s, l: b.left, r: b.right, t: b.top, b: b.bottom }; }),
        l1Lines: Math.round(l1.getBoundingClientRect().height / parseFloat(getComputedStyle(l1).fontSize)),
        eb: parseFloat(getComputedStyle(document.querySelector('.ih__eyebrow')).fontSize),
      };
    });
    assert(d.over <= 0, `${w}x${h} overflow ${d.over}`);
    d.els.forEach((e, i) => {
      assert(e.l >= 0 && e.r <= w + 0.5 && e.t >= 0 && e.b <= h, `${w}x${h} ${e.s} outside the first screen`);
      assert(Math.abs((e.l + e.r) / 2 - w / 2) <= 2, `${w}x${h} ${e.s} off centre`);
      if (i && e.s !== '.hero__l2') assert(e.t >= d.els[i - 1].b - 1, `${w}x${h} ${e.s} overlaps the element above`);
    });
    assert(d.l1Lines === 1, `${w}x${h} first headline line wraps`);
    assert(d.eb >= 10.5, `${w}x${h} eyebrow ${d.eb}px`);
    const wm = d.els[1].r - d.els[1].l;
    assert(wm >= w * (w < 900 ? 0.9 : 0.8), `${w}x${h} wordmark only ${Math.round((wm / w) * 100)}% wide`);
    const o = await heroOnly(p);
    assert(!o.header && o.interactive.length === 1, `${w}x${h} opening not minimal: ${JSON.stringify(o)}`);
    await p.context().close();
  }
});

await test('E2E-03', 'Header waitlist CTA (back after the opening film) opens /waitlist on the opening chapter', async () => {
  const p = await ctx();
  await go(p, '/');
  await pastHero(p);
  await p.locator('.site-header .nav a.btn[href="/waitlist"]').click();
  await p.waitForURL('**/waitlist');
  assert(await p.locator('#hp-h-1').isVisible(), 'opening chapter not shown');
  await p.context().close();
});

await test('E2E-04', 'Arrow reaches the next section; deep links reach Scene 01 and Scene 06 (V3-QA-09 deep anchors)', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/');
  await p.locator('[data-ih-go]').click();
  await p.waitForTimeout(300);
  assert((await p.locator('#what-is-human').boundingBox()).y < 200, 'next section not reached');
  await go(p, '/#scene-01');
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
    // V1.1 slowed the scene on purpose (longer pin, wider cross-fades), so the budget for two-image handovers is 16%
    assert(overlap <= 16, `handovers too long: ${overlap}% of the scroll`);
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
    await s5At(p, 0.706, 60);
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

await test('HER-01', 'HUMAN for Her: six sections with the approved copy word for word, in plain language; old sections gone', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/women');
  const heads = await p.evaluate(() => [...document.querySelectorAll('main h1, main h2')].map((h) => [...h.querySelectorAll('.mask > span')].map((s) => s.textContent.trim()).join(' / ')));
  const want = ['Preventive health. / Designed for women.', 'Women’s bodies / work differently.', 'The health issues / that matter to women.', 'More than / a routine blood test.', 'Know your health. / Stay informed.', 'Be among / the first.'];
  assert(JSON.stringify(heads) === JSON.stringify(want), 'headlines: ' + JSON.stringify(heads));
  assert((await p.locator('main > section').count()) === 6, 'section count');
  const text = (await p.locator('main').evaluate((e) => e.textContent)).replace(/\s+/g, ' ');
  for (const t of [
    'HUMAN for Her',
    'HUMAN is building a preventive health platform in India that focuses on women’s hormones, health markers and conditions that are often overlooked in routine health checkups.',
    'From periods and hormonal changes to energy levels and metabolism, women have different health needs.',
    'We believe health checkups should take these differences into account.',
    'Hormonal imbalances, PCOS and irregular periods.', 'Thyroid-related changes in energy, mood and weight.', 'Iron deficiency, vitamin deficiencies and anaemia.', 'Blood sugar, cholesterol and weight management.', 'Menstrual health, fertility and menopause.', 'Energy levels, physical performance and recovery.',
    'We are designing an experience that helps women:', 'Understand which health tests are relevant to them.', 'Make sense of their blood test results.', 'Understand potential health risks.', 'Take informed steps towards better health.', 'Track changes in their health over time.',
    'The aim is to make health information easier to understand and act on.',
    'Understand what’s happening inside your body.', 'Make sense of your results.', 'Take informed steps with professional guidance.', 'Follow changes in your health.', 'Check relevant health markers when needed.', 'Use what you learn to make better health decisions.',
    'We’re building HUMAN for Her to make preventive healthcare more relevant and accessible to women in India.',
    'Currently in development. Testing and medical services are not yet available.',
  ]) assert(text.includes(t), 'missing copy: ' + t);
  const areas = await p.locator('.sg-areas__list h3').allTextContents();
  assert(areas.join('|') === 'Hormonal health|Thyroid health|Nutritional health|Metabolic health|Reproductive health|Fitness and wellbeing', areas.join('|'));
  const steps = await p.locator('.sg-journey .seg__stages h3').allTextContents();
  assert(steps.join('|') === 'Test|Understand|Act|Track|Retest|Improve', steps.join('|'));
  for (const gone of ['A more thoughtful way', 'one-size-fits-all', 'Three themes', 'design intentions', 'We’re developing', 'India’s first', 'India\'s first']) assert(!text.includes(gone), 'obsolete or unverified copy still present: ' + gone);
  assert(/planned areas of focus/i.test(text), 'areas not labelled as planned');
  assert(/Delhi NCR/.test(text) && /across India/.test(text) && /not medical advice|is medical advice/.test(text), 'eligibility, pilot or medical note missing');
  assert((await p.locator('main .status-pill').count()) === 1 && (text.match(/in development/gi) || []).length <= 3, 'development notice should appear once, not throughout');
  await p.context().close();
});

await test('HER-02', 'HUMAN for Her: site typography reused, links work, mobile layout holds', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/404'); // reference page for the site's display heading
  const ref = await p.evaluate(() => { const h = getComputedStyle(document.querySelector('main .display')); const e = getComputedStyle(document.querySelector('main .display em')); return [h.fontFamily, h.fontWeight, h.textTransform, e.fontFamily, e.fontStyle].join('|'); });
  await go(p, '/women');
  const all = await p.evaluate(() => [...document.querySelectorAll('main h1, main h2')].map((h) => { const c = getComputedStyle(h); const e = getComputedStyle(h.querySelector('em')); return [c.fontFamily, c.fontWeight, c.textTransform, e.fontFamily, e.fontStyle].join('|'); }));
  assert(all.every((v) => v === ref), 'heading typography differs from the site: ' + all.find((v) => v !== ref));
  const fams = await p.evaluate(() => [...new Set([...document.querySelectorAll('main *')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim()))]);
  assert(fams.every((f) => /Hanken Grotesk Variable|Instrument Serif/.test(f)), 'font families: ' + fams.join(', '));
  const links = await p.evaluate(() => [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')));
  assert(links.filter((h) => h === '/waitlist').length === 2 && links.includes('#understanding') && links.includes('/#scene-06') && links.includes('/faq') && links.includes('/men'), 'links: ' + links.join(', '));
  assert((await p.locator('#understanding').count()) === 1, 'Explore further target missing');
  await p.locator('main .seg__cta a.btn').click();
  await p.waitForURL('**/waitlist');
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  for (const w of [360, 390, 768]) {
    const m = await ctx({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    await go(m, '/women');
    assert((await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, w + 'px overflow');
    assert(!(await m.evaluate(() => [...document.querySelectorAll('main h1, main h2')].some((h) => h.scrollWidth > h.clientWidth + 1))), w + 'px headline clipped');
    await m.context().close();
  }
  await p.context().close();
});

await test('HIM-01', 'HUMAN for Him: six sections with the approved copy word for word; indicators, numbering and microcopy as specified; old sections gone', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/men');
  const heads = await p.evaluate(() => [...document.querySelectorAll('main h1, main h2')].map((h) => [...h.querySelectorAll('.mask > span')].map((s) => s.textContent.trim()).join(' / ')));
  const want = ['Preventive health. / Designed for men.', 'Feeling healthy / isn’t the whole picture.', 'The health issues / that matter to men.', 'More than / a routine blood test.', 'Know your health. / Stay informed.', 'Be among / the first.'];
  assert(JSON.stringify(heads) === JSON.stringify(want), 'headlines: ' + JSON.stringify(heads));
  assert((await p.locator('main > section').count()) === 6, 'section count');
  const text = (await p.locator('main').evaluate((e) => e.textContent)).replace(/\s+/g, ' ');
  for (const t of [
    'HUMAN for Him',
    'HUMAN is building a preventive health platform in India with a focus on men’s hormones, health markers, physical wellbeing and common health risks.',
    'High cholesterol, high blood pressure and diabetes can develop without noticeable symptoms.',
    'Regular health checkups can help you identify potential health risks early and make more informed decisions about your health.',
    'Testosterone levels and hormonal imbalances.', 'Cholesterol, blood pressure and heart disease risk.', 'Blood sugar, diabetes and weight management.', 'Vitamin deficiencies, iron levels and nutrition.', 'Fertility, sexual health and prostate health.', 'Muscle health, strength, energy and recovery.',
    'Our planned areas of focus.',
    'We’re building an experience that helps men understand their health beyond a standard blood test report.',
    'Know which health tests are relevant to you.', 'Understand your hormones and blood test results.', 'Identify potential health risks early.', 'Make informed decisions about your health.', 'Track your health and physical wellbeing over time.',
    'Our goal is to make health information easier to understand and act on.',
    'Get relevant health tests.', 'Make sense of your results.', 'Take informed steps with professional guidance.', 'Follow changes in your health over time.', 'Check relevant health markers when needed.', 'Use what you learn to make better health decisions.',
    'Explore the complete HUMAN approach', 'Our planned approach to preventive healthcare.',
    'We’re building HUMAN for Him to make preventive healthcare more relevant, accessible and easier to understand for men in India.',
    'Open to people across India. First pilot planned for Delhi NCR.',
    'Currently in development. Testing and medical services are not yet available.',
    'does not provide medical advice', 'qualified healthcare professional',
  ]) assert(text.includes(t), 'missing copy: ' + t);
  const labels = await p.evaluate(() => [...document.querySelectorAll('main > section:not(.seg__hero) .eyebrow')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  assert(labels.join('|') === '01Understanding men’s health|02What we’re focusing on|03Our approach|04The HUMAN approach|05Join HUMAN', 'section indicators: ' + labels.join('|'));
  assert((await p.locator('.sg-areas__list h3').allTextContents()).join('|') === 'Hormonal health|Heart health|Metabolic health|Nutritional health|Reproductive health|Fitness and recovery', 'areas order');
  assert((await p.locator('.sg-areas__list li.is-lead h3').allTextContents()).join('|') === 'Hormonal health|Heart health|Fitness and recovery', 'emphasised areas');
  assert((await p.locator('.sg-approach__list--num li').count()) === 5 && (await p.locator('.sg-approach__n').allTextContents()).join() === '01,02,03,04,05', 'numbered points');
  assert((await p.locator('.sg-journey .seg__stages h3').allTextContents()).join('|') === 'Test|Understand|Act|Track|Retest|Improve' && (await p.locator('.seg__stage-n').allTextContents()).join() === '01,02,03,04,05,06', 'journey steps');
  for (const gone of ['Go beyond', 'what you can see', 'than how you feel', 'Three themes', 'design intentions', 'We’re developing', 'India’s first', 'scare tactics']) assert(!text.includes(gone), 'obsolete or unverified copy still present: ' + gone);
  assert((await p.locator('main .status-pill').count()) === 1 && (text.match(/in development/gi) || []).length <= 3, 'development notice should appear once');
  await p.context().close();
});

await test('HIM-02', 'HUMAN for Him and for Her: same structure and hierarchy, site typography, working links, layouts hold at phone, tablet and desktop', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const shape = async (r) => { await go(p, r); return p.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => [s.className.replace(/\s+/g, ' '), s.querySelectorAll('h1, h2').length, s.querySelectorAll('h3').length, s.querySelectorAll('a.btn').length].join(':')).join(' | ')); };
  const [a, b] = [await shape('/women'), await shape('/men')];
  assert(a === b, `structure differs:\n${a}\n${b}`);
  await go(p, '/404'); // reference page for the site's display heading
  const ref = await p.evaluate(() => { const h = getComputedStyle(document.querySelector('main .display')); const e = getComputedStyle(document.querySelector('main .display em')); return [h.fontFamily, h.fontWeight, h.letterSpacing === 'normal' ? 0 : (parseFloat(h.letterSpacing) / parseFloat(h.fontSize)).toFixed(3), h.textTransform, e.fontFamily, e.fontStyle, e.fontWeight].join('|'); });
  await go(p, '/men');
  const all = await p.evaluate(() => [...document.querySelectorAll('main h1, main h2')].map((h) => { const c = getComputedStyle(h); const e = getComputedStyle(h.querySelector('em')); return [c.fontFamily, c.fontWeight, (parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(3), c.textTransform, e.fontFamily, e.fontStyle, e.fontWeight].join('|'); }));
  assert(all.every((v) => v === ref), 'heading typography differs from the site: ' + all.find((v) => v !== ref) + ' vs ' + ref);
  const fams = await p.evaluate(() => [...new Set([...document.querySelectorAll('main *')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim()))]);
  assert(fams.every((f) => /Hanken Grotesk Variable|Instrument Serif/.test(f)), 'font families: ' + fams.join(', '));
  assert(await p.evaluate(() => document.fonts.check('700 20px "Hanken Grotesk Variable"') && document.fonts.check('italic 400 20px "Instrument Serif"')), 'site fonts not actually loaded');
  const links = await p.evaluate(() => [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')));
  assert(links.filter((h) => h === '/waitlist').length === 2 && links.includes('#understanding') && links.includes('/#scene-06') && links.includes('/faq') && links.includes('/women'), 'links: ' + links.join(', '));
  assert(await p.locator('.seg__hero-photo img').first().evaluate((i) => i.complete && i.naturalWidth > 0), 'hero photograph missing');
  await p.locator('main .sg-journey a.link').click();
  await p.waitForURL('**/#scene-06');
  await go(p, '/men');
  await p.locator('main .sg-micro a').click();
  await p.waitForURL('**/faq');
  await go(p, '/men');
  await p.locator('main .seg__hero a.btn').click();
  await p.waitForURL('**/waitlist');
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  for (const [w, h] of [[360, 640], [390, 844], [768, 1024], [1440, 900]]) {
    const m = await ctx({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await go(m, '/men');
    assert((await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, w + 'px overflow');
    assert(!(await m.evaluate(() => [...document.querySelectorAll('main h1, main h2')].some((x) => x.scrollWidth > x.clientWidth + 1))), w + 'px headline clipped');
    await m.context().close();
  }
  // entrance motion still runs with motion allowed
  const q = await ctx();
  await go(q, '/men');
  // reveals fire as each element enters the viewport, so walk the section the way a reader would
  const hiddenBefore = await q.evaluate(() => [...document.querySelectorAll('.sg-areas__list [data-reveal]')].filter((e) => Number(getComputedStyle(e).opacity) < 0.5).length);
  assert(hiddenBefore > 0, 'entrance motion is not armed (nothing waits to be revealed)');
  for (let i = 0; i < 6; i++) {
    await q.evaluate((i) => document.querySelectorAll('.sg-areas__list li')[i].scrollIntoView({ block: 'center' }), i);
    await q.waitForTimeout(350);
  }
  await q.waitForTimeout(1200);
  const left = await q.evaluate(() => [...document.querySelectorAll('.sg-areas [data-reveal]')].filter((e) => Number(getComputedStyle(e).opacity) < 0.95).length);
  assert(left === 0, left + ' elements in the areas section never finished revealing');
  await q.context().close();
  await p.context().close();
});

await test('E2E-12', 'Mobile menu: opens as modal, focus trapped, ESC closes, focus returns, page does not scroll', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 } });
  await go(p, '/');
  assert(!(await p.locator('[data-menu-open]').isVisible()), 'menu button visible on the opening screen');
  await pastHero(p);
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
  assert(await p.locator('[data-ih-go]').isVisible(), 'arrow');
  assert(await p.locator('.site-header a.btn[href="/waitlist"]').first().isVisible(), 'waitlist CTA in the header');
  await go(p, '/waitlist');
  assert(/needs JavaScript/.test(await p.locator('main').innerText()), 'no-JS waitlist notice');
  await p.context().close();
});

await test('E2E-15/44', 'Images blocked: hero headline and arrow still readable; wordmark still drawn as solid letters (V3-QA-02)', async () => {
  const p = await ctx();
  await p.route('**/*.{webp,png,jpg,jpeg,avif}', (r) => r.abort());
  await go(p, '/');
  assert(await p.locator('h1').isVisible(), 'h1');
  const bg = await p.locator('.hero').evaluate((e) => getComputedStyle(e).backgroundColor);
  assert(bg === 'rgb(242, 238, 230)', 'hero bg ' + bg);
  const ink = await p.locator('.hero h1').evaluate((e) => getComputedStyle(e).color);
  assert(ink.match(/\d+/g).slice(0, 3).reduce((a, v) => a + Number(v), 0) < 200, 'headline not dark on ivory: ' + ink);
  assert((await p.locator('[data-ih-letter] rect').count()) === 5, 'letters have no solid fallback fill');
  assert(await p.locator('[data-ih-go]').isVisible(), 'arrow');
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

// ---------- HUMAN Portal (/waitlist) ----------
const FIX = '/__test_fixture__/waitlist';
const ch = (p) => p.locator('[data-hp]').getAttribute('data-chapter');
const visibleChapters = (p) => p.evaluate(() => [...document.querySelectorAll('[data-ch]')].filter((c) => !c.hidden).map((c) => c.dataset.ch).join());
const settleTo = async (p, n, ms = 6000) => {
  await p.waitForFunction((n) => document.querySelector('[data-hp]').dataset.chapter === String(n) && document.querySelector('[data-fx]').hidden, n, { timeout: ms });
  await p.waitForTimeout(150);
};
const begin = async (p) => { await p.locator('[data-begin]').click(); await settleTo(p, 2); };
const toCh3 = async (p, name = 'Asha') => { await begin(p); await p.fill('[name=firstName]', name); await p.locator('[data-form="2"] .hp-btn').click(); await settleTo(p, 3); };
const toCh4 = async (p, name = 'Asha') => { await toCh3(p, name); await p.locator('[data-form="3"] .hp-btn').click(); await settleTo(p, 4); };
const fillCh4 = async (p) => { await p.fill('[name=email]', 'asha@example.com'); await p.check('#hp-consent', { force: true }); };
const useFixture = (p) => p.evaluate((f) => (document.querySelector('[data-hp]').dataset.endpoint = f), FIX);

await test('HP-01', 'Portal: five approved two-line headlines, unchanged; one chapter visible at a time; counter and five-segment progress', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  const heads = await p.evaluate(() => [...document.querySelectorAll('[data-ch] h1')].map((h) => [h.querySelector('.hp__l1').textContent, h.querySelector('.hp__l2').textContent, getComputedStyle(h.querySelector('.hp__l1')).textTransform, getComputedStyle(h.querySelector('.hp__l2')).fontStyle, getComputedStyle(h.querySelector('.hp__l1')).fontFamily, getComputedStyle(h.querySelector('.hp__l2')).fontFamily]));
  const want = [['Welcome', 'to Human.'], ['Let’s get to', 'know you.'], ['What matters', 'to you?'], ['Be among', 'the first.'], ['You’re on', 'the list.']];
  assert(heads.length === 5, 'chapters: ' + heads.length);
  heads.forEach((h, i) => {
    assert(h[0] === want[i][0] && h[1] === want[i][1], `chapter ${i + 1} headline: ${h[0]} / ${h[1]}`);
    assert(h[2] === 'uppercase' && h[3] === 'italic' && /Hanken Grotesk/.test(h[4]) && /Instrument Serif/.test(h[5]), `chapter ${i + 1} type: ${h.slice(2)}`);
  });
  assert((await visibleChapters(p)) === '1', 'visible at start: ' + (await visibleChapters(p)));
  assert((await p.locator('[data-count]').innerText()) === '01' && (await p.locator('[data-seg]').count()) === 5 && (await p.locator('[data-seg].is-done').count()) === 1, 'progress at start');
  for (const t of ['A deeper understanding of your health begins here.', 'Begin your journey', 'A little about you. A new perspective on health.']) assert((await p.locator('.hp1').innerText()).includes(t), 'missing: ' + t);
  await begin(p);
  assert((await visibleChapters(p)) === '2' && (await p.locator('[data-count]').innerText()) === '02' && (await p.locator('[data-seg].is-done').count()) === 2, 'chapter 2 state');
  assert(await p.evaluate(() => document.activeElement.id === 'hp-h-2'), 'focus not moved to the new chapter heading');
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('HP-02', 'Portal assets: every image comes from the supplied library; nothing is enlarged past its source; all load', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const failed = [];
  p.on('response', (r) => r.status() >= 400 && failed.push(r.url()));
  await go(p, '/waitlist');
  const m = await p.evaluate(() => JSON.parse(document.querySelector('[data-hp]').dataset.manifest));
  assert(Object.keys(m.images).length === 14, 'library size ' + Object.keys(m.images).length);
  const srcs = await p.evaluate(() => [...document.querySelectorAll('.hp img[src]')].map((i) => i.getAttribute('src')));
  const known = Object.values(m.images).map((i) => i.src);
  const base = (u) => u.split('/').pop().split('.')[0].split('_')[0];
  for (const s of srcs) assert(known.some((k) => base(k) === base(s)), 'image outside the library: ' + s);
  for (const [id, i] of Object.entries(m.images)) {
    const r = await p.evaluate((src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im.naturalWidth); im.onerror = () => res(0); im.src = src; }), i.src);
    assert(r > 0 && r <= i.w, `${id} served at ${r}px from a ${i.w}px source`);
  }
  assert(failed.length === 0, 'failed requests: ' + failed.join(', '));
  await p.context().close();
});

await test('HP-03', 'Portal signature transition: tube → macro → cells play in order over the page, then hand over to Chapter 02; controls are never trapped', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await p.waitForTimeout(900);
  await p.locator('[data-begin]').click();
  const seen = [];
  for (let i = 0; i < 26; i++) {
    seen.push(await p.evaluate(() => {
      const fx = document.querySelector('[data-fx]');
      const o = (k) => { const e = fx.querySelector(`[data-fx-img="${k}"]`); const c = getComputedStyle(e); return c.visibility === 'hidden' ? 0 : Number(c.opacity); };
      return { fx: !fx.hidden, a: o('a'), b: o('b'), c: o('c'), ch: document.querySelector('[data-hp]').dataset.chapter, src: ['a', 'b', 'c'].map((k) => (fx.querySelector(`[data-fx-img="${k}"]`).getAttribute('src') || '').split('/').pop().slice(0, 3)).join() };
    }));
    await p.waitForTimeout(90);
  }
  const first = (f) => seen.findIndex(f);
  const [ia, ib, ic, i2] = [first((s) => s.fx && s.a > 0.9), first((s) => s.b > 0.5), first((s) => s.c > 0.5), first((s) => s.ch === '2')];
  assert(ia >= 0 && ib > ia && ic > ib && i2 >= ic, `order tube/macro/cells/chapter: ${ia}/${ib}/${ic}/${i2}`);
  assert(seen[ia].src === 'A01,A02,A03', 'layers are not A01, A02, A03: ' + seen[ia].src);
  await settleTo(p, 2);
  assert((await visibleChapters(p)) === '2', 'after the film: ' + (await visibleChapters(p)));
  assert(await p.locator('[name=firstName]').isEditable(), 'form not usable after the film');
  // reduced motion: no film layer at all
  const q = await ctx({ reducedMotion: 'reduce' });
  await go(q, '/waitlist');
  await q.locator('[data-begin]').click();
  await q.waitForTimeout(120);
  assert((await ch(q)) === '2' && (await q.evaluate(() => document.querySelector('[data-fx]').hidden)), 'reduced motion should switch at once with no film');
  await q.context().close();
  await p.context().close();
});

await test('HP-04', 'Chapter 02: first name required (error, focus, no advance); age and gender optional; self-describe field appears only on request', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  await begin(p);
  await p.locator('[data-form="2"] .hp-btn').click();
  assert((await ch(p)) === '2', 'advanced without a name');
  assert((await p.locator('#hp-first-err').innerText()) === 'Enter your first name.', 'error text');
  assert(await p.evaluate(() => document.activeElement.id === 'hp-first' && document.activeElement.getAttribute('aria-invalid') === 'true'), 'focus/invalid state');
  assert(!(await p.locator('[data-self-field]').isVisible()), 'self-describe shown by default');
  assert((await p.locator('[name=ageGroup]').count()) === 6 && (await p.locator('[name=gender]').count()) === 4, 'option counts');
  assert((await p.locator('[name=ageGroup]:checked, [name=gender]:checked').count()) === 0, 'something preselected');
  await p.check('#hp-gen-2', { force: true });
  assert(await p.locator('[data-self-field]').isVisible(), 'self-describe not shown');
  await p.check('#hp-gen-0', { force: true });
  assert(!(await p.locator('[data-self-field]').isVisible()), 'self-describe still shown');
  await p.fill('[name=firstName]', 'Asha');
  assert((await p.locator('#hp-first-err').innerText()) === '', 'error not cleared');
  await p.locator('[name=firstName]').press('Enter');
  await settleTo(p, 3);
  await p.context().close();
});

await test('HP-05', 'Chapter 03: ten optional interests, none preselected, independent multi-select; picture follows the active topic; deselecting keeps the rest', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  await toCh3(p);
  const boxes = p.locator('[name=interests]');
  assert((await boxes.count()) === 10 && (await p.locator('[name=interests]:checked').count()) === 0, 'interests / preselection');
  const labels = await p.locator('.hp3 .hp-chip span').allInnerTexts();
  assert(labels.join('|') === 'Preventive health|Fitness & performance|Hormonal health|Heart health|Energy & metabolism|Women’s health|Men’s health|Longevity|Sleep & recovery|Overall wellbeing', labels.join('|'));
  assert((await p.locator('.hp3').innerText()).includes('Select as many as you like.'), 'microcopy');
  const now = () => p.evaluate(() => { const s = document.querySelector('.hp3__slot.is-on .hp3__pic'); return { img: (s.getAttribute('src') || '').split('/').pop().slice(0, 3), label: document.querySelector('[data-topic-label]').textContent, alt: s.alt }; });
  await p.waitForTimeout(500);
  assert((await now()).img === 'A02', 'neutral default: ' + JSON.stringify(await now()));
  const expect = { preventive: 'A01', hormonal: 'A09', heart: 'A03', energy: 'A12', womens: 'A06', mens: 'A10', longevity: 'A11', sleep: 'A07', wellbeing: 'A04' };
  for (const [k, id] of Object.entries(expect)) {
    await p.check('#hp-int-' + k, { force: true });
    await p.mouse.move(2, 2);
    await p.waitForTimeout(450);
    const n = await now();
    assert(n.img === id && n.alt.length > 10, `${k} shows ${n.img}, wanted ${id}`);
  }
  await p.check('#hp-int-fitness', { force: true });
  await p.mouse.move(2, 2);
  await p.waitForTimeout(450);
  assert((await now()).img === 'A05', 'fitness starts on the runners: ' + (await now()).img);
  await p.waitForTimeout(2300);
  assert((await now()).img === 'A08', 'fitness did not move on to the anatomy: ' + (await now()).img);
  assert((await p.locator('[name=interests]:checked').count()) === 10, 'selections lost while pictures changed');
  await p.uncheck('#hp-int-fitness', { force: true });
  await p.uncheck('#hp-int-heart', { force: true });
  assert((await p.locator('[name=interests]:checked').count()) === 8, 'deselecting removed more than one');
  await p.waitForTimeout(450);
  assert((await now()).img === 'A04', 'after deselecting the active topic the picture should fall back to the last chosen: ' + (await now()).img);
  const txt = await p.locator('.hp3__panel').innerText();
  assert(/Illustrative visuals\. Not a personal health assessment\./.test(txt), 'disclaimer missing');
  assert(!/\d+\s?(%|bpm|mg|mmol|ng|score)/i.test(txt), 'a number that looks like a measurement: ' + txt);
  // hover previews without selecting
  await p.uncheck('#hp-int-longevity', { force: true });
  await p.mouse.move(2, 2);
  await p.waitForTimeout(300);
  await p.locator('[data-topic="longevity"]').hover();
  await p.waitForTimeout(450);
  assert((await now()).img === 'A11' && !(await p.locator('#hp-int-longevity').isChecked()), 'hover should preview without selecting');
  await p.context().close();
});

await test('HP-06', 'Chapter 03 under rapid changes: the last request wins, no errors; continuing with nothing selected is allowed', async () => {
  const p = await ctx();
  await go(p, '/waitlist');
  await toCh3(p);
  for (const k of ['heart', 'longevity', 'energy', 'wellbeing', 'hormonal', 'mens']) await p.check('#hp-int-' + k, { force: true });
  await p.mouse.move(2, 2);
  await p.waitForTimeout(1300);
  const img = await p.evaluate(() => (document.querySelector('.hp3__slot.is-on .hp3__pic').getAttribute('src') || '').split('/').pop().slice(0, 3));
  assert(img === 'A10' && (await p.locator('.hp3__slot.is-on').count()) === 1, 'after rapid changes: ' + img);
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  const q = await ctx({ reducedMotion: 'reduce' });
  await go(q, '/waitlist');
  await toCh4(q);
  assert((await ch(q)) === '4', 'could not continue with no interests');
  await q.context().close();
  await p.context().close();
});

await test('HP-07', 'Back keeps everything: name, age, gender, interests and contact details survive going back and forward; browser Back works too', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  await begin(p);
  await p.fill('[name=firstName]', 'Asha');
  await p.check('#hp-age-1', { force: true });
  await p.check('#hp-gen-2', { force: true });
  await p.fill('[name=genderSelf]', 'non-binary');
  await p.locator('[data-form="2"] .hp-btn').click();
  await settleTo(p, 3);
  await p.check('#hp-int-heart', { force: true });
  await p.check('#hp-int-sleep', { force: true });
  await p.locator('[data-form="3"] .hp-btn').click();
  await settleTo(p, 4);
  await p.fill('[name=email]', 'asha@example.com');
  await p.fill('[name=mobile]', '98765 43210');
  await p.fill('[name=city]', 'Jaipur');
  await p.check('#hp-consent', { force: true });
  await p.locator('.hp4 [data-back]').click();
  await settleTo(p, 3);
  assert((await p.locator('[name=interests]:checked').count()) === 2, 'interests lost');
  await p.locator('.hp3 [data-back]').click();
  await settleTo(p, 2);
  assert((await p.inputValue('[name=firstName]')) === 'Asha' && (await p.isChecked('#hp-age-1')) && (await p.isChecked('#hp-gen-2')) && (await p.inputValue('[name=genderSelf]')) === 'non-binary', 'chapter 2 values lost');
  assert((await p.locator('.hp2 [data-back]').count()) === 1 && (await p.locator('.hp1 [data-back]').count()) === 0 && (await p.locator('.hp5 [data-back]').count()) === 0, 'Back should exist on chapters 2–4 only');
  await p.locator('[data-form="2"] .hp-btn').click();
  await settleTo(p, 3);
  await p.locator('[data-form="3"] .hp-btn').click();
  await settleTo(p, 4);
  assert((await p.inputValue('[name=email]')) === 'asha@example.com' && (await p.inputValue('[name=mobile]')) === '98765 43210' && (await p.inputValue('[name=city]')) === 'Jaipur' && (await p.isChecked('#hp-consent')), 'chapter 4 values lost');
  await p.goBack();
  await settleTo(p, 3);
  await p.goForward();
  await settleTo(p, 4);
  assert((await p.inputValue('[name=email]')) === 'asha@example.com', 'history navigation lost the draft');
  await p.context().close();
});

await test('HP-08', 'Chapter 04 validation: email required and checked; mobile and city optional; international numbers accepted; consent required and unchecked by default', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  await toCh4(p);
  assert(!(await p.isChecked('#hp-consent')), 'consent pre-checked');
  assert((await p.inputValue('[name=countryCode]')) === '+91', 'default country code');
  await p.locator('[data-submit]').click();
  assert((await p.locator('#hp-email-err').innerText()) === 'Enter your email address.', 'blank email error');
  assert(/please agree/i.test(await p.locator('#hp-consent-err').innerText()), 'consent error');
  assert(await p.evaluate(() => document.activeElement.id === 'hp-email'), 'focus on first invalid field');
  await p.fill('[name=email]', 'not-an-email');
  await p.locator('[data-submit]').click();
  assert(/like you@example\.com/.test(await p.locator('#hp-email-err').innerText()), 'invalid email error');
  await p.fill('[name=email]', 'asha@example.com');
  await p.check('#hp-consent', { force: true });
  await p.fill('[name=mobile]', '12');
  await p.locator('[data-submit]').click();
  assert(/country code, or leave this blank/.test(await p.locator('#hp-phone-err').innerText()), 'short number accepted');
  for (const [cc, n] of [['+91', '98765 43210'], ['+971', '50 123 4567'], ['+44', '7700 900123'], ['+91', '+1 415 555 0132']]) {
    await p.fill('[name=countryCode]', cc);
    await p.fill('[name=mobile]', n);
    await p.locator('[data-submit]').click();
    assert((await p.locator('#hp-phone-err').innerText()) === '', `rejected a valid number ${cc} ${n}`);
  }
  await p.fill('[name=mobile]', '');
  await p.locator('[data-submit]').click();
  assert((await p.locator('#hp-phone-err').innerText()) === '' && (await p.locator('#hp-email-err').innerText()) === '', 'optional fields blocked the form');
  assert((await p.locator('.hp4 a[href="/privacy"]').count()) === 1, 'privacy link');
  assert((await ch(p)) === '4', 'left chapter 4 without a backend');
  await p.context().close();
});

await test('HP-09', 'Preview mode: a valid submit says registrations are not being accepted, sends NOTHING, and the closing chapter is reachable only as a labelled preview', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  assert(/Preview — registrations are not being accepted yet/i.test(await p.locator('.hp__mode').innerText()), 'preview label');
  assert(await p.locator('.hp__mode').isVisible(), 'preview label hidden');
  await toCh4(p);
  await fillCh4(p);
  const before = p.requests.length;
  await p.locator('[data-submit]').click();
  await p.waitForTimeout(400);
  const n = await p.locator('[data-notice]').innerText();
  assert(/not accepting registrations yet/i.test(n) && /Nothing has been sent or saved/.test(n), 'notice: ' + n);
  assert((await ch(p)) === '4', 'moved on in preview');
  assert(p.requests.slice(before).filter((r) => r.method !== 'GET').length === 0, 'a non-GET request was made');
  await p.locator('[data-demo]').click();
  await settleTo(p, 5);
  assert(await p.locator('[data-preview-flag]').isVisible(), 'closing chapter shown without its preview label');
  assert(/No registration was made/i.test(await p.locator('.hp5').innerText()), 'preview wording');
  await p.context().close();
});

await test('HP-10', 'No form value reaches the URL, localStorage, sessionStorage, cookies or the console', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const logs = [];
  p.on('console', (m) => logs.push(m.text()));
  await go(p, '/waitlist');
  await toCh4(p, 'Zephyrine');
  await p.fill('[name=email]', 'zephyrine.q@example.com');
  await p.fill('[name=city]', 'Udaipur');
  await p.check('#hp-consent', { force: true });
  await p.locator('[data-submit]').click();
  await p.waitForTimeout(300);
  const dump = await p.evaluate(() => JSON.stringify([location.href, { ...localStorage }, { ...sessionStorage }, document.cookie, history.state]));
  for (const v of ['Zephyrine', 'zephyrine.q', 'Udaipur']) assert(!dump.includes(v) && !logs.join(' ').includes(v), 'leaked: ' + v);
  await p.context().close();
});

await test('HP-11', 'Reload or a forged URL never shows the closing chapter, and the draft is not retained', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  for (const u of ['/waitlist#5', '/waitlist?chapter=5', '/waitlist?success=true', '/waitlist#finale']) {
    await go(p, u);
    assert((await visibleChapters(p)) === '1', u + ' shows chapter ' + (await visibleChapters(p)));
  }
  await go(p, '/waitlist');
  await toCh4(p);
  await p.evaluate(() => history.pushState({ hp: 5 }, '', location.pathname));
  await p.goBack();
  await p.goForward();
  await p.waitForTimeout(500);
  assert((await ch(p)) !== '5', 'history state alone reached the closing chapter');
  await p.reload({ waitUntil: 'networkidle' });
  assert((await visibleChapters(p)) === '1', 'after reload');
  await p.locator('[data-begin]').click();
  await settleTo(p, 2);
  assert((await p.inputValue('[name=firstName]')) === '', 'draft retained across reload');
  await p.context().close();
});

await test('HP-12', '[TEST FIXTURE] Accepted response → closing chapter with the first name; double press sends once; payload carries consent time and notice version', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  let hits = 0;
  let body = null;
  let key = '';
  await p.route('**' + FIX, async (route) => {
    hits++;
    body = JSON.parse(route.request().postData());
    key = route.request().headers()['idempotency-key'];
    await new Promise((r) => setTimeout(r, 350));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'accepted' }) });
  });
  await go(p, '/waitlist');
  await begin(p);
  await p.fill('[name=firstName]', 'Asha');
  await p.check('#hp-age-1', { force: true });
  await p.locator('[data-form="2"] .hp-btn').click();
  await settleTo(p, 3);
  await p.check('#hp-int-heart', { force: true });
  await p.locator('[data-form="3"] .hp-btn').click();
  await settleTo(p, 4);
  await useFixture(p);
  await fillCh4(p);
  await p.locator('[data-submit]').dblclick();
  await p.waitForTimeout(120);
  assert((await ch(p)) === '4' && (await p.locator('[data-submit]').isDisabled()), 'should wait for the server before moving on');
  await settleTo(p, 5);
  assert(hits === 1, 'requests sent: ' + hits);
  assert(body.firstName === 'Asha' && body.ageGroup === '25–34' && body.gender === null && body.interests.join() === 'heart' && body.email === 'asha@example.com' && body.mobile === null && body.city === null && body.waitlistConsent === true, 'payload ' + JSON.stringify(body));
  assert(!Number.isNaN(Date.parse(body.consentAt)) && body.privacyNoticeVersion && key.length > 20, 'consent metadata / idempotency key');
  const t = await p.locator('.hp5').innerText();
  assert(/Thank you, Asha\./.test(t) && /We’ll be in touch as HUMAN takes shape\./.test(t) && /More life\.\s+More moments that matter\./.test(t), 'closing copy: ' + t);
  assert(!(await p.locator('[data-preview-flag]').isVisible()), 'preview label on a real confirmation');
  assert(await p.locator('.hp5 a[href="/"]').isVisible(), 'Return to HUMAN');
  assert((await p.inputValue('[name=email]')) === '', 'details kept in the page after acceptance');
  await p.goBack();
  await p.waitForTimeout(400);
  assert((await ch(p)) === '5', 'Back left the confirmation');
  await p.context().close();
});

await test('HP-13', '[TEST FIXTURE] Server error and network failure → recoverable message, every value kept, retry possible, no closing chapter', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  let mode = '500';
  await p.route('**' + FIX, (route) => (mode === '500' ? route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }) : mode === 'net' ? route.abort() : route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'accepted' }) })));
  await go(p, '/waitlist');
  await toCh4(p);
  await useFixture(p);
  await fillCh4(p);
  await p.fill('[name=city]', 'Jaipur');
  for (const [m, rx] of [['500', /couldn’t complete your registration/i], ['net', /couldn’t reach the server/i]]) {
    mode = m;
    await p.locator('[data-submit]').click();
    await p.waitForTimeout(500);
    assert(rx.test(await p.locator('[data-notice]').innerText()), m + ' notice: ' + (await p.locator('[data-notice]').innerText()));
    assert((await ch(p)) === '4', m + ' left chapter 4');
    assert((await p.inputValue('[name=email]')) === 'asha@example.com' && (await p.inputValue('[name=city]')) === 'Jaipur' && (await p.isChecked('#hp-consent')), m + ' lost values');
    assert(!(await p.locator('[data-submit]').isDisabled()), m + ' cannot retry');
  }
  mode = 'ok';
  await p.locator('[data-submit]').click();
  await settleTo(p, 5);
  await p.context().close();
});

await test('HP-14', '[TEST FIXTURE] Duplicate response shows neutral wording, no closing chapter, no account enumeration', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await p.route('**' + FIX, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'duplicate' }) }));
  await go(p, '/waitlist');
  await toCh4(p);
  await useFixture(p);
  await fillCh4(p);
  await p.locator('[data-submit]').click();
  await p.waitForTimeout(500);
  const n = await p.locator('[data-notice]').innerText();
  assert(/If this is a new registration, it has been recorded/.test(n) && !/already|exists|registered before/i.test(n), 'duplicate wording: ' + n);
  assert((await ch(p)) === '4', 'duplicate reached the closing chapter');
  await p.context().close();
});

await test('HP-15', 'Portal layout at 360, 390, 768, 1024, 1440 and 1920: no horizontal overflow on any chapter; primary action reachable; picture change keeps scroll position', async () => {
  for (const [w, h] of [[360, 640], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
    const p = await ctx({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await go(p, '/waitlist');
    const check = async (n, sel) => {
      const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert(over <= 0, `${w}px chapter ${n} overflows by ${over}px`);
      if (sel) {
        await p.locator(sel).scrollIntoViewIfNeeded();
        const b = await p.locator(sel).boundingBox();
        assert(b && b.x >= 0 && b.x + b.width <= w + 0.5 && b.y >= 0 && b.y + b.height <= h + 0.5 && b.height >= 44, `${w}px chapter ${n}: primary action not reachable`);
      }
      const h1 = await p.locator(`[data-ch="${n}"] h1`).evaluate((e) => e.scrollWidth > e.clientWidth + 1);
      assert(!h1, `${w}px chapter ${n}: headline clipped`);
    };
    await check(1, '[data-begin]');
    if (w >= 900) { const b = await p.locator('[data-begin]').boundingBox(); assert(b.y + b.height <= h, `${w}px: Begin below the fold`); }
    await begin(p);
    await p.fill('[name=firstName]', 'Asha');
    await check(2, '[data-form="2"] .hp-btn');
    await p.locator('[data-form="2"] .hp-btn').click();
    await settleTo(p, 3);
    await check(3, '[data-form="3"] .hp-btn');
    if (w < 900) {
      await p.locator('#hp-int-wellbeing').scrollIntoViewIfNeeded();
      const y0 = await p.evaluate(() => scrollY);
      await p.check('#hp-int-wellbeing', { force: true });
      await p.waitForTimeout(500);
      assert(Math.abs((await p.evaluate(() => scrollY)) - y0) < 2, `${w}px: choosing an interest moved the page`);
      const panel = await p.locator('.hp3__panel').boundingBox();
      assert(panel.y >= 0 && panel.y < h * 0.4, `${w}px: the picture is not in view while choosing`);
    }
    await p.locator('[data-form="3"] .hp-btn').click();
    await settleTo(p, 4);
    await check(4, '[data-submit]');
    assert((await p.locator('.hp__acts').first().evaluate((e) => getComputedStyle(e).position)) === 'static', 'action row is fixed (would cover the keyboard)');
    await fillCh4(p);
    await p.locator('[data-submit]').click();
    await p.locator('[data-demo]').click();
    await settleTo(p, 5);
    await check(5, '.hp5__return');
    await p.context().close();
  }
});

await test('HP-16', 'Portal accessibility: every input labelled with an autocomplete purpose; targets ≥ 44px; focus ring; status regions; meaningful alt text', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  const issues = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.hp input').forEach((el) => {
      const named = (el.labels && el.labels.length) || el.getAttribute('aria-label');
      if (!named) out.push('no label: ' + (el.id || el.name));
      if (!['checkbox', 'radio'].includes(el.type) && !el.autocomplete) out.push('no autocomplete: ' + el.id);
    });
    document.querySelectorAll('.hp fieldset').forEach((f) => !f.querySelector('legend') && out.push('fieldset without legend'));
    document.querySelectorAll('.hp [data-ch] img, .hp3__pic').forEach((i) => { if (!i.hasAttribute('alt')) out.push('img without alt'); });
    ['A01', 'A06', 'A10', 'A14', 'A13'].forEach(() => 0);
    document.querySelectorAll('.hp1 img, .hp2 img, .hp4 img, .hp5 img').forEach((i) => i.alt.length < 20 && out.push('thin alt: ' + i.alt));
    if (!document.querySelector('[data-announce][aria-live]') || !document.querySelector('[data-notice][aria-live]')) out.push('live regions missing');
    if (document.querySelectorAll('.hp [tabindex]:not([tabindex="-1"])').length) out.push('positive tabindex');
    return out;
  });
  assert(issues.length === 0, issues.join('; '));
  const small = [];
  const measure = async (n) => small.push(...(await p.evaluate((n) => [...document.querySelectorAll(`[data-ch="${n}"] button, [data-ch="${n}"] .hp-chip span, .hp__top a, [data-ch="${n}"] .hp5__return, [data-ch="${n}"] .hp-check`)].filter((e) => e.offsetParent !== null && e.getBoundingClientRect().height < 44).map((e) => `ch${n} ${Math.round(e.getBoundingClientRect().height)}px ${e.textContent.trim().slice(0, 18)}`), n)));
  await measure(1);
  await begin(p);
  await measure(2);
  await p.fill('[name=firstName]', 'Asha');
  await p.locator('[name=firstName]').focus();
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).boxShadow);
  assert(ring !== 'none', 'no focus indication on a text field');
  await p.locator('[data-form="2"] .hp-btn').click();
  await settleTo(p, 3);
  await measure(3);
  await p.locator('[data-form="3"] .hp-btn').click();
  await settleTo(p, 4);
  await measure(4);
  assert(small.length === 0, 'small targets: ' + small.join('; '));
  // keyboard only, start to submit
  const k = await ctx({ reducedMotion: 'reduce' });
  await go(k, '/waitlist');
  await k.locator('[data-begin]').focus();
  await k.keyboard.press('Enter');
  await settleTo(k, 2);
  await k.locator('[name=firstName]').focus();
  await k.keyboard.type('Asha');
  await k.keyboard.press('Enter');
  await settleTo(k, 3);
  await k.locator('#hp-int-heart').focus();
  await k.keyboard.press('Space');
  assert(await k.isChecked('#hp-int-heart'), 'Space did not select an interest');
  await k.locator('[data-form="3"] .hp-btn').focus();
  await k.keyboard.press('Enter');
  await settleTo(k, 4);
  await k.context().close();
  await p.context().close();
});

await test('HP-17', 'Portal honesty: no fabricated claims, measurements, testimonials or patient framing anywhere in the five chapters', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  await go(p, '/waitlist');
  const text = await p.evaluate(() => [...document.querySelectorAll('[data-ch]')].map((c) => c.textContent).join(' ').replace(/\s+/g, ' '));
  for (const rx of [/\d[\d,]*\+?\s*(members|people|users|patients|customers|doctors|labs)/i, /₹|\$\s?\d|per month|free trial/i, /our (doctors|clinicians|patients|customers|members)/i, /diagnos|your (results|score|risk)|biomarker/i, /book (a|your) (test|appointment)/i, /“[^”]{20,}”\s*—/]) {
    assert(!rx.test(text), 'claim-like text: ' + (text.match(rx) || [''])[0]);
  }
  assert(/Illustrative visuals\. Not a personal health assessment\./.test(text), 'illustrative disclaimer');
  await p.context().close();
});

await test('HP-18', 'Portal typography is the main site’s: same families, weights, tracking, proportions, colours, wordmark and button text as the site’s own headings', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  const pick = (sel, props) => p.evaluate(([sel, props]) => { const e = document.querySelector(sel); const c = getComputedStyle(e); const fs = parseFloat(c.fontSize); return Object.fromEntries(props.map((k) => [k, k === 'letterSpacing' ? (parseFloat(c.letterSpacing) / fs).toFixed(3) : k === 'lineHeight' ? (parseFloat(c.lineHeight) / fs).toFixed(2) : c[k]])); }, [sel, props]);
  const T = ['fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform', 'color'];
  await go(p, '/404'); // reference page for the site's display heading
  const site = {
    h: await pick('main .display', T), em: await pick('main .display em', T), emRatio: await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main .display em')).fontSize) / parseFloat(getComputedStyle(document.querySelector('main .display')).fontSize)),
    mark: await pick('.site-header .wordmark', ['fontFamily', 'fontWeight', 'letterSpacing', 'fontSize']), btn: await pick('main a.btn', ['fontFamily', 'fontWeight', 'letterSpacing', 'fontSize']),
    body: await pick('body', ['fontFamily', 'fontSize']), light: await p.evaluate(() => { const c = getComputedStyle(document.documentElement); return [c.getPropertyValue('--text-on-light').trim(), c.getPropertyValue('--muted-on-light').trim()]; }),
  };
  await go(p, '/waitlist');
  const fonts = await p.evaluate(() => [...document.fonts].map((f) => f.family.replace(/"/g, '')).filter((v, i, a) => a.indexOf(v) === i));
  assert(!fonts.some((f) => /Manrope|Bodoni/i.test(f)), 'portal still declares its own fonts: ' + fonts.join(', '));
  const used = await p.evaluate(() => [...new Set([...document.querySelectorAll('.hp *')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim()))]);
  assert(used.every((f) => /Hanken Grotesk Variable|Instrument Serif/.test(f)), 'families in use: ' + used.join(' | '));
  const hex = (c) => '#' + c.match(/\d+/g).slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('');
  for (let n = 1; n <= 5; n++) {
    const l1 = await pick(`[data-ch="${n}"] .hp__l1`, T);
    const l2 = await pick(`[data-ch="${n}"] .hp__l2`, T);
    for (const k of ['fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform']) assert(l1[k] === site.h[k], `chapter ${n} line 1 ${k}: ${l1[k]} vs site ${site.h[k]}`);
    for (const k of ['fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform']) assert(l2[k] === site.em[k], `chapter ${n} line 2 ${k}: ${l2[k]} vs site ${site.em[k]}`);
    const ratio = await p.evaluate((n) => parseFloat(getComputedStyle(document.querySelector(`[data-ch="${n}"] .hp__l2`)).fontSize) / parseFloat(getComputedStyle(document.querySelector(`[data-ch="${n}"] .hp__l1`)).fontSize), n);
    assert(Math.abs(ratio - site.emRatio) < 0.01, `chapter ${n} italic/uppercase ratio ${ratio.toFixed(3)} vs site ${site.emRatio.toFixed(3)}`);
    if (n < 5) assert(hex(l1.color) === site.light[0], `chapter ${n} headline colour ${hex(l1.color)}`);
  }
  const mark = await pick('.hp__mark', ['fontFamily', 'fontWeight', 'letterSpacing', 'fontSize']);
  assert(JSON.stringify(mark) === JSON.stringify(site.mark), 'wordmark ' + JSON.stringify(mark) + ' vs ' + JSON.stringify(site.mark));
  const btn = await pick('.hp-btn', ['fontFamily', 'fontWeight', 'letterSpacing', 'fontSize']);
  assert(JSON.stringify(btn) === JSON.stringify(site.btn), 'button text ' + JSON.stringify(btn) + ' vs ' + JSON.stringify(site.btn));
  const body = await pick('.hp', ['fontFamily', 'fontSize']);
  assert(JSON.stringify(body) === JSON.stringify(site.body), 'body text ' + JSON.stringify(body));
  assert(hex((await pick('.hp1 .hp__lede', ['color'])).color) === site.light[1], 'supporting copy colour');
  await p.context().close();
});

await test('GLASS-01', 'Clear glass: navigation capsule and every button share one translucent material (no solid fills) on every route', async () => {
  const p = await ctx({ reducedMotion: 'reduce' });
  for (const r of ['/', '/women', '/men', '/explore-plans', '/about', '/faq', '/waitlist', '/404']) {
    await go(p, r);
    const bad = await p.evaluate(() => {
      const out = [];
      const alpha = (c) => { const m = c.match(/[\d.]+/g).map(Number); return m.length > 3 ? m[3] : 1; };
      for (const e of document.querySelectorAll('.btn, .site-header__shell, .menu-btn, .ih__arrow')) {
        const c = getComputedStyle(e);
        if (e.matches('[aria-busy="true"]')) continue;
        const bf = c.backdropFilter || c.webkitBackdropFilter || '';
        if (!e.matches('.menu-btn') && !/blur\(/.test(bf)) out.push(e.className + ': no backdrop blur');
        if (alpha(c.backgroundColor) > 0.62) out.push(e.className + ': fill too solid ' + c.backgroundColor);
        if (/rgb\(217, 166, 72\)|rgb\(232, 165, 35\)/.test(c.backgroundColor)) out.push(e.className + ': solid amber');
        if (parseFloat(c.borderTopWidth) < 1 || alpha(c.borderTopColor) < 0.15) out.push(e.className + ': edge missing');
        if (!/inset/.test(c.boxShadow)) out.push(e.className + ': no top light');
        if (parseFloat(c.borderRadius) < 20) out.push(e.className + ': radius ' + c.borderRadius);
      }
      return out;
    });
    assert(bad.length === 0, r + ' → ' + bad.slice(0, 4).join(' | '));
  }
  await p.context().close();
});

await test('GLASS-02', 'Clear glass: capsule text follows the ground (dark on light sections, light on dark), text contrast on buttons ≥ 4.5:1', async () => {
  const p = await ctx();
  await go(p, '/');
  const toneOver = async (sel, extra = 200) => {
    await p.evaluate(([sel, extra]) => { const n = document.querySelector(sel); scrollTo({ top: n.getBoundingClientRect().top + scrollY + extra, behavior: 'instant' }); }, [sel, extra]);
    await p.waitForTimeout(500);
    return p.evaluate(() => { const h = document.querySelector('[data-header]'); const c = getComputedStyle(h.querySelector('.wordmark')).color.match(/\d+/g).map(Number); return { tone: h.dataset.tone, sum: c[0] + c[1] + c[2] }; });
  };
  const light = await toneOver('#scene-01');
  assert(light.tone === 'light' && light.sum < 200, 'over a light section: ' + JSON.stringify(light));
  const dark = await toneOver('#scene-06');
  assert(dark.tone === 'dark' && dark.sum > 600, 'over a dark section: ' + JSON.stringify(dark));
  const back = await toneOver('#scene-04');
  assert(back.tone === 'light', 'did not switch back: ' + JSON.stringify(back));
  // button text against the ground it sits on (the glass adds at most a light veil over that ground)
  const lumOf = (c) => { const [r, g, b] = c.match(/[\d.]+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  for (const r of ['/', '/faq', '/about']) {
    await go(p, r);
    const pairs = await p.evaluate(() => [...document.querySelectorAll('main .btn')].map((e) => {
      let bg = 'rgb(11, 13, 15)';
      for (let n = e.parentElement; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/[\d.]+/g).map(Number); if (m.length < 4 || m[3] > 0.9) { bg = c; break; } }
      return [getComputedStyle(e).color, bg, e.textContent.trim()];
    }));
    for (const [fg, bg, name] of pairs) {
      const [a, b] = [lumOf(fg), lumOf(bg)];
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert(ratio >= 4.5, `${r} "${name}" contrast ${ratio.toFixed(2)}`);
    }
  }
  await p.context().close();
});

await test('GLASS-03', 'Clear glass: visible keyboard focus on buttons and capsule links; no-JS capsule stays legible', async () => {
  const p = await ctx();
  await go(p, '/faq');
  const f = await p.evaluate(() => { const b = document.querySelector('main a.btn'); b.focus(); const matches = b.matches(':focus-visible'); const c = getComputedStyle(b); return { w: c.outlineWidth, s: c.outlineStyle, matches }; });
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  const o = await p.evaluate(() => { const c = getComputedStyle(document.activeElement); return { w: parseFloat(c.outlineWidth), s: c.outlineStyle, tag: document.activeElement.tagName }; });
  assert(o.w >= 2 && o.s !== 'none', 'focus ring on ' + o.tag + ': ' + JSON.stringify(o) + JSON.stringify(f));
  await p.context().close();
  const q = await ctx({ javaScriptEnabled: false });
  await go(q, '/');
  const a = await q.evaluate(() => Number(getComputedStyle(document.querySelector('.site-header__shell')).backgroundColor.match(/[\d.]+/g)[3] ?? 1));
  assert(a >= 0.8, 'no-JS capsule too clear to guarantee legibility: ' + a);
  await q.context().close();
});

// ---------- V1.1: the company introduction, the 3D tube, the pathway, scroll restoration ----------
await test('V11-01', 'Opening H holds the HUMAN blood tube photograph, turned inside the letter; the other four letters keep their photographs', async () => {
  const p = await ctx();
  await go(p, '/');
  const d = await p.evaluate(() => [...document.querySelectorAll('[data-ih-letter] image')].map((i) => [i.closest('[data-ih-letter]').dataset.ihLetter, i.getAttribute('href').split('/').pop().split('.')[0], i.getAttribute('transform')]));
  assert(d[0][0] === 'h' && /^A01-blood-tube/.test(d[0][1]) && /^rotate\(/.test(d[0][2] || ''), 'H: ' + JSON.stringify(d[0]));
  assert(/u-female|A06/.test(d[1][1]) && /m-eye/.test(d[2][1]) && /a-couple/.test(d[3][1]) && /n-mature-man/.test(d[4][1]), 'other letters changed: ' + JSON.stringify(d));
  const ok = await p.evaluate(() => new Promise((res) => { const im = new Image(); im.onload = () => res(im.naturalWidth); im.onerror = () => res(0); im.src = document.querySelector('[data-ih-letter="h"] image').getAttribute('href'); }));
  assert(ok > 0, 'H image did not load');
  await p.context().close();
});

await test('V11-02', 'Company introduction: approved copy, headline far larger than before, full-viewport black chapter, the blood sample photograph sharp and undistorted, nothing overlaps at eight sizes', async () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [390, 844], [360, 640]]) {
    const p = await ctx({ viewport: { width: w, height: h } });
    await go(p, '/');
    await p.evaluate(() => { const n = document.querySelector('#what-is-human'); scrollTo({ top: n.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
    await p.waitForFunction(() => document.querySelector('.brief__photo').complete && document.querySelector('.brief__photo').naturalWidth > 0, null, { timeout: 20000 }).catch(() => {});
    const d = await p.evaluate(() => {
      const sec = document.querySelector('#what-is-human');
      const box = (q) => { const r = document.querySelector(q).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const text = sec.innerText.replace(/\s+/g, ' ');
      return {
        text, h: sec.offsetHeight, bg: getComputedStyle(sec).backgroundColor, fs: parseFloat(getComputedStyle(document.querySelector('#brief-title')).fontSize),
        copy: box('.brief__copy'), tube: box('[data-tube]'), path: box('[data-pathway]'),
        photo: (() => {
          const im = document.querySelector('.brief__photo'); const r = im.getBoundingClientRect();
          // the real pixel width of the file the browser chose, from its srcset descriptor
          const file = im.currentSrc.split('/').pop();
          const hit = im.srcset.split(',').map((x) => x.trim().split(/\s+/)).find(([u]) => u.split('/').pop() === file);
          return { nw: hit ? parseInt(hit[1], 10) : im.naturalWidth, ratio: r.width / r.height, w: r.width, dpr: devicePixelRatio, src: im.currentSrc };
        })(),
        canvas: !!document.querySelector('#what-is-human canvas'), over: document.documentElement.scrollWidth - innerWidth,
        clipped: [...sec.querySelectorAll('h2, p')].some((e) => e.scrollWidth > e.clientWidth + 1),
      };
    });
    for (const t of ['What HUMAN is', 'A preventive healthcare company.', 'Being built in India.', 'HUMAN is building a preventive health membership designed to help you better understand your health through relevant bloodwork, clear health insights and tracking over time.', 'first pilot is planned for Delhi NCR', 'See how it is designed to work']) assert(d.text.toLowerCase().includes(t.toLowerCase()), `${w}: missing "${t}"`);
    assert(d.bg === 'rgb(11, 13, 15)', `${w}: background ${d.bg}`);
    assert(d.h >= h - 1, `${w}: introduction ${d.h}px is shorter than the viewport`);
    // the old headline was 36px at most; on desktop it is now at least ~1.4× that, even on short laptop screens
    assert(d.fs >= (w >= 1024 ? 50 : 33), `${w}: headline only ${d.fs}px`);
    assert(!d.canvas, `${w}: the old 3D canvas is still on the page`);
    assert(/human-tube-premium/.test(d.photo.src) && d.photo.nw > 0, `${w}: photograph not loaded ${JSON.stringify(d.photo)}`);
    assert(Math.abs(d.photo.ratio - 1122 / 1402) < 0.01, `${w}: photograph distorted (ratio ${d.photo.ratio.toFixed(3)})`);
    assert(d.photo.nw >= Math.min(1122, d.photo.w * d.photo.dpr) - 2, `${w}: photograph served smaller than it is shown (${d.photo.nw}px for ${Math.round(d.photo.w)}px)`);
    assert(d.over <= 0 && !d.clipped, `${w}: overflow or clipped text`);
    const apart = (a, b) => a.r <= b.l + 1 || b.r <= a.l + 1 || a.b <= b.t + 1 || b.b <= a.t + 1;
    assert(apart(d.copy, d.tube) && apart(d.copy, d.path) && apart(d.tube, d.path), `${w}: copy, tube and pathway overlap ${JSON.stringify([d.copy, d.tube, d.path])}`);
    if (w >= 1280 && h >= 900) assert(d.path.b <= h + 1, `${w}x${h}: pathway below the fold`);
    assert(p.consoleErrors.length === 0, `${w}: console ${p.consoleErrors.join(' | ')}`);
    await p.context().close();
  }
});

await test('V11-03', 'Living Amber Pathway: six stages in order, one accessible list, drifts right-to-left at ~15–25 px/s, seamless loop distance, pulse runs, pause and keyboard focus stop it', async () => {
  const p = await ctx();
  await go(p, '/');
  await p.evaluate(() => { const n = document.querySelector('[data-pathway]'); scrollTo({ top: n.getBoundingClientRect().top + scrollY - 200, behavior: 'instant' }); });
  await p.waitForTimeout(800);
  const a11y = await p.evaluate(() => {
    const pw = document.querySelector('[data-pathway]');
    const visible = [...pw.querySelectorAll('ol')].filter((o) => !o.closest('[aria-hidden="true"]'));
    return { lists: visible.length, names: visible[0] ? [...visible[0].querySelectorAll('li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()) : [], echoFocusable: [...pw.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button')].length };
  });
  assert(a11y.lists === 1 && a11y.names.length === 6, 'accessible list: ' + JSON.stringify(a11y));
  ['TEST', 'UNDERSTAND', 'ACT', 'TRACK', 'RETEST', 'IMPROVE'].forEach((n, i) => assert(a11y.names[i].toUpperCase().includes(n) && a11y.names[i].includes(String(i + 1).padStart(2, '0')), `stage ${i + 1}: ${a11y.names[i]}`));
  const x = () => p.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.pathway__track')).transform).m41);
  // speed measured inside the page against its own clock (the test driver's timing is not reliable under load)
  const speed = await p.evaluate(() => new Promise((res) => {
    const read = () => [new DOMMatrix(getComputedStyle(document.querySelector('.pathway__track')).transform).m41, performance.now()];
    const [a, t] = read();
    setTimeout(() => { const [b, u] = read(); res(((a - b) / (u - t)) * 1000); }, 2000);
  }));
  assert(speed >= 12 && speed <= 28, 'drift speed ' + speed.toFixed(1) + ' px/s (must move right-to-left)');
  const loop = await p.evaluate(() => { const c = document.querySelectorAll('.pathway__copy'); return [c.length, c[0].getBoundingClientRect().width, c[1].getBoundingClientRect().width, c[1].getBoundingClientRect().left - c[0].getBoundingClientRect().left, innerWidth]; });
  assert(loop[0] === 2 && Math.abs(loop[1] - loop[2]) < 0.5 && Math.abs(loop[3] - loop[1]) < 0.5 && loop[1] >= loop[4] - 1, 'loop copies: ' + JSON.stringify(loop));
  await p.locator('.pathway__toggle').click();
  const y0 = await x(); await p.waitForTimeout(1200); const y1 = await x();
  assert(Math.abs(y1 - y0) < 0.5 && (await p.locator('.pathway__toggle').getAttribute('aria-pressed')) === 'true', 'pause button did not stop the drift');
  await p.locator('.pathway__toggle').click();
  const z0 = await x(); await p.waitForTimeout(1000); assert((await x()) < z0 - 5, 'play did not resume');
  assert(p.consoleErrors.length === 0, 'console: ' + p.consoleErrors.join(' | '));
  await p.context().close();
  const q = await ctx({ reducedMotion: 'reduce' });
  await go(q, '/');
  const t0 = await q.evaluate(() => getComputedStyle(document.querySelector('.pathway__track')).transform);
  await q.waitForTimeout(1200);
  assert(t0 === (await q.evaluate(() => getComputedStyle(document.querySelector('.pathway__track')).transform)), 'pathway moves under reduced motion');
  await q.context().close();
});

await test('V11-04', 'Scroll restoration: reload, a window resize and a phone rotation never push the reader forward (the old 2520px jump past the introduction)', async () => {
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const p = await ctx({ viewport: vp });
    await go(p, '/');
    for (const y of [1200, 2400]) {
      await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
      await p.waitForTimeout(300);
      await p.reload({ waitUntil: 'load', timeout: 90000 });
      await p.waitForTimeout(800);
      const after = await p.evaluate(() => scrollY);
      assert(Math.abs(after - y) < 40, `${vp.width}: reload at ${y} came back at ${after}`);
    }
    // rotating a phone mid-film and back returns to the same place (sizes are in viewport heights)
    if (vp.width < 900) {
      await p.evaluate(() => scrollTo({ top: document.querySelector('#what-is-human').getBoundingClientRect().top + scrollY, behavior: 'instant' }));
      await p.waitForTimeout(400);
      await p.setViewportSize({ width: vp.height, height: vp.width });
      await p.waitForTimeout(700);
      const land = await p.evaluate(() => document.querySelector('#what-is-human').getBoundingClientRect().top);
      assert(Math.abs(land) < vp.width * 0.25, 'after rotating, the introduction is ' + Math.round(land) + 'px away');
      await p.setViewportSize(vp);
      await p.waitForTimeout(700);
      const back = await p.evaluate(() => document.querySelector('#what-is-human').getBoundingClientRect().top);
      assert(Math.abs(back) < 10, 'after rotating back, the introduction is ' + Math.round(back) + 'px away');
    }
    await p.evaluate(() => scrollTo({ top: 6000, behavior: 'instant' }));
    await p.waitForTimeout(300);
    await p.setViewportSize({ width: vp.width - 1, height: vp.height });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => scrollY);
    assert(Math.abs(r - 6000) < 60, `${vp.width}: resize moved the page from 6000 to ${r}`);
    await p.context().close();
  }
});

await test('V11-05', 'Opening arrow: travels through the film without rushing, settles on the introduction with the headline in view, and then nothing scrolls on its own', async () => {
  const p = await ctx();
  await go(p, '/');
  // record the travel inside the page, every frame, against the page's own clock
  await p.evaluate(() => { window.__trace = []; const rec = (t) => { window.__trace.push([t, scrollY]); if (window.__trace.length < 2000) requestAnimationFrame(rec); }; requestAnimationFrame(rec); });
  await p.locator('[data-ih-go]').click();
  await p.waitForFunction(() => document.activeElement === document.querySelector('#what-is-human'), null, { timeout: 90000 });
  const trace = await p.evaluate(() => window.__trace);
  let peak = 0;
  for (let i = 0, j = 0; i < trace.length; i++) {
    while (trace[i][0] - trace[j][0] > 200) j++;
    const dt = trace[i][0] - trace[j][0];
    if (dt >= 100) peak = Math.max(peak, ((trace[i][1] - trace[j][1]) / dt) * 1000);
  }
  assert(peak < 2600, 'peak travel speed ' + Math.round(peak) + ' px/s');
  const d = await p.evaluate(() => { const s = document.querySelector('#what-is-human'); const t = document.querySelector('#brief-title').getBoundingClientRect(); return { top: s.getBoundingClientRect().top, tt: t.top, tb: t.bottom, op: getComputedStyle(document.querySelector('#brief-title .mask > span')).opacity }; });
  assert(Math.abs(d.top) < 3, 'did not settle on the introduction: ' + d.top);
  assert(d.tt >= 80 && d.tb <= 900 && Number(d.op) > 0.95, 'headline not in view on arrival ' + JSON.stringify(d));
  const y0 = await p.evaluate(() => scrollY); await p.waitForTimeout(1500);
  assert((await p.evaluate(() => scrollY)) === y0, 'page kept moving after arrival');
  assert((await p.evaluate(() => getComputedStyle(document.querySelector('#what-is-human')).outlineStyle)) === 'none', 'focus ring drawn round the whole introduction');
  const q = await ctx();
  await go(q, '/#what-is-human');
  await q.waitForTimeout(1200);
  const top = await q.evaluate(() => document.querySelector('#what-is-human').getBoundingClientRect().top);
  assert(Math.abs(top) < 3, 'a link to the introduction lands ' + Math.round(top) + 'px off');
  await q.context().close();
  await p.context().close();
});

await test('V11-06', 'Blood sample photograph: gentle float and slight parallax only, paused off screen, perfectly still under reduced motion; shows without JavaScript; no 3D code shipped', async () => {
  const p = await ctx();
  const js = [];
  p.on('response', (r) => /\.js(\?|$)/.test(r.url()) && js.push(r.url()));
  await go(p, '/');
  assert(!js.some((u) => /tube3d|three/i.test(u)), '3D code still loaded: ' + js.filter((u) => /tube3d|three/i.test(u)).join(', '));
  await p.evaluate(() => { const n = document.querySelector('#what-is-human'); scrollTo({ top: n.getBoundingClientRect().top + scrollY - 300, behavior: 'instant' }); });
  await p.waitForTimeout(500);
  const a = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.brief__photo')).animationName, par: getComputedStyle(document.querySelector('[data-tube]')).getPropertyValue('--parallax') }));
  await p.evaluate(() => scrollBy({ top: 300, behavior: 'instant' }));
  await p.waitForTimeout(400);
  const b = await p.evaluate(() => getComputedStyle(document.querySelector('[data-tube]')).getPropertyValue('--parallax'));
  assert(a.anim === 'brief-float', 'no float: ' + a.anim);
  const pa = parseFloat(a.par), pb = parseFloat(b);
  assert(Number.isFinite(pa) && Number.isFinite(pb) && pb !== pa && Math.abs(pb - pa) < 12, `parallax ${a.par} → ${b}`);
  // the float is a few pixels at most
  const amp = await p.evaluate(() => new Promise((res) => { const im = document.querySelector('.brief__photo'); const ys = []; const t0 = performance.now(); const tick = () => { ys.push(new DOMMatrix(getComputedStyle(im).transform).m42); performance.now() - t0 < 2500 ? requestAnimationFrame(tick) : res(Math.max(...ys) - Math.min(...ys)); }; tick(); }));
  assert(amp > 0.2 && amp <= 12, 'float amplitude ' + amp.toFixed(2) + 'px');
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(500);
  assert((await p.evaluate(() => getComputedStyle(document.querySelector('.brief__photo')).animationPlayState)) === 'paused', 'float keeps running off screen');
  await p.context().close();
  const q = await ctx({ reducedMotion: 'reduce' });
  await go(q, '/');
  await q.evaluate(() => { const n = document.querySelector('#what-is-human'); scrollTo({ top: n.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
  await q.waitForTimeout(400);
  const r = await q.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.brief__photo')).animationName, par: getComputedStyle(document.querySelector('[data-tube]')).getPropertyValue('--parallax').trim() }));
  assert(r.anim === 'none' && (r.par === '' || parseFloat(r.par) === 0), 'moves under reduced motion: ' + JSON.stringify(r));
  await q.context().close();
  const n = await ctx({ javaScriptEnabled: false });
  await go(n, '/');
  // the float is pure CSS, so without JavaScript it keeps moving: scroll by hand rather than wait for it to settle
  await n.evaluate(() => document.querySelector('.brief__photo').scrollIntoView({ block: 'center' }));
  await n.waitForTimeout(800);
  assert(await n.locator('.brief__photo').evaluate((i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().height > 200), 'no-JS photograph');
  assert((await n.locator('[data-pathway] ol').first().locator('li').count()) === 6 && (await n.locator('[data-pathway] li').first().isVisible()), 'no-JS pathway');
  await n.context().close();
});

await test('V11-07', 'Blood sample photograph blends into the section: the fade is zero all round the frame, the tube (cap to base) is fully opaque, and no colour step shows at the frame edges', async () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [768, 1024], [390, 844]]) {
    const p = await ctx({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await go(p, '/');
    // 1) render the mask itself: the same element with a plain white picture, on pure black, colour field off
    await p.evaluate(() => {
      const im = document.querySelector('.brief__photo'); im.scrollIntoView({ block: 'center' });
      const c = document.createElement('canvas'); c.width = 1122; c.height = 1402; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1122, 1402);
      im.removeAttribute('srcset'); im.src = c.toDataURL();
      const st = document.createElement('style'); st.textContent = '#what-is-human{background:#000!important}.brief__float::before,.brief__light,.brief__copy,[data-pathway]{visibility:hidden!important}'; document.head.append(st);
    });
    await p.waitForTimeout(400);
    const res = await p.evaluate(async () => {
      const r = document.querySelector('.brief__photo').getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const shot = await p.screenshot({ clip: { x: Math.max(0, res.x), y: Math.max(0, res.y), width: Math.min(w - Math.max(0, res.x), res.w), height: res.h } });
    const a = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; const at = (x, y) => d[(Math.round(y) * c.width + Math.round(x)) * 4];
      const W = c.width, H = c.height; let edge = 0;
      for (let x = 1; x < W - 1; x++) edge = Math.max(edge, at(x, 1), at(x, H - 2));
      for (let y = 1; y < H - 1; y++) edge = Math.max(edge, at(1, y), at(W - 2, y));
      // the tube's axis, measured on the photograph: centre (556, 689) of 1122 × 1402, 75.28°, ±600px along, ±60px across
      const k = W / 1122, ux = Math.cos((75.28 * Math.PI) / 180), uy = Math.sin((75.28 * Math.PI) / 180);
      let tube = 255;
      for (let t = -600; t <= 600; t += 50) for (const s of [-60, 0, 60]) {
        const px = (556 + t * ux - s * uy) * k, py = (689 + t * uy + s * ux) * k;
        if (px >= 0 && px < W && py >= 0 && py < H) tube = Math.min(tube, at(px, py));
      }
      return { edge, tube };
    }, shot.toString('base64'));
    assert(a.edge <= 6, `${w}: the photograph is still visible at its frame edge (mask ${a.edge}/255)`);
    assert(a.tube >= 250, `${w}: part of the tube is faded (mask ${a.tube}/255)`);
    await p.context().close();
    // 2) with the real picture: no colour step across the frame edges, away from the tube
    const q = await ctx({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await go(q, '/');
    // the copy is hidden for this pass: on phones the photograph's faded top margin runs under the status line,
    // and its text would read as a step that the picture did not make
    await q.evaluate(() => {
      document.querySelector('.brief__photo').scrollIntoView({ block: 'center' });
      const st = document.createElement('style'); st.textContent = '.brief__copy,[data-pathway]{visibility:hidden!important}'; document.head.append(st);
    });
    await q.waitForFunction(() => { const i = document.querySelector('.brief__photo'); return i.complete && i.naturalWidth > 0; });
    await q.waitForTimeout(400);
    const r = await q.evaluate(() => { const r = document.querySelector('.brief__photo').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const full = await q.screenshot();
    const step = await q.evaluate(async ([b64, r]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; const px = (x, y) => { const i = (Math.round(y) * c.width + Math.round(x)) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const diff = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
      const ok = (x, y) => x > 0 && y > 0 && x < c.width - 1 && y < c.height - 1 && (x < r.x + r.w * 0.2 || x > r.x + r.w * 0.75 || y < r.y + r.h * 0.03 || y > r.y + r.h * 0.95);
      let m = 0;
      for (let y = r.y + 4; y < r.y + r.h - 4; y += 3) for (const xe of [r.x, r.x + r.w]) if (ok(xe - 3, y) && ok(xe + 3, y)) { const a = px(xe - 3, y), b = px(xe + 3, y); if (a[0] + a[1] + a[2] < 90) m = Math.max(m, diff(a, b)); }
      for (let x = r.x + 4; x < r.x + r.w - 4; x += 3) for (const ye of [r.y, r.y + r.h]) if (ok(x, ye - 3) && ok(x, ye + 3)) { const a = px(x, ye - 3), b = px(x, ye + 3); if (a[0] + a[1] + a[2] < 90) m = Math.max(m, diff(a, b)); }
      return m;
    }, [full.toString('base64'), r]);
    assert(step <= 4, `${w}: a colour step of ${step}/255 shows across the photograph's edge`);
    await q.context().close();
  }
});

// ---------- Explore Plans (/explore-plans) ----------
const XP = '/explore-plans';
const XP_PLANS = {
  him: ['for Him.', ['Overall Health', 'Energy & Hormones', 'Weight & Blood Sugar', 'Sexual & Fertility Health', 'Healthy Ageing']],
  her: ['for Her.', ['Overall Health', 'Periods & Hormones', 'Energy & Nutrition', 'Weight & Blood Sugar', 'Menopause & Healthy Ageing']],
  athletes: ['for Athletes.', ['HYROX & Hybrid Athletes', 'Runners & Endurance Athletes', 'Strength & Physique Athletes', 'Cyclists & Triathletes', 'Competitive & Team Sports', 'Everyday Fitness']],
  seniors: ['for Seniors.', ['Active Ageing', 'Comprehensive Senior Health', 'Strength & Independence', 'Assisted Health Monitoring']],
  families: ['for Families.', ['Family Essential', 'Extended Family', 'Parents’ Health', 'Build Your Family Plan']],
  professionals: ['for Professionals.', ['Workplace Health', 'Executive Health', 'Shift Worker Health', 'Frequent Traveller Health', 'Corporate Membership']],
  'young-adults': ['for Young Adults.', ['Student Health', 'Early Career Health', 'Active Lifestyle', 'First Health Check']],
  kids: ['for Kids.', ['Early Childhood', 'School-Age Health', 'Adolescent Health', 'Young Sportspeople']],
  couples: ['for Couples.', ['Everyday Couples', 'Active Couples', 'Preparing for Parenthood', 'Healthy Ageing Together']],
};
const XP_IDS = Object.keys(XP_PLANS);
const xoState = (p) => p.locator('[data-plans-overlay]').getAttribute('data-state');
const xoWait = (p, s, ms = 8000) => p.waitForFunction((s) => document.querySelector('[data-plans-overlay]').dataset.state === s, s, { timeout: ms });
const xpReady = async (p) => { await p.waitForFunction(() => document.querySelector('[data-rail]').classList.contains('is-in') || !document.documentElement.classList.contains('js-motion')); await p.waitForTimeout(1300); };
const xoOpen = async (p, id) => { await p.locator(`[data-plan-open="${id}"]`).click(); await xoWait(p, 'open'); };
const xoClose = async (p) => { await p.locator('[data-xo-close]').click(); await xoWait(p, 'closed'); };
const rail = (p) => p.evaluate(() => { const s = document.querySelector('[data-rail-scroller]'); return { left: s.scrollLeft, max: s.scrollWidth - s.clientWidth, client: s.clientWidth, width: s.scrollWidth, y: scrollY }; });
const railSettle = async (p) => { let last = -1; for (let i = 0; i < 40; i++) { const l = (await rail(p)).left; if (Math.abs(l - last) < 0.5) return l; last = l; await p.waitForTimeout(120); } return last; };

await test('XP-01', 'Explore Plans in the navigation: exact label, desktop and mobile menu, opens /explore-plans, active state, other items untouched, capsule still fits', async () => {
  const p = await ctx();
  await go(p, '/about');
  const labels = await p.locator('.site-header .nav a:not(.btn)').allInnerTexts();
  assert(labels.join('|') === 'How it works|Explore Plans|For Her|For Him|About|FAQ', 'desktop nav: ' + labels.join('|'));
  assert((await p.locator('.site-header .nav [aria-haspopup], .site-header .nav ul').count()) === 0, 'no dropdown');
  await p.locator('.site-header .nav a', { hasText: 'Explore Plans' }).click();
  await p.waitForURL('**/explore-plans**');
  await p.waitForLoadState('networkidle');
  const cur = await p.locator('.site-header .nav a[aria-current="page"]').allInnerTexts();
  assert(cur.join() === 'Explore Plans', 'active item: ' + cur.join());
  for (const w of [1024, 1100, 1280, 1920]) {
    await p.setViewportSize({ width: w, height: 800 });
    await p.waitForTimeout(120);
    const fit = await p.evaluate(() => {
      const shell = document.querySelector('.site-header__shell').getBoundingClientRect();
      const kids = [...document.querySelectorAll('.site-header__shell > *')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.getBoundingClientRect());
      const overlap = kids.some((a, i) => kids.some((b, j) => j > i && a.right > b.left + 1 && b.right > a.left + 1));
      const links = [...document.querySelectorAll('.site-header .nav a')].map((e) => e.getBoundingClientRect().height);
      return { inside: kids.every((k) => k.left >= shell.left - 1 && k.right <= shell.right + 1), overlap, oneLine: links.every((h) => h < 60) };
    });
    assert(fit.inside && !fit.overlap && fit.oneLine, `capsule at ${w}: ${JSON.stringify(fit)}`);
  }
  await p.context().close();
  const m = await ctx({ viewport: { width: 390, height: 844 } });
  await go(m, '/faq');
  await m.locator('[data-menu-open]').click();
  const ml = await m.locator('#mobile-menu nav a:not(.btn)').allInnerTexts();
  assert(ml.join('|') === 'How it works|Explore Plans|For Her|For Him|About|FAQ', 'mobile menu: ' + ml.join('|'));
  await m.locator('#mobile-menu nav a', { hasText: 'Explore Plans' }).click();
  await m.waitForURL('**/explore-plans**');
  await m.waitForLoadState('networkidle');
  await m.locator('[data-menu-open]').click();
  assert((await m.locator('#mobile-menu nav a[aria-current="page"]').innerText()) === 'Explore Plans', 'mobile active state');
  assert(m.consoleErrors.length === 0, m.consoleErrors.join(' | '));
  await m.context().close();
});

await test('XP-02', 'Explore Plans page: exactly two sections, approved copy word for word, the site’s own typography, no hero, one waitlist action', async () => {
  const p = await ctx();
  const failed = [];
  p.on('response', (r) => r.status() >= 400 && failed.push(r.url()));
  await go(p, XP);
  await xpReady(p);
  const d = await p.evaluate(() => {
    const cs = (s) => getComputedStyle(document.querySelector(s));
    const t = (s) => document.querySelector(s).textContent.replace(/\s+/g, ' ').trim();
    return {
      sections: document.querySelectorAll('main > section').length,
      hero: document.querySelectorAll('main .page-hero').length,
      eyebrow: t('.xp__eyebrow'), h1: t('h1'), lede: t('.xp__lede'),
      ctaEyebrow: t('.xpc__eyebrow'), ctaH: t('.xpc__title'), ctaP: t('.xpc__lede'), ctaBtn: t('.xpc .btn').replace(/\s*→$/, ''), // the arrow glyph is drawn as an icon
     
      h1Font: cs('h1').fontFamily + '|' + cs('h1').fontStyle, ctaFont: cs('.xpc__title').fontFamily + '|' + cs('.xpc__title').fontStyle,
      ledeFont: cs('.xp__lede').fontFamily, eyebrowCase: cs('.xp__eyebrow').textTransform + '|' + parseFloat(cs('.xp__eyebrow').letterSpacing),
      introTop: document.querySelector('.xp__track').getBoundingClientRect().top,
      links: [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')),
      forms: document.querySelectorAll('main form, main input, main select').length,
      ground: getComputedStyle(document.querySelector('.xp')).backgroundColor,
    };
  });
  assert(d.sections === 2 && d.hero === 0, `sections ${d.sections}, hero ${d.hero}`);
  assert(d.eyebrow === 'HUMAN' && d.h1 === 'Our preventive health plans.', `heading: ${d.eyebrow} / ${d.h1}`);
  assert(d.lede === 'Explore the different health plans we are developing for individuals, families and different stages of life.', 'lede: ' + d.lede);
  assert(d.ctaH === 'Take the first step towards understanding your health.' && d.ctaP === 'Be among the first to experience HUMAN.' && d.ctaBtn === 'Join the waitlist', `cta: ${d.ctaH} / ${d.ctaP} / ${d.ctaBtn}`);
  assert(/Instrument Serif/.test(d.h1Font) && /italic/.test(d.h1Font) && /Instrument Serif/.test(d.ctaFont) && /italic/.test(d.ctaFont), 'serif italic headings: ' + d.h1Font);
  assert(/Hanken Grotesk/.test(d.ledeFont) && /^uppercase\|/.test(d.eyebrowCase) && Number(d.eyebrowCase.split('|')[1]) > 2, 'body and label type');
  assert(d.introTop < 520, `photographs start at ${d.introTop}px: too far down`);
  assert(d.links.join() === '/waitlist' && d.forms === 0, 'only action is the waitlist: ' + d.links.join());
  assert(d.ground === 'rgb(246, 243, 236)', 'ground ' + d.ground);
  await p.locator('.xpc .btn').click();
  await p.waitForURL('**/waitlist**');
  assert((await p.locator('[data-hp]').count()) === 1, 'existing waitlist opened');
  assert(failed.length === 0 && p.consoleErrors.length === 0, [...failed, ...p.consoleErrors].join(' | '));
  await p.context().close();
});

await test('XP-03', 'Nine cards in the approved order, each with its own supplied photograph (loaded, 3:4, undistorted), code-set titles that clear the arrow', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  await p.evaluate(() => document.querySelectorAll('.xp-card img').forEach((i) => (i.loading = 'eager')));
  await p.waitForFunction(() => [...document.querySelectorAll('.xp-card img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 });
  const cards = await p.evaluate(() =>
    [...document.querySelectorAll('.xp-card')].map((c) => {
      const b = c.querySelector('button'), img = c.querySelector('img'), r = b.getBoundingClientRect();
      const cap = c.querySelector('.xp-card__cap').getBoundingClientRect(), go = c.querySelector('.xp-card__go').getBoundingClientRect(), ti = c.querySelector('.xp-card__title');
      const tr = ti.getBoundingClientRect(), tcs = getComputedStyle(ti);
      const range = document.createRange(); range.selectNodeContents(ti); const ink = range.getBoundingClientRect();
      return {
        id: b.dataset.planOpen, brand: c.querySelector('.xp-card__brand').textContent, title: ti.textContent, src: img.currentSrc, w: r.width, h: r.height,
        fit: getComputedStyle(img).objectFit, nat: img.naturalWidth / img.naturalHeight, font: tcs.fontFamily + '|' + tcs.fontStyle, size: parseFloat(tcs.fontSize),
        clear: ink.right <= go.left - 4 && cap.left >= r.left && ink.bottom <= r.bottom && ink.left >= r.left, lines: Math.round(tr.height / parseFloat(tcs.lineHeight)),
        nested: b.querySelectorAll('a, button, [tabindex]').length, name: b.innerText.replace(/\s+/g, ' ').trim(), badge: c.querySelectorAll('.status-pill, [class*=badge]').length,
      };
    }),
  );
  assert(cards.length === 9 && cards.map((c) => c.id).join() === XP_IDS.join(), 'order: ' + cards.map((c) => c.id).join());
  for (const c of cards) {
    assert(c.brand === 'HUMAN' && c.title === XP_PLANS[c.id][0], `${c.id}: title "${c.title}"`);
    assert(new RegExp(`human-for-${c.id}\\.`).test(c.src), `${c.id}: photograph ${c.src}`);
    assert(Math.abs(c.w / c.h - 0.75) < 0.01 && Math.abs(c.w - cards[0].w) < 0.6, `${c.id}: card ${c.w}x${c.h}`);
    assert(c.fit === 'cover' && Math.abs(c.nat - 0.75) < 0.01, `${c.id}: image fit ${c.fit} ${c.nat}`);
    assert(/Instrument Serif/.test(c.font) && /italic/.test(c.font) && c.size >= 26, `${c.id}: title type ${c.font} ${c.size}`);
    assert(c.clear && c.lines <= 2, `${c.id}: title overflows or meets the arrow (${c.lines} lines)`);
    assert(c.nested === 0 && c.badge === 0, `${c.id}: nested controls or badges`);
  }
  await p.context().close();
});

await test('XP-04', 'Explorer layout: about four cards on desktop, two to three on tablet, one large card and a slice of the next on phones; one row; no page overflow', async () => {
  const p = await ctx();
  for (const [w, h, lo, hi] of [[1920, 1080, 4, 4], [1440, 900, 4, 4], [1280, 720, 4, 4], [1024, 768, 2, 3], [768, 1024, 2, 3], [430, 932, 1, 1], [390, 844, 1, 1], [360, 740, 1, 1]]) {
    await p.setViewportSize({ width: w, height: h });
    await go(p, XP);
    await xpReady(p);
    const d = await p.evaluate(() => {
      const rs = [...document.querySelectorAll('.xp-card')].map((c) => c.getBoundingClientRect());
      const full = rs.filter((r) => r.left >= -0.5 && r.right <= innerWidth + 0.5).length;
      const nxt = rs[full];
      const first = rs[0], wrap = document.querySelector('.xp__intro .xp__title').getBoundingClientRect();
      return { full, peek: nxt ? Math.max(0, innerWidth - nxt.left) : 0, cardW: first.width, rows: new Set(rs.map((r) => Math.round(r.top))).size, over: document.documentElement.scrollWidth - innerWidth, align: Math.abs(first.left - wrap.left), order: rs.every((r, i) => !i || r.left > rs[i - 1].left) };
    });
    assert(d.full >= lo && d.full <= hi, `${w}: ${d.full} whole cards`);
    assert(d.peek >= 24 && d.peek < d.cardW * 0.6, `${w}: next card shows ${Math.round(d.peek)}px of ${Math.round(d.cardW)}`);
    assert(d.rows === 1 && d.order && d.over <= 0 && d.align < 1.5, `${w}: ${JSON.stringify(d)}`);
    if (w <= 430) assert(d.cardW >= w * 0.68, `${w}: phone card only ${Math.round(d.cardW)}px wide`);
    if (w >= 1280) assert(d.cardW >= 250, `${w}: desktop card only ${Math.round(d.cardW)}px wide`);
  }
  await p.context().close();
});

await test('XP-05', 'Explorer controls: arrows land on card edges and disable at the ends, the progress line mirrors the real scroll position, keyboard works, nothing autoplays, the wheel still scrolls the page', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  const state = () => p.evaluate(() => {
    const s = document.querySelector('[data-rail-scroller]'), th = document.querySelector('[data-rail-thumb]').getBoundingClientRect(), tr = document.querySelector('.xp__progress').getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(s).scrollPaddingLeft), max = s.scrollWidth - s.clientWidth;
    const stops = [...document.querySelectorAll('.xp-card')].map((c) => Math.min(max, c.offsetLeft - pad));
    const last = document.querySelector('.xp-card:last-child').getBoundingClientRect();
    return { left: s.scrollLeft, max, onStop: Math.min(...stops.map((v) => Math.abs(v - s.scrollLeft))), thumbW: th.width / tr.width, thumbX: (th.left - tr.left) / tr.width, vis: s.clientWidth / s.scrollWidth,
      prev: document.querySelector('[data-rail-prev]').getAttribute('aria-disabled'), next: document.querySelector('[data-rail-next]').getAttribute('aria-disabled'), lastIn: last.right <= innerWidth - pad + 1 && last.left >= 0 };
  });
  let s = await state();
  assert(s.left === 0 && s.prev === 'true' && s.next === 'false', 'start: ' + JSON.stringify(s));
  assert(Math.abs(s.thumbW - s.vis) < 0.01 && Math.abs(s.thumbX) < 0.005, `progress at start ${s.thumbW} vs ${s.vis}`);
  await p.waitForTimeout(2600);
  assert((await rail(p)).left === 0, 'the row moved on its own');
  const seen = [];
  for (let i = 0; i < 6 && s.next === 'false'; i++) {
    await p.locator('[data-rail-next]').click();
    await railSettle(p);
    s = await state();
    seen.push(Math.round(s.left));
    assert(s.onStop < 1.5, `next landed off a card edge by ${s.onStop}px`);
    assert(Math.abs(s.thumbX - (s.left / s.max) * (1 - s.vis)) < 0.01 && Math.abs(s.thumbW - s.vis) < 0.01, 'progress line out of step with the scroll position');
  }
  assert(s.next === 'true' && s.prev === 'false' && Math.abs(s.left - s.max) < 1.5 && s.lastIn, 'end: ' + JSON.stringify(s) + ' via ' + seen.join());
  assert(Math.abs(s.thumbX + s.thumbW - 1) < 0.01, 'progress line does not reach the end');
  await p.locator('[data-rail-next]').click({ force: true });
  await p.waitForTimeout(300);
  assert(Math.abs((await rail(p)).left - s.max) < 1.5, 'disabled next still moved');
  for (let i = 0; i < 6 && s.prev === 'false'; i++) {
    await p.locator('[data-rail-prev]').click();
    await railSettle(p);
    s = await state();
    assert(s.onStop < 1.5, `prev landed off a card edge by ${s.onStop}px`);
  }
  assert(s.left === 0 && s.prev === 'true', 'back at the start');
  // keyboard
  await p.locator('[data-plan-open="him"]').focus();
  await p.keyboard.press('ArrowRight');
  assert((await p.evaluate(() => document.activeElement.dataset.planOpen)) === 'her', 'ArrowRight');
  await p.keyboard.press('End');
  await railSettle(p);
  s = await state();
  assert((await p.evaluate(() => document.activeElement.dataset.planOpen)) === 'couples' && s.lastIn, 'End reaches the last card');
  await p.keyboard.press('Home');
  await railSettle(p);
  assert((await rail(p)).left === 0, 'Home returns');
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + parseFloat(getComputedStyle(document.activeElement).outlineWidth));
  assert(/solid[2-9]/.test(ring), 'focus ring on a card: ' + ring);
  // the wheel over the row scrolls the page, never the row
  await p.mouse.move(700, 560);
  await p.mouse.wheel(0, 500);
  await p.waitForTimeout(700);
  const after = await rail(p);
  assert(after.y > 200 && after.left === 0, `wheel: page ${after.y}, row ${after.left}`);
  // resize keeps the line true
  await p.setViewportSize({ width: 820, height: 900 });
  await p.waitForTimeout(400);
  s = await state();
  assert(Math.abs(s.thumbW - s.vis) < 0.01, 'progress line after resize');
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('XP-06', 'Mouse dragging: the row follows the hand and rests on a card edge; a drag never opens a card; a plain click still does; touch keeps native scrolling', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  const box = await p.locator('[data-plan-open="athletes"]').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await p.mouse.move(x, y);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) { await p.mouse.move(x - i * 30, y); await p.waitForTimeout(16); }
  const mid = await rail(p);
  assert(mid.left > 300, `row did not follow the drag (${mid.left})`);
  await p.mouse.up();
  await p.waitForTimeout(900);
  await railSettle(p);
  assert((await xoState(p)) === 'closed', 'a drag opened a card');
  const onStop = await p.evaluate(() => { const s = document.querySelector('[data-rail-scroller]'); const pad = parseFloat(getComputedStyle(s).scrollPaddingLeft), max = s.scrollWidth - s.clientWidth; return Math.min(...[...document.querySelectorAll('.xp-card')].map((c) => Math.abs(Math.min(max, c.offsetLeft - pad) - s.scrollLeft))); });
  assert(onStop < 1.5, `after a drag the row rests ${onStop}px off a card edge`);
  assert(!(await p.evaluate(() => document.querySelector('[data-rail]').classList.contains('is-dragging'))), 'drag state left on');
  // 3px of wobble is still a click
  const b2 = await p.locator('[data-plan-open="families"]').boundingBox();
  await p.mouse.move(b2.x + 60, b2.y + 80);
  await p.mouse.down();
  await p.mouse.move(b2.x + 63, b2.y + 81);
  await p.mouse.up();
  await xoWait(p, 'open');
  assert((await p.locator('.xo__panel:not([hidden]) .xo__title').innerText()).replace(/\s+/g, ' ').trim() === 'HUMAN for Families.', 'click opened the wrong category');
  await xoClose(p);
  const touch = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('[data-rail-scroller]')); return c.overflowX + '|' + c.touchAction + '|' + c.scrollSnapType; });
  assert(/^auto\|auto\|x( proximity)?$/.test(touch), 'native scrolling: ' + touch);
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('XP-07', 'Every card opens its own overlay: the same photograph, the right title, all 41 plan names in order as static text, the development note; nothing else', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  let total = 0;
  for (const id of XP_IDS) {
    const cardSrc = await p.locator(`[data-plan-open="${id}"] img`).evaluate((i) => i.currentSrc);
    await p.locator(`[data-plan-open="${id}"]`).scrollIntoViewIfNeeded();
    await railSettle(p);
    await p.locator(`[data-plan-open="${id}"]`).click();
    // at the moment of opening the overlay shows the very file the card was showing
    const firstSrc = await p.locator('[data-xo-img]').evaluate((i) => i.src);
    await xoWait(p, 'open');
    const d = await p.evaluate(() => {
      const dlg = document.querySelector('[data-plans-overlay]'), panel = dlg.querySelector('.xo__panel:not([hidden])');
      const t = (e) => e.textContent.replace(/\s+/g, ' ').trim();
      return {
        open: dlg.open, panels: dlg.querySelectorAll('.xo__panel:not([hidden])').length, name: t(document.getElementById(dlg.getAttribute('aria-labelledby'))),
        brand: t(panel.querySelector('.xo__brand')), label: t(panel.querySelector('.xo__label')), status: t(panel.querySelector('.xo__status')),
        plans: [...panel.querySelectorAll('.xo__list li .xo__plan')].map(t), nums: [...panel.querySelectorAll('.xo__list li .xo__n')].map(t),
        listTag: panel.querySelector('.xo__list').tagName, interactive: [...dlg.querySelectorAll('a, button, input, [role=button], summary, [onclick]')].map((e) => e.getAttribute('aria-label') || t(e)),
        cursor: [...panel.querySelectorAll('.xo__list li')].map((li) => getComputedStyle(li).cursor).join(), img: dlg.querySelector('[data-xo-img]').currentSrc, alt: dlg.querySelector('[data-xo-img]').alt,
        imgOk: dlg.querySelector('[data-xo-img]').naturalWidth > 0, font: getComputedStyle(panel.querySelector('.xo__title')).fontFamily + getComputedStyle(panel.querySelector('.xo__title')).fontStyle, planFont: getComputedStyle(panel.querySelector('.xo__plan')).fontFamily,
        capGone: getComputedStyle(dlg.querySelector('[data-xo-cap]')).opacity, extra: panel.querySelectorAll('svg, img, details').length,
      };
    });
    const [title, plans] = XP_PLANS[id];
    assert(d.open && d.panels === 1 && d.name === `HUMAN ${title}`, `${id}: dialog name "${d.name}"`);
    assert(d.brand === 'HUMAN' && d.label === 'Memberships' && d.status === 'Memberships currently in development.', `${id}: labels ${d.brand}/${d.label}/${d.status}`);
    assert(d.plans.join('|') === plans.join('|'), `${id}: plans ${d.plans.join('|')}`);
    assert(d.nums.join() === plans.map((_, i) => String(i + 1).padStart(2, '0')).join() && d.listTag === 'OL', `${id}: numbering ${d.nums.join()}`);
    assert(d.interactive.join() === 'Close' && !/pointer/.test(d.cursor) && d.extra === 0, `${id}: controls in the overlay: ${d.interactive.join()}`);
    assert(firstSrc === cardSrc && new RegExp(`human-for-${id}\\.`).test(d.img) && d.imgOk && d.alt.length > 20 && d.capGone === '0', `${id}: photograph ${firstSrc} vs ${cardSrc}`);
    assert(/Instrument Serif.*italic/.test(d.font) && /Hanken Grotesk/.test(d.planFont), `${id}: type`);
    total += d.plans.length;
    await xoClose(p);
  }
  assert(total === 41, `plan names shown: ${total}`);
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('XP-08', 'Overlay behaviour: focus moves in and is held, Escape / close / backdrop all close it, a click inside does not, focus and both scroll positions return exactly, the page cannot scroll behind it', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  // far end of the row, page nudged down: the hardest position to preserve
  await p.evaluate(() => { document.querySelector('[data-rail-scroller]').scrollTo({ left: 99999, behavior: 'instant' }); scrollTo({ top: 140, behavior: 'instant' }); });
  await railSettle(p);
  const before = await rail(p);
  const cardBefore = await p.locator('[data-plan-open="couples"]').boundingBox();
  for (const how of ['escape', 'button', 'backdrop']) {
    await p.locator('[data-plan-open="couples"]').focus();
    await p.keyboard.press('Enter');
    await xoWait(p, 'open');
    const o = await p.evaluate(() => ({ focus: document.activeElement.getAttribute('aria-label'), lock: getComputedStyle(document.documentElement).overflowY, src: document.querySelector('.xp-card.is-source button')?.dataset.planOpen, modal: document.querySelector('[data-plans-overlay]').matches(':modal') }));
    assert(o.focus === 'Close' && o.lock === 'hidden' && o.src === 'couples' && o.modal, `${how}: open state ${JSON.stringify(o)}`);
    await p.keyboard.press('Tab');
    await p.keyboard.press('Tab');
    assert(await p.evaluate(() => !!document.activeElement.closest('[data-plans-overlay]')), `${how}: focus left the dialog`);
    await p.mouse.wheel(0, 600);
    await p.waitForTimeout(250);
    assert(Math.abs((await rail(p)).y - before.y) < 1, `${how}: page scrolled behind the overlay`);
    const shell = await p.locator('[data-xo-shell]').boundingBox();
    await p.mouse.click(shell.x + shell.width * 0.7, shell.y + shell.height * 0.5);
    await p.waitForTimeout(200);
    assert((await xoState(p)) === 'open', `${how}: a click inside closed it`);
    if (how === 'escape') await p.keyboard.press('Escape');
    else if (how === 'button') await p.locator('[data-xo-close]').click();
    else await p.mouse.click(8, 450);
    await xoWait(p, 'closed');
    const a = await rail(p);
    const c = await p.evaluate(() => ({ focus: document.activeElement.dataset.planOpen, lock: document.documentElement.style.overflow + document.documentElement.style.paddingRight, src: document.querySelectorAll('.is-source').length, open: document.querySelector('[data-plans-overlay]').open, vis: getComputedStyle(document.querySelector('[data-plan-open="couples"]')).visibility }));
    assert(Math.abs(a.left - before.left) < 1 && Math.abs(a.y - before.y) < 1, `${how}: position moved (row ${before.left}→${a.left}, page ${before.y}→${a.y})`);
    assert(c.focus === 'couples' && c.lock === '' && c.src === 0 && !c.open && c.vis === 'visible', `${how}: after close ${JSON.stringify(c)}`);
    const cardAfter = await p.locator('[data-plan-open="couples"]').boundingBox();
    assert(Math.abs(cardAfter.x - cardBefore.x) < 1 && Math.abs(cardAfter.y - cardBefore.y) < 1, `${how}: the card moved`);
  }
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('XP-09', 'Signature expansion: the panel starts exactly on the card and lands centred with the photograph beside the list; returns to the card; rapid and interrupted presses leave one clean state', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  for (const id of ['him', 'seniors']) {
    const start = await p.evaluate((id) => {
      const btn = document.querySelector(`[data-plan-open="${id}"]`), card = btn.getBoundingClientRect();
      btn.click();
      const sh = document.querySelector('[data-xo-shell]'), r = sh.getBoundingClientRect(), ph = document.querySelector('[data-xo-photo]').getBoundingClientRect();
      const an = sh.getAnimations()[0];
      return { d: Math.max(Math.abs(r.left - card.left), Math.abs(r.top - card.top), Math.abs(r.width - card.width), Math.abs(r.height - card.height)), photo: Math.max(Math.abs(ph.width - card.width), Math.abs(ph.height - card.height), Math.abs(ph.left - card.left)), ms: an?.effect.getTiming().duration, flights: document.querySelector('[data-plans-overlay]').getAnimations({ subtree: true }).length, cap: getComputedStyle(document.querySelector('[data-xo-cap]')).opacity, capTitle: document.querySelector('[data-xo-cap-title]').textContent };
    }, id);
    assert(start.d < 1 && start.photo < 1, `${id}: expansion does not start on the card (${start.d}px, photo ${start.photo}px)`);
    assert(start.ms >= 400 && start.ms <= 600 && start.flights >= 4 && Number(start.cap) > 0.9 && start.capTitle === XP_PLANS[id][0], `${id}: flight ${JSON.stringify(start)}`);
    await xoWait(p, 'open');
    await p.waitForTimeout(900);
    const rest = await p.evaluate(() => {
      const r = document.querySelector('[data-xo-shell]').getBoundingClientRect(), ph = document.querySelector('[data-xo-photo]').getBoundingClientRect(), img = document.querySelector('[data-xo-img]');
      const rows = [...document.querySelectorAll('.xo__panel:not([hidden]) .xo__list li')].map((li) => Number(getComputedStyle(li).opacity));
      return { cx: Math.abs(r.left + r.width / 2 - innerWidth / 2), cy: Math.abs(r.top + r.height / 2 - innerHeight / 2), w: r.width / innerWidth, h: r.height / innerHeight, split: ph.width / r.width, photoH: ph.height / r.height, ratio: ph.width / ph.height, fit: getComputedStyle(img).objectFit, rows: Math.min(...rows), flying: document.querySelector('[data-xo-shell]').className, radius: parseFloat(getComputedStyle(document.querySelector('[data-xo-shell]')).borderTopLeftRadius), scrim: getComputedStyle(document.querySelector('[data-xo-scrim]')).backdropFilter };
    });
    assert(rest.cx < 1.5 && rest.cy < 1.5 && rest.w > 0.78 && rest.w <= 0.9 && rest.h <= 0.9, `${id}: resting panel ${JSON.stringify(rest)}`);
    assert(Math.abs(rest.split - 0.4) < 0.02 && rest.photoH > 0.99 && Math.abs(rest.ratio - 0.75) < 0.06 && rest.fit === 'cover', `${id}: photograph side ${JSON.stringify(rest)}`);
    assert(rest.rows === 1 && !/is-flying/.test(rest.flying) && rest.radius >= 28 && /blur/.test(rest.scrim), `${id}: settled state ${JSON.stringify(rest)}`);
    // return: ends on the card
    const end = await p.evaluate(async () => {
      document.querySelector('[data-xo-close]').click();
      const sh = document.querySelector('[data-xo-shell]');
      const an = sh.getAnimations()[0];
      const kf = an.effect.getKeyframes().at(-1);
      const card = document.querySelector('.xp-card.is-source button').getBoundingClientRect();
      return { d: Math.max(Math.abs(parseFloat(kf.left) - card.left), Math.abs(parseFloat(kf.top) - card.top), Math.abs(parseFloat(kf.width) - card.width), Math.abs(parseFloat(kf.height) - card.height)), ms: an.effect.getTiming().duration };
    });
    assert(end.d < 1 && end.ms >= 350 && end.ms <= 550, `${id}: return does not end on the card (${JSON.stringify(end)})`);
    await xoWait(p, 'closed');
  }
  // rapid presses: one overlay, never two
  await p.evaluate(() => { const b = document.querySelector('[data-plan-open="her"]'); b.click(); b.click(); document.querySelector('[data-plan-open="him"]').click(); });
  await xoWait(p, 'open');
  assert((await p.locator('.xo__panel:not([hidden])').count()) === 1 && (await p.locator('.xo__panel:not([hidden]) .xo__title').innerText()).includes('for Her.'), 'rapid presses');
  // close while still opening, then reopen at once, several times
  await xoClose(p);
  for (let i = 0; i < 4; i++) {
    await p.locator('[data-plan-open="athletes"]').click();
    await p.waitForTimeout(90 + i * 60);
    await p.keyboard.press('Escape');
    await xoWait(p, 'closed');
    const c = await p.evaluate(() => ({ open: document.querySelector('[data-plans-overlay]').open, src: document.querySelectorAll('.is-source').length, lock: document.documentElement.style.overflow, anim: document.querySelector('[data-plans-overlay]').getAnimations({ subtree: true }).length, fly: document.querySelector('[data-xo-shell]').classList.contains('is-flying') }));
    assert(!c.open && c.src === 0 && c.lock === '' && c.anim === 0 && !c.fly, `interrupted ${i}: ${JSON.stringify(c)}`);
  }
  await xoOpen(p, 'athletes');
  assert((await p.locator('.xo__panel:not([hidden]) .xo__list li').count()) === 6, 'reopens normally afterwards');
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('XP-10', 'Overlay at phone, tablet, desktop and landscape sizes: inside the screen, close control reachable, every plan name and the note visible or scrollable, text never clipped', async () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 640], [844, 390], [667, 375]]) {
    const p = await ctx({ viewport: { width: w, height: h }, hasTouch: w < 900 });
    await go(p, XP);
    await xpReady(p);
    for (const id of ['athletes', 'professionals']) {
      await p.locator(`[data-plan-open="${id}"]`).scrollIntoViewIfNeeded();
      await railSettle(p);
      await xoOpen(p, id);
      await p.waitForTimeout(700);
      const d = await p.evaluate(async () => {
        const sh = document.querySelector('[data-xo-shell]').getBoundingClientRect(), cl = document.querySelector('[data-xo-close]').getBoundingClientRect(), body = document.querySelector('[data-xo-body]'), ph = document.querySelector('[data-xo-photo]').getBoundingClientRect();
        const panel = document.querySelector('.xo__panel:not([hidden])'), status = panel.querySelector('.xo__status'), tr = document.createRange();
        tr.selectNodeContents(panel.querySelector('.xo__title'));
        const title = tr.getBoundingClientRect(); // the words themselves, not the heading's box
        const clipped = [...panel.querySelectorAll('.xo__plan, .xo__title')].filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > sh.right - 8).length;
        const scrolls = body.scrollHeight > body.clientHeight + 1;
        body.scrollTop = body.scrollHeight;
        await new Promise((r) => requestAnimationFrame(r));
        const st = status.getBoundingClientRect(), b = body.getBoundingClientRect();
        const atEnd = st.bottom <= b.bottom + 1 && st.bottom <= sh.bottom + 1;
        body.scrollTop = 0;
        return { in: sh.left >= 0 && sh.top >= 0 && sh.right <= innerWidth && sh.bottom <= innerHeight, close: cl.left >= sh.left && cl.right <= sh.right && cl.top >= sh.top && cl.bottom <= innerHeight && cl.width >= 44 && cl.height >= 44, clipped, scrolls, atEnd, tab: body.tabIndex, split: ph.height > sh.height * 0.98, photo: [Math.round(ph.width), Math.round(ph.height)], titleUnderClose: title.right > cl.left - 2 && title.top < cl.bottom && title.bottom > cl.top, over: document.documentElement.scrollWidth - innerWidth, planSize: parseFloat(getComputedStyle(panel.querySelector('.xo__plan')).fontSize) };
      });
      assert(d.in && d.close && d.over <= 0, `${w}x${h} ${id}: panel or close control off screen ${JSON.stringify(d)}`);
      assert(d.clipped === 0 && d.atEnd && !d.titleUnderClose && d.planSize >= 16, `${w}x${h} ${id}: content ${JSON.stringify(d)}`);
      assert(!d.scrolls || d.tab === 0, `${w}x${h} ${id}: scrolling list is not keyboard reachable`);
      assert(d.photo[0] >= 150 && d.photo[1] >= 150, `${w}x${h} ${id}: photograph ${d.photo}`);
      if (w >= 900) assert(d.split, `${w}x${h}: expected the split composition`);
      if (w < 600) assert(!d.split, `${w}x${h}: expected the vertical composition`);
      await xoClose(p);
    }
    assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
    await p.context().close();
  }
});

await test('XP-11', 'Reduced motion, no JavaScript and a missing photograph: everything still readable and usable', async () => {
  const r = await ctx({ reducedMotion: 'reduce' });
  await go(r, XP);
  const vis = await r.evaluate(() => [...document.querySelectorAll('.xp-card, .xp__controls')].every((e) => getComputedStyle(e).opacity === '1' && getComputedStyle(e).transform === 'none'));
  assert(vis, 'reduced motion: cards hidden or offset');
  const flights = await r.evaluate(() => { document.querySelector('[data-plan-open="kids"]').click(); const d = document.querySelector('[data-plans-overlay]'); return { state: d.dataset.state, shell: document.querySelector('[data-xo-shell]').getAnimations().length, rows: getComputedStyle(d.querySelector('.xo__panel:not([hidden]) .xo__list li')).animationName }; });
  assert(flights.state === 'open' && flights.shell === 0 && flights.rows === 'none', 'reduced motion: ' + JSON.stringify(flights));
  assert((await r.locator('.xo__panel:not([hidden]) .xo__plan').allInnerTexts()).join('|') === XP_PLANS.kids[1].join('|'), 'reduced motion: plans');
  await r.keyboard.press('Escape');
  await xoWait(r, 'closed');
  assert((await r.evaluate(() => document.activeElement.dataset.planOpen)) === 'kids', 'reduced motion: focus return');
  const hov = await r.evaluate(() => getComputedStyle(document.querySelector('.xp-card__media img')).transitionDuration);
  assert(/^0s/.test(hov), 'reduced motion: image zoom still animated');
  await r.context().close();

  const n = await ctx({ javaScriptEnabled: false });
  await go(n, XP);
  const t = await n.locator('main').innerText();
  const all = Object.values(XP_PLANS).flatMap((v) => v[1]);
  assert(all.every((name) => t.includes(name)) && t.includes('Memberships currently in development.'), 'no JS: plan names missing');
  assert((await n.locator('.xp-card').count()) === 9 && (await n.locator('.xp__controls').isHidden()), 'no JS: cards present, dead controls hidden');
  assert(await n.locator('.xp-card').first().evaluate((e) => getComputedStyle(e).opacity === '1'), 'no JS: cards visible');
  assert((await n.locator('.xpc .btn').getAttribute('href')) === '/waitlist', 'no JS: waitlist link');
  await n.context().close();

  const m = await ctx();
  await m.route(/human-for-seniors/, (rt) => rt.abort());
  await go(m, XP);
  await xpReady(m);
  const miss = await m.evaluate(() => { const c = document.querySelector('[data-plan-open="seniors"]').closest('.xp-card'); return { cls: c.classList.contains('is-missing'), img: getComputedStyle(c.querySelector('img')).visibility, bg: getComputedStyle(c.querySelector('.xp-card__media')).backgroundColor, title: c.querySelector('.xp-card__title').getBoundingClientRect().height > 20 }; });
  assert(miss.cls && miss.img === 'hidden' && miss.bg !== 'rgba(0, 0, 0, 0)' && miss.title, 'missing photograph: ' + JSON.stringify(miss));
  await xoOpen(m, 'seniors');
  assert((await m.locator('.xo__panel:not([hidden]) .xo__plan').count()) === 4 && (await m.locator('[data-xo-img]').isHidden()), 'missing photograph: overlay');
  await m.context().close();
});

await test('XP-12', 'Explore Plans honesty: no prices, counts, panels, frequencies, outcomes, availability or partnership claims, no purchase path; images load only from the supplied set', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  const text = await p.evaluate(() => document.querySelector('main').textContent + ' ' + document.querySelector('[data-plans-overlay]').textContent);
  const banned = /₹|\bRs\b|\$\s?\d|\bprice|pricing|per (month|year)|\/mo\b|discount|\boffer\b|biomarker|\b\d+\s*(\+\s*)?(tests|markers|parameters)|every \d+ (months|weeks)|consultation|doctor|diagnos|treat|cure|guarantee|testimonial|best[- ]seller|most popular|recommended|limited|exclusive|available now|buy|checkout|subscribe|add to cart|partner|sponsor|official|leading|launch(es|ing)? (on|in) /i;
  const hit = text.match(banned);
  assert(!hit, `claim on the page: "${hit && hit[0]}"`);
  const imgs = await p.evaluate(() => [...document.querySelectorAll('main img, [data-plans-overlay] img')].map((i) => i.currentSrc || i.src).filter(Boolean));
  assert(imgs.length >= 9 && imgs.every((s) => /\/_astro\/human-for-(him|her|athletes|seniors|families|professionals|young-adults|kids|couples)\./.test(s)), 'image sources: ' + imgs.join(', '));
  const ext = p.requests.filter((q) => !q.url.startsWith(BASE) && !q.url.startsWith('data:'));
  assert(ext.length === 0 && p.requests.every((q) => q.method === 'GET'), 'requests: ' + ext.map((q) => q.url).join());
  await p.context().close();
});

// ---------- informational pages: About, FAQ, Privacy & Terms, Medical Disclaimer ----------
const norm = (s) => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const pageText = async (p, sel = 'main') => norm(await p.locator(sel).evaluate((e) => e.textContent));
const CTA_COPY = ['Take the first step towards understanding your health.', 'Be among the first to experience HUMAN.', 'Join the waitlist'];

await test('ABOUT-01', 'About: the approved story in six parts, word for word, in the site’s type; approved photographs only; closing invitation opens the existing waitlist', async () => {
  const p = await ctx();
  const failed = [];
  p.on('response', (r) => r.status() >= 400 && failed.push(r.url()));
  await go(p, '/about');
  const t = await pageText(p);
  const must = [
    'About HUMAN', 'You deserve to understand your health.',
    'We spend so much of our lives taking care of the things that matter to us. Yet when it comes to our own health, we often wait until something feels wrong.',
    "We believe understanding your health should be a part of life, not something you think about only when you're unwell.",
    'Making health easier to understand.',
    'HUMAN is a preventive health platform being developed to help you better understand your body through blood tests and personalised health insights.',
    'We want to make it easier for you to understand what your blood test results mean, what changes over time and what may need attention.',
    'Because receiving a health report is one thing. Understanding it is another.',
    'No two humans are the same.',
    'Our bodies are different. Our lifestyles are different. Our health needs change as we grow older.',
    'A woman in her twenties may have very different health concerns from a man in his forties. An athlete may have different needs from someone working long hours at a desk.',
    "That's why we're developing different preventive health plans around different people and different stages of life.",
    'A clearer picture of your health.', "We're building HUMAN around three simple ideas.",
    'Understand your body.', 'Make sense of your blood test results in language you can understand.',
    'Understand what changes.', 'Follow how your health markers change over time, rather than looking at a single report in isolation.',
    'Make informed decisions.', 'Have clearer information to guide your health decisions and conversations with your doctor.',
    'Understanding your health should be for everyone.',
    "We want to build a future where preventive health is easier to access, easier to understand and a natural part of people's lives.",
    "HUMAN is currently in development. We're working towards creating a health experience that is personal, meaningful and built around you.",
    ...CTA_COPY,
  ];
  for (const m of must) assert(t.includes(m), `missing: "${m.slice(0, 60)}"`);
  const d = await p.evaluate(() => {
    const cs = (e) => getComputedStyle(e);
    const eyebrows = [...document.querySelectorAll('main .ab__eyebrow')].map((e) => e.textContent.replace(/\s+/g, ' ').trim());
    return {
      h1: document.querySelectorAll('h1').length, h2: [...document.querySelectorAll('main h2')].map((e) => e.textContent.trim()), h3: document.querySelectorAll('main .ab-build__list h3').length,
      eyebrows, h1Font: cs(document.querySelector('h1')).fontFamily + cs(document.querySelector('h1')).fontStyle, h2Font: cs(document.querySelector('main h2')).fontFamily + cs(document.querySelector('main h2')).fontStyle,
      body: cs(document.querySelector('.ab__body p')).fontFamily, ground: cs(document.querySelector('main section')).backgroundColor,
      line: cs(document.querySelector('.ab-what__line')).fontFamily + cs(document.querySelector('.ab-what__line')).fontStyle,
      lineCount: (document.querySelector('main').textContent.match(/Understanding it is another\./g) || []).length,
      imgs: [...document.querySelectorAll('main img')].map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0, alt: i.alt.length, ratio: Math.abs(i.naturalWidth / i.naturalHeight - i.width / i.height) < 5 })),
      links: [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')), measure: Math.max(...[...document.querySelectorAll('main .ab__body p')].map((e) => e.getBoundingClientRect().width / parseFloat(cs(e).fontSize))),
      cards: document.querySelectorAll('main .xp-card, main details, main form').length, dark: document.querySelectorAll('main .on-dark').length,
    };
  });
  assert(d.h1 === 1 && d.h2.length === 5 && d.h3 === 3, `headings h1 ${d.h1}, h2 ${d.h2.length}, principles ${d.h3}`);
  assert(d.eyebrows.join('|') === 'About HUMAN|01 — What is HUMAN|02 — Our belief|03 — What we are building|04 — Our vision', 'labels: ' + d.eyebrows.join('|'));
  assert(/Instrument Serif.*italic/.test(d.h1Font) && /Instrument Serif.*italic/.test(d.h2Font) && /Instrument Serif.*italic/.test(d.line) && /Hanken Grotesk/.test(d.body), 'type: ' + d.h1Font + ' / ' + d.body);
  assert(d.ground === 'rgb(246, 243, 236)' && d.dark === 0 && d.lineCount === 1, `ground ${d.ground}, emphasis line shown ${d.lineCount}x`);
  assert(d.imgs.length >= 2 && d.imgs.every((i) => i.ok && i.alt > 10 && /\/_astro\/(care-meal|journey-professional|journey-elder|A05-female-runners)\./.test(i.src)), 'photographs: ' + JSON.stringify(d.imgs));
  assert(t.includes('Images, where shown, are of models. They are not HUMAN members.'), 'model disclosure missing');
  assert(d.links.join() === '/waitlist' && d.cards === 0, 'actions: ' + d.links.join());
  assert(d.measure <= 42, `body lines run to about ${Math.round(d.measure * 2)} characters`);
  assert(!/Abdanshi|Hana|founder|testimonial|India's first|leading|revolution|empower|unlock|reimagin|cutting-edge|world-class/i.test(t), 'unapproved claim or founder detail');
  await p.locator('.xpc .btn').click();
  await p.waitForURL('**/waitlist**');
  assert((await p.locator('[data-hp]').count()) === 1, 'existing waitlist opened');
  assert(failed.length === 0 && p.consoleErrors.length === 0, [...failed, ...p.consoleErrors].join(' | '));
  await p.context().close();
  const q = await ctx({ reducedMotion: 'reduce' });
  for (const w of [1920, 1440, 1280, 1024, 768, 430, 390, 360]) {
    await q.setViewportSize({ width: w, height: w < 500 ? 780 : 900 });
    await go(q, '/about');
    const r = await q.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, clip: [...document.querySelectorAll('main h1, main h2, main h3, main p')].filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > innerWidth + 0.5).length, h1: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize), cols: new Set([...document.querySelectorAll('.ab-build__list li')].map((li) => Math.round(li.getBoundingClientRect().left))).size }));
    assert(r.over <= 0 && r.clip === 0, `${w}: overflow ${r.over}, clipped ${r.clip}`);
    assert(r.h1 >= 40 && r.h1 <= 90 && r.cols === (w >= 900 ? 3 : 1), `${w}: h1 ${r.h1}px, principle columns ${r.cols}`);
  }
  await q.context().close();
});

const FAQ_Q = {
  'Understanding HUMAN': ['What is HUMAN?', 'What is preventive health?', 'Why was HUMAN created?', 'How is HUMAN different from a regular health check-up?', 'Is HUMAN available right now?'],
  'Health Plans & Memberships': ['Who is HUMAN for?', 'What health plans does HUMAN offer?', 'Are the plans for men and women different?', 'How much will a HUMAN membership cost?', 'Can I choose a plan based on my health concerns?'],
  'Blood Tests & Health Insights': ['What is a biomarker?', 'What can blood tests tell me about my health?', 'Which blood tests will be included?', 'How will my blood samples be collected?', 'How often will I need to get tested?', 'Will HUMAN help me understand my results?', 'Will I be able to track my health over time?'],
  'Medical Care & Safety': ['Can HUMAN replace my doctor?', 'Can HUMAN detect every health condition?', 'What if something is abnormal in my blood test results?', 'Can I use HUMAN if I already have a medical condition?', 'Should I wait for HUMAN if I am experiencing symptoms?'],
  'Waitlist & Availability': ['What happens when I join the waitlist?', 'Does joining the waitlist mean I have purchased a membership?', 'When will HUMAN launch?', 'Where will HUMAN be available?'],
};

await test('FAQ-01', 'FAQ content: approved introduction, five categories in order, exactly 26 questions with their answers, links on existing words, closing invitation', async () => {
  const p = await ctx({ javaScriptEnabled: false }); // the full content must be in the page itself
  await go(p, '/faq');
  const t = await pageText(p);
  for (const m of ['HUMAN', 'Your questions, answered.', "Everything you need to know about HUMAN, what we're building and how we want to help you understand your health.", ...CTA_COPY]) assert(t.includes(m), `missing: "${m}"`);
  const cats = await p.evaluate(() => [...document.querySelectorAll('.fq__panel')].map((s) => ({ name: s.querySelector('h2').textContent.trim(), qs: [...s.querySelectorAll('.fq__q button > span:first-child')].map((e) => e.textContent.trim()), as: [...s.querySelectorAll('.fq__a p')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), vis: [...s.querySelectorAll('.fq__a p')].every((e) => e.getBoundingClientRect().height > 10 && getComputedStyle(e).visibility === 'visible') })));
  assert(cats.map((c) => c.name).join('|') === Object.keys(FAQ_Q).join('|'), 'categories: ' + cats.map((c) => c.name).join('|'));
  let n = 0;
  for (const c of cats) {
    assert(c.qs.join('|') === FAQ_Q[c.name].join('|'), `${c.name}: ${c.qs.join('|')}`);
    assert(c.as.length === c.qs.length && c.as.every((a) => a.length > 60) && c.vis, `${c.name}: answers missing or hidden without scripts`);
    n += c.qs.length;
  }
  assert(n === 26, `questions: ${n}`);
  const spot = [
    'HUMAN is a preventive health platform being developed to help you understand your body through blood tests, personalised health insights and tracking changes in your health over time.',
    'We are developing plans for men, women, athletes, seniors, families, professionals, young adults, children and couples. You can discover these upcoming plans on our Explore Plans page.',
    'We are currently working on our membership structure and pricing. We will share confirmed details before memberships become available.',
    'A biomarker is something we can measure in your body that gives us information about your health. For example, your blood sugar, cholesterol and iron levels are biomarkers.',
    'We are currently evaluating blood collection methods and diagnostic partners. We will explain the confirmed collection process before memberships become available.',
    'No. HUMAN is intended to help you understand your health information. It is not a replacement for a qualified medical professional, medical diagnosis or treatment.',
    'No. If you are experiencing symptoms or have concerns about your health, please seek appropriate medical advice. Do not wait for HUMAN to become available.',
    'No. Joining the waitlist does not purchase a membership or commit you to buying one.',
    'HUMAN is being developed for India. Our initial service locations will be announced once our operational arrangements are confirmed.',
  ];
  for (const s of spot) assert(t.includes(s), `answer changed: "${s.slice(0, 50)}"`);
  const links = await p.evaluate(() => [...document.querySelectorAll('.fq__a a')].map((a) => a.textContent.trim() + '→' + a.getAttribute('href')));
  assert(links.join('|') === 'join our waitlist→/waitlist|Explore Plans page→/explore-plans', 'answer links: ' + links.join('|'));
  assert((await p.locator('main img, main picture, main video').count()) === 0, 'FAQ carries imagery');
  assert((await p.locator('.xpc .btn').getAttribute('href')) === '/waitlist' && (await p.locator('.fq__cats').isHidden()), 'no-JS: waitlist link, switcher hidden');
  assert(!/₹|\bRs\b|per (month|year)|\b\d+\s*\+?\s*(biomarkers|tests|markers)\b|launch(es|ing)? (on|in) \d|guarantee/i.test(t), 'unapproved claim');
  await p.context().close();
});

await test('FAQ-02', 'FAQ interaction: one category at a time, first question open, questions expand independently with mouse and keyboard, category change resets, phone tabs scroll', async () => {
  const p = await ctx();
  await go(p, '/faq');
  const state = () => p.evaluate(() => ({
    tab: [...document.querySelectorAll('[data-faq-tab]')].filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.textContent.trim()).join(),
    panels: [...document.querySelectorAll('.fq__panel')].filter((s) => getComputedStyle(s).display !== 'none').map((s) => s.querySelector('h2').textContent.trim()).join(),
    open: [...document.querySelectorAll('.fq__panel.is-active .fq__item')].map((i) => { const b = i.querySelector('button'), a = i.querySelector('.fq__a'); const pr = a.querySelector('p').getBoundingClientRect(); return b.getAttribute('aria-expanded') === 'true' && getComputedStyle(a).visibility === 'visible' && a.getBoundingClientRect().height >= pr.height - 1 ? 1 : b.getAttribute('aria-expanded') === 'false' && getComputedStyle(a).visibility === 'hidden' ? 0 : -1; }).join(''),
    roles: document.querySelector('[data-faq-tabs]').getAttribute('role') + '/' + document.querySelector('.fq__panel.is-active').getAttribute('role'),
    wired: [...document.querySelectorAll('[data-faq-q]')].every((b) => b.tagName === 'BUTTON' && document.getElementById(b.getAttribute('aria-controls'))?.classList.contains('fq__a')),
  }));
  await p.evaluate(() => (window.__same = true));
  let s = await state();
  assert(s.tab === 'Understanding HUMAN' && s.panels === 'Understanding HUMAN' && s.open === '10000' && s.roles === 'tablist/tabpanel' && s.wired, 'initial: ' + JSON.stringify(s));
  // several open at once; each closes on its own
  await p.locator('.fq__panel.is-active [data-faq-q]').nth(2).click();
  await p.locator('.fq__panel.is-active [data-faq-q]').nth(4).click();
  await p.waitForTimeout(500);
  assert((await state()).open === '10101', 'independent expansion: ' + (await state()).open);
  await p.locator('.fq__panel.is-active [data-faq-q]').nth(0).click();
  await p.waitForTimeout(500);
  assert((await state()).open === '00101', 'collapse: ' + (await state()).open);
  // keyboard: Enter and Space
  await p.locator('.fq__panel.is-active [data-faq-q]').nth(1).focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(450);
  assert((await state()).open === '01101', 'Enter');
  await p.keyboard.press('Space');
  await p.waitForTimeout(450);
  assert((await state()).open === '00101', 'Space');
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + parseFloat(getComputedStyle(document.activeElement).outlineWidth));
  assert(/solid[2-9]/.test(ring), 'focus ring: ' + ring);
  // a collapsed answer's link is not a keyboard stop; an open one's is
  const stops = async () => { const seen = []; await p.locator('.fq__panel.is-active [data-faq-q]').first().focus(); for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); seen.push(await p.evaluate(() => document.activeElement.getAttribute('href') || '')); } return seen; };
  let seen = await stops();
  assert(seen.includes('/waitlist') && seen.indexOf('/waitlist') < 6, 'open answer link not reachable: ' + seen.join());
  await p.locator('.fq__panel.is-active [data-faq-q]').nth(4).click();
  await p.waitForTimeout(500);
  seen = await stops();
  assert(seen.slice(0, 4).every((h) => h !== '/waitlist') , 'collapsed answer link still focusable: ' + seen.join());
  // categories (starting away from the one already showing, and ending back on it)
  const order = Object.entries(FAQ_Q);
  for (const [name, qs] of [...order.slice(1), order[0]]) {
    await p.locator('[data-faq-tab]', { hasText: name }).click();
    await p.waitForTimeout(350);
    s = await state();
    assert(s.tab === name && s.panels === name && s.open === '0'.repeat(qs.length), `${name}: ${JSON.stringify(s)}`);
    const shown = await p.locator('.fq__panel.is-active .fq__q button > span:first-child').allInnerTexts();
    assert(shown.join('|') === qs.join('|'), `${name}: wrong questions`);
    for (let i = 0; i < qs.length; i++) await p.locator('.fq__panel.is-active [data-faq-q]').nth(i).click();
    await p.waitForTimeout(450);
    assert((await state()).open === '1'.repeat(qs.length), `${name}: not every question opens`);
  }
  // leaving a category closes it: nothing from another category is found open
  await p.locator('[data-faq-tab]').nth(2).click();
  await p.locator('[data-faq-tab]').first().click();
  await p.waitForTimeout(300);
  assert((await state()).open === '00000', 'state leaked between categories');
  await p.locator('[data-faq-tab]').first().focus();
  await p.keyboard.press('ArrowRight');
  assert((await state()).tab === 'Health Plans & Memberships' && (await p.evaluate(() => document.activeElement.textContent.trim())) === 'Health Plans & Memberships', 'arrow keys on the category row');
  await p.keyboard.press('End');
  assert((await state()).tab === 'Waitlist & Availability', 'End key');
  assert(await p.evaluate(() => window.__same === true), 'the page reloaded');
  await p.locator('[data-faq-tab]', { hasText: 'Health Plans' }).click();
  await p.locator('.fq__panel.is-active [data-faq-q]').nth(1).click();
  await p.locator('.fq__panel.is-active .fq__a a').click();
  await p.waitForURL('**/explore-plans**');
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
  // phones: the category row scrolls inside itself, the page never does; long questions wrap
  for (const w of [430, 390, 360]) {
    const m = await ctx({ viewport: { width: w, height: 800 }, hasTouch: true });
    await go(m, '/faq');
    const r = await m.evaluate(() => { const c = document.querySelector('.fq__cats'); return { scrolls: c.scrollWidth > c.clientWidth + 20, over: document.documentElement.scrollWidth - innerWidth, h: Math.min(...[...document.querySelectorAll('.fq__cat')].map((b) => b.getBoundingClientRect().height)) }; });
    assert(r.scrolls && r.over <= 0 && r.h >= 44, `${w}: ${JSON.stringify(r)}`);
    await m.locator('[data-faq-tab]', { hasText: 'Waitlist & Availability' }).click();
    await m.waitForTimeout(400);
    const v = await m.evaluate(() => { const t = document.querySelector('[data-faq-tab][aria-selected="true"]').getBoundingClientRect(); const qs = [...document.querySelectorAll('.fq__panel.is-active .fq__q button')]; return { tabIn: t.left >= 0 && t.right <= innerWidth + 1, wrap: qs.every((b) => b.scrollWidth <= b.clientWidth + 1), ico: qs.every((b) => { const i = b.querySelector('.fq__ico').getBoundingClientRect(); return i.right <= innerWidth - 12 && i.width === 36; }), hit: Math.min(...qs.map((b) => b.getBoundingClientRect().height)), over: document.documentElement.scrollWidth - innerWidth }; });
    assert(v.tabIn && v.wrap && v.ico && v.hit >= 48 && v.over <= 0, `${w}: ${JSON.stringify(v)}`);
    await m.context().close();
  }
  const rm = await ctx({ reducedMotion: 'reduce' });
  await go(rm, '/faq');
  assert(/^0s/.test(await rm.locator('.fq__a').first().evaluate((e) => getComputedStyle(e).transitionDuration)), 'reduced motion: answers still animate');
  await rm.context().close();
});

const PRIVACY_T = ['Who we are', 'What information we collect', 'Why we collect your information', 'Your health information', 'Who we share your information with', 'How we protect your information', 'Cookies and website analytics', 'How long we keep your information', 'Your information, your choices', "Children's privacy", 'Changes to this policy', 'Get in touch'];
const TERMS_T = ['About HUMAN', 'Using our website', 'Our health plans', 'Joining the waitlist', 'Health information on our website', 'Eligibility', 'Responsible use', 'Our content', 'External websites', 'Website availability and limitations', 'Changes to these terms', 'Applicable law', 'Contact us'];
const docState = (p) => p.evaluate(() => {
  const vis = [...document.querySelectorAll('[data-legal-panel]')].filter((e) => !e.hidden && getComputedStyle(e).display !== 'none');
  const panel = vis[0];
  return { shown: vis.map((e) => e.dataset.legalPanel).join(), tab: [...document.querySelectorAll('[data-legal-tab]')].filter((t) => t.getAttribute('aria-selected') === 'true' || t.getAttribute('aria-current') === 'page').map((t) => t.textContent.trim()).join(), heading: panel.querySelector('.lg__heading').textContent.trim(), titles: [...panel.querySelectorAll('.lg__h')].map((h) => h.textContent.replace(/\s+/g, ' ').replace(/[’]/g, "'").trim()), title: document.title, path: location.pathname.replace(/\/$/, '') };
});

await test('LEGAL-01', 'Privacy & Terms: shared introduction, two working tabs, /privacy and /terms each open their own document, Back/Forward and keyboard behave, no reload', async () => {
  const p = await ctx();
  await go(p, '/privacy');
  const t = await pageText(p);
  for (const m of ['HUMAN', 'Privacy & Terms.', 'Understanding how we handle your information and what you can expect when using HUMAN.']) assert(t.includes(m), 'missing ' + m);
  assert((await p.locator('h1').innerText()).trim() === 'Privacy & Terms.' && (await p.locator('h1').count()) === 1, 'page heading');
  let s = await docState(p);
  assert(s.shown === 'privacy' && s.tab === 'Privacy Policy' && s.heading === 'Your privacy matters.' && s.title === 'Privacy Policy | HUMAN', 'privacy route: ' + JSON.stringify(s));
  assert(s.titles.length === 12 && s.titles.join('|') === PRIVACY_T.map((x, i) => `${String(i + 1).padStart(2, '0')} — ${x}`).join('|'), 'privacy sections: ' + s.titles.join('|'));
  assert((await p.locator('[data-legal-tabs]').getAttribute('role')) === 'tablist' && (await p.locator('[data-legal-panel="privacy"]').getAttribute('role')) === 'tabpanel', 'tab semantics');
  await p.evaluate(() => (window.__same = true));
  await p.locator('[data-legal-tab="terms"]').click();
  await p.waitForTimeout(350);
  s = await docState(p);
  assert(s.shown === 'terms' && s.tab === 'Terms of Use' && s.heading === 'Using HUMAN.' && s.path === '/terms' && s.title === 'Terms of Use | HUMAN', 'after tab: ' + JSON.stringify(s));
  assert(s.titles.length === 13 && s.titles.join('|') === TERMS_T.map((x, i) => `${String(i + 1).padStart(2, '0')} — ${x}`).join('|'), 'terms sections: ' + s.titles.join('|'));
  assert(await p.evaluate(() => window.__same === true), 'switching tabs reloaded the page');
  await p.goBack();
  await p.waitForTimeout(300);
  s = await docState(p);
  assert(s.shown === 'privacy' && s.path === '/privacy', 'Back: ' + JSON.stringify(s));
  await p.goForward();
  await p.waitForTimeout(300);
  assert((await docState(p)).shown === 'terms', 'Forward');
  await p.locator('[data-legal-tab="terms"]').focus();
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(300);
  s = await docState(p);
  assert(s.shown === 'privacy' && (await p.evaluate(() => document.activeElement.dataset.legalTab)) === 'privacy', 'arrow key: ' + JSON.stringify(s));
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + parseFloat(getComputedStyle(document.activeElement).outlineWidth));
  assert(/solid[2-9]/.test(ring), 'focus ring: ' + ring);
  // returning from another page through a Terms link shows Terms
  await go(p, '/medical-disclaimer');
  await p.locator('.site-footer a[href="/terms"]').click();
  await p.waitForURL('**/terms**');
  await p.waitForLoadState('networkidle');
  s = await docState(p);
  assert(s.shown === 'terms' && s.tab === 'Terms of Use', 'footer Terms link: ' + JSON.stringify(s));
  await p.locator('.lg__sec a[href="/medical-disclaimer"]').click();
  await p.waitForURL('**/medical-disclaimer**');
  await p.goBack();
  await p.waitForLoadState('networkidle');
  assert((await docState(p)).shown === 'terms', 'Back from the disclaimer lands on Terms');
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
  // without scripts each route still shows its own document, and the tabs are plain links
  const n = await ctx({ javaScriptEnabled: false });
  for (const [r, id, label] of [['/privacy', 'privacy', 'Privacy Policy'], ['/terms', 'terms', 'Terms of Use']]) {
    await go(n, r);
    const s2 = await docState(n);
    assert(s2.shown === id && s2.tab === label, `no JS ${r}: ${JSON.stringify(s2)}`);
  }
  await n.locator('[data-legal-tab="privacy"]').click();
  await n.waitForURL('**/privacy**');
  await n.context().close();
  await go((await ctx()), '/waitlist').catch(() => {});
});

await test('LEGAL-02', 'Privacy & Terms drafts: complete and readable, nothing collapsed, nothing invented, every unconfirmed detail marked, flagged as draft, no promotion', async () => {
  const p = await ctx();
  await go(p, '/privacy');
  const read = (id) => p.evaluate((id) => {
    const panel = document.querySelector(`[data-legal-panel="${id}"]`);
    const was = panel.hidden; panel.hidden = false;
    const t = panel.textContent.replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
    const ps = [...panel.querySelectorAll('.lg__sec p, .lg__intro p')];
    const out = { text: t, paras: ps.length, lists: [...panel.querySelectorAll('.lg__sec ul')].map((u) => u.children.length), pending: [...panel.querySelectorAll('.inf-pending')].map((m) => m.textContent.trim()), hiddenBits: panel.querySelectorAll('details, [aria-expanded], [hidden], .fq__item').length, promo: panel.querySelectorAll('.btn, img, picture, video, form, input').length, emails: (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).length,
      measure: Math.max(...ps.map((e) => e.getBoundingClientRect().width / parseFloat(getComputedStyle(e).fontSize))), size: Math.min(...ps.map((e) => parseFloat(getComputedStyle(e).fontSize))), lh: parseFloat(getComputedStyle(ps[3]).lineHeight) / parseFloat(getComputedStyle(ps[3]).fontSize), font: getComputedStyle(ps[3]).fontFamily, hFont: getComputedStyle(panel.querySelector('.lg__heading')).fontFamily + getComputedStyle(panel.querySelector('.lg__heading')).fontStyle, secFont: getComputedStyle(panel.querySelector('.lg__h')).fontFamily, secSize: parseFloat(getComputedStyle(panel.querySelector('.lg__h')).fontSize),
      contrast: getComputedStyle(ps[3]).color, toc: [...panel.querySelectorAll('.lg__toc a')].every((a) => panel.querySelector(a.getAttribute('href'))), tocN: panel.querySelectorAll('.lg__toc a').length };
    panel.hidden = was;
    return out;
  }, id);
  const pv = await read('privacy');
  const tm = await read('terms');
  for (const m of [
    'Your health is personal. So is the information you choose to share with us.',
    'This Privacy Policy explains how HUMAN handles your personal information when you visit our website or join our waitlist.',
    'When you join our waitlist, contact us or complete a form on our website, we may collect information that you choose to share with us.',
    'We aim to collect only the information necessary for the purpose for which it is being requested.',
    'Please do not send medical reports, prescriptions or detailed medical records through ordinary website contact forms unless we specifically provide an appropriate way to receive them.',
    'We may also need to disclose information when legally required to do so.',
    'However, no online platform can guarantee complete security.',
    'Cookies are small files that websites may store on your device.',
    'Some information may need to be retained where we have a legal obligation to keep it.',
    'Our website waitlist is intended for individuals aged 18 and above.',
    "Please do not submit a child's personal or medical information unless an appropriate process and necessary consent arrangements have been established.",
    'Your trust matters to us, and we want you to feel comfortable asking questions about the information you share with HUMAN.',
  ]) assert(pv.text.includes(m), `privacy missing: "${m.slice(0, 50)}"`);
  for (const m of [
    'We want your experience with HUMAN to be simple, transparent and built on trust.',
    'By using our website, you agree to follow these Terms of Use.',
    'Displaying a health plan on our website does not mean that it is currently available for purchase or that every proposed feature will be included at launch.',
    'Does not establish a medical relationship with HUMAN.',
    'It is not a substitute for professional medical advice, diagnosis or treatment.',
    'Joining the waitlist does not confirm eligibility for any future health service.',
    "Submit another person's personal information without appropriate permission.",
    'A link to another organisation does not necessarily mean that we have a partnership with or endorse that organisation.',
    'Nothing in these terms is intended to exclude your statutory rights or responsibilities that cannot legally be excluded.',
    'These Terms of Use are governed by applicable Indian law, without limiting any rights you may have under applicable consumer protection laws.',
  ]) assert(tm.text.includes(m), `terms missing: "${m.slice(0, 50)}"`);
  assert(pv.lists.join() === '6,5,6' && tm.lists.join() === '4,5', `lists privacy ${pv.lists}, terms ${tm.lists}`);
  assert(pv.pending.length === 9 && tm.pending.length === 4, `placeholders marked: privacy ${pv.pending.length}, terms ${tm.pending.length}`);
  assert(pv.pending[0] === '[Date of publication]' && pv.pending.includes('[Verified privacy contact email]') && tm.pending.includes('[Verified legal name]'), 'placeholder wording');
  for (const d of [pv, tm]) {
    assert(d.hiddenBits === 0 && d.promo === 0 && d.emails === 0, `collapsed ${d.hiddenBits}, promotional ${d.promo}, invented addresses ${d.emails}`);
    assert(d.measure <= 42 && d.measure >= 20 && d.size >= 17 && d.lh >= 1.55, `reading comfort: ${Math.round(d.measure * 2)} chars, ${d.size}px, line height ${d.lh.toFixed(2)}`);
    assert(/Hanken Grotesk/.test(d.font) && /Instrument Serif.*italic/.test(d.hFont) && /Hanken Grotesk/.test(d.secFont) && d.secSize <= 26, 'type: ' + d.hFont + ' / ' + d.secFont + ' ' + d.secSize);
    assert(d.toc && d.tocN > 10, 'contents links do not resolve');
    assert(!/\b(GDPR|HIPAA|DPDP|Digital Personal Data Protection|ISO ?\d|certified|compliant with)\b/i.test(d.text), 'compliance claim present');
  }
  assert(/Draft for review — not approved for publication/i.test(await p.locator('.inf__draft').innerText()), 'draft flag');
  assert((await p.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'), 'drafts are indexable');
  assert((await p.locator('main .btn, main img').count()) === 0, 'promotion or imagery on the legal page');
  for (const w of [1440, 1024, 768, 390, 360]) {
    await p.setViewportSize({ width: w, height: 900 });
    for (const r of ['/privacy', '/terms']) {
      await go(p, r);
      const v = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, clip: [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, .lgp__tab')].filter((e) => e.offsetParent && (e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > innerWidth + 0.5)).length, tabs: [...document.querySelectorAll('.lgp__tab')].every((t) => { const b = t.getBoundingClientRect(); return b.height >= 44 && b.left >= 0 && b.right <= innerWidth; }), toc: getComputedStyle(document.querySelector('[data-legal-panel]:not([hidden]) .lg__toc')).display }));
      assert(v.over <= 0 && v.clip === 0 && v.tabs, `${r}@${w}: ${JSON.stringify(v)}`);
      assert((w >= 1100) === (v.toc !== 'none'), `${r}@${w}: contents list ${v.toc}`);
    }
  }
  await go(p, '/waitlist');
  assert((await p.locator('a[href="/privacy"]').count()) >= 1, 'privacy link missing in waitlist');
  await p.context().close();
});

await test('MD-01', 'Medical Disclaimer: heading, supporting line, eight sections all visible, emergency information easy to read, closing statement, draft flag, no promotion', async () => {
  const p = await ctx();
  const res = await p.goto(BASE + '/medical-disclaimer', { waitUntil: 'networkidle' });
  assert(res.status() === 200, 'status');
  const t = await pageText(p);
  const titles = ['Our role in your health', 'We are not a replacement for your doctor', 'Understanding your blood test results', "Everyone's health is different", 'Existing medical conditions and medications', 'If you are feeling unwell', 'Our developing health plans', 'Our commitment to responsible health information'];
  const d = await p.evaluate(() => {
    const cs = (e) => getComputedStyle(e);
    const urgent = document.querySelector('.lg__urgent'), st = document.querySelector('.lg__statement'), body = document.querySelector('.lg__sec p');
    return { h1: [...document.querySelectorAll('h1')].map((e) => e.textContent.trim()), heading: document.querySelector('.lg__heading').textContent.trim(), headingFont: cs(document.querySelector('.lg__heading')).fontFamily + cs(document.querySelector('.lg__heading')).fontStyle, headingSize: parseFloat(cs(document.querySelector('.lg__heading')).fontSize), eyebrow: document.querySelector('.inf__eyebrow').textContent.trim(),
      titles: [...document.querySelectorAll('.lg__h')].map((h) => h.textContent.replace(/\s+/g, ' ').replace(/[’]/g, "'").trim()), tags: [...new Set([...document.querySelectorAll('.lg__h')].map((h) => h.tagName))].join(),
      allVisible: [...document.querySelectorAll('.lg__sec p')].every((e) => e.getBoundingClientRect().height > 10 && cs(e).visibility === 'visible'), hidden: document.querySelectorAll('main details, main [aria-expanded], main [hidden]').length, promo: document.querySelectorAll('main .btn, main img, main form, main .xpc').length,
      tel: document.querySelector('.lg__urgent a')?.getAttribute('href'), telText: document.querySelector('.lg__urgent a')?.textContent, urgentSize: parseFloat(cs(urgent.querySelector('p')).fontSize), bodySize: parseFloat(cs(body).fontSize), urgentWeight: Number(cs(urgent.querySelector('p')).fontWeight), urgentIn: urgent.closest('section').id, urgentBg: cs(urgent).backgroundColor, urgentColor: cs(urgent.querySelector('p')).color,
      statement: [...st.querySelectorAll('span')].map((s) => s.textContent.trim()), stFont: cs(st).fontFamily + cs(st).fontStyle, stCount: (document.querySelector('main').textContent.match(/Our purpose is not to replace your doctor\./g) || []).length,
      updated: document.querySelector('.lg__updated').textContent.replace(/\s+/g, ' ').trim(), updatedLast: !document.querySelector('.lg__updated').nextElementSibling, draft: document.querySelector('.inf__draft').textContent.trim(), measure: Math.max(...[...document.querySelectorAll('.lg__sec p')].map((e) => e.getBoundingClientRect().width / parseFloat(cs(e).fontSize))) };
  });
  assert(d.h1.join() === 'Medical Disclaimer' && d.eyebrow === 'HUMAN' && d.heading === 'Understanding your health starts with the right information.', 'headings: ' + JSON.stringify([d.h1, d.heading]));
  assert(/Instrument Serif.*italic/.test(d.headingFont) && d.headingSize >= 30, 'supporting headline type: ' + d.headingFont + ' ' + d.headingSize);
  assert(d.titles.join('|') === titles.map((x, i) => `${String(i + 1).padStart(2, '0')} — ${x}`).join('|') && d.tags === 'H2', 'sections: ' + d.titles.join('|'));
  assert(d.allVisible && d.hidden === 0 && d.promo === 0, `visible ${d.allVisible}, collapsed ${d.hidden}, promotional ${d.promo}`);
  for (const m of [
    'At HUMAN, we believe that understanding your body can help you make more informed decisions about your health.',
    'However, it is important to understand what HUMAN can and cannot do.',
    'HUMAN is intended to support your understanding of your health, not replace the care you receive from a qualified medical professional.',
    'It should not be considered a medical diagnosis, prescription or treatment recommendation.',
    'A result outside the normal range does not necessarily mean you have a medical condition. Similarly, results within the normal range do not always mean that everything is fine.',
    'Some health conditions require additional examinations or investigations that cannot be replaced by blood tests alone.',
    'Your age, biological sex, medical history, lifestyle, medications and other circumstances can influence your health and blood test results.',
    'Do not start, stop or change any medication or prescribed treatment based solely on information provided by HUMAN.',
    'Please do not ignore symptoms or delay seeking medical attention because of information you read on our website or because you are waiting for HUMAN to become available.',
    'If you are experiencing a medical emergency, seek immediate medical assistance.',
    'In India, you can call the national emergency number, 112.',
    'HUMAN is not an emergency medical service.',
    'Joining the HUMAN waitlist does not establish a doctor-patient relationship, provide medical supervision or enrol you in a health service.',
    'We believe health information should be clear, meaningful and responsible.',
  ]) assert(t.includes(m), `missing: "${m.slice(0, 50)}"`);
  assert(d.tel === 'tel:112' && d.telText === '112' && d.urgentIn === 'disclaimer-06' && d.urgentSize > d.bodySize && d.urgentWeight >= 500, 'emergency information: ' + JSON.stringify([d.tel, d.urgentSize, d.bodySize, d.urgentWeight]));
  assert(d.urgentBg === 'rgba(0, 0, 0, 0)' && !/rgb\((2[0-9]{2}), [0-9]{1,2}, [0-9]{1,2}\)/.test(d.urgentColor), 'emergency block is styled as an alarm');
  assert(d.statement.join('|') === 'Our purpose is not to replace your doctor.|It is to help you better understand your health.' && /Instrument Serif.*italic/.test(d.stFont) && d.stCount === 1, 'closing statement: ' + d.statement.join('|'));
  assert(d.updated === 'Last updated: [Date of publication]' && d.updatedLast && /Draft for review/i.test(d.draft), 'date field and draft flag: ' + d.updated);
  assert(d.measure <= 42, 'line length');
  assert(!/reviewed by (dr|doctor)|medically reviewed|approved by|symptom checker/i.test(t), 'invented review claim');
  for (const w of [1440, 768, 390, 360]) {
    await p.setViewportSize({ width: w, height: 850 });
    await go(p, '/medical-disclaimer');
    const v = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, clip: [...document.querySelectorAll('main h1, main h2, main p')].filter((e) => e.scrollWidth > e.clientWidth + 1).length, tel: document.querySelector('.lg__urgent a').getBoundingClientRect().width > 20 }));
    assert(v.over <= 0 && v.clip === 0 && v.tel, `${w}: ${JSON.stringify(v)}`);
  }
  assert(p.consoleErrors.length === 0, p.consoleErrors.join(' | '));
  await p.context().close();
});

await test('XP-13', 'Explore Plans: the new HUMAN for Him photograph is on the card and in the overlay, 3:4 and undistorted; nothing else about the page changed', async () => {
  const p = await ctx();
  await go(p, XP);
  await xpReady(p);
  const c = await p.locator('[data-plan-open="him"] img').evaluate((i) => ({ src: i.currentSrc, ratio: i.naturalWidth / i.naturalHeight, ok: i.naturalWidth > 0, box: i.getBoundingClientRect().width / i.getBoundingClientRect().height }));
  assert(c.ok && /human-for-him\./.test(c.src) && Math.abs(c.ratio - 0.75) < 0.005 && Math.abs(c.box - 0.75) < 0.01, 'card: ' + JSON.stringify(c));
  // sunlit living-room scene: clearly greener and darker at the top-left than the old cream studio wall
  const tone = await p.locator('[data-plan-open="him"] img').evaluate((i) => { const cv = document.createElement('canvas'); cv.width = 30; cv.height = 40; const g = cv.getContext('2d'); g.drawImage(i, 0, 0, 30, 40); const d = g.getImageData(1, 1, 5, 6).data; let r = 0, gr = 0; for (let k = 0; k < d.length; k += 4) { r += d[k]; gr += d[k + 1]; } return gr / r; });
  assert(tone > 0.98, `the card still shows the earlier photograph (green/red ${tone.toFixed(2)})`);
  await xoOpen(p, 'him');
  const o = await p.evaluate(() => { const i = document.querySelector('[data-xo-img]'); return { src: i.currentSrc, alt: i.alt, fit: getComputedStyle(i).objectFit }; });
  assert(/human-for-him\./.test(o.src) && /conversation/.test(o.alt) && o.fit === 'cover', 'overlay: ' + JSON.stringify(o));
  assert((await p.locator('.xo__panel:not([hidden]) .xo__plan').allInnerTexts()).join('|') === XP_PLANS.him[1].join('|'), 'plan names changed');
  await xoClose(p);
  assert((await p.locator('.xp-card').count()) === 9 && (await p.locator('h1').innerText()).trim() === 'Our preventive health plans.', 'page changed');
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
