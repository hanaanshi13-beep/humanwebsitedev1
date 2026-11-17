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
const ROUTES = ['/', '/women', '/men', '/about', '/faq', '/waitlist', '/privacy', '/terms', '/medical-disclaimer'];

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
  await go(p, '/faq');
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
  await go(p, '/faq');
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
  await go(p, '/faq');
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
  for (const r of ['/', '/women', '/men', '/about', '/faq', '/waitlist', '/404']) {
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

await test('V11-02', 'Company introduction: approved copy, headline far larger than before, full-viewport black chapter, 3D tube mounted, nothing overlaps at eight sizes', async () => {
  for (const [w, h] of [[1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [390, 844], [360, 640]]) {
    const p = await ctx({ viewport: { width: w, height: h } });
    await go(p, '/');
    await p.evaluate(() => { const n = document.querySelector('#what-is-human'); scrollTo({ top: n.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
    await p.waitForFunction(() => document.querySelector('[data-tube-host]').classList.contains('is-3d'), null, { timeout: 20000 }).catch(() => {});
    const d = await p.evaluate(() => {
      const sec = document.querySelector('#what-is-human');
      const box = (q) => { const r = document.querySelector(q).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const text = sec.innerText.replace(/\s+/g, ' ');
      return {
        text, h: sec.offsetHeight, bg: getComputedStyle(sec).backgroundColor, fs: parseFloat(getComputedStyle(document.querySelector('#brief-title')).fontSize),
        copy: box('.brief__copy'), tube: box('[data-tube-host]'), path: box('[data-pathway]'), is3d: document.querySelector('[data-tube-host]').classList.contains('is-3d'),
        canvas: !!document.querySelector('[data-tube-stage] canvas'), over: document.documentElement.scrollWidth - innerWidth,
        clipped: [...sec.querySelectorAll('h2, p')].some((e) => e.scrollWidth > e.clientWidth + 1),
      };
    });
    for (const t of ['What HUMAN is', 'A preventive healthcare company.', 'Being built in India.', 'HUMAN is building a preventive health membership designed to help you better understand your health through relevant bloodwork, clear health insights and tracking over time.', 'first pilot is planned for Delhi NCR', 'See how it is designed to work']) assert(d.text.toLowerCase().includes(t.toLowerCase()), `${w}: missing "${t}"`);
    assert(d.bg === 'rgb(11, 13, 15)', `${w}: background ${d.bg}`);
    assert(d.h >= h - 1, `${w}: introduction ${d.h}px is shorter than the viewport`);
    assert(d.fs >= (w >= 1024 ? 56 : 33), `${w}: headline only ${d.fs}px`);
    assert(d.is3d && d.canvas, `${w}: 3D tube not mounted`);
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

await test('V11-06', 'No WebGL: the introduction keeps a still of the same tube, no errors; no JavaScript: the still and the static pathway show', async () => {
  const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
  const c = await b2.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { const n = document.querySelector('#what-is-human'); scrollTo({ top: n.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
  await p.waitForTimeout(2500);
  const d = await p.evaluate(() => { const i = document.querySelector('.brief__still'); return { is3d: document.querySelector('[data-tube-host]').classList.contains('is-3d'), w: i.naturalWidth, op: getComputedStyle(i).opacity, vis: i.getBoundingClientRect().height }; });
  assert(!d.is3d && d.w > 0 && d.op === '1' && d.vis > 200, 'fallback still: ' + JSON.stringify(d));
  assert(errs.length === 0, 'errors: ' + errs.join(' | '));
  await b2.close();
  const q = await ctx({ javaScriptEnabled: false });
  await go(q, '/');
  assert(await q.locator('.brief__still').isVisible(), 'no-JS still hidden');
  assert((await q.locator('[data-pathway] ol').first().locator('li').count()) === 6 && (await q.locator('[data-pathway] li').first().isVisible()), 'no-JS pathway');
  await q.context().close();
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
