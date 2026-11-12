// Review screenshots → docs/reviews/. Run against a built preview:  BASE=http://localhost:4321 npm run screenshots
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = 'docs/reviews';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

async function shot(name, path, w, h, { scroll, reduced, steps, dsf = 1 } = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await c.newPage();
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  if (steps) await steps(p);
  if (typeof scroll === 'number') await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), scroll);
  else if (typeof scroll === 'string') await p.evaluate(([s, off]) => scrollTo({ top: document.querySelector(s).getBoundingClientRect().top + scrollY + off, behavior: 'instant' }), scroll.split('|').map((v, i) => (i ? +v : v)).concat(0).slice(0, 2));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });
  await c.close();
  console.log(name);
}

// Gate 1 — hero + Scene 01 handoff
for (const [w, h] of [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844], [360, 800], [320, 568]])
  await shot(`gate1-hero-${w}x${h}`, '/', w, h);
await shot('gate1-hero-1440x900-reduced-motion', '/', 1440, 900, { reduced: true });
await shot('gate1-hero-to-scene01-midscroll-1440x900', '/', 1440, 900, { scroll: 520 });
await shot('gate1-hero-to-scene01-midscroll-390x844', '/', 390, 844, { scroll: 520 });
await shot('gate1-scene01-1440x900', '/', 1440, 900, { scroll: '#scene-01|-76' });
await shot('gate1-scene01-390x844', '/', 390, 844, { scroll: '#scene-01|-64' });

// Gate 2 — homepage scenes and signatures
await shot('gate2-scene02-1440x900', '/', 1440, 900, { scroll: '#scene-02|200' });
for (const [i, off] of [[1, 0], [2, 280], [3, 560], [4, 810]]) await shot(`gate2-sig1-reveal-lens-${i}of4-1440x900`, '/', 1440, 900, { scroll: `#scene-03|${off}` });
await shot('gate2-sig1-reveal-lens-static-390x844', '/', 390, 844, { scroll: '#scene-03|420' });
await shot('gate2-sig1-reveal-lens-reduced-1440x900', '/', 1440, 900, { scroll: '#scene-03|0', reduced: true });
await shot('gate2-scene04-1440x900', '/', 1440, 900, { scroll: '#scene-04|60' });
await shot('gate2-sig2-numbers-to-clarity-1440x900', '/', 1440, 900, { scroll: '#scene-05|330' });
await shot('gate2-sig2-numbers-to-clarity-390x844', '/', 390, 844, { scroll: '#scene-05|520' });
await shot('gate2-sig3-connected-thread-start-1440x900', '/', 1440, 900, { scroll: '#scene-06|40' });
await shot('gate2-sig3-connected-thread-mid-1440x900', '/', 1440, 900, { scroll: '#scene-06|520' });
await shot('gate2-sig3-connected-thread-390x844', '/', 390, 844, { scroll: '#scene-06|700' });
await shot('gate2-status-planned-vs-now-1440x900', '/', 1440, 900, { scroll: '#status|-140' });
await shot('gate2-scene07-1440x900', '/', 1440, 900, { scroll: '#scene-07|40' });
await shot('gate2-scene08-1440x900', '/', 1440, 900, { scroll: '#scene-08|0' });
await shot('gate2-portals-1440x900', '/', 1440, 900, { scroll: '#paths|40' });
await shot('gate2-portals-390x844', '/', 390, 844, { scroll: '#paths|120' });
await shot('gate2-app-placeholder-1440x900', '/', 1440, 900, { scroll: '#app|0' });
await shot('gate2-final-cta-1440x900', '/', 1440, 900, { scroll: '#join|120' });
await shot('gate2-mobile-menu-390x844', '/', 390, 844, { steps: (p) => p.click('[data-menu-open]') });

// Gate 3 — core pages and waitlist
for (const r of ['women', 'men', 'about', 'faq', 'privacy']) {
  await shot(`gate3-${r}-1440x900`, '/' + r, 1440, 900);
  await shot(`gate3-${r}-390x844`, '/' + r, 390, 844);
}
await shot('gate3-women-themes-1440x900', '/women', 1440, 900, { scroll: '.seg__themes|0' });
await shot('gate3-men-themes-1440x900', '/men', 1440, 900, { scroll: '.seg__themes|0' });
await shot('gate3-women-journey-1440x900', '/women', 1440, 900, { scroll: '.seg__journey|0' });
await shot('gate3-men-journey-1440x900', '/men', 1440, 900, { scroll: '.seg__journey|0' });
await shot('gate3-404-1440x900', '/nope', 1440, 900);

// Waitlist chapters use obviously fictional sample values; nothing is submitted.
const you = async (p) => { await p.click('[data-next]'); };
const loc = async (p) => { await you(p); await p.fill('#wl-name', 'Sample Name'); await p.fill('#wl-email', 'sample@example.com'); await p.click('[data-next]'); };
const con = async (p) => { await loc(p); await p.fill('#wl-city', 'Sample City'); await p.selectOption('#wl-state', 'Delhi (NCT)'); await p.click('[data-next]'); };
const prev = async (p) => { await con(p); await p.check('#wl-c1'); await p.click('[data-next]'); };
const err = async (p) => { await you(p); await p.fill('#wl-email', 'not-an-email'); await p.click('[data-next]'); };
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await shot(`gate3-waitlist-0-welcome-${w}x${h}`, '/waitlist', w, h);
  await shot(`gate3-waitlist-1-you-${w}x${h}`, '/waitlist', w, h, { steps: you });
  await shot(`gate3-waitlist-1-you-errors-${w}x${h}`, '/waitlist', w, h, { steps: err });
  await shot(`gate3-waitlist-2-location-${w}x${h}`, '/waitlist', w, h, { steps: loc });
  await shot(`gate3-waitlist-3-consent-${w}x${h}`, '/waitlist', w, h, { steps: con });
  await shot(`gate3-waitlist-3-preview-notice-${w}x${h}`, '/waitlist', w, h, { steps: prev, scroll: 99999 });
}
await browser.close();
