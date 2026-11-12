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

await test('GATE1-390', 'Hero at 390x844: headline, CTA and status all inside first viewport; nothing overlaps the faces', async () => {
  const p = await ctx({ viewport: { width: 390, height: 844 } });
  await go(p, '/');
  for (const sel of ['.hero h1', '.hero a.btn', '.hero .status-pill']) {
    const b = await p.locator(sel).boundingBox();
    assert(b && b.y >= 0 && b.y + b.height <= 844, `${sel} outside first viewport`);
  }
  const img = await p.locator('.hero__media').boundingBox();
  const h1 = await p.locator('.hero h1').boundingBox();
  assert(h1.y > img.y + img.height * 0.6, 'headline overlaps the portrait area');
  await p.context().close();
});

await test('GATE1-1440', 'Hero at 1440x900: headline fully inside the dark left zone (not clipped, clear of faces)', async () => {
  const p = await ctx();
  await go(p, '/');
  const b = await p.locator('.hero__l1').boundingBox();
  assert(b.x + b.width < 1440 * 0.5, `headline right edge at ${Math.round(b.x + b.width)}px`);
  const clipped = await p.locator('.hero h1').evaluate((e) => e.scrollWidth > e.clientWidth + 1);
  assert(!clipped, 'headline clipped');
  await p.context().close();
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

await test('E2E-05/06', 'Reveal Lens opens with scroll and reverses cleanly (V3-QA-10)', async () => {
  const p = await ctx();
  await go(p, '/');
  const top = await p.locator('#scene-03').evaluate((e) => e.getBoundingClientRect().top + scrollY);
  const read = () => p.locator('#scene-03').evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue('--p')));
  const at = async (y) => {
    await p.evaluate((v) => scrollTo({ top: v, behavior: 'instant' }), y);
    await p.waitForTimeout(250);
    return read();
  };
  const a = await at(top + 20);
  const b = await at(top + 500);
  const c = await at(top + 800);
  const back = await at(top + 20);
  assert(a < 0.1 && b > a && c > b && c > 0.9, `progress ${a} → ${b} → ${c}`);
  assert(Math.abs(back - a) < 0.02, `did not reverse: ${back}`);
  assert(await p.locator('#s3-title').isVisible(), 'heading hidden during reveal');
  await p.context().close();
});

await test('E2E-07', 'Resize from desktop to mobile inside Scene 03: pin releases, static composition, no overflow', async () => {
  const p = await ctx();
  await go(p, '/#scene-03');
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(400);
  const pos = await p.locator('.s3__sticky').evaluate((e) => getComputedStyle(e).position);
  assert(pos !== 'sticky', 'still sticky on mobile');
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
  await p.context().close();
});

await test('SIG-3', 'Connected Thread: all six stages readable; selecting a stage activates it (interaction wins)', async () => {
  const p = await ctx();
  await go(p, '/#scene-06');
  assert((await p.locator('.s6__stage').count()) === 6, 'six stages');
  // V4: on desktop the stages are a rail with one description pane; every stage name stays visible.
  for (const d of await p.locator('.s6__name').all()) assert(await d.isVisible(), 'a stage name is hidden');
  assert((await p.locator('.s6__detail:visible').count()) === 1, 'exactly one description pane should show');
  await p.locator('.s6__stage').nth(4).locator('button').click();
  assert((await p.locator('.s6__stage.is-active .s6__name').innerText()).trim() === 'Retest', 'Retest not active');
  await p.mouse.wheel(0, 120);
  await p.waitForTimeout(200);
  assert((await p.locator('.s6__stage.is-active .s6__name').innerText()).trim() === 'Retest', 'scroll overrode selection');
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
  await go(p, '/');
  assert((await p.locator('.s3__sticky').evaluate((e) => getComputedStyle(e).position)) !== 'sticky', 'pin active');
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
  assert(/coming soon/i.test(t) && /No screens are shown yet/i.test(t), 'placeholder copy missing');
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

await test('E2E-15/44', 'Images blocked: hero headline, CTA and status still readable on a dark background (V3-QA-02)', async () => {
  const p = await ctx();
  await p.route('**/*.{webp,png,jpg,jpeg,avif}', (r) => r.abort());
  await go(p, '/');
  assert(await p.locator('h1').isVisible(), 'h1');
  const bg = await p.locator('.hero').evaluate((e) => getComputedStyle(e).backgroundColor);
  assert(bg === 'rgb(11, 13, 15)', 'hero bg ' + bg);
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
