# HUMAN — investor-facing prototype website

Static site built with Astro 5 and TypeScript. No server, no database, no analytics, no third-party requests.
The waitlist is a **demonstration**: nothing typed into it is sent or stored.
**Not deployed.** Hosting, variables and domain steps: `docs/HUMAN-HOSTING.md`.

Needs Node 22 (see `.nvmrc`). No environment variables are needed to run or build it.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:4321.

## Build and test

```bash
npm run build
```

```bash
npm run preview
```

With the preview running (it prints its port, normally 4321):

```bash
npm run test:e2e
```

```bash
npm run screenshots
```

The tests and screenshots use the Playwright library. If it is not installed on your machine:

```bash
npm install --no-save playwright && npx playwright install chromium
```

## Where things are

| Path | What |
|---|---|
| `src/pages/` | Routes: `/`, `/women`, `/men`, `/explore-plans`, `/about`, `/faq`, `/waitlist`, `/privacy`, `/terms`, `/medical-disclaimer`, 404 |
| `src/components/home/` | Homepage: opening film and story scenes |
| `src/components/plans/` | Explore Plans: card explorer and overlay |
| `src/components/info/` | Shared layout for FAQ, Privacy & Terms, Medical Disclaimer |
| `src/data/` | All copy held as data: `site.ts` (navigation, contact, waitlist mode), `plans.ts`, `faq.ts`, `portal.ts`, `legal/` |
| `src/scripts/` | Behaviour: `motion.ts`, `portal.ts` (waitlist), `plans-explorer.ts`, `plans-overlay.ts`, `faq.ts` |
| `src/assets/` | Founder-supplied photographs and artwork (originals; web sizes are generated at build) |
| `public/` | `robots.txt`, `_headers` (no-index header for the host), favicon |
| `tests/e2e.mjs` | 91 end-to-end checks |
| `docs/` | Hosting, legal review register, Explore Plans notes, waitlist contract, release gates |
