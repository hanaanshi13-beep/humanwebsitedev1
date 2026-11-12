// Ad-hoc screenshot helper: node tests/shot.mjs <url-path> <out.png> <width> <height> [scrollY|selector] [reduced] [full]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}
const [, , path = '/', out = 'shot.png', w = '1440', h = '900', scroll = '0', mode = ''] = process.argv;
const base = process.env.BASE || 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: +w, height: +h },
  deviceScaleFactor: 1,
  reducedMotion: mode.includes('reduced') ? 'reduce' : 'no-preference',
  javaScriptEnabled: !mode.includes('nojs'),
});
const page = await ctx.newPage();
await page.goto(base + path, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
if (/^\d+$/.test(scroll)) {
  if (+scroll) await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), +scroll);
} else {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ behavior: 'instant', block: 'start' }), scroll);
}
await page.waitForTimeout(1600);
await page.screenshot({ path: out, fullPage: mode.includes('full') });
await browser.close();
console.log('saved', out);
